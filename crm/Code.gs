/**
 * Lead capture and follow-up system for a real estate agent.
 * Runs free inside a Google Sheet (Extensions > Apps Script). See crm/README.md for setup.
 *
 * Tabs it creates: Leads, Activities, Consent log, Suppression, Templates, Settings.
 */

// ---------- Menu and setup ----------

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Lead CRM')
    .addItem('Open dashboard', 'openDashboard')
    .addSeparator()
    .addItem('Send today\'s follow-up email now', 'dailyDigest')
    .addItem('Set up or repair', 'setup')
    .addToUi();
}

function openDashboard() {
  var html = HtmlService.createHtmlOutputFromFile('Dashboard').setWidth(1280).setHeight(860);
  SpreadsheetApp.getUi().showModalDialog(html, 'Lead CRM');
}

/** Creates the tabs, headers, starting settings and templates, and the daily reminder. Safe to run again. */
function setup() {
  var ss = SpreadsheetApp.getActive();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  ensureSheet_('Leads', LEAD_FIELDS);
  ensureSheet_('Activities', ACTIVITY_FIELDS);
  ensureSheet_('Consent log', CONSENT_FIELDS);
  ensureSheet_('Suppression', SUPPRESSION_FIELDS);

  var st = ensureSheet_('Settings', [['key', 'Setting'], ['value', 'Value'], ['help', 'What it means']]);
  var have = st.getLastRow() > 1 ? st.getRange(2, 1, st.getLastRow() - 1, 1).getValues().map(function (r) { return r[0]; }) : [];
  Object.keys(DEFAULTS).forEach(function (k) {
    if (have.indexOf(k) < 0) st.appendRow([k, DEFAULTS[k], SETTING_HELP[k] || '']);
  });

  var tp = ensureSheet_('Templates', TEMPLATE_FIELDS);
  if (tp.getLastRow() < 2) tp.getRange(2, 1, DEFAULT_TEMPLATES.length, TEMPLATE_FIELDS.length).setValues(DEFAULT_TEMPLATES);

  var leads = sheet_('Leads');
  var stageCol = fieldIndex_(LEAD_FIELDS, 'stage') + 1;
  leads.getRange(2, stageCol, leads.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STAGES, true).setAllowInvalid(false).build());

  installTriggers();
  CACHE.settings = null;
  try { SpreadsheetApp.getUi().alert('Lead CRM is ready.\n\nNext: fill in "postalAddress" on the Settings tab, then deploy the web app (see README).'); } catch (e) { /* run from the editor */ }
}

function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'dailyDigest') ScriptApp.deleteTrigger(t);
  });
  var s = settings_();
  ScriptApp.newTrigger('dailyDigest').timeBased().atHour(Number(s.digestHour) || 7).everyDays(1).inTimezone(s.timeZone).create();
}

function ensureSheet_(name, fields) {
  var ss = ss_(), sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  var headers = fields.map(function (f) { return f[1]; });
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < headers.length) {
    // A newer version added columns: append the missing headers on the right.
    var start = sh.getLastColumn() + 1;
    sh.getRange(1, start, 1, headers.length - start + 1).setValues([headers.slice(start - 1)]).setFontWeight('bold');
  }
  return sh;
}

// ---------- Storage helpers ----------

var CACHE = {};

function ss_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActive();
}
function sheet_(name) { return ss_().getSheetByName(name); }
function fieldIndex_(fields, key) { for (var i = 0; i < fields.length; i++) if (fields[i][0] === key) return i; return -1; }

function settings_() {
  if (CACHE.settings) return CACHE.settings;
  var s = {}, k;
  for (k in DEFAULTS) s[k] = DEFAULTS[k];
  var sh = sheet_('Settings');
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) {
      if (r[0] && r[1] !== '' && r[1] !== null) s[r[0]] = typeof r[1] === 'string' ? r[1].trim() : r[1];
    });
  }
  if (!s.alertEmail) s.alertEmail = Session.getEffectiveUser().getEmail() || s.email;
  return (CACHE.settings = s);
}

function readTable_(name, fields) {
  var sh = sheet_(name), last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, fields.length).getValues().map(function (r, i) {
    var o = { _row: i + 2 };
    fields.forEach(function (f, j) { o[f[0]] = r[j]; });
    return o;
  });
}

/** Text from the public form must never become a spreadsheet formula. */
function cell_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(v)) return "'" + v;
  return v;
}

function appendRow_(name, fields, obj) {
  sheet_(name).appendRow(fields.map(function (f) { return cell_(obj[f[0]]); }));
}

function leads_() { return CACHE.leads || (CACHE.leads = readTable_('Leads', LEAD_FIELDS).filter(function (l) { return l.id; })); }

function findLead_(id) {
  var l = leads_().filter(function (x) { return x.id === id; })[0];
  if (!l) throw new Error('Lead not found. It may have been deleted.');
  return l;
}

function saveLead_(lead) {
  lead.updated = new Date();
  var row = LEAD_FIELDS.map(function (f) { return cell_(lead[f[0]]); });
  var sh = sheet_('Leads');
  if (lead._row) sh.getRange(lead._row, 1, 1, row.length).setValues([row]);
  else { sh.appendRow(row); lead._row = sh.getLastRow(); if (CACHE.leads) CACHE.leads.push(lead); }
  return lead;
}

function newId_(prefix) { return prefix + Utilities.getUuid().replace(/-/g, '').slice(0, 10); }

function cleanPhone_(p) {
  var d = phoneDigits_(p);
  if (d.length === 10) return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  return String(p || '').replace(/[^\d+()\-.\s]/g, '').trim().slice(0, 25);
}
function clip_(v, n) { return String(v === undefined || v === null ? '' : v).trim().slice(0, n); }
function cleanEmail_(e) { e = clip_(e, 120).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : ''; }

function sameContact_(lead, email, phone) {
  return (email && String(lead.email).toLowerCase() === email) || (phoneDigits_(phone).length >= 10 && phoneDigits_(lead.phone) === phoneDigits_(phone));
}

// ---------- Website and open-house intake ----------

function doPost(e) {
  var data = {};
  try { data = JSON.parse(e.postData.contents); } catch (err) { data = (e && e.parameter) || {}; }
  var res;
  try { res = intake_(data); } catch (err) { console.error(err); res = { ok: false, error: 'server' }; }
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}

function intake_(d) {
  // Spam protection: a hidden field people never fill, and forms sent faster than a person can type.
  if (d.website || (d.elapsed !== undefined && Number(d.elapsed) < 2500)) return { ok: true };

  var name = clip_(d.name, 80), email = cleanEmail_(d.email), phone = cleanPhone_(clip_(d.phone, 30));
  if (!name || (!email && phoneDigits_(phone).length < 10)) return { ok: false, error: 'missing' };

  var cache = CacheService.getScriptCache();
  var hourKey = 'intake-' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHH');
  var count = Number(cache.get(hourKey) || 0);
  if (count > 60) return { ok: false, error: 'busy' };
  cache.put(hourKey, String(count + 1), 3600);
  var dupKey = 'seen-' + (email || phoneDigits_(phone));
  if (cache.get(dupKey)) return { ok: true }; // Same person pressed send twice.
  cache.put(dupKey, '1', 60);

  var lang = d.language === 'es' ? 'es' : 'en';
  var now = new Date(), lock = LockService.getScriptLock();
  lock.waitLock(20000);
  var lead, isNew;
  try {
    lead = leads_().filter(function (l) { return sameContact_(l, email, phone); })[0];
    isNew = !lead;
    if (isNew) {
      lead = { id: newId_('L'), created: now, stage: 'New', temperature: 'Warm', attempts: 0, token: Utilities.getUuid(), language: lang };
      applySuppression_(lead, email, phone);
    } else if (lead.stage === 'Lost') {
      lead.stage = 'New';
      lead.attempts = 0;
    }
    lead.name = lead.name || name;
    if (email) lead.email = email;
    if (phone) lead.phone = phone;
    ['goal', 'area', 'price', 'timeline'].forEach(function (k) { if (d[k]) lead[k] = clip_(d[k], 80); });
    if (lead.goal && GOALS.indexOf(lead.goal) < 0) lead.goal = 'other';
    if (isNew) {
      lead.source = clip_(d.source, 60) || 'Website';
      lead.message = clip_(d.message, 2000);
      if (d.referredBy) lead.referredBy = clip_(d.referredBy, 80);
    }
    if (d.hasAgent === 'yes') lead.hasAgent = 'Yes';
    else if (d.hasAgent === 'no') lead.hasAgent = '';
    lead.lastInquiry = now;
    lead.nextFollowUp = now; // Every new inquiry goes to the top of today's list.

    var page = clip_(d.page, 300), ua = clip_(d.userAgent, 300);
    var consentSource = clip_(d.source, 60) || 'Website form';
    if (isYes_(d.emailConsent) && email) {
      lead.emailConsent = 'Yes'; lead.emailConsentAt = now; lead.unsubscribed = '';
      appendRow_('Consent log', CONSENT_FIELDS, { when: now, leadId: lead.id, email: email, phone: '', event: 'Email consent given', source: consentSource, wording: CONSENT_TEXT.email[lang], version: CONSENT_VERSION, page: page, userAgent: ua });
    }
    if (isYes_(d.phoneConsent) && phoneDigits_(phone).length >= 10) {
      lead.phoneConsent = 'Yes'; lead.phoneConsentAt = now; lead.phoneOptOut = '';
      appendRow_('Consent log', CONSENT_FIELDS, { when: now, leadId: lead.id, email: '', phone: phone, event: 'Call/text consent given', source: consentSource, wording: CONSENT_TEXT.phone[lang], version: CONSENT_VERSION, page: page, userAgent: ua });
    }
    saveLead_(lead);
    var details = [d.message ? clip_(d.message, 2000) : '', d.property ? 'Property: ' + clip_(d.property, 120) : ''].filter(String).join('\n');
    appendRow_('Activities', ACTIVITY_FIELDS, { id: newId_('A'), leadId: lead.id, when: now, type: isNew ? 'New lead' : 'Inquiry', outcome: consentSource, details: details, by: 'System' });
  } finally {
    lock.releaseLock();
  }

  try { alertOwner_(lead, isNew, d); } catch (err) { console.error('alert failed', err); }
  if (isNew && isYes_(settings_().autoReply) && lead.email && !isYes_(lead.unsubscribed)) {
    try { sendTemplate_(lead, 'welcome', null, null, 'System'); } catch (err) { console.error('auto-reply failed', err); }
  }
  return { ok: true };
}

/** Someone who opted out earlier stays opted out, unless they just gave new permission on this form. */
function applySuppression_(lead, email, phone) {
  readTable_('Suppression', SUPPRESSION_FIELDS).forEach(function (s) {
    if (!sameContact_(s, email, phone)) return;
    if (s.channel === 'email' || s.channel === 'all') lead.unsubscribed = 'Yes';
    if (s.channel === 'phone' || s.channel === 'all') lead.phoneOptOut = 'Yes';
  });
}

function alertOwner_(lead, isNew, d) {
  var s = settings_();
  var lines = [
    (isNew ? 'New lead' : 'Returning lead') + ': ' + lead.name,
    'Goal: ' + (lead.goal || '-') + (lead.area ? ' in ' + lead.area : '') + (lead.price ? ', ' + lead.price : ''),
    'Phone: ' + (lead.phone || '-') + (lead.phoneConsent === 'Yes' ? ' (agreed to calls/texts)' : ''),
    'Email: ' + (lead.email || '-') + (lead.emailConsent === 'Yes' ? ' (agreed to emails)' : ''),
    'Source: ' + (d.source || 'Website') + (d.property ? ' - ' + d.property : ''),
    lead.hasAgent === 'Yes' ? 'Note: says they already work with another agent.' : '',
    '', clip_(d.message, 2000), '',
    'Reply fast: leads contacted within 5 minutes are far more likely to become clients.',
    'Open the Lead CRM from your sheet: ' + ss_().getUrl()
  ];
  MailApp.sendEmail({ to: s.alertEmail, subject: (isNew ? 'New lead: ' : 'Lead is back: ') + lead.name, body: lines.join('\n') });
}

// ---------- Email ----------

function templates_() { return readTable_('Templates', TEMPLATE_FIELDS).filter(function (t) { return t.key; }); }

function findTemplate_(key, channel, lang) {
  var all = templates_().filter(function (t) { return t.key === key && t.channel === channel; });
  return all.filter(function (t) { return t.language === lang; })[0] || all.filter(function (t) { return t.language === 'en'; })[0] || all[0];
}

function fill_(text, lead) {
  var s = settings_(), lang = lead.language === 'es' ? 'es' : 'en';
  var first = String(lead.name || '').trim().split(/\s+/)[0] || (lang === 'es' ? 'hola' : 'there');
  var vars = {
    firstName: first, name: lead.name || '', agentName: s.agentName, agentPhone: s.phone, agentEmail: s.email,
    brokerage: s.brokerage, website: s.website, area: lead.area || (lang === 'es' ? 'el valle de Las Vegas' : 'the Las Vegas valley'),
    goalText: GOAL_TEXT[lang][lead.goal] || GOAL_TEXT[lang].other
  };
  return String(text || '').replace(/\{\{(\w+)\}\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
}

function unsubscribeUrl_(lead) {
  var base = settings_().webAppUrl;
  if (!base) { try { base = ScriptApp.getService().getUrl(); } catch (e) { base = ''; } }
  return base ? base + '?unsub=' + encodeURIComponent(lead.token) : '';
}

function footer_(lead, lang) {
  var s = settings_();
  var who = s.agentName + ', ' + s.agentTitle + ' | ' + s.brokerage + ' | Nevada Lic. ' + s.license;
  var lines = [who, s.postalAddress, s.phone + ' | ' + s.email, lang === 'es' ? 'Igualdad de oportunidades en la vivienda.' : 'Equal Housing Opportunity.'];
  var url = unsubscribeUrl_(lead);
  if (url) lines.push((lang === 'es' ? 'Si no quieres recibir más correos, date de baja aquí: ' : 'Don\'t want these emails? Unsubscribe: ') + url);
  return lines.filter(String);
}

function esc_(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

/**
 * Sends one email from a template (subject/body may be edited first). Checks permission, adds the legal footer,
 * logs it, and schedules the next follow-up. Returns { ok, error }.
 */
function sendTemplate_(lead, key, subject, body, by) {
  var lang = lead.language === 'es' ? 'es' : 'en';
  var t = findTemplate_(key, 'email', lang);
  if (!t) return { ok: false, error: 'Template "' + key + '" not found.' };
  var kind = t.kind === 'marketing' ? 'marketing' : 'personal';
  var check = emailCheck(lead, kind, new Date());
  if (!check.ok) return { ok: false, error: check.reasons.join(' ') };
  var s = settings_();
  if (kind === 'marketing' && (!s.postalAddress || !unsubscribeUrl_(lead))) {
    return { ok: false, error: 'Add your postal address and web app link on the Settings tab first. The law requires both in marketing emails.' };
  }
  if (MailApp.getRemainingDailyQuota() < 1) return { ok: false, error: 'Google\'s daily email limit is used up. Try again tomorrow.' };

  subject = clip_(fill_(subject || t.subject, lead), 200);
  body = fill_(body || t.body, lead);
  var foot = footer_(lead, lang);
  var html = '<div style="font:15px/1.6 Arial,sans-serif;color:#22201d;max-width:600px">' +
    body.split(/\n{2,}/).map(function (p) { return '<p>' + esc_(p).replace(/\n/g, '<br>') + '</p>'; }).join('') +
    '<hr style="border:0;border-top:1px solid #e2ddd5;margin:28px 0 12px"><p style="font-size:12px;color:#8b857c">' +
    foot.map(function (l) { return esc_(l).replace(/(https?:\/\/\S+)/g, '<a href="$1" style="color:#8b857c">$1</a>'); }).join('<br>') + '</p></div>';
  MailApp.sendEmail({ to: lead.email, subject: subject, body: body + '\n\n--\n' + foot.join('\n'), htmlBody: html, name: s.agentName + ', ' + s.agentTitle, replyTo: s.email });
  recordActivity_(lead, { type: 'Email', outcome: 'Sent', details: subject + (t.name ? ' (' + t.name + ')' : ''), by: by || 'You', auto: by !== 'You' });
  return { ok: true };
}

// ---------- Activity and follow-up ----------

/** Logs a touch on a lead and moves its stage and next follow-up date forward. */
function recordActivity_(lead, a) {
  var now = new Date();
  appendRow_('Activities', ACTIVITY_FIELDS, { id: newId_('A'), leadId: lead.id, when: now, type: a.type, outcome: a.outcome || '', details: clip_(a.details, 3000), by: a.by || 'You' });
  if (a.auto) return lead; // Auto-replies and campaigns are logged but do not replace your own personal follow-up.
  var outbound = ['Call', 'Text', 'Email', 'Meeting', 'Showing'].indexOf(a.type) >= 0;
  if (outbound) {
    lead.lastContact = now;
    lead.attempts = (Number(lead.attempts) || 0) + 1;
    if (!lead.firstResponse) lead.firstResponse = now;
  }
  var reached = ['Talked', 'Replied', 'Appointment set'].indexOf(a.outcome) >= 0;
  if (reached && lead.stage === 'New') lead.stage = 'Contacted';
  if (a.outcome === 'Appointment set' && STAGES.indexOf(lead.stage) < STAGES.indexOf('Appointment')) lead.stage = 'Appointment';
  if (a.outcome === 'Not interested') lead.stage = 'Lost';
  if (lead.stage === 'New' && lead.attempts > NEW_LEAD_STEPS.length) lead.stage = 'Nurture';
  var next = a.next ? toDate_(a.next) : (outbound || reached ? suggestNextFollowUp(lead, now) : toDate_(lead.nextFollowUp));
  lead.nextFollowUp = next || '';
  saveLead_(lead);
  return lead;
}

function optOut_(lead, channel, how) {
  var now = new Date();
  if (channel === 'email' || channel === 'all') lead.unsubscribed = 'Yes';
  if (channel === 'phone' || channel === 'all') lead.phoneOptOut = 'Yes';
  saveLead_(lead);
  appendRow_('Suppression', SUPPRESSION_FIELDS, { when: now, email: lead.email, phone: lead.phone, channel: channel, reason: how });
  appendRow_('Consent log', CONSENT_FIELDS, { when: now, leadId: lead.id, email: lead.email, phone: lead.phone, event: 'Opted out of ' + (channel === 'all' ? 'all contact' : channel === 'phone' ? 'calls/texts' : 'email'), source: how, wording: '', version: '', page: '', userAgent: '' });
  appendRow_('Activities', ACTIVITY_FIELDS, { id: newId_('A'), leadId: lead.id, when: now, type: 'Note', outcome: 'Opted out', details: how, by: 'System' });
}

// ---------- Unsubscribe page and private dashboard ----------

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.unsub) return unsubscribePage_(p.unsub);
  if (isAllowedUser_()) {
    return HtmlService.createHtmlOutputFromFile('Dashboard').setTitle('Lead CRM')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  return HtmlService.createHtmlOutput('<p style="font:16px Arial;padding:24px">This page is private. If you own it, open the dashboard from your Google Sheet: Lead CRM &gt; Open dashboard.</p>').setTitle('Private');
}

function unsubscribePage_(token) {
  var s = settings_(), lock = LockService.getScriptLock(), lead;
  lock.waitLock(20000);
  try {
    lead = leads_().filter(function (l) { return l.token && l.token === String(token); })[0];
    if (lead && !isYes_(lead.unsubscribed)) optOut_(lead, 'email', 'Unsubscribe link in email');
  } finally { lock.releaseLock(); }
  var es = lead && lead.language === 'es';
  var msg = !lead ? 'This link is not valid anymore. To stop emails, reply "unsubscribe" to any email or write to ' + s.email + '.'
    : es ? 'Listo. Ya no recibirás más correos de ' + s.agentName + '. Si fue un error, responde a cualquier correo y te vuelvo a agregar.'
      : 'Done. You will not receive more emails from ' + s.agentName + '. If this was a mistake, reply to any email and I will add you back.';
  return HtmlService.createHtmlOutput('<div style="font:17px/1.6 Arial,sans-serif;max-width:520px;margin:48px auto;padding:0 16px;color:#22201d"><h2 style="font-weight:500">' +
    esc_(es ? 'Te diste de baja' : 'You are unsubscribed') + '</h2><p>' + esc_(msg) + '</p></div>').setTitle('Unsubscribe')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function isAllowedUser_() {
  var me = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!me) return false;
  var owner = String(Session.getEffectiveUser().getEmail() || '').toLowerCase();
  var team = String(settings_().teamEmails || '').toLowerCase().split(/[\s,;]+/).filter(String);
  return me === owner || team.indexOf(me) >= 0;
}

// ---------- Dashboard API (called from Dashboard.html) ----------

function api(action, p) {
  if (!isAllowedUser_()) throw new Error('You do not have access to this CRM.');
  p = p || {};
  var fn = API[action];
  if (!fn) throw new Error('Unknown action');
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return JSON.parse(JSON.stringify(fn(p), function (k, v) { return k === '_row' ? undefined : v; })); }
  finally { lock.releaseLock(); }
}

function leadView_(l, now) {
  var o = {};
  LEAD_FIELDS.forEach(function (f) {
    var v = l[f[0]];
    o[f[0]] = v instanceof Date ? v.toISOString() : v === null || v === undefined ? '' : v;
  });
  o.phoneCheck = phoneCheck(l, now, settings_());
  o.emailCheck = emailCheck(l, 'personal', now);
  o.marketingCheck = emailCheck(l, 'marketing', now);
  return o;
}

function setupWarnings_() {
  var s = settings_(), w = [];
  if (!s.postalAddress) w.push('Add your postal address on the Settings tab. The law requires it in every marketing email, so campaigns are off until it is filled in.');
  if (!s.webAppUrl) w.push('Paste your web app link (ending in /exec) into "webAppUrl" on the Settings tab so unsubscribe links work.');
  var hasDigest = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'dailyDigest'; });
  if (!hasDigest) w.push('The daily follow-up email is not scheduled. Run Lead CRM > Set up or repair.');
  return w;
}

var API = {
  bootstrap: function () {
    var now = new Date(), s = settings_();
    return {
      leads: leads_().map(function (l) { return leadView_(l, now); }),
      templates: templates_().map(function (t) { return { key: t.key, channel: t.channel, kind: t.kind, language: t.language, name: t.name, subject: t.subject, body: t.body }; }),
      settings: { agentName: s.agentName, brokerage: s.brokerage, phone: s.phone, timeZone: s.timeZone, quietStart: s.quietStart, quietEnd: s.quietEnd },
      lists: { stages: STAGES, goals: GOALS, sources: SOURCES, types: ACTIVITY_TYPES, outcomes: OUTCOMES },
      quota: MailApp.getRemainingDailyQuota(),
      warnings: setupWarnings_(),
      sheetUrl: ss_().getUrl()
    };
  },

  getLead: function (p) {
    var l = findLead_(p.id);
    var acts = readTable_('Activities', ACTIVITY_FIELDS).filter(function (a) { return a.leadId === l.id; })
      .map(function (a) { return { when: toDate_(a.when) ? toDate_(a.when).toISOString() : '', type: a.type, outcome: a.outcome, details: a.details, by: a.by }; })
      .reverse();
    return { lead: leadView_(l, new Date()), activities: acts };
  },

  saveLead: function (p) {
    var now = new Date(), isNew = !p.id, lead;
    var email = p.email ? cleanEmail_(p.email) : '', phone = cleanPhone_(clip_(p.phone, 30));
    if (p.email && !email) throw new Error('That email address does not look right.');
    if (isNew) {
      if (!clip_(p.name, 80)) throw new Error('Add a name.');
      var dupe = leads_().filter(function (l) { return sameContact_(l, email, phone); })[0];
      if (dupe) throw new Error('This person is already in your CRM as "' + dupe.name + '".');
      lead = { id: newId_('L'), created: now, stage: 'New', attempts: 0, token: Utilities.getUuid(), nextFollowUp: now };
      applySuppression_(lead, email, phone);
      if (p.inquired) lead.lastInquiry = now;
    } else {
      lead = findLead_(p.id);
    }
    lead.name = clip_(p.name, 80) || lead.name;
    if (p.email !== undefined) lead.email = email;
    if (p.phone !== undefined) {
      if (!isNew && phoneDigits_(phone) !== phoneDigits_(lead.phone)) {
        // Call/text permission and DNC checks belong to a phone number, not to the person.
        lead.phoneConsent = ''; lead.phoneConsentAt = ''; lead.dncCheckedOn = ''; lead.onDnc = '';
      }
      lead.phone = phone;
    }
    ['language', 'goal', 'area', 'price', 'timeline', 'source', 'temperature', 'tags', 'referredBy'].forEach(function (k) { if (p[k] !== undefined) lead[k] = clip_(p[k], 120); });
    if (p.notes !== undefined) lead.notes = clip_(p.notes, 5000);
    if (p.hasAgent !== undefined) lead.hasAgent = p.hasAgent ? 'Yes' : '';
    if (p.closedOn !== undefined) lead.closedOn = toDate_(p.closedOn) || '';
    if (p.stage && STAGES.indexOf(p.stage) >= 0 && p.stage !== lead.stage) {
      lead.stage = p.stage;
      if (p.stage === 'Closed' && !toDate_(lead.closedOn)) lead.closedOn = now;
      if (!p.nextFollowUp) lead.nextFollowUp = suggestNextFollowUp(lead, now) || '';
    }
    if (p.nextFollowUp !== undefined && p.nextFollowUp !== '') lead.nextFollowUp = toDate_(p.nextFollowUp) || lead.nextFollowUp;

    // Permission you collected yourself (open-house sheet, signed form, recorded call). Keep the paper or recording.
    var proof = clip_(p.consentProof, 200);
    if (p.addEmailConsent && lead.email && !isYes_(lead.emailConsent)) {
      if (!proof) throw new Error('Say where they gave email permission (for example "Open house sign-in, 123 Main St").');
      lead.emailConsent = 'Yes'; lead.emailConsentAt = now; lead.unsubscribed = '';
      appendRow_('Consent log', CONSENT_FIELDS, { when: now, leadId: lead.id, email: lead.email, event: 'Email consent given', source: proof, wording: 'Recorded by agent', version: 'manual' });
    }
    if (p.addPhoneConsent && lead.phone && !isYes_(lead.phoneConsent)) {
      if (!proof) throw new Error('Say where they signed call/text permission (it must be in writing).');
      lead.phoneConsent = 'Yes'; lead.phoneConsentAt = now; lead.phoneOptOut = '';
      appendRow_('Consent log', CONSENT_FIELDS, { when: now, leadId: lead.id, phone: lead.phone, event: 'Call/text consent given', source: proof, wording: 'Signed written consent recorded by agent', version: 'manual' });
    }
    saveLead_(lead);
    if (isNew) appendRow_('Activities', ACTIVITY_FIELDS, { id: newId_('A'), leadId: lead.id, when: now, type: 'New lead', outcome: lead.source || 'Added by hand', details: '', by: 'You' });
    return { lead: leadView_(lead, now) };
  },

  logActivity: function (p) {
    var lead = findLead_(p.id);
    if (ACTIVITY_TYPES.indexOf(p.type) < 0) throw new Error('Pick what you did.');
    recordActivity_(lead, { type: p.type, outcome: p.outcome, details: p.details, next: p.next });
    return API.getLead({ id: lead.id });
  },

  optOut: function (p) {
    var lead = findLead_(p.id);
    if (['email', 'phone', 'all'].indexOf(p.channel) < 0) throw new Error('Bad channel');
    optOut_(lead, p.channel, clip_(p.how, 200) || 'Asked to stop (recorded by agent)');
    return API.getLead({ id: lead.id });
  },

  recordDnc: function (p) {
    var lead = findLead_(p.id);
    lead.onDnc = p.onDnc === 'Yes' ? 'Yes' : 'No';
    lead.dncCheckedOn = new Date();
    saveLead_(lead);
    appendRow_('Activities', ACTIVITY_FIELDS, { id: newId_('A'), leadId: lead.id, when: new Date(), type: 'Note', outcome: 'DNC check', details: 'National Do Not Call Registry: ' + (lead.onDnc === 'Yes' ? 'on the list' : 'not on the list'), by: 'You' });
    return API.getLead({ id: lead.id });
  },

  sendEmail: function (p) {
    var lead = findLead_(p.id);
    var r = sendTemplate_(lead, p.key, p.subject, p.body, 'You');
    if (!r.ok) throw new Error(r.error);
    return API.getLead({ id: lead.id });
  },

  campaignPreview: function (p) { return campaign_(p, false); },
  campaignSend: function (p) { return campaign_(p, true); },

  deleteLead: function (p) {
    var lead = findLead_(p.id);
    // Keep a do-not-contact record so a deleted person is not contacted again by mistake.
    if (p.suppress) appendRow_('Suppression', SUPPRESSION_FIELDS, { when: new Date(), email: lead.email, phone: lead.phone, channel: 'all', reason: 'Deleted at their request' });
    var acts = sheet_('Activities'), rows = readTable_('Activities', ACTIVITY_FIELDS);
    for (var i = rows.length - 1; i >= 0; i--) if (rows[i].leadId === lead.id) acts.deleteRow(rows[i]._row);
    sheet_('Leads').deleteRow(lead._row);
    CACHE.leads = null;
    return { ok: true };
  }
};

/** Bulk email to a filtered group. Only people with permission get it; everyone else is counted with the reason. */
function campaign_(p, send) {
  var t = templates_().filter(function (x) { return x.key === p.key && x.channel === 'email'; })[0];
  if (!t) throw new Error('Pick an email template.');
  var now = new Date(), f = p.filter || {}, eligible = [], skipped = {};
  leads_().forEach(function (l) {
    if (f.stage && l.stage !== f.stage) return;
    if (f.goal && l.goal !== f.goal) return;
    if (f.language && (l.language || 'en') !== f.language) return;
    if (f.source && l.source !== f.source) return;
    if (f.tag && String(l.tags).toLowerCase().split(/\s*,\s*/).indexOf(String(f.tag).toLowerCase()) < 0) return;
    var c = emailCheck(l, t.kind === 'marketing' ? 'marketing' : 'personal', now);
    if (c.ok) eligible.push(l);
    else skipped[c.reasons[0]] = (skipped[c.reasons[0]] || 0) + 1;
  });
  var s = settings_(), quota = MailApp.getRemainingDailyQuota();
  var blocker = t.kind === 'marketing' && !s.postalAddress ? 'Add your postal address on the Settings tab first (required by law in marketing emails).'
    : t.kind === 'marketing' && !s.webAppUrl ? 'Paste your web app link into "webAppUrl" on the Settings tab first, so the unsubscribe link works.' : '';
  var out = { eligible: eligible.length, skipped: skipped, quota: quota, blocker: blocker, names: eligible.slice(0, 8).map(function (l) { return l.name; }) };
  if (!send) return out;
  if (blocker) throw new Error(blocker);
  var sent = 0, failed = 0;
  eligible.forEach(function (l) {
    if (sent >= quota) return;
    var r = sendTemplate_(l, p.key, null, null, 'Campaign');
    if (r.ok) sent++; else failed++;
  });
  out.sent = sent; out.failed = failed; out.left = eligible.length - sent - failed;
  return out;
}

// ---------- Daily follow-up email ----------

function dailyDigest() {
  var s = settings_(), now = new Date(), tz = s.timeZone;
  var today = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  var dayOf = function (d) { return Utilities.formatDate(d, tz, 'yyyy-MM-dd'); };
  var groups = { fresh: [], overdue: [], today: [], anniversaries: [] };
  leads_().forEach(function (l) {
    var next = toDate_(l.nextFollowUp), closed = toDate_(l.closedOn);
    if (l.stage === 'New' && !(Number(l.attempts) > 0)) groups.fresh.push(l);
    else if (next && dayOf(next) < today) groups.overdue.push(l);
    else if (next && dayOf(next) === today) groups.today.push(l);
    if (closed && closed < addDays_(now, -300)) {
      for (var i = 0; i < 7; i++) {
        if (Utilities.formatDate(addDays_(now, i), tz, 'MM-dd') === Utilities.formatDate(closed, tz, 'MM-dd')) { groups.anniversaries.push(l); break; }
      }
    }
  });
  var total = groups.fresh.length + groups.overdue.length + groups.today.length + groups.anniversaries.length;
  if (!total) return 0;

  var row = function (l) {
    var pc = phoneCheck(l, now, s), bits = [l.name, l.goal, l.area, l.phone, l.email].filter(String);
    var note = pc.ok ? '' : (isYes_(l.phoneOptOut) ? ' [no calls/texts]' : /Registry/.test(pc.reasons.join(' ')) ? ' [check DNC before calling]' : '');
    return '- ' + bits.join(' | ') + note;
  };
  var parts = ['Good morning! Here is who to reach out to today.', ''];
  [['New leads not contacted yet (call these first)', groups.fresh], ['Overdue', groups.overdue], ['Due today', groups.today], ['Home anniversaries this week (send a note)', groups.anniversaries]]
    .forEach(function (g) { if (g[1].length) parts.push(g[0] + ' (' + g[1].length + ')', g[1].map(row).join('\n'), ''); });
  parts.push('Calls and texts: ' + hourLabel_(s.quietStart) + ' to ' + hourLabel_(s.quietEnd) + ' their time only.', 'Open your CRM: ' + ss_().getUrl());
  MailApp.sendEmail({ to: s.alertEmail, subject: 'Today\'s follow-ups: ' + total + ' people', body: parts.join('\n') });
  return total;
}
