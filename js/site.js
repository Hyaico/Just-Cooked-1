/* Just Cooked — site behaviour (buildless ES module, v2).
   Native scrolling. GSAP + ScrollTrigger are optional CDN globals; everything
   degrades to plain CSS / IntersectionObserver if they fail to arrive. */

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

/* ---------------------------------------------------------------- scrolling helpers */
const navOffset = () => (parseInt(getComputedStyle(doc).getPropertyValue('--nav-h'), 10) || 62) + 24;
function scrollToEl(el) {
  const top = el.getBoundingClientRect().top + window.scrollY - navOffset();
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
}

/* in-page anchors (delegated so generated TOC links work too) */
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

/* ---------------------------------------------------------------- reveals */
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
      gsap.from(targets, {
        opacity: 0, y: 30, duration: 1.1, ease: 'power3.out', stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        clearProps: 'transform',
      });
    });
    return;
  }

  doc.classList.add('io');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  els.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------------- hero entrance */
function initHero() {
  const el = document.querySelector('[data-split][data-hero]');
  if (!el || reduced || !hasGsap) return;
  const words = splitWords(el);
  gsap.from(words, { yPercent: 110, rotate: 2, opacity: 0, duration: 1.2, ease: 'power4.out', stagger: 0.045, delay: 0.15 });
  const after = document.querySelectorAll('[data-hero-in]');
  if (after.length) gsap.from(after, { opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.5, clearProps: 'transform' });
}

/* ---------------------------------------------------------------- scroll-driven statement (one CSS variable per frame) */
function initWords() {
  document.querySelectorAll('[data-words]').forEach((p) => {
    const text = p.textContent.trim().split(/\s+/);
    p.textContent = '';
    text.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      s.style.setProperty('--i', i);
      p.appendChild(s);
      if (i < text.length - 1) p.appendChild(document.createTextNode(' '));
    });
    p.style.setProperty('--n', text.length);
    if (reduced) { p.style.setProperty('--p', 1); return; }
    if (hasST) {
      ScrollTrigger.create({ trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true, onUpdate: (self) => p.style.setProperty('--p', self.progress.toFixed(4)) });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { p.style.setProperty('--p', 1); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(p);
  });
}

/* ---------------------------------------------------------------- Next Meal story */
function initStory() {
  const story = document.querySelector('[data-story]');
  if (!story) return;
  const steps = [...story.querySelectorAll('[data-step]')];
  const slot = story.querySelector('[data-phone-slot]');
  const img = slot ? slot.querySelector('img') : null;
  const dots = [...story.querySelectorAll('.story__dots span')];
  const mq = matchMedia('(min-width: 900px)');
  let io = null;
  let current = -1;

  const activate = (i) => {
    if (i === current || i < 0) return;
    current = i;
    steps.forEach((s, j) => s.classList.toggle('is-active', i === j));
    dots.forEach((d, j) => d.classList.toggle('is-active', i === j));
    const step = steps[i];
    if (slot && step.dataset.screen) slot.dataset.screen = step.dataset.screen;
    if (img && step.dataset.shot && !doc.classList.contains('webgl')) {
      const base = '/assets/shots/' + step.dataset.shot;
      img.srcset = base + '-560.webp 560w, ' + base + '-980.webp 980w';
      img.src = base + '-560.webp';
    }
  };

  const setup = () => {
    if (io) io.disconnect();
    if (mq.matches) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) activate(steps.indexOf(e.target)); });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    } else {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting && e.intersectionRatio >= 0.6) activate(steps.indexOf(e.target)); });
      }, { root: steps[0].parentElement, threshold: [0.6] });
    }
    steps.forEach((s) => io.observe(s));
  };
  activate(0);
  setup();
  mq.addEventListener('change', setup);
}

/* ---------------------------------------------------------------- tools: progress bar + pinned horizontal scroll on desktop */
function initTools() {
  const tools = document.querySelector('[data-tools]');
  if (!tools) return;
  const track = tools.querySelector('.tools__track');
  const bar = tools.querySelector('.tools__progress i');
  const setProgress = (p) => { if (bar) bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')'; };
  track.addEventListener('scroll', () => {
    const max = track.scrollWidth - track.clientWidth;
    if (max > 0) setProgress(track.scrollLeft / max);
  }, { passive: true });
  if (!hasST || reduced) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1000px)', () => {
    tools.classList.add('tools--pin');
    const dist = () => Math.max(0, track.scrollWidth - tools.clientWidth);
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: tools, start: 'center center', end: () => '+=' + dist(), pin: true, scrub: 0.5, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => setProgress(self.progress),
      },
    });
    return () => { tools.classList.remove('tools--pin'); setProgress(0); };
  });
}

/* ---------------------------------------------------------------- dusk: tint the page as the dark section approaches */
function initDusk() {
  const beat = document.querySelector('.beat');
  if (!beat || !hasST || reduced) return;
  const set = (v) => doc.style.setProperty('--dusk', Math.max(0, Math.min(1, v)).toFixed(3));
  ScrollTrigger.create({ trigger: beat, start: 'top 125%', end: 'top 30%', scrub: true, onUpdate: (self) => set(self.progress) });
  ScrollTrigger.create({ trigger: beat, start: 'bottom 70%', end: 'bottom -25%', scrub: true, onUpdate: (self) => set(1 - self.progress) });
}

/* ---------------------------------------------------------------- FAQ side nav */
function initFaqNav() {
  const links = [...document.querySelectorAll('.faq-nav a')];
  if (!links.length) return;
  const groups = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
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
    heads.forEach((h) => {
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.replace(/^\d+\.\s*/, '');
      list.appendChild(a);
    });
  });
  const links = [...document.querySelectorAll('[data-toc] a')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
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
    const api = await mod.start(canvas);
    window.__jcScene = api;
    doc.classList.add('webgl');
    if (hasST) ScrollTrigger.addEventListener('refresh', api.measure);
  } catch (err) {
    console.warn('[just cooked] 3D scene unavailable, showing static screens.', err);
  }
}

/* ---------------------------------------------------------------- boot */
initNav();
initReveals();
initHero();
initWords();
initStory();
initTools();
initDusk();
initFaqNav();
initPolicy();
initPointerFx();
initScene();

addEventListener('load', () => { if (hasST) ScrollTrigger.refresh(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (hasST) ScrollTrigger.refresh(); });
addEventListener('pageshow', (e) => { if (e.persisted) closeMenu(); });
