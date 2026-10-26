/* Just Cooked — 3D scene.
   One procedurally built phone lives on a fixed, transparent canvas. It travels
   between "phone slots" in the page (empty layout boxes) as you scroll, swapping
   the app screen on its display, and the hero is dressed with soft clay shapes
   in the brand palette. Loaded lazily by site.js; the page works without it. */

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
    depth: PHONE.d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelOffset: 0, bevelSegments: 5, curveSegments: 28,
  });
  bodyGeo.translate(0, 0, -(PHONE.d - 2 * b) / 2);
  group.add(new THREE.Mesh(bodyGeo, metal));

  const glass = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(GLASS.w, GLASS.h, GLASS.r), 24), black);
  glass.position.z = PHONE.d / 2 + 0.0008;
  group.add(glass);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN.w, SCREEN.h), screenMat);
  screen.position.z = PHONE.d / 2 + 0.0018;
  group.add(screen);

  // side buttons
  const btn = (len, x, y) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(0.022, len, 0.036, 3, 0.008), metal);
    m.position.set(x, y, 0);
    group.add(m);
  };
  const edge = PHONE.w / 2 + 0.006;
  btn(0.09, -edge, 0.64);
  btn(0.17, -edge, 0.42);
  btn(0.17, -edge, 0.21);
  btn(0.26, edge, 0.44);

  // camera island on the back
  const island = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(0.37, 0.37, 0.1), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3, curveSegments: 16 }), metal);
  island.rotation.y = Math.PI;
  island.position.set(-0.235, 0.76, -PHONE.d / 2);
  group.add(island);
  const lensGeo = new THREE.CylinderGeometry(0.062, 0.062, 0.02, 32);
  const lensInner = new THREE.CylinderGeometry(0.036, 0.036, 0.022, 32);
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

function clay(hex, flat = false) {
  return new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.62, metalness: 0, sheen: 0.55, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xfff1e6), clearcoat: 0.06, flatShading: flat });
}

// Offsets are in phone-heights relative to the hero phone, so the arrangement scales with the layout.
const SHAPES = [
  { make: () => new THREE.TorusGeometry(0.42, 0.16, 36, 72), color: 0xE94B1F, off: [-0.34, 0.44, -0.9], rot: [0.9, 0.35, 0], spin: [0.12, 0.2, 0], par: 1.25, amp: 0.05, s: 0.8 },
  { make: () => new THREE.SphereGeometry(0.33, 48, 48), color: 0x9CB58A, off: [0.62, -0.34, 0.3], rot: [0, 0, 0], spin: [0, 0, 0], par: 0.85, amp: 0.07, s: 1 },
  { make: () => new THREE.CapsuleGeometry(0.12, 0.44, 12, 24), color: 0xF5E6B8, off: [0.6, 0.36, -0.5], rot: [0, 0, -0.7], spin: [0, 0.3, 0.12], par: 1.1, amp: 0.06, s: 1 },
  { make: () => new RoundedBoxGeometry(0.32, 0.32, 0.32, 6, 0.1), color: 0xFBF6EC, off: [-0.4, -0.36, 0.4], rot: [0.5, 0.6, 0], spin: [0.25, 0.3, 0.1], par: 0.9, amp: 0.05, s: 0.9 },
  { make: () => new THREE.IcosahedronGeometry(0.16, 0), color: 0xF0D4D4, off: [0.22, 0.6, -0.3], rot: [0.3, 0.2, 0], spin: [0.3, 0.4, 0.2], par: 1.3, amp: 0.08, s: 0.8, flat: true },
  { make: () => new THREE.SphereGeometry(0.11, 32, 32), color: 0xFF6B35, off: [0.4, -0.62, 0.7], rot: [0, 0, 0], spin: [0, 0, 0], par: 0.75, amp: 0.06, s: 1 },
  { make: () => new THREE.TorusGeometry(0.15, 0.055, 24, 48), color: 0x6B8159, off: [0.74, 0.04, -0.3], rot: [1.2, 0, 0], spin: [0.2, 0.4, 0], par: 1.05, amp: 0.05, s: 1 },
];

export async function start(canvas, opts = {}) {
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
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
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
    return { el, ry: rot[0] || 0, rx: rot[1] || 0, hero: el.hasAttribute('data-hero-slot'), rect: null, w: 0 };
  });
  if (!slots.length) throw new Error('no phone slots');

  const firstKey = slots[0].el.dataset.screen || 'home';
  const firstTex = await loadTex(firstKey);
  screenMat.uniforms.tA.value = firstTex;
  screenMat.uniforms.tB.value = firstTex;
  let screenCurrent = firstKey, screenTarget = firstKey, fading = false;

  const setScreen = (k) => {
    if (k === screenTarget || !textures[k]) return;
    if (fading) { // snap the current fade, then start the next
      screenMat.uniforms.tA.value = screenMat.uniforms.tB.value;
      screenMat.uniforms.uMix.value = 0;
      screenCurrent = screenTarget;
    }
    screenTarget = k;
    screenMat.uniforms.tB.value = textures[k];
    screenMat.uniforms.uMix.value = 0;
    fading = true;
  };

  // background-load the rest, prioritising the screens the page actually uses
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
  const heroSlot = slots.find((s) => s.hero) || slots[0];

  // ---- sizing
  let vw = 1, vh = 1, wpp = 1;
  const resize = () => {
    vw = canvas.clientWidth || innerWidth;
    vh = canvas.clientHeight || innerHeight;
    let dpr = Math.min(devicePixelRatio || 1, 2);
    if (vw * vh * dpr * dpr > 5.5e6) dpr = Math.sqrt(5.5e6 / (vw * vh));
    renderer.setPixelRatio(dpr);
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    wpp = visH / vh;
  };
  resize();
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); });

  // ---- pointer parallax (fine pointers only)
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / vw) * 2 - 1;
      pointer.ty = (e.clientY / vh) * 2 - 1;
    }, { passive: true });
  }

  // ---- scroll velocity (Lenis if present, else from scrollY)
  let lastY = scrollY, vel = 0, velSmooth = 0;

  const state = { x: 0, y: 0, s: 0.0001, rx: 0, ry: 0, rz: 0 };
  const target = { x: 0, y: 0, s: 0.0001, rx: 0, ry: 0 };
  let heroW = 0, heroCenterY0 = null, heroH = 1, heroCenterX = 0;
  let cleared = false, prev = performance.now();

  function tick(now) {
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    const t = now / 1000;
    const kf = (k) => 1 - Math.pow(1 - k, dt * 60); // frame-rate independent easing

    const lenis = opts.getLenis ? opts.getLenis() : null;
    if (lenis && typeof lenis.velocity === 'number') vel = lenis.velocity;
    else { vel = (scrollY - lastY) / Math.max(dt * 60, 0.5); lastY = scrollY; }
    velSmooth = lerp(velSmooth, clamp(vel, -60, 60), kf(0.08));
    pointer.x = lerp(pointer.x, pointer.tx, kf(0.06));
    pointer.y = lerp(pointer.y, pointer.ty, kf(0.06));

    // weight each slot by how close it is to the viewport centre
    let sumW = 0, px = 0, py = 0, ph = 0, rx = 0, ry = 0, best = null, bestW = 0;
    heroW = 0;
    for (const s of slots) {
      const r = s.el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const d = Math.abs(cy - vh / 2) / (vh / 2 + r.height / 2);
      const w = 1 - smoothstep(0.55, 1.05, d);
      if (s.hero) { heroW = w; heroCenterX = cx; heroH = Math.min(r.height, r.width / ASPECT); if (heroCenterY0 === null) heroCenterY0 = cy + scrollY; s.cy = cy; }
      if (w <= 0) continue;
      const fitH = Math.min(r.height, r.width / ASPECT);
      sumW += w; px += cx * w; py += cy * w; ph += fitH * w; rx += s.rx * w; ry += s.ry * w;
      if (w > bestW) { bestW = w; best = s; }
    }

    const vis = smoothstep(0, 0.3, sumW);
    if (sumW > 0) {
      px /= sumW; py /= sumW; ph /= sumW; rx /= sumW; ry /= sumW;
      target.x = (px - vw / 2) * wpp;
      target.y = -(py - vh / 2) * wpp;
      target.s = (ph * wpp / PHONE.h) * (1 - Math.pow(1 - vis, 3));
      target.rx = rx; target.ry = ry;
      if (best) setScreen(best.el.dataset.screen || screenTarget);
    } else {
      target.s = 0.0001;
    }

    // follow with a little lag so flights between slots feel physical
    const k = kf(sumW > 0 ? 0.14 : 0.2);
    state.x = lerp(state.x, target.x, k);
    state.y = lerp(state.y, target.y, k);
    state.s = lerp(state.s, target.s, kf(0.12));
    const swing = clamp(velSmooth * 0.006, -0.5, 0.5);
    state.ry = lerp(state.ry, target.ry + pointer.x * 0.16 + swing, kf(0.08));
    state.rx = lerp(state.rx, target.rx - pointer.y * 0.09, kf(0.08));
    state.rz = lerp(state.rz, -swing * 0.15 + Math.sin(t * 0.6) * 0.012, kf(0.08));

    phone.visible = state.s > 0.003;
    phone.position.set(state.x, state.y + Math.sin(t * 0.9) * 0.02 * state.s, 0);
    phone.scale.setScalar(state.s);
    phone.rotation.set(state.rx, state.ry, state.rz);

    // screen crossfade
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

    // hero clay shapes: arranged around the hero slot, parallaxed against scroll
    const shapeVis = smoothstep(0, 0.5, heroW);
    shapesGroup.visible = shapeVis > 0.01 && heroCenterY0 !== null;
    if (shapesGroup.visible) {
      const H = heroH * wpp; // hero phone height in world units
      const cx = (heroCenterX - vw / 2) * wpp;
      const cy = -(heroSlot.cy - vh / 2) * wpp;
      const scrolled = (heroSlot.cy + scrollY - heroCenterY0) * wpp; // how far the hero has moved (world units)
      const small = vw < 700 ? 0.72 : 1;
      shapesGroup.position.set(pointer.x * 0.12, pointer.y * 0.08, 0);
      for (const sh of shapes) {
        const d = sh.d;
        // on phones the layout stacks text above/below the slot, so shapes stay beside the phone
        sh.mesh.visible = !(small < 1 && Math.abs(d.off[1]) > 0.5);
        if (!sh.mesh.visible) continue;
        const bob = Math.sin(t * 0.7 + sh.phase) * d.amp * H * 0.6;
        sh.mesh.position.set(cx + d.off[0] * H, cy + d.off[1] * H + bob - scrolled * (d.par - 1), d.off[2] * Math.min(H, 2.2) * 0.5);
        const sc = H * 0.3 * d.s * small * shapeVis;
        sh.mesh.scale.setScalar(sc);
        sh.mesh.rotation.x += d.spin[0] * dt;
        sh.mesh.rotation.y += d.spin[1] * dt;
        sh.mesh.rotation.z += d.spin[2] * dt;
      }
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
  // one synchronous frame so the swap from the static image is seamless
  tick(performance.now());
  const settle = () => { // jump straight to the resting state (used by screenshot tooling)
    for (let i = 0; i < 4; i++) tick(performance.now() + i * 16);
    Object.assign(state, { x: target.x, y: target.y, s: target.s, rx: target.rx, ry: target.ry, rz: 0 });
    velSmooth = 0;
    if (fading) { screenMat.uniforms.tA.value = screenMat.uniforms.tB.value; screenMat.uniforms.uMix.value = 0; screenCurrent = screenTarget; fading = false; }
    tick(performance.now() + 100);
  };
  return { setScreen, settle, renderer, scene };
}
