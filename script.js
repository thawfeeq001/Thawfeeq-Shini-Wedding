/* =============================================================
   Thawfeeq Ahamed & Shini Yassmin — V2
   Everything you normally edit lives in the CONFIG block below.
   ============================================================= */
(function () {
  'use strict';

  /* ================= CONFIG ================= */

  /* Exact venue pins, read from the printed invitation QR codes. */
  const NIKKAH_MAP    = "https://maps.app.goo.gl/wXZqhk89NidwfUpZ6";
  const RECEPTION_MAP = "https://maps.app.goo.gl/1XXwGVE348TApdXx5";

  /* Optional: a Google Apps Script /exec URL. RSVPs are always kept
     in this browser; if this is set they are posted to your sheet too. */
  const SCRIPT_URL = "";

  /* Optional audio file. Empty = the built-in soft ambient melody. */
  const MUSIC_URL = "";

  /* Dates in IST. Change these and the countdown follows. */
  const NIKKAH_AT    = "2026-10-25T11:00:00+05:30";
  const RECEPTION_AT = "2026-11-01T12:00:00+05:30";
  const THANKS_FROM  = "2026-11-02T00:00:00+05:30";

  const VENUES = {
    nikkah:    { name: 'Drizzle Elite Mahal', address: 'Madurai - Courtallam Main Road, Ilanji, Courtallam, Tamil Nadu' },
    reception: { name: 'Arulanandham Mahal',  address: 'Eswari Nagar, Reddipalayam Main Road, Thanjavur, Tamil Nadu' }
  };

  const SHARE_TEXT = 'Dr. M. Thawfeeq Ahamed & Dr. S. Shini Yassmin — 25 October 2026, Courtallam.';

  /* ================= helpers ================= */

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

  /* ================= reveal on scroll ================= */

  function initReveal() {
    const items = $$('.reveal, .tl__i');
    if (!('IntersectionObserver' in window) || REDUCED) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const peers = el.parentElement ? $$('.reveal, .tl__i', el.parentElement) : [];
        el.style.setProperty('--d', Math.min(Math.max(0, peers.indexOf(el)), 5) * 80 + 'ms');
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(el => io.observe(el));
  }

  /* ================= navigation & scroll progress ================= */

  function initNav() {
    const nav = $('#nav');
    const burger = $('#navBurger');
    const menu = $('#navMenu');
    const scrim = $('#navScrim');
    const bar = $('#progress');
    const links = $$('.nav__menu a');

    function closeMenu() {
      if (!menu || !burger) return;
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      if (scrim) { scrim.classList.remove('is-on'); scrim.hidden = true; }
    }
    on(burger, 'click', () => {
      if (burger.getAttribute('aria-expanded') === 'true') return closeMenu();
      menu.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
      if (scrim) { scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('is-on')); }
    });
    on(scrim, 'click', closeMenu);
    links.forEach(a => on(a, 'click', closeMenu));
    on(document, 'keydown', e => { if (e.key === 'Escape') closeMenu(); });
    on(window, 'resize', () => { if (window.innerWidth > 900) closeMenu(); }, { passive: true });

    let ticking = false;
    function paint() {
      const y = window.scrollY || window.pageYOffset;
      if (nav) nav.classList.toggle('is-on', y > window.innerHeight * 0.72);
      if (bar) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
      }
      ticking = false;
    }
    on(window, 'scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(paint);
    }, { passive: true });
    paint();

    if ('IntersectionObserver' in window) {
      const map = links.map(a => ({ a: a, el: document.querySelector(a.getAttribute('href')) })).filter(m => m.el);
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

  /* ================= soft parallax on the two full-screen photographs ================= */

  function initParallax() {
    if (REDUCED) return;
    const layers = [
      { el: $('.hero__img'), speed: 0.16 },
      { el: $('.closing__img'), speed: 0.10 }
    ].filter(l => l.el);
    if (!layers.length) return;

    let ticking = false;
    function apply() {
      layers.forEach(l => {
        const rect = l.el.parentElement.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
        const shift = (rect.top + rect.height / 2 - window.innerHeight / 2) * -l.speed;
        l.el.style.transform = 'scale(1.06) translate3d(0,' + shift.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    on(window, 'scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    }, { passive: true });
    apply();
  }

  /* ================= decorative washes =================
     Purely ornamental, so they load only once the page itself is
     ready and never compete with the photographs. */

  function initWashes() {
    const load = () => $$('.wash img[data-src]').forEach(img => {
      img.setAttribute('fetchpriority', 'low');
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
    if (document.readyState === 'complete') load();
    else on(window, 'load', load);
  }

  /* ================= drifting petals ================= */

  function initPetals() {
    const host = $('#petals');
    if (!host || REDUCED) return;
    const tints = ['rgba(232,201,201,.85)', 'rgba(207,168,168,.7)', 'rgba(199,161,90,.45)', 'rgba(168,184,163,.5)'];
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

  /* ================= countdown ================= */

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
      paint(out.d, String(d).padStart(3, '0'));
      paint(out.h, String(h).padStart(2, '0'));
      paint(out.m, String(m).padStart(2, '0'));
      paint(out.s, String(Math.floor(diff / 1000)).padStart(2, '0'));
      return true;
    }

    if (tick()) {
      const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000);
    }
  }

  /* ================= venue maps ================= */

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

  /* ================= gallery lightbox ================= */

  function initGallery() {
    const thumbs = $$('#masonry .ph');
    const lb = $('#lightbox');
    const img = $('#lbImg');
    const cap = $('#lbCap');
    if (!thumbs.length || !lb || !img) return;

    const items = thumbs.map(btn => {
      const i = $('img', btn);
      return { src: i.getAttribute('src'), alt: i.getAttribute('alt') || 'Photograph' };
    });
    let index = 0, lastFocus = null;

    const preload = i => {
      const item = items[(i + items.length) % items.length];
      if (item) { const im = new Image(); im.decoding = 'async'; im.src = item.src; }
    };

    function show(i) {
      index = (i + items.length) % items.length;
      img.src = items[index].src;
      img.alt = items[index].alt;
      if (cap) cap.textContent = (index + 1) + ' of ' + items.length;
      preload(index + 1);
      preload(index - 1);
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      document.body.classList.add('is-locked');
      requestAnimationFrame(() => lb.classList.add('is-on'));
      const x = $('#lbClose');
      if (x) x.focus({ preventScroll: true });
    }
    function close() {
      lb.classList.remove('is-on');
      document.body.classList.remove('is-locked');
      setTimeout(() => { lb.hidden = true; img.src = ''; }, 380);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    thumbs.forEach((btn, i) => on(btn, 'click', () => open(i)));
    on($('#lbClose'), 'click', close);
    on($('#lbPrev'), 'click', () => show(index - 1));
    on($('#lbNext'), 'click', () => show(index + 1));
    on(lb, 'click', e => { if (e.target === lb) close(); });
    on(document, 'keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === 'ArrowRight') show(index + 1);
    });

    let sx = 0, sy = 0, swiping = false;
    on(lb, 'touchstart', e => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; swiping = true; }, { passive: true });
    on(lb, 'touchend', e => {
      if (!swiping) return;
      swiping = false;
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
    }, { passive: true });

    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 2400));
    idle(() => { [0, 1, 2].forEach(preload); });
  }

  /* ================= RSVP ================= */

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
    const message = $('#rsvpMessage');
    const button = $('#rsvpSubmit');
    const note = $('#rsvpNote');
    const modal = $('#thanks');

    function setError(input, text) {
      const slot = $('[data-err-for="' + input.id + '"]');
      if (slot) slot.textContent = text || '';
      input.setAttribute('aria-invalid', text ? 'true' : 'false');
      return !text;
    }
    function validate() {
      let ok = setError(name, name.value.trim().length < 2 ? 'Please tell us your name.' : '');
      const n = parseInt(guests.value, 10);
      ok = setError(guests, (!n || n < 1 || n > 30) ? 'Enter a number between 1 and 30.' : '') && ok;
      return ok;
    }
    [name, guests].forEach(i => on(i, 'input', () => {
      if (i.getAttribute('aria-invalid') === 'true') validate();
    }));

    function openModal(text) {
      if (!modal) return toast('Thank you — your reply has been saved.');
      const body = $('#thanksText');
      if (body) body.textContent = text;
      modal.hidden = false;
      document.body.classList.add('is-locked');
      requestAnimationFrame(() => modal.classList.add('is-on'));
      const close = $('#thanksClose');
      if (close) close.focus({ preventScroll: true });
    }
    function closeModal() {
      if (!modal) return;
      modal.classList.remove('is-on');
      document.body.classList.remove('is-locked');
      setTimeout(() => { modal.hidden = true; }, 400);
    }
    on($('#thanksClose'), 'click', closeModal);
    on(modal, 'click', e => { if (e.target === modal) closeModal(); });
    on(document, 'keydown', e => { if (modal && !modal.hidden && e.key === 'Escape') closeModal(); });

    on(form, 'submit', event => {
      event.preventDefault();
      if (!validate()) { if (note) note.textContent = 'Please check the highlighted fields.'; return; }

      const entry = {
        name: name.value.trim(),
        guests: String(parseInt(guests.value, 10)),
        message: message ? message.value.trim() : '',
        savedAt: new Date().toISOString()
      };

      const stored = saveRsvp(entry);
      if (note) note.textContent = '';
      form.reset();
      guests.value = '1';
      setError(name, '');
      setError(guests, '');

      const first = entry.name.split(' ')[0];
      openModal(stored
        ? 'We have your reply, ' + first + '. We cannot wait to celebrate with you.'
        : 'We have your reply, ' + first + '.');

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

  /* ================= music (default off) ================= */

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

  /* ================= sharing ================= */

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

  /* ================= service worker ================= */

  function initPwa() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable */ });
    });
  }

  /* ================= boot ================= */

  function boot() {
    initReveal();
    initNav();
    initParallax();
    initWashes();
    initPetals();
    initCountdown();
    initMaps();
    initGallery();
    initRsvp();
    initMusic();
    initShare();
    initPwa();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
