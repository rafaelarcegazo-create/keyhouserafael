# Rafael Arce Gazo, REALTOR® website

A one-page bilingual (English / Spanish) website. It is plain HTML with no paid services, so it can be hosted for free.

## Files
- `index.html`: the whole site (text, styles, and the English/Spanish switch)
- `img/rafael-portrait.jpg`, `img/rafael-wide.jpg`: headshots
- `img/dh-capital-realty.png`: brokerage logo
- `img/rafael-seated.jpg`: About section portrait
- `media/*.mp4` and `*-poster.jpg`: the two short videos (muted, compressed for the web) and their still frames

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
The form opens the visitor's own email app with their message addressed to rafaelarcegazo@gmail.com. No paid form service is used. Phone and email are also shown on the page.

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
