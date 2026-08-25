/* ==========================================================
   LANDMARK VERSION 1.0
   Project : Thawfeeq & Shini Wedding
   Purpose : Stable editable baseline before redesign
   Do not delete this marker.

   VERSION 2.2 - production watercolour editorial experience.
   ========================================================== */

/* ==========================================================
   CONTENTS
     01  Configuration        the only block you normally edit
     02  Utilities            selectors, events, toast, overlays
     03  Scroll Animation Module
     04  Navigation Module    sidebar, scrim, progress, active link
     05  Parallax Module
     06  Decoration Module    petals and drifting blobs
     07  Countdown Module
     08  Maps Module
     09  Gallery Module       builds both grids, drives the lightbox
     10  RSVP Module          stepper + Google Sheet + local copy
     10b Memories Module      album, live ceremony, QR message
     11  Music Module
     12  Share Module
     13  PWA Module
     14  Boot
   ========================================================== */
(function () {
  'use strict';

  // ==================================
  // 01 · Configuration
  // ==================================

  /* Exact venue pins, read from the printed invitation QR codes. */
  const NIKKAH_MAP    = "https://maps.app.goo.gl/wXZqhk89NidwfUpZ6";
  const RECEPTION_MAP = "https://maps.app.goo.gl/1XXwGVE348TApdXx5";

  /* Google Apps Script /exec URL. Paste yours here and every RSVP is
     written to the sheet. A copy is always kept in the guest's browser,
     so nothing is lost while this is empty. */
  const SCRIPT_URL = "";

  /* Optional audio file. Empty = the built-in soft ambient melody. */
  const MUSIC_URL = "";

  /* Dates in IST. Change these and the countdown follows. */
  const NIKKAH_AT    = "2026-10-25T11:00:00+05:30";
  const RECEPTION_AT = "2026-11-01T12:00:00+05:30";
  const THANKS_FROM  = "2026-11-02T00:00:00+05:30";

  /* ---- PHOTO LISTS -------------------------------------------------
     Both grids are built from these arrays, so nothing about the count
     is hard-coded in the HTML - add a filename and the grid grows.
     A static site cannot read its own folder (there is no server to ask),
     so this list is the manifest. Keep the three groups separate:
     couple photographs never belong in the ceremony grid, and family
     photographs never belong in the couple gallery.                   */

  const FIXING_PHOTOS = [
    'fixing-ceremony.jpg',
    'bride-seated.jpg',
    'fixing-saree-box.jpg',
    'fixing-blessing.jpg',
    'fixing-garland.jpg',
    'fixing-tray.jpg',
    'fixing-gathering.jpg',
    'fixing-families-1.jpg',
    'fixing-families-2.jpg'
  ];

  const COUPLE_PHOTOS = [
    'gallery-selfie.jpg',      /* first selfie   */
    'gallery-car.jpg',         /* road trip      */
    'gallery-restaurant.jpg',  /* restaurant     */
    'gallery-mirror.jpg',      /* mirror         */
    'gallery-parrot.jpg',      /* parrot         */
    'gallery-casual.jpg',      /* casual         */
    'gallery-cafe.jpg',        /* newly uploaded */
    'gallery-red.jpg',
    'gallery-friends.jpg',
    'gallery-dinner.jpg',
    'gallery-boat-1.jpg',
    'gallery-boat-2.jpg'
  ];

  const VENUES = {
    nikkah:    { name: 'Drizzle Elite Mahal', address: 'Madurai - Courtallam Main Road, Ilanji, Courtallam, Tamil Nadu' },
    reception: { name: 'Arulanandham Mahal',  address: 'Eswari Nagar, Reddipalayam Main Road, Thanjavur, Tamil Nadu' }
  };

  const SHARE_TEXT = 'Thawfeeq & Shini Yassmin — 25 October 2026, Courtallam.';

  /* ---- WEDDING MEMORIES -------------------------------------------
     Paste your own links here. Empty values simply disable the button
     or leave the card showing its poster.                            */
  const DRIVE_URL   = "";   /* shared photo album, e.g. a Drive folder link */
  const YOUTUBE_URL = "";   /* live ceremony, e.g. https://youtu.be/xxxxxxxxxxx */
  const QR_URL      = "";   /* where assets/qr-message.png should point       */
  const LIVE_NOTE   = "Live on 25 October";

  // ==================================
  // 02 · Utilities
  // ==================================

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 3200);
  }

  /* Run fn on scroll, at most once per animation frame, and once now. */
  function onScrollFrame(fn) {
    let ticking = false;
    const run = () => { fn(); ticking = false; };
    on(window, 'scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(run);
    }, { passive: true });
    fn();
  }

  /* One behaviour for both full-screen layers - lightbox and modal. */
  function createOverlay(el, options) {
    const opts = options || {};
    let lastFocus = null;
    const isOpen = () => !!el && !el.hidden;

    function open() {
      if (!el || isOpen()) return;
      lastFocus = document.activeElement;
      el.hidden = false;
      document.body.classList.add('is-locked');
      requestAnimationFrame(() => el.classList.add('is-on'));
      const target = opts.focus && opts.focus();
      if (target) target.focus({ preventScroll: true });
    }
    function close() {
      if (!isOpen()) return;
      el.classList.remove('is-on');
      document.body.classList.remove('is-locked');
      setTimeout(() => {
        el.hidden = true;
        if (opts.onClosed) opts.onClosed();
      }, opts.delay || 400);
      if (opts.restoreFocus && lastFocus && lastFocus.focus) {
        lastFocus.focus({ preventScroll: true });
      }
    }
    on(el, 'click', e => { if (e.target === el) close(); });
    on(document, 'keydown', e => { if (e.key === 'Escape' && isOpen()) close(); });
    return { open: open, close: close, isOpen: isOpen };
  }

  /* Build one masonry tile. Every photograph below the fold is lazy. */
  function buildTile(file, alt, clickable) {
    const el = document.createElement(clickable ? 'button' : 'figure');
    el.className = 'ph reveal';
    if (clickable) el.type = 'button';
    const img = document.createElement('img');
    img.src = 'photos/' + file;
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    el.appendChild(img);
    return el;
  }

  // ==================================
  // 03 · Scroll Animation Module
  // ==================================
  /* Fade up, fade left and fade right - all driven by one observer.
     No bounce, no scroll-linked layout work. */

  let revealObserver = null;
  let observerReported = false;   /* proof the browser actually delivers callbacks */

  function observeReveals(root) {
    const items = $$('.reveal, .reveal-left, .reveal-right, .tl__i', root || document);
    if (!('IntersectionObserver' in window) || REDUCED) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        observerReported = true;
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const peers = el.parentElement
            ? $$('.reveal, .reveal-left, .reveal-right, .tl__i', el.parentElement) : [];
          el.style.setProperty('--d', Math.min(Math.max(0, peers.indexOf(el)), 5) * 80 + 'ms');
          el.classList.add('is-in');
          revealObserver.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    items.forEach(el => revealObserver.observe(el));
  }

  /* Safety net. Content must never be permanently invisible. If the browser
     has not delivered a single observer callback - some iOS Safari builds do
     exactly that - reveal everything, and keep watching so that grids built
     later are caught too. */
  function revealWatchdog(attempt) {
    if (observerReported || attempt > 6) return;
    setTimeout(function () {
      if (observerReported) return;
      $$('.reveal:not(.is-in), .reveal-left:not(.is-in), .reveal-right:not(.is-in)')
        .forEach(el => el.classList.add('is-in'));
      revealWatchdog(attempt + 1);
    }, 1600);
  }

  function initReveal() {
    observeReveals(document);
    revealWatchdog(0);
  }

  // ==================================
  // 04 · Navigation Module
  // ==================================
  /* The sidebar has exactly one source of truth - the `open` flag - and
     every control routes through setMenu(). That is what removes the
     double-click bug: the burger cannot fall out of step with the panel.
     Closes on the scrim, the close icon, a menu link, or Escape. */

  function initNav() {
    const bar = $('#topbar');
    const burger = $('#burger');
    const nav = $('#sidenav');
    const scrim = $('#scrim');
    const progress = $('#progress');
    const links = $$('.sidenav__list a');
    let open = false;

    function setMenu(next) {
      if (next === open) return;
      open = next;
      if (nav) {
        nav.classList.toggle('is-open', open);
        nav.setAttribute('aria-hidden', open ? 'false' : 'true');
      }
      if (burger) {
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      }
      if (scrim) {
        if (open) {
          scrim.hidden = false;
          requestAnimationFrame(() => scrim.classList.add('is-on'));
        } else {
          scrim.classList.remove('is-on');
          setTimeout(() => { if (!open) scrim.hidden = true; }, 400);
        }
      }
      document.body.classList.toggle('is-locked', open);
    }

    on(burger, 'click', () => setMenu(!open));
    on($('#navClose'), 'click', () => setMenu(false));
    on(scrim, 'click', () => setMenu(false));
    on(document, 'keydown', e => { if (e.key === 'Escape') setMenu(false); });
    /* Let the browser handle the hash jump (smooth scrolling is CSS),
       then close the panel. */
    links.forEach(a => on(a, 'click', () => setMenu(false)));
    on(window, 'resize', () => { if (window.innerWidth > 1100) setMenu(false); }, { passive: true });

    onScrollFrame(() => {
      const y = window.scrollY || window.pageYOffset;
      if (bar) bar.classList.toggle('is-on', y > window.innerHeight * 0.6);
      if (progress) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
      }
    });

    /* active section highlight */
    if ('IntersectionObserver' in window) {
      const map = links
        .map(a => ({ a: a, el: document.querySelector(a.getAttribute('href')) }))
        .filter(m => m.el);
      const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const hit = map.find(m => m.el === entry.target);
          if (!hit) return;
          map.forEach(m => m.a.classList.remove('is-active'));
          hit.a.classList.add('is-active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      map.forEach(m => spy.observe(m.el));
    }
  }

  // ==================================
  // 05 · Parallax Module
  // ==================================
  /* Slow drift on the two full-screen photographs and the watercolour
     blobs. Transform only, so it stays on the compositor at 60fps. */

  function initParallax() {
    if (REDUCED) return;
    const layers = [
      { el: $('.hero__img'), speed: 0.14, base: 'scale(1.05)' },
      { el: $('.closing__img'), speed: 0.09, base: '' }
    ].filter(l => l.el);
    const blobs = [
      { el: $('.blob--a'), speed: 0.05 },
      { el: $('.blob--b'), speed: -0.04 }
    ].filter(b => b.el);
    if (!layers.length && !blobs.length) return;

    onScrollFrame(() => {
      const y = window.scrollY || window.pageYOffset;
      layers.forEach(l => {
        const rect = l.el.parentElement.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
        const shift = (rect.top + rect.height / 2 - window.innerHeight / 2) * -l.speed;
        l.el.style.transform = l.base + ' translate3d(0,' + shift.toFixed(1) + 'px,0)';
      });
      blobs.forEach(b => {
        b.el.style.transform = 'translate3d(0,' + (y * b.speed).toFixed(1) + 'px,0)';
      });
    });
  }

  // ==================================
  // 06 · Decoration Module
  // ==================================

  function initPetals() {
    const host = $('#petals');
    if (!host || REDUCED) return;
    const tints = ['rgba(239,216,216,.85)', 'rgba(183,110,121,.42)', 'rgba(200,164,106,.45)', 'rgba(168,180,154,.5)'];
    const count = window.innerWidth < 700 ? 7 : 12;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      const size = 7 + Math.random() * 11;
      p.className = 'petal';
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.width = size + 'px';
      p.style.height = (size * 0.72) + 'px';
      p.style.background = tints[i % tints.length];
      p.style.setProperty('--dx', (Math.random() * 16 - 8) + 'vw');
      p.style.animationDuration = (17 + Math.random() * 16) + 's';
      p.style.animationDelay = (-Math.random() * 24) + 's';
      host.appendChild(p);
    }
  }

  // ==================================
  // 07 · Countdown Module
  // ==================================
  /* Ticks once a second and switches target on its own:
       before NIKKAH_AT     counts to the Nikkah
       before RECEPTION_AT  counts to the Reception
       after  THANKS_FROM   shows the thank-you line and stops       */

  function initCountdown() {
    const grid = $('#cdGrid');
    const done = $('#cdDone');
    const out = { d: $('#cdDays'), h: $('#cdHours'), m: $('#cdMins'), s: $('#cdSecs') };
    if (!grid || !out.d) return;

    const nikkah    = new Date(NIKKAH_AT).getTime();
    const reception = new Date(RECEPTION_AT).getTime();
    const thanksAt  = new Date(THANKS_FROM).getTime();
    const last = {};

    function paint(el, value) {
      if (!el || last[el.id] === value) return;
      last[el.id] = value;
      el.textContent = value;
    }

    function tick() {
      const now = Date.now();
      if (now >= thanksAt) {
        grid.hidden = true;
        if (done) done.hidden = false;
        return false;
      }
      const goal = now < nikkah ? nikkah : (now < reception ? reception : now);
      let diff = Math.max(0, goal - now);
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
      const m = Math.floor(diff / 60000);    diff -= m * 60000;
      /* plain numerals - 5 rather than 05 */
      paint(out.d, String(d));
      paint(out.h, String(h));
      paint(out.m, String(m));
      paint(out.s, String(Math.floor(diff / 1000)));
      return true;
    }

    if (tick()) {
      const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000);
    }
  }

  // ==================================
  // 08 · Maps Module
  // ==================================

  function initMaps() {
    $$('[data-maps]').forEach(btn => {
      on(btn, 'click', () => {
        const key = btn.dataset.maps;
        const pin = key === 'nikkah' ? NIKKAH_MAP : RECEPTION_MAP;
        const venue = VENUES[key];
        const url = pin || ('https://www.google.com/maps/search/?api=1&query=' +
          encodeURIComponent(venue.name + ', ' + venue.address));
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });
  }

  // ==================================
  // 09 · Gallery Module
  // ==================================
  /* Builds the ceremony collage and the couple gallery from the lists in
     the configuration block, then wires the couple tiles to the viewer.
     Arrow keys and swipes move between photographs. */

  /* Build a grid only when the reader is close to it. Nothing in these
     sections exists as an <img> during the first paint, so none of it
     competes with the hero for bandwidth. */
  function buildGridWhenNear(grid, files, clickable, alt, onBuilt) {
    let built = false;
    function build() {
      if (built || !grid) return;
      built = true;
      files.forEach(file => grid.appendChild(buildTile(file, alt, clickable)));
      observeReveals(grid);
      /* Anything already level with or above the fold is shown at once -
         the observer only reports elements that are still to be reached. */
      $$('.ph', grid).forEach(tile => {
        if (tile.getBoundingClientRect().top < window.innerHeight) tile.classList.add('is-in');
      });
      if (onBuilt) onBuilt();
    }
    if (!grid) return;
    if (!('IntersectionObserver' in window)) { build(); return; }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); build(); }
    }, { rootMargin: '600px 0px' });
    io.observe(grid);
    setTimeout(build, 4000);   /* safety net - never leave a grid empty */
  }

  function initGallery() {
    buildGridWhenNear($('#fixingGrid'), FIXING_PHOTOS, false, 'The fixing ceremony');

    const galleryGrid = $('#galleryGrid');
    const lb = $('#lightbox');
    const img = $('#lbImg');
    const cap = $('#lbCap');
    if (!galleryGrid) return;

    let index = 0, scale = 1;

    buildGridWhenNear(galleryGrid, COUPLE_PHOTOS, true, 'Thawfeeq and Shini Yassmin', () => {
      $$('.ph', galleryGrid).forEach((btn, i) => on(btn, 'click', () => { show(i); viewer.open(); }));
    });

    if (!lb || !img) return;

    const viewer = createOverlay(lb, {
      delay: 380,
      restoreFocus: true,
      focus: () => $('#lbClose'),
      onClosed: () => { img.src = ''; img.style.transform = ''; scale = 1; }
    });

    const preload = i => {
      const file = COUPLE_PHOTOS[(i + COUPLE_PHOTOS.length) % COUPLE_PHOTOS.length];
      if (file) { const im = new Image(); im.decoding = 'async'; im.src = 'photos/' + file; }
    };

    function show(i) {
      index = (i + COUPLE_PHOTOS.length) % COUPLE_PHOTOS.length;
      img.src = 'photos/' + COUPLE_PHOTOS[index];
      img.alt = 'Thawfeeq and Shini Yassmin';
      if (cap) cap.textContent = (index + 1) + ' of ' + COUPLE_PHOTOS.length;
      preload(index + 1);
      preload(index - 1);
    }

    on($('#lbClose'), 'click', viewer.close);
    on($('#lbPrev'), 'click', () => show(index - 1));
    on($('#lbNext'), 'click', () => show(index + 1));
    on(document, 'keydown', e => {
      if (!viewer.isOpen()) return;
      if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === 'ArrowRight') show(index + 1);
    });

    /* Swipe between photographs, and pinch to zoom the one on screen. */
    let sx = 0, sy = 0, swiping = false;
    let startDist = 0, startScale = 1;

    const setScale = v => {
      scale = Math.max(1, Math.min(4, v));
      img.style.transform = scale === 1 ? '' : 'scale(' + scale.toFixed(3) + ')';
    };
    const resetZoom = () => setScale(1);
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    on(lb, 'touchstart', e => {
      if (e.touches.length === 2) { swiping = false; startDist = dist(e.touches); startScale = scale; }
      else if (e.touches.length === 1 && scale === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = true; }
    }, { passive: true });

    on(lb, 'touchmove', e => {
      if (e.touches.length === 2 && startDist) { e.preventDefault(); setScale(startScale * (dist(e.touches) / startDist)); }
    }, { passive: false });

    on(lb, 'touchend', e => {
      if (e.touches.length === 0) startDist = 0;
      if (!swiping) return;
      swiping = false;
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) { resetZoom(); show(index + (dx < 0 ? 1 : -1)); }
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) { resetZoom(); viewer.close(); }
    }, { passive: true });

    on(lb, 'dblclick', resetZoom);
  }

  // ==================================
  // 10 · RSVP Module
  // ==================================
  /* Name + guest count only. The stepper animates the number, the reply
     goes to the Google Sheet when SCRIPT_URL is set, and a copy is always
     written to this browser so nothing is lost. */

  const RSVP_KEY = 'wedding-rsvp-entries';

  function saveRsvp(entry) {
    try {
      const list = JSON.parse(localStorage.getItem(RSVP_KEY) || '[]');
      list.push(entry);
      localStorage.setItem(RSVP_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  function initRsvp() {
    const form = $('#rsvpForm');
    if (!form) return;
    const name = $('#rsvpName');
    const guests = $('#rsvpGuests');
    const button = $('#rsvpSubmit');
    const note = $('#rsvpNote');

    const thanks = createOverlay($('#thanks'), { delay: 400, focus: () => $('#thanksClose') });
    on($('#thanksClose'), 'click', thanks.close);

    /* ---- guest stepper ---- */
    function setGuests(next) {
      const value = Math.max(1, Math.min(30, next));
      if (String(value) === guests.value) return;
      guests.value = String(value);
      guests.classList.add('is-bump');
      setTimeout(() => guests.classList.remove('is-bump'), 280);
    }
    on($('#guestMinus'), 'click', () => setGuests(parseInt(guests.value, 10) - 1));
    on($('#guestPlus'), 'click', () => setGuests(parseInt(guests.value, 10) + 1));

    on(name, 'input', () => {
      if (name.getAttribute('aria-invalid') === 'true' && name.value.trim().length >= 2) {
        name.setAttribute('aria-invalid', 'false');
        if (note) note.textContent = '';
      }
    });

    on(form, 'submit', event => {
      event.preventDefault();
      if (name.value.trim().length < 2) {
        name.setAttribute('aria-invalid', 'true');
        if (note) note.textContent = 'Please tell us your name.';
        name.focus();
        return;
      }
      name.setAttribute('aria-invalid', 'false');

      const entry = {
        name: name.value.trim(),
        guests: String(parseInt(guests.value, 10) || 1),
        timestamp: new Date().toISOString()
      };

      saveRsvp(entry);
      if (note) note.textContent = '';
      form.reset();
      guests.value = '1';

      thanks.open();

      if (!SCRIPT_URL) return;
      button.classList.add('is-busy');
      fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams(entry).toString()
      })
        .catch(() => { /* the reply is safe in localStorage either way */ })
        .finally(() => button.classList.remove('is-busy'));
    });
  }

  // ==================================
  // 10b · Memories Module
  // ==================================
  /* Shared album, the live ceremony card and the QR message. The live
     card only loads the YouTube iframe once it is asked for, so the
     player never costs anything on first paint. */

  function initMemories() {
    const drive = $('#driveBtn');
    if (drive) {
      if (DRIVE_URL) {
        on(drive, 'click', () => window.open(DRIVE_URL, '_blank', 'noopener,noreferrer'));
      } else {
        drive.disabled = true;
        drive.title = 'Add DRIVE_URL in script.js';
      }
    }

    const note = $('#liveNote');
    if (note && LIVE_NOTE) note.textContent = LIVE_NOTE;

    const live = $('#liveBtn');
    const poster = $('#livePoster');
    if (live && poster) {
      on(live, 'click', () => {
        if (!YOUTUBE_URL) { toast('The live link will be added closer to the day.'); return; }
        const id = (YOUTUBE_URL.match(/(?:v=|youtu\.be\/|embed\/|live\/)([\w-]{6,})/) || [])[1];
        if (!id) { window.open(YOUTUBE_URL, '_blank', 'noopener,noreferrer'); return; }
        const frame = document.createElement('iframe');
        frame.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1';
        frame.title = 'Live ceremony';
        frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
        frame.allowFullscreen = true;
        poster.innerHTML = '';
        poster.appendChild(frame);
      });
    }

    const qr = $('.mcard__qr');
    if (qr && QR_URL) {
      qr.style.cursor = 'pointer';
      on(qr, 'click', () => window.open(QR_URL, '_blank', 'noopener,noreferrer'));
    }
  }

  // ==================================
  // 11 · Music Module
  // ==================================
  /* Off by default. With no MUSIC_URL the melody is generated in the
     browser with the Web Audio API, so there is no file to ship. */

  const Music = (function () {
    let ctx = null, master = null, timer = null, el = null, playing = false, step = 0;
    const SCALE = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

    function build() {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.0001;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2200;
      master.connect(filter).connect(ctx.destination);
      return ctx;
    }
    function note(freq, when, dur, gain, type) {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      osc.detune.value = Math.random() * 8 - 4;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(gain, when + dur * 0.28);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      osc.connect(g).connect(master);
      osc.start(when);
      osc.stop(when + dur + 0.1);
    }
    function tick() {
      if (!ctx || !playing) return;
      const t = ctx.currentTime + 0.08;
      const pattern = [0, 2, 4, 3, 5, 4, 2, 1];
      const i = pattern[step % pattern.length];
      note(SCALE[i], t, 3.4, 0.09, 'sine');
      if (step % 2 === 0) note(SCALE[(i + 2) % SCALE.length] / 2, t + 0.32, 4.2, 0.045, 'triangle');
      if (step % 4 === 0) note(110, t, 6.5, 0.05, 'sine');
      step++;
    }
    function audio() {
      if (el) return el;
      el = new Audio(MUSIC_URL);
      el.loop = true;
      el.volume = 0;
      el.preload = 'none';
      return el;
    }
    function fade(to, ms) {
      const a = audio(), from = a.volume, start = performance.now();
      (function frame(now) {
        const p = Math.min(1, (now - start) / ms);
        a.volume = Math.max(0, Math.min(1, from + (to - from) * p));
        if (p < 1) requestAnimationFrame(frame);
        else if (to === 0) a.pause();
      })(start);
    }
    return {
      isPlaying: () => playing,
      start: function () {
        if (MUSIC_URL) {
          const a = audio(), p = a.play();
          if (p && p.catch) p.catch(() => toast('Tap the music button once more to start.'));
          fade(0.55, 1600);
          playing = true;
          return true;
        }
        if (!build()) return false;
        if (ctx.state === 'suspended') ctx.resume();
        playing = true;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime);
        master.gain.exponentialRampToValueAtTime(0.34, ctx.currentTime + 2.2);
        tick();
        clearInterval(timer);
        timer = setInterval(tick, 2400);
        return true;
      },
      stop: function () {
        if (MUSIC_URL) { fade(0, 900); playing = false; return; }
        playing = false;
        clearInterval(timer);
        if (ctx && master) {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
          master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
        }
      }
    };
  })();

  function initMusic() {
    const btn = $('#music');
    if (!btn) return;
    on(btn, 'click', () => {
      if (Music.isPlaying()) {
        Music.stop();
        btn.setAttribute('aria-pressed', 'false');
      } else {
        const ok = Music.start();
        btn.setAttribute('aria-pressed', ok ? 'true' : 'false');
        if (!ok) toast('Background music is not supported on this browser.');
      }
    });
    let resume = false;
    on(document, 'visibilitychange', () => {
      if (document.hidden) {
        resume = Music.isPlaying();
        if (resume) { Music.stop(); btn.setAttribute('aria-pressed', 'false'); }
      } else if (resume) {
        Music.start();
        btn.setAttribute('aria-pressed', 'true');
        resume = false;
      }
    });
  }

  // ==================================
  // 12 · Share Module
  // ==================================

  function initShare() {
    const url = location.href.split('#')[0];
    on($('#shareWhatsApp'), 'click', () => {
      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(SHARE_TEXT + '\n\n' + url),
        '_blank', 'noopener,noreferrer');
    });
    on($('#copyLink'), 'click', () => {
      const done = () => toast('Link copied.');
      function fallback() {
        const temp = document.createElement('textarea');
        temp.value = url;
        temp.setAttribute('readonly', '');
        temp.style.cssText = 'position:absolute;left:-9999px';
        document.body.appendChild(temp);
        temp.select();
        try { document.execCommand('copy'); done(); }
        catch (e) { toast('Copy failed — please copy the address bar link.'); }
        document.body.removeChild(temp);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(fallback);
      } else {
        fallback();
      }
    });
  }

  // ==================================
  // 13 · PWA Module
  // ==================================

  function initPwa() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable */ });
    });
  }

  // ==================================
  // 14 · Boot
  // ==================================

  function boot() {
    initGallery();     /* build the grids first so they can be observed */
    initReveal();
    initNav();
    initParallax();
    initPetals();
    initCountdown();
    initMaps();
    initRsvp();
    initMemories();
    initMusic();
    initShare();
    initPwa();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
