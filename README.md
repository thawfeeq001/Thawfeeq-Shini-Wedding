<!-- ==========================================================
LANDMARK VERSION 1.0
Project : Thawfeeq & Shini Wedding
Purpose : Stable editable baseline before redesign
Do not delete this marker.
=========================================================== -->

# Thawfeeq Ahamed &amp; Shini Yassmin — Wedding Website

A luxury editorial wedding website. Photographs carry the story; the type stays
out of their way.

**Version 2.4.** Portrait phones keep the stacked reading experience; every
landscape viewport — a phone turned sideways, an iPad, a desktop — switches to
a split screen, automatically, on rotation. Every photograph is WebP under
`images/`, named for what it is. One viewer serves the whole page, with pinch
to 4×, drag, double-tap and swipe.

| Branch | What it holds |
| --- | --- |
| `main` | the live site |
| `v2.3` | archived — iOS hardening, reversible reveals, the storytelling chapter |
| `v2.2` | archived — the watercolour editorial build |
| `landmark-v1.0` | the original clean baseline |

**Dr. M. Thawfeeq Ahamed**, MS (General Surgery) &nbsp;·&nbsp; **Dr. S. Shini Yassmin**, MD (General Medicine)

| Event | When | Where |
| --- | --- | --- |
| Engagement | 24 October 2026 · 7:00 PM | Drizzle Elite Mahal, Courtallam |
| Nikah | 25 October 2026 · 11:00 AM | Drizzle Elite Mahal, Courtallam |
| Reception | 1 November 2026 · 12:00 PM | Arulanandham Mahal, Thanjavur |

**Live site:** https://thawfeeq001.github.io/Thawfeeq-Shini-Wedding/

---

## Page order (version 2.4)

Home (logo, names, countdown) → **Groom &amp; Bride** on one split screen →
**Groom Family &amp; Bride Family** on the next → **Gallery** → **Events** →
Timeline → **Wishes &amp; RSVP** → Farewell.

The gallery is one section in two parts: **Fixing Ceremony** first, then
**Couple**. The split is by subject — the fixing part is that day, the couple
part is the two of them — and each part pages within itself in the viewer
rather than wandering into the other.

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

Every photograph is WebP and lives under `images/`, in a folder named for the
part of the page it belongs to, under a filename that says what it is.

| Folder | Files | Where it appears |
| --- | --- | --- |
| `images/hero/` | `hero-couple-main.webp` | Home — the coloured studio portrait |
| | `farewell-couple-bw.webp` | Farewell — the black &amp; white portrait |
| `images/groom/` | `groom-portrait-1.webp` | Groom, left half of the split screen |
| `images/bride/` | `bride-portrait-1.webp` | Bride, right half |
| `images/family/` | `groom-family-group-1.webp`, `groom-with-sister-1.webp` | Groom Family |
| | `bride-family-group-1.webp` | Bride Family |
| `images/story/` | `story-couple-*.webp` (14) | Gallery, couple part |
| `images/gallery/` | `gallery-family-*.webp` (9) | Gallery, fixing-ceremony part |
| `images/events/` | `event-engagement/-wedding/-reception.webp` | the three event cards |
| `images/qr/` | `engagement-/wedding-/reception-location.png` | the venue QR codes |

QR codes stay PNG on purpose. A lossy codec smears the module edges and costs
scans; the photographs have no such constraint, so they are all WebP — roughly
a third smaller than the JPEGs they replaced, at the same size on screen.

### Adding or removing photographs

Both galleries are built in JavaScript from one list each at the top of
`script.js`, so no count is written into the HTML — add a filename and the
grid grows:

```js
const COUPLE_DIR = 'images/story/';
const COUPLE_PHOTOS = [
  { file: 'story-couple-first-selfie.webp', cap: 'The first photograph of us', w: 900, h: 1125 },
  …
];

const FIXING_DIR = 'images/gallery/';
const FIXING_PHOTOS = [
  { file: 'gallery-family-fixing-ceremony.webp', cap: 'The fixing ceremony', w: 1360, h: 950 },
  …
];
```

`w` and `h` are the file's own pixel dimensions. They are written onto every
tile so the browser reserves the right box before the photograph arrives —
that is what holds the layout shift at zero while the images stream in.

Move a filename from one list to the other and the grids follow.

> A page served from GitHub Pages cannot read its own folder — there is no
> server to ask for a directory listing — so these lists are the manifest. Drop
> the file into the right folder and add its name here; that is the whole step.

### The one viewer

Any element carrying `data-lb="<group>"` opens the photo viewer, and the group
name decides which pictures it can page through. Clicks are delegated from the
document, so a tile built minutes later needs no wiring. The viewer supports
arrows, the keyboard, swipe, pinch to 4×, drag while zoomed, double-tap and a
thumbnail strip; the zoom resets whenever the photograph changes.

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
