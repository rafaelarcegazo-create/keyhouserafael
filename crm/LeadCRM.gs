/**
 * Lead CRM, all in one file. Generated from the files in crm/ by crm/build.js; edit those, not this.
 * Setup: crm/README.md.
 */

/**
 * Settings and fixed lists for the lead system.
 * Everything here can be changed from the "Settings" tab of the spreadsheet; these are only the starting values.
 */

var DEFAULTS = {
  agentName: 'Rafael Arce Gazo',
  agentTitle: 'REALTOR®',
  brokerage: 'DH Capital Realty',
  license: 'S.0195953',
  phone: '(702) 335-4952',
  email: 'rafaelarcegazo@gmail.com',
  website: 'https://keyhouserafael.realtor',
  postalAddress: '',          // Required by CAN-SPAM in every marketing email. Use the brokerage's street address or a PO box.
  webAppUrl: '',              // The /exec link from Deploy > Manage deployments. Used for unsubscribe links.
  timeZone: 'America/Los_Angeles',
  quietStart: 8,              // Calls and texts allowed from 8am ...
  quietEnd: 21,               // ... until 9pm, in the lead's local time (TCPA, 47 CFR 64.1200(c)(1)).
  digestHour: 7,              // Daily follow-up email arrives at 7am.
  alertEmail: '',             // Where new-lead alerts go. Blank = the Google account that owns the sheet.
  autoReply: 'Yes',           // Send new web leads an instant "got your message" email.
  teamEmails: ''              // Other Google accounts allowed to open the dashboard, comma separated.
};

var SETTING_HELP = {
  agentName: 'Your name as it appears in emails',
  agentTitle: 'Shown after your name',
  brokerage: 'Brokerage name. Nevada requires it in all advertising (NAC 645.610)',
  license: 'Your Nevada license number',
  phone: 'Your phone number shown in emails',
  email: 'Reply-to address for emails',
  website: 'Your website',
  postalAddress: 'REQUIRED before sending campaigns: a valid physical postal address (CAN-SPAM). Ask your broker which to use',
  webAppUrl: 'Paste the Web app URL (ends in /exec) after you deploy. Needed for unsubscribe links',
  timeZone: 'Time zone for follow-ups and calling hours',
  quietStart: 'Earliest hour (0-23) for calls/texts',
  quietEnd: 'Calls/texts must end before this hour (0-23)',
  digestHour: 'Hour (0-23) the daily follow-up email is sent',
  alertEmail: 'Where new-lead alerts go (blank = sheet owner)',
  autoReply: 'Yes = new web leads get an instant thank-you email',
  teamEmails: 'Other Google accounts allowed to open the dashboard (comma separated)'
};

var STAGES = ['New', 'Contacted', 'Nurture', 'Appointment', 'Active client', 'Under contract', 'Closed', 'Lost'];
var GOALS = ['buy', 'sell', 'invest', 'rent', 'other'];
var SOURCES = ['Website', 'Open house', 'Referral', 'Past client', 'Sign call', 'Social media', 'Zillow', 'Realtor.com', 'Event', 'Sphere', 'Other'];
var ACTIVITY_TYPES = ['Call', 'Text', 'Email', 'Meeting', 'Showing', 'Note'];
var OUTCOMES = ['Talked', 'Left voicemail', 'No answer', 'Replied', 'Sent', 'Appointment set', 'Not interested'];

// Days to wait between attempts while a new lead has not answered: day 1, 3, 7, 14, 28.
var NEW_LEAD_STEPS = [1, 2, 4, 7, 14];

// Wording shown next to the website checkboxes. Saved with every consent so you can prove what the person agreed to.
var CONSENT_VERSION = 'web-2026-10';
var CONSENT_TEXT = {
  email: {
    en: 'Email me new listings, market updates and tips. I can unsubscribe at any time.',
    es: 'Envíenme por correo propiedades nuevas, noticias del mercado y consejos. Puedo darme de baja en cualquier momento.'
  },
  phone: {
    en: 'I agree that Rafael Arce Gazo, REALTOR® with DH Capital Realty, may call and text me about real estate at the phone number I entered, including with automated technology. Consent is not a condition of any purchase or service. Message and data rates may apply. Reply STOP to opt out.',
    es: 'Acepto que Rafael Arce Gazo, REALTOR® de DH Capital Realty, me llame y me envíe mensajes de texto sobre bienes raíces al teléfono que escribí, incluso con tecnología automatizada. Dar mi consentimiento no es condición para ninguna compra o servicio. Pueden aplicar cargos por mensajes y datos. Responde STOP para cancelar.'
  }
};

var LEAD_FIELDS = [
  ['id', 'ID'], ['created', 'Created'], ['updated', 'Updated'],
  ['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'], ['language', 'Language'],
  ['goal', 'Goal'], ['area', 'Area'], ['price', 'Price range'], ['timeline', 'Timeline'],
  ['source', 'Source'], ['stage', 'Stage'], ['temperature', 'Temperature'],
  ['nextFollowUp', 'Next follow-up'], ['lastContact', 'Last contact'], ['attempts', 'Attempts'],
  ['firstResponse', 'First response'], ['lastInquiry', 'Last inquiry'], ['closedOn', 'Closed on'],
  ['hasAgent', 'Has another agent'],
  ['emailConsent', 'Email consent'], ['emailConsentAt', 'Email consent date'],
  ['phoneConsent', 'Call/text consent'], ['phoneConsentAt', 'Call/text consent date'],
  ['unsubscribed', 'Unsubscribed'], ['phoneOptOut', 'No calls/texts'],
  ['dncCheckedOn', 'DNC checked on'], ['onDnc', 'On National DNC'],
  ['tags', 'Tags'], ['message', 'First message'], ['notes', 'Notes'], ['referredBy', 'Referred by'],
  ['token', 'Unsubscribe key'],
  ['closedYear', 'Year closed']   // New columns go at the end so existing sheets keep their data in place.
];

// Past deals can be recorded from this year up to the current year.
var FIRST_CLOSED_YEAR = 2022;
var DATE_FIELDS = ['created', 'updated', 'nextFollowUp', 'lastContact', 'firstResponse', 'lastInquiry', 'closedOn', 'emailConsentAt', 'phoneConsentAt', 'dncCheckedOn'];

var ACTIVITY_FIELDS = [['id', 'ID'], ['leadId', 'Lead ID'], ['when', 'When'], ['type', 'Type'], ['outcome', 'Outcome'], ['details', 'Details'], ['by', 'By']];
var CONSENT_FIELDS = [['when', 'When'], ['leadId', 'Lead ID'], ['email', 'Email'], ['phone', 'Phone'], ['event', 'Event'], ['source', 'Source'], ['wording', 'Exact wording'], ['version', 'Version'], ['page', 'Page'], ['userAgent', 'Browser']];
var SUPPRESSION_FIELDS = [['when', 'When'], ['email', 'Email'], ['phone', 'Phone'], ['channel', 'Channel'], ['reason', 'Reason']];
var TEMPLATE_FIELDS = [['key', 'Key'], ['channel', 'Channel'], ['kind', 'Kind'], ['language', 'Language'], ['name', 'Name'], ['subject', 'Subject'], ['body', 'Body']];

var DEFAULT_TEMPLATES = [
  ['welcome', 'email', 'personal', 'en', 'Auto-reply to new web leads', 'Thanks, {{firstName}}, I got your message',
    'Hi {{firstName}},\n\nThank you for reaching out. I received your message about {{goalText}} and I will get back to you personally very soon, usually within the hour during the day.\n\nIf it is urgent, call or text me at {{agentPhone}}.\n\nTalk soon,\n{{agentName}}'],
  ['welcome', 'email', 'personal', 'es', 'Respuesta automática a nuevos contactos', 'Gracias, {{firstName}}, recibí tu mensaje',
    'Hola {{firstName}}:\n\nGracias por escribirme. Recibí tu mensaje sobre {{goalText}} y te responderé personalmente muy pronto, normalmente en menos de una hora durante el día.\n\nSi es urgente, llámame o escríbeme al {{agentPhone}}.\n\nHasta pronto,\n{{agentName}}'],
  ['checkin', 'email', 'personal', 'en', 'Personal check-in', 'Checking in, {{firstName}}',
    'Hi {{firstName}},\n\nI wanted to check in on your plans for {{goalText}}. Has anything changed, or is there anything I can look up for you?\n\nI am happy to answer any question, big or small.\n\n{{agentName}}\n{{agentPhone}}'],
  ['checkin', 'email', 'personal', 'es', 'Seguimiento personal', '¿Cómo vas, {{firstName}}?',
    'Hola {{firstName}}:\n\nQuería saber cómo van tus planes para {{goalText}}. ¿Ha cambiado algo o hay algo que pueda buscar por ti?\n\nCon gusto respondo cualquier pregunta, grande o pequeña.\n\n{{agentName}}\n{{agentPhone}}'],
  ['listings', 'email', 'marketing', 'en', 'New listings offer', 'New homes in {{area}} this week',
    'Hi {{firstName}},\n\nNew homes came on the market in {{area}} this week. Reply with your price range and must-haves and I will send you the ones that fit, with my honest notes on each.\n\n{{agentName}}\n{{agentPhone}}'],
  ['listings', 'email', 'marketing', 'es', 'Oferta de casas nuevas', 'Casas nuevas en {{area}} esta semana',
    'Hola {{firstName}}:\n\nEsta semana salieron casas nuevas al mercado en {{area}}. Respóndeme con tu presupuesto y lo que necesitas y te envío las que encajan, con mis comentarios honestos de cada una.\n\n{{agentName}}\n{{agentPhone}}'],
  ['homevalue', 'email', 'marketing', 'en', 'Home value offer', 'What is your home worth today?',
    'Hi {{firstName}},\n\nHome values in the Las Vegas valley keep moving. If you would like to know what your home could sell for today, reply to this email and I will prepare a free, no-obligation market analysis for you.\n\n{{agentName}}\n{{agentPhone}}'],
  ['homevalue', 'email', 'marketing', 'es', 'Oferta de valor de la casa', '¿Cuánto vale tu casa hoy?',
    'Hola {{firstName}}:\n\nLos precios en el valle de Las Vegas siguen cambiando. Si quieres saber en cuánto podrías vender tu casa hoy, responde este correo y te preparo un análisis de mercado gratis y sin compromiso.\n\n{{agentName}}\n{{agentPhone}}'],
  ['pastclient', 'email', 'marketing', 'en', 'Past client check-in', 'Thinking of you, {{firstName}}',
    'Hi {{firstName}},\n\nI hope you are enjoying your home. I am always here if you need a contractor recommendation, a property tax question answered, or an update on what homes near you are selling for.\n\n{{agentName}}\n{{agentPhone}}'],
  ['pastclient', 'email', 'marketing', 'es', 'Seguimiento a clientes anteriores', 'Pensando en ti, {{firstName}}',
    'Hola {{firstName}}:\n\nEspero que estés disfrutando tu casa. Siempre estoy aquí si necesitas la recomendación de un contratista, ayuda con una pregunta sobre impuestos de propiedad o saber en cuánto se venden las casas cerca de ti.\n\n{{agentName}}\n{{agentPhone}}'],
  ['referral', 'email', 'marketing', 'en', 'Referral request', 'A small favor, {{firstName}}',
    'Hi {{firstName}},\n\nMost of my business comes from people like you. If a friend, family member or coworker is thinking about buying, selling or investing in the Las Vegas valley, I would be grateful for an introduction. I will take great care of them, in English or Spanish.\n\nThank you,\n{{agentName}}\n{{agentPhone}}'],
  ['referral', 'email', 'marketing', 'es', 'Pedir recomendaciones', 'Un pequeño favor, {{firstName}}',
    'Hola {{firstName}}:\n\nLa mayoría de mis clientes llegan por recomendación de personas como tú. Si algún amigo, familiar o compañero de trabajo piensa comprar, vender o invertir en el valle de Las Vegas, te agradecería mucho que me lo presentes. Lo atenderé con mucho cuidado, en español o en inglés.\n\nGracias,\n{{agentName}}\n{{agentPhone}}'],
  ['first', 'text', 'personal', 'en', 'First text to a new lead', '',
    'Hi {{firstName}}, this is {{agentName}}, Realtor with {{brokerage}}. I got your request about {{goalText}}. Is now a good time for a quick call? Reply STOP to opt out.'],
  ['first', 'text', 'personal', 'es', 'Primer mensaje a un contacto nuevo', '',
    'Hola {{firstName}}, soy {{agentName}}, Realtor de {{brokerage}}. Recibí tu solicitud sobre {{goalText}}. ¿Tienes un momento para una llamada rápida? Responde STOP para no recibir más mensajes.'],
  ['followup', 'text', 'personal', 'en', 'Follow-up text', '',
    'Hi {{firstName}}, {{agentName}} with {{brokerage}} here. Just checking in on your plans for {{goalText}}. Anything I can help with this week? Reply STOP to opt out.'],
  ['followup', 'text', 'personal', 'es', 'Mensaje de seguimiento', '',
    'Hola {{firstName}}, soy {{agentName}} de {{brokerage}}. Solo quería saber cómo van tus planes para {{goalText}}. ¿Te ayudo con algo esta semana? Responde STOP para no recibir más mensajes.'],
  ['appt', 'text', 'personal', 'en', 'Appointment confirmation', '',
    'Hi {{firstName}}, {{agentName}} here. Confirming our appointment. Reply here or call {{agentPhone}} if anything changes. Reply STOP to opt out.'],
  ['appt', 'text', 'personal', 'es', 'Confirmación de cita', '',
    'Hola {{firstName}}, soy {{agentName}}. Te confirmo nuestra cita. Escríbeme aquí o llama al {{agentPhone}} si algo cambia. Responde STOP para no recibir más mensajes.']
];

var GOAL_TEXT = {
  en: { buy: 'buying a home', sell: 'selling your home', invest: 'investing in real estate', rent: 'renting a home', other: 'real estate' },
  es: { buy: 'comprar una casa', sell: 'vender tu casa', invest: 'invertir en bienes raíces', rent: 'rentar una casa', other: 'bienes raíces' }
};

/**
 * Follow-up schedule and contact-permission rules.
 * These functions only read the lead and the clock, so they are easy to test and to explain.
 *
 * The rules are a practical summary of U.S. federal law (TCPA / FCC Do-Not-Call rules and CAN-SPAM),
 * not legal advice. Ask your broker to confirm how your brokerage wants them applied.
 */

var DAY = 24 * 60 * 60 * 1000;

function isYes_(v) { return v === true || /^(yes|y|true|1|sí|si)$/i.test(String(v || '').trim()); }
function toDate_(v) { if (!v) return null; var d = v instanceof Date ? v : new Date(v); return isNaN(d) ? null : d; }
function addDays_(d, n) { return new Date(d.getTime() + n * DAY); }

/** When the deal closed: the exact closing date, or Jan 1 of the year closed when only the year is known. */
function closedStart_(lead) {
  var d = toDate_(lead.closedOn);
  if (d) return { date: d, exact: true };
  var y = Number(lead.closedYear);
  return y ? { date: new Date(y, 0, 1), exact: false, year: y } : null;
}
function phoneDigits_(p) { var d = String(p || '').replace(/\D/g, ''); return d.length === 11 && d[0] === '1' ? d.slice(1) : d; }

/** When to reach out next, after the lead's latest touch. Returns a Date, or null for no more follow-up. */
function suggestNextFollowUp(lead, now) {
  var attempts = Number(lead.attempts) || 0;
  switch (lead.stage) {
    case 'New':
      if (attempts === 0) return now;                       // Speed to lead: reach out right away.
      if (attempts <= NEW_LEAD_STEPS.length) return addDays_(now, NEW_LEAD_STEPS[attempts - 1]);
      return addDays_(now, 30);                             // Still no answer after 6 tries: monthly nurture.
    case 'Contacted': return addDays_(now, 2);
    case 'Nurture': return addDays_(now, { Hot: 7, Cold: 60 }[lead.temperature] || 30);
    case 'Appointment': return addDays_(now, 1);
    case 'Active client':
    case 'Under contract': return addDays_(now, 3);
    case 'Closed':
      var closed = toDate_(lead.closedOn);   // Only an exact date can be 30 days ago.
      if (closed && now - closed < 30 * DAY) return addDays_(closed, 30);
      return addDays_(now, 90);                             // Past clients: a personal touch every quarter.
    default: return null;                                   // Lost or unknown: no more reminders.
  }
}

/** The relationship that lets you call a number on the National DNC list (47 CFR 64.1200(f)(5)). */
function relationship_(lead, now) {
  var inquiry = toDate_(lead.lastInquiry), c = closedStart_(lead);
  // With only the year known, count from Jan 1 so the 18 months never run longer than they really do.
  if (c && now - c.date <= 548 * DAY) return { until: addDays_(c.date, 548), why: 'closed a transaction with you ' + (c.exact ? 'on ' + fmtDay_(c.date) : 'in ' + c.year + ' (counted from Jan 1, since the exact date is not saved)') + ' (18 months)' };
  if (inquiry && now - inquiry <= 90 * DAY) return { until: addDays_(inquiry, 90), why: 'asked you about real estate on ' + fmtDay_(inquiry) + ' (3 months)' };
  return null;
}

/**
 * May I call or text this lead right now?
 * { ok, basis, reasons[] (why not), warnings[] (allowed, but be careful) }
 */
function phoneCheck(lead, now, s) {
  var res = { ok: false, basis: '', reasons: [], warnings: [] };
  if (phoneDigits_(lead.phone).length < 10) { res.reasons.push('No valid phone number.'); return res; }
  if (isYes_(lead.phoneOptOut)) { res.reasons.push('They asked not to be called or texted. They are on your internal do-not-call list. Do not contact them by phone.'); return res; }

  var rel = relationship_(lead, now), dncAt = toDate_(lead.dncCheckedOn);
  if (isYes_(lead.phoneConsent)) {
    res.basis = 'Written consent to calls and texts' + (toDate_(lead.phoneConsentAt) ? ' on ' + fmtDay_(toDate_(lead.phoneConsentAt)) : '') + '.';
  } else if (rel) {
    res.basis = 'Business relationship: they ' + rel.why + '. Allowed until ' + fmtDay_(rel.until) + ' unless they ask you to stop.';
    res.warnings.push('Manual calls and one-to-one texts only. Automated or mass texting needs their written consent.');
  } else if (dncAt && now - dncAt <= 31 * DAY && lead.onDnc === 'No') {
    res.basis = 'Not on the National Do Not Call Registry (checked ' + fmtDay_(dncAt) + ').';
    res.warnings.push('Manual calls and one-to-one texts only. Re-check the registry every 31 days.');
  } else if (lead.onDnc === 'Yes') {
    res.reasons.push('This number is on the National Do Not Call Registry and there is no written consent or recent business relationship.');
  } else {
    res.reasons.push('No written consent and no recent business relationship. Check the number on the National Do Not Call Registry first (telemarketing.donotcall.gov, or your brokerage\'s scrub service), then record the result.');
  }

  var hour = Number(Utilities.formatDate(now, s.timeZone, 'H'));
  if (hour < Number(s.quietStart) || hour >= Number(s.quietEnd)) {
    res.reasons.push('It is ' + Utilities.formatDate(now, s.timeZone, 'h:mm a') + ' in their time zone. Calls and texts are only allowed from ' + hourLabel_(s.quietStart) + ' to ' + hourLabel_(s.quietEnd) + '.');
  }
  if (isYes_(lead.hasAgent)) res.warnings.push('They said they already work with another agent. Do not solicit their business (REALTOR® Code of Ethics, Article 16). Talk only about what they ask.');
  res.ok = res.reasons.length === 0;
  return res;
}

/** May I send this lead an email of this kind ("personal" or "marketing")? */
function emailCheck(lead, kind, now) {
  var res = { ok: false, basis: '', reasons: [], warnings: [] };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(lead.email || ''))) { res.reasons.push('No valid email address.'); return res; }
  if (isYes_(lead.unsubscribed)) { res.reasons.push('They unsubscribed from email. Only reply if they write to you first.'); return res; }
  if (isYes_(lead.emailConsent)) res.basis = 'They asked to receive emails' + (toDate_(lead.emailConsentAt) ? ' on ' + fmtDay_(toDate_(lead.emailConsentAt)) : '') + '.';
  else if (toDate_(lead.lastInquiry) || closedStart_(lead)) res.basis = 'They contacted you or worked with you.';
  else if (kind === 'marketing') { res.reasons.push('No email permission and they never contacted you. Get their permission before adding them to campaigns.'); return res; }
  else res.basis = 'One-to-one email.';
  if (kind === 'marketing') res.warnings.push('Your address and an unsubscribe link are added automatically.');
  if (isYes_(lead.hasAgent) && kind === 'marketing') { res.reasons.push('They work with another agent (Code of Ethics, Article 16). Leave them out of campaigns.'); }
  res.ok = res.reasons.length === 0;
  return res;
}

function hourLabel_(h) { h = Number(h); return (h % 12 || 12) + (h < 12 ? 'am' : 'pm'); }
function fmtDay_(d) { return Utilities.formatDate(d, settings_().timeZone, 'MMM d, yyyy'); }

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
  var html = HtmlService.createHtmlOutput(DASHBOARD_HTML).setWidth(1280).setHeight(860);
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
  yearDropdown_();

  installTriggers();
  CACHE.settings = null;
  try { SpreadsheetApp.getUi().alert('Lead CRM is ready.\n\nNext: fill in "postalAddress" on the Settings tab, then deploy the web app (see README).'); } catch (e) { /* run from the editor */ }
}

function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (['dailyDigest', 'onSheetEdit'].indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t);
  });
  var s = settings_();
  ScriptApp.newTrigger('dailyDigest').timeBased().atHour(Number(s.digestHour) || 7).everyDays(1).inTimezone(s.timeZone).create();
  ScriptApp.newTrigger('onSheetEdit').forSpreadsheet(ss_()).onEdit().create();
}

/** "Year closed" column in the sheet: a dropdown from 2022 to this year. Refreshed daily so a new year appears on Jan 1. */
function yearDropdown_() {
  var leads = sheet_('Leads'), col = fieldIndex_(LEAD_FIELDS, 'closedYear') + 1;
  var years = closedYears_(new Date()).map(String);
  leads.getRange(2, col, leads.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(years, true).setAllowInvalid(false).build());
}

/** Changing Stage to "Closed" right in the sheet asks for the year, the same as the dashboard does. */
function onSheetEdit(e) {
  var r = e && e.range;
  if (!r || r.getSheet().getName() !== 'Leads' || r.getRow() < 2 || r.getNumRows() > 1 || r.getNumColumns() > 1) return;
  if (r.getColumn() !== fieldIndex_(LEAD_FIELDS, 'stage') + 1 || e.value !== 'Closed') return;
  var sh = r.getSheet(), row = r.getRow();
  var cell = function (k) { return sh.getRange(row, fieldIndex_(LEAD_FIELDS, k) + 1); };
  if (cell('closedYear').getValue() || !cell('id').getValue()) return;
  var id = String(cell('id').getValue()), name = String(cell('name').getValue() || 'this lead');
  var years = closedYears_(new Date());
  var html = '<div style="font:15px Arial,sans-serif;color:#22201d">' +
    '<p style="margin:0 0 12px">What year did the deal with <b>' + esc_(name) + '</b> close?</p>' +
    '<select id="y" style="font:16px Arial;padding:6px;width:100%">' + years.map(function (y) { return '<option>' + y + '</option>'; }).join('') + '</select>' +
    '<p style="margin:16px 0 0"><button id="s" style="font:600 15px Arial;padding:8px 18px;background:#22201d;color:#fff;border:0;border-radius:6px;cursor:pointer">Save</button> ' +
    '<button onclick="google.script.host.close()" style="font:15px Arial;padding:8px 14px;border:1px solid #ccc;background:#fff;border-radius:6px;cursor:pointer">Later</button></p>' +
    '<p style="color:#7a746b;font-size:13px">You can also type the exact date in the "Closed on" column for an anniversary reminder.</p></div>' +
    '<script>document.getElementById("s").onclick=function(){this.disabled=true;google.script.run.withSuccessHandler(function(){google.script.host.close()})' +
    '.withFailureHandler(function(e){alert(e.message)}).setClosedYearFromSheet(' + JSON.stringify(id) + ',document.getElementById("y").value)}</script>';
  try {
    SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(360).setHeight(230), 'Year closed');
  } catch (err) {
    ss_().toast('Pick the year it closed in the "Year closed" column.', 'Deal closed', 10);
  }
}

function setClosedYearFromSheet(id, year) {
  if (!isAllowedUser_()) throw new Error('You do not have access to this CRM.');
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var lead = findLead_(id), now = new Date(), y = Number(year);
    if (!(y >= FIRST_CLOSED_YEAR && y <= now.getFullYear())) throw new Error('Pick a year from ' + FIRST_CLOSED_YEAR + ' to ' + now.getFullYear() + '.');
    lead.closedYear = y;
    if (toDate_(lead.closedOn) && toDate_(lead.closedOn).getFullYear() !== y) lead.closedOn = '';
    lead.nextFollowUp = suggestNextFollowUp(lead, now) || '';
    saveLead_(lead);
  } finally { lock.releaseLock(); }
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
    return HtmlService.createHtmlOutput(DASHBOARD_HTML).setTitle('Lead CRM')
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

function closedYears_(now) {
  var years = [];
  for (var y = now.getFullYear(); y >= FIRST_CLOSED_YEAR; y--) years.push(y);
  return years;
}

function setupWarnings_() {
  var s = settings_(), w = [];
  if (!s.postalAddress) w.push('Add your postal address on the Settings tab. The law requires it in every marketing email, so campaigns are off until it is filled in.');
  if (!s.webAppUrl) w.push('Paste your web app link (ending in /exec) into "webAppUrl" on the Settings tab so unsubscribe links work.');
  var handlers = ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); });
  if (handlers.indexOf('dailyDigest') < 0 || handlers.indexOf('onSheetEdit') < 0) w.push('Reminders are not fully set up (daily email or the year-closed question in the sheet). Run Lead CRM > Set up or repair.');
  return w;
}

var API = {
  bootstrap: function () {
    var now = new Date(), s = settings_();
    return {
      leads: leads_().map(function (l) { return leadView_(l, now); }),
      templates: templates_().map(function (t) { return { key: t.key, channel: t.channel, kind: t.kind, language: t.language, name: t.name, subject: t.subject, body: t.body }; }),
      settings: { agentName: s.agentName, brokerage: s.brokerage, phone: s.phone, timeZone: s.timeZone, quietStart: s.quietStart, quietEnd: s.quietEnd },
      lists: { closedYears: closedYears_(now), stages: STAGES, goals: GOALS, sources: SOURCES, types: ACTIVITY_TYPES, outcomes: OUTCOMES },
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
    if (p.closedYear !== undefined) {
      var year = Number(p.closedYear) || '';
      if (year && (year < FIRST_CLOSED_YEAR || year > now.getFullYear())) throw new Error('Pick a year from ' + FIRST_CLOSED_YEAR + ' to ' + now.getFullYear() + '.');
      lead.closedYear = year;
      // A date from a different year no longer matches what you picked.
      if (toDate_(lead.closedOn) && toDate_(lead.closedOn).getFullYear() !== year) lead.closedOn = '';
    }
    if (p.closedOn !== undefined) lead.closedOn = toDate_(p.closedOn) || '';
    if (toDate_(lead.closedOn)) lead.closedYear = toDate_(lead.closedOn).getFullYear();
    if (p.stage && STAGES.indexOf(p.stage) >= 0 && p.stage !== lead.stage) {
      lead.stage = p.stage;
      if (p.stage === 'Closed' && !toDate_(lead.closedOn) && !lead.closedYear) { lead.closedOn = now; lead.closedYear = now.getFullYear(); }
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
    return API.getLead({ id: lead.id }); // The lead panel redraws from this, history included.
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
    if (f.closedYear && String(l.closedYear) !== String(f.closedYear)) return;
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
  try { yearDropdown_(); } catch (e) { console.error('year dropdown', e); }
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


// The dashboard screen (crm/Dashboard.html).
var DASHBOARD_HTML = "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<base target=\"_blank\">\n<title>Lead CRM</title>\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap\">\n<style>\n:root{\n  --bone:#f6f4f0;--white:#fff;--sand:#e9e4dc;--stone:#7a746b;--line:#e2ddd5;--ink:#22201d;--ink-2:#4a4640;\n  --bronze:#9c7a4f;--ok:#2f6b45;--ok-bg:#e7f1ea;--warn:#8a5a12;--warn-bg:#fbf1dd;--bad:#9b2c2c;--bad-bg:#f8e6e4;\n  --sans:\"Figtree\",\"Helvetica Neue\",Arial,system-ui,sans-serif;color-scheme:light;\n}\n*{box-sizing:border-box}\n[hidden]{display:none!important}\nbody{margin:0;background:var(--bone);color:var(--ink);font:15px/1.5 var(--sans)}\nbutton,input,select,textarea{font:inherit;color:inherit}\nh1,h2,h3{margin:0;font-weight:600}\na{color:inherit}\n.top{position:sticky;top:0;z-index:5;background:var(--white);border-bottom:1px solid var(--line)}\n.top .in{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;padding:10px 16px}\n.brand{font-weight:700;font-size:17px;margin-right:auto}\n.brand small{display:block;font-weight:500;font-size:12px;color:var(--stone)}\n.tabs{display:flex;gap:4px;overflow-x:auto;padding:0 12px;scrollbar-width:none}\n.tabs button{border:0;background:none;padding:10px 12px;border-bottom:2px solid transparent;font-weight:600;color:var(--stone);cursor:pointer;white-space:nowrap}\n.tabs button[aria-selected=\"true\"]{color:var(--ink);border-color:var(--bronze)}\n.tabs .n{display:inline-block;min-width:20px;padding:0 6px;margin-left:6px;border-radius:999px;background:var(--sand);font-size:12px;color:var(--ink)}\n.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--line);background:var(--white);border-radius:6px;padding:8px 14px;font-weight:600;cursor:pointer;text-decoration:none;white-space:nowrap}\n.btn:hover{border-color:var(--ink)}\n.btn.dark{background:var(--ink);border-color:var(--ink);color:#fff}\n.btn.small{padding:5px 10px;font-size:13px}\n.btn[disabled],.btn[aria-disabled=\"true\"]{opacity:.45;cursor:not-allowed;pointer-events:none}\n.btn.danger{color:var(--bad)}\nmain{padding:16px;max-width:1240px;margin:0 auto}\n.banner{background:var(--warn-bg);color:var(--warn);border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:14px}\n.banner p{margin:2px 0}\n.groups{display:grid;gap:16px}\n.group h2{font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:var(--stone);margin:6px 0 8px}\n.group h2 .n{color:var(--ink)}\n.cards{display:grid;gap:8px}\n.card{display:grid;grid-template-columns:1fr auto;gap:4px 12px;align-items:center;background:var(--white);border:1px solid var(--line);border-radius:8px;padding:12px 14px;cursor:pointer;text-align:left;width:100%}\n.card:hover{border-color:var(--ink)}\n.card b{font-size:16px}\n.card .meta{color:var(--stone);font-size:13.5px;grid-column:1}\n.card .when{font-size:13px;font-weight:600;text-align:right}\n.when.late{color:var(--bad)}.when.now{color:var(--bronze)}\n.empty{color:var(--stone);background:var(--white);border:1px dashed var(--line);border-radius:8px;padding:14px}\n.pill{display:inline-block;padding:1px 8px;border-radius:999px;background:var(--sand);font-size:12px;font-weight:600;color:var(--ink-2)}\n.pill.hot{background:var(--bad-bg);color:var(--bad)}.pill.cold{background:#e6ecf2;color:#34506b}\n.bar{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;align-items:center}\n.bar input,.bar select{border:1px solid var(--line);border-radius:6px;padding:8px 10px;background:var(--white);min-width:0}\n.bar input[type=search]{flex:1 1 220px}\n.tablewrap{overflow-x:auto;background:var(--white);border:1px solid var(--line);border-radius:8px}\ntable{border-collapse:collapse;width:100%;min-width:640px}\nth,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}\nth{font-size:12.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--stone);font-weight:600;background:var(--bone)}\ntbody tr{cursor:pointer}tbody tr:hover{background:var(--bone)}\ntd.num,th.num{text-align:right;font-variant-numeric:tabular-nums}\n.board{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(220px,1fr);gap:10px;overflow-x:auto;padding-bottom:8px}\n.col{background:var(--sand);border-radius:8px;padding:8px;display:grid;gap:6px;align-content:start;min-height:200px}\n.col h3{font-size:13px;padding:4px 4px 2px;display:flex;justify-content:space-between}\n.col .card{grid-template-columns:1fr;padding:9px 10px}\n.col .card b{font-size:14.5px}\n.panel{background:var(--white);border:1px solid var(--line);border-radius:8px;padding:16px;display:grid;gap:12px;align-content:start}\n.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}\n.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}\n.stat{background:var(--white);border:1px solid var(--line);border-radius:8px;padding:12px 14px}\n.stat span{display:block;color:var(--stone);font-size:13px}.stat b{font-size:26px;font-weight:600}\nlabel.f{display:grid;gap:4px;font-weight:600;font-size:13px;min-width:0}\nlabel.f input,label.f select,label.f textarea{border:1px solid var(--line);border-radius:6px;padding:8px 10px;background:var(--white);font-weight:400;font-size:15px;width:100%}\ntextarea{min-height:90px;resize:vertical}\n.form{display:grid;grid-template-columns:1fr 1fr;gap:10px}\n.form .full{grid-column:1/-1}\n.check{display:flex;gap:8px;align-items:flex-start;font-size:14px}\n.check input{margin-top:4px}\n.hint{color:var(--stone);font-size:13px;font-weight:400}\n.status{border-radius:8px;padding:10px 12px;font-size:14px}\n.status.ok{background:var(--ok-bg);color:var(--ok)}.status.no{background:var(--bad-bg);color:var(--bad)}\n.status b{display:block}\n.status ul{margin:4px 0 0;padding-left:18px}\n.warnlist{background:var(--warn-bg);color:var(--warn);border-radius:8px;padding:8px 12px;font-size:13.5px;margin:0;list-style:none}\n/* Lead drawer */\n.scrim{position:fixed;inset:0;background:rgba(34,32,29,.35);z-index:20;display:flex;justify-content:flex-end}\n.drawer{background:var(--bone);width:min(760px,100%);height:100%;overflow-y:auto;box-shadow:-8px 0 30px rgba(0,0,0,.15)}\n.drawer header{position:sticky;top:0;background:var(--white);border-bottom:1px solid var(--line);padding:12px 16px;display:flex;gap:10px;align-items:center;z-index:2}\n.drawer header h2{font-size:20px;margin-right:auto;overflow-wrap:anywhere}\n.drawer .body{padding:16px;display:grid;gap:14px}\n.actions{display:flex;flex-wrap:wrap;gap:8px}\n.timeline{list-style:none;margin:0;padding:0;display:grid;gap:8px}\n.timeline li{border-left:2px solid var(--line);padding:2px 0 2px 12px}\n.timeline .t{font-size:12.5px;color:var(--stone)}\n.timeline .d{white-space:pre-wrap;overflow-wrap:anywhere}\n.modal{background:var(--white);border-radius:10px;width:min(620px,calc(100% - 32px));margin:auto;max-height:calc(100% - 32px);overflow-y:auto;padding:18px;display:grid;gap:12px}\n.scrim.center{justify-content:center;align-items:center}\n.toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:var(--ink);color:#fff;padding:10px 16px;border-radius:8px;z-index:50;max-width:calc(100% - 32px)}\n.toast.err{background:var(--bad)}\n.loading{padding:40px;text-align:center;color:var(--stone)}\ndetails summary{cursor:pointer;font-weight:600}\n@media (max-width:720px){.grid2,.form{grid-template-columns:1fr}.card{grid-template-columns:1fr}.card .when{text-align:left}main{padding:12px}}\n</style>\n</head>\n<body>\n<div class=\"top\">\n  <div class=\"in\">\n    <div class=\"brand\">Lead CRM<small id=\"who\"></small></div>\n    <button type=\"button\" class=\"btn\" id=\"refresh\">Refresh</button>\n    <button type=\"button\" class=\"btn dark\" id=\"add\">+ Add lead</button>\n  </div>\n  <nav class=\"tabs\" role=\"tablist\">\n    <button role=\"tab\" data-view=\"today\" aria-selected=\"true\">Today<span class=\"n\" id=\"n-today\">0</span></button>\n    <button role=\"tab\" data-view=\"leads\" aria-selected=\"false\">All leads<span class=\"n\" id=\"n-all\">0</span></button>\n    <button role=\"tab\" data-view=\"pipeline\" aria-selected=\"false\">Pipeline</button>\n    <button role=\"tab\" data-view=\"campaigns\" aria-selected=\"false\">Email campaigns</button>\n    <button role=\"tab\" data-view=\"reports\" aria-selected=\"false\">Results</button>\n    <button role=\"tab\" data-view=\"rules\" aria-selected=\"false\">Contact rules</button>\n  </nav>\n</div>\n<main id=\"main\"><div class=\"loading\">Loading your leads…</div></main>\n\n<script>\nconst S = { data: null, view: \"today\", filters: { q: \"\", stage: \"\", goal: \"\", source: \"\" } };\nconst $ = s => document.querySelector(s);\nconst GOAL_LABEL = { buy: \"Buy\", sell: \"Sell\", invest: \"Invest\", rent: \"Rent\", other: \"Other\" };\n\n// ---------- Server calls ----------\nfunction call(action, payload) {\n  return new Promise((resolve, reject) => {\n    google.script.run.withSuccessHandler(resolve).withFailureHandler(e => reject(e && e.message ? e : new Error(String(e)))).api(action, payload || {});\n  });\n}\nfunction toast(msg, err) {\n  const t = document.createElement(\"div\");\n  t.className = \"toast\" + (err ? \" err\" : \"\"); t.textContent = msg; t.setAttribute(\"role\", \"status\");\n  document.body.appendChild(t); setTimeout(() => t.remove(), err ? 6000 : 3000);\n}\nasync function load() {\n  try {\n    S.data = await call(\"bootstrap\");\n    $(\"#who\").textContent = S.data.settings.agentName + \" · \" + S.data.settings.brokerage;\n    render();\n  } catch (e) { $(\"#main\").replaceChildren(h(\"div\", { class: \"empty\" }, \"Could not load: \" + e.message)); }\n}\nfunction upsert(lead) {\n  const i = S.data.leads.findIndex(l => l.id === lead.id);\n  if (i >= 0) S.data.leads[i] = lead; else S.data.leads.push(lead);\n}\n\n// ---------- Tiny element builder (always uses text, never raw HTML, because lead data comes from the public) ----------\nfunction h(tag, attrs, ...kids) {\n  const el = document.createElement(tag);\n  for (const k in attrs || {}) {\n    const v = attrs[k];\n    if (v === false || v === null || v === undefined) continue;\n    if (k.startsWith(\"on\")) el.addEventListener(k.slice(2), v);\n    else if (k === \"value\") el.value = v;\n    else if (k === \"checked\") el.checked = !!v;\n    else el.setAttribute(k, v === true ? \"\" : v);\n  }\n  kids.flat(9).forEach(c => { if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : String(c)); });\n  return el;\n}\n\n// ---------- Dates ----------\nconst dayKey = d => { const x = new Date(d); return x.getFullYear() + \"-\" + String(x.getMonth() + 1).padStart(2, \"0\") + \"-\" + String(x.getDate()).padStart(2, \"0\"); };\nconst todayKey = () => dayKey(new Date());\nfunction fmtDate(iso) { return iso ? new Date(iso).toLocaleDateString(undefined, { month: \"short\", day: \"numeric\", year: new Date(iso).getFullYear() === new Date().getFullYear() ? undefined : \"numeric\" }) : \"—\"; }\nfunction fmtWhen(iso) { return iso ? new Date(iso).toLocaleString(undefined, { month: \"short\", day: \"numeric\", hour: \"numeric\", minute: \"2-digit\" }) : \"\"; }\nfunction ago(iso) {\n  const m = Math.round((Date.now() - new Date(iso)) / 60000);\n  if (m < 60) return m + \" min ago\"; if (m < 1440) return Math.round(m / 60) + \" h ago\"; return Math.round(m / 1440) + \" days ago\";\n}\nfunction dueLabel(iso) {\n  if (!iso) return { text: \"No follow-up\", cls: \"\" };\n  const days = Math.round((new Date(dayKey(iso)) - new Date(todayKey())) / 864e5);\n  if (days < 0) return { text: -days + (days === -1 ? \" day\" : \" days\") + \" overdue\", cls: \"late\" };\n  if (days === 0) return { text: \"Due today\", cls: \"now\" };\n  if (days === 1) return { text: \"Tomorrow\", cls: \"\" };\n  return { text: \"In \" + days + \" days\", cls: \"\" };\n}\nconst toInputDate = iso => iso ? dayKey(iso) : \"\";\nconst fromInputDate = v => v ? new Date(v + \"T09:00:00\").toISOString() : \"\";\n\n// ---------- Lists ----------\nconst active = l => l.stage !== \"Lost\";\nfunction todayGroups() {\n  const leads = S.data.leads.filter(active), t = todayKey(), week = dayKey(Date.now() + 7 * 864e5);\n  const fresh = leads.filter(l => l.stage === \"New\" && !(Number(l.attempts) > 0)).sort((a, b) => new Date(b.created) - new Date(a.created));\n  const rest = leads.filter(l => !fresh.includes(l) && l.nextFollowUp);\n  const by = (a, b) => new Date(a.nextFollowUp) - new Date(b.nextFollowUp);\n  return {\n    fresh,\n    overdue: rest.filter(l => dayKey(l.nextFollowUp) < t).sort(by),\n    today: rest.filter(l => dayKey(l.nextFollowUp) === t).sort(by),\n    soon: rest.filter(l => dayKey(l.nextFollowUp) > t && dayKey(l.nextFollowUp) <= week).sort(by)\n  };\n}\n// \"Year closed\" (2022 to this year) plus an optional exact closing date. Picking a date sets the year to match.\nfunction closedFields(year, dateIso) {\n  const yearSel = select(\"Year closed\", S.data.lists.closedYears.map(String), year ? String(year) : \"\", \"—\");\n  const date = h(\"input\", { type: \"date\", value: toInputDate(dateIso), min: S.data.lists.closedYears.at(-1) + \"-01-01\", max: todayKey(), \"aria-label\": \"Exact closing date\" });\n  yearSel.addEventListener(\"change\", () => { if (date.value && date.value.slice(0, 4) !== yearSel.value) date.value = \"\"; });\n  date.addEventListener(\"change\", () => { if (date.value) yearSel.value = date.value.slice(0, 4); });\n  return {\n    yearSel, date,\n    fields: [h(\"label\", { class: \"f\" }, \"Year closed\", yearSel), h(\"label\", { class: \"f\" }, \"Exact closing date (optional)\", date)],\n    values: () => ({ closedYear: yearSel.value, closedOn: fromInputDate(date.value) })\n  };\n}\nfunction askClosedYear(l, onSave, onCancel) {\n  const c = closedFields(l.closedYear || new Date().getFullYear(), l.closedOn);\n  const m = modal(\"Mark \" + l.name + \" as closed\",\n    h(\"p\", { class: \"hint\" }, \"What year did this deal close? Add the exact date too if you have it, so you get a reminder on their home anniversary.\"),\n    h(\"div\", { class: \"form\" }, c.fields),\n    h(\"div\", { class: \"actions\" },\n      h(\"button\", { type: \"button\", class: \"btn dark\", onclick: () => { if (!c.yearSel.value) return toast(\"Pick the year it closed\", true); m.remove(); onSave(c.values()); } }, \"Save\"),\n      h(\"button\", { type: \"button\", class: \"btn\", onclick: () => { m.remove(); onCancel(); } }, \"Cancel\")));\n}\n\nfunction leadCard(l, mode) {\n  const due = mode === \"fresh\" ? { text: \"Came in \" + ago(l.created), cls: \"now\" } : dueLabel(l.nextFollowUp);\n  const temp = l.temperature ? h(\"span\", { class: \"pill \" + String(l.temperature).toLowerCase() }, l.temperature) : null;\n  return h(\"button\", { type: \"button\", class: \"card\", onclick: () => openLead(l.id) },\n    h(\"div\", null, h(\"b\", null, l.name || \"(no name)\"), \" \", temp),\n    h(\"div\", { class: \"when \" + due.cls }, due.text),\n    h(\"div\", { class: \"meta\" }, [GOAL_LABEL[l.goal] || \"\", l.area, l.source, l.stage === \"Closed\" && l.closedYear ? \"Closed \" + l.closedYear : l.stage, l.language === \"es\" ? \"Español\" : \"\"].filter(Boolean).join(\" · \")));\n}\n\n// ---------- Views ----------\nfunction render() {\n  document.querySelectorAll(\".tabs button\").forEach(b => b.setAttribute(\"aria-selected\", String(b.dataset.view === S.view)));\n  const g = todayGroups();\n  $(\"#n-today\").textContent = g.fresh.length + g.overdue.length + g.today.length;\n  $(\"#n-all\").textContent = S.data.leads.length;\n  const banner = S.data.warnings.length ? h(\"div\", { class: \"banner\" }, S.data.warnings.map(w => h(\"p\", null, \"⚠ \" + w))) : null;\n  const view = { today: viewToday, leads: viewLeads, pipeline: viewPipeline, campaigns: viewCampaigns, reports: viewReports, rules: viewRules }[S.view]();\n  $(\"#main\").replaceChildren(...[banner, view].filter(Boolean));\n}\n\nfunction viewToday() {\n  const g = todayGroups();\n  const block = (title, list, mode, emptyText) => h(\"section\", { class: \"group\" },\n    h(\"h2\", null, title, \" \", h(\"span\", { class: \"n\" }, \"(\" + list.length + \")\")),\n    list.length ? h(\"div\", { class: \"cards\" }, list.map(l => leadCard(l, mode))) : h(\"div\", { class: \"empty\" }, emptyText));\n  return h(\"div\", { class: \"groups\" },\n    block(\"New leads: reach out now\", g.fresh, \"fresh\", \"No new leads waiting. Nice work.\"),\n    block(\"Overdue\", g.overdue, \"\", \"Nothing overdue.\"),\n    block(\"Due today\", g.today, \"\", \"Nothing else due today.\"),\n    block(\"Coming up this week\", g.soon, \"\", \"Nothing scheduled this week.\"));\n}\n\nfunction filteredLeads() {\n  const f = S.filters, q = f.q.trim().toLowerCase();\n  return S.data.leads.filter(l =>\n    (!f.stage || l.stage === f.stage) && (!f.goal || l.goal === f.goal) && (!f.source || l.source === f.source) &&\n    (!q || [l.name, l.email, l.phone, l.area, l.tags, l.notes].join(\" \").toLowerCase().includes(q))\n  ).sort((a, b) => new Date(b.created) - new Date(a.created));\n}\nfunction select(name, options, value, blank, onchange) {\n  return h(\"select\", { \"aria-label\": name, onchange },\n    blank !== undefined ? h(\"option\", { value: \"\" }, blank) : null,\n    options.map(o => { const [v, t] = Array.isArray(o) ? o : [o, o]; const opt = h(\"option\", { value: v }, t); if (v === value) opt.selected = true; return opt; }));\n}\nfunction viewLeads() {\n  const L = S.data.lists, f = S.filters;\n  const body = h(\"tbody\");\n  const fill = () => {\n    const rows = filteredLeads();\n    body.replaceChildren(...rows.map(l => h(\"tr\", { onclick: () => openLead(l.id), tabindex: \"0\", onkeydown: e => { if (e.key === \"Enter\") openLead(l.id); } },\n      h(\"td\", null, h(\"b\", null, l.name), h(\"div\", { class: \"hint\" }, [l.phone, l.email].filter(Boolean).join(\" · \"))),\n      h(\"td\", null, l.stage), h(\"td\", null, GOAL_LABEL[l.goal] || \"\"), h(\"td\", null, l.area || \"\"), h(\"td\", null, l.source || \"\"),\n      h(\"td\", null, h(\"span\", { class: \"when \" + dueLabel(l.nextFollowUp).cls }, l.nextFollowUp ? fmtDate(l.nextFollowUp) : \"—\")),\n      h(\"td\", null, fmtDate(l.lastContact)))));\n    if (!rows.length) body.append(h(\"tr\", null, h(\"td\", { colspan: \"7\", class: \"hint\" }, S.data.leads.length ? \"No leads match.\" : \"No leads yet. They appear here as soon as someone uses your website form, or add one with + Add lead.\")));\n  };\n  const set = k => e => { f[k] = e.target.value; fill(); };\n  const bar = h(\"div\", { class: \"bar\" },\n    h(\"input\", { type: \"search\", placeholder: \"Search name, phone, email, area, tags…\", value: f.q, oninput: set(\"q\"), \"aria-label\": \"Search\" }),\n    select(\"Stage\", L.stages, f.stage, \"All stages\", set(\"stage\")),\n    select(\"Goal\", L.goals.map(g => [g, GOAL_LABEL[g]]), f.goal, \"All goals\", set(\"goal\")),\n    select(\"Source\", L.sources, f.source, \"All sources\", set(\"source\")),\n    h(\"a\", { class: \"btn\", href: S.data.sheetUrl }, \"Open the sheet\"));\n  fill();\n  return h(\"div\", null, bar, h(\"div\", { class: \"tablewrap\" }, h(\"table\", null,\n    h(\"thead\", null, h(\"tr\", null, [\"Name\", \"Stage\", \"Goal\", \"Area\", \"Source\", \"Next follow-up\", \"Last contact\"].map(t => h(\"th\", null, t)))), body)));\n}\n\nfunction viewPipeline() {\n  return h(\"div\", { class: \"board\" }, S.data.lists.stages.map(st => {\n    const list = S.data.leads.filter(l => l.stage === st).sort((a, b) => new Date(a.nextFollowUp || 8e15) - new Date(b.nextFollowUp || 8e15));\n    return h(\"section\", { class: \"col\", \"aria-label\": st }, h(\"h3\", null, st, h(\"span\", null, list.length)), list.map(l => leadCard(l)));\n  }));\n}\n\nfunction viewCampaigns() {\n  const L = S.data.lists, emailT = S.data.templates.filter(t => t.channel === \"email\" && t.key !== \"welcome\");\n  const keys = [...new Map(emailT.map(t => [t.key, t])).values()];\n  const st = { key: keys[0] ? keys[0].key : \"\", filter: { stage: \"\", goal: \"\", language: \"\", source: \"\", closedYear: \"\", tag: \"\" } };\n  const out = h(\"div\", { class: \"panel\" }, h(\"p\", { class: \"hint\" }, \"Pick a template and a group, then preview who will get it.\"));\n  const preview = async () => {\n    out.replaceChildren(h(\"p\", { class: \"hint\" }, \"Checking permissions…\"));\n    try {\n      const r = await call(\"campaignPreview\", st);\n      const skipped = Object.entries(r.skipped);\n      out.replaceChildren(\n        h(\"div\", { class: \"stats\" }, h(\"div\", { class: \"stat\" }, h(\"span\", null, \"Will receive it\"), h(\"b\", null, r.eligible)),\n          h(\"div\", { class: \"stat\" }, h(\"span\", null, \"Left out\"), h(\"b\", null, skipped.reduce((n, [, c]) => n + c, 0))),\n          h(\"div\", { class: \"stat\" }, h(\"span\", null, \"Emails left today (Google limit)\"), h(\"b\", null, r.quota))),\n        r.names.length ? h(\"p\", { class: \"hint\" }, \"Includes \" + r.names.join(\", \") + (r.eligible > r.names.length ? \" and \" + (r.eligible - r.names.length) + \" more.\" : \".\")) : null,\n        skipped.length ? h(\"ul\", { class: \"warnlist\" }, skipped.map(([why, n]) => h(\"li\", null, n + \" left out: \" + why))) : null,\n        r.blocker ? h(\"div\", { class: \"status no\" }, r.blocker) : null,\n        r.eligible > r.quota ? h(\"p\", { class: \"hint\" }, \"Only \" + r.quota + \" can go out today. Send again tomorrow for the rest. People who already got it today will get it again, so narrow the group by tag if needed.\") : null,\n        h(\"div\", { class: \"actions\" }, h(\"button\", { type: \"button\", class: \"btn dark\", disabled: !!r.blocker || !r.eligible || !r.quota, onclick: send }, \"Send to \" + Math.min(r.eligible, r.quota) + \" people\")));\n    } catch (e) { out.replaceChildren(h(\"div\", { class: \"status no\" }, e.message)); }\n  };\n  const send = async () => {\n    if (!confirm(\"Send this email now? Each person gets their own copy, in their language, with your address and an unsubscribe link.\")) return;\n    out.replaceChildren(h(\"p\", { class: \"hint\" }, \"Sending… keep this window open.\"));\n    try {\n      const r = await call(\"campaignSend\", st);\n      out.replaceChildren(h(\"div\", { class: \"status ok\" }, h(\"b\", null, \"Sent \" + r.sent + \" emails.\"), r.left > 0 ? r.left + \" still waiting for tomorrow's limit.\" : \"\", r.failed ? \" \" + r.failed + \" could not be sent.\" : \"\"));\n      S.data = await call(\"bootstrap\");\n    } catch (e) { out.replaceChildren(h(\"div\", { class: \"status no\" }, e.message)); }\n  };\n  const tplPreview = h(\"div\", { class: \"hint\", style: \"white-space:pre-wrap\" });\n  const showTpl = () => { const t = emailT.find(x => x.key === st.key && x.language === \"en\") || emailT.find(x => x.key === st.key); tplPreview.textContent = t ? \"Subject: \" + t.subject + \"\\n\\n\" + t.body : \"\"; };\n  showTpl();\n  const set = k => e => { st.filter[k] = e.target.value; };\n  return h(\"div\", { class: \"grid2\" },\n    h(\"div\", { class: \"panel\" },\n      h(\"h3\", null, \"Send an email to a group\"),\n      h(\"label\", { class: \"f\" }, \"Template\", select(\"Template\", keys.map(t => [t.key, t.name + (t.kind === \"marketing\" ? \" (marketing)\" : \"\")]), st.key, undefined, e => { st.key = e.target.value; showTpl(); })),\n      h(\"div\", { class: \"form\" },\n        h(\"label\", { class: \"f\" }, \"Stage\", select(\"Stage\", L.stages, \"\", \"Any\", set(\"stage\"))),\n        h(\"label\", { class: \"f\" }, \"Goal\", select(\"Goal\", L.goals.map(g => [g, GOAL_LABEL[g]]), \"\", \"Any\", set(\"goal\"))),\n        h(\"label\", { class: \"f\" }, \"Language\", select(\"Language\", [[\"en\", \"English\"], [\"es\", \"Español\"]], \"\", \"Any\", set(\"language\"))),\n        h(\"label\", { class: \"f\" }, \"Source\", select(\"Source\", L.sources, \"\", \"Any\", set(\"source\"))),\n        h(\"label\", { class: \"f\" }, \"Year closed\", select(\"Year closed\", L.closedYears.map(String), \"\", \"Any\", set(\"closedYear\"))),\n        h(\"label\", { class: \"f full\" }, \"Tag (optional)\", h(\"input\", { placeholder: \"e.g. summerlin-buyers\", oninput: set(\"tag\") }))),\n      h(\"div\", { class: \"actions\" }, h(\"button\", { type: \"button\", class: \"btn dark\", onclick: preview }, \"Preview who gets it\")),\n      h(\"details\", null, h(\"summary\", null, \"See the template\"), tplPreview),\n      h(\"p\", { class: \"hint\" }, \"Each person gets the English or Spanish version based on their language. Edit wording on the Templates tab of your sheet. Only people who gave permission or contacted you are included; unsubscribed people and people working with another agent are always left out.\")),\n    out);\n}\n\nfunction viewReports() {\n  const leads = S.data.leads, since30 = Date.now() - 30 * 864e5;\n  const recent = leads.filter(l => new Date(l.created) >= since30);\n  const reached = [\"Contacted\", \"Nurture\", \"Appointment\", \"Active client\", \"Under contract\", \"Closed\"];\n  const apptPlus = [\"Appointment\", \"Active client\", \"Under contract\", \"Closed\"];\n  const responded = recent.filter(l => l.firstResponse).map(l => (new Date(l.firstResponse) - new Date(l.created)) / 60000).sort((a, b) => a - b);\n  const median = responded.length ? responded[Math.floor(responded.length / 2)] : null;\n  const fmtMins = m => m === null ? \"—\" : m < 60 ? Math.round(m) + \" min\" : m < 1440 ? (m / 60).toFixed(1) + \" h\" : (m / 1440).toFixed(1) + \" days\";\n  const pct = (a, b) => b ? Math.round(100 * a / b) + \"%\" : \"—\";\n  const bySource = {};\n  leads.forEach(l => { const s = l.source || \"Unknown\"; const r = bySource[s] || (bySource[s] = { n: 0, reached: 0, appt: 0, closed: 0 }); r.n++; if (reached.includes(l.stage)) r.reached++; if (apptPlus.includes(l.stage)) r.appt++; if (l.stage === \"Closed\") r.closed++; });\n  const weeks = [];\n  for (let i = 7; i >= 0; i--) {\n    const end = Date.now() - i * 7 * 864e5, start = end - 7 * 864e5;\n    weeks.push([new Date(start + 864e5).toLocaleDateString(undefined, { month: \"short\", day: \"numeric\" }), leads.filter(l => { const c = new Date(l.created); return c >= start && c < end; }).length]);\n  }\n  return h(\"div\", { class: \"groups\" },\n    h(\"div\", { class: \"stats\" },\n      h(\"div\", { class: \"stat\" }, h(\"span\", null, \"New leads, last 30 days\"), h(\"b\", null, recent.length)),\n      h(\"div\", { class: \"stat\" }, h(\"span\", null, \"Typical time to first contact\"), h(\"b\", null, fmtMins(median))),\n      h(\"div\", { class: \"stat\" }, h(\"span\", null, \"Never contacted (30 days)\"), h(\"b\", null, recent.filter(l => !l.firstResponse).length)),\n      h(\"div\", { class: \"stat\" }, h(\"span\", null, \"Active clients + under contract\"), h(\"b\", null, leads.filter(l => [\"Active client\", \"Under contract\"].includes(l.stage)).length)),\n      h(\"div\", { class: \"stat\" }, h(\"span\", null, \"Closed\"), h(\"b\", null, leads.filter(l => l.stage === \"Closed\").length))),\n    h(\"section\", { class: \"group\" }, h(\"h2\", null, \"Which sources work\"),\n      h(\"div\", { class: \"tablewrap\" }, h(\"table\", null,\n        h(\"thead\", null, h(\"tr\", null, h(\"th\", null, \"Source\"), [\"Leads\", \"Reached\", \"Appointment or better\", \"Closed\", \"Close rate\"].map(t => h(\"th\", { class: \"num\" }, t)))),\n        h(\"tbody\", null, Object.entries(bySource).sort((a, b) => b[1].n - a[1].n).map(([s, r]) => h(\"tr\", { style: \"cursor:default\" },\n          h(\"td\", null, s), h(\"td\", { class: \"num\" }, r.n), h(\"td\", { class: \"num\" }, r.reached), h(\"td\", { class: \"num\" }, r.appt), h(\"td\", { class: \"num\" }, r.closed), h(\"td\", { class: \"num\" }, pct(r.closed, r.n)))))))),\n    h(\"section\", { class: \"group\" }, h(\"h2\", null, \"New leads per week\"),\n      h(\"div\", { class: \"tablewrap\" }, h(\"table\", { style: \"min-width:0\" },\n        h(\"thead\", null, h(\"tr\", null, h(\"th\", null, \"Week starting\"), h(\"th\", { class: \"num\" }, \"New leads\"))),\n        h(\"tbody\", null, weeks.map(([w, n]) => h(\"tr\", { style: \"cursor:default\" }, h(\"td\", null, w), h(\"td\", { class: \"num\" }, n))))))));\n}\n\nfunction viewRules() {\n  const s = S.data.settings, li = t => h(\"li\", null, t);\n  return h(\"div\", { class: \"grid2\" },\n    h(\"div\", { class: \"panel\" }, h(\"h3\", null, \"Calls and texts\"), h(\"ul\", null,\n      li(\"Only between \" + hour(s.quietStart) + \" and \" + hour(s.quietEnd) + \" in the person's time zone. The Call and Text buttons are off outside those hours.\"),\n      li(\"Before calling or texting, the CRM checks for one of these: their written consent (website checkbox or signed form), a recent relationship (they asked you about real estate in the last 3 months, or closed with you in the last 18 months), or a National Do Not Call Registry check in the last 31 days showing they are not on it.\"),\n      li(\"If anyone says stop, press \\\"They asked to stop\\\" right away. The CRM blocks their number for good, even if they are added again later.\"),\n      li(\"Texts go one at a time from your own phone. Mass or automated texting needs written consent from each person and a registered texting service, so this CRM does not do it.\"),\n      li(\"Say who you are and that you are with \" + s.brokerage + \" at the start of every call. Keep your caller ID on.\"))),\n    h(\"div\", { class: \"panel\" }, h(\"h3\", null, \"Email\"), h(\"ul\", null,\n      li(\"Campaigns only go to people who said yes on your website, or who contacted or worked with you, and never to anyone who unsubscribed.\"),\n      li(\"Every marketing email automatically includes your name, \" + s.brokerage + \", your license number, your postal address, Equal Housing Opportunity, and a one-click unsubscribe link.\"),\n      li(\"Unsubscribes take effect instantly (the law allows 10 business days).\"),\n      li(\"Use honest subject lines that match the email.\"))),\n    h(\"div\", { class: \"panel\" }, h(\"h3\", null, \"Fair housing\"), h(\"ul\", null,\n      li(\"Treat every lead the same. Never note or filter people by race, color, religion, sex, disability, familial status, national origin, sexual orientation, gender identity or expression, or ancestry.\"),\n      li(\"Describe homes, not the people you think should live there. Avoid words like \\\"perfect for families\\\" or \\\"safe neighborhood\\\" in notes and emails.\"),\n      li(\"Speaking Spanish is a service you offer. Never use language to decide which homes someone sees.\"))),\n    h(\"div\", { class: \"panel\" }, h(\"h3\", null, \"Privacy and records\"), h(\"ul\", null,\n      li(\"Your website links to a privacy notice (required for Nevada website operators, NRS 603A.340). Lead data is never sold.\"),\n      li(\"If someone asks you to delete their data, open their lead and use \\\"Delete (privacy request)\\\". A do-not-contact record is kept so they are not contacted again.\"),\n      li(\"Keep the sheet private, turn on 2-Step Verification on your Google account, and only share it with your team.\"),\n      li(\"If someone says they already have an agent, the CRM flags it. Do not try to take another agent's client (Code of Ethics, Article 16).\"),\n      li(\"This is a practical guide, not legal advice. Ask your broker to review it.\"))));\n}\nconst hour = x => { x = Number(x); return (x % 12 || 12) + (x < 12 ? \"am\" : \"pm\"); };\n\n// ---------- Lead drawer ----------\nasync function openLead(id) {\n  const scrim = h(\"div\", { class: \"scrim\", onclick: e => { if (e.target === scrim) close(); } });\n  const drawer = h(\"div\", { class: \"drawer\", role: \"dialog\", \"aria-modal\": \"true\", \"aria-label\": \"Lead details\" }, h(\"div\", { class: \"loading\" }, \"Loading…\"));\n  const close = () => { scrim.remove(); document.removeEventListener(\"keydown\", esc); render(); };\n  const esc = e => { if (e.key === \"Escape\" && !document.querySelector(\".scrim.center\")) close(); };\n  document.addEventListener(\"keydown\", esc);\n  scrim.append(drawer); document.body.append(scrim);\n  try { drawLead(drawer, await call(\"getLead\", { id }), close); }\n  catch (e) { drawer.replaceChildren(h(\"div\", { class: \"loading\" }, e.message), h(\"button\", { type: \"button\", class: \"btn\", onclick: close }, \"Close\")); }\n}\n\nfunction drawLead(drawer, res, close) {\n  const l = res.lead, L = S.data.lists, pc = l.phoneCheck, ec = l.emailCheck;\n  upsert(l);\n  const redraw = r => drawLead(drawer, r, close);\n  const run = async (action, payload, okMsg) => { try { const r = await call(action, payload); if (r.lead) redraw(r); toast(okMsg); return r; } catch (e) { toast(e.message, true); } };\n\n  // Log form, filled in by the Call / Text / Email buttons too.\n  const log = { type: h(\"select\", { \"aria-label\": \"What you did\" }, L.types.map(t => h(\"option\", null, t))),\n    outcome: h(\"select\", { \"aria-label\": \"Result\" }, h(\"option\", { value: \"\" }, \"—\"), L.outcomes.map(t => h(\"option\", null, t))),\n    details: h(\"textarea\", { placeholder: \"What did you talk about? Next steps?\", \"aria-label\": \"Notes\" }),\n    next: h(\"input\", { type: \"date\", \"aria-label\": \"Next follow-up\" }) };\n  const logBox = h(\"section\", { class: \"panel\" }, h(\"h3\", null, \"Log what you did\"),\n    h(\"div\", { class: \"form\" }, h(\"label\", { class: \"f\" }, \"What\", log.type), h(\"label\", { class: \"f\" }, \"Result\", log.outcome),\n      h(\"label\", { class: \"f full\" }, \"Notes\", log.details),\n      h(\"label\", { class: \"f\" }, \"Next follow-up\", log.next, h(\"span\", { class: \"hint\" }, \"Leave blank and the CRM picks the date for you.\"))),\n    h(\"div\", { class: \"actions\" }, h(\"button\", { type: \"button\", class: \"btn dark\", onclick: async () => {\n      const r = await run(\"logActivity\", { id: l.id, type: log.type.value, outcome: log.outcome.value, details: log.details.value, next: fromInputDate(log.next.value) }, \"Saved\");\n      if (r) { const n = r.lead.nextFollowUp; toast(n ? \"Saved. Next follow-up: \" + fmtDate(n) : \"Saved. No more follow-ups scheduled.\"); }\n    } }, \"Save\")));\n  const prefill = (type, outcome) => { log.type.value = type; log.outcome.value = outcome || \"\"; logBox.scrollIntoView({ behavior: \"smooth\" }); log.details.focus({ preventScroll: true }); };\n\n  const digits = String(l.phone || \"\").replace(/\\D/g, \"\");\n  const phoneStatus = h(\"div\", { class: \"status \" + (pc.ok ? \"ok\" : \"no\") },\n    h(\"b\", null, pc.ok ? \"OK to call or text now\" : \"Do not call or text right now\"),\n    pc.ok ? pc.basis : h(\"ul\", null, pc.reasons.map(r => h(\"li\", null, r))));\n  const needsDnc = !pc.ok && pc.reasons.some(r => /Registry/.test(r)) && l.phoneOptOut !== \"Yes\";\n  const emailStatus = h(\"div\", { class: \"status \" + (ec.ok ? \"ok\" : \"no\") }, h(\"b\", null, ec.ok ? \"OK to email\" : \"Do not email\"), ec.ok ? ec.basis : ec.reasons.join(\" \"));\n  const warnings = pc.warnings || [];\n\n  const callBtn = h(\"a\", { class: \"btn dark\", href: \"tel:\" + digits, \"aria-disabled\": String(!pc.ok), onclick: () => setTimeout(() => prefill(\"Call\"), 300) }, \"Call \" + (l.phone || \"\"));\n  const textBtn = h(\"button\", { type: \"button\", class: \"btn\", disabled: !pc.ok, onclick: () => textComposer(l, () => prefill(\"Text\", \"Sent\")) }, \"Text\");\n  const emailBtn = h(\"button\", { type: \"button\", class: \"btn\", disabled: !ec.ok, onclick: () => emailComposer(l, redraw) }, \"Email\");\n\n  // Details form\n  const F = {};\n  const inp = (k, label, attrs) => h(\"label\", { class: \"f\" + (attrs && attrs.full ? \" full\" : \"\") }, label, F[k] = h(\"input\", Object.assign({ value: l[k] || \"\" }, attrs, { full: null })));\n  const sel = (k, label, opts, blank) => h(\"label\", { class: \"f\" }, label, F[k] = select(label, opts, l[k] || \"\", blank));\n  const closed = closedFields(l.closedYear, l.closedOn);\n  const details = h(\"section\", { class: \"panel\" }, h(\"h3\", null, \"Details\"),\n    h(\"div\", { class: \"form\" },\n      inp(\"name\", \"Name\"), inp(\"phone\", \"Phone\", { type: \"tel\" }), inp(\"email\", \"Email\", { type: \"email\", full: true }),\n      sel(\"language\", \"Language\", [[\"en\", \"English\"], [\"es\", \"Español\"]]), sel(\"goal\", \"Goal\", L.goals.map(g => [g, GOAL_LABEL[g]]), \"—\"),\n      inp(\"area\", \"Area / neighborhood\"), inp(\"price\", \"Price range\"), inp(\"timeline\", \"Timeline\", { placeholder: \"e.g. 3–6 months\" }),\n      sel(\"source\", \"Source\", [...new Set([...L.sources, l.source].filter(Boolean))], \"—\"),\n      sel(\"temperature\", \"Temperature\", [\"Hot\", \"Warm\", \"Cold\"], \"—\"), inp(\"referredBy\", \"Referred by\"),\n      closed.fields,\n      h(\"label\", { class: \"f\" }, \"Next follow-up\", F.nextFollowUp = h(\"input\", { type: \"date\", value: toInputDate(l.nextFollowUp) })),\n      inp(\"tags\", \"Tags (comma separated)\", { full: true, placeholder: \"e.g. first-time buyer, summerlin\" }),\n      h(\"label\", { class: \"f full\" }, \"Notes\", F.notes = h(\"textarea\", { value: l.notes || \"\" }), h(\"span\", { class: \"hint\" }, \"Fair housing: note what they want in a home, never personal traits like family, religion, origin or disability.\")),\n      h(\"label\", { class: \"check full\" }, F.hasAgent = h(\"input\", { type: \"checkbox\", checked: l.hasAgent === \"Yes\" }), \"They already work with another agent\")),\n    h(\"div\", { class: \"actions\" }, h(\"button\", { type: \"button\", class: \"btn dark\", onclick: () => {\n      const p = { id: l.id, ...closed.values(), nextFollowUp: fromInputDate(F.nextFollowUp.value), hasAgent: F.hasAgent.checked };\n      [\"name\", \"phone\", \"email\", \"language\", \"goal\", \"area\", \"price\", \"timeline\", \"source\", \"temperature\", \"referredBy\", \"tags\", \"notes\"].forEach(k => p[k] = F[k].value);\n      if (p.phone.replace(/\\D/g, \"\") !== digits && l.phoneConsent === \"Yes\" && !confirm(\"Changing the phone number removes the call/text permission, because consent belongs to the old number. Continue?\")) return;\n      run(\"saveLead\", p, \"Saved\");\n    } }, \"Save details\")));\n\n  const stageSel = select(\"Stage\", L.stages, l.stage, undefined, e => {\n    const stage = e.target.value;\n    if (stage !== \"Closed\") return run(\"saveLead\", { id: l.id, stage }, \"Stage changed to \" + stage);\n    askClosedYear(l, v => run(\"saveLead\", { id: l.id, stage, ...v }, \"Marked closed in \" + v.closedYear), () => { e.target.value = l.stage; });\n  });\n\n  const consentInfo = h(\"ul\", { class: \"hint\", style: \"margin:0;padding-left:18px\" },\n    h(\"li\", null, \"Email permission: \" + (l.emailConsent === \"Yes\" ? \"yes, \" + fmtDate(l.emailConsentAt) : \"no\") + (l.unsubscribed === \"Yes\" ? \" (unsubscribed)\" : \"\")),\n    h(\"li\", null, \"Call/text written consent: \" + (l.phoneConsent === \"Yes\" ? \"yes, \" + fmtDate(l.phoneConsentAt) : \"no\") + (l.phoneOptOut === \"Yes\" ? \" (asked to stop)\" : \"\")),\n    h(\"li\", null, \"Last inquiry: \" + fmtDate(l.lastInquiry) + \" · National DNC: \" + (l.dncCheckedOn ? (l.onDnc === \"Yes\" ? \"on the list\" : \"not on the list\") + \", checked \" + fmtDate(l.dncCheckedOn) : \"not checked\")));\n\n  drawer.replaceChildren(\n    h(\"header\", null, h(\"h2\", null, l.name), stageSel, h(\"button\", { type: \"button\", class: \"btn\", onclick: close, \"aria-label\": \"Close\" }, \"✕\")),\n    h(\"div\", { class: \"body\" },\n      h(\"p\", { class: \"hint\" }, \"Added \" + fmtWhen(l.created) + \" from \" + (l.source || \"—\") + \" · \" + (Number(l.attempts) || 0) + \" contact attempts · Next follow-up: \" + (l.nextFollowUp ? fmtDate(l.nextFollowUp) + \" (\" + dueLabel(l.nextFollowUp).text.toLowerCase() + \")\" : \"none\")),\n      l.message ? h(\"section\", { class: \"panel\" }, h(\"h3\", null, \"Their message\"), h(\"div\", { style: \"white-space:pre-wrap;overflow-wrap:anywhere\" }, l.message)) : null,\n      h(\"section\", { class: \"panel\" }, h(\"h3\", null, \"Reach out\"),\n        h(\"div\", { class: \"grid2\" }, phoneStatus, emailStatus),\n        warnings.length ? h(\"ul\", { class: \"warnlist\" }, warnings.map(w => h(\"li\", null, w))) : null,\n        h(\"div\", { class: \"actions\" }, digits ? callBtn : null, digits ? textBtn : null, l.email ? emailBtn : null,\n          h(\"button\", { type: \"button\", class: \"btn\", onclick: () => prefill(\"Note\") }, \"Add a note\")),\n        needsDnc ? h(\"div\", { class: \"panel\", style: \"background:var(--bone)\" },\n          h(\"b\", null, \"Record your Do Not Call Registry check\"),\n          h(\"p\", { class: \"hint\" }, \"Look up \" + l.phone + \" with your brokerage's DNC scrub or at telemarketing.donotcall.gov, then record what you found.\"),\n          h(\"div\", { class: \"actions\" },\n            h(\"button\", { type: \"button\", class: \"btn\", onclick: () => run(\"recordDnc\", { id: l.id, onDnc: \"No\" }, \"Recorded: not on the list\") }, \"Not on the list\"),\n            h(\"button\", { type: \"button\", class: \"btn\", onclick: () => run(\"recordDnc\", { id: l.id, onDnc: \"Yes\" }, \"Recorded: on the list\") }, \"On the list\"))) : null,\n        h(\"details\", null, h(\"summary\", null, \"Permissions and opt-outs\"),\n          h(\"div\", { style: \"display:grid;gap:10px;margin-top:10px\" }, consentInfo, consentForm(l, run),\n            h(\"div\", { class: \"actions\" },\n              l.phoneOptOut !== \"Yes\" && digits ? h(\"button\", { type: \"button\", class: \"btn danger\", onclick: () => { if (confirm(\"Block all calls and texts to \" + l.name + \"?\")) run(\"optOut\", { id: l.id, channel: \"phone\", how: \"Asked to stop calls/texts\" }, \"Calls and texts blocked\"); } }, \"They asked to stop calls/texts\") : null,\n              l.unsubscribed !== \"Yes\" && l.email ? h(\"button\", { type: \"button\", class: \"btn danger\", onclick: () => { if (confirm(\"Unsubscribe \" + l.name + \" from email?\")) run(\"optOut\", { id: l.id, channel: \"email\", how: \"Asked to stop emails\" }, \"Unsubscribed\"); } }, \"Unsubscribe from email\") : null)))),\n      logBox,\n      h(\"section\", { class: \"panel\" }, h(\"h3\", null, \"History\"),\n        res.activities.length ? h(\"ul\", { class: \"timeline\" }, res.activities.map(a => h(\"li\", null,\n          h(\"div\", { class: \"t\" }, fmtWhen(a.when) + \" · \" + a.type + (a.outcome ? \" · \" + a.outcome : \"\") + (a.by && a.by !== \"You\" ? \" · \" + a.by : \"\")),\n          a.details ? h(\"div\", { class: \"d\" }, a.details) : null))) : h(\"p\", { class: \"hint\" }, \"Nothing yet.\")),\n      details,\n      h(\"section\", { class: \"panel\" }, h(\"h3\", null, \"Delete\"),\n        h(\"p\", { class: \"hint\" }, \"Use this when someone asks you to delete their information. A do-not-contact record (email and phone only) is kept so they are not contacted again.\"),\n        h(\"div\", { class: \"actions\" }, h(\"button\", { type: \"button\", class: \"btn danger\", onclick: async () => {\n          if (!confirm(\"Permanently delete \" + l.name + \" and their history?\")) return;\n          try { await call(\"deleteLead\", { id: l.id, suppress: true }); S.data.leads = S.data.leads.filter(x => x.id !== l.id); toast(\"Deleted\"); close(); } catch (e) { toast(e.message, true); }\n        } }, \"Delete (privacy request)\")))));\n}\n\nfunction consentForm(l, run) {\n  if ((l.emailConsent === \"Yes\" || !l.email) && (l.phoneConsent === \"Yes\" || !l.phone)) return null;\n  const em = h(\"input\", { type: \"checkbox\" }), ph = h(\"input\", { type: \"checkbox\" }), proof = h(\"input\", { placeholder: \"e.g. Signed open house sheet, 123 Main St, Oct 25\" });\n  return h(\"div\", { class: \"panel\", style: \"background:var(--bone)\" },\n    h(\"b\", null, \"Record permission they gave you in person\"),\n    l.email && l.emailConsent !== \"Yes\" ? h(\"label\", { class: \"check\" }, em, \"They agreed to receive my emails\") : null,\n    l.phone && l.phoneConsent !== \"Yes\" ? h(\"label\", { class: \"check\" }, ph, \"They signed written consent to calls and texts at \" + l.phone) : null,\n    h(\"label\", { class: \"f\" }, \"Where and how (keep the signed paper)\", proof),\n    h(\"div\", { class: \"actions\" }, h(\"button\", { type: \"button\", class: \"btn\", onclick: () => run(\"saveLead\", { id: l.id, addEmailConsent: em.checked, addPhoneConsent: ph.checked, consentProof: proof.value }, \"Permission recorded\") }, \"Save permission\")));\n}\n\n// ---------- Composers ----------\nfunction fillTemplate(text, l) {\n  const s = S.data.settings, es = l.language === \"es\";\n  const goals = es ? { buy: \"comprar una casa\", sell: \"vender tu casa\", invest: \"invertir en bienes raíces\", rent: \"rentar una casa\", other: \"bienes raíces\" }\n    : { buy: \"buying a home\", sell: \"selling your home\", invest: \"investing in real estate\", rent: \"renting a home\", other: \"real estate\" };\n  const v = { firstName: String(l.name || \"\").trim().split(/\\s+/)[0], name: l.name, agentName: s.agentName, agentPhone: s.phone, brokerage: s.brokerage,\n    area: l.area || (es ? \"el valle de Las Vegas\" : \"the Las Vegas valley\"), goalText: goals[l.goal] || goals.other };\n  return String(text || \"\").replace(/\\{\\{(\\w+)\\}\\}/g, (m, k) => v[k] !== undefined ? v[k] : m);\n}\nfunction modal(title, ...content) {\n  const scrim = h(\"div\", { class: \"scrim center\", onclick: e => { if (e.target === scrim) scrim.remove(); } });\n  const box = h(\"div\", { class: \"modal\", role: \"dialog\", \"aria-modal\": \"true\", \"aria-label\": title }, h(\"h3\", null, title), ...content);\n  scrim.append(box); document.body.append(scrim);\n  const esc = e => { if (e.key === \"Escape\") { scrim.remove(); document.removeEventListener(\"keydown\", esc); } };\n  document.addEventListener(\"keydown\", esc);\n  return scrim;\n}\nfunction pickTemplates(channel, l) {\n  const all = S.data.templates.filter(t => t.channel === channel && t.key !== \"welcome\");\n  const lang = l.language === \"es\" ? \"es\" : \"en\";\n  return [...new Set(all.map(t => t.key))].map(k => all.find(t => t.key === k && t.language === lang) || all.find(t => t.key === k));\n}\nfunction textComposer(l, after) {\n  const list = pickTemplates(\"text\", l), body = h(\"textarea\", { \"aria-label\": \"Message\", style: \"min-height:140px\" });\n  const choose = k => { const t = list.find(x => x.key === k); body.value = t ? fillTemplate(t.body, l) : \"\"; };\n  const sel = select(\"Template\", list.map(t => [t.key, t.name]), list[0] && list[0].key, undefined, e => choose(e.target.value));\n  choose(list[0] && list[0].key);\n  const digits = String(l.phone).replace(/\\D/g, \"\");\n  const m = modal(\"Text \" + l.name, h(\"label\", { class: \"f\" }, \"Template\", sel), h(\"label\", { class: \"f\" }, \"Message\", body),\n    h(\"p\", { class: \"hint\" }, \"Opens your phone's messages app so you send it yourself, one person at a time. Keep \\\"Reply STOP to opt out\\\" in first messages.\"),\n    h(\"div\", { class: \"actions\" }, h(\"a\", { class: \"btn dark\", href: \"#\", onclick: e => { e.currentTarget.href = \"sms:\" + digits + \"?&body=\" + encodeURIComponent(body.value); setTimeout(() => { m.remove(); after(); }, 300); } }, \"Open in Messages\"),\n      h(\"button\", { type: \"button\", class: \"btn\", onclick: () => navigator.clipboard.writeText(body.value).then(() => toast(\"Copied\"), () => { body.select(); toast(\"Press copy on your keyboard\"); }) }, \"Copy text\")));\n}\nfunction emailComposer(l, redraw) {\n  const list = pickTemplates(\"email\", l), subject = h(\"input\", { \"aria-label\": \"Subject\" }), body = h(\"textarea\", { \"aria-label\": \"Message\", style: \"min-height:220px\" });\n  const note = h(\"p\", { class: \"hint\" });\n  const choose = k => {\n    const t = list.find(x => x.key === k); subject.value = t ? fillTemplate(t.subject, l) : \"\"; body.value = t ? fillTemplate(t.body, l) : \"\";\n    const ok = t && (t.kind !== \"marketing\" || l.marketingCheck.ok);\n    note.textContent = !t ? \"\" : t.kind === \"marketing\" ? (ok ? \"Marketing email: your address and an unsubscribe link are added at the bottom.\" : \"Can't send marketing to this person: \" + l.marketingCheck.reasons.join(\" \")) : \"Your name, brokerage and contact details are added at the bottom.\";\n    sendBtn.disabled = !ok;\n  };\n  const sendBtn = h(\"button\", { type: \"button\", class: \"btn dark\", onclick: async () => {\n    sendBtn.disabled = true; sendBtn.textContent = \"Sending…\";\n    try { const r = await call(\"sendEmail\", { id: l.id, key: sel.value, subject: subject.value, body: body.value }); m.remove(); toast(\"Email sent to \" + l.email); redraw(r); }\n    catch (e) { toast(e.message, true); sendBtn.disabled = false; sendBtn.textContent = \"Send email\"; }\n  } }, \"Send email\");\n  const sel = select(\"Template\", list.map(t => [t.key, t.name + (t.kind === \"marketing\" ? \" (marketing)\" : \"\")]), list[0] && list[0].key, undefined, e => choose(e.target.value));\n  const m = modal(\"Email \" + l.name + \" <\" + l.email + \">\", h(\"label\", { class: \"f\" }, \"Template\", sel), h(\"label\", { class: \"f\" }, \"Subject\", subject), h(\"label\", { class: \"f\" }, \"Message\", body), note,\n    h(\"div\", { class: \"actions\" }, sendBtn, h(\"button\", { type: \"button\", class: \"btn\", onclick: () => m.remove() }, \"Cancel\")));\n  choose(list[0] && list[0].key);\n}\n\n// ---------- Add lead ----------\nfunction addLead() {\n  const L = S.data.lists, F = {};\n  const inp = (k, label, attrs) => h(\"label\", { class: \"f\" + (attrs && attrs.full ? \" full\" : \"\") }, label, F[k] = h(\"input\", Object.assign({}, attrs, { full: null })));\n  F.source = select(\"Source\", L.sources, \"Open house\"); F.goal = select(\"Goal\", L.goals.map(g => [g, GOAL_LABEL[g]]), \"buy\"); F.language = select(\"Language\", [[\"en\", \"English\"], [\"es\", \"Español\"]], \"en\");\n  F.stage = select(\"Stage\", L.stages, \"New\");\n  const closed = closedFields(new Date().getFullYear(), \"\");\n  const closedBox = h(\"div\", { class: \"form full\", hidden: true }, closed.fields);\n  F.stage.addEventListener(\"change\", () => {\n    closedBox.hidden = F.stage.value !== \"Closed\";\n    if (F.stage.value === \"Closed\") F.inquired.checked = false; // A past client did not just ask about real estate.\n  });\n  F.inquired = h(\"input\", { type: \"checkbox\", checked: true }); F.em = h(\"input\", { type: \"checkbox\" }); F.ph = h(\"input\", { type: \"checkbox\" }); F.hasAgent = h(\"input\", { type: \"checkbox\" });\n  const err = h(\"p\", { class: \"status no\", hidden: true });\n  const m = modal(\"Add a lead\",\n    h(\"div\", { class: \"form\" }, inp(\"name\", \"Name\"), inp(\"phone\", \"Phone\", { type: \"tel\" }), inp(\"email\", \"Email\", { type: \"email\", full: true }),\n      h(\"label\", { class: \"f\" }, \"Stage\", F.stage), h(\"label\", { class: \"f\" }, \"Source\", F.source), h(\"label\", { class: \"f\" }, \"Goal\", F.goal), h(\"label\", { class: \"f\" }, \"Language\", F.language), inp(\"area\", \"Area\"),\n      inp(\"referredBy\", \"Referred by\"), closedBox, inp(\"tags\", \"Tags\"), h(\"label\", { class: \"f full\" }, \"Notes\", F.notes = h(\"textarea\", null))),\n    h(\"label\", { class: \"check\" }, F.inquired, h(\"span\", null, \"They contacted me or asked me about real estate \", h(\"span\", { class: \"hint\" }, \"(lets you follow up for 3 months)\"))),\n    h(\"label\", { class: \"check\" }, F.hasAgent, \"They already work with another agent\"),\n    h(\"label\", { class: \"check\" }, F.em, \"They agreed to receive my emails\"),\n    h(\"label\", { class: \"check\" }, F.ph, h(\"span\", null, \"They signed written consent to calls and texts \", h(\"span\", { class: \"hint\" }, \"(only if they signed it)\"))),\n    inp(\"proof\", \"If they gave permission: where and how\", { full: true, placeholder: \"e.g. Open house sign-in sheet, 123 Main St\" }),\n    err,\n    h(\"div\", { class: \"actions\" }, h(\"button\", { type: \"button\", class: \"btn dark\", onclick: async () => {\n      const p = { inquired: F.inquired.checked, hasAgent: F.hasAgent.checked, addEmailConsent: F.em.checked, addPhoneConsent: F.ph.checked, consentProof: F.proof.value };\n      [\"name\", \"phone\", \"email\", \"stage\", \"source\", \"goal\", \"language\", \"area\", \"referredBy\", \"tags\", \"notes\"].forEach(k => p[k] = F[k].value);\n      if (p.stage === \"Closed\") { if (!closed.yearSel.value) { err.textContent = \"Pick the year it closed.\"; err.hidden = false; return; } Object.assign(p, closed.values()); }\n      try { const r = await call(\"saveLead\", p); upsert(r.lead); m.remove(); toast(\"Lead added\"); render(); openLead(r.lead.id); }\n      catch (e) { err.textContent = e.message; err.hidden = false; }\n    } }, \"Add lead\"), h(\"button\", { type: \"button\", class: \"btn\", onclick: () => m.remove() }, \"Cancel\")));\n  F.name.focus();\n}\n\ndocument.querySelectorAll(\".tabs button\").forEach(b => b.addEventListener(\"click\", () => { S.view = b.dataset.view; render(); }));\n$(\"#refresh\").addEventListener(\"click\", () => { $(\"#main\").replaceChildren(h(\"div\", { class: \"loading\" }, \"Refreshing…\")); load(); });\n$(\"#add\").addEventListener(\"click\", addLead);\nload();\n</script>\n</body>\n</html>\n";
