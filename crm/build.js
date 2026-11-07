// Builds LeadCRM.gs: the whole CRM in one file (dashboard included), so setup is a single paste.
// Run after changing any crm file:  node crm/build.js
const fs = require("fs");
const path = require("path");
const read = f => fs.readFileSync(path.join(__dirname, f), "utf8");
const code = read("Code.gs").replace(/HtmlService\.createHtmlOutputFromFile\('Dashboard'\)/g, "HtmlService.createHtmlOutput(DASHBOARD_HTML)");
const out = [
  "/**\n * Lead CRM, all in one file. Generated from the files in crm/ by crm/build.js; edit those, not this.\n * Setup: crm/README.md.\n */\n",
  read("Config.gs"), read("Rules.gs"), code,
  "\n// The dashboard screen (crm/Dashboard.html).\nvar DASHBOARD_HTML = " + JSON.stringify(read("Dashboard.html")) + ";\n"
].join("\n");
fs.writeFileSync(path.join(__dirname, "LeadCRM.gs"), out);
console.log("Wrote crm/LeadCRM.gs (" + Math.round(out.length / 1024) + " KB)");
