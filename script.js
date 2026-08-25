/* ==========================================================
   LANDMARK VERSION 1.0
   Project : Thawfeeq & Shini Wedding
   Purpose : Stable editable baseline before redesign
   Do not delete this marker.

   VERSION 2.3 - iOS-hardened editorial experience.
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
     09  Gallery Module       family grid + the one shared photo viewer
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
     A static site cannot read its own folder - there is no server to
     ask - so this list is the manifest. Add a filename here and the
     grid grows on its own.                                            */

  /* FAMILY MEMORIES - every photograph with somebody else in the frame:
     parents, siblings, relatives, the fixing ceremony, group shots.
     The couple-only photographs are NOT here; they are written straight
     into the Our Story chapter in index.html so the prose can sit
     between them. Keeping the two sets apart is deliberate. */
  const FAMILY_PHOTOS = [
    { file: 'fixing-ceremony.jpg',   cap: 'The fixing ceremony' },
    { file: 'bride-seated.jpg',      cap: 'The bride, waiting' },
    { file: 'fixing-saree-box.jpg',  cap: 'Gifts exchanged' },
    { file: 'fixing-blessing.jpg',   cap: 'A blessing from the elders' },
    { file: 'fixing-garland.jpg',    cap: 'Garlands' },
    { file: 'fixing-tray.jpg',       cap: 'The offering trays' },
    { file: 'fixing-gathering.jpg',  cap: 'The gathering' },
    { file: 'fixing-families-1.jpg', cap: 'Both families together' },
    { file: 'fixing-families-2.jpg', cap: 'Both families together' },
    { file: 'gallery-restaurant.jpg',cap: 'Dinner with family' },
    { file: 'gallery-friends.jpg',   cap: 'With the people we love' }
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

  /* ---- page scroll lock -------------------------------------------
     iOS Safari happily scrolls the page behind a modal even when the
     body has overflow:hidden, so the body is pinned with position:fixed
     and the offset is handed to CSS as --lock-y. Reference-counted, so
     two overlapping overlays cannot unlock each other. */
  let lockY = 0, lockDepth = 0;
  function lockScroll() {
    if (lockDepth++) return;
    lockY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.style.setProperty('--lock-y', (-lockY) + 'px');
    document.body.classList.add('is-locked');
  }
  function unlockScroll() {
    if (!lockDepth || --lockDepth) return;
    const root = document.documentElement;
    document.body.classList.remove('is-locked');
    root.style.removeProperty('--lock-y');
    /* smooth scrolling is on in CSS; restoring the offset must not animate */
    const smooth = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, lockY);
    root.style.scrollBehavior = smooth;
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
      lockScroll();
      requestAnimationFrame(() => el.classList.add('is-on'));
      const target = opts.focus && opts.focus();
      if (target) target.focus({ preventScroll: true });
    }
    function close() {
      if (!isOpen()) return;
      el.classList.remove('is-on');
      unlockScroll();
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

  /* Build one masonry tile. Every photograph below the fold is lazy,
     and every tile carries the data the viewer needs, so a tile built
     later is picked up by the delegated click handler with no rewiring. */
  function buildTile(item, group, alt) {
    const el = document.createElement('button');
    el.className = 'ph reveal';
    el.type = 'button';
    el.dataset.lb = group;
    el.dataset.src = 'photos/' + item.file;
    if (item.cap) el.dataset.cap = item.cap;
    const img = document.createElement('img');
    img.src = el.dataset.src;
    img.alt = item.cap || alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    el.appendChild(img);
    return el;
  }

  // ==================================
  // 03 · Scroll Animation Module
  // ==================================
  /* Fade up, fade left and fade right - one observer for the whole page.
     The element is NOT unobserved after it appears, so .is-in is added
     on entry and removed on exit: the animation plays again every single
     time that element scrolls back into view, in both directions.
     Only opacity and transform change, which keeps the work on the
     compositor - the same 60fps on iOS Safari as on Android Chrome. */

  let revealObserver = null;
  let observerReported = false;   /* proof the browser actually delivers callbacks */

  function observeReveals(root) {
    const items = $$('.reveal, .reveal-left, .reveal-right, .tl__i', root || document);
    if (!('IntersectionObserver' in window) || REDUCED) {
      showEverything();
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        observerReported = true;
        window.__revealReady = true;
        entries.forEach(entry => {
          entry.target.classList.toggle('is-in', entry.isIntersecting);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    items.forEach(el => {
      /* the stagger is measured once, not on every crossing */
      if (el.dataset.step === undefined) {
        const peers = el.parentElement
          ? $$('.reveal, .reveal-left, .reveal-right, .tl__i', el.parentElement) : [];
        const step = Math.min(Math.max(0, peers.indexOf(el)), 5);
        el.dataset.step = step;
        if (step) el.style.setProperty('--d', step * 80 + 'ms');
      }
      revealObserver.observe(el);
    });
  }

  /* The one guarantee: content is never permanently invisible.
     Nothing is hidden by the stylesheet on its own - the hiding rules all
     sit behind html.js-reveal, which the inline snippet in <head> adds and
     this watchdog takes away again if the observer never reports. Some
     iOS Safari builds deliver no callbacks at all; on those the page
     simply renders with no animation instead of rendering blank. */
  function showEverything() {
    document.documentElement.classList.remove('js-reveal');
    window.__revealReady = true;
  }

  function revealWatchdog() {
    setTimeout(function () {
      if (!observerReported) showEverything();
    }, 2200);
  }

  function initReveal() {
    observeReveals(document);
    revealWatchdog();
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
  /* Two jobs.
       1. Build the Family Memories masonry, but only when the reader is
          near it, so none of it competes with the hero for bandwidth.
       2. Drive ONE viewer for every photograph on the page. Any element
          carrying data-lb="<group>" opens it; the group name decides
          which photographs it can page through. Clicks are delegated
          from the document, so tiles created later need no wiring. */

  function buildGridWhenNear(grid, items, group, alt) {
    let built = false;
    function build() {
      if (built || !grid) return;
      built = true;
      items.forEach(item => grid.appendChild(buildTile(item, group, alt)));
      observeReveals(grid);
      if (!document.documentElement.classList.contains('js-reveal')) {
        $$('.ph', grid).forEach(t => t.classList.add('is-in'));
      }
    }
    if (!grid) return;
    if (!('IntersectionObserver' in window)) { build(); return; }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); build(); }
    }, { rootMargin: '600px 0px' });
    io.observe(grid);
    setTimeout(build, 4000);   /* safety net - never leave a grid empty */
  }

  /* ---- the viewer -------------------------------------------------- */
  const Viewer = (function () {
    let lb, img, capEl, countEl, thumbs, overlay;
    let shots = [], index = 0;
    let scale = 1, tx = 0, ty = 0;          /* current zoom and pan */

    /* Every photograph in one group, in the order it appears on the page. */
    function collect(group) {
      return $$('[data-lb="' + group + '"]').map(el => {
        const inner = el.querySelector('img');
        return {
          src: el.dataset.src || (inner ? inner.getAttribute('src') : ''),
          cap: el.dataset.cap || '',
          alt: (inner && inner.alt) || 'Thawfeeq Ahamed and Shini Yassmin'
        };
      }).filter(sh => sh.src);
    }

    function paintTransform(smooth) {
      img.classList.toggle('is-panning', !smooth);
      img.style.transform = (scale === 1 && !tx && !ty)
        ? ''
        : 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + scale.toFixed(3) + ')';
    }

    function resetZoom(smooth) { scale = 1; tx = 0; ty = 0; paintTransform(smooth !== false); }

    /* Keep the picture from being dragged off screen. */
    function clampPan() {
      const r = img.getBoundingClientRect();
      const maxX = Math.max(0, (r.width * scale - r.width) / 2 + 8);
      const maxY = Math.max(0, (r.height * scale - r.height) / 2 + 8);
      tx = Math.max(-maxX, Math.min(maxX, tx));
      ty = Math.max(-maxY, Math.min(maxY, ty));
    }

    function setScale(next, smooth) {
      scale = Math.max(1, Math.min(4, next));
      if (scale === 1) { tx = 0; ty = 0; }
      else clampPan();
      paintTransform(smooth !== false);
    }

    function buildThumbs() {
      if (!thumbs) return;
      thumbs.textContent = '';
      /* a single photograph needs no strip */
      thumbs.hidden = shots.length < 2;
      if (thumbs.hidden) return;
      shots.forEach((shot, i) => {
        const b = document.createElement('button');
        b.className = 'lb__t';
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Photo ' + (i + 1));
        const im = document.createElement('img');
        im.src = shot.src;
        im.alt = '';
        im.loading = 'lazy';
        im.decoding = 'async';
        b.appendChild(im);
        on(b, 'click', () => show(i));
        thumbs.appendChild(b);
      });
    }

    function markThumb() {
      if (!thumbs || thumbs.hidden) return;
      const kids = $$('.lb__t', thumbs);
      kids.forEach((b, i) => {
        const active = i === index;
        b.classList.toggle('is-on', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      const hit = kids[index];
      if (hit && hit.scrollIntoView) {
        hit.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    }

    const preload = i => {
      const shot = shots[(i + shots.length) % shots.length];
      if (shot) { const im = new Image(); im.decoding = 'async'; im.src = shot.src; }
    };

    function show(i) {
      if (!shots.length) return;
      index = (i + shots.length) % shots.length;
      const shot = shots[index];
      resetZoom(false);                       /* a new photograph always starts at 1x */
      img.src = shot.src;
      img.alt = shot.alt;
      if (capEl) capEl.textContent = shot.cap;
      if (countEl) countEl.textContent = shots.length > 1 ? (index + 1) + ' / ' + shots.length : '';
      markThumb();
      preload(index + 1);
      preload(index - 1);
    }

    function open(group, startSrc) {
      shots = collect(group);
      if (!shots.length) return;
      const at = shots.findIndex(sh => sh.src === startSrc);
      buildThumbs();
      show(at < 0 ? 0 : at);
      overlay.open();
    }

    function init() {
      lb = $('#lightbox');
      img = $('#lbImg');
      if (!lb || !img) return;
      capEl = $('#lbCap');
      countEl = $('#lbCount');
      thumbs = $('#lbThumbs');

      overlay = createOverlay(lb, {
        delay: 380,
        restoreFocus: true,
        focus: () => $('#lbClose'),
        onClosed: () => { img.removeAttribute('src'); resetZoom(false); }
      });

      /* Delegated: works for the frames written into Our Story and for
         every masonry tile, including the ones built minutes later. */
      on(document, 'click', e => {
        const trigger = e.target.closest ? e.target.closest('[data-lb]') : null;
        if (!trigger) return;
        e.preventDefault();
        open(trigger.dataset.lb, trigger.dataset.src ||
          (trigger.querySelector('img') || {}).getAttribute('src'));
      });

      on($('#lbClose'), 'click', overlay.close);
      on($('#lbPrev'), 'click', () => show(index - 1));
      on($('#lbNext'), 'click', () => show(index + 1));
      /* tapping the dark surround closes; tapping the picture does not */
      on($('#lbStage'), 'click', e => { if (e.target.id === 'lbStage' || e.target.className === 'lb__fig') overlay.close(); });

      on(document, 'keydown', e => {
        if (!overlay.isOpen()) return;
        if (e.key === 'ArrowLeft') show(index - 1);
        else if (e.key === 'ArrowRight') show(index + 1);
      });

      /* ---- touch: swipe, pinch, drag, double tap ---- */
      let sx = 0, sy = 0, swiping = false, moved = false;
      let startDist = 0, startScale = 1, panX = 0, panY = 0, lastTap = 0;
      const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

      on(lb, 'touchstart', e => {
        moved = false;
        if (e.touches.length === 2) {
          swiping = false;
          startDist = dist(e.touches);
          startScale = scale;
        } else if (e.touches.length === 1) {
          sx = e.touches[0].clientX;
          sy = e.touches[0].clientY;
          panX = tx; panY = ty;
          swiping = scale === 1;             /* zoomed in, a drag pans instead */
        }
      }, { passive: true });

      on(lb, 'touchmove', e => {
        if (e.touches.length === 2 && startDist) {
          e.preventDefault();
          moved = true;
          setScale(startScale * (dist(e.touches) / startDist), false);
          return;
        }
        if (e.touches.length === 1 && scale > 1) {
          e.preventDefault();
          moved = true;
          tx = panX + (e.touches[0].clientX - sx);
          ty = panY + (e.touches[0].clientY - sy);
          clampPan();
          paintTransform(false);
        }
      }, { passive: false });

      on(lb, 'touchend', e => {
        if (e.touches.length === 0) startDist = 0;

        /* double tap toggles between 1x and 2.4x */
        if (!moved && e.changedTouches.length === 1) {
          const now = Date.now();
          if (now - lastTap < 300) {
            setScale(scale > 1 ? 1 : 2.4);
            lastTap = 0;
            return;
          }
          lastTap = now;
        }

        if (!swiping) return;
        swiping = false;
        const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) overlay.close();
      }, { passive: true });

      on(lb, 'dblclick', e => { e.preventDefault(); setScale(scale > 1 ? 1 : 2.4); });
    }

    return { init: init };
  })();

  function initGallery() {
    Viewer.init();
    buildGridWhenNear($('#familyGrid'), FAMILY_PHOTOS, 'family', 'A family memory');
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
