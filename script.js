/* =============================================================
   Thawfeeq & Shini Yassmin — Wedding Website
   script.js
   -------------------------------------------------------------
   EVERYTHING YOU NORMALLY NEED TO EDIT LIVES IN THE CONFIG BLOCK
   DIRECTLY BELOW. See README.md for step-by-step instructions.
   ============================================================= */
(function () {
  'use strict';

  /* ===========================================================
     ==============  1 · CONFIGURATION (EDIT ME)  ==============
     =========================================================== */

  /* --- Google Maps links -----------------------------------
     Paste the full Google Maps link for each venue between the
     quotes. Leave empty ("") and the buttons fall back to a
     Google Maps search for the venue name + address.           */
  const NIKKAH_MAP = "";
  const RECEPTION_MAP = "";

  /* --- Google Sheets RSVP endpoint --------------------------
     Paste the /exec URL of your Google Apps Script Web App.    */
  const SCRIPT_URL = "";

  /* --- Background music -------------------------------------
     Optional. Path or URL to an audio file (e.g. "assets/music.mp3").
     Leave empty ("") to use the built-in soft ambient melody.  */
  const MUSIC_URL = "";

  /* --- Dates and times (IST, +05:30) ------------------------
     Change these and the countdown updates itself. No other
     edit is required anywhere in this file.                    */
  const NIKKAH_AT    = "2026-10-25T11:00:00+05:30";
  const RECEPTION_AT = "2026-11-01T12:00:00+05:30";
  const THANKS_FROM  = "2026-11-02T00:00:00+05:30"; /* after 1 Nov 2026 */

  /* --- Venue details used by the map buttons ---------------- */
  const VENUES = {
    nikkah: {
      name: 'Drizzle Elite Mahal',
      address: 'Madurai-Courtallam Main Road, Courtallam, Tamil Nadu',
      label: 'Sunday, 25 October 2026 · 11:00 AM · Drizzle Elite Mahal, Courtallam'
    },
    reception: {
      name: 'Arulanandham Mahal',
      address: 'Eswari Nagar, Reddipalayam Main Road, Thanjavur, Tamil Nadu',
      label: 'Sunday, 1 November 2026 · 12:00 PM · Arulanandham Mahal, Thanjavur'
    }
  };

  /* --- Share text ------------------------------------------- */
  const SHARE_TEXT = 'You are warmly invited to the wedding of Dr. M. Thawfeeq Ahamed & Dr. S. Shini Yassmin. Nikkah: 25 Oct 2026, Courtallam. Reception: 1 Nov 2026, Thanjavur.';

  /* ===========================================================
     ===============  2 · NOTHING TO EDIT BELOW  ===============
     =========================================================== */

  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 3200);
  }

  /* ===========================================================
     3 · SCROLL REVEAL · PARALLAX · NAVIGATION
     =========================================================== */

  /* ---------- reveal on scroll (Intersection Observer) ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || REDUCED) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = el.parentElement ? $$('.reveal', el.parentElement) : [];
        const idx = Math.max(0, siblings.indexOf(el));
        el.style.setProperty('--d', Math.min(idx, 6) * 70 + 'ms');
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(el => io.observe(el));
  }

  /* ---------- parallax watercolour + hero ---------- */
  function initParallax() {
    if (REDUCED) return;
    const layers = [
      { el: $('.wc--left'),  speed: -0.09 },
      { el: $('.wc--right'), speed:  0.07 }
    ].filter(l => l.el);
    const frames = $$('[data-parallax]');
    if (!layers.length && !frames.length) return;

    let ticking = false;
    function apply() {
      const y = window.scrollY || window.pageYOffset;
      layers.forEach(l => { l.el.style.transform = 'translate3d(0,' + (y * l.speed).toFixed(1) + 'px,0)'; });
      frames.forEach(f => {
        const rect = f.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * parseFloat(f.dataset.parallax || '0');
        f.style.transform = 'translate3d(0,' + (-offset).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    on(window, 'scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    }, { passive: true });
    on(window, 'resize', apply, { passive: true });
    apply();
  }

  /* ---------- navigation ---------- */
  function initNav() {
    const nav = $('#nav');
    const burger = $('#navBurger');
    const menu = $('#navMenu');
    const scrim = $('#navScrim');
    const progress = $('#navProgress');
    const links = $$('.nav__menu a');

    function closeMenu() {
      if (!menu || !burger) return;
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      if (scrim) { scrim.classList.remove('is-on'); scrim.hidden = true; }
      document.body.classList.remove('is-locked');
    }
    function openMenu() {
      if (!menu || !burger) return;
      menu.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
      if (scrim) { scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('is-on')); }
    }
    on(burger, 'click', () => {
      burger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });
    on(scrim, 'click', closeMenu);
    links.forEach(a => on(a, 'click', closeMenu));
    on(document, 'keydown', e => { if (e.key === 'Escape') closeMenu(); });
    on(window, 'resize', () => { if (window.innerWidth > 860) closeMenu(); }, { passive: true });

    let ticking = false;
    function onScroll() {
      const y = window.scrollY || window.pageYOffset;
      if (nav) nav.classList.toggle('is-solid', y > 40);
      const toTop = $('#toTop');
      if (toTop) toTop.classList.toggle('is-on', y > window.innerHeight * 0.7);
      if (progress) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
      }
      ticking = false;
    }
    on(window, 'scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }, { passive: true });
    onScroll();

    /* active section highlighting */
    if ('IntersectionObserver' in window) {
      const sections = links
        .map(a => ({ a: a, el: document.querySelector(a.getAttribute('href')) }))
        .filter(s => s.el);
      const spy = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const match = sections.find(s => s.el === entry.target);
          if (!match) return;
          if (entry.isIntersecting) {
            sections.forEach(s => s.a.classList.remove('is-active'));
            match.a.classList.add('is-active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(s => spy.observe(s.el));
    }

    /* back to top */
    on($('#toTop'), 'click', () => {
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }

  /* ===========================================================
     4 · SPLASH SCREEN & BACKGROUND MUSIC
     =========================================================== */

  const Music = (function () {
    let ctx = null, master = null, timer = null, audioEl = null;
    let playing = false, step = 0;
    const SCALE = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

    function ensureContext() {
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
      master._filter = filter;
      return ctx;
    }

    function note(freq, when, dur, gain, type) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() * 8) - 4;
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
      const idx = pattern[step % pattern.length];
      note(SCALE[idx], t, 3.4, 0.09, 'sine');
      if (step % 2 === 0) note(SCALE[(idx + 2) % SCALE.length] / 2, t + 0.32, 4.2, 0.045, 'triangle');
      if (step % 4 === 0) note(110, t, 6.5, 0.05, 'sine');
      step++;
    }

    function startSynth() {
      if (!ensureContext()) return false;
      if (ctx.state === 'suspended') ctx.resume();
      playing = true;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.34, ctx.currentTime + 2.2);
      tick();
      clearInterval(timer);
      timer = setInterval(tick, 2400);
      return true;
    }

    function stopSynth() {
      playing = false;
      clearInterval(timer);
      if (ctx && master) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      }
    }

    function ensureAudio() {
      if (audioEl) return audioEl;
      audioEl = new Audio(MUSIC_URL);
      audioEl.loop = true;
      audioEl.volume = 0;
      audioEl.preload = 'none';
      return audioEl;
    }

    function fadeAudio(to, ms) {
      const el = ensureAudio();
      const from = el.volume;
      const start = performance.now();
      (function frame(now) {
        const p = Math.min(1, (now - start) / ms);
        el.volume = Math.max(0, Math.min(1, from + (to - from) * p));
        if (p < 1) requestAnimationFrame(frame);
        else if (to === 0) el.pause();
      })(start);
    }

    return {
      isPlaying: function () { return playing; },
      start: function () {
        if (MUSIC_URL) {
          const el = ensureAudio();
          const p = el.play();
          if (p && p.catch) p.catch(() => toast('Tap the music button once more to start the music.'));
          fadeAudio(0.55, 1600);
          playing = true;
          return true;
        }
        return startSynth();
      },
      stop: function () {
        if (MUSIC_URL) { fadeAudio(0, 900); playing = false; return; }
        stopSynth();
      }
    };
  })();

  function setMusicButtons(isOn) {
    $$('[data-music-toggle]').forEach(btn => {
      btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
      const label = $('.music-btn__label', btn);
      if (label) label.textContent = isOn ? 'Music on' : 'Music off';
    });
  }

  function initMusic() {
    $$('[data-music-toggle]').forEach(btn => {
      on(btn, 'click', () => {
        if (Music.isPlaying()) {
          Music.stop();
          setMusicButtons(false);
        } else {
          const ok = Music.start();
          setMusicButtons(ok !== false);
          if (ok === false) toast('Background music is not supported on this browser.');
        }
      });
    });
    /* pause when the tab is hidden, resume when it returns */
    let wasPlaying = false;
    on(document, 'visibilitychange', () => {
      if (document.hidden) {
        wasPlaying = Music.isPlaying();
        if (wasPlaying) { Music.stop(); setMusicButtons(false); }
      } else if (wasPlaying) {
        Music.start(); setMusicButtons(true); wasPlaying = false;
      }
    });
  }

  /* ---------- splash ---------- */
  function initSplash() {
    const splash = $('#splash');
    const openBtn = $('#openInvite');
    if (!splash) { document.body.classList.add('invite-open'); return; }

    document.body.classList.add('is-locked');

    function open(startMusic) {
      if (splash.classList.contains('is-open')) return;
      splash.classList.add('is-open');
      document.body.classList.remove('is-locked');
      document.body.classList.add('invite-open');
      setTimeout(() => { splash.setAttribute('aria-hidden', 'true'); splash.style.display = 'none'; }, 1000);
      const main = $('#main');
      if (main) { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
      if (startMusic && !Music.isPlaying()) {
        const ok = Music.start();
        setMusicButtons(ok !== false);
      }
      if (location.hash && $(location.hash)) {
        setTimeout(() => { $(location.hash).scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); }, 260);
      }
    }

    on(openBtn, 'click', () => open(true));
    on(document, 'keydown', e => {
      if (splash.classList.contains('is-open')) return;
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        if (document.activeElement && document.activeElement.hasAttribute('data-music-toggle')) return;
        e.preventDefault();
        open(e.key === 'Enter');
      }
    });
    /* keep focus inside the splash while it is showing */
    on(splash, 'keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', splash);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    if (openBtn) setTimeout(() => openBtn.focus({ preventScroll: true }), 600);
  }

  /* ===========================================================
     5 · COUNTDOWN
     Automatically switches Nikkah → Reception → Thank you.
     =========================================================== */
  function initCountdown() {
    const grid   = $('#cdGrid');
    const title  = $('#cdTitle');
    const eyebrow= $('#cdEyebrow');
    const target = $('#cdTarget');
    const thanks = $('#cdThanks');
    const out = { days: $('#cdDays'), hours: $('#cdHours'), mins: $('#cdMins'), secs: $('#cdSecs') };
    if (!grid || !out.days) return;

    const nikkah    = new Date(NIKKAH_AT).getTime();
    const reception = new Date(RECEPTION_AT).getTime();
    const thanksAt  = new Date(THANKS_FROM).getTime();
    let last = {};

    function paint(el, value) {
      if (!el || last[el.id] === value) return;
      last[el.id] = value;
      el.textContent = value;
      if (REDUCED) return;
      el.classList.add('is-tick');
      setTimeout(() => el.classList.remove('is-tick'), 320);
    }

    function showThanks() {
      grid.hidden = true;
      if (target) target.hidden = true;
      if (thanks) thanks.hidden = false;
      if (title) title.textContent = 'With all our love';
      if (eyebrow) eyebrow.textContent = 'The celebrations have ended';
      document.title = 'Thank you for celebrating with us — Thawfeeq & Shini Yassmin';
    }

    function tick() {
      const now = Date.now();

      if (now >= thanksAt) { showThanks(); return false; }

      let goal, heading, eye, detail;
      if (now < nikkah) {
        goal = nikkah;
        heading = 'Countdown to the Nikkah';
        eye = 'Counting the days';
        detail = VENUES.nikkah.label;
      } else if (now < reception) {
        goal = reception;
        heading = 'Countdown to the Reception';
        eye = 'The Nikkah is complete, alhamdulillah';
        detail = VENUES.reception.label;
      } else {
        goal = now;
        heading = 'The Reception is Today';
        eye = 'We are so happy you are here';
        detail = VENUES.reception.label;
      }

      if (title && title.textContent !== heading) title.textContent = heading;
      if (eyebrow && eyebrow.textContent !== eye) eyebrow.textContent = eye;
      if (target && target.textContent !== detail) target.textContent = detail;

      let diff = Math.max(0, goal - now);
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
      const m = Math.floor(diff / 60000);    diff -= m * 60000;
      const s = Math.floor(diff / 1000);

      paint(out.days,  String(d).padStart(3, '0'));
      paint(out.hours, String(h).padStart(2, '0'));
      paint(out.mins,  String(m).padStart(2, '0'));
      paint(out.secs,  String(s).padStart(2, '0'));
      return true;
    }

    if (tick()) {
      const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000);
    }
  }

  /* ===========================================================
     6 · INTERACTIVE TIMELINE
     =========================================================== */
  function initTimeline() {
    const heads = $$('.tl__head');
    if (!heads.length) return;

    heads.forEach(head => {
      const panel = document.getElementById(head.getAttribute('aria-controls'));
      if (!panel) return;
      panel.hidden = false;
      panel.style.maxHeight = '0px';

      on(head, 'click', () => {
        const isOpen = head.getAttribute('aria-expanded') === 'true';

        heads.forEach(other => {
          if (other === head) return;
          const p = document.getElementById(other.getAttribute('aria-controls'));
          other.setAttribute('aria-expanded', 'false');
          if (p) { p.classList.remove('is-open'); p.style.maxHeight = '0px'; }
        });

        head.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        panel.classList.toggle('is-open', !isOpen);
        panel.style.maxHeight = isOpen ? '0px' : (panel.scrollHeight + 32) + 'px';
      });
    });

    on(window, 'resize', () => {
      heads.forEach(head => {
        if (head.getAttribute('aria-expanded') !== 'true') return;
        const panel = document.getElementById(head.getAttribute('aria-controls'));
        if (panel) panel.style.maxHeight = (panel.scrollHeight + 32) + 'px';
      });
    }, { passive: true });
  }

  /* ===========================================================
     7 · EVENT CARDS · MAP BUTTONS
     =========================================================== */
  function mapLinks(key) {
    const custom = key === 'nikkah' ? NIKKAH_MAP : RECEPTION_MAP;
    const venue = VENUES[key];
    const query = encodeURIComponent(venue.name + ', ' + venue.address);
    return {
      /* "Google Maps" — open the place */
      view: custom || ('https://www.google.com/maps/search/?api=1&query=' + query),
      /* "Navigate" — turn-by-turn directions */
      navigate: custom || ('https://www.google.com/maps/dir/?api=1&destination=' + query)
    };
  }

  function initEvents() {
    $$('[data-maps]').forEach(btn => {
      on(btn, 'click', () => {
        window.open(mapLinks(btn.dataset.maps).view, '_blank', 'noopener,noreferrer');
      });
    });
    $$('[data-navigate]').forEach(btn => {
      on(btn, 'click', () => {
        window.open(mapLinks(btn.dataset.navigate).navigate, '_blank', 'noopener,noreferrer');
      });
    });
  }

  /* ===========================================================
     8 · RSVP → GOOGLE SHEETS (Google Apps Script)
     =========================================================== */
  function initRsvp() {
    const form   = $('#rsvpForm');
    const status = $('#rsvpStatus');
    const button = $('#rsvpSubmit');
    if (!form) return;

    const nameInput   = $('#rsvpName');
    const guestsInput = $('#rsvpGuests');

    function setStatus(message, kind) {
      if (!status) return;
      status.textContent = message;
      status.className = 'rsvp__status is-on ' + (kind ? 'is-' + kind : '');
    }
    function setError(input, message) {
      const err = $('[data-err-for="' + input.id + '"]');
      if (err) err.textContent = message || '';
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      return !message;
    }
    function validate() {
      let ok = true;
      const name = nameInput.value.trim();
      const guests = parseInt(guestsInput.value, 10);
      ok = setError(nameInput, name.length < 2 ? 'Please tell us your name.' : '') && ok;
      ok = setError(guestsInput,
        (!guests || guests < 1 || guests > 30) ? 'Enter a number between 1 and 30.' : '') && ok;
      return ok;
    }

    [nameInput, guestsInput].forEach(input => {
      on(input, 'input', () => {
        if (input.getAttribute('aria-invalid') === 'true') validate();
      });
    });

    on(form, 'submit', function (event) {
      event.preventDefault();
      if (!validate()) { setStatus('Please check the highlighted fields.', 'err'); return; }

      const payload = {
        name: nameInput.value.trim(),
        guests: String(parseInt(guestsInput.value, 10)),
        timestamp: new Date().toISOString(),
        page: location.href
      };

      if (!SCRIPT_URL) {
        setStatus('RSVP is not connected yet. Add your Google Apps Script URL to SCRIPT_URL in script.js.', 'info');
        return;
      }

      button.classList.add('is-loading');
      button.setAttribute('aria-busy', 'true');
      setStatus('Sending your RSVP…', 'info');

      const controller = ('AbortController' in window) ? new AbortController() : null;
      const timeout = setTimeout(() => { if (controller) controller.abort(); }, 15000);

      fetch(SCRIPT_URL, {
        method: 'POST',
        /* URL-encoded keeps the request "simple" so Apps Script
           answers without a CORS pre-flight */
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams(payload).toString(),
        signal: controller ? controller.signal : undefined
      })
        .then(response => {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.text();
        })
        .then(() => {
          setStatus('Thank you, ' + payload.name.split(' ')[0] + '! Your RSVP has been received. ❤️', 'ok');
          form.reset();
          guestsInput.value = '1';
          setError(nameInput, '');
          setError(guestsInput, '');
          toast('RSVP received — thank you!');
        })
        .catch(error => {
          const aborted = error && error.name === 'AbortError';
          setStatus(aborted
            ? 'The request timed out. Please check your connection and try again.'
            : 'Sorry, we could not send your RSVP. Please try again or message us directly.', 'err');
        })
        .finally(() => {
          clearTimeout(timeout);
          button.classList.remove('is-loading');
          button.removeAttribute('aria-busy');
        });
    });
  }

  /* ===========================================================
     10 · SHARING
     =========================================================== */
  function initShare() {
    const url = location.href.split('#')[0];

    on($('#shareWhatsApp'), 'click', () => {
      const text = encodeURIComponent(SHARE_TEXT + '\n\n' + url);
      window.open('https://api.whatsapp.com/send?text=' + text, '_blank', 'noopener,noreferrer');
    });

    on($('#copyLink'), 'click', () => {
      const done = () => toast('Invitation link copied.');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(fallback);
      } else {
        fallback();
      }
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
    });

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ===========================================================
     12 · BOOT
     =========================================================== */
  function boot() {
    /* keep 100vh honest on mobile browsers with dynamic toolbars */
    const setVh = () => document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
    setVh();
    on(window, 'resize', setVh, { passive: true });
    on(window, 'orientationchange', setVh);

    initReveal();
    initParallax();
    initNav();
    initSplash();
    initMusic();
    initCountdown();
    initTimeline();
    initEvents();
    initRsvp();
    initShare();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
