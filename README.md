# Rafael Arce Gazo, REALTOR® website

A one-page bilingual (English / Spanish) website. It is plain HTML with no paid services, so it can be hosted for free.

## Files
- `index.html`: the whole site (text, styles, and the English/Spanish switch)
- `img/rafael-portrait.jpg`, `img/rafael-wide.jpg`: headshots
- `img/dh-capital-realty.png`: brokerage logo
- `img/rafael-seated.jpg`: About section portrait
- `media/*.mp4` and `*-poster.jpg`: the two short videos (muted, compressed for the web) and their still frames
- `leads-config.js`: the link to your Lead CRM

Upload the `media` folder too when hosting.

## Put it online for free (GitHub Pages)
1. Create a free account at github.com.
2. Create a new public repository, for example `rafael-realtor`.
3. Upload `index.html` and the `img` folder (Add file > Upload files), then Commit.
4. Open Settings > Pages, choose "Deploy from a branch", pick `main` and `/ (root)`, and Save.
5. After a minute or two the site is live at `https://<your-username>.github.io/rafael-realtor/`.

Other free options that work the same way: Netlify (drag the folder onto app.netlify.com/drop) or Cloudflare Pages.

## Optional cost
A custom domain (for example a `.realtor` or `.com` address) is the only thing that costs money, usually paid yearly to a domain registrar. GitHub Pages can use it for free once you own it.

## How the contact form works
Once the free Lead CRM is set up (see `crm/README.md`), every message from the form goes straight into your Google Sheet, you get an alert email, and the person gets a thank-you email. Paste your CRM link into `leads-config.js` to turn this on. Until then, the form opens the visitor's own email app with their message addressed to rafaelarcegazo@gmail.com.

The form has two optional permission boxes (emails, and calls/texts) with the wording the law expects. What each person agreed to is saved in the CRM.

## Other pages
- `privacy.html`: privacy notice in English and Spanish, linked from the form and the footer.
- `open-house.html`: sign-in sheet for open houses. Open it on a tablet as `open-house.html?property=123 Main St`.
- `crm/`: the Lead CRM (lead capture, follow-up reminders, email campaigns, compliance checks). It runs in Google Sheets, not on the website.

## Editing text
Each English text has a `data-i18n` key. Its Spanish version is in the `T.es` list near the bottom of `index.html` under the same key. Change both when editing.

## Before going live
Nevada advertising rules generally require the brokerage name to appear clearly. It is shown in the header, contact section, and footer. Ask DH Capital Realty if they need anything else on the site, such as the brokerage's address or phone.

## Booking calendar (free)
1. In Google Calendar (rafaelarcegazo@gmail.com), click Create > Appointment schedule.
2. Set the meeting length, your available hours, and where you meet (phone, Google Meet, or in person). Save.
3. Click the schedule, then Share > Website embed (or copy the booking page link).
4. In `index.html`, find `const BOOKING_URL = "";` and paste the link between the quotes.
Visitors then see your live open times and book directly. Google sends the confirmation and reminder emails.

## Listings
- The "My listings" section in `index.html` has one card per home. Copy a `<article class="card listing">` block to add a home, and delete it (or change the tag to Pending / Sold) when it changes.
- Each listing has its own page: `listings/sample-home/index.html` is the template. To add a home:
  1. Copy the `listings/sample-home` folder and rename it after the street, e.g. `listings/1234-desert-rose-ave`.
  2. Put the photos in that folder (e.g. `photos/01.jpg`) and, if you have one, the video.
  3. Open its `index.html`, edit the `LISTING` block near the bottom (price, address, beds, baths, description in English and Spanish, photos, MLS number), and set `sample: false`.
  4. Update the `<title>` and `og:` lines at the top so the link looks right when shared.
  5. The page is then live at `keyhouserafael.realtor/listings/1234-desert-rose-ave/`.
- Showing requests open the visitor's email app addressed to rafaelarcegazo@gmail.com (free, like the contact form).
- Check with DH Capital Realty and the MLS rules before publishing listing photos and details.

### Current listing
- `listings/7942-firethorn-ln/`: 7942 Firethorn Ln, Las Vegas, NV 89123 · $539,999 · MLS# 2829947. Photos are in its `photos` folder. When it goes pending or sells, change `status` in its `LISTING` block and the tag on its card in `index.html`.
- `listings/sample-home/` is the blank template (hidden from search engines).
