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
      var closed = toDate_(lead.closedOn);
      if (closed && now - closed < 30 * DAY) return addDays_(closed, 30);
      return addDays_(now, 90);                             // Past clients: a personal touch every quarter.
    default: return null;                                   // Lost or unknown: no more reminders.
  }
}

/** The relationship that lets you call a number on the National DNC list (47 CFR 64.1200(f)(5)). */
function relationship_(lead, now) {
  var inquiry = toDate_(lead.lastInquiry), closed = toDate_(lead.closedOn);
  if (closed && now - closed <= 548 * DAY) return { until: addDays_(closed, 548), why: 'closed a transaction with you on ' + fmtDay_(closed) + ' (18 months)' };
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
  else if (toDate_(lead.lastInquiry) || toDate_(lead.closedOn)) res.basis = 'They contacted you or worked with you.';
  else if (kind === 'marketing') { res.reasons.push('No email permission and they never contacted you. Get their permission before adding them to campaigns.'); return res; }
  else res.basis = 'One-to-one email.';
  if (kind === 'marketing') res.warnings.push('Your address and an unsubscribe link are added automatically.');
  if (isYes_(lead.hasAgent) && kind === 'marketing') { res.reasons.push('They work with another agent (Code of Ethics, Article 16). Leave them out of campaigns.'); }
  res.ok = res.reasons.length === 0;
  return res;
}

function hourLabel_(h) { h = Number(h); return (h % 12 || 12) + (h < 12 ? 'am' : 'pm'); }
function fmtDay_(d) { return Utilities.formatDate(d, settings_().timeZone, 'MMM d, yyyy'); }
