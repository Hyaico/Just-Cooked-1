/* Just Cooked — the shooting star (v12).
   One wish, one star. A bright head with a halo and a flare, a luminous ribbon of light
   behind it with a hair-thin bright core, and sparks that shed off and fall, all crossing
   the stage along a gentle arc. Every particle's place, size and fade come from a single
   progress value inside the vertex shader, so the whole star is two draw calls (the trail
   as points, the head as one small quad) on the play's second transparent canvas, drawn
   only while it is in flight. */

import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

const BEZ = [
  'uniform vec2 uP0, uP1, uC;',
  'vec2 bez(float s) { float u = 1.0 - s; return u * u * uP0 + 2.0 * u * s * uC + s * s * uP1; }',
  'vec2 dbez(float s) { return 2.0 * (1.0 - s) * (uC - uP0) + 2.0 * s * (uP1 - uC); }',
].join('\n');

// trail particle kinds: 0 glow ribbon, 1 bright core line, 2 falling sparks
const TRAIL_VERT = [
  BEZ,
  'uniform float uT, uTime, uPR, uAlpha, uTail, uScale;',
  'attribute float aDelay, aSeed, aSize, aKind, aSpread;',
  'varying float vAlpha, vKind; varying vec3 vColor;',
  'void main() {',
  '  float s = uT - aDelay * uTail;',
  '  float age = aDelay;',
  '  float live = (s > 0.0 && s < 1.0) ? 1.0 : 0.0;',
  '  float sc = clamp(s, 0.0, 1.0);',
  '  vec2 p = bez(sc);',
  '  vec2 tg = normalize(dbez(sc)); vec2 nm = vec2(-tg.y, tg.x);',
  '  float spread = aKind < 0.5 ? 0.32 : aKind < 1.5 ? 0.05 : 1.0;',
  '  p += nm * aSpread * age * uScale * 80.0 * spread;',
  '  if (aKind > 1.5) p.y -= age * age * uScale * 170.0;',
  '  float tw = aKind > 1.5 ? 0.6 + 0.4 * sin(uTime * (5.0 + aSeed * 9.0) + aSeed * 60.0) : 1.0;',
  '  float fade = aKind < 0.5 ? pow(1.0 - age, 1.1) : aKind < 1.5 ? pow(1.0 - age, 1.7) : (1.0 - age);',
  '  float base = aKind < 0.5 ? 0.095 : aKind < 1.5 ? 0.9 : 0.75;',
  '  vAlpha = base * fade * tw * uAlpha * live;',
  '  vKind = aKind;',
  '  vColor = aKind < 0.5 ? mix(vec3(0.74, 0.66, 1.0), vec3(0.5, 0.4, 0.95), age) : aKind < 1.5 ? mix(vec3(1.0), vec3(0.85, 0.8, 1.0), age) : vec3(0.95, 0.92, 1.0);',
  '  gl_PointSize = aSize * uScale * (1.0 - 0.45 * age) * uPR;',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);',
  '}',
].join('\n');
const TRAIL_FRAG = [
  'precision highp float;',
  'varying float vAlpha, vKind; varying vec3 vColor;',
  'void main() {',
  '  vec2 c = gl_PointCoord - 0.5;',
  '  float r = length(c) * 2.0;',
  '  if (r > 1.0) discard;',
  '  float a = vKind < 0.5 ? exp(-r * r * 2.6) * (1.0 - smoothstep(0.7, 1.0, r)) : (1.0 - r) * (1.0 - r);',
  '  a = clamp(a, 0.0, 1.0) * vAlpha;',
  '  gl_FragColor = vec4(vColor * a, a);',
  '}',
].join('\n');

// the head: one quad that rides the arc, painted with a core, a corona, a wide halo and four soft rays
const HEAD_VERT = [
  BEZ,
  'uniform float uT, uScale, uSize;',
  'varying vec2 vQ;',
  'void main() {',
  '  vec2 head = bez(clamp(uT, 0.0, 1.0));',
  '  vQ = position.xy;',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(head + position.xy * uSize * uScale, 0.0, 1.0);',
  '}',
].join('\n');
const HEAD_FRAG = [
  'precision highp float;',
  'uniform float uT, uTime, uAlpha;',
  'varying vec2 vQ;',
  'void main() {',
  '  float r = length(vQ);',
  '  float on = (uT > 0.0 && uT < 1.0) ? 1.0 : 0.0;',
  '  float ends = smoothstep(0.0, 0.04, uT) * (1.0 - smoothstep(0.96, 1.0, uT));',
  '  float breathe = 1.0 + 0.1 * sin(uTime * 7.0);',
  '  float core = exp(-r * r * 160.0);',
  '  float corona = 0.55 * exp(-r * r * 28.0);',
  '  float halo = 0.3 * exp(-r * r * 4.2 / breathe);',
  '  float rays = (0.9 * exp(-abs(vQ.y) * 70.0 - abs(vQ.x) * 2.4) + 0.55 * exp(-abs(vQ.x) * 70.0 - abs(vQ.y) * 5.0)) * (1.0 - smoothstep(0.45, 1.0, r));',
  '  vec3 col = vec3(1.0) * (core + corona) + vec3(0.72, 0.64, 1.0) * halo + vec3(0.95, 0.92, 1.0) * rays;',
  '  float a = clamp(core + corona + halo + rays, 0.0, 1.0) * uAlpha * on * ends;',
  '  gl_FragColor = vec4(col * uAlpha * on * ends, a);',
  '}',
].join('\n');

export function start(canvas, state) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance', premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  camera.position.z = 5;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const mobile = () => (canvas.clientWidth || innerWidth) < 900;

  // the trail: a ribbon of soft glow, a bright thin core, and sparks that shed and fall; all denser near the head
  const k = mobile() ? 0.65 : 1;
  let s = 7;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const delay = [], seed = [], size = [], kind = [], spread = [], pos = [];
  const add = (count, kindId, szLo, szHi, bias) => {
    for (let i = 0; i < Math.round(count * k); i++) {
      delay.push(Math.pow(rnd(), bias)); seed.push(rnd()); kind.push(kindId);
      size.push(lerp(szLo, szHi, rnd())); spread.push(rnd() * 2 - 1); pos.push(0, 0, 0);
    }
  };
  add(360, 0, 12, 26, 1.4);
  add(520, 1, 2.2, 4.4, 1.6);
  add(260, 2, 1.6, 3.6, 1.2);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aDelay', new THREE.Float32BufferAttribute(delay, 1));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
  geo.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
  geo.setAttribute('aKind', new THREE.Float32BufferAttribute(kind, 1));
  geo.setAttribute('aSpread', new THREE.Float32BufferAttribute(spread, 1));
  const shared = {
    uP0: { value: new THREE.Vector2() }, uP1: { value: new THREE.Vector2() }, uC: { value: new THREE.Vector2() },
    uT: { value: 0 }, uTime: { value: 0 }, uAlpha: { value: 1 }, uScale: { value: 1 },
  };
  const trail = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: Object.assign({ uPR: { value: dpr }, uTail: { value: 0.5 } }, shared),
    vertexShader: TRAIL_VERT, fragmentShader: TRAIL_FRAG, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, premultipliedAlpha: true,
  }));
  trail.frustumCulled = false;
  const head = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: Object.assign({ uSize: { value: 230 } }, shared),
    vertexShader: HEAD_VERT, fragmentShader: HEAD_FRAG, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, premultipliedAlpha: true,
  }));
  head.frustumCulled = false;
  scene.add(trail);
  scene.add(head);

  // ---- sizing: 1 world unit = 1 CSS px, origin at the stage centre, y up
  let vw = 1, vh = 1;
  const defaultPath = [[-0.08, 0.3], [0.5, 0.56], [1.08, 0.42]];
  const toWorld = (fx, fy) => new THREE.Vector2((fx - 0.5) * vw, (0.5 - fy) * vh);
  const place = () => {
    const path = state.path || defaultPath; // stage fractions (y down): start, control, end
    shared.uP0.value.copy(toWorld(path[0][0], path[0][1]));
    shared.uC.value.copy(toWorld(path[1][0], path[1][1]));
    shared.uP1.value.copy(toWorld(path[2][0], path[2][1]));
    shared.uScale.value = clamp(Math.min(vw, vh) / 800, 0.6, 1.15);
  };
  const resize = () => {
    vw = canvas.clientWidth || innerWidth;
    vh = canvas.clientHeight || innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(vw, vh, false);
    camera.left = -vw / 2; camera.right = vw / 2; camera.top = vh / 2; camera.bottom = -vh / 2;
    camera.updateProjectionMatrix();
    place();
  };
  resize();
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); });

  /* where the head is right now, as stage fractions (y down): the page uses it to sweep the night in behind the star */
  const headAt = (t) => {
    const path = state.path || defaultPath;
    const u = 1 - clamp(t, 0, 1), v = clamp(t, 0, 1);
    return [u * u * path[0][0] + 2 * u * v * path[1][0] + v * v * path[2][0], u * u * path[0][1] + 2 * u * v * path[1][1] + v * v * path[2][1]];
  };

  let cleared = true;
  function render(now) {
    if (!state.active) {
      if (!cleared) { renderer.clear(); cleared = true; }
      return;
    }
    cleared = false;
    shared.uT.value = state.t;
    shared.uTime.value = now / 1000;
    shared.uAlpha.value = clamp(state.alpha ?? 1, 0, 1);
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(render);
  document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : render));

  return { renderer, scene, state, head: headAt, relayout: place, settle: () => render(performance.now()) };
}
