// Drives the real website form, open-house page and dashboard in Chromium, connected to the backend running in Node.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { load } = require("./gas-mock");

const ROOT = path.join(__dirname, "..", "..");
const SHOTS = process.env.SHOTS_DIR;
const EXEC = "https://script.google.com/macros/s/test/exec";
let browser;
test.before(async () => { browser = await chromium.launch(); });
test.after(async () => { await browser.close(); });

async function site(page, g) {
  page.setDefaultTimeout(15000);
  await page.route(/fonts\.(googleapis|gstatic)\.com|calendar\.app\.google|calendar\.google\.com/, r => r.abort());
  await page.route(EXEC, async r => {
    const res = g.post(JSON.parse(r.request().postData()));
    await r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(res) });
  });
  await page.route("https://keyhouserafael.test/**", r => {
    const file = new URL(r.request().url()).pathname.slice(1) || "index.html";
    if (file === "leads-config.js") return r.fulfill({ contentType: "text/javascript", body: `window.LEADS_URL = "${EXEC}";` });
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) return r.fulfill({ status: 404, body: "" });
    const type = { html: "text/html", js: "text/javascript", jpg: "image/jpeg", png: "image/png", mp4: "video/mp4" }[file.split(".").pop()] || "application/octet-stream";
    return r.fulfill({ contentType: type, body: fs.readFileSync(p) });
  });
}

async function dashboard(page, g) {
  page.setDefaultTimeout(15000);
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.exposeFunction("__api", (a, p) => { try { return { ok: g.api(a, p) }; } catch (e) { return { err: e.message }; } });
  await page.addInitScript(() => {
    const runner = (ok, fail) => ({
      withSuccessHandler: f => runner(f, fail), withFailureHandler: f => runner(ok, f),
      api: (a, p) => window.__api(a, p).then(r => r.err ? fail(new Error(r.err)) : ok(r.ok))
    });
    window.google = { script: { get run() { return runner(() => {}, () => {}); } } };
  });
  await page.route("https://crm.test/", r => r.fulfill({ contentType: "text/html", body: fs.readFileSync(path.join(__dirname, "..", "Dashboard.html")) }));
  await page.goto("https://crm.test/");
}

test("website form sends the lead with consent into the CRM", async () => {
  const g = load(); g.setup(); g.sent.length = 0;
  const page = await browser.newPage();
  await site(page, g);
  await page.goto("https://keyhouserafael.test/index.html?utm_source=instagram", { waitUntil: "domcontentloaded" });
  await page.fill("#f-name", "Maria Gomez");
  await page.fill("#f-phone", "7025550142");
  await page.fill("#f-email", "maria@example.com");
  await page.check("#g-sell", { force: true });
  await page.fill("#f-msg", "I want to sell my condo");
  await page.check("#f-cphone");
  await page.waitForTimeout(2600); // the spam filter ignores forms sent in under 2.5 seconds
  await page.click("#contact-form button[type=submit]");
  await page.waitForFunction(() => /got your message/.test(document.getElementById("form-note").textContent));
  if (SHOTS) await page.locator("#contact").screenshot({ path: path.join(SHOTS, "website-form.png") });
  const [lead] = g.table("Leads");
  assert.strictEqual(lead.Name, "Maria Gomez");
  assert.strictEqual(lead.Goal, "sell");
  assert.strictEqual(lead.Source, "Website (instagram)");
  assert.strictEqual(lead["Call/text consent"], "Yes");
  assert.strictEqual(lead["Email consent"], "");
});

test("open house sign-in records the property and the other-agent answer, then clears", async () => {
  const g = load(); g.setup();
  const page = await browser.newPage({ viewport: { width: 820, height: 1100 } });
  await site(page, g);
  await page.goto("https://keyhouserafael.test/open-house.html?property=" + encodeURIComponent("123 Desert Rose Ln"), { waitUntil: "domcontentloaded" });
  await page.click("button[data-lang=es]");
  await page.fill("input[name=name]", "José Ruiz");
  await page.fill("input[name=phone]", "702 555 0177");
  await page.check("input[name=hasAgent][value=yes]", { force: true });
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "open-house.png") });
  await page.waitForTimeout(2600);
  await page.click("button.go");
  await page.waitForSelector("#thanks:not([hidden])");
  assert.strictEqual(await page.inputValue("input[name=name]"), "");
  const [lead] = g.table("Leads");
  assert.strictEqual(lead.Source, "Open house");
  assert.strictEqual(lead["Has another agent"], "Yes");
  assert.strictEqual(lead.Language, "es");
  assert.match(g.table("Activities")[0].Details, /123 Desert Rose Ln/);
});

test("dashboard: today list, lead drawer, logging a call, compliance blocks, campaign preview", async () => {
  const g = load(); g.setup();
  g.post({ name: "Ana Lopez", email: "ana@example.com", phone: "7025550101", goal: "buy", area: "Henderson", message: "3 bedrooms, near good parks", elapsed: 9000, phoneConsent: true, emailConsent: true });
  g.post({ name: "Ben Carter", email: "ben@example.com", goal: "sell", elapsed: 9000 });
  g.api("saveLead", { name: "Old Contact", phone: "7025550111", source: "Sphere" });
  g.post({ name: "<img src=x onerror=alert(1)>", email: "xss@example.com", elapsed: 9000 });
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("dialog", d => d.accept());
  await dashboard(page, g);
  await page.waitForSelector("text=New leads: reach out now");
  assert.ok(await page.isVisible("text=Ana Lopez"));
  assert.ok(await page.isVisible("text=<img src=x onerror=alert(1)>"), "lead names are shown as text, never as HTML");
  assert.ok(await page.isVisible("text=postal address"), "setup warning shown");
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "dashboard-today.png") });

  await page.click("button.card:has-text('Ana Lopez')");
  await page.waitForSelector(".drawer h2:has-text('Ana Lopez')");
  const okToCall = await page.isVisible("text=OK to call or text now");
  const quiet = await page.isVisible("text=Calls and texts are only allowed");
  assert.ok(okToCall || quiet, "phone status is shown");
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "dashboard-lead.png") });
  await page.selectOption(".drawer select[aria-label='What you did']", "Call");
  await page.selectOption(".drawer select[aria-label='Result']", "Talked");
  await page.fill(".drawer textarea[aria-label='Notes']", "Wants to see homes Saturday");
  await page.click(".drawer button:has-text('Save'):not(:has-text('details'))");
  await page.waitForSelector(".timeline :text('Wants to see homes Saturday')");
  assert.strictEqual(g.table("Leads").find(l => l.Name === "Ana Lopez").Stage, "Contacted");
  await page.click(".drawer header button[aria-label=Close]");

  await page.click("button.card:has-text('Old Contact')");
  await page.waitForSelector("text=Do not call or text right now");
  assert.ok(await page.isVisible("text=Record your Do Not Call Registry check"));
  assert.strictEqual(await page.getAttribute(".drawer a:has-text('Call')", "aria-disabled"), "true");
  await page.click(".drawer header button[aria-label=Close]");

  await page.click("button[data-view=campaigns]");
  await page.selectOption("select[aria-label=Template]", "listings");
  await page.click("text=Preview who gets it");
  await page.waitForSelector("text=Will receive it");
  assert.ok(await page.isVisible(".status.no:has-text('postal address')"));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "dashboard-campaign.png") });

  for (const v of ["leads", "pipeline", "reports", "rules"]) {
    await page.click(`button[data-view=${v}]`);
    await page.waitForTimeout(100);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `dashboard-${v}.png`) });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click("button[data-view=today]");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.strictEqual(overflow, false, "no sideways scrolling on a phone");
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "dashboard-phone.png") });
  assert.deepStrictEqual(errors, []);
});
