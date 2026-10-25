// Loads the Apps Script files into Node with in-memory stand-ins for Google's services, for local testing.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

function formatDate(date, tz, pattern) {
  const parts = {};
  new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(date).forEach(p => (parts[p.type] = p.value));
  const H = Number(parts.hour), months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const map = { yyyy: parts.year, MMM: months[Number(parts.month) - 1], MM: parts.month, dd: parts.day, d: String(Number(parts.day)), HH: parts.hour, H: String(H), h: String(H % 12 || 12), mm: parts.minute, a: H < 12 ? "AM" : "PM" };
  return pattern.replace(/yyyy|MMM|MM|dd|d|HH|H|h|mm|a/g, t => map[t]);
}

function makeSheet(name, ss) {
  const rows = [];
  const norm = v => (typeof v === "string" && v.startsWith("'") ? v.slice(1) : v === undefined ? "" : v);
  const sheet = {
    rows, name,
    getName: () => name,
    getLastRow: () => rows.length,
    getLastColumn: () => rows.reduce((m, r) => Math.max(m, r.length), 0),
    getMaxRows: () => Math.max(1000, rows.length),
    setFrozenRows() {},
    appendRow(vals) { rows.push(vals.map(norm)); return sheet; },
    deleteRow(r) { rows.splice(r - 1, 1); },
    getRange(r, c, nr = 1, nc = 1) {
      const range = {
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => { const row = rows[r - 1 + i] || []; const v = row[c - 1 + j]; return v === undefined ? "" : v; })),
        setValues(vals) { vals.forEach((row, i) => { const t = rows[r - 1 + i] || (rows[r - 1 + i] = []); row.forEach((v, j) => (t[c - 1 + j] = norm(v))); }); return range; },
        setFontWeight: () => range,
        setDataValidation: () => range
      };
      return range;
    }
  };
  return sheet;
}

function load(opts = {}) {
  const sheets = {}, sent = [], cache = {}, props = {}, triggers = [];
  const user = { active: opts.activeUser === undefined ? "owner@example.com" : opts.activeUser, effective: "owner@example.com" };
  const ss = {
    getId: () => "sheet123", getUrl: () => "https://docs.google.com/spreadsheets/d/sheet123",
    getSheetByName: n => sheets[n] || null,
    insertSheet: n => (sheets[n] = makeSheet(n, ss))
  };
  const builder = () => { const b = { requireValueInList: () => b, setAllowInvalid: () => b, build: () => ({}) }; return b; };
  const ctx = {
    console, JSON, Date, Math, Number, String, Object, Array, RegExp, Error, isNaN, encodeURIComponent,
    SpreadsheetApp: { getActive: () => ss, openById: () => ss, newDataValidation: builder, getUi: () => { throw new Error("no ui"); } },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] || null, setProperty: (k, v) => (props[k] = v) }) },
    Session: { getActiveUser: () => ({ getEmail: () => user.active }), getEffectiveUser: () => ({ getEmail: () => user.effective }) },
    Utilities: { formatDate, getUuid: () => crypto.randomUUID() },
    MailApp: { sendEmail: m => sent.push(m), getRemainingDailyQuota: () => (opts.quota !== undefined ? opts.quota : 100) - sent.length },
    CacheService: { getScriptCache: () => ({ get: k => (k in cache ? cache[k] : null), put: (k, v) => (cache[k] = v) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ScriptApp: {
      getProjectTriggers: () => triggers.slice(),
      deleteTrigger: t => triggers.splice(triggers.indexOf(t), 1),
      newTrigger: fn => { const t = { getHandlerFunction: () => fn }; const b = { timeBased: () => b, atHour: () => b, everyDays: () => b, inTimezone: () => b, create: () => (triggers.push(t), t) }; return b; },
      getService: () => ({ getUrl: () => "" })
    },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: s => ({ text: s, setMimeType() { return this; } }) },
    HtmlService: {
      createHtmlOutput: s => { const o = { html: s, setTitle: () => o, addMetaTag: () => o, setWidth: () => o, setHeight: () => o }; return o; },
      createHtmlOutputFromFile: f => { const o = { file: f, setTitle: () => o, addMetaTag: () => o, setWidth: () => o, setHeight: () => o }; return o; }
    }
  };
  vm.createContext(ctx);
  const dir = path.join(__dirname, "..");
  ["Config.gs", "Rules.gs", "Code.gs"].forEach(f => vm.runInContext(fs.readFileSync(path.join(dir, f), "utf8"), ctx, { filename: f }));
  // Each Apps Script request starts with a fresh in-memory cache, like a real execution.
  const fresh = fn => (...a) => { vm.runInContext("CACHE = {}", ctx); return fn(...a); };
  return {
    ctx, sheets, sent, cache, triggers, user,
    setup: fresh(() => ctx.setup()),
    post: fresh(body => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).text)),
    get: fresh(params => ctx.doGet({ parameter: params || {} })),
    api: fresh((a, p) => ctx.api(a, p)),
    digest: fresh(() => ctx.dailyDigest()),
    setSetting(key, value) { const sh = sheets.Settings; const row = sh.rows.find(r => r[0] === key); row[1] = value; },
    table(name) { const sh = sheets[name]; const [head, ...rows] = sh.rows; return rows.map(r => Object.fromEntries(head.map((h, i) => [h, r[i]]))); }
  };
}

module.exports = { load, formatDate };
