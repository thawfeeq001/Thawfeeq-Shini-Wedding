<!-- ==========================================================
LANDMARK VERSION 1.0
Project : Thawfeeq & Shini Wedding
Purpose : Stable editable baseline before redesign
Do not delete this marker.
=========================================================== -->

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

## Page order (version 2.0)

1. **Hero** — coloured couple portrait, monogram, names, date
2. **Countdown** — horizontal ivory card over a watercolour mosque
3. *"Two hearts. One beautiful journey."*
4. **Meet the Groom**
5. *"The man whose kindness became home."*
6. **Meet the Bride**
7. *"Behind every love story stand the families who shaped it."*
8. **Groom Family** · 9. **Bride Family**
10. *"A day where two families became one."*
11. **Fixing Ceremony** — masonry collage
12. **Couple Gallery** — masonry with lightbox
13. *"And now, we joyfully invite you to celebrate with us."*
14. **Events** · 15. **Timeline** · 16. **RSVP**
17. **Closing** — black &amp; white portrait, *"And so our forever begins."*

**Palette** Background `#FDF9F5` · Paper `#F8F2EC` · Blush `#EFD8D8` ·
Rose `#B76E79` · Sage `#A8B49A` · Gold `#C8A46A` · Text `#463636`
**Type** Playfair Display (headings) · Great Vibes (names) · Inter (body)

---

## Landmark v1.0 — the restore point

`landmark-v1.0` is a branch on GitHub pinned to the clean, structured baseline.
It never moves. Whatever happens on `main` afterwards, this is the state you can
always come back to: the site exactly as it looks today, with the documented
structure and every photograph in place.

Every editable file carries a `LANDMARK VERSION 1.0` banner at the top. If you
open a file and the banner is there, you are on or descended from this baseline.

**Look at it without touching your work**

```bash
git fetch origin
git checkout landmark-v1.0      # detached — browse, run, copy from it
git checkout main               # back to where you were
```

**Recover one file** — the usual case, when a single file gets into a mess:

```bash
git checkout landmark-v1.0 -- style.css     # or index.html, script.js …
```

**Roll everything back to the landmark**, keeping the history intact:

```bash
git checkout main
git revert --no-commit landmark-v1.0..HEAD
git commit -m "revert: return to landmark v1.0"
git push origin main
```

**Start a fresh line of work from it**, leaving `main` untouched:

```bash
git checkout -b redesign-v2 landmark-v1.0
```

> The branch is the marker because this project's git proxy refuses tag pushes.
> A branch does the same job. Do not commit to `landmark-v1.0` — if you want to
> move the marker later, make a new one (`landmark-v1.1`) rather than editing
> this one, so older references keep working.

---

## Which photo goes where

| File | Where it appears |
| --- | --- |
| `photos/hero-couple.jpg` | Hero — the coloured studio portrait |
| `photos/groom-portrait.jpg` | Meet the Groom |
| `photos/bride-portrait.jpg` | Meet the Bride |
| `photos/groom-family.jpg` + `photos/groom-sister.jpg` | Groom Family |
| `photos/bride-family.jpg` | Bride Family |
| `photos/fixing-*.jpg`, `photos/bride-seated.jpg` | Fixing Ceremony collage (9) |
| `photos/gallery-*.jpg` | Couple Gallery (12) |
| `photos/closing-couple.jpg` | Closing — the black &amp; white portrait |
| `venues/*.jpg` | not used by version 2.0 |

### Adding or removing photographs

The two grids are built in JavaScript from lists at the top of `script.js`, so
no count is written into the HTML — add a filename and the grid grows:

```js
const FIXING_PHOTOS = [ 'fixing-ceremony.jpg', … ];
const COUPLE_PHOTOS = [ 'gallery-selfie.jpg', … ];
```

Keep the three groups apart: family photographs never go in `COUPLE_PHOTOS`,
and couple photographs never go in `FIXING_PHOTOS`.

> A page served from GitHub Pages cannot read its own folder — there is no
> server to ask for a directory listing — so these lists are the manifest.
> Drop the file into `photos/` and add its name here; that is the whole step.

---

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
