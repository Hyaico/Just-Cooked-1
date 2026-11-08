/* Just Cooked — 3D scene (v7).
   One procedurally built phone on a fixed, transparent canvas. It sits exactly
   on the page's single phone slot (which the home-page timeline moves around
   the stage), shows whichever app screen the play asks for, and reacts to the
   mouse, the finger, the gyroscope and drag-to-spin: it turns by how far the
   pointer is from the phone itself. Around it, low-poly food and kitchen models
   (Kenney Food Kit, CC0) are scattered at random through whatever room the words
   and the phone leave on the screen: in the hero, through the steps and again
   for the finale. They only react when the mouse is over them. */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const SCREEN_KEYS = ['home', 'next-meal', 'recipe', 'pantry', 'savings', 'support', 'support-settings'];
const screenUrl = (key) => '/assets/screens/' + key + '.webp';
const modelUrl = (name) => '/assets/models/' + name + '.glb';

const PHONE = { w: 1, h: 2.07, d: 0.082, r: 0.15, bevel: 0.016 };
const SCREEN = { w: 0.925, h: 2.008 };
const GLASS = { w: 0.962, h: 2.036, r: 0.128 };
const ASPECT = 1274 / 2668;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
// a small seeded random (mulberry32): the same seed always draws the same numbers
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

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

/* Props: the models each set may use. s is a model's size (in 0.21 phone heights) and rot the tilt that shows its best
   side (the models lie flat on y). Where they go is worked out on each screen (scatter, in start): at random through
   whatever room the words, the buttons, the phone and the nav leave there, each with its own size, turn and depth,
   the biggest first. The random is seeded, so a screen gets the same scatter on every visit (change a set's seed for
   another), and a model that finds no clear spot (a small screen) is left out. */
const PROPS = {
  hero: {
    seed: 1201,
    desktop: [
      { model: 'whisk', s: 0.85, rot: [0.6, 0.2, 0.5] },
      { model: 'egg-cooked', s: 0.8, rot: [0.95, 0.2, 0.3] },
      { model: 'carrot', s: 0.75, rot: [0.6, 0.4, 0.5] },
      { model: 'croissant', s: 0.72, rot: [0.8, 0.5, 0.2] },
      { model: 'pepper', s: 0.6, rot: [0.4, 0.3, 0.1] },
      { model: 'bread', s: 0.6, rot: [0.5, 0.6, 0.1] },
      { model: 'cheese-cut', s: 0.6, rot: [0.95, -0.3, 0.1] },
      { model: 'tomato', s: 0.6, rot: [0.4, 0.3, 0] },
      { model: 'broccoli', s: 0.58, rot: [0.3, 0.4, 0] },
      { model: 'pancakes', s: 0.58, rot: [0.75, 0.4, 0] },
      { model: 'lemon-half', s: 0.55, rot: [0.85, 0.3, 0.3] },
      { model: 'advocado-half', s: 0.55, rot: [0.35, -1.3, 0.1] }, // its cut face looks along x
      { model: 'apple', s: 0.5, rot: [0.4, 0.3, 0] },
      { model: 'strawberry', s: 0.45, rot: [0.5, 0.3, 0.2] },
      { model: 'mushroom', s: 0.45, rot: [0.4, 0.3, 0.2] },
    ],
    mobile: [
      { model: 'egg-cooked', s: 0.85, rot: [0.95, 0.2, 0.3] },
      { model: 'tomato', s: 0.72, rot: [0.4, 0.3, 0] },
      { model: 'broccoli', s: 0.72, rot: [0.3, 0.4, 0] },
      { model: 'carrot', s: 0.7, rot: [0.6, 0.4, 0.5] },
      { model: 'croissant', s: 0.66, rot: [0.8, 0.3, 0.2] },
      { model: 'lemon-half', s: 0.64, rot: [0.85, 0.3, 0.3] },
      { model: 'apple', s: 0.58, rot: [0.4, 0.3, 0] },
      { model: 'strawberry', s: 0.56, rot: [0.5, 0.3, 0.2] },
      { model: 'mushroom', s: 0.52, rot: [0.4, 0.3, 0.2] },
    ],
  },
  steps: {
    seed: 2711,
    desktop: [
      { model: 'frying-pan', s: 0.95, rot: [0.95, -0.5, 0.2] },
      { model: 'pancakes', s: 0.75, rot: [0.75, 0.4, 0] },
      { model: 'croissant', s: 0.75, rot: [0.8, 0.3, 0.2] },
      { model: 'egg-cooked', s: 0.7, rot: [0.95, 0.2, 0.3] },
      { model: 'tomato', s: 0.65, rot: [0.4, 0.3, 0] },
      { model: 'orange', s: 0.6, rot: [0.4, 0.3, 0] },
      { model: 'lemon-half', s: 0.58, rot: [0.85, 0.3, 0.3] },
      { model: 'cheese-cut', s: 0.55, rot: [0.95, -0.3, 0.1] },
      { model: 'mushroom', s: 0.55, rot: [0.4, 0.3, 0.2] },
      { model: 'strawberry', s: 0.45, rot: [0.5, 0.3, 0.2] },
    ],
    mobile: [
      { model: 'egg-cooked', s: 0.66, rot: [0.95, 0.2, 0.3] },
      { model: 'lemon-half', s: 0.6, rot: [0.85, 0.3, 0.3] },
      { model: 'tomato', s: 0.6, rot: [0.4, 0.3, 0] },
      { model: 'pancakes', s: 0.56, rot: [0.75, 0.4, 0] },
      { model: 'mushroom', s: 0.52, rot: [0.4, 0.3, 0.2] },
      { model: 'strawberry', s: 0.5, rot: [0.5, 0.3, 0.2] },
    ],
  },
  finale: {
    seed: 3907,
    desktop: [
      { model: 'whisk', s: 0.85, rot: [0.6, 0.2, -0.4] },
      { model: 'egg-cooked', s: 0.82, rot: [0.95, 0.2, 0.3] },
      { model: 'pancakes', s: 0.8, rot: [0.75, 0.4, 0] },
      { model: 'carrot', s: 0.75, rot: [0.6, 0.4, 0.5] },
      { model: 'croissant', s: 0.75, rot: [0.8, 0.3, 0.2] },
      { model: 'rollingPin', s: 0.7, rot: [0.7, 0.2, 0.25] },
      { model: 'shaker-salt', s: 0.65, rot: [0.3, 0.3, 0.1] },
      { model: 'broccoli', s: 0.62, rot: [0.3, 0.4, 0] },
      { model: 'cheese-cut', s: 0.62, rot: [0.95, -0.3, 0.1] },
      { model: 'orange', s: 0.62, rot: [0.4, 0.3, 0] },
      { model: 'tomato', s: 0.62, rot: [0.4, 0.3, 0] },
      { model: 'apple', s: 0.55, rot: [0.4, 0.3, 0] },
      { model: 'mushroom', s: 0.5, rot: [0.4, 0.3, 0.2] },
      { model: 'strawberry', s: 0.45, rot: [0.5, 0.3, 0.2] },
    ],
    mobile: [
      { model: 'whisk', s: 0.75, rot: [0.6, 0.2, -0.4] },
      { model: 'egg-cooked', s: 0.72, rot: [0.95, 0.2, 0.3] },
      { model: 'broccoli', s: 0.62, rot: [0.3, 0.4, 0] },
      { model: 'tomato', s: 0.62, rot: [0.4, 0.3, 0] },
      { model: 'orange', s: 0.6, rot: [0.4, 0.3, 0] },
      { model: 'strawberry', s: 0.5, rot: [0.5, 0.3, 0.2] },
      { model: 'mushroom', s: 0.5, rot: [0.4, 0.3, 0.2] },
    ],
  },
};

export async function start(canvas, opts = {}) {
  const play = opts.state || null; // { keys, screenIndex, ry, rx, shapes, ambient, finale } driven by the page timeline
  const slot = document.querySelector('[data-phone-slot]');
  if (!slot) throw new Error('no phone slot');
  const heroAnchor = document.querySelector('.play__anchor--hero') || slot;
  const dlAnchor = document.querySelector('.play__anchor--download') || slot;
  const slotRot = (slot.dataset.rot || '0,0').split(',').map(Number);

  // dense screens (most phones) are sharp enough without multisampling, which is a large share of the GPU's work there
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: (devicePixelRatio || 1) < 2, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping || THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
  camera.position.set(0, 0, 10);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  if ('environmentIntensity' in scene) scene.environmentIntensity = 0.8;

  const key = new THREE.DirectionalLight(0xfff2e4, 2.2);
  key.position.set(3, 5, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe4ecdc, 0.9);
  fill.position.set(-5, -2, 4);
  scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xfff6ec, 0xe0d5c2, 0.7));

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

  // the screen is a plain quad, so its corners are rounded here: anything outside the display's
  // rounded rectangle is discarded (with a soft edge) and the black glass shows through
  const screenMat = new THREE.ShaderMaterial({
    uniforms: { tA: { value: null }, tB: { value: null }, uMix: { value: 0 }, uHalf: { value: new THREE.Vector2(SCREEN.w / 2, SCREEN.h / 2) }, uRadius: { value: 0.11 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'uniform sampler2D tA; uniform sampler2D tB; uniform float uMix, uRadius; uniform vec2 uHalf; varying vec2 vUv;',
      'void main(){',
      '  vec2 p = abs(vUv - 0.5) * uHalf * 2.0 - (uHalf - uRadius);',
      '  float d = length(max(p, 0.0)) - uRadius;',
      '  float aa = max(fwidth(d), 0.0005);',
      '  float alpha = 1.0 - smoothstep(-aa, aa, d);',
      '  if (alpha <= 0.002) discard;',
      '  vec4 a = texture2D(tA, vUv); vec4 b = texture2D(tB, vUv);',
      '  gl_FragColor = vec4(mix(a, b, uMix).rgb, alpha);',
      '  #include <colorspace_fragment>',
      '}',
    ].join('\n'),
    transparent: true,
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

  // ---- phone
  const phone = buildPhone(screenMat);
  scene.add(phone);

  // ---- props: low-poly models, normalised to one unit and centred
  const gltf = new GLTFLoader();
  const modelCache = {}, loaded = {}; // the loads, and the models once they are in
  const loadModel = (name) => {
    if (!modelCache[name]) {
      modelCache[name] = new Promise((resolve, reject) => {
        gltf.load(modelUrl(name), (g) => {
          const obj = g.scene;
          obj.traverse((o) => {
            if (o.isMesh && o.material) {
              o.material.metalness = 0;
              o.material.roughness = 0.9;
              o.material.envMapIntensity = 0.6;
            }
          });
          const box = new THREE.Box3().setFromObject(obj);
          const size = box.getSize(new THREE.Vector3());
          const c = box.getCenter(new THREE.Vector3());
          const s = 1 / Math.max(size.x, size.y, size.z, 0.0001);
          obj.scale.setScalar(s);
          obj.position.set(-c.x * s, -c.y * s, -c.z * s);
          loaded[name] = obj;
          resolve(obj);
        }, undefined, reject);
      });
    }
    return modelCache[name];
  };

  const mobile = () => (canvas.clientWidth || innerWidth) < 900;
  const buildGroup = (defs) => {
    const g = new THREE.Group();
    const items = defs.map((d, i) => {
      const seed = ((i * 7919 + d.model.length * 131) % 97) / 97;
      const it = { d, place: null, wrap: new THREE.Group(), ready: false, hover: 0, phase: seed * Math.PI * 2, bobSpeed: 0.45 + seed * 0.4, bobAmp: 0.012 + seed * 0.01, spin: 0.06 + seed * 0.12 }; // a gentle float, small enough to stay clear of the words
      it.wrap.visible = false;
      g.add(it.wrap);
      loadModel(d.model).then((obj) => { it.wrap.add(obj.clone()); it.ready = true; it.t0 = performance.now(); }).catch(() => {});
      return it;
    });
    scene.add(g);
    return { group: g, items };
  };
  let sets = null, builtMobile = null, scattered = false;
  const rebuildProps = () => {
    if (sets) Object.values(sets).forEach((set) => scene.remove(set.group));
    const m = mobile();
    sets = Object.fromEntries(Object.entries(PROPS).map(([name, p]) => [name, buildGroup(m ? p.mobile : p.desktop)]));
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
    if (mobile() !== builtMobile) { rebuildProps(); placeAll(); }
    else if (scattered) relayout();
  };
  resize();
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); });

  // ---- input: mouse / finger / gyro tilt the phone; hovering a prop wakes it up
  const fine = matchMedia('(pointer: fine)').matches;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, cx: 0, cy: 0, has: false, moved: false };
  const touch = { active: false };
  const gyro = { x: 0, y: 0, on: false };
  if (fine) {
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer.tx = (e.clientX / vw) * 2 - 1;
      pointer.ty = (e.clientY / vh) * 2 - 1;
      pointer.cx = e.clientX; pointer.cy = e.clientY; pointer.has = true;
      pointer.moved = true;
    }, { passive: true });
  }
  addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (!t) return;
    touch.active = true;
    pointer.tx = (t.clientX / vw) * 2 - 1;
    pointer.ty = (t.clientY / vh) * 2 - 1;
    pointer.cx = t.clientX; pointer.cy = t.clientY; pointer.has = true;
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

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered = null;
  function pickHover() {
    if (!fine || !pointer.moved) return;
    pointer.moved = false;
    ndc.set(pointer.tx, -pointer.ty);
    raycaster.setFromCamera(ndc, camera);
    const visibleWraps = [];
    Object.values(sets).forEach((set) => { if (set.group.visible) set.items.forEach((it) => { if (it.ready && it.wrap.visible) visibleWraps.push(it.wrap); }); });
    const hits = raycaster.intersectObjects(visibleWraps, true);
    hovered = null;
    if (hits.length) {
      let o = hits[0].object;
      while (o && !visibleWraps.includes(o)) o = o.parent;
      hovered = o || null;
    }
  }

  // ---- props placement. Each set is scattered (seeded) through the room the words, the buttons, the phone and the
  //      nav leave on this screen, never over any of them, with the float and a margin to spare; then it rides its phone
  let intro = 0;
  const navBar = document.querySelector('.nav__bar');
  const ROOM = {
    hero: { scenes: '[data-scene="hero"]', phone: heroAnchor },
    steps: { scenes: '[data-scene="step"]', phone: slot },
    finale: { scenes: '[data-scene="download"]', phone: dlAnchor },
  };
  const KEEP_CLEAR = '.scene__block, .things, .scene__num, .play__foot'; // each one whole, so nothing nestles into a ragged edge
  // a set's phone and the boxes its props must stay off, in CSS px, with the scenes at rest (while the play runs its
  // stage fills the window). The timeline slides the words in and out, so every transform in and around them is lifted
  // while they are read, in one synchronous step: nothing is ever painted that way.
  const room = (name) => {
    const { scenes, phone: phoneEl } = ROOM[name];
    const roots = [phoneEl, ...document.querySelectorAll(scenes)];
    const lifted = new Map();
    const lift = (e) => { if (e.style && e.style.transform && !lifted.has(e)) lifted.set(e, e.style.transform); };
    roots.forEach((el) => { for (let e = el; e && e !== document.body; e = e.parentElement) lift(e); el.querySelectorAll('*').forEach(lift); });
    lifted.forEach((_, e) => { e.style.transform = 'none'; });
    const ph = phoneEl.getBoundingClientRect();
    const off = [[ph.left - 14, ph.top - 14, ph.right + 14, ph.bottom + 14]];
    const range = document.createRange();
    roots.slice(1).forEach((s) => s.querySelectorAll(KEEP_CLEAR).forEach((el) => {
      range.selectNodeContents(el);
      let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
      for (const c of range.getClientRects()) {
        if (c.width < 1 || c.height < 1) continue;
        l = Math.min(l, c.left); t = Math.min(t, c.top); r = Math.max(r, c.right); b = Math.max(b, c.bottom);
      }
      if (r > l) off.push([l - 16, t - 16, r + 16, b + 16]);
    }));
    lifted.forEach((v, e) => { e.style.transform = v; });
    return {
      off, top: (navBar ? navBar.offsetTop + navBar.offsetHeight : 0) + 12, // nor up beside the nav
      phone: { x: ph.left + ph.width / 2, y: ph.top + ph.height / 2, h: Math.min(ph.height, ph.width / ASPECT) },
    };
  };
  const hit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  const probe = new THREE.Group(), corner = new THREE.Vector3();
  const unitBox = (model, rot) => { // a model's box at that turn, at unit size
    probe.rotation.set(rot[0], rot[1], rot[2]);
    probe.add(loaded[model]);
    probe.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(probe);
    probe.remove(loaded[model]);
    return bb;
  };
  const scatter = (name) => {
    const set = sets[name], R = room(name), H = R.phone.h;
    if (!H) return;
    const base = H * wpp * 0.21, float = 0.022 * H + 4; // the props float up and down by up to this much
    camera.updateMatrixWorld();
    // the screen box a prop at screen point (sx, sy) would take up, the float and a hair included
    const reach = (bb, sx, sy, z, k) => {
      const x = (sx - vw / 2) * wpp, y = -(sy - vh / 2) * wpp;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let i = 0; i < 8; i++) {
        corner.set(x + (i & 1 ? bb.max.x : bb.min.x) * k, y + (i & 2 ? bb.max.y : bb.min.y) * k, z + (i & 4 ? bb.max.z : bb.min.z) * k).project(camera);
        const px = ((corner.x + 1) / 2) * vw, py = ((1 - corner.y) / 2) * vh;
        x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
      }
      return [x0 - 3, y0 - float, x1 + 3, y1 + float];
    };
    // clear of everything, below the nav, and at most a touch over the sides or the bottom of the screen
    const clear = (f) => {
      const w = f[2] - f[0], h = f[3] - f[1];
      return f[1] >= R.top && f[0] >= -0.12 * w && f[2] <= vw + 0.12 * w && f[3] <= vh + 0.08 * h && !R.off.some((o) => hit(f, o));
    };
    // whatever is already placed stays put while it is still clear (a resize, the fonts arriving)
    const kept = [];
    set.items.forEach((it) => {
      const p = it.place;
      if (!p) return;
      const f = reach(p.bb, R.phone.x + p.off[0] * H, R.phone.y - p.off[1] * H, p.z, base * p.s);
      if (clear(f) && !kept.some((k) => hit(f, k))) kept.push(f);
      else it.place = null;
    });
    const todo = set.items.filter((it) => !it.place && loaded[it.d.model]);
    if (!todo.length) return;
    let best = null;
    for (let n = 0; n < (kept.length ? 1 : 3); n++) { // a fresh scatter keeps the fullest of three draws
      const rand = seeded(PROPS[name].seed + n * 7919);
      const taken = kept.slice(), picks = [];
      // each placement gets its own size, turn (never so far that its best side turns away) and depth, and the biggest
      // find their room first
      const order = todo.map((it) => ({
        it, s: it.d.s * (0.78 + rand() * 0.5), z: (rand() - 0.5) * 0.9,
        rot: [it.d.rot[0] + (rand() - 0.5) * 0.24, it.d.rot[1] + (rand() - 0.5) * 0.9, it.d.rot[2] + (rand() - 0.5) * 0.5],
      })).sort((a, b) => b.s - a.s);
      for (const o of order) {
        const bb = unitBox(o.it.d.model, o.rot);
        const span = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y) * base * o.s / wpp; // its size on screen, in px
        let pick = null;
        // the first clear spot chance offers, clumps and gaps and all; a little smaller where nothing fits, but never
        // so small that it reads as a speck
        for (const k of [1, 0.84, 0.7]) {
          if (span * k < Math.max(28, 0.07 * H)) break;
          for (let c = 0; c < 240 && !pick; c++) {
            const sx = (rand() * 1.1 - 0.05) * vw, sy = R.top + rand() * (vh * 1.04 - R.top);
            const f = reach(bb, sx, sy, o.z, base * o.s * k), gap = 2 + rand() * 0.06 * H;
            if (clear(f) && !taken.some((t) => hit([f[0] - gap, f[1] - gap, f[2] + gap, f[3] + gap], t))) pick = { f, sx, sy, k };
          }
          if (pick) break;
        }
        if (!pick) continue; // no room for it on this screen
        taken.push(pick.f);
        picks.push({ it: o.it, place: { off: [(pick.sx - R.phone.x) / H, (R.phone.y - pick.sy) / H], z: o.z, s: o.s * pick.k, rot: o.rot, bb } });
      }
      // the fullest draw wins; between equals, the one that reaches into more of the screen
      const cells = new Set(picks.map(({ place: p }) => Math.floor(clamp((R.phone.x + p.off[0] * H) / vw, 0, 0.99) * 3) * 3 + Math.floor(clamp((R.phone.y - p.off[1] * H) / vh, 0, 0.99) * 3)));
      const score = picks.length * 100 + cells.size;
      if (!best || score > best.score) best = { score, picks };
    }
    const now = performance.now();
    best.picks.forEach(({ it, place }) => { it.place = place; it.t0 = now; }); // and they grow in where they land
  };
  const fontsIn = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]) : Promise.resolve();
  // a set is scattered once its models, and the fonts that size the words, are in
  const placeAll = () => {
    const built = sets;
    return Promise.all(Object.entries(built).map(([name, set]) => Promise.all(set.items.map((it) => loadModel(it.d.model).catch(() => null)))
      .then(() => fontsIn).then(() => { if (sets === built) scatter(name); })));
  };
  // scatter again: the props still clear stay put, the rest find new spots (or all of them, fresh, for tooling)
  const relayout = (fresh) => Object.entries(sets).forEach(([name, set]) => { if (fresh) set.items.forEach((it) => { it.place = null; }); scatter(name); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (scattered) relayout(); });

  function layoutProps(set, vis, t, dt, kf, phoneRect, spread) {
    set.group.visible = vis > 0.01;
    if (!set.group.visible) return;
    const H = Math.min(phoneRect.height, phoneRect.width / ASPECT) * wpp;
    const pcx = (phoneRect.left + phoneRect.width / 2 - vw / 2) * wpp;
    const pcy = -(phoneRect.top + phoneRect.height / 2 - vh / 2) * wpp;
    const base = H * 0.21;
    set.items.forEach((it, i) => {
      const p = it.place;
      if (!it.ready || !p) { it.wrap.visible = false; return; } // not in yet, or no room for it on this screen
      it.wrap.visible = true;
      const appear = easeOut(((t * 1000 - (it.t0 || 0)) / 1000 - i * 0.04) / 0.9);
      it.hover = lerp(it.hover, it.wrap === hovered ? 1 : 0, kf(0.14));
      const bob = Math.sin(t * it.bobSpeed + it.phase) * it.bobAmp * H + it.hover * 0.06 * H;
      it.wrap.position.set(pcx + p.off[0] * H * spread, pcy + p.off[1] * H * spread + bob, p.z + it.hover * 0.3);
      it.wrap.scale.setScalar(base * p.s * appear * vis * (1 + 0.16 * it.hover));
      it.wrap.rotation.set(p.rot[0] + Math.sin(t * 0.5 + it.phase) * 0.05, p.rot[1] + Math.sin(t * it.spin + it.phase) * 0.12 + it.hover * 0.55, p.rot[2]);
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

    const r = slot.getBoundingClientRect();
    // the phone turns to face the pointer: how far the pointer is from the phone, measured against the room left
    // between the phone and the screen's edge on that side, so the full turn is reached at either edge wherever
    // the phone rests
    const useGyro = !touch.active && !fine && gyro.on;
    const pcx = r.left + r.width / 2, pcy = r.top + r.height / 2;
    const dxp = pointer.cx - pcx, dyp = pointer.cy - pcy;
    const relX = pointer.has ? clamp(dxp / Math.max(dxp >= 0 ? vw - pcx : pcx, 40), -1, 1) : 0;
    const relY = pointer.has ? clamp(dyp / Math.max(dyp >= 0 ? vh - pcy : pcy, 40), -1, 1) : 0;
    pointer.x = lerp(pointer.x, useGyro ? gyro.x * 0.7 : relX, kf(0.16));
    pointer.y = lerp(pointer.y, useGyro ? gyro.y * 0.7 : relY, kf(0.16));
    if (!drag.active) { drag.ry = lerp(drag.ry, 0, kf(0.07)); drag.rx = lerp(drag.rx, 0, kf(0.07)); }
    const fitH = Math.max(0, Math.min(r.height, r.width / ASPECT));
    const px = (r.left + r.width / 2 - vw / 2) * wpp;
    const py = -(r.top + r.height / 2 - vh / 2) * wpp;
    const ts = (fitH * wpp) / PHONE.h;
    state.s = Math.abs(state.s - ts) > 0.6 ? ts : lerp(state.s, ts, kf(0.5));

    const baseRy = play ? play.ry : slotRot[0] || 0;
    const baseRx = play ? play.rx : slotRot[1] || 0;
    // from its resting pose the phone eases toward the same full turn on either side, so a phone that rests
    // angled one way still turns just as far the other way
    const faceY = pointer.x >= 0 ? lerp(baseRy, 0.55, pointer.x) : lerp(baseRy, -0.55, -pointer.x);
    const faceX = pointer.y >= 0 ? lerp(baseRx, -0.24, pointer.y) : lerp(baseRx, 0.24, -pointer.y);
    state.ry = lerp(state.ry, (faceY + drag.ry) * e, kf(0.18));
    state.rx = lerp(state.rx, (faceX + drag.rx) * e, kf(0.18));
    state.rz = lerp(state.rz, Math.sin(t * 0.6) * 0.012 * e, kf(0.1));

    const onScreen = Math.abs(py) < visH / 2 + (state.s * PHONE.h) / 2 + 0.3;
    phone.visible = state.s > 0.004 && onScreen;
    phone.position.set(px, py + Math.sin(t * 0.9) * 0.02 * state.s * e, 0);
    phone.scale.setScalar(state.s);
    phone.rotation.set(state.rx, state.ry, state.rz);

    const wantKey = play && play.keys ? play.keys[clamp(Math.round(play.screenIndex), 0, play.keys.length - 1)] : slot.dataset.screen;
    if (wantKey) setScreen(wantKey);
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

    pickHover();
    const heroVis = play ? clamp(play.shapes, 0, 1) : 1;
    const stepVis = play ? clamp(play.ambient, 0, 1) : 0;
    const finVis = play ? clamp(play.finale, 0, 1) : 0;
    // each set rides its phone, and drifts out a little as it fades
    if (heroVis > 0.01) layoutProps(sets.hero, heroVis, t, dt, kf, heroAnchor.getBoundingClientRect(), 1 + (1 - heroVis) * 0.35);
    else sets.hero.group.visible = false;
    if (stepVis > 0.01) layoutProps(sets.steps, stepVis, t, dt, kf, r, 1 + (1 - stepVis) * 0.25);
    else sets.steps.group.visible = false;
    if (finVis > 0.01) layoutProps(sets.finale, finVis, t, dt, kf, dlAnchor.getBoundingClientRect(), 1 + (1 - finVis) * 0.3);
    else sets.finale.group.visible = false;

    // nothing to draw, or the page has faded this canvas out (the wish and the star): keep the state moving, skip the GPU work
    const faded = canvas.style.opacity !== '' && Number(canvas.style.opacity) < 0.01;
    if (faded || (!phone.visible && !sets.hero.group.visible && !sets.steps.group.visible && !sets.finale.group.visible)) {
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
    Object.values(sets).forEach((set) => set.items.forEach((it) => { it.t0 = performance.now() - 5000; }));
    for (let i = 0; i < 60; i++) tick(performance.now() + i * 16);
    if (fading) { screenMat.uniforms.tA.value = screenMat.uniforms.tB.value; screenMat.uniforms.uMix.value = 0; screenCurrent = screenTarget; fading = false; }
    tick(performance.now() + 1000);
  };
  const ready = placeAll().then(() => { scattered = true; }); // the props are in place
  // where each visible prop is on screen (CSS px), for the layout checks in the tooling
  const propBoxes = () => {
    const out = [], box = new THREE.Box3(), v = new THREE.Vector3();
    Object.entries(sets).forEach(([name, set]) => {
      if (!set.group.visible) return;
      set.items.forEach((it) => {
        if (!it.ready || !it.wrap.visible) return;
        box.setFromObject(it.wrap);
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (let i = 0; i < 8; i++) {
          v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(camera);
          const sx = ((v.x + 1) / 2) * vw, sy = ((1 - v.y) / 2) * vh;
          x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
        }
        out.push({ set: name, model: it.d.model, x0: Math.round(x0), y0: Math.round(y0), x1: Math.round(x1), y1: Math.round(y1) });
      });
    });
    return out;
  };
  return { setScreen, settle, ready, renderer, scene, propBoxes, relayout };
}
