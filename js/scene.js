/* Just Cooked — 3D scene (v2).
   One procedurally built phone lives on a fixed, transparent canvas. It is
   pinned exactly to whichever "phone slot" is nearest the viewport centre
   (blending between two slots when both are on screen), swaps the app screen
   on its display, and reacts to the mouse, the finger, the gyroscope, scroll
   speed and drag-to-spin. Clay shapes in the brand palette dress the hero.
   Layout is measured once (and on resize), never per frame. */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const SCREEN_KEYS = ['home', 'next-meal', 'recipe', 'pantry', 'savings', 'support', 'support-settings'];
const screenUrl = (key) => '/assets/screens/' + key + '.webp';

const PHONE = { w: 1, h: 2.07, d: 0.082, r: 0.15, bevel: 0.016 };
const SCREEN = { w: 0.925, h: 2.008 };
const GLASS = { w: 0.962, h: 2.036, r: 0.128 };
const ASPECT = 1274 / 2668; // framed shot ratio, matches the slot's aspect-ratio

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function buildPhone(screenMat) {
  const group = new THREE.Group();
  const b = PHONE.bevel;
  const metal = new THREE.MeshPhysicalMaterial({ color: 0x34333a, metalness: 0.92, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.22 });
  const black = new THREE.MeshPhysicalMaterial({ color: 0x050505, metalness: 0.15, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.06 });

  const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(PHONE.w - 2 * b, PHONE.h - 2 * b, PHONE.r - b), {
    depth: PHONE.d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelOffset: 0, bevelSegments: 4, curveSegments: 20,
  });
  bodyGeo.translate(0, 0, -(PHONE.d - 2 * b) / 2);
  group.add(new THREE.Mesh(bodyGeo, metal));

  const glass = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(GLASS.w, GLASS.h, GLASS.r), 18), black);
  glass.position.z = PHONE.d / 2 + 0.0008;
  group.add(glass);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN.w, SCREEN.h), screenMat);
  screen.position.z = PHONE.d / 2 + 0.0018;
  group.add(screen);

  const btn = (len, x, y) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(0.022, len, 0.036, 2, 0.008), metal);
    m.position.set(x, y, 0);
    group.add(m);
  };
  const edge = PHONE.w / 2 + 0.006;
  btn(0.09, -edge, 0.64);
  btn(0.17, -edge, 0.42);
  btn(0.17, -edge, 0.21);
  btn(0.26, edge, 0.44);

  const island = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(0.37, 0.37, 0.1), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 12 }), metal);
  island.rotation.y = Math.PI;
  island.position.set(-0.235, 0.76, -PHONE.d / 2);
  group.add(island);
  const lensGeo = new THREE.CylinderGeometry(0.062, 0.062, 0.02, 24);
  const lensInner = new THREE.CylinderGeometry(0.036, 0.036, 0.022, 24);
  const lensMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0e18, metalness: 0.6, roughness: 0.15, clearcoat: 1 });
  [[-0.075, 0.08], [-0.075, -0.08], [0.085, 0]].forEach(([lx, ly]) => {
    const l = new THREE.Mesh(lensGeo, black);
    l.rotation.x = Math.PI / 2;
    l.position.set(-0.235 + lx, 0.76 + ly, -PHONE.d / 2 - 0.022);
    group.add(l);
    const li = new THREE.Mesh(lensInner, lensMat);
    li.rotation.x = Math.PI / 2;
    li.position.set(-0.235 + lx, 0.76 + ly, -PHONE.d / 2 - 0.03);
    group.add(li);
  });
  return group;
}

const clay = (hex, flat = false) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.62, metalness: 0, flatShading: flat });

// Offsets are in phone-heights relative to the hero phone, so the arrangement scales with the layout.
const SHAPES = [
  { make: () => new THREE.TorusGeometry(0.42, 0.16, 24, 48), color: 0xE94B1F, off: [-0.34, 0.44, -0.9], rot: [0.9, 0.35, 0], spin: [0.12, 0.2, 0], par: 1.25, amp: 0.05, s: 0.8 },
  { make: () => new THREE.SphereGeometry(0.33, 32, 24), color: 0x9CB58A, off: [0.62, -0.34, 0.3], rot: [0, 0, 0], spin: [0, 0, 0], par: 0.85, amp: 0.07, s: 1 },
  { make: () => new THREE.CapsuleGeometry(0.12, 0.44, 8, 16), color: 0xF5E6B8, off: [0.6, 0.36, -0.5], rot: [0, 0, -0.7], spin: [0, 0.3, 0.12], par: 1.1, amp: 0.06, s: 1 },
  { make: () => new RoundedBoxGeometry(0.32, 0.32, 0.32, 4, 0.1), color: 0xFBF6EC, off: [-0.4, -0.36, 0.4], rot: [0.5, 0.6, 0], spin: [0.25, 0.3, 0.1], par: 0.9, amp: 0.05, s: 0.9 },
  { make: () => new THREE.IcosahedronGeometry(0.16, 0), color: 0xF0D4D4, off: [0.22, 0.6, -0.3], rot: [0.3, 0.2, 0], spin: [0.3, 0.4, 0.2], par: 1.3, amp: 0.08, s: 0.8, flat: true },
  { make: () => new THREE.SphereGeometry(0.11, 24, 16), color: 0xFF6B35, off: [0.4, -0.62, 0.7], rot: [0, 0, 0], spin: [0, 0, 0], par: 0.75, amp: 0.06, s: 1 },
  { make: () => new THREE.TorusGeometry(0.15, 0.055, 16, 32), color: 0x6B8159, off: [0.74, 0.04, -0.3], rot: [1.2, 0, 0], spin: [0.2, 0.4, 0], par: 1.05, amp: 0.05, s: 1 },
];

export async function start(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
  camera.position.set(0, 0, 10);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  if ('environmentIntensity' in scene) scene.environmentIntensity = 0.9;

  const key = new THREE.DirectionalLight(0xfff2e4, 2.4);
  key.position.set(3, 5, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe4ecdc, 0.9);
  fill.position.set(-5, -2, 4);
  scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xfff6ec, 0xe0d5c2, 0.5));

  // ---- textures + crossfading screen material
  const loader = new THREE.TextureLoader();
  const textures = {};
  const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const loadTex = (k) => new Promise((resolve, reject) => {
    if (textures[k]) return resolve(textures[k]);
    loader.load(screenUrl(k), (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = maxAniso;
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      textures[k] = t;
      resolve(t);
    }, undefined, reject);
  });

  const screenMat = new THREE.ShaderMaterial({
    uniforms: { tA: { value: null }, tB: { value: null }, uMix: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'uniform sampler2D tA; uniform sampler2D tB; uniform float uMix; varying vec2 vUv;',
      'void main(){',
      '  vec4 a = texture2D(tA, vUv); vec4 b = texture2D(tB, vUv);',
      '  gl_FragColor = mix(a, b, uMix);',
      '  #include <colorspace_fragment>',
      '}',
    ].join('\n'),
  });

  const slots = [...document.querySelectorAll('[data-phone-slot]')].map((el) => {
    const rot = (el.dataset.rot || '0,0').split(',').map(Number);
    return { el, ry: rot[0] || 0, rx: rot[1] || 0, hero: el.hasAttribute('data-hero-slot'), sticky: null, absTop: 0, absLeft: 0, w: 1, h: 1 };
  });
  if (!slots.length) throw new Error('no phone slots');

  const firstKey = slots[0].el.dataset.screen || 'home';
  const firstTex = await loadTex(firstKey);
  screenMat.uniforms.tA.value = firstTex;
  screenMat.uniforms.tB.value = firstTex;
  let screenCurrent = firstKey, screenTarget = firstKey, fading = false;

  const setScreen = (k) => {
    if (k === screenTarget || !textures[k]) return;
    if (fading) {
      screenMat.uniforms.tA.value = screenMat.uniforms.tB.value;
      screenMat.uniforms.uMix.value = 0;
      screenCurrent = screenTarget;
    }
    screenTarget = k;
    screenMat.uniforms.tB.value = textures[k];
    screenMat.uniforms.uMix.value = 0;
    fading = true;
  };

  const wanted = [...new Set(slots.map((s) => s.el.dataset.screen).concat([...document.querySelectorAll('[data-step]')].map((s) => s.dataset.screen)).filter(Boolean))];
  (async () => {
    for (const k of wanted.concat(SCREEN_KEYS)) { if (SCREEN_KEYS.includes(k) && !textures[k]) { try { await loadTex(k); } catch { /* keep going */ } } }
  })();

  // ---- phone + shapes
  const phone = buildPhone(screenMat);
  scene.add(phone);
  const shapesGroup = new THREE.Group();
  scene.add(shapesGroup);
  const shapes = SHAPES.map((d) => {
    const mesh = new THREE.Mesh(d.make(), clay(d.color, !!d.flat));
    mesh.rotation.set(d.rot[0], d.rot[1], d.rot[2]);
    shapesGroup.add(mesh);
    return { mesh, d, phase: Math.random() * Math.PI * 2 };
  });

  // ---- layout: measured on resize / content changes, derived per frame from scrollY only
  let vw = 1, vh = 1, wpp = 1, visH = 1;
  function measure() {
    const sy = window.scrollY, sx = window.scrollX;
    for (const s of slots) {
      const r = s.el.getBoundingClientRect();
      s.w = r.width; s.h = r.height; s.absLeft = r.left + sx;
      let anc = s.el.parentElement, sticky = null;
      while (anc && anc !== document.body) {
        if (getComputedStyle(anc).position === 'sticky') { sticky = anc; break; }
        anc = anc.parentElement;
      }
      if (sticky) {
        const sr = sticky.getBoundingClientRect();
        const cr = sticky.parentElement.getBoundingClientRect();
        s.sticky = { top: parseFloat(getComputedStyle(sticky).top) || 0, contTop: cr.top + sy, contBottom: cr.bottom + sy, h: sr.height, inner: r.top - sr.top };
      } else {
        s.sticky = null;
        s.absTop = r.top + sy;
      }
    }
  }
  function rectOf(s) {
    const sy = window.scrollY;
    let top;
    if (s.sticky) {
      const st = s.sticky;
      top = Math.min(Math.max(st.contTop - sy, st.top), st.contBottom - st.h - sy) + st.inner;
    } else top = s.absTop - sy;
    return { left: s.absLeft - window.scrollX, top, width: s.w, height: s.h };
  }
  const resize = () => {
    vw = canvas.clientWidth || innerWidth;
    vh = canvas.clientHeight || innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, vw * vh > 1.1e6 ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    wpp = visH / vh;
    measure();
  };
  resize();
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); });
  addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  if ('ResizeObserver' in window) {
    let raf = 0;
    new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); }).observe(document.body);
  }

  // ---- input: mouse, finger, gyroscope, drag-to-spin
  const fine = matchMedia('(pointer: fine)').matches;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const touch = { active: false };
  const gyro = { x: 0, y: 0, on: false };
  if (fine) {
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer.tx = (e.clientX / vw) * 2 - 1;
      pointer.ty = (e.clientY / vh) * 2 - 1;
    }, { passive: true });
  }
  addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (!t) return;
    touch.active = true;
    pointer.tx = (t.clientX / vw) * 2 - 1;
    pointer.ty = (t.clientY / vh) * 2 - 1;
  }, { passive: true });
  addEventListener('touchend', () => { touch.active = false; }, { passive: true });
  addEventListener('touchcancel', () => { touch.active = false; }, { passive: true });
  // gyroscope where it needs no permission prompt (Android); iOS keeps finger + scroll reactions
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function' && matchMedia('(pointer: coarse)').matches) {
    addEventListener('deviceorientation', (e) => {
      if (e.gamma == null || e.beta == null) return;
      gyro.on = true;
      gyro.x = clamp(e.gamma / 35, -1, 1);
      gyro.y = clamp((e.beta - 40) / 35, -1, 1);
    }, { passive: true });
  }
  const drag = { active: false, x0: 0, y0: 0, ry: 0, rx: 0 };
  slots.forEach((s) => {
    s.el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      drag.active = true;
      drag.x0 = e.clientX - drag.ry / 0.012;
      drag.y0 = e.clientY - drag.rx / 0.004;
      try { s.el.setPointerCapture(e.pointerId); } catch { /* optional */ }
    });
  });
  addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    drag.ry = clamp((e.clientX - drag.x0) * 0.012, -1.3, 1.3);
    drag.rx = clamp((e.clientY - drag.y0) * 0.004, -0.4, 0.4);
  }, { passive: true });
  const endDrag = () => { drag.active = false; };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);

  // ---- frame loop
  const state = { x: 0, y: 0, s: 0.0001, rx: 0, ry: 0, rz: 0 };
  let velSmooth = 0, lastY = window.scrollY, intro = 0, cleared = false, prev = performance.now();
  const offscreen = (y, s) => Math.abs(y) > visH / 2 + (s * PHONE.h) / 2 + 0.3;

  function tick(now) {
    const dt = clamp((now - prev) / 1000, 0.001, 0.05);
    prev = now;
    const t = now / 1000;
    const kf = (k) => 1 - Math.pow(1 - k, dt * 60); // frame-rate independent easing
    intro = Math.min(1, intro + dt / 1.5);
    const e = easeOut(intro);

    const sy = window.scrollY;
    const vel = (sy - lastY) / dt; // px per second
    lastY = sy;
    velSmooth = lerp(velSmooth, clamp(vel, -4000, 4000), kf(0.12));

    const useGyro = !touch.active && !fine && gyro.on;
    pointer.x = lerp(pointer.x, useGyro ? gyro.x * 0.7 : pointer.tx, kf(0.16));
    pointer.y = lerp(pointer.y, useGyro ? gyro.y * 0.7 : pointer.ty, kf(0.16));
    if (!drag.active) { drag.ry = lerp(drag.ry, 0, kf(0.07)); drag.rx = lerp(drag.rx, 0, kf(0.07)); }

    // nearest slot wins; two on-screen slots blend by distance to the viewport centre
    let sumW = 0, px = 0, py = 0, ph = 0, rx = 0, ry = 0, best = null, bestD = Infinity, bestRect = null, heroRect = null;
    for (const s of slots) {
      const r = rectOf(s);
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const d = Math.abs(cy - vh / 2) / (vh / 2 + r.height / 2); // 0 centred, 1 just off screen
      if (s.hero) heroRect = r;
      if (d < bestD) { bestD = d; best = s; bestRect = r; }
      const w = 1 - smoothstep(0.55, 1.0, d);
      if (w <= 0) continue;
      sumW += w; px += cx * w; py += cy * w; ph += Math.min(r.height, r.width / ASPECT) * w; rx += s.rx * w; ry += s.ry * w;
    }
    let tx = 0, ty = 0, ts = 0.0001, trx = 0, try_ = 0;
    if (sumW > 0) {
      tx = (px / sumW - vw / 2) * wpp; ty = -(py / sumW - vh / 2) * wpp; ts = ((ph / sumW) * wpp) / PHONE.h; trx = rx / sumW; try_ = ry / sumW;
    } else if (bestRect) {
      tx = (bestRect.left + bestRect.width / 2 - vw / 2) * wpp; ty = -(bestRect.top + bestRect.height / 2 - vh / 2) * wpp;
      ts = (Math.min(bestRect.height, bestRect.width / ASPECT) * wpp) / PHONE.h; trx = best.rx; try_ = best.ry;
    }
    const centreOff = bestRect ? (bestRect.top + bestRect.height / 2 - vh / 2) / vh : 0; // where the active slot sits (-0.5 top .. 0.5 bottom)

    // position is pinned to the page (no lag); size eases; a jump while fully out of view is invisible
    state.x = tx; state.y = ty;
    state.s = offscreen(state.y, state.s) && offscreen(ty, ts) ? ts : lerp(state.s, ts, kf(0.35));

    const swing = clamp(velSmooth * 0.00022, -0.4, 0.4);
    const targetRy = (try_ + pointer.x * 0.34 + swing + drag.ry + centreOff * 0.5) * e;
    const targetRx = (trx - pointer.y * 0.22 + drag.rx - centreOff * 0.16) * e;
    state.ry = lerp(state.ry, targetRy, kf(0.18));
    state.rx = lerp(state.rx, targetRx, kf(0.18));
    state.rz = lerp(state.rz, (-swing * 0.12 + Math.sin(t * 0.6) * 0.012) * e, kf(0.1));

    phone.visible = !offscreen(state.y, state.s);
    phone.position.set(state.x, state.y + Math.sin(t * 0.9) * 0.02 * state.s * e, 0);
    phone.scale.setScalar(state.s);
    phone.rotation.set(state.rx, state.ry, state.rz);
    if (best) setScreen(best.el.dataset.screen || screenTarget);

    if (fading) {
      screenMat.uniforms.uMix.value = Math.min(1, screenMat.uniforms.uMix.value + dt / 0.5);
      if (screenMat.uniforms.uMix.value >= 1) {
        screenMat.uniforms.tA.value = screenMat.uniforms.tB.value;
        screenMat.uniforms.uMix.value = 0;
        screenCurrent = screenTarget;
        fading = false;
      }
    } else if (screenTarget !== screenCurrent && textures[screenTarget]) {
      setScreen(screenTarget);
    }

    // hero clay shapes: arranged around the hero slot, parallaxed against scroll, scaled in on arrival
    const heroVis = heroRect ? 1 - smoothstep(0.75, 1.15, Math.abs(heroRect.top + heroRect.height / 2 - vh / 2) / (vh / 2 + heroRect.height / 2)) : 0;
    shapesGroup.visible = heroVis > 0.01;
    if (shapesGroup.visible) {
      const H = Math.min(heroRect.height, heroRect.width / ASPECT) * wpp;
      const cx = (heroRect.left + heroRect.width / 2 - vw / 2) * wpp;
      const cy = -(heroRect.top + heroRect.height / 2 - vh / 2) * wpp;
      const scrolled = sy * wpp;
      const small = vw < 700 ? 0.72 : 1;
      shapesGroup.position.set(pointer.x * 0.14, pointer.y * 0.1, 0);
      shapes.forEach((sh, i) => {
        const d = sh.d;
        sh.mesh.visible = !(small < 1 && Math.abs(d.off[1]) > 0.5); // phones stack text above/below the slot
        if (!sh.mesh.visible) return;
        const ei = easeOut((intro - 0.1 - i * 0.07) / 0.9);
        const bob = Math.sin(t * 0.7 + sh.phase) * d.amp * H * 0.6;
        sh.mesh.position.set(cx + d.off[0] * H, cy + d.off[1] * H + bob - scrolled * (d.par - 1), d.off[2] * Math.min(H, 2.2) * 0.5);
        sh.mesh.scale.setScalar(H * 0.3 * d.s * small * heroVis * ei);
        sh.mesh.rotation.x += d.spin[0] * dt;
        sh.mesh.rotation.y += d.spin[1] * dt;
        sh.mesh.rotation.z += d.spin[2] * dt;
      });
    }

    if (!phone.visible && !shapesGroup.visible) {
      if (!cleared) { renderer.clear(); cleared = true; }
      return;
    }
    cleared = false;
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(tick);
  document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : tick));
  tick(performance.now());

  const settle = () => { // jump to the resting state (used by screenshot tooling)
    measure();
    intro = 1;
    velSmooth = 0;
    for (let i = 0; i < 40; i++) tick(performance.now() + i * 16);
    if (fading) { screenMat.uniforms.tA.value = screenMat.uniforms.tB.value; screenMat.uniforms.uMix.value = 0; screenCurrent = screenTarget; fading = false; }
    tick(performance.now() + 700);
  };
  return { setScreen, settle, measure, renderer, scene };
}
