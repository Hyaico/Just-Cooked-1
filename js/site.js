/* Just Cooked — site behaviour (buildless ES module, v5).
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
  const aura = q('.play__aura');
  const dusk = q('.play__dusk');
  const night = q('.play__night');
  const stars = q('.play__stars');
  const dawn = q('.play__dawn');
  const heroScene = q('[data-scene="hero"]');
  const steps = [...play.querySelectorAll('[data-scene="step"]')];
  const titleBlock = q('[data-scene="title"] .scene__block');
  const hubBlock = q('[data-scene="hub"] .scene__block');
  const goals = [...play.querySelectorAll('[data-scene="hub"] .goal')];
  const dlBlock = q('[data-scene="download"] .scene__block');
  const dlFoot = q('[data-scene="download"] .play__foot');
  const idx = (key) => Math.max(0, SCREENS.indexOf(key));

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
    gsap.set(night, { opacity: 0 });
    gsap.set([dusk, stars, dawn], { opacity: 0 });
    gsap.set(heroScene, { autoAlpha: 1, x: 0, y: 0 });
    gsap.set(aura, { opacity: 1 });
    const stepTexts = steps.map((s) => s.querySelector('.scene__block'));
    const stepNums = steps.map((s) => s.querySelector('.scene__num'));
    const stepThings = steps.map((s) => [...s.querySelectorAll('.thing')]);
    gsap.set(stepTexts, { autoAlpha: 0, x: desktop ? -40 : 0, y: desktop ? 0 : 20 });
    gsap.set(stepNums, { autoAlpha: 0, y: 30 });
    stepThings.forEach((t) => gsap.set(t, { autoAlpha: 0, y: 18 }));
    gsap.set(titleBlock, { autoAlpha: 0, y: 24 });
    gsap.set(hubBlock, { autoAlpha: 0, y: 20 });
    gsap.set(goals, { autoAlpha: 0, y: 14, scale: 0.96 });
    gsap.set(dlBlock, { autoAlpha: 0, y: 24 });
    gsap.set(dlFoot, { autoAlpha: 0 });
    Object.assign(playState, { screenIndex: idx('home'), ry: -0.42, rx: 0.06, shapes: 1, ambient: 0, finale: 0 });

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

    // ── dusk to night, slowly: the page tints, the phone sinks out of view, the sky settles in, stars arrive
    const ts = t;
    const sink = Math.round(window.innerHeight * 0.95);
    tl.to(playState, { ambient: 0, duration: 0.7, ease: 'sine.inOut' }, ts - 0.6);
    tl.to(dusk, { opacity: 1, duration: 1.6, ease: 'sine.inOut' }, ts - 0.6);
    tl.to(slot, { y: sink, duration: 1.5, ease: 'sine.inOut' }, ts);
    tl.to(night, { opacity: 1, duration: 2.2, ease: 'sine.inOut' }, ts + 0.3);
    tl.to(stars, { opacity: 1, duration: 1.8, ease: 'sine.inOut' }, ts + 1.4);
    tl.set(playState, { screenIndex: idx('support'), ry: 0.1, rx: 0 }, ts + 1.2);
    tl.to(titleBlock, { autoAlpha: 1, y: 0, duration: 1.0, ease: 'sine.out' }, ts + 1.9);
    tl.addLabel('support', ts + 3.0);
    tl.to(titleBlock, { autoAlpha: 0, y: -14, duration: 0.7, ease: 'sine.inOut' }, ts + 3.9);

    // ── made for you: the phone rises back, the message lands, the goals light up one by one
    const th = ts + 4.3;
    tl.to(slot, { y: 0, duration: 1.4, ease: 'sine.inOut' }, th);
    tl.to(hubBlock, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'sine.out' }, th + 0.9);
    tl.to(goals, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.18, ease: 'sine.out' }, th + 1.1);
    tl.addLabel('hub1', th + 2.2);
    tl.set(playState, { screenIndex: idx('support-settings') }, th + 2.6);
    tl.addLabel('hub2', th + 3.2);
    let tc = th + 4.0;

    // ── dawn: the night lifts, the phone settles beside the ask, the food comes back
    const td = tc;
    tl.to([hubBlock, ...goals], { autoAlpha: 0, y: -10, duration: 0.5, ease: 'sine.inOut' }, td);
    tl.to([night, stars], { opacity: 0, duration: 1.6, ease: 'sine.inOut' }, td + 0.2);
    tl.to(dusk, { opacity: 0, duration: 1.4, ease: 'sine.inOut' }, td + 0.6);
    tl.to(dawn, { opacity: 1, duration: 1.4, ease: 'sine.inOut' }, td + 0.6);
    tl.set(playState, { screenIndex: idx('home') }, td + 0.6);
    tl.to(slot, { x: dlPos.x, y: dlPos.y, scale: dlPos.scale, duration: 1.2, ease: 'sine.inOut' }, td + 0.3);
    tl.to(playState, { ry: -0.3, rx: 0.05, duration: 1.2, ease: 'sine.inOut' }, td + 0.3);
    tl.to(playState, { finale: 1, duration: 0.9, ease: 'power2.out' }, td + 0.9);
    tl.to(dlBlock, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, td + 0.9);
    tl.to(dlFoot, { autoAlpha: 1, duration: 0.4 }, td + 1.3);
    tl.addLabel('download', td + 1.7);
    tl.to({}, { duration: 0.4 }, td + 1.7);

    const go = (label) => window.scrollTo({ top: tl.scrollTrigger.labelToScroll(label), behavior: 'smooth' });
    const buttons = [...play.querySelectorAll('[data-play-go]')];
    const handlers = buttons.map((b) => { const h = () => go(b.dataset.playGo); b.addEventListener('click', h); return [b, h]; });

    return () => {
      handlers.forEach(([b, h]) => b.removeEventListener('click', h));
      tl.scrollTrigger && tl.scrollTrigger.kill();
      tl.kill();
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
