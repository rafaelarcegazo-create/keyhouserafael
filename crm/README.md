# Lead CRM

A free system to capture every lead, follow up with every person on time, and stay within the contact laws. It runs inside a Google Sheet on your own Google account (rafaelarcegazo@gmail.com), with no monthly fees.

## What it does

**Captures leads automatically**
- Your website form and the open house sign-in page (`open-house.html`) send each lead straight into the sheet.
- You get an email alert within seconds, with their phone number ready to tap.
- The lead gets an instant thank-you email in English or Spanish, depending on the language they used on your site.
- If the same person writes again, their existing record is updated instead of creating a duplicate.
- The sheet records where each lead came from (website, Instagram, open house, referral…), so you can see which sources bring clients.
- Spam bots are filtered out.

**Makes sure nobody is forgotten**
- **Today** screen: new leads to call now, overdue follow-ups, today's follow-ups, and the rest of the week.
- Every time you log a call, text, email or meeting, the next follow-up date is set for you:

| Stage | Next follow-up |
|---|---|
| New (no answer yet) | right away, then day 1, 3, 7, 14 and 28; after that, monthly |
| Contacted | 2 days |
| Nurture | Hot: weekly · Warm: monthly · Cold: every 2 months |
| Appointment | next day |
| Active client / Under contract | every 3 days |
| Closed (past client) | 30 days after closing, then every 3 months, plus home anniversary reminders |
| Lost | no more reminders |

- A **daily email at 7am** lists who to contact that day.
- **Pipeline** view shows everyone by stage. **Results** shows leads per week, how fast you respond, and which sources lead to closings.

**Helps you reach more people**
- Ready-to-use email and text templates in English and Spanish: first text, check-in, new listings, home value, past client, referral request. Edit them on the **Templates** tab.
- **Email campaigns**: send a template to a group (for example all Spanish-speaking buyers, or all past clients) in one click. Only people who are allowed to receive it are included.
- **Open house sign-in**: open `https://keyhouserafael.realtor/open-house.html?property=123 Main St` on a tablet. Each visitor signs in and the form clears for the next person.
- **Track your marketing links**: add `?utm_source=` to links you post, for example `https://keyhouserafael.realtor/?utm_source=instagram` in your Instagram bio or `?utm_source=flyer` on a QR code. Leads from that link show up as "Website (instagram)".

## Set it up (about 20 minutes, one time)

1. **Make the sheet.** Go to [sheets.new](https://sheets.new) while signed in as rafaelarcegazo@gmail.com. Name it "Lead CRM".
2. **Add the code.** In the sheet, open **Extensions > Apps Script**.
   - Click `Code.gs`, delete what is there, and paste the contents of `crm/Code.gs`.
   - Click **+ > Script**, name it `Config`, and paste `crm/Config.gs`. Do the same for `Rules` with `crm/Rules.gs`.
   - Click **+ > HTML**, name it `Dashboard`, and paste `crm/Dashboard.html`.
   - Click the gear (**Project Settings**), turn on **Show "appsscript.json" manifest file**, go back to the editor, open `appsscript.json` and replace it with `crm/appsscript.json`.
   - Click **Save**.
3. **Run setup.** At the top of the editor, pick `setup` in the function list and click **Run**. Google asks for permission. Because this is your own script, it shows "Google hasn't verified this app": click **Advanced**, then **Go to Lead CRM**, then **Allow**. The sheet now has its tabs.
4. **Turn on lead capture.** Click **Deploy > New deployment**, choose type **Web app**, set **Execute as: Me** and **Who has access: Anyone**, and click **Deploy**. Copy the **Web app URL** (it ends in `/exec`).
   - Paste it in the sheet's **Settings** tab, in the `webAppUrl` row.
   - Paste it in `leads-config.js` on your website, between the quotes: `window.LEADS_URL = "https://script.google.com/macros/s/…/exec";` and publish the site.
5. **Add your postal address.** In the **Settings** tab, fill in `postalAddress`. Federal law requires a real postal address in every marketing email. Ask DH Capital Realty which address to use (usually the brokerage office). Campaigns stay off until this is filled in.
6. **Test it.** Send yourself a message from the contact form on your website. Within a minute you should see the lead in the **Leads** tab, get the alert email, and get the thank-you email.

Open the dashboard any time from the sheet: **Lead CRM > Open dashboard** (reload the sheet once after setup for the menu to appear).

**On your phone:** open the Web app URL while signed in to your Google account. If it says "This page is private", Google did not share who you are with the page. In that case, use the Google Sheets app on your phone together with the 7am email.

**If you change the code later:** **Deploy > Manage deployments > Edit (pencil) > Version: New version > Deploy**. The link stays the same.

## The tabs in your sheet

| Tab | What it holds |
|---|---|
| Leads | One row per person. You can edit it directly, but the dashboard is easier. |
| Activities | Every call, text, email, note and web inquiry, with the date. |
| Consent log | Proof of permission: when, where, and the exact words each person agreed to. **Never delete rows here.** |
| Suppression | People who asked not to be contacted. They stay blocked even if they are added again. |
| Templates | Your email and text wording. `{{firstName}}`, `{{area}}`, `{{goalText}}`, `{{agentName}}`, `{{agentPhone}}`, `{{brokerage}}` are filled in for each person. |
| Settings | Your details, calling hours, the 7am email time, and who else may open the dashboard. |

## The laws it follows

The system blocks or warns you before you break these rules. It is a practical guide, not legal advice. **Ask your broker at DH Capital Realty to review it before you start**, because brokerages often have their own policies.

**Calls and texts (federal TCPA and Do Not Call rules).** Texts count as calls.
- Only between 8am and 9pm in the person's time zone. The Call and Text buttons turn off outside those hours.
- Before calling or texting someone, you need one of these, and the CRM checks for it:
  - their written consent (the website checkbox, or a signed form you record in the CRM),
  - a recent business relationship: they asked you about real estate in the last 3 months, or closed a deal with you in the last 18 months,
  - a check of their number on the National Do Not Call Registry in the last 31 days showing they are not on it. Get registry access through your brokerage, or at [telemarketing.donotcall.gov](https://telemarketing.donotcall.gov) (the first 5 area codes are free). Then press "Not on the list" or "On the list" in the lead.
- Anyone who says stop (including replying STOP): press **They asked to stop calls/texts** immediately. They go on your internal do-not-call list for good.
- Texts are sent one at a time from your own phone. The CRM deliberately does not send mass or automated texts: that needs written consent from each person and a registered texting service (10DLC).
- Identify yourself and DH Capital Realty at the start of every call, and keep caller ID on.
- If the phone number on a lead changes, the call/text consent is removed, because consent belongs to the number.

**Email (CAN-SPAM and Nevada NRS 41.705–41.735).**
- Every marketing email automatically includes your name, brokerage, license number, postal address and an unsubscribe link.
- Unsubscribes take effect instantly and are never undone unless the person gives permission again.
- Campaigns only go to people who said yes on your site, or who contacted or worked with you. Don't add bought or scraped email lists.
- Google limits free Gmail accounts to about 100 emails a day. The campaign screen shows how many you have left and stops at the limit.

**Nevada real estate advertising (NRS 645 / NAC 645.610).** Your emails and pages show DH Capital Realty as your brokerage.

**Fair housing (federal Fair Housing Act and NRS 118).** The CRM has no fields for protected traits. Keep notes about the home a person wants, never about who they are (family, religion, origin, disability, and so on). Avoid phrases like "perfect for families" or "safe area".

**REALTOR® Code of Ethics, Article 16.** Leads who say they already work with another agent are flagged and left out of campaigns. Don't try to take another agent's client.

**Privacy (Nevada NRS 603A).** Your website now has a privacy notice (`privacy.html`), linked from the form and the footer. If someone asks you to delete their information, open their lead and press **Delete (privacy request)**. Protect the data: turn on 2-Step Verification on your Google account and share the sheet only with people who need it.

**Third-party leads** (Zillow, Realtor.com and similar) come with their own terms. Add them with the right source so you can see what they cost you in results.

## Test the code (for developers)

```
node --test crm/test/backend.test.js
NODE_PATH=$(npm root -g) node --test crm/test/ui.test.js   # needs Playwright
```
The tests run the Apps Script code in Node with stand-ins for Google's services, and drive the website form, open house page and dashboard in a browser.
