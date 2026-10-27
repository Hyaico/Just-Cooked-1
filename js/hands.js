/* Just Cooked — the reach (v8).
   Two hands made of starlight for the Support passage. Each hand is a small 3D
   skeleton (forearm, palm, thumb, four fingers) wrapped in tapered capsules. The
   capsule surfaces are sampled once into a few thousand soft points plus a faint
   constellation of joints and bones; after that every frame only uploads ~22 bone
   matrices per hand, so the reach, the finger curl, the gathering from stardust
   and the dissolve all run in the vertex shader. Rendered on its own transparent
   canvas, only while the passage is on screen. */

import * as THREE from 'three';

const DEG = Math.PI / 180;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rgb = (hex) => new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);

/* ---------------------------------------------------------------- the rig
   One right hand: wrist at the origin, fingers along +x, thumb toward +y, palm facing +z.
   Units are palm widths. A bone is a tapered capsule that starts at `at` in its parent's
   frame (or at the parent's tip), turns by rot = [z, y, x] degrees, and runs `len` along
   its own +x with radii r0 -> r1; `flat` squashes it in z. Finger joints also take a pose
   rotation [z, y] (negative y curls toward the palm), scaled by the finger's `k`. */
const FINGERS = [
  { n: 'i', y: 0.2, ma: 8, ml: 0.9, mr: [0.17, 0.145], ph: [0.36, 0.26, 0.2], r: [0.115, 0.1, 0.09, 0.072], splay: 4, k: 0.9 },
  { n: 'm', y: 0.06, ma: 1, ml: 0.96, mr: [0.18, 0.15], ph: [0.4, 0.3, 0.22], r: [0.12, 0.105, 0.093, 0.077], splay: -1, k: 1 },
  { n: 'r', y: -0.08, ma: -5, ml: 0.9, mr: [0.17, 0.14], ph: [0.37, 0.28, 0.21], r: [0.113, 0.1, 0.088, 0.073], splay: -4, k: 1.05 },
  { n: 'p', y: -0.22, ma: -11, ml: 0.78, mr: [0.15, 0.12], ph: [0.29, 0.21, 0.16], r: [0.1, 0.088, 0.077, 0.064], splay: -8, k: 1.1 },
];
function buildRig() {
  const bones = [];
  const add = (b) => { b.i = bones.length; bones.push(b); return b; };
  add({ n: 'forearm', p: -1, at: [0.02, 0, 0], rot: [180, 0, 0], len: 3.2, r0: 0.3, r1: 0.42, flat: 0.7 });
  add({ n: 'wrist', p: -1, at: [-0.08, 0, 0], rot: [0, 0, 0], len: 0.34, r0: 0.31, r1: 0.33, flat: 0.6 });
  add({ n: 'thenar', p: -1, at: [0.12, 0.24, 0.03], rot: [46, 0, 0], len: 0.36, r0: 0.2, r1: 0.17, flat: 0.75 });
  FINGERS.forEach((f) => {
    const m = add({ n: f.n + '0', p: -1, at: [0.12, f.y, 0], rot: [f.ma, 0, 0], len: f.ml, r0: f.mr[0], r1: f.mr[1], flat: 0.62, line: 0.35 });
    let parent = m;
    f.ph.forEach((len, j) => {
      parent = add({ n: f.n + (j + 1), p: parent.i, rot: [j === 0 ? f.splay : 0, 0, 0], len, r0: f.r[j], r1: f.r[j + 1], flat: 0.9, joint: ['knuckle', 'pip', 'dip'][j], k: f.k, line: 1, node: true, tip: j === 2 });
    });
  });
  const t1 = add({ n: 't1', p: -1, at: [0.1, 0.3, 0.06], rot: [52, -22, 0], len: 0.5, r0: 0.165, r1: 0.14, flat: 0.85, joint: 'tmc', k: 1, line: 1, node: true });
  const t2 = add({ n: 't2', p: t1.i, rot: [-16, -4, 0], len: 0.34, r0: 0.13, r1: 0.11, flat: 0.9, joint: 'tpip', k: 1, line: 1, node: true });
  add({ n: 't3', p: t2.i, rot: [-12, 0, 0], len: 0.3, r0: 0.11, r1: 0.085, flat: 0.9, joint: 'tdip', k: 1, line: 1, node: true, tip: true });
  return bones;
}
const POSES = {
  open: { knuckle: [0, -8], pip: [0, -12], dip: [0, -6], tmc: [-4, -6], tpip: [-6, 0], tdip: [-4, 0] },       // reaching, relaxed
  hold: { knuckle: [0, -22], pip: [0, -34], dip: [0, -16], tmc: [-14, -16], tpip: [-14, 0], tdip: [-10, 0] }, // the held hand closes a little
  grip: { knuckle: [0, -46], pip: [0, -64], dip: [0, -34], tmc: [-24, -30], tpip: [-26, 0], tdip: [-18, 0] }, // the helping hand wraps round
};

const _e = new THREE.Euler();
const _t = new THREE.Matrix4();
/* world (hand-frame) matrices for every bone, blending pose a -> b by t, under a root matrix */
function solve(rig, out, a, b, t, root) {
  for (let i = 0; i < rig.length; i++) {
    const bone = rig[i];
    let pz = bone.rot[0], py = bone.rot[1];
    if (bone.joint) {
      const ja = a[bone.joint], jb = b[bone.joint];
      pz += lerp(ja[0], jb[0], t) * bone.k;
      py += lerp(ja[1], jb[1], t) * bone.k;
    }
    const m = out[i];
    m.makeRotationFromEuler(_e.set(bone.rot[2] * DEG, py * DEG, pz * DEG, 'ZYX'));
    if (bone.p < 0) { m.setPosition(bone.at[0], bone.at[1], bone.at[2]); m.premultiply(root); }
    else { m.setPosition(rig[bone.p].len, 0, 0); m.premultiply(out[bone.p]); }
  }
}

/* ---------------------------------------------------------------- sampling the surfaces */
function makeRandom(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function sampleHand(rig, count, rnd) {
  const rest = rig.map(() => new THREE.Matrix4());
  solve(rig, rest, POSES.open, POSES.open, 0, new THREE.Matrix4());
  const inv = rest.map((m) => m.clone().invert());
  const area = (b) => (Math.PI * (b.r0 + b.r1) * b.len + 2 * Math.PI * (b.r0 * b.r0 + b.r1 * b.r1)) * (0.5 + 0.5 * b.flat);
  const areas = rig.map(area);
  const total = areas.reduce((s, v) => s + v, 0);
  const q = new THREE.Vector3(), qb = new THREE.Vector3();
  const outside = (bi, p) => { // distance from the nearest *other* capsule, so overlaps are sampled once
    let best = 1e9;
    for (let j = 0; j < rig.length; j++) {
      if (j === bi) continue;
      const b = rig[j];
      qb.copy(p).applyMatrix4(inv[j]);
      qb.z /= b.flat;
      const t = clamp(qb.x, 0, b.len);
      const d = Math.hypot(qb.x - t, qb.y, qb.z) - lerp(b.r0, b.r1, t / b.len);
      if (d < best) best = d;
    }
    return best;
  };
  const local = [], normal = [], bone = [], size = [], seed = [], kind = [], grad = [], scatter = [];
  const push = (bi, px, py, pz, nx, ny, nz, sz, kd) => {
    const nl = Math.hypot(nx, ny, nz) || 1;
    q.set(px, py, pz).applyMatrix4(rest[bi]);
    local.push(px, py, pz); normal.push(nx / nl, ny / nl, nz / nl); bone.push(bi); size.push(sz); seed.push(rnd()); kind.push(kd);
    grad.push(clamp((q.x + 2.9) / 4.9, 0, 1));
    let sx, sy, sz2, l;
    do { sx = rnd() * 2 - 1; sy = rnd() * 2 - 1; sz2 = rnd() * 2 - 1; l = sx * sx + sy * sy + sz2 * sz2; } while (l > 1 || l < 0.01);
    scatter.push(sx, sy, sz2 * 0.4);
  };
  rig.forEach((b, bi) => {
    const n = Math.round(count * 1.35 * areas[bi] / total);
    const capShare = (2 * Math.PI * (b.r0 * b.r0 + b.r1 * b.r1)) / (Math.PI * (b.r0 + b.r1) * b.len + 2 * Math.PI * (b.r0 * b.r0 + b.r1 * b.r1));
    for (let k = 0; k < n; k++) {
      let px, py, pz, nx, ny, nz;
      if (rnd() < capShare) {
        const end = rnd() < (b.r1 * b.r1) / (b.r0 * b.r0 + b.r1 * b.r1);
        let dx, dy, dz, l;
        do { dx = rnd() * 2 - 1; dy = rnd() * 2 - 1; dz = rnd() * 2 - 1; l = dx * dx + dy * dy + dz * dz; } while (l > 1 || l < 0.05);
        l = Math.sqrt(l); dx /= l; dy /= l; dz /= l;
        dx = end ? Math.abs(dx) : -Math.abs(dx);
        const r = end ? b.r1 : b.r0;
        px = (end ? b.len : 0) + r * dx; py = r * dy; pz = r * dz * b.flat;
        nx = dx; ny = dy; nz = dz / b.flat;
      } else {
        const t = rnd(), phi = rnd() * Math.PI * 2, r = lerp(b.r0, b.r1, t);
        px = t * b.len; py = r * Math.cos(phi); pz = r * Math.sin(phi) * b.flat;
        nx = -(b.r1 - b.r0) / b.len; ny = Math.cos(phi); nz = Math.sin(phi) / b.flat;
      }
      q.set(px, py, pz).applyMatrix4(rest[bi]);
      if (outside(bi, q) < -0.02) continue;
      const u = rnd();
      const sz = u < 0.7 ? lerp(1.4, 2.5, rnd()) : u < 0.94 ? lerp(2.5, 3.7, rnd()) : lerp(3.8, 6.0, rnd());
      push(bi, px, py, pz, nx, ny, nz, sz, u < 0.94 ? 0 : 1);
    }
  });
  // the constellation: a bright node at every finger joint and tip
  rig.forEach((b, bi) => {
    if (!b.node) return;
    push(bi, 0, 0, 0, 0, 0, 1, 7.5, 2);
    if (b.tip) push(bi, b.len, 0, 0, 0, 0, 1, 6.5, 2);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('aLocal', new THREE.Float32BufferAttribute(local, 3));
  geo.setAttribute('aNormal', new THREE.Float32BufferAttribute(normal, 3));
  geo.setAttribute('aScatter', new THREE.Float32BufferAttribute(scatter, 3));
  geo.setAttribute('aBone', new THREE.Float32BufferAttribute(bone, 1));
  geo.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
  geo.setAttribute('aKind', new THREE.Float32BufferAttribute(kind, 1));
  geo.setAttribute('aGrad', new THREE.Float32BufferAttribute(grad, 1));
  geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(local.length), 3)); // unused, keeps three.js happy
  // bones as faint lines between the joints
  const lp = [], lb = [], la = [], lg = [];
  rig.forEach((b, bi) => {
    if (!b.line) return;
    q.set(0, 0, 0).applyMatrix4(rest[bi]);
    const g0 = clamp((q.x + 2.9) / 4.9, 0, 1);
    q.set(b.len, 0, 0).applyMatrix4(rest[bi]);
    const g1 = clamp((q.x + 2.9) / 4.9, 0, 1);
    lp.push(0, 0, 0, b.len, 0, 0); lb.push(bi, bi); la.push(b.line, b.line); lg.push(g0, g1);
  });
  const lines = new THREE.BufferGeometry();
  lines.setAttribute('aLocal', new THREE.Float32BufferAttribute(lp, 3));
  lines.setAttribute('aBone', new THREE.Float32BufferAttribute(lb, 1));
  lines.setAttribute('aAlpha', new THREE.Float32BufferAttribute(la, 1));
  lines.setAttribute('aGrad', new THREE.Float32BufferAttribute(lg, 1));
  lines.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(lp.length), 3));
  return { geo, lines };
}

/* ---------------------------------------------------------------- shaders */
const POINT_VERT = [
  'uniform mat4 uBones[BONES];',
  'uniform float uTime, uForm, uDissolve, uAlpha, uPR, uD;',
  'uniform vec3 uReveal, uHazeDay, uRimDay, uHazeNight, uRimNight, uSpark;',
  'attribute vec3 aLocal, aNormal, aScatter;',
  'attribute float aBone, aSize, aSeed, aKind, aGrad;',
  'varying vec3 vColor; varying float vAlpha, vKind;',
  'void main() {',
  '  mat4 B = uBones[int(aBone + 0.5)];',
  '  vec3 p = (B * vec4(aLocal, 1.0)).xyz;',
  '  vec3 n = normalize(mat3(B) * aNormal);',
  '  float f = 1.0 - uForm;',
  '  p += aScatter * (f * f) * uD * 0.14;', // gathers in from a wide cloud of dust
  '  float d = uDissolve;',
  '  p += (vec3(aScatter.x * 0.45, 0.55 + aScatter.y * 0.4, aScatter.z * 0.2) * d * d + vec3(0.0, d * 0.05, 0.0)) * uD * 0.26;', // lifts away into the sky
  '  vec3 view = normalize(cameraPosition - p);',
  '  float edge = pow(1.0 - abs(dot(n, view)), 1.5);', // silhouette points glow, face-on points are haze
  '  float night = 1.0 - smoothstep(uReveal.z - 90.0, uReveal.z + 90.0, distance(p.xy, uReveal.xy));',
  '  float tw = 0.78 + 0.22 * sin(uTime * (1.3 + aSeed * 2.2) + aSeed * 37.0);',
  '  float a = mix(0.2, 1.0, edge) * (1.0 + 0.2 * night);', // a little brighter once the sky is dark
  '  if (aKind > 1.5) a = 1.0; else if (aKind > 0.5) a = max(a, 0.75);',
  '  a *= tw * uAlpha * (1.0 - d * d) * mix(0.3, 1.0, uForm) * smoothstep(0.04, 0.42, aGrad);', // the arm trails off into dust
  '  vec3 col = mix(mix(uHazeDay, uHazeNight, night), mix(uRimDay, uRimNight, night), edge);',
  '  if (aKind > 0.5) col = mix(col, uSpark, 0.75);',
  '  float size = aSize * (1.2 + 0.6 * edge) * (1.0 + 0.3 * night) * (1.0 + 0.7 * f) * (1.0 + 0.8 * d);',
  '  #ifdef HAZE', // the body of the hand: the same points drawn big and faint, a soft glow with no blur filter
  '  a = 0.016 * uAlpha * (1.0 - d * d) * uForm * smoothstep(0.12, 0.56, aGrad) * (0.6 + 0.4 * edge);',
  '  col = mix(uHazeDay, uHazeNight, night);',
  '  size = aSize * 7.0 * (1.0 + 0.8 * d);',
  '  if (aKind > 1.5) a = 0.0;',
  '  #endif',
  '  vColor = col; vAlpha = a; vKind = aKind;',
  '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
  '  gl_PointSize = size * uPR * (uD / -mv.z);',
  '  gl_Position = projectionMatrix * mv;',
  '}',
].join('\n');
const POINT_FRAG = [
  'precision highp float;',
  'varying vec3 vColor; varying float vAlpha, vKind;',
  'void main() {',
  '  vec2 c = gl_PointCoord - 0.5;',
  '  float r = length(c) * 2.0;',
  '  if (r > 1.0) discard;',
  '  float a = 1.0 - r; a *= a;',
  '  if (vKind > 0.5) {', // sparkles and joints: a bright core with four soft rays
  '    float cr = max(exp(-abs(c.x) * 18.0 - abs(c.y) * 3.0), exp(-abs(c.y) * 18.0 - abs(c.x) * 3.0));',
  '    a = max(a, cr * (1.0 - r));',
  '    a = max(a, 1.0 - r * 2.4);',
  '  }',
  '  a = clamp(a, 0.0, 1.0) * vAlpha;',
  '  gl_FragColor = vec4(vColor * a, a);',
  '}',
].join('\n');
const LINE_VERT = [
  'uniform mat4 uBones[BONES];',
  'uniform float uForm, uDissolve, uAlpha, uD;',
  'uniform vec3 uReveal, uLineDay, uLineNight;',
  'attribute vec3 aLocal; attribute float aBone, aAlpha, aGrad;',
  'varying vec4 vCol;',
  'void main() {',
  '  mat4 B = uBones[int(aBone + 0.5)];',
  '  vec3 p = (B * vec4(aLocal, 1.0)).xyz;',
  '  float night = 1.0 - smoothstep(uReveal.z - 90.0, uReveal.z + 90.0, distance(p.xy, uReveal.xy));',
  '  float a = 0.75 * aAlpha * uAlpha * uForm * uForm * (1.0 - uDissolve) * smoothstep(0.04, 0.42, aGrad);',
  '  vCol = vec4(mix(uLineDay, uLineNight, night) * a, a);',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
  '}',
].join('\n');
const LINE_FRAG = 'precision highp float; varying vec4 vCol; void main() { gl_FragColor = vCol; }';

/* ---------------------------------------------------------------- the scene */
export function start(canvas, state) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance', premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = true;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 40000);
  const rig = buildRig();
  const mobile = () => (canvas.clientWidth || innerWidth) < 900;
  const dpr = Math.min(devicePixelRatio || 1, 2);

  const makeHand = (seed, count, colours) => {
    const { geo, lines } = sampleHand(rig, count, makeRandom(seed));
    const bones = rig.map(() => new THREE.Matrix4());
    const shared = {
      uBones: { value: bones }, uTime: { value: 0 }, uForm: { value: 0 }, uDissolve: { value: 0 }, uAlpha: { value: 0 },
      uPR: { value: dpr }, uD: { value: 1000 }, uReveal: { value: new THREE.Vector3(0, 0, -400) },
    };
    const pointUniforms = () => Object.assign({}, shared, { uHazeDay: { value: colours.hazeDay }, uRimDay: { value: colours.rimDay }, uHazeNight: { value: colours.hazeNight }, uRimNight: { value: colours.rimNight }, uSpark: { value: rgb(0xffffff) } });
    const pm = new THREE.ShaderMaterial({
      defines: { BONES: rig.length }, uniforms: pointUniforms(),
      vertexShader: POINT_VERT, fragmentShader: POINT_FRAG, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true,
    });
    const hm = new THREE.ShaderMaterial({
      defines: { BONES: rig.length, HAZE: 1 }, uniforms: pointUniforms(),
      vertexShader: POINT_VERT, fragmentShader: POINT_FRAG, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true,
    });
    const lm = new THREE.ShaderMaterial({
      defines: { BONES: rig.length },
      uniforms: Object.assign({}, shared, { uLineDay: { value: colours.lineDay }, uLineNight: { value: colours.lineNight } }),
      vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true,
    });
    const haze = new THREE.Points(geo, hm);
    const points = new THREE.Points(geo, pm);
    const segs = new THREE.LineSegments(lines, lm);
    haze.frustumCulled = false; points.frustumCulled = false; segs.frustumCulled = false;
    scene.add(haze); scene.add(segs); scene.add(points);
    return { bones, shared, points, segs, root: new THREE.Matrix4(), from: new THREE.Vector2(), rest: new THREE.Vector2(), angle: 0 };
  };
  const count = mobile() ? 4200 : 7200;
  const A = makeHand(11, count, { hazeDay: rgb(0x5a4ec8), rimDay: rgb(0x241e6e), hazeNight: rgb(0x7a69ee), rimNight: rgb(0xe8e3ff), lineDay: rgb(0x3b3199), lineNight: rgb(0xd8d0ff) });
  const B = makeHand(29, count, { hazeDay: rgb(0x7a5bd4), rimDay: rgb(0x352a86), hazeNight: rgb(0xa58cf4), rimNight: rgb(0xf4eeff), lineDay: rgb(0x4d3aa6), lineNight: rgb(0xe6dcff) });

  // ---- sizing: 1 world unit = 1 CSS px on the z = 0 plane, origin at the stage centre
  let vw = 1, vh = 1, D = 1000, W = 120;
  const clasp = new THREE.Vector2();
  const resize = () => {
    vw = canvas.clientWidth || innerWidth;
    vh = canvas.clientHeight || innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    D = (vh / 2) / Math.tan(15 * DEG);
    camera.position.set(0, 0, D);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    W = clamp(Math.min(vw * 0.34, vh * 0.22), 96, 200); // palm width in px
    [A, B].forEach((h) => { h.shared.uD.value = D; });
    place();
  };
  // where the hands meet (state.cx/cy are stage fractions, y down) and where they come from
  const place = () => {
    clasp.set(((state.cx ?? 0.5) - 0.5) * vw, (0.5 - (state.cy ?? 0.46)) * vh);
    A.angle = 40 * DEG;
    B.angle = 40 * DEG;
    // each wrist sits so the palm centre (0.62, 0.02 in hand units) lands just off the clasp point
    const pa = new THREE.Vector2(clasp.x - 0.05 * W, clasp.y + 0.03 * W);
    const pb = new THREE.Vector2(clasp.x + 0.05 * W, clasp.y - 0.03 * W);
    const off = (ang, flip) => new THREE.Vector2(0.62 * W, (flip ? -0.02 : 0.02) * W).rotateAround(new THREE.Vector2(), ang);
    A.rest.copy(pa).sub(off(A.angle, false));
    B.rest.copy(pb).sub(off(B.angle + Math.PI, true));
    A.from.set(A.rest.x - vw * 0.62, A.rest.y - vh * 0.55);
    B.from.set(B.rest.x + vw * 0.62, B.rest.y + vh * 0.55);
  };
  resize();
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); });

  const _pos = new THREE.Vector2(), _dir = new THREE.Vector2(), _m = new THREE.Matrix4();
  const ease = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const setRoot = (h, reach, back, time, phase, curl) => {
    const e = ease(reach);
    _dir.copy(h.rest).sub(h.from);
    _pos.copy(h.from).lerp(h.rest, e);
    const arc = Math.sin(e * Math.PI) * 0.06 * _dir.length();
    _pos.x += -_dir.y / _dir.length() * arc * (back ? -1 : 1);
    _pos.y += _dir.x / _dir.length() * arc * (back ? -1 : 1);
    // alive at rest: a slow sway, shared by both hands once they hold
    const own = Math.sin(time * 0.8 + phase) * 1.4 * DEG;
    const together = Math.sin(time * 0.7) * 0.9 * DEG;
    const sway = lerp(own, together, curl) * e;
    const bob = lerp(Math.sin(time * 1.1 + phase) * 0.035, Math.sin(time * 0.9) * 0.025, curl) * W * e;
    const settle = (1 - e) * (back ? -10 : 12) * DEG; // a little turn as it arrives
    _pos.y += bob;
    h.root.makeTranslation(_pos.x, _pos.y, back ? 0.12 * W : -0.12 * W);
    h.root.multiply(_m.makeRotationZ(h.angle + (back ? Math.PI : 0) + sway + settle));
    if (back) h.root.multiply(_m.makeRotationX(Math.PI));
    h.root.multiply(_m.makeScale(W, W, W));
  };

  let cleared = true, lastActive = false;
  const reveal = new THREE.Vector3();
  function render(now) {
    const active = !!state.active;
    if (!active) {
      if (!cleared) { renderer.clear(); cleared = true; }
      lastActive = false;
      return;
    }
    if (!lastActive) { lastActive = true; place(); }
    cleared = false;
    const time = now / 1000;
    const curl = clamp(state.curl, 0, 1);
    setRoot(A, state.reachA, false, time, 0, curl);
    setRoot(B, state.reachB, true, time, 2.1, curl);
    solve(rig, A.bones, POSES.open, POSES.hold, curl, A.root);
    solve(rig, B.bones, POSES.open, POSES.grip, curl, B.root);
    const r = state.reveal > 0 ? state.reveal * Math.hypot(vw, vh) * 1.0 : -400;
    reveal.set(clasp.x, clasp.y, r);
    [[A, state.reachA], [B, state.reachB]].forEach(([h, reach]) => {
      const u = h.shared;
      u.uTime.value = time;
      u.uForm.value = clamp(reach / 0.8, 0, 1);
      u.uDissolve.value = clamp(state.dissolve, 0, 1);
      u.uAlpha.value = clamp(state.alpha, 0, 1) * clamp(reach / 0.25, 0, 1);
      u.uReveal.value.copy(reveal);
    });
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(render);
  document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : render));

  return {
    renderer, scene, state,
    settle: () => { render(performance.now()); },
    relayout: place,
  };
}
