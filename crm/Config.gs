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
  ['token', 'Unsubscribe key']
];
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
