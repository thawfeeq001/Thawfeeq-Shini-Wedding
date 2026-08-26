/* Draw the three event-card illustrations and encode them as WebP.
   Original artwork in the site palette - gold linework on warm paper -
   so the three cards read as one set instead of three stock photos of
   other people's weddings. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const W = 1200, H = 750;
const GOLD = '#C8A46A', DEEP = '#A8834A', ROSE = '#B76E79', SAGE = '#A8B49A';

/* shared paper ground: warm base, blush wash top-left, gold wash bottom-right */
const ground = (a, b) => `
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FBF6F0"/><stop offset="1" stop-color="#F4EBE2"/>
    </linearGradient>
    <radialGradient id="washA" cx="18%" cy="8%" r="62%">
      <stop offset="0" stop-color="${a}" stop-opacity=".40"/><stop offset="1" stop-color="${a}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="washB" cx="88%" cy="94%" r="66%">
      <stop offset="0" stop-color="${b}" stop-opacity=".34"/><stop offset="1" stop-color="${b}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="46%" r="46%">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity=".72"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#paper)"/>
  <rect width="${W}" height="${H}" fill="url(#washA)"/>
  <rect width="${W}" height="${H}" fill="url(#washB)"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>`;

/* a sprig of leaves along a curve, used under each motif */
function sprig(cx, cy, span, flip) {
  const s = flip ? -1 : 1;
  let d = `M ${cx} ${cy} C ${cx + s * span * 0.34} ${cy - 16}, ${cx + s * span * 0.68} ${cy - 10}, ${cx + s * span} ${cy + 8}`;
  let leaves = '';
  for (let i = 1; i <= 6; i++) {
    const t = i / 7;
    const x = cx + s * span * t;
    const y = cy - 14 * Math.sin(Math.PI * t) + 8 * t * t;
    const r = 15 - 8 * t;
    leaves += `<ellipse cx="${x.toFixed(1)}" cy="${(y - r * 0.75).toFixed(1)}" rx="${(r * 0.45).toFixed(1)}" ry="${r.toFixed(1)}"
                 fill="${SAGE}" opacity=".55" transform="rotate(${(s * (-28 - t * 26)).toFixed(1)} ${x.toFixed(1)} ${(y - r * 0.75).toFixed(1)})"/>
               <ellipse cx="${x.toFixed(1)}" cy="${(y + r * 0.75).toFixed(1)}" rx="${(r * 0.45).toFixed(1)}" ry="${r.toFixed(1)}"
                 fill="${SAGE}" opacity=".42" transform="rotate(${(s * (28 + t * 26)).toFixed(1)} ${x.toFixed(1)} ${(y + r * 0.75).toFixed(1)})"/>`;
  }
  return `<path d="${d}" fill="none" stroke="${DEEP}" stroke-width="1.6" opacity=".6"/>${leaves}`;
}

/* scattered specks of light */
function motes(seed) {
  let out = '', s = seed;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 26; i++) {
    const x = rnd() * W, y = rnd() * H, r = 1.2 + rnd() * 3.4;
    out += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${i % 3 ? GOLD : ROSE}" opacity="${(0.10 + rnd() * 0.22).toFixed(2)}"/>`;
  }
  return out;
}

/* ---------- 1. ENGAGEMENT: two interlocking rings ---------- */
const engagement = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ground(ROSE, GOLD)}
  ${motes(7)}
  <g transform="translate(600 312)">
    <circle cx="-72" cy="0" r="118" fill="none" stroke="${GOLD}" stroke-width="9"/>
    <circle cx="-72" cy="0" r="118" fill="none" stroke="#F0DCB8" stroke-width="3"/>
    <circle cx="72" cy="0" r="118" fill="none" stroke="${DEEP}" stroke-width="9"/>
    <circle cx="72" cy="0" r="118" fill="none" stroke="#E7CFA4" stroke-width="3"/>
    <!-- the solitaire on the upper ring -->
    <g transform="translate(72 -118)">
      <path d="M -19 4 L 0 -22 L 19 4 L 0 24 Z" fill="#FFFFFF" opacity=".92" stroke="${DEEP}" stroke-width="2"/>
      <path d="M -19 4 L 19 4 M 0 -22 L 0 24 M -19 4 L 0 -22 L 19 4" fill="none" stroke="${DEEP}" stroke-width="1.4" opacity=".7"/>
    </g>
    <!-- highlight arcs so the metal reads as round -->
    <path d="M -150 -52 A 118 118 0 0 1 -104 -104" fill="none" stroke="#FFFFFF" stroke-width="4" opacity=".7" stroke-linecap="round"/>
    <path d="M 6 -52 A 118 118 0 0 1 52 -104" fill="none" stroke="#FFFFFF" stroke-width="4" opacity=".7" stroke-linecap="round"/>
  </g>
  ${sprig(468, 528, 186, true)}
  ${sprig(732, 528, 186, false)}
  <circle cx="600" cy="538" r="5" fill="${GOLD}"/>
</svg>`;

/* ---------- 2. WEDDING: the nikkah arch ---------- */
const wedding = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ground(GOLD, SAGE)}
  ${motes(21)}
  <defs>
    <linearGradient id="arch" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity=".85"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity=".16"/>
    </linearGradient>
  </defs>
  <g transform="translate(600 0)">
    <!-- ogee arch, filled with light -->
    <path d="M -150 640 L -150 300 C -150 190, -84 118, 0 96 C 84 118, 150 190, 150 300 L 150 640 Z"
          fill="url(#arch)" stroke="${GOLD}" stroke-width="7"/>
    <path d="M -118 640 L -118 306 C -118 212, -62 152, 0 132 C 62 152, 118 212, 118 306 L 118 640"
          fill="none" stroke="${DEEP}" stroke-width="2" opacity=".55"/>
    <!-- crescent and star above the crown -->
    <g transform="translate(0 60)">
      <path d="M 0 -34 A 34 34 0 1 0 24 22 A 27 27 0 1 1 0 -34 Z" fill="${GOLD}"/>
      <path d="M 44 -14 l 5.4 11.6 12.6 1.6 -9.4 8.6 2.6 12.6 -11.2 -6.4 -11.2 6.4 2.6 -12.6 -9.4 -8.6 12.6 -1.6 Z" fill="${DEEP}"/>
    </g>
    <!-- minarets -->
    <g stroke="${DEEP}" stroke-width="4" fill="none" opacity=".72">
      <path d="M -238 640 L -238 372 M -238 372 q 0 -34 22 -50 q 22 16 22 50 M -216 640 L -216 372"/>
      <path d="M 238 640 L 238 372 M 238 372 q 0 -34 -22 -50 q -22 16 -22 50 M 216 640 L 216 372"/>
    </g>
    <line x1="-330" y1="640" x2="330" y2="640" stroke="${GOLD}" stroke-width="4" opacity=".8"/>
  </g>
  ${sprig(430, 690, 150, true)}
  ${sprig(770, 690, 150, false)}
</svg>`;

/* ---------- 3. RECEPTION: a floral wreath ----------
   Deliberately not glassware: this is a nikkah, and a pair of champagne
   coupes would be the wrong note on a Muslim wedding invitation. A
   wreath carries the same celebratory weight and none of that. */
function wreath(cx, cy, R) {
  let out = '';
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    const deg = (a * 180) / Math.PI + 90;
    const big = i % 5 === 0;
    if (big) {
      /* a bloom: five soft petals around a gold centre */
      let petals = '';
      for (let k = 0; k < 5; k++) {
        petals += `<ellipse cx="0" cy="-13" rx="7.5" ry="13" fill="${i % 10 === 0 ? ROSE : '#EFD8D8'}"
                     opacity=".78" transform="rotate(${k * 72})"/>`;
      }
      out += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${petals}<circle r="5.5" fill="${GOLD}"/></g>`;
    } else {
      out += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})">
                <ellipse cx="-11" cy="0" rx="6" ry="15" fill="${SAGE}" opacity=".62" transform="rotate(-32 -11 0)"/>
                <ellipse cx="11" cy="0" rx="6" ry="15" fill="${SAGE}" opacity=".48" transform="rotate(32 11 0)"/>
              </g>`;
    }
  }
  return `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${DEEP}" stroke-width="1.8" opacity=".42"/>${out}`;
}

const reception = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ground(SAGE, ROSE)}
  ${motes(53)}
  ${wreath(600, 322, 186)}
  <g transform="translate(600 322)">
    <!-- a single gold sparkle, echoing the solitaire on the engagement card -->
    <path d="M 0 -46 C 6 -16, 16 -6, 46 0 C 16 6, 6 16, 0 46 C -6 16, -16 6, -46 0 C -16 -6, -6 -16, 0 -46 Z"
          fill="${GOLD}" opacity=".9"/>
    <path d="M 0 -22 C 3 -8, 8 -3, 22 0 C 8 3, 3 8, 0 22 C -3 8, -8 3, -22 0 C -8 -3, -3 -8, 0 -22 Z"
          fill="#FFFFFF" opacity=".55"/>
  </g>
  ${sprig(452, 560, 176, true)}
  ${sprig(748, 560, 176, false)}
  <circle cx="600" cy="570" r="5" fill="${DEEP}"/>
</svg>`;

const OUT = '/home/user/Thawfeeq-Shini-Wedding/images/events/';
const jobs = [
  ['event-engagement.webp', engagement],
  ['event-wedding.webp', wedding],
  ['event-reception.webp', reception]
];

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('about:blank');
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, svg] of jobs) {
    const data = await page.evaluate(async ({ svg, w, h }) => {
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      await img.decode();
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const g = c.getContext('2d');
      g.imageSmoothingQuality = 'high';
      g.drawImage(img, 0, 0, w, h);
      return c.toDataURL('image/webp', 0.9).split(',')[1];
    }, { svg, w: W, h: H });
    fs.writeFileSync(OUT + name, Buffer.from(data, 'base64'));
    console.log(name.padEnd(26), W + 'x' + H, (fs.statSync(OUT + name).size / 1024).toFixed(0) + 'KB');
  }
  /* one contact sheet so the three can be reviewed together */
  await page.setViewportSize({ width: 1240, height: 820 });
  await page.setContent('<body style="margin:0;background:#fff;display:grid;gap:10px;padding:10px">' +
    jobs.map(j => '<img src="data:image/svg+xml;base64,' +
      Buffer.from(j[1]).toString('base64') + '" style="width:100%;display:block">').join('') + '</body>');
  await page.screenshot({ path: '/tmp/claude-0/-home-user-Thawfeeq-Shini-Wedding/4d5e3efc-f4e5-5d70-958f-34991aa0b57e/scratchpad/event-art-sheet.png', fullPage: true });
  await browser.close();
})();
