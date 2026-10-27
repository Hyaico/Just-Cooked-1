/* Just Cooked — 3D scene (v4).
   One procedurally built phone on a fixed, transparent canvas. It sits exactly
   on the page's single phone slot (which the home-page timeline moves around
   the stage), shows whichever app screen the play asks for, and reacts to the
   mouse, the finger, the gyroscope and drag-to-spin. Stylised food and
   utensils (js/props.js) drift independently around the hero, in the stage
   corners during the steps, and come back for the finale. */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { MAKERS } from './props.js';

const SCREEN_KEYS = ['home', 'next-meal', 'recipe', 'pantry', 'savings', 'support', 'support-settings'];
const screenUrl = (key) => '/assets/screens/' + key + '.webp';

const PHONE = { w: 1, h: 2.07, d: 0.082, r: 0.15, bevel: 0.016 };
const SCREEN = { w: 0.925, h: 2.008 };
const GLASS = { w: 0.962, h: 2.036, r: 0.128 };
const ASPECT = 1274 / 2668;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
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

/* Prop layouts. anchor "phone": offsets in phone-heights from the phone centre (the phone
   spans x ±0.24, y ±0.5). anchor "copy": fractions of the text block's width/height from
   its top-left corner (outside the box). anchor "stage": viewport fractions. */
const HERO_DESKTOP = [
  { make: 'egg', anchor: 'phone', off: [-0.24, 0.46, -0.6], rot: [0.5, -0.35, 0.3], s: 0.9 },
  { make: 'tomato', anchor: 'phone', off: [0.38, -0.42, 0.4], rot: [0.2, 0.4, 0.1], s: 0.85 },
  { make: 'lemon', anchor: 'phone', off: [0.42, 0.3, -0.3], rot: [0.2, 0.35, 0.3], s: 0.75 },
  { make: 'broccoli', anchor: 'phone', off: [-0.38, -0.42, 0.5], rot: [0.1, 0.3, -0.2], s: 0.78 },
  { make: 'whisk', anchor: 'phone', off: [0.46, -0.02, -0.5], rot: [0.1, 0, 0.22], s: 1.05 },
  { make: 'mushroom', anchor: 'phone', off: [0.22, -0.66, 0.6], rot: [0.3, 0.2, 0.3], s: 0.6 },
  { make: 'fork', anchor: 'copy', off: [-0.1, 0.26], rot: [0.1, 0.2, -0.55], s: 0.95 },
  { make: 'bread', anchor: 'copy', off: [-0.07, 0.8], rot: [0.2, 0.3, 0.2], s: 0.8 },
  { make: 'knife', anchor: 'copy', off: [0.78, 0.0], rot: [0.05, -0.2, 1.25], s: 0.9 },
  { make: 'pancakes', anchor: 'copy', off: [0.62, -0.13], rot: [0.35, 0.3, 0.05], s: 0.85 },
  { make: 'mug', anchor: 'copy', off: [1.0, 0.86], rot: [0.2, -0.4, 0.05], s: 0.85 },
  { make: 'rollingPin', anchor: 'copy', off: [0.14, 1.12], rot: [0.2, 0, 0.22], s: 1.1 },
  { make: 'cheese', anchor: 'copy', off: [0.9, 1.08], rot: [0.3, -0.4, 0.1], s: 0.85 },
  { make: 'saltShaker', anchor: 'copy', off: [0.5, 1.16], rot: [0.1, 0.3, 0.15], s: 0.75 },
];
const HERO_MOBILE = [
  { make: 'egg', anchor: 'phone', off: [-0.46, 0.34, -0.6], rot: [0.5, -0.35, 0.3], s: 0.85 },
  { make: 'tomato', anchor: 'phone', off: [0.48, -0.3, 0.4], rot: [0.2, 0.4, 0.1], s: 0.75 },
  { make: 'lemon', anchor: 'phone', off: [0.48, 0.3, -0.3], rot: [0.2, 0.35, 0.3], s: 0.68 },
  { make: 'broccoli', anchor: 'phone', off: [-0.48, -0.26, 0.5], rot: [0.1, 0.3, -0.2], s: 0.7 },
  { make: 'spoon', anchor: 'phone', off: [-0.56, 0.04, 0.2], rot: [0.15, 0.1, -0.6], s: 0.9 },
  { make: 'mug', anchor: 'phone', off: [0.52, 0.0, -0.2], rot: [0.2, -0.4, 0.05], s: 0.62 },
];
const STEPS_DESKTOP = [
  { make: 'pan', anchor: 'stage', off: [0.86, 0.17, -0.6], rot: [0.55, -0.5, 0.25], s: 1.0 },
  { make: 'pancakes', anchor: 'stage', off: [0.13, 0.18, -0.3], rot: [0.35, 0.3, 0.05], s: 0.8 },
  { make: 'mug', anchor: 'stage', off: [0.17, 0.84, 0.3], rot: [0.2, -0.4, 0.05], s: 0.8 },
  { make: 'mushroom', anchor: 'stage', off: [0.85, 0.85, 0.4], rot: [0.3, 0.2, 0.3], s: 0.65 },
  { make: 'lemon', anchor: 'stage', off: [0.38, 0.12, -0.5], rot: [0.2, 0.35, 0.3], s: 0.62 },
  { make: 'tomato', anchor: 'stage', off: [0.63, 0.9, -0.2], rot: [0.2, 0.4, 0.1], s: 0.7 },
];
const STEPS_MOBILE = [
  { make: 'lemon', anchor: 'stage', off: [0.1, 0.22, -0.3], rot: [0.2, 0.35, 0.3], s: 0.5 },
  { make: 'tomato', anchor: 'stage', off: [0.9, 0.2, -0.3], rot: [0.2, 0.4, 0.1], s: 0.5 },
  { make: 'mug', anchor: 'stage', off: [0.1, 0.46, 0.2], rot: [0.2, -0.4, 0.05], s: 0.42 },
  { make: 'mushroom', anchor: 'stage', off: [0.9, 0.45, 0.2], rot: [0.3, 0.2, 0.3], s: 0.42 },
];
const FINALE_DESKTOP = [
  { make: 'egg', anchor: 'phone', off: [-0.4, 0.38, -0.6], rot: [0.5, -0.35, 0.3], s: 0.95 },
  { make: 'broccoli', anchor: 'phone', off: [-0.5, -0.28, 0.5], rot: [0.1, 0.3, -0.2], s: 0.8 },
  { make: 'spoon', anchor: 'phone', off: [-0.62, 0.04, 0.2], rot: [0.15, 0.1, -0.6], s: 1.0 },
  { make: 'tomato', anchor: 'phone', off: [0.3, -0.62, 0.4], rot: [0.2, 0.4, 0.1], s: 0.85 },
  { make: 'orangeSlice', anchor: 'phone', off: [0.28, 0.5, -0.3], rot: [0.2, 0.35, 0.3], s: 0.75 },
  { make: 'mushroom', anchor: 'phone', off: [-0.22, -0.68, 0.6], rot: [0.3, 0.2, 0.3], s: 0.6 },
  { make: 'whisk', anchor: 'phone', off: [-0.46, 0.46, -0.5], rot: [0.1, 0, -0.3], s: 0.95 },
  { make: 'pancakes', anchor: 'copy', off: [0.62, -0.14], rot: [0.35, 0.3, 0.05], s: 0.85 },
  { make: 'rollingPin', anchor: 'copy', off: [0.2, 1.14], rot: [0.2, 0, 0.22], s: 1.1 },
  { make: 'cheese', anchor: 'copy', off: [0.9, 1.08], rot: [0.3, -0.4, 0.1], s: 0.85 },
  { make: 'mug', anchor: 'copy', off: [1.02, 0.2], rot: [0.2, -0.4, 0.05], s: 0.85 },
  { make: 'saltShaker', anchor: 'copy', off: [1.0, 0.78], rot: [0.1, 0.3, 0.15], s: 0.75 },
  { make: 'bread', anchor: 'copy', off: [0.55, 1.18], rot: [0.2, 0.3, 0.2], s: 0.8 },
];
const FINALE_MOBILE = [
  { make: 'egg', anchor: 'phone', off: [-0.46, 0.34, -0.6], rot: [0.5, -0.35, 0.3], s: 0.85 },
  { make: 'tomato', anchor: 'phone', off: [0.48, -0.3, 0.4], rot: [0.2, 0.4, 0.1], s: 0.75 },
  { make: 'orangeSlice', anchor: 'phone', off: [0.48, 0.3, -0.3], rot: [0.2, 0.35, 0.3], s: 0.68 },
  { make: 'broccoli', anchor: 'phone', off: [-0.48, -0.26, 0.5], rot: [0.1, 0.3, -0.2], s: 0.7 },
  { make: 'whisk', anchor: 'phone', off: [-0.54, 0.06, 0.2], rot: [0.1, 0, -0.3], s: 0.85 },
  { make: 'mug', anchor: 'phone', off: [0.52, 0.0, -0.2], rot: [0.2, -0.4, 0.05], s: 0.62 },
];

export async function start(canvas, opts = {}) {
  const play = opts.state || null; // { keys, screenIndex, ry, rx, shapes, ambient, finale } driven by the page timeline
  const slot = document.querySelector('[data-phone-slot]');
  if (!slot) throw new Error('no phone slot');
  const heroAnchor = document.querySelector('.play__anchor--hero') || slot;
  const dlAnchor = document.querySelector('.play__anchor--download') || slot;
  const heroCopy = document.querySelector('[data-scene="hero"] .scene__block');
  const dlCopy = document.querySelector('[data-scene="download"] .scene__block');
  const slotRot = (slot.dataset.rot || '0,0').split(',').map(Number);

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

  const firstKey = slot.dataset.screen || 'home';
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
  const wanted = play && play.keys ? play.keys.slice() : [];
  (async () => {
    for (const k of wanted.concat(SCREEN_KEYS)) { if (SCREEN_KEYS.includes(k) && !textures[k]) { try { await loadTex(k); } catch { /* keep going */ } } }
  })();

  // ---- phone + props
  const phone = buildPhone(screenMat);
  scene.add(phone);
  const mobile = () => (canvas.clientWidth || innerWidth) < 900;
  const buildGroup = (defs) => {
    const g = new THREE.Group();
    const items = defs.map((d, i) => {
      const mesh = MAKERS[d.make]();
      mesh.rotation.set(d.rot[0], d.rot[1], d.rot[2]);
      g.add(mesh);
      // each prop drifts on its own: its own parallax strength, direction, lag, bob and spin
      const seed = ((i * 7919 + d.make.length * 131) % 97) / 97;
      const depth = d.off[2] || 0;
      return {
        mesh, d, phase: seed * Math.PI * 2,
        parX: (0.05 + 0.1 * (0.5 + depth * 0.5) + seed * 0.05) * (seed > 0.72 ? -0.6 : 1),
        parY: 0.03 + 0.07 * (0.5 + depth * 0.5) + (1 - seed) * 0.03,
        lag: 0.04 + seed * 0.1, px: 0, py: 0,
        bobSpeed: 0.5 + seed * 0.5, bobAmp: 0.03 + seed * 0.03,
        spin: [(seed - 0.5) * 0.2, 0.08 + seed * 0.25, (0.5 - seed) * 0.12],
      };
    });
    scene.add(g);
    return { group: g, items };
  };
  let sets = null, builtMobile = null;
  const rebuildProps = () => {
    if (sets) Object.values(sets).forEach((set) => { scene.remove(set.group); set.items.forEach((it) => it.mesh.traverse((o) => { if (o.geometry) o.geometry.dispose(); })); });
    const m = mobile();
    sets = { hero: buildGroup(m ? HERO_MOBILE : HERO_DESKTOP), steps: buildGroup(m ? STEPS_MOBILE : STEPS_DESKTOP), finale: buildGroup(m ? FINALE_MOBILE : FINALE_DESKTOP) };
    builtMobile = m;
  };
  rebuildProps();

  // ---- sizing
  let vw = 1, vh = 1, wpp = 1, visH = 1;
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
    if (mobile() !== builtMobile) rebuildProps();
  };
  resize();
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); });

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
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function' && matchMedia('(pointer: coarse)').matches) {
    addEventListener('deviceorientation', (e) => {
      if (e.gamma == null || e.beta == null) return;
      gyro.on = true;
      gyro.x = clamp(e.gamma / 35, -1, 1);
      gyro.y = clamp((e.beta - 40) / 35, -1, 1);
    }, { passive: true });
  }
  const drag = { active: false, x0: 0, y0: 0, ry: 0, rx: 0 };
  slot.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag.active = true;
    drag.x0 = e.clientX - drag.ry / 0.012;
    drag.y0 = e.clientY - drag.rx / 0.004;
    try { slot.setPointerCapture(e.pointerId); } catch { /* optional */ }
  });
  addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    drag.ry = clamp((e.clientX - drag.x0) * 0.012, -1.3, 1.3);
    drag.rx = clamp((e.clientY - drag.y0) * 0.004, -0.4, 0.4);
  }, { passive: true });
  const endDrag = () => { drag.active = false; };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);

  // ---- props placement
  let intro = 0;
  function layoutProps(set, vis, t, dt, kf, phoneRect, copyRect, spread) {
    set.group.visible = vis > 0.01;
    if (!set.group.visible) return;
    const H = Math.min(phoneRect.height, phoneRect.width / ASPECT) * wpp;
    const pcx = (phoneRect.left + phoneRect.width / 2 - vw / 2) * wpp;
    const pcy = -(phoneRect.top + phoneRect.height / 2 - vh / 2) * wpp;
    const base = H * 0.3;
    set.items.forEach((it, i) => {
      const d = it.d;
      if (d.anchor === 'copy' && !copyRect) { it.mesh.visible = false; return; }
      it.mesh.visible = true;
      let x, y, z;
      if (d.anchor === 'copy') {
        x = (copyRect.left + d.off[0] * copyRect.width - vw / 2) * wpp;
        y = -(copyRect.top + d.off[1] * copyRect.height - vh / 2) * wpp;
        z = 0.2;
      } else if (d.anchor === 'stage') {
        x = (d.off[0] * vw - vw / 2) * wpp;
        y = -(d.off[1] * vh - vh / 2) * wpp;
        z = d.off[2] * 0.8;
      } else {
        x = pcx + d.off[0] * H * spread;
        y = pcy + d.off[1] * H * spread;
        z = d.off[2] * Math.min(H, 2.2) * 0.5;
      }
      it.px = lerp(it.px, pointer.x, kf(it.lag));
      it.py = lerp(it.py, pointer.y, kf(it.lag));
      const ei = easeOut((intro - 0.1 - i * 0.05) / 0.9);
      const bob = Math.sin(t * it.bobSpeed + it.phase) * it.bobAmp * H;
      it.mesh.position.set(x + it.px * it.parX * H, y + bob - it.py * it.parY * H, z);
      it.mesh.scale.setScalar(base * d.s * ei * vis);
      it.mesh.rotation.x += it.spin[0] * dt;
      it.mesh.rotation.y += it.spin[1] * dt;
      it.mesh.rotation.z += it.spin[2] * dt;
    });
  }

  // ---- frame loop
  const state = { s: 0.0001, rx: 0, ry: 0, rz: 0 };
  let cleared = false, prev = performance.now();

  function tick(now) {
    const dt = clamp((now - prev) / 1000, 0.001, 0.05);
    prev = now;
    const t = now / 1000;
    const kf = (k) => 1 - Math.pow(1 - k, dt * 60);
    intro = Math.min(1, intro + dt / 1.5);
    const e = easeOut(intro);

    const useGyro = !touch.active && !fine && gyro.on;
    pointer.x = lerp(pointer.x, useGyro ? gyro.x * 0.7 : pointer.tx, kf(0.16));
    pointer.y = lerp(pointer.y, useGyro ? gyro.y * 0.7 : pointer.ty, kf(0.16));
    if (!drag.active) { drag.ry = lerp(drag.ry, 0, kf(0.07)); drag.rx = lerp(drag.rx, 0, kf(0.07)); }

    // the slot is the single source of truth for where the phone is and how big it is
    const r = slot.getBoundingClientRect();
    const fitH = Math.max(0, Math.min(r.height, r.width / ASPECT));
    const px = (r.left + r.width / 2 - vw / 2) * wpp;
    const py = -(r.top + r.height / 2 - vh / 2) * wpp;
    const ts = (fitH * wpp) / PHONE.h;
    state.s = Math.abs(state.s - ts) > 0.6 ? ts : lerp(state.s, ts, kf(0.5));

    const baseRy = play ? play.ry : slotRot[0] || 0;
    const baseRx = play ? play.rx : slotRot[1] || 0;
    state.ry = lerp(state.ry, (baseRy + pointer.x * 0.34 + drag.ry) * e, kf(0.18));
    state.rx = lerp(state.rx, (baseRx - pointer.y * 0.22 + drag.rx) * e, kf(0.18));
    state.rz = lerp(state.rz, Math.sin(t * 0.6) * 0.012 * e, kf(0.1));

    const onScreen = Math.abs(py) < visH / 2 + (state.s * PHONE.h) / 2 + 0.3;
    phone.visible = state.s > 0.004 && onScreen;
    phone.position.set(px, py + Math.sin(t * 0.9) * 0.02 * state.s * e, 0);
    phone.scale.setScalar(state.s);
    phone.rotation.set(state.rx, state.ry, state.rz);

    const wantKey = play && play.keys ? play.keys[clamp(Math.round(play.screenIndex), 0, play.keys.length - 1)] : slot.dataset.screen;
    if (wantKey) setScreen(wantKey);
    if (fading) {
      screenMat.uniforms.uMix.value = Math.min(1, screenMat.uniforms.uMix.value + dt / 0.45);
      if (screenMat.uniforms.uMix.value >= 1) {
        screenMat.uniforms.tA.value = screenMat.uniforms.tB.value;
        screenMat.uniforms.uMix.value = 0;
        screenCurrent = screenTarget;
        fading = false;
      }
    } else if (screenTarget !== screenCurrent && textures[screenTarget]) {
      setScreen(screenTarget);
    }

    // props: hero set, step set (stage corners), finale set
    const heroVis = play ? clamp(play.shapes, 0, 1) : 1;
    const stepVis = play ? clamp(play.ambient, 0, 1) : 0;
    const finVis = play ? clamp(play.finale, 0, 1) : 0;
    const isMobile = mobile();
    if (heroVis > 0.01) layoutProps(sets.hero, heroVis, t, dt, kf, heroAnchor.getBoundingClientRect(), heroCopy && !isMobile ? heroCopy.getBoundingClientRect() : null, 1 + (1 - heroVis) * 0.9);
    else sets.hero.group.visible = false;
    if (stepVis > 0.01) layoutProps(sets.steps, stepVis, t, dt, kf, r, null, 1 + (1 - stepVis) * 0.5);
    else sets.steps.group.visible = false;
    if (finVis > 0.01) layoutProps(sets.finale, finVis, t, dt, kf, dlAnchor.getBoundingClientRect(), dlCopy && !isMobile ? dlCopy.getBoundingClientRect() : null, 1 + (1 - finVis) * 0.6);
    else sets.finale.group.visible = false;

    if (!phone.visible && !sets.hero.group.visible && !sets.steps.group.visible && !sets.finale.group.visible) {
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
    intro = 1;
    for (let i = 0; i < 60; i++) tick(performance.now() + i * 16);
    if (fading) { screenMat.uniforms.tA.value = screenMat.uniforms.tB.value; screenMat.uniforms.uMix.value = 0; screenCurrent = screenTarget; fading = false; }
    tick(performance.now() + 1000);
  };
  return { setScreen, settle, renderer, scene };
}
