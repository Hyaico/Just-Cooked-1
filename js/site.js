/* Just Cooked — site behaviour (buildless ES module, v8).
   The home page is "the play": one pinned stage whose timeline is driven by
   scroll (GSAP ScrollTrigger). Interior pages use light reveals. Everything
   degrades to a static layout if GSAP fails to arrive or motion is reduced. */

const doc = document.documentElement;
doc.classList.add('js');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const hasGsap = typeof window.gsap !== 'undefined';
const hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
if (hasST) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/* Shared with the 3D scene: what the phone shows, how it rests, which props are out. */
const SCREENS = ['home', 'next-meal', 'pantry', 'recipe', 'support', 'support-settings'];
export const playState = { keys: SCREENS, screenIndex: 0, ry: -0.42, rx: 0.06, shapes: 1, ambient: 0, finale: 0 };
/* Shared with the reach (js/hands.js): how far each hand has come in, how closed the hold is, how far the hands
   have dissolved into the sky, how far the night has spread from the clasp, and where the clasp is (stage fractions). */
export const handsState = { active: 0, alpha: 0, reachA: 0, reachB: 0, curl: 0, dissolve: 0, reveal: 0, cx: 0.5, cy: 0.46 };

/* ---------------------------------------------------------------- scrolling helpers */
const navOffset = () => (parseInt(getComputedStyle(doc).getPropertyValue('--nav-h'), 10) || 62) + 24;
function scrollToEl(el) {
  const top = el.getBoundingClientRect().top + window.scrollY - navOffset();
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  closeMenu();
  scrollToEl(target);
  history.replaceState(null, '', '#' + id);
});

/* ---------------------------------------------------------------- nav + menu */
let menuOpen = false;
const nav = document.querySelector('[data-nav]');
const toggle = nav ? nav.querySelector('.nav__toggle') : null;
const menu = document.getElementById('menu');

function setMenu(open) {
  if (!menu || !toggle) return;
  menuOpen = open;
  toggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  if (open) nav.classList.remove('is-hidden');
}
function closeMenu() { if (menuOpen) setMenu(false); }

function initNav() {
  if (!nav) return;
  let last = window.scrollY, ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    if (!menuOpen) {
      if (y > 360 && y > last + 10) nav.classList.add('is-hidden');
      else if (y < last - 10 || y < 360) nav.classList.remove('is-hidden');
    }
    last = y;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(!menuOpen));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    matchMedia('(min-width: 820px)').addEventListener('change', (e) => { if (e.matches) closeMenu(); });
  }
}

/* ---------------------------------------------------------------- word splitting (keeps inline markup like <em>) */
function splitWords(root) {
  const words = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const mask = document.createElement('span');
          mask.className = 'wd';
          const inner = document.createElement('span');
          inner.className = 'wi';
          inner.textContent = part;
          mask.appendChild(inner);
          frag.appendChild(mask);
          words.push(inner);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    });
  };
  walk(root);
  root.classList.add('is-split');
  return words;
}

/* ---------------------------------------------------------------- reveals (interior pages) */
function initReveals() {
  const els = document.querySelectorAll('[data-reveal], [data-reveal-stagger], [data-split]:not([data-hero])');
  if (!els.length) return;
  if (reduced) { els.forEach((el) => el.classList.add('is-revealed')); return; }
  if (hasST) {
    els.forEach((el) => {
      if (el.hasAttribute('data-split')) {
        const words = splitWords(el);
        gsap.from(words, { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.035, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
        return;
      }
      const targets = el.hasAttribute('data-reveal-stagger') ? [...el.children] : [el];
      el.classList.add('is-revealed');
      gsap.from(targets, { opacity: 0, y: 30, duration: 1.1, ease: 'power3.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 88%', once: true }, clearProps: 'transform' });
    });
    return;
  }
  doc.classList.add('io');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); io.unobserve(entry.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });
  els.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------------- hero entrance (load) */
function initHero() {
  const el = document.querySelector('[data-split][data-hero]');
  if (!el || reduced || !hasGsap) return;
  const words = splitWords(el);
  gsap.from(words, { yPercent: 110, rotate: 2, opacity: 0, duration: 1.2, ease: 'power4.out', stagger: 0.045, delay: 0.15 });
  const after = document.querySelectorAll('[data-hero-in]');
  if (after.length) gsap.from(after, { opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.5, clearProps: 'transform' });
}

/* ---------------------------------------------------------------- the play */
function initPlay() {
  const play = document.querySelector('[data-play]');
  if (!play) return;
  doc.classList.add('play-page');
  if (!hasST || reduced) { play.classList.add('play--static'); return; }

  const q = (s) => play.querySelector(s);
  const slot = q('[data-phone-slot]');
  const heroAnchor = q('.play__anchor--hero');
  const dlAnchor = q('.play__anchor--download');
  const stage = q('.play__stage');
  const aura = q('.play__aura');
  const dusk = q('.play__dusk');
  const night = q('.play__night');
  const glow = q('.play__glow');
  const stars = q('.play__stars');
  const sheet = q('.play__sheet');
  const heroScene = q('[data-scene="hero"]');
  const steps = [...play.querySelectorAll('[data-scene="step"]')];
  const titleBlock = q('[data-scene="title"] .scene__block');
  const titleEye = titleBlock ? titleBlock.querySelector('.eyebrow') : null;
  const titleH2 = titleBlock ? titleBlock.querySelector('h2') : null;
  const titleEm = titleBlock ? titleBlock.querySelector('h2 em') : null;
  const titleP = titleBlock ? titleBlock.querySelector('p:not(.eyebrow)') : null;
  const hubA = q('.hub--a');
  const hubB = q('.hub--b');
  const hubAside = q('.hub__aside');
  const goals = [...play.querySelectorAll('[data-scene="hub"] .goal')];
  const canvas = document.getElementById('scene');
  // the reach: two hands of starlight on their own canvas (js/hands.js reads handsState every frame), plus a flash
  // and a ripple of light where they meet
  const handsCanvas = q('.play__hands');
  const flash = q('.play__flash');
  const ring = q('.play__ring');
  const dlBlock = q('[data-scene="download"] .scene__block');
  const dlFoot = q('[data-scene="download"] .play__foot');
  const idx = (key) => Math.max(0, SCREENS.indexOf(key));
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let wasNight = false;
  const setNight = (on) => { // the nav turns to night glass while the dark passage is on screen
    if (on === wasNight) return;
    wasNight = on;
    if (nav) nav.classList.toggle('is-night', on);
    if (themeMeta) themeMeta.setAttribute('content', on ? '#141B45' : '#F5EFE6');
  };

  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (ctx) => {
    const desktop = !!ctx.conditions.desktop;

    // where the phone rests in the hero and download scenes, relative to its centred base
    gsap.set(slot, { clearProps: 'transform' });
    const base = slot.getBoundingClientRect();
    const rel = (el) => {
      const a = el.getBoundingClientRect();
      return { x: a.left + a.width / 2 - (base.left + base.width / 2), y: a.top + a.height / 2 - (base.top + base.height / 2), scale: a.height / base.height };
    };
    const heroPos = rel(heroAnchor);
    const dlPos = rel(dlAnchor);

    // resting states
    gsap.set(slot, { x: heroPos.x, y: heroPos.y, scale: heroPos.scale });
    gsap.set(night, { opacity: 0, '--reveal': 0 });
    gsap.set([dusk, stars, glow].filter(Boolean), { opacity: 0 });
    gsap.set(heroScene, { autoAlpha: 1, x: 0, y: 0 });
    gsap.set(aura, { opacity: 1 });
    const stepTexts = steps.map((s) => s.querySelector('.scene__block'));
    const stepNums = steps.map((s) => s.querySelector('.scene__num'));
    const stepThings = steps.map((s) => [...s.querySelectorAll('.thing')]);
    gsap.set(stepTexts, { autoAlpha: 0, x: desktop ? -40 : 0, y: desktop ? 0 : 20 });
    gsap.set(stepNums, { autoAlpha: 0, y: 30 });
    stepThings.forEach((t) => gsap.set(t, { autoAlpha: 0, y: 18 }));
    // the words sit at the top while the hands play beneath them, then settle to the centre once the hands have gone
    gsap.set(titleBlock, { clearProps: 'transform' });
    const tr = titleBlock.getBoundingClientRect();
    const titleShift = (stage.clientHeight || innerHeight) / 2 - (tr.top + tr.height / 2);
    gsap.set(titleBlock, { autoAlpha: 0, y: 24 });
    // on the dusk the words are ink; they turn to light as the night reaches them
    const inkColours = [[titleH2, '#1A1815'], [titleEm, '#4C3FBF'], [titleEye, '#5A4EC8'], [titleP, '#3A342E']];
    const lightColours = [[titleH2, '#FBF6EC'], [titleEm, '#CFC4FF'], [titleEye, '#B9C6FF'], [titleP, 'rgba(245, 239, 230, 0.78)']];
    inkColours.forEach(([el, c]) => { if (el) gsap.set(el, { color: c }); });
    gsap.set([hubA, hubB, hubAside].filter(Boolean), { autoAlpha: 0, y: 20 });
    gsap.set(goals, { autoAlpha: 0, y: 14, scale: 0.96 });
    const fade = [canvas, slot].filter(Boolean); // the phone fades in place; it never slides away
    gsap.set(fade, { opacity: 1 });
    // where the hands meet, as fractions of the stage; the flash and the ripple sit on that point
    const clasp = desktop ? [0.46, 0.74] : [0.42, 0.72]; // the centre of the reaching palm, beneath the words
    const sw = stage.clientWidth || innerWidth, sh = stage.clientHeight || innerHeight;
    const ringK = Math.hypot(sw, sh) / (0.1523 * Math.max(sw, sh)); // ring scale per unit of reveal, so its bright edge rides the night's edge
    night.style.setProperty('--cx', clasp[0] * 100 + '%');
    night.style.setProperty('--cy', clasp[1] * 100 + '%');
    Object.assign(handsState, { active: 0, alpha: 0, reachA: 0, reachB: 0, curl: 0, dissolve: 0, reveal: 0, cx: clasp[0], cy: clasp[1] });
    if (window.__jcHands) window.__jcHands.relayout();
    if (handsCanvas) gsap.set(handsCanvas, { autoAlpha: 0 });
    gsap.set([flash, ring].filter(Boolean), { left: clasp[0] * 100 + '%', top: clasp[1] * 100 + '%', xPercent: -50, yPercent: -50, scale: 0.1, opacity: 0 });
    if (sheet) gsap.set(sheet, { autoAlpha: 0, xPercent: desktop ? 100 : 0, yPercent: desktop ? 0 : 100 });
    gsap.set(dlBlock, { autoAlpha: 0, y: 24 });
    gsap.set(dlFoot, { autoAlpha: 0 });
    Object.assign(playState, { screenIndex: idx('home'), ry: -0.42, rx: 0.06, shapes: 1, ambient: 0, finale: 0 });
    setNight(false);

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: play, start: 'top top', end: 'bottom bottom', scrub: 0.8,
        snap: location.search.includes('nosnap') ? false : { snapTo: 'labelsDirectional', duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power1.inOut' },
      },
    });

    // ── hero: hold, then the copy leaves and the phone settles in the centre
    tl.addLabel('hero', 0);
    tl.to(heroScene, { autoAlpha: 0, x: desktop ? -80 : 0, y: desktop ? 0 : 40, duration: 0.6, ease: 'power2.in' }, 0.5);
    tl.to(aura, { opacity: 0, duration: 0.6 }, 0.5);
    tl.to(slot, { x: 0, y: 0, scale: 1, duration: 1.1, ease: 'power3.inOut' }, 0.5);
    tl.to(playState, { ry: 0.12, rx: 0, shapes: 0, duration: 1.1, ease: 'power3.inOut' }, 0.5);
    tl.to(playState, { ambient: 1, duration: 0.8, ease: 'power2.out' }, 1.4);

    // ── steps: the phone stays put, captions and details take turns around it
    let t = 1.7;
    steps.forEach((step, i) => {
      tl.set(playState, { screenIndex: idx(step.dataset.screen) }, t - 0.15);
      tl.to(stepNums[i], { autoAlpha: 0.08, y: 0, duration: 0.6, ease: 'power3.out' }, t - 0.05);
      tl.to(stepTexts[i], { autoAlpha: 1, x: 0, y: 0, duration: 0.45, ease: 'power3.out' }, t);
      tl.to(stepThings[i], { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power3.out' }, t + 0.1);
      tl.addLabel('step' + (i + 1), t + 0.6);
      const out = t + 1.4;
      tl.to(stepTexts[i], { autoAlpha: 0, x: desktop ? 40 : 0, y: desktop ? 0 : -20, duration: 0.35, ease: 'power2.in' }, out);
      tl.to(stepNums[i], { autoAlpha: 0, y: -24, duration: 0.35, ease: 'power2.in' }, out);
      tl.to(stepThings[i], { autoAlpha: 0, y: -12, duration: 0.3, stagger: 0.04, ease: 'power2.in' }, out);
      t = out + 0.55;
    });

    // ── the Support hub introduces itself: the words first, at the top; then beneath them a hand reaches up
    //    for help, another comes to take it, and the night spreads out from the point where they meet
    const ts = t;
    tl.to(playState, { ambient: 0, duration: 0.7, ease: 'sine.inOut' }, ts - 0.6);
    tl.to(dusk, { opacity: 1, duration: 1.4, ease: 'sine.inOut' }, ts - 0.6);
    tl.to(fade, { opacity: 0, duration: 0.8, ease: 'sine.inOut' }, ts - 0.1);
    tl.to(titleBlock, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'sine.out' }, ts + 0.2);
    if (handsCanvas) tl.set(handsCanvas, { autoAlpha: 1 }, ts + 0.6);
    tl.set(handsState, { active: 1 }, ts + 0.6);
    tl.to(handsState, { alpha: 1, duration: 0.5, ease: 'sine.out' }, ts + 0.7);
    tl.to(handsState, { reachA: 1, duration: 1.8, ease: 'power2.out' }, ts + 0.7);
    tl.to(handsState, { reachB: 1, duration: 1.6, ease: 'power2.inOut' }, ts + 1.7);
    tl.to(handsState, { curl: 1, duration: 0.6, ease: 'power2.inOut' }, ts + 3.1);
    // a pool of light gathers where they are about to meet, then the touch: a flash, and a ripple of light that
    // carries the night across the whole sky (the night is clipped to a circle whose radius is the --reveal variable)
    if (flash) {
      tl.fromTo(flash, { scale: 0.5, opacity: 0 }, { scale: 1.1, opacity: 0.45, duration: 1.6, ease: 'sine.inOut' }, ts + 1.6);
      tl.to(flash, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }, ts + 3.35);
      tl.to(flash, { scale: 1.8, opacity: 0, duration: 1.0, ease: 'power2.out' }, ts + 3.7);
    }
    tl.set(night, { opacity: 1 }, ts + 3.5);
    tl.fromTo(night, { '--reveal': 0 }, { '--reveal': 142, duration: 1.5, ease: 'power2.out' }, ts + 3.52);
    tl.to(handsState, { reveal: 1, duration: 1.5, ease: 'power2.out' }, ts + 3.52);
    if (ring) tl.fromTo(ring, { scale: 0.1, opacity: 0.9 }, { scale: 0.1 + ringK, opacity: 0, duration: 1.5, ease: 'power2.out' }, ts + 3.52);
    if (glow) tl.to(glow, { opacity: 1, duration: 1.4, ease: 'sine.inOut' }, ts + 3.9);
    lightColours.forEach(([el, c]) => { if (el) tl.to(el, { color: c, duration: 0.8, ease: 'sine.inOut' }, ts + 3.85); }); // the words turn to light
    tl.set(playState, { screenIndex: idx('support'), ry: 0.1, rx: 0 }, ts + 2.0);
    tl.addLabel('hands', ts + 4.8);
    tl.to(handsState, { dissolve: 1, duration: 1.1, ease: 'power1.in' }, ts + 5.4); // the hands lift away and become the stars
    tl.to(stars, { opacity: 1, duration: 1.3, ease: 'sine.inOut' }, ts + 5.6);
    tl.set(handsState, { active: 0 }, ts + 6.6);
    if (handsCanvas) tl.set(handsCanvas, { autoAlpha: 0 }, ts + 6.6);
    tl.to(titleBlock, { y: titleShift, duration: 1.0, ease: 'sine.inOut' }, ts + 6.3); // the words settle to the centre
    tl.addLabel('support', ts + 7.3);
    tl.to(titleBlock, { autoAlpha: 0, y: titleShift - 14, duration: 0.6, ease: 'sine.inOut' }, ts + 8.0);
    const nightIn = ts + 4.1;

    // ── the Support hub: the phone fades back in, then each screen gets its own words
    const th = ts + 8.4;
    tl.to(fade, { opacity: 1, duration: 0.9, ease: 'sine.inOut' }, th);
    tl.to(hubA, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'sine.out' }, th + 0.4);
    if (hubAside) tl.to(hubAside, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'sine.out' }, th + 0.7);
    tl.addLabel('hub1', th + 1.5);
    tl.to([hubA, hubAside].filter(Boolean), { autoAlpha: 0, y: -10, duration: 0.5, ease: 'sine.inOut' }, th + 2.3);
    tl.set(playState, { screenIndex: idx('support-settings') }, th + 2.4);
    tl.to(hubB, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'sine.out' }, th + 2.8);
    tl.to(goals, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15, ease: 'sine.out' }, th + 3.0);
    tl.addLabel('hub2', th + 4.2);
    let tc = th + 5.0;

    // ── the day sheet: the cream page comes back over the night with one clean curved edge (in from the right on
    //    desktop, up from below on phones); the phone settles on the line between the two and the food returns
    const td = tc;
    tl.to([hubB, ...goals], { autoAlpha: 0, y: -10, duration: 0.5, ease: 'sine.inOut' }, td);
    if (sheet) {
      tl.set(sheet, { autoAlpha: 1 }, td + 0.2);
      tl.to(sheet, { xPercent: 0, yPercent: 0, duration: 1.4, ease: 'power3.inOut' }, td + 0.25);
    }
    tl.set(playState, { screenIndex: idx('home') }, td + 0.6);
    tl.to(slot, { x: dlPos.x, y: dlPos.y, scale: dlPos.scale, duration: 1.2, ease: 'sine.inOut' }, td + 0.3);
    tl.to(playState, { ry: -0.3, rx: 0.05, duration: 1.2, ease: 'sine.inOut' }, td + 0.3);
    tl.to(playState, { finale: 1, duration: 0.9, ease: 'power2.out' }, td + 1.0);
    tl.to(dlBlock, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, td + 1.15);
    tl.to(dlFoot, { autoAlpha: 1, duration: 0.4 }, td + 1.5);
    tl.addLabel('download', td + 1.9);
    tl.to({}, { duration: 0.4 }, td + 1.9);
    // on desktop the sheet covers the top edge again, so the nav goes back to cream; on phones the finale's top stays night
    const nightOut = desktop ? td + 0.9 : Infinity;
    tl.eventCallback('onUpdate', () => { const now = tl.time(); setNight(now >= nightIn && now < nightOut); });

    const go = (label) => window.scrollTo({ top: tl.scrollTrigger.labelToScroll(label), behavior: 'smooth' });
    window.__jcPlay = { tl, go }; // for the screenshot tooling
    const buttons = [...play.querySelectorAll('[data-play-go]')];
    const handlers = buttons.map((b) => { const h = () => go(b.dataset.playGo); b.addEventListener('click', h); return [b, h]; });

    return () => {
      handlers.forEach(([b, h]) => b.removeEventListener('click', h));
      tl.scrollTrigger && tl.scrollTrigger.kill();
      tl.kill();
      setNight(false);
    };
  });
}

/* ---------------------------------------------------------------- FAQ side nav */
function initFaqNav() {
  const links = [...document.querySelectorAll('.faq-nav a')];
  if (!links.length) return;
  const groups = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id)); });
  }, { rootMargin: '-20% 0px -60% 0px' });
  groups.forEach((g) => io.observe(g));
}

/* ---------------------------------------------------------------- policy table of contents */
function initPolicy() {
  const body = document.getElementById('policy-body');
  if (!body) return;
  const heads = [...body.querySelectorAll('h2')];
  if (!heads.length) return;
  const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  heads.forEach((h, i) => { if (!h.id) h.id = slug(h.textContent) || 'section-' + (i + 1); });
  document.querySelectorAll('[data-toc]').forEach((list) => {
    list.textContent = '';
    heads.forEach((h) => { const a = document.createElement('a'); a.href = '#' + h.id; a.textContent = h.textContent.replace(/^\d+\.\s*/, ''); list.appendChild(a); });
  });
  const links = [...document.querySelectorAll('[data-toc] a')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id)); });
  }, { rootMargin: '-12% 0px -72% 0px' });
  heads.forEach((h) => io.observe(h));
  const count = document.querySelector('[data-section-count]');
  if (count) count.textContent = heads.length + ' sections';
}

/* ---------------------------------------------------------------- magnetic buttons + tilt cards (desktop only) */
function initPointerFx() {
  if (!finePointer || reduced || !hasGsap) return;
  document.querySelectorAll('.btn:not(.btn--block)').forEach((btn) => {
    const strength = 0.28;
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, { x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength, duration: 0.5, ease: 'power3.out' });
    });
    btn.addEventListener('pointerleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }));
  });
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.classList.add('card--tilt');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, { rotateY: px * 8, rotateX: -py * 8, transformPerspective: 900, duration: 0.5, ease: 'power2.out' });
    });
    card.addEventListener('pointerleave', () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'power3.out' }));
  });
}

/* ---------------------------------------------------------------- 3D scene (home only) */
async function initScene() {
  const canvas = document.getElementById('scene');
  if (!canvas || reduced) return;
  if (!document.querySelector('[data-phone-slot]')) return;
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) return;
  } catch { return; }
  try {
    const mod = await import('/js/scene.js');
    const api = await mod.start(canvas, { state: hasST && !reduced ? playState : null });
    window.__jcScene = api;
    doc.classList.add('webgl');
  } catch (err) {
    console.warn('[just cooked] 3D scene unavailable, showing static screens.', err);
  }
  // the reach has its own small canvas and only draws while the Support passage is on screen
  const handsCanvas = document.querySelector('.play__hands');
  if (handsCanvas && hasST) {
    try {
      const mod = await import('/js/hands.js');
      window.__jcHands = mod.start(handsCanvas, handsState);
    } catch (err) {
      console.warn('[just cooked] the hands are resting.', err);
    }
  }
}

/* ---------------------------------------------------------------- boot */
initNav();
initReveals();
initHero();
initPlay();
initFaqNav();
initPolicy();
initPointerFx();
initScene();

addEventListener('load', () => { if (hasST) ScrollTrigger.refresh(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (hasST) ScrollTrigger.refresh(); });
addEventListener('pageshow', (e) => { if (e.persisted) closeMenu(); });
