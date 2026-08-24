# Thawfeeq &amp; Shini Yassmin — Wedding Website

A premium, offline-capable wedding invitation website.

**Dr. M. Thawfeeq Ahamed**, MS General Surgery &nbsp;·&nbsp; **Dr. S. Shini Yassmin**, MD General Medicine

| Event | When | Where |
| --- | --- | --- |
| **Nikkah** | Sunday, 25 October 2026 · 11:00 AM | Drizzle Elite Mahal, Madurai–Courtallam Main Road, Courtallam |
| **Reception** | Sunday, 1 November 2026 · 12:00 PM | Arulanandham Mahal, Eswari Nagar, Reddipalayam Main Road, Thanjavur |

**Live site:** https://thawfeeq001.github.io/Thawfeeq-Shini-Wedding/

---

## Contents

1. [What is inside](#1-what-is-inside)
2. [Running it locally](#2-running-it-locally)
3. [How to replace the photos](#3-how-to-replace-the-photos)
4. [How to edit the names and wording](#4-how-to-edit-the-names-and-wording)
5. [How to change the dates and times](#5-how-to-change-the-dates-and-times)
6. [How the countdown works](#6-how-the-countdown-works)
7. [How to add the Google Maps links](#7-how-to-add-the-google-maps-links)
8. [How to connect the RSVP to Google Sheets](#8-how-to-connect-the-rsvp-to-google-sheets)
9. [How to add background music](#9-how-to-add-background-music)
10. [How to deploy again](#10-how-to-deploy-again)
11. [After the wedding](#11-after-the-wedding)
12. [Troubleshooting](#12-troubleshooting)

---

## 1 · What is inside

```
Thawfeeq-Shini-Wedding/
├── index.html          all page content (splash, hero, countdown, story,
│                       family, timeline, events, RSVP, gallery, footer)
├── style.css           the complete watercolour theme
├── script.js           all behaviour — the CONFIG block at the top is the
│                       only part you normally need to edit
├── manifest.json       “Add to Home Screen” / installable app settings
├── sw.js               service worker — offline caching
├── robots.txt          search engine instructions
├── sitemap.xml         search engine sitemap
├── favicon.png         browser tab icon
├── .nojekyll           tells GitHub Pages to serve the files as they are
├── photos/             couple, family and gallery placeholders
├── venues/             venue placeholders (nikkah.jpg, reception.jpg)
├── assets/             watercolour washes, divider, icons, share image
└── .github/workflows/  automatic deployment to GitHub Pages
```

Everything is plain HTML, CSS and JavaScript. There is no build step, no
framework and nothing to install.

**Theme** — Ivory `#F7F3EC` · Warm Beige `#E9DFC9` · Blue Grey `#BCC7CE` ·
Gold `#B08D57` · Charcoal `#232323`.

---

## 2 · Running it locally

**The quick way** — double-click `index.html`. Everything works except the
service worker (browsers only allow it over `http://` or `https://`).

**The complete way** — from the project folder run any small web server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## 3 · How to replace the photos

Every image is a placeholder that says which photo belongs there. **Keep the
same file name** and the website picks the new photo up automatically — no
code change needed.

| Replace this file | Shown as |
| --- | --- |
| `photos/hero-couple.jpg` | the large portrait at the top |
| `photos/engagement-1.jpg`, `photos/engagement-2.jpg` | Our Story collage |
| `photos/ring-ceremony.jpg`, `photos/candid.jpg` | Our Story collage (wide) |
| `photos/couple-1.jpg`, `photos/couple-2.jpg` | Our Story collage |
| `photos/father.jpg`, `photos/mother.jpg`, `photos/sister.jpg` | groom’s family circles |
| `photos/bride-father.jpg`, `photos/bride-mother.jpg` | bride’s family circles |
| `photos/gallery-01.jpg` … `photos/gallery-12.jpg` | the gallery |
| `venues/nikkah.jpg`, `venues/reception.jpg` | the two event cards |
| `assets/og-image.jpg` | the preview card on WhatsApp / Facebook |

**Recommended sizes** — portraits 1400×1750, family circles 800×800 (square),
gallery 1000–1400 px wide, venues 1600×900, share image 1200×630.
Keep each photo under about 400 KB so the site stays fast; any online
“compress JPEG” tool does this in seconds.

If a photo looks stretched, it is not square/portrait enough — the site crops
to fill, so square photos work best for the family circles.

> The `width` and `height` attributes in `index.html` only reserve space while
> a photo loads. A different size still displays correctly, but updating those
> two numbers to match your photo prevents the page from shifting as it loads.

**Adding more gallery photos:** copy one `<button class="ph" …>` block inside
`<div class="masonry">` in `index.html`, point it at your new file and give it
the next `data-index` number.

---

## 4 · How to edit the names and wording

All wording lives in `index.html`. Open it in any text editor, use *Find* for
the words you want to change and type over them. The names appear in these
places:

| Section | Search for |
| --- | --- |
| Splash screen | `splash__names` |
| Hero heading and degrees | `hero__names`, `hero__creds` |
| Hosts | `hosted__names` and `hero__hosted` |
| Groom’s family | `The Groom’s Family` |
| Bride’s family | `The Bride’s Family` |
| Grandparents | `grand__list` |
| Qur’an verse | `hero__quote` |
| Our Story paragraph | `section-lead` inside `<section id="story">` |
| “No gifts, please.” | `footer__gift` |

Two names also appear in `script.js` (the message shared on WhatsApp) and in
the `<title>`/`og:` tags at the top of `index.html` — update those too so the
link preview stays correct.

---

## 5 · How to change the dates and times

Open `script.js` and edit the **CONFIG** block at the very top:

```js
const NIKKAH_AT    = "2026-10-25T11:00:00+05:30";
const RECEPTION_AT = "2026-11-01T12:00:00+05:30";
const THANKS_FROM  = "2026-11-02T00:00:00+05:30";
```

The format is `YYYY-MM-DDTHH:MM:SS+05:30`, where `+05:30` is Indian Standard
Time. Because the offset is written explicitly, the countdown is correct for
guests in any country.

Change the dates that guests *read* in `index.html` too — the timeline entries,
the two event cards and the hero dates are ordinary text.

---

## 6 · How the countdown works

The countdown switches itself. You never need to edit it on the day.

| When | What the section shows |
| --- | --- |
| Before `NIKKAH_AT` | **Countdown to the Nikkah** |
| Between `NIKKAH_AT` and `RECEPTION_AT` | **Countdown to the Reception** |
| Between `RECEPTION_AT` and `THANKS_FROM` | **The Reception is Today** |
| After `THANKS_FROM` (after 1 Nov 2026) | **Thank you for celebrating with us ❤️** |

To move the thank-you message earlier or later, change `THANKS_FROM` only.

---

## 7 · How to add the Google Maps links

Both venue buttons work out of the box — they search Google Maps for the venue
name and address. To point them at the exact pin instead:

1. Open Google Maps and find the venue.
2. Tap **Share → Copy link**.
3. Paste it into `script.js`:

```js
const NIKKAH_MAP = "https://maps.app.goo.gl/xxxxxxxx";
const RECEPTION_MAP = "https://maps.app.goo.gl/yyyyyyyy";
```

Leave a value empty (`""`) to keep the automatic search behaviour for that
venue.

---

## 8 · How to connect the RSVP to Google Sheets

Until this is done the form validates normally and then tells you the endpoint
is missing. It takes about five minutes to connect.

**Step 1 — create the sheet**

Create a new Google Sheet named *Wedding RSVP*. Put these headers in row 1:

| A | B | C | D |
| --- | --- | --- | --- |
| Timestamp | Name | Guests | Page |

**Step 2 — add the script**

In that sheet choose **Extensions → Apps Script**, delete whatever is there and
paste this:

```js
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var data = (e && e.parameter) ? e.parameter : {};
    sheet.appendRow([
      new Date(),
      data.name || '',
      data.guests || '',
      data.page || ''
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('RSVP endpoint is running.');
}
```

**Step 3 — publish it**

**Deploy → New deployment → Web app**, then set:

- *Description*: `Wedding RSVP`
- *Execute as*: **Me**
- *Who has access*: **Anyone**

Click **Deploy**, approve the permission prompt, and copy the **Web app URL**
(it ends in `/exec`).

**Step 4 — paste the URL into the site**

```js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfy…/exec";
```

Save, commit, push. Submit a test RSVP — the row should appear in the sheet
straight away.

> Whenever you change the Apps Script code, use **Deploy → Manage deployments →
> Edit → New version**, otherwise the old version keeps running.

---

## 9 · How to add background music

By default the music button plays a soft ambient melody generated in the
browser, so there is no file to download and it works offline.

To use your own track instead, put the file in `assets/` and set:

```js
const MUSIC_URL = "assets/music.mp3";
```

Browsers only allow sound after a tap, which is why music starts when a guest
presses **Open Invitation** or the music button.

---

## 10 · How to deploy again

The site is deployed by GitHub Pages from the `main` branch. Any change you
push is published automatically.

```bash
git add .
git commit -m "Replace hero photo"
git push origin main
```

Give it one or two minutes, then reload
https://thawfeeq001.github.io/Thawfeeq-Shini-Wedding/.

**Turning Pages on (only needed once):** repository **Settings → Pages →
Build and deployment**. Either source works:

- **Deploy from a branch** → branch `main`, folder `/ (root)` — simplest.
- **GitHub Actions** — uses `.github/workflows/deploy.yml`, included here, and
  shows each deployment under the **Actions** tab.

**Guests still see the old version?** The service worker keeps a copy for
offline use. Open `sw.js`, change `const CACHE_VERSION = 'v1';` to `'v2'`, and
push. Everyone receives the update on their next visit.

**Repository visibility:** the repository is public, which is what free GitHub
Pages requires. It can be made private under **Settings → General → Danger
Zone**, but the published site then needs a paid GitHub plan to stay online.

---

## 11 · After the wedding

Nothing needs to be done. After 1 November 2026 the countdown replaces itself
with *“Thank you for celebrating with us ❤️”*. Replace the gallery placeholders
with real wedding photographs and the site becomes a keepsake.

---

## 12 · Troubleshooting

| Problem | Fix |
| --- | --- |
| A photo does not appear | Check the file name and extension match exactly, including lower case `.jpg` |
| Photos changed but the old ones still show | Hard-refresh (Ctrl/Cmd + Shift + R), or bump `CACHE_VERSION` in `sw.js` |
| RSVP says it is not connected | `SCRIPT_URL` in `script.js` is still empty |
| RSVP fails to send | Re-deploy the Apps Script with *Who has access* set to **Anyone** |
| Map buttons open a search | Expected until `NIKKAH_MAP` / `RECEPTION_MAP` are filled in |
| Music does not start | Tap the music button once — browsers require a tap before playing audio |
| Fonts look plain | The device is offline and cannot reach Google Fonts; the layout still holds |

---

## Licence

Released under the [MIT Licence](LICENSE). The photographs and family details
belong to the couple.

*Made with love for our families and friends.*
