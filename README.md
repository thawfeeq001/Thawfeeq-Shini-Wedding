# Thawfeeq Ahamed &amp; Shini Yassmin — Wedding Website

A luxury editorial wedding website. Photographs carry the story; the type stays
out of their way.

**Dr. M. Thawfeeq Ahamed**, MS (General Surgery) &nbsp;·&nbsp; **Dr. S. Shini Yassmin**, MD (General Medicine)

| Event | When | Where |
| --- | --- | --- |
| Engagement | 24 October 2026 · 7:00 PM | — |
| Nikah | 25 October 2026 · 11:00 AM | Drizzle Elite Mahal, Courtallam |
| Reception | 1 November 2026 · 12:00 PM | Arulanandham Mahal, Thanjavur |

**Live site:** https://thawfeeq001.github.io/Thawfeeq-Shini-Wedding/

---

## Page order

1. **Hero** — full-screen black &amp; white portrait, names, date, place
2. **Countdown** — glassmorphism card, updates every second
3. **Meet the Groom**
4. **Meet the Bride**
5. **Groom Family**
6. **Bride Family**
7. **Blessings Begin** — overlapping collage of the fixing ceremony
8. **Together** — Pinterest masonry gallery with a full-screen lightbox
9. **Wedding Venues** — three watercolour cards
10. **Celebration Timeline** — gold vine connector
11. **RSVP** — saved in the guest's browser
12. **Closing** — full-screen colour portrait

---

## Which photo goes where

Every photograph is a real one, named for the place it appears. Replacing a
photo means dropping in a new file with the same name.

| File | Where it appears |
| --- | --- |
| `photos/hero-couple.jpg` | Hero — the black &amp; white couple portrait |
| `photos/groom-portrait.jpg` | Meet the Groom |
| `photos/bride-portrait.jpg` | Meet the Bride |
| `photos/groom-family.jpg` | Groom Family — the large photograph |
| `photos/groom-sister.jpg` | Groom Family — the small overlapping inset |
| `photos/bride-family.jpg` | Bride Family — the bride with her parents |
| `photos/fixing-ceremony.jpg` | Blessings Begin — left |
| `photos/bride-seated.jpg` | Blessings Begin — right |
| `photos/gallery-restaurant.jpg` | Gallery |
| `photos/gallery-car.jpg` | Gallery |
| `photos/gallery-mirror.jpg` | Gallery |
| `photos/gallery-parrot.jpg` | Gallery |
| `photos/gallery-casual.jpg` | Gallery |
| `photos/gallery-families-1.jpg` | Gallery — both families |
| `photos/gallery-families-2.jpg` | Gallery — both families |
| `photos/closing-couple.jpg` | Closing — the full-screen portrait |
| `venues/engagement.jpg`, `venues/nikkah.jpg`, `venues/reception.jpg` | The three venue cards (still placeholders) |

Each photograph is cropped to the aspect ratio its slot needs and compressed to
between 85 and 230 KB. If you replace one, keep it roughly the same shape —
portraits at 4:5, family and ceremony photographs at about 10:7 — and update the
`width` and `height` attributes on that `<img>` in `index.html` so the page does
not shift while it loads.

The hero renders through `filter: grayscale(1)`, so a colour photograph placed
there still appears black &amp; white.

## The monogram

The TS monogram was traced from the artwork supplied by the couple and stored as
two transparent PNGs:

| File | Colour | Used on |
| --- | --- | --- |
| `assets/logo-gold.png` | Champagne gold `#C7A15A` | the navigation bar, over the ivory paper |
| `assets/logo-ivory.png` | Ivory `#FCF9F4` | the hero and the closing page, over the photographs |

The same monogram is the browser tab icon and the home-screen icon
(`favicon.png`, `assets/icon-192.png`, `assets/icon-512.png`,
`assets/icon-maskable-512.png`, `assets/apple-touch-icon.png`) and appears on the
WhatsApp/social share card (`assets/og-image.jpg`). Replace the two PNGs to
change it everywhere on the page; regenerate the icons to change it in the tab.

## Editing the words

There is very little text left, and all of it is in `index.html`:

| What | Find |
| --- | --- |
| Names, date, place on the hero | `hero__names`, `hero__meta` |
| Section headings | `class="display"` |
| Venue cards | `<section id="venues">` |
| Timeline entries | `<section id="timeline">` |
| Closing line | `closing__line` |

Dates, map pins and the optional RSVP endpoint live in the **CONFIG** block at
the top of `script.js`:

```js
const NIKKAH_MAP    = "https://maps.app.goo.gl/wXZqhk89NidwfUpZ6";
const RECEPTION_MAP = "https://maps.app.goo.gl/1XXwGVE348TApdXx5";
const SCRIPT_URL    = "";   // optional Google Apps Script /exec URL
const MUSIC_URL     = "";   // optional audio file
const NIKKAH_AT     = "2026-10-25T11:00:00+05:30";
const RECEPTION_AT  = "2026-11-01T12:00:00+05:30";
const THANKS_FROM   = "2026-11-02T00:00:00+05:30";
```

The map pins came from the QR codes on the printed invitation, and the same two
QR images are shown on the venue cards (`assets/qr-nikkah.png`,
`assets/qr-reception.png`) so guests can scan them off the screen.

**Countdown** — counts to the Nikah, switches itself to the Reception once the
Nikah has passed, and after `THANKS_FROM` replaces itself with a thank-you line.
Nothing to edit on the day.

**RSVP** — replies are stored in the guest's own browser (`localStorage`, key
`wedding-rsvp-entries`) and a thank-you modal appears. To collect them centrally
as well, paste a Google Apps Script `/exec` URL into `SCRIPT_URL`; replies are
then posted there too.

**Music** — the floating button is **off** by default and plays a soft ambient
melody generated in the browser. Point `MUSIC_URL` at an audio file to use your
own track.

---

## Running and deploying

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
```

Deployment is unchanged: GitHub Pages builds from `main` via
`.github/workflows/deploy.yml`. Push and the site republishes.

```bash
git add .
git commit -m "Replace hero photo"
git push origin main
```

If guests still see an old version, bump `CACHE_VERSION` in `sw.js`.

> **Pages must be switched on once:** Settings → Pages → Source → **GitHub
> Actions**. GitHub does not allow a workflow to enable Pages by itself.

---

## Measured performance

Lighthouse (mobile, simulated slow 4G, Chromium 141):

| Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- |
| **91** | **100** | **96** | **100** |

FCP 0.9 s · LCP 3.5 s · TBT 0 ms · CLS 0 · Speed Index 0.9 s. The Best Practices
score reflects one console error in the offline test environment where Google
Fonts was unreachable; it does not occur on the live site.

`style.css` and `script.js` are deliberately not minified so they stay editable.

---

## Licence

[MIT](LICENSE). The photographs and family details belong to the couple.
