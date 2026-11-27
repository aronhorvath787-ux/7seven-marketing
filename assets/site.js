// Seven Marketing Agency – design sample scripts (shared by every page)
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EN = document.documentElement.lang === 'en';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---- split headlines into words for the mask-rise ----
$$('[data-split]').forEach(el => {
  const t = $('.ph', el) || el; let i = 0;
  t.innerHTML = t.textContent.trim().split(/\s+/).map(w => `<span class="w"><span style="--i:${i++}">${w}</span></span>`).join(' ');
});

// ---- reveal on scroll ----
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
$$('.rv,.reveal,.drop,[data-split],.sec-head').forEach(el => io.observe(el));

// ---- header: slides away on scroll down, back on scroll up ----
// Over the film it stays transparent with white text; past the film it is solid ivory.
const frame = $('#frame'), hero = $('#hero');
let lastY = scrollY, travel = 0, ticking = false;
function updateHeader() {
  const y = Math.max(0, scrollY), dy = y - lastY, h = frame.offsetHeight;
  if (dy !== 0) travel = (Math.sign(dy) === Math.sign(travel)) ? travel + dy : dy;
  let away = frame.classList.contains('away');
  if (y < h) away = false;
  else if (travel > 24) away = true;
  else if (travel < -24) away = false;
  frame.classList.toggle('away', away);
  if (hero) {
    const overHero = y < hero.offsetHeight - h;
    frame.classList.toggle('on-hero', overHero);
    frame.classList.toggle('solid', !overHero);
    if (!reduce) hero.style.setProperty('--hp', Math.min(1, y / hero.offsetHeight).toFixed(3));
  }
  lastY = y; ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateHeader); } }, { passive: true });
updateHeader();

// ---- mobile menu ----
const mnav = $('#mnav'), menuBtn = $('#menuBtn');
if (mnav) {
  const open = o => {
    mnav.classList.toggle('open', o); document.body.classList.toggle('menu-open', o);
    menuBtn.setAttribute('aria-expanded', String(o));
    if (!o && mnav.contains(document.activeElement)) menuBtn.focus({ preventScroll: true });
  };
  menuBtn.onclick = () => open(true);
  $('#menuClose').onclick = () => open(false);
  addEventListener('keydown', e => { if (e.key === 'Escape' && mnav.classList.contains('open')) open(false); });
  $$('a', mnav).forEach(a => a.addEventListener('click', () => open(false)));
}

// ---- hero film sound (icon button) ----
const hv = hero && $('video', hero), hb = $('#heroSound');
const soundLabel = muted => muted ? (EN ? 'Turn sound on' : 'Hang bekapcsolása') : (EN ? 'Turn sound off' : 'Hang kikapcsolása');
if (hb) hb.onclick = () => { hv.muted = !hv.muted; if (!hv.muted) works.forEach(o => o.pause()); hb.setAttribute('aria-pressed', String(!hv.muted)); hb.setAttribute('aria-label', soundLabel(hv.muted)); };

// ---- video players (film + reels): nothing autoplays; play/pause, scrub, sound, full screen ----
const works = $$('video[data-work]');
const mmss = t => { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
$$('.player').forEach(box => {
  const v = $('video', box), seek = $('.c-seek', box), time = $('.c-time', box);
  const toggle = () => {
    if (v.paused) {
      works.forEach(o => { if (o !== v) o.pause(); });
      if (hv && !hv.muted) { hv.muted = true; hb.setAttribute('aria-pressed', 'false'); hb.setAttribute('aria-label', soundLabel(true)); }
      v.play();
    } else v.pause();
  };
  const stop = e => e.stopPropagation();
  $('.play', box).addEventListener('click', e => { stop(e); toggle(); });
  $('.c-play', box).addEventListener('click', e => { stop(e); toggle(); });
  v.addEventListener('click', toggle);
  $('.c-mute', box).addEventListener('click', e => { stop(e); v.muted = !v.muted; box.classList.toggle('muted', v.muted); });
  $('.c-fs', box).addEventListener('click', e => {
    stop(e);
    if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    if (box.requestFullscreen) box.requestFullscreen();
    else if (box.webkitRequestFullscreen) box.webkitRequestFullscreen();
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();   // iPhone: native player
    if (v.paused) toggle();
  });
  const paint = () => {
    const f = v.duration ? v.currentTime / v.duration : 0;
    seek.value = Math.round(f * 1000); seek.style.setProperty('--p', (f * 100).toFixed(2) + '%');
    time.textContent = mmss(v.currentTime);
  };
  seek.addEventListener('input', () => { if (v.duration) v.currentTime = seek.value / 1000 * v.duration; paint(); });
  $('.ctl', box).addEventListener('click', stop);
  v.addEventListener('timeupdate', paint);
  v.addEventListener('play', () => box.classList.add('playing', 'started'));
  v.addEventListener('pause', () => box.classList.remove('playing'));
  v.addEventListener('ended', () => { v.currentTime = 0; paint(); });
});
// leaving the screen pauses a video (but not while it is in full screen)
const vio = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting && !document.fullscreenElement) e.target.pause(); }), { threshold: .1 });
works.forEach(v => vio.observe(v));

// ---- service video lightbox ----
const vbox = $('#vbox');
if (vbox) {
  const vv = $('video', vbox);
  const show = o => {
    if (o) { vbox.hidden = false; requestAnimationFrame(() => vbox.classList.add('open')); vv.muted = false; $('.play', vbox).click(); }
    else { vv.pause(); vbox.classList.remove('open'); setTimeout(() => { vbox.hidden = true; }, 350); }
    document.body.classList.toggle('vbox-open', o);
  };
  $$('[data-vbox]').forEach(el => {
    el.addEventListener('click', () => show(true));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(true); } });
  });
  $('[data-vclose]', vbox).addEventListener('click', () => show(false));
  vbox.addEventListener('click', e => { if (e.target === vbox) show(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !vbox.hidden) show(false); });
}

// ---- reels carousel: active reel centred in a phone frame, neighbours peek; swipe, arrows, dots ----
const rc = $('#reels');
if (rc) {
  const cards = $$('.rc-card', rc), rdots = $$('#rDots button'), n = cards.length;
  let i = 0, sx = null, ddx = 0, wheelLock = false;
  const place = (drag = 0) => cards.forEach((c, k) => {
    let d = ((k - i) % n + n) % n; if (d > n / 2) d -= n;           // -1, 0, 1
    const f = d + drag, a = Math.min(1, Math.abs(f));
    c.style.setProperty('--d', f.toFixed(3));
    c.style.setProperty('--s', (1 - a * .16).toFixed(3));
    c.style.setProperty('--o', (1 - a * .12).toFixed(3));
    c.style.setProperty('--z', String(10 - Math.round(Math.abs(f) * 2)));
    c.classList.toggle('on', d === 0);
  });
  const go = k => {
    i = (k + n) % n; works.forEach(v => v.pause());
    rdots.forEach((b, j) => b.classList.toggle('on', j === i)); place();
    const rn = $('#rNum'); if (rn) rn.textContent = String(i + 1).padStart(2, '0');
  };
  rdots.forEach((b, j) => b.onclick = () => go(j));
  $$('[data-r]', rc).forEach(b => b.onclick = () => go(i + +b.dataset.r));
  cards.forEach((c, k) => c.addEventListener('click', () => { if (k !== i) go(k); }));
  rc.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
  const stage = $('.rc-stage', rc);
  stage.addEventListener('pointerdown', e => { if (e.target.closest('.ctl')) return; sx = e.clientX; ddx = 0; });
  stage.addEventListener('pointermove', e => {
    if (sx === null) return; ddx = e.clientX - sx;
    if (Math.abs(ddx) > 6) { rc.classList.add('dragging'); place(ddx / (stage.offsetHeight * .5)); }
  });
  const end = () => {
    if (sx === null) return; sx = null; rc.classList.remove('dragging');
    if (Math.abs(ddx) > 50) go(i + (ddx < 0 ? 1 : -1)); else place();
  };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end); stage.addEventListener('pointerleave', end);
  // the click that ends a drag must not start a video or switch cards
  stage.addEventListener('click', e => { if (Math.abs(ddx) > 6) { e.stopPropagation(); e.preventDefault(); } ddx = 0; }, true);
  rc.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault(); if (wheelLock || Math.abs(e.deltaX) < 25) return;
    go(i + (e.deltaX > 0 ? 1 : -1)); wheelLock = true; setTimeout(() => wheelLock = false, 650);
  }, { passive: false });
  place();
}

// ---- testimonials: trackpad swipe, touch/mouse drag, arrow keys, dots ----
const testi = $('#testi');
if (testi) {
  const track = $('#tTrack'), slides = [...track.children], dots = $$('#tDots button');
  let i = 0, lock = false, acc = 0, startX = null, dx = 0;
  const go = n => {
    i = (n + slides.length) % slides.length; track.style.transform = `translateX(${-i * 100}%)`;
    slides.forEach((s, k) => s.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i));
  };
  dots.forEach((d, k) => d.onclick = () => go(k));
  $$('[data-t]', testi).forEach(b => b.onclick = () => go(i + +b.dataset.t));
  testi.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
  testi.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault(); if (lock) return;
    acc += e.deltaX;
    if (Math.abs(acc) > 40) { go(i + (acc > 0 ? 1 : -1)); acc = 0; lock = true; setTimeout(() => lock = false, 700); }
  }, { passive: false });
  testi.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; startX = e.clientX; dx = 0; testi.classList.add('dragging'); try { testi.setPointerCapture(e.pointerId); } catch (_) {} });
  testi.addEventListener('pointermove', e => { if (startX === null) return; dx = e.clientX - startX; track.style.transform = `translateX(calc(${-i * 100}% + ${dx}px))`; });
  const end = () => { if (startX === null) return; testi.classList.remove('dragging'); startX = null; go(Math.abs(dx) > 60 ? i + (dx < 0 ? 1 : -1) : i); };
  testi.addEventListener('pointerup', end); testi.addEventListener('pointercancel', end);
}

// ---- quote form (Formspree, same endpoint as the current site) ----
const form = $('form[data-thanks]');
if (form) form.addEventListener('submit', async e => {
  e.preventDefault();
  const msg = $('.form-msg', form), btn = $('button[type=submit]', form);
  if (!form.checkValidity()) { form.reportValidity(); return; }
  btn.disabled = true; msg.textContent = EN ? 'Sending…' : 'Küldés…';
  try {
    const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(r.status);
    form.classList.add('sent'); msg.innerHTML = form.dataset.thanks;
  } catch (_) {
    btn.disabled = false;
    msg.textContent = EN ? 'Something went wrong. Please email us at hello@7sma.hu.' : 'Hiba történt. Kérjük, írj nekünk: hello@7sma.hu.';
  }
});

// ---- sample badge stays out of the footer ----
const badge = $('#badge'), footer = $('footer');
if (badge && footer) new IntersectionObserver(([e]) => badge.classList.toggle('hide', e.isIntersecting)).observe(footer);

// ---- consent: nothing optional loads until the visitor chooses ----
const CONSENT_KEY = '7sma-consent', SIX_MONTHS = 1000 * 60 * 60 * 24 * 182;
const GA_ID = 'G-TGHDC1H9XK', PIXEL_ID = '1352340693523865';   // the IDs the current 7sma.hu uses
const LIVE = /(^|\.)7sma\.hu$/.test(location.hostname);        // never track from previews or local copies
function readConsent() {
  try { const c = JSON.parse(localStorage.getItem(CONSENT_KEY)); return c && Date.now() - c.ts < SIX_MONTHS ? c : null; } catch (_) { return null; }
}
function loadAnalytics() {
  if (!LIVE || window.gtag) return;
  const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; document.head.appendChild(s);
  window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date()); gtag('config', GA_ID, { anonymize_ip: true });
}
function loadPixel() {
  if (!LIVE || window.fbq) return;
  !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', PIXEL_ID); fbq('track', 'PageView');
}
function applyConsent(c) { if (c.stat) loadAnalytics(); if (c.mkt) loadPixel(); }
// withdrawing consent: remove the cookies those tools set, then reload so nothing keeps running
function clearTrackingCookies() {
  const names = document.cookie.split(';').map(x => x.split('=')[0].trim()).filter(n => /^(_ga|_gid|_gat|_fbp|_fbc)/.test(n));
  const base = location.hostname.replace(/^www\./, '');
  names.forEach(n => {
    ['', '; domain=' + location.hostname, '; domain=.' + base].forEach(d => { document.cookie = n + '=; Max-Age=0; path=/' + d; });
  });
}

const ck = $('#cookie');
if (ck) {
  const stat = $('#ckStat'), mkt = $('#ckMkt'), more = $('#cookieMore');
  const saved = readConsent();
  if (saved) { applyConsent(saved); stat.checked = saved.stat; mkt.checked = saved.mkt; }
  else setTimeout(() => ck.classList.add('show'), 1000);
  const save = c => {
    const prev = readConsent();
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ stat: c.stat, mkt: c.mkt, ts: Date.now() }));
    ck.classList.remove('show', 'open'); more.setAttribute('aria-expanded', 'false');
    if (prev && ((prev.stat && !c.stat) || (prev.mkt && !c.mkt))) { clearTrackingCookies(); if (LIVE) location.reload(); return; }
    applyConsent(c);
  };
  $$('[data-c]', ck).forEach(b => b.onclick = () => {
    const k = b.dataset.c;
    if (k === 'accept') { stat.checked = mkt.checked = true; save({ stat: true, mkt: true }); }
    else if (k === 'reject') { stat.checked = mkt.checked = false; save({ stat: false, mkt: false }); }
    else save({ stat: stat.checked, mkt: mkt.checked });
  });
  more.onclick = () => { const o = !ck.classList.contains('open'); ck.classList.toggle('open', o); more.setAttribute('aria-expanded', String(o)); };
  const co = $('#cookieOpen'); if (co) co.onclick = () => { ck.classList.add('show', 'open'); more.setAttribute('aria-expanded', 'true'); };
}

// ---- message field grows with its text ----
$$('textarea[data-autogrow]').forEach(t => { const fit = () => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }; t.addEventListener('input', fit); fit(); });
