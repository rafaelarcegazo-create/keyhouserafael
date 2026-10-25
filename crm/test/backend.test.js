const test = require("node:test");
const assert = require("node:assert");
const { load } = require("./gas-mock");

function ready(opts) {
  const g = load(opts);
  g.setup();
  g.sent.length = 0;
  return g;
}
const form = (o = {}) => Object.assign({ name: "Ana Lopez", email: "ana@example.com", phone: "702-555-0101", goal: "buy", area: "Henderson", message: "Looking for 3 bedrooms", language: "en", elapsed: 9000, page: "https://keyhouserafael.realtor/", userAgent: "test" }, o);
// 10am and 10pm in Las Vegas (PDT, UTC-7) on a fixed day.
const DAYTIME = new Date("2026-10-20T17:00:00Z"), NIGHT = new Date("2026-10-21T05:00:00Z");

test("setup creates every tab, settings, templates and the daily trigger, and can run twice", () => {
  const g = ready();
  for (const t of ["Leads", "Activities", "Consent log", "Suppression", "Templates", "Settings"]) assert.ok(g.sheets[t], t);
  g.setup();
  assert.strictEqual(g.sheets.Templates.rows.length - 1, 18);
  assert.strictEqual(g.table("Settings").filter(r => r.Setting === "brokerage").length, 1);
  assert.strictEqual(g.triggers.length, 1);
});

test("website lead is saved, logged, alerts the agent and gets an auto-reply", () => {
  const g = ready();
  assert.deepStrictEqual(g.post(form({ emailConsent: true, phoneConsent: true })), { ok: true });
  const [lead] = g.table("Leads");
  assert.strictEqual(lead.Name, "Ana Lopez");
  assert.strictEqual(lead.Phone, "(702) 555-0101");
  assert.strictEqual(lead.Stage, "New");
  assert.strictEqual(lead["Email consent"], "Yes");
  assert.strictEqual(lead["Call/text consent"], "Yes");
  assert.ok(lead["Next follow-up"] instanceof Date);
  const consents = g.table("Consent log");
  assert.strictEqual(consents.length, 2);
  assert.match(consents[1]["Exact wording"], /not a condition of any purchase/);
  assert.strictEqual(g.table("Activities")[0].Type, "New lead");
  assert.strictEqual(g.sent.length, 2);
  assert.match(g.sent[0].subject, /New lead: Ana Lopez/);
  assert.strictEqual(g.sent[1].to, "ana@example.com");
  assert.match(g.sent[1].body, /Equal Housing Opportunity/);
  assert.match(g.sent[1].body, /DH Capital Realty/);
  // The auto-reply must not count as Rafael's own first contact.
  assert.strictEqual(Number(g.table("Leads")[0].Attempts), 0);
});

test("checkboxes left empty mean no consent", () => {
  const g = ready();
  g.post(form());
  const [lead] = g.table("Leads");
  assert.strictEqual(lead["Email consent"], "");
  assert.strictEqual(lead["Call/text consent"], "");
  assert.strictEqual(g.table("Consent log").length, 0);
});

test("Spanish lead gets the Spanish auto-reply", () => {
  const g = ready();
  g.post(form({ language: "es", name: "Luis Pérez", email: "luis@example.com", phone: "" }));
  assert.match(g.sent[1].subject, /Gracias, Luis/);
  assert.match(g.sent[1].body, /Igualdad de oportunidades/);
});

test("spam is dropped quietly: honeypot, too fast, and double submit", () => {
  const g = ready();
  assert.deepStrictEqual(g.post(form({ website: "http://spam" })), { ok: true });
  assert.deepStrictEqual(g.post(form({ elapsed: 300 })), { ok: true });
  assert.strictEqual(g.table("Leads").length, 0);
  g.post(form()); g.post(form());
  assert.strictEqual(g.table("Leads").length, 1);
});

test("missing contact info is rejected", () => {
  const g = ready();
  assert.deepStrictEqual(g.post(form({ email: "nope", phone: "12" })), { ok: false, error: "missing" });
});

test("form text can never become a spreadsheet formula", () => {
  const g = ready();
  g.post(form({ name: "=HYPERLINK(\"http://x\")", message: "+cmd" }));
  // The mock strips the protective apostrophe like Sheets does; what matters is it was sent with one.
  const leads = g.sheets.Leads;
  const orig = leads.appendRow;
  let raw;
  leads.appendRow = v => { raw = v; return orig(v); };
  g.cache["seen-bob@example.com"] = null;
  g.post(form({ name: "@SUM(A1)", email: "bob@example.com", phone: "702-555-0199" }));
  assert.ok(raw.includes("'@SUM(A1)"));
});

test("a returning lead is merged by email or phone, not duplicated", () => {
  const g = ready();
  g.post(form({ emailConsent: true }));
  g.cache["seen-ana@example.com"] = null;
  g.post(form({ email: "", phone: "(702) 555-0101", goal: "sell", message: "Now I want to sell", elapsed: 9000 }));
  const leads = g.table("Leads");
  assert.strictEqual(leads.length, 1);
  assert.strictEqual(leads[0].Goal, "sell");
  assert.ok(g.table("Activities").some(a => a.Type === "Inquiry" && /sell/.test(a.Details)));
});

test("unsubscribe link opts the person out of email and they stay out if they come back", () => {
  const g = ready();
  g.post(form({ emailConsent: true }));
  const token = g.table("Leads")[0]["Unsubscribe key"];
  const page = g.get({ unsub: token });
  assert.match(page.html, /unsubscribed/);
  assert.strictEqual(g.table("Leads")[0].Unsubscribed, "Yes");
  assert.strictEqual(g.table("Suppression").length, 1);
  // Delete and re-add: suppression still applies.
  const id = g.table("Leads")[0].ID;
  g.api("deleteLead", { id, suppress: false });
  g.cache["seen-ana@example.com"] = null;
  g.sent.length = 0;
  g.post(form());
  assert.strictEqual(g.table("Leads")[0].Unsubscribed, "Yes");
  assert.strictEqual(g.sent.length, 1, "only the alert to the agent, no auto-reply");
});

test("call/text rules: consent, relationship, DNC, quiet hours, opt-out", () => {
  const g = ready();
  const s = g.ctx.settings_();
  const check = (lead, now) => g.ctx.phoneCheck(lead, now || DAYTIME, s);
  const base = { phone: "7025550101" };
  assert.strictEqual(check({ ...base, phoneConsent: "Yes" }).ok, true);
  assert.strictEqual(check({ ...base, phoneConsent: "Yes" }, NIGHT).ok, false, "9pm-8am blocked even with consent");
  assert.match(check({ ...base, phoneConsent: "Yes" }, NIGHT).reasons.join(), /8am to 9pm/);
  assert.strictEqual(check({ ...base, lastInquiry: new Date("2026-09-01") }).ok, true, "inquiry within 3 months");
  assert.strictEqual(check({ ...base, lastInquiry: new Date("2026-06-01") }).ok, false, "inquiry older than 3 months");
  assert.strictEqual(check({ ...base, closedOn: new Date("2025-06-01") }).ok, true, "closed within 18 months");
  assert.strictEqual(check({ ...base, dncCheckedOn: new Date("2026-10-01"), onDnc: "No" }).ok, true);
  assert.strictEqual(check({ ...base, dncCheckedOn: new Date("2026-08-01"), onDnc: "No" }).ok, false, "DNC check older than 31 days");
  assert.strictEqual(check({ ...base, dncCheckedOn: new Date("2026-10-01"), onDnc: "Yes" }).ok, false);
  assert.strictEqual(check({ ...base, phoneConsent: "Yes", phoneOptOut: "Yes" }).ok, false, "opt-out beats consent");
  assert.ok(check({ ...base, phoneConsent: "Yes", hasAgent: "Yes" }).warnings.some(w => /Article 16/.test(w)));
});

test("email rules: unsubscribed, no permission for marketing, other agent's client", () => {
  const g = ready();
  const c = (l, k) => g.ctx.emailCheck(l, k, DAYTIME).ok;
  assert.strictEqual(c({ email: "a@b.co", emailConsent: "Yes" }, "marketing"), true);
  assert.strictEqual(c({ email: "a@b.co", lastInquiry: DAYTIME }, "marketing"), true);
  assert.strictEqual(c({ email: "a@b.co" }, "marketing"), false);
  assert.strictEqual(c({ email: "a@b.co" }, "personal"), true);
  assert.strictEqual(c({ email: "a@b.co", emailConsent: "Yes", unsubscribed: "Yes" }, "personal"), false);
  assert.strictEqual(c({ email: "a@b.co", emailConsent: "Yes", hasAgent: "Yes" }, "marketing"), false);
});

test("follow-up schedule moves forward with each touch", () => {
  const g = ready();
  const next = (l) => Math.round((g.ctx.suggestNextFollowUp(l, DAYTIME) - DAYTIME) / 864e5);
  assert.strictEqual(next({ stage: "New", attempts: 0 }), 0);
  assert.deepStrictEqual([1, 2, 3, 4, 5, 6].map(a => next({ stage: "New", attempts: a })), [1, 2, 4, 7, 14, 30]);
  assert.strictEqual(next({ stage: "Nurture", temperature: "Hot" }), 7);
  assert.strictEqual(next({ stage: "Nurture" }), 30);
  assert.strictEqual(g.ctx.suggestNextFollowUp({ stage: "Lost" }, DAYTIME), null);
  assert.strictEqual(next({ stage: "Closed", closedOn: new Date("2026-10-10T17:00:00Z") }), 20);
});

test("logging a call moves stage and schedules the next follow-up", () => {
  const g = ready();
  g.post(form());
  const id = g.table("Leads")[0].ID;
  let r = g.api("logActivity", { id, type: "Call", outcome: "No answer" });
  assert.strictEqual(r.lead.stage, "New");
  assert.strictEqual(r.lead.attempts, 1);
  assert.ok(r.lead.firstResponse);
  r = g.api("logActivity", { id, type: "Call", outcome: "Talked", details: "Wants 3 bed" });
  assert.strictEqual(r.lead.stage, "Contacted");
  r = g.api("logActivity", { id, type: "Call", outcome: "Appointment set" });
  assert.strictEqual(r.lead.stage, "Appointment");
  assert.strictEqual(r.activities[0].outcome, "Appointment set");
  r = g.api("logActivity", { id, type: "Note", details: "x", next: "2026-12-01T17:00:00.000Z" });
  assert.strictEqual(r.lead.nextFollowUp, "2026-12-01T17:00:00.000Z");
});

test("closing a deal sets the closing date for anniversary reminders", () => {
  const g = ready();
  g.post(form());
  const id = g.table("Leads")[0].ID;
  const r = g.api("saveLead", { id, stage: "Closed" });
  assert.ok(r.lead.closedOn);
  assert.ok(r.lead.nextFollowUp > r.lead.closedOn);
});

test("changing the phone number drops call/text consent tied to the old number", () => {
  const g = ready();
  g.post(form({ phoneConsent: true }));
  const id = g.table("Leads")[0].ID;
  const r = g.api("saveLead", { id, phone: "702-555-0177" });
  assert.strictEqual(r.lead.phoneConsent, "");
});

test("manual lead: duplicate blocked, consent needs proof", () => {
  const g = ready();
  g.post(form());
  assert.throws(() => g.api("saveLead", { name: "Ana again", email: "ANA@example.com" }), /already in your CRM/);
  assert.throws(() => g.api("saveLead", { name: "Bo", email: "bo@example.com", addEmailConsent: true }), /where they gave email permission/);
  const r = g.api("saveLead", { name: "Bo", email: "bo@example.com", source: "Open house", addEmailConsent: true, consentProof: "Sign-in sheet 1 Elm" });
  assert.strictEqual(r.lead.emailConsent, "Yes");
  assert.strictEqual(g.table("Consent log").at(-1).Source, "Sign-in sheet 1 Elm");
});

test("marketing campaign is blocked until postal address and unsubscribe link are set, then only reaches permitted people", () => {
  const g = ready();
  g.post(form({ emailConsent: true }));
  for (const k in g.cache) delete g.cache[k];
  g.post(form({ name: "Bo", email: "bo@example.com", phone: "", hasAgent: "yes", emailConsent: true }));
  g.api("saveLead", { name: "Cold Contact", email: "cold@example.com" });
  let p = g.api("campaignPreview", { key: "listings" });
  assert.match(p.blocker, /postal address/);
  assert.throws(() => g.api("campaignSend", { key: "listings" }), /postal address/);
  g.setSetting("postalAddress", "123 Example Ave, Las Vegas, NV 89101");
  g.setSetting("webAppUrl", "https://script.google.com/macros/s/abc/exec");
  p = g.api("campaignPreview", { key: "listings" });
  assert.strictEqual(p.blocker, "");
  assert.strictEqual(p.eligible, 1);
  g.sent.length = 0;
  const r = g.api("campaignSend", { key: "listings" });
  assert.strictEqual(r.sent, 1);
  assert.strictEqual(g.sent[0].to, "ana@example.com");
  assert.match(g.sent[0].body, /123 Example Ave/);
  assert.match(g.sent[0].body, /exec\?unsub=/);
  assert.match(g.sent[0].htmlBody, /Unsubscribe/);
});

test("campaign stops at Google's daily email limit", () => {
  const g = ready({ quota: 3 });
  g.setSetting("postalAddress", "123 Example Ave");
  g.setSetting("webAppUrl", "https://x/exec");
  for (let i = 0; i < 5; i++) g.api("saveLead", { name: "P" + i, email: `p${i}@example.com`, inquired: true });
  g.sent.length = 0;
  const r = g.api("campaignSend", { key: "pastclient" });
  assert.strictEqual(r.sent, 3);
  assert.strictEqual(r.left, 2);
});

test("opting out from the dashboard blocks calls and records it", () => {
  const g = ready();
  g.post(form({ phoneConsent: true }));
  const id = g.table("Leads")[0].ID;
  const r = g.api("optOut", { id, channel: "phone", how: "Replied STOP" });
  assert.strictEqual(r.lead.phoneCheck.ok, false);
  assert.match(r.lead.phoneCheck.reasons[0], /internal do-not-call/);
  assert.strictEqual(g.table("Suppression")[0].Reason, "Replied STOP");
});

test("privacy delete removes the lead and history but keeps a do-not-contact record", () => {
  const g = ready();
  g.post(form());
  const id = g.table("Leads")[0].ID;
  g.api("logActivity", { id, type: "Note", details: "hi" });
  g.api("deleteLead", { id, suppress: true });
  assert.strictEqual(g.table("Leads").length, 0);
  assert.strictEqual(g.table("Activities").length, 0);
  assert.strictEqual(g.table("Suppression")[0].Channel, "all");
});

test("the dashboard is private", () => {
  const g = ready({ activeUser: "" });
  assert.match(g.get({}).html, /private/);
  assert.throws(() => g.api("bootstrap"), /do not have access/);
  g.user.active = "stranger@example.com";
  assert.throws(() => g.api("bootstrap"), /do not have access/);
  g.user.active = "owner@example.com";
  assert.strictEqual(g.get({}).file, "Dashboard");
  assert.ok(Array.isArray(g.api("bootstrap").leads));
});

test("daily digest lists new and due leads", () => {
  const g = ready();
  assert.strictEqual(g.digest(), 0);
  g.post(form());
  g.sent.length = 0;
  assert.strictEqual(g.digest(), 1);
  assert.match(g.sent[0].body, /New leads not contacted yet/);
  assert.match(g.sent[0].body, /Ana Lopez/);
});
