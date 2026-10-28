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
/* Shared with the shooting star (js/star.js): whether it is drawing, seconds since it launched, how long the head takes
   to run the whole arc, the arc itself (start, control and end points as stage fractions) and the stretch of it
   (path parameters) where it sheds light. */
export const starState = { active: 0, sec: 0, dur: 3.8, alpha: 1, path: null, emit: [0, 1] };

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

/* ---------------------------------------------------------------- letter splitting (words stay whole for wrapping; each letter gets its own span) */
function splitChars(root) {
  const chars = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const word = document.createElement('span');
          word.className = 'ww'; // keeps the word whole when it wraps (not the clipping .wd of the word reveals)
          [...part].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; word.appendChild(s); chars.push(s); });
          frag.appendChild(word);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    });
  };
  walk(root);
  root.classList.add('is-typed');
  return chars;
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
  const hubA = q('.hub--a');
  const hubB = q('.hub--b');
  const hubAside = q('.hub__aside');
  const goals = [...play.querySelectorAll('[data-scene="hub"] .goal')];
  const canvas = document.getElementById('scene');
  // the wish (a speech bubble) and the shooting star that answers it (js/star.js reads starState every frame)
  const starCanvas = q('.play__star');
  const wish = q('.wish');
  const wishBox = q('.wish__box');
  const wishText = q('.wish__text');
  const wishChars = wishText ? splitChars(wishText) : []; // typed in one letter at a time, in real time
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
    gsap.set(night, { opacity: 1 }); // its mask (--sweep) keeps it hidden until the star paints it in
    night.style.setProperty('--sweep', '-20%');
    gsap.set([dusk, stars, glow].filter(Boolean), { opacity: 0 });
    gsap.set(heroScene, { autoAlpha: 1, x: 0, y: 0 });
    gsap.set(aura, { opacity: 1 });
    const stepTexts = steps.map((s) => s.querySelector('.scene__block'));
    const stepNums = steps.map((s) => s.querySelector('.scene__num'));
    const stepThings = steps.map((s) => [...s.querySelectorAll('.thing')]);
    gsap.set(stepTexts, { autoAlpha: 0, x: desktop ? -40 : 0, y: desktop ? 0 : 20 });
    gsap.set(stepNums, { autoAlpha: 0, y: 30 });
    stepThings.forEach((t) => gsap.set(t, { autoAlpha: 0, y: 18 }));
    gsap.set(titleBlock, { autoAlpha: 0, y: 24 });
    if (wish) gsap.set(wish, { autoAlpha: 0, scale: 0.86, y: 16, transformOrigin: '18% 100%' });
    if (wishBox) gsap.set(wishBox, { autoAlpha: 1, scale: 1, y: 0, transformOrigin: '50% 60%' });
    // the typewriter: untyped letters keep their space (so the bubble never reflows) and a caret follows the last one
    const typer = { n: 0 };
    let typedTo = -1;
    const renderTyping = () => {
      const n = Math.min(wishChars.length, Math.floor(typer.n + 1e-4));
      if (n === typedTo) return;
      wishChars.forEach((c, i) => { c.classList.toggle('is-off', i >= n); c.classList.toggle('is-caret', i === n - 1); });
      if (wishChars[0]) wishChars[0].classList.toggle('is-caret-start', n === 0);
      typedTo = n;
    };
    renderTyping();
    gsap.set([hubA, hubB, hubAside].filter(Boolean), { autoAlpha: 0, y: 20 });
    gsap.set(goals, { autoAlpha: 0, y: 14, scale: 0.96 });
    const fade = [canvas, slot].filter(Boolean); // the phone fades in place; it never slides away
    gsap.set(fade, { opacity: 1 });
    // the star's arc (start, control, end as stage fractions, y down): in from well off the left, a gentle dip, out
    // well past the right, so it arrives from off screen and leaves off screen
    const sw = stage.clientWidth || innerWidth, sh = stage.clientHeight || innerHeight;
    const path = desktop ? [[-0.2, 0.3], [0.5, 0.56], [1.32, 0.4]] : [[-0.32, 0.3], [0.5, 0.52], [1.42, 0.44]];
    const DUR = 3.8; // seconds for the head to run the whole arc
    const LIFE = 1.6; // the longest any of the light it sheds lingers
    const bez = (s) => { const u = 1 - s; return [u * u * path[0][0] + 2 * u * s * path[1][0] + s * s * path[2][0], u * u * path[0][1] + 2 * u * s * path[1][1] + s * s * path[2][1]]; };
    const sAtX = (fx) => { let lo = 0, hi = 1; for (let i = 0; i < 32; i++) { const m = (lo + hi) / 2; if (bez(m)[0] < fx) lo = m; else hi = m; } return (lo + hi) / 2; };
    const tAtX = (fx) => sAtX(fx) * DUR; // seconds after launch when the head reaches that part of the screen
    const emit = [Math.max(0, sAtX(-0.06)), Math.min(1, sAtX(1.04))]; // it only sheds light where it can be seen
    const flightEnd = emit[1] * DUR + LIFE + 0.15; // by now the last of its light has faded
    Object.assign(starState, { active: 0, sec: 0, dur: DUR, alpha: 1, path, emit });
    if (window.__jcStar) window.__jcStar.relayout();
    if (starCanvas) gsap.set(starCanvas, { autoAlpha: 0 });
    if (sheet) gsap.set(sheet, { autoAlpha: 0, xPercent: desktop ? 100 : 0, yPercent: desktop ? 0 : 100 });
    gsap.set(dlBlock, { autoAlpha: 0, y: 24 });
    gsap.set(dlFoot, { autoAlpha: 0 });
    Object.assign(playState, { screenIndex: idx('home'), ry: -0.42, rx: 0.06, shapes: 1, ambient: 0, finale: 0 });
    setNight(false);

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        // an unhurried scrub and slow snaps, so every scene's entrance has room to play out
        trigger: play, start: 'top top', end: 'bottom bottom', scrub: 1.1,
        snap: location.search.includes('nosnap') ? false : { snapTo: 'labelsDirectional', duration: { min: 0.9, max: 1.7 }, delay: 0.12, ease: 'power2.inOut' },
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

    // ── the wish: the phone fades into the dusk. Arriving at the wish starts the moment (below, in real time): the
    //    bubble comes up, the wish types out, sits, and the shooting star carries it away and brings in the night.
    //    The page waits there until it has played; scrolling on from it, the hub's words leave and the phone returns.
    const ts = t;
    tl.to(playState, { ambient: 0, duration: 0.7, ease: 'sine.inOut' }, ts - 0.6);
    tl.to(dusk, { opacity: 1, duration: 1.4, ease: 'sine.inOut' }, ts - 0.6);
    tl.to(fade, { opacity: 0, duration: 0.8, ease: 'sine.inOut' }, ts - 0.1);
    const wishTime = ts + 1.2;
    tl.addLabel('wish', wishTime);
    tl.set(playState, { screenIndex: idx('support'), ry: 0.1, rx: 0 }, wishTime + 0.1);
    tl.fromTo(titleBlock, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -14, duration: 0.6, ease: 'sine.inOut', immediateRender: false }, wishTime + 0.4);

    // ── the Support hub: the phone fades back in, then each screen gets its own words
    const th = wishTime + 0.8;
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
    let nightShown = false; // set by the moment once the star has painted the night across the top
    const syncNight = () => { const now = tl.time(); setNight(nightShown && now >= ts && now < nightOut); };
    tl.eventCallback('onUpdate', syncNight);
    const scrollAt = (time) => { const s = tl.scrollTrigger; return s.start + (s.end - s.start) * (time / tl.duration()); };

    // ── the moment: real time, not scrubbed, so a quick scroll can never cut it short. The bubble comes up, the wish
    //    types out and sits for a beat; then the star crosses. The night is painted in behind its head (the --sweep
    //    mask on .play__night), the bubble lifts away as the star reaches it, and once it has gone the words land.
    const SWEEP = (100 * Math.PI) / 180; // the angle of the mask's gradient on .play__night
    const sweepL = sw * Math.sin(SWEEP) + sh * Math.abs(Math.cos(SWEEP));
    const sweepTo = (sec) => {
      const hd = bez(Math.min(1, Math.max(0, sec / DUR)));
      const along = (hd[0] - 0.5) * sw * Math.sin(SWEEP) - (hd[1] - 0.5) * sh * Math.cos(SWEEP) + sweepL / 2;
      night.style.setProperty('--sweep', ((along / sweepL) * 100 + 14).toFixed(2) + '%'); // the edge runs a little ahead, so the head glows on dark
    };
    const POP = 0.2, TYPE_AT = 0.85, PER_CHAR = 0.055;
    const typeEnd = TYPE_AT + wishChars.length * PER_CHAR;
    const launch = typeEnd + 1.4; // the whole wish stays on screen for a beat before the star comes
    const stageLeft = stage.getBoundingClientRect().left;
    const bubbleLeft = wishBox ? (wishBox.getBoundingClientRect().left - stageLeft) / sw : 0.25;
    const tTitle = launch + tAtX(0.92); // the words land once the star is nearly gone and its trail has thinned
    const moment = gsap.timeline({ paused: true });
    if (wish) moment.fromTo(wish, { autoAlpha: 0, scale: 0.86, y: 16 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.6)', immediateRender: false }, POP);
    if (wishChars.length) moment.to(typer, { n: wishChars.length, duration: wishChars.length * PER_CHAR, ease: 'none', onUpdate: renderTyping }, TYPE_AT);
    if (starCanvas) moment.set(starCanvas, { autoAlpha: 1 }, launch);
    moment.set(starState, { active: 1 }, launch);
    moment.fromTo(starState, { sec: 0 }, { sec: flightEnd, duration: flightEnd, ease: 'none', immediateRender: false, onUpdate: () => sweepTo(starState.sec) }, launch);
    if (wishBox) moment.to(wishBox, { autoAlpha: 0, scale: 0.94, y: -26, duration: 0.75, ease: 'power2.in' }, launch + tAtX(bubbleLeft + 0.06)); // the star takes the wish
    if (glow) moment.to(glow, { opacity: 1, duration: 1.6, ease: 'sine.inOut' }, launch + tAtX(0.3));
    if (stars) moment.to(stars, { opacity: 1, duration: 1.6, ease: 'sine.inOut' }, launch + tAtX(0.5));
    moment.call(() => { nightShown = true; syncNight(); }, null, launch + tAtX(0.45));
    moment.to(titleBlock, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'sine.out' }, tTitle);
    moment.call(() => hold(false), null, tTitle + 1.3); // the words are fully in before the page lets you move on
    moment.set(starState, { active: 0 }, launch + flightEnd);
    if (starCanvas) moment.set(starCanvas, { autoAlpha: 0 }, launch + flightEnd);

    // the hold: while the moment plays, the page waits at the wish (scrolling on is held, scrolling back is free)
    let holdOn = false, holdTimer = 0, lastTouchY = 0;
    const holdAt = () => scrollAt(wishTime);
    const atHold = () => window.scrollY >= holdAt() - 2;
    const holdKeys = new Set(['ArrowDown', 'PageDown', 'End', ' ', 'Spacebar']);
    const onTouchStart = (e) => { if (e.touches[0]) lastTouchY = e.touches[0].clientY; };
    const holdWheel = (e) => { if (e.deltaY > 0 && atHold() && e.cancelable) e.preventDefault(); };
    const holdTouch = (e) => {
      if (!e.touches[0]) return;
      const y = e.touches[0].clientY;
      if (y < lastTouchY && atHold() && e.cancelable) e.preventDefault();
      lastTouchY = y;
    };
    const holdKey = (e) => { if (holdKeys.has(e.key) && atHold()) e.preventDefault(); };
    const holdScroll = () => { const y = holdAt(); if (window.scrollY > y + 3) window.scrollTo(0, y); };
    const hold = (on) => {
      if (on === holdOn) return;
      holdOn = on;
      clearTimeout(holdTimer);
      if (on) {
        window.addEventListener('wheel', holdWheel, { passive: false });
        window.addEventListener('touchmove', holdTouch, { passive: false });
        window.addEventListener('keydown', holdKey);
        window.addEventListener('scroll', holdScroll, { passive: true });
        holdTimer = setTimeout(() => hold(false), 16000); // never strand anyone
      } else {
        window.removeEventListener('wheel', holdWheel);
        window.removeEventListener('touchmove', holdTouch);
        window.removeEventListener('keydown', holdKey);
        window.removeEventListener('scroll', holdScroll);
      }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    const startMoment = () => { typer.n = 0; renderTyping(); moment.play(0); hold(true); };
    const finishMoment = () => {
      moment.progress(1);
      hold(false);
      if (tl.time() > wishTime + 0.4) gsap.set(titleBlock, { autoAlpha: 0, y: -14 }); // already scrolled on past the words
    };
    const resetMoment = () => {
      moment.pause(0);
      typer.n = 0; renderTyping();
      if (wish) gsap.set(wish, { autoAlpha: 0, scale: 0.86, y: 16 });
      if (wishBox) gsap.set(wishBox, { autoAlpha: 1, scale: 1, y: 0 });
      gsap.set(titleBlock, { autoAlpha: 0, y: 24 });
      Object.assign(starState, { active: 0, sec: 0 });
      if (starCanvas) gsap.set(starCanvas, { autoAlpha: 0 });
      night.style.setProperty('--sweep', '-20%');
      nightShown = false; syncNight();
      hold(false);
    };
    const momentTrigger = ScrollTrigger.create({
      start: () => holdAt() - 6, end: () => holdAt() - 4,
      onEnter: () => {
        // landing further down the page (a reload, a jump): nothing to wait for, show how the moment ends
        if (window.scrollY > holdAt() + (innerHeight || 600) * 0.5) finishMoment(); else startMoment();
      },
      onLeaveBack: resetMoment,
    });

    const go = (label) => window.scrollTo({ top: tl.scrollTrigger.labelToScroll(label), behavior: 'smooth' });
    window.__jcPlay = { tl, go, moment, hold, startMoment, finishMoment, resetMoment }; // for the screenshot tooling
    const buttons = [...play.querySelectorAll('[data-play-go]')];
    const handlers = buttons.map((b) => { const h = () => go(b.dataset.playGo); b.addEventListener('click', h); return [b, h]; });

    return () => {
      handlers.forEach(([b, h]) => b.removeEventListener('click', h));
      window.removeEventListener('touchstart', onTouchStart);
      hold(false);
      momentTrigger.kill();
      moment.kill();
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
  // the shooting star has its own small canvas and only draws while it is in flight
  const starCanvas = document.querySelector('.play__star');
  if (starCanvas && hasST) {
    try {
      const mod = await import('/js/star.js');
      window.__jcStar = mod.start(starCanvas, starState);
    } catch (err) {
      console.warn('[just cooked] no shooting star tonight.', err);
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
