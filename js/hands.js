/* Just Cooked — the reach (v9).
   Two real 3D hands for the Support passage. Each hand starts as a small skeleton
   (forearm, palm, thumb, four fingers) wrapped in tapered capsules; the capsules are
   blended into one smooth surface with marching cubes, the surface is skinned to the
   bones, and from then on it is an ordinary skinned mesh: one hand reaches up from
   below, the other comes in from the side and closes around its wrist. They
   materialise out of (and dissolve back into) stardust through a noise threshold in
   the fragment shader, and a few hundred stars ride on the surface. Lit warm, rendered
   on its own transparent canvas, only while the passage is on screen. */

import * as THREE from 'three';
import { edgeTable, triTable } from 'three/addons/objects/MarchingCubes.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const DEG = Math.PI / 180;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* ---------------------------------------------------------------- the rig
   One right hand: wrist at the origin, fingers along +x, thumb toward +y, palm facing +z.
   Units are palm widths. A bone is a tapered capsule that starts at `at` in its parent's frame
   (or at the parent's tip), turns by rot = [z, y, x] degrees, and runs `len` along its own +x
   with radii r0 -> r1; `flat` squashes it in z. Finger joints also take a pose rotation
   [z, y] (negative y curls toward the palm), scaled by the finger's `k`. */
const FINGERS = [
  { n: 'i', y: 0.2, ma: 8, ml: 0.9, mr: [0.18, 0.15], ph: [0.34, 0.25, 0.2], r: [0.13, 0.115, 0.104, 0.084], splay: 4, k: 0.9 },
  { n: 'm', y: 0.06, ma: 1, ml: 0.96, mr: [0.19, 0.16], ph: [0.38, 0.28, 0.22], r: [0.135, 0.12, 0.107, 0.087], splay: -1, k: 1 },
  { n: 'r', y: -0.08, ma: -5, ml: 0.9, mr: [0.18, 0.15], ph: [0.35, 0.27, 0.21], r: [0.128, 0.115, 0.102, 0.082], splay: -4, k: 1.05 },
  { n: 'p', y: -0.22, ma: -11, ml: 0.78, mr: [0.16, 0.13], ph: [0.28, 0.2, 0.16], r: [0.112, 0.1, 0.089, 0.073], splay: -8, k: 1.1 },
];
function buildRig() {
  const bones = [];
  const add = (b) => { b.i = bones.length; bones.push(b); return b; };
  add({ n: 'forearm', p: -1, at: [0.02, 0, 0], rot: [180, 0, 0], len: 2.1, r0: 0.28, r1: 0.34, flat: 0.76 });
  add({ n: 'wrist', p: -1, at: [-0.06, 0, 0], rot: [0, 0, 0], len: 0.3, r0: 0.28, r1: 0.32, flat: 0.64 });
  add({ n: 'thenar', p: -1, at: [0.12, 0.24, 0.03], rot: [46, 0, 0], len: 0.36, r0: 0.21, r1: 0.18, flat: 0.8 });
  add({ n: 'hypothenar', p: -1, at: [0.1, -0.3, 0], rot: [-6, 0, 0], len: 0.55, r0: 0.16, r1: 0.14, flat: 0.75 });
  FINGERS.forEach((f) => {
    const m = add({ n: f.n + '0', p: -1, at: [0.12, f.y, 0], rot: [f.ma, 0, 0], len: f.ml, r0: f.mr[0], r1: f.mr[1], flat: 0.7 });
    let parent = m;
    f.ph.forEach((len, j) => {
      parent = add({ n: f.n + (j + 1), p: parent.i, rot: [j === 0 ? f.splay : 0, 0, 0], len, r0: f.r[j], r1: f.r[j + 1], flat: 0.94, joint: ['knuckle', 'pip', 'dip'][j], k: f.k });
    });
  });
  const t1 = add({ n: 't1', p: -1, at: [0.1, 0.3, 0.06], rot: [52, -14, 0], len: 0.48, r0: 0.17, r1: 0.145, flat: 0.9, joint: 'tmc', k: 1 });
  const t2 = add({ n: 't2', p: t1.i, rot: [-16, -4, 0], len: 0.32, r0: 0.135, r1: 0.115, flat: 0.94, joint: 'tpip', k: 1 });
  add({ n: 't3', p: t2.i, rot: [-12, 0, 0], len: 0.28, r0: 0.115, r1: 0.09, flat: 0.94, joint: 'tdip', k: 1 });
  return bones;
}
const POSES = {
  open: { knuckle: [0, -8], pip: [0, -12], dip: [0, -6], tmc: [-4, -4], tpip: [-6, 0], tdip: [-4, 0] },        // reaching, relaxed
  hold: { knuckle: [0, -14], pip: [0, -20], dip: [0, -10], tmc: [-10, -6], tpip: [-10, 0], tdip: [-8, 0] },    // the held hand closes a little
  grip: { knuckle: [0, -58], pip: [0, -72], dip: [0, -44], tmc: [-26, -40], tpip: [-22, -10], tdip: [-16, 0] }, // the helping hand wraps round the wrist
};
/* the staging, in palm widths: tweakable from the dev page */
const TUNE = {
  aAngle: 80,      // the reaching hand's finger direction (degrees, counter-clockwise from +x)
  bAngle: 172,     // the helping hand's finger direction: across the reaching hand's forearm
  grabBelow: 0.5,  // how far below the reaching wrist the grip sits
  bShift: 0.42,    // the helping palm sits this far back from the forearm's axis, so its knuckles reach the far edge
  bZ: 0.46,        // the helping palm floats this far in front of the forearm's axis
  bUp: 0.0,        // slide the helping hand along the forearm
  sizeK: 0.19,     // palm width as a share of the viewport height (phones are capped by their width instead)
};

/* ---------------------------------------------------------------- the surface: capsules -> one smooth skin */
function smin(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }

/* world (hand-frame) matrices for every bone in the rest pose */
function restMatrices(rig) {
  const out = rig.map(() => new THREE.Matrix4());
  const e = new THREE.Euler();
  for (let i = 0; i < rig.length; i++) {
    const b = rig[i], m = out[i];
    m.makeRotationFromEuler(e.set(b.rot[2] * DEG, b.rot[1] * DEG, b.rot[0] * DEG, 'ZYX'));
    if (b.p < 0) m.setPosition(b.at[0], b.at[1], b.at[2]);
    else { m.setPosition(rig[b.p].len, 0, 0); m.premultiply(out[b.p]); }
  }
  return out;
}

/* signed distance from a hand-frame point to one capsule (rest pose) */
function capsuleDist(b, inv, x, y, z) {
  const e = inv.elements;
  const qx = e[0] * x + e[4] * y + e[8] * z + e[12];
  const qy = e[1] * x + e[5] * y + e[9] * z + e[13];
  const qz = (e[2] * x + e[6] * y + e[10] * z + e[14]) / b.flat;
  const t = clamp(qx, 0, b.len);
  return Math.hypot(qx - t, qy, qz) - lerp(b.r0, b.r1, t / b.len);
}

const CORNER = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
const EDGE = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
const GRAD_LO = -2.1, GRAD_SPAN = 4.2; // where along the hand a point sits: 0 at the arm's end, 1 at the fingertips

function buildSurface(rig, grid, bounds) {
  const [nx, ny, nz] = grid;
  const rest = restMatrices(rig);
  const inv = rest.map((m) => m.clone().invert());
  const lo = bounds.min, hi = bounds.max;
  const dx = (hi[0] - lo[0]) / (nx - 1), dy = (hi[1] - lo[1]) / (ny - 1), dz = (hi[2] - lo[2]) / (nz - 1);
  const K = 0.07; // how softly the capsules melt into each other
  const sdf = new Float32Array(nx * ny * nz).fill(10);
  const corner = new THREE.Vector3();
  rig.forEach((b, bi) => {
    // only the cells this capsule can reach
    const R = Math.max(b.r0, b.r1) + K + 0.06;
    let mnx = 1e9, mny = 1e9, mnz = 1e9, mxx = -1e9, mxy = -1e9, mxz = -1e9;
    for (let c = 0; c < 8; c++) {
      corner.set(c & 1 ? b.len + R : -R, c & 2 ? R : -R, c & 4 ? R : -R).applyMatrix4(rest[bi]);
      mnx = Math.min(mnx, corner.x); mxx = Math.max(mxx, corner.x);
      mny = Math.min(mny, corner.y); mxy = Math.max(mxy, corner.y);
      mnz = Math.min(mnz, corner.z); mxz = Math.max(mxz, corner.z);
    }
    const i0 = clamp(Math.floor((mnx - lo[0]) / dx), 1, nx - 2), i1 = clamp(Math.ceil((mxx - lo[0]) / dx), 1, nx - 2);
    const j0 = clamp(Math.floor((mny - lo[1]) / dy), 1, ny - 2), j1 = clamp(Math.ceil((mxy - lo[1]) / dy), 1, ny - 2);
    const k0 = clamp(Math.floor((mnz - lo[2]) / dz), 1, nz - 2), k1 = clamp(Math.ceil((mxz - lo[2]) / dz), 1, nz - 2);
    for (let k = k0; k <= k1; k++) {
      const z = lo[2] + k * dz;
      for (let j = j0; j <= j1; j++) {
        const y = lo[1] + j * dy;
        let q = k * nx * ny + j * nx + i0;
        for (let i = i0; i <= i1; i++, q++) {
          const d = capsuleDist(b, inv[bi], lo[0] + i * dx, y, z);
          sdf[q] = smin(sdf[q], d, K);
        }
      }
    }
  });
  // marching cubes over the grid: a vertex wherever an edge crosses the surface, normals from the gradient
  const at = (i, j, k) => sdf[k * nx * ny + j * nx + i];
  const grad = (i, j, k, out) => {
    out[0] = (at(Math.min(i + 1, nx - 1), j, k) - at(Math.max(i - 1, 0), j, k)) / dx;
    out[1] = (at(i, Math.min(j + 1, ny - 1), k) - at(i, Math.max(j - 1, 0), k)) / dy;
    out[2] = (at(i, j, Math.min(k + 1, nz - 1)) - at(i, j, Math.max(k - 1, 0))) / dz;
  };
  const positions = [], normals = [];
  const val = new Float32Array(8), vx = new Float32Array(12 * 3), vn = new Float32Array(12 * 3);
  const ga = [0, 0, 0], gb = [0, 0, 0];
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let cube = 0;
    for (let c = 0; c < 8; c++) {
      val[c] = -at(i + CORNER[c][0], j + CORNER[c][1], k + CORNER[c][2]); // inside is positive
      if (val[c] < 0) cube |= 1 << c;
    }
    const bits = edgeTable[cube];
    if (bits === 0) continue;
    for (let e = 0; e < 12; e++) {
      if (!(bits & (1 << e))) continue;
      const a = EDGE[e][0], bq = EDGE[e][1];
      const t = clamp(-val[a] / (val[bq] - val[a]), 0, 1);
      const ca = CORNER[a], cb = CORNER[bq];
      vx[e * 3] = lo[0] + (i + ca[0] + (cb[0] - ca[0]) * t) * dx;
      vx[e * 3 + 1] = lo[1] + (j + ca[1] + (cb[1] - ca[1]) * t) * dy;
      vx[e * 3 + 2] = lo[2] + (k + ca[2] + (cb[2] - ca[2]) * t) * dz;
      grad(i + ca[0], j + ca[1], k + ca[2], ga);
      grad(i + cb[0], j + cb[1], k + cb[2], gb);
      const gx = lerp(ga[0], gb[0], t), gy = lerp(ga[1], gb[1], t), gz = lerp(ga[2], gb[2], t);
      const gl = Math.hypot(gx, gy, gz) || 1;
      vn[e * 3] = gx / gl; vn[e * 3 + 1] = gy / gl; vn[e * 3 + 2] = gz / gl;
    }
    for (let o = cube * 16; triTable[o] !== -1; o += 3) {
      for (let v = 0; v < 3; v++) {
        const e = triTable[o + v];
        positions.push(vx[e * 3], vx[e * 3 + 1], vx[e * 3 + 2]);
        normals.push(vn[e * 3], vn[e * 3 + 1], vn[e * 3 + 2]);
      }
    }
  }
  let geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo = mergeVertices(geo, 1e-4);
  // skinning: each vertex follows its two nearest capsules; colour runs from the arm to the fingertips
  const pos = geo.attributes.position, n = pos.count;
  const skinIndex = new Uint16Array(n * 4), skinWeight = new Float32Array(n * 4), color = new Float32Array(n * 3);
  const cArm = new THREE.Color(0x5244cf), cPalm = new THREE.Color(0x7a63e8), cTip = new THREE.Color(0xd2a4f2), cTmp = new THREE.Color();
  for (let v = 0; v < n; v++) {
    const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v);
    let i1 = 0, d1 = 1e9, i2 = 0, d2 = 1e9;
    for (let bi = 0; bi < rig.length; bi++) {
      const d = capsuleDist(rig[bi], inv[bi], x, y, z);
      if (d < d1) { i2 = i1; d2 = d1; i1 = bi; d1 = d; } else if (d < d2) { i2 = bi; d2 = d; }
    }
    const w2 = Math.exp(-(d2 - d1) / 0.045), s = 1 + w2;
    skinIndex[v * 4] = i1; skinIndex[v * 4 + 1] = i2;
    skinWeight[v * 4] = 1 / s; skinWeight[v * 4 + 1] = w2 / s;
    const g = clamp((x - GRAD_LO) / GRAD_SPAN, 0, 1);
    cTmp.copy(cArm).lerp(cPalm, smooth(0.3, 0.6, g)).lerp(cTip, smooth(0.66, 1.0, g));
    color[v * 3] = cTmp.r; color[v * 3 + 1] = cTmp.g; color[v * 3 + 2] = cTmp.b;
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
  return geo;
}

/* ---------------------------------------------------------------- materials */
const NOISE = [
  'float hash3(vec3 p) { p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }',
  'float vnoise(vec3 x) { vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);',
  '  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),',
  '             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z); }',
].join('\n');

function makeSkinMaterial(u) {
  const mat = new THREE.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.5, metalness: 0, envMapIntensity: 0.7,
    sheen: 1.0, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xffc4b4),
    clearcoat: 0.3, clearcoatRoughness: 0.5,
    emissive: new THREE.Color(0x2e2086), emissiveIntensity: 0.3,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uForm = u.uForm;
    shader.uniforms.uNight = u.uNight;
    shader.uniforms.uGlow = u.uGlow;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBind;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBind = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBind;\nuniform float uForm, uNight;\nuniform vec3 uGlow;\n' + NOISE)
      .replace('#include <emissivemap_fragment>', [
        '#include <emissivemap_fragment>',
        // stardust threshold: the hand condenses as uForm rises and frays back into dust as it falls;
        // the far part of the arm is always frayed, so the arm thins into the sky instead of ending
        'float n = vnoise(vBind * 9.0) * 0.4 + vnoise(vBind * 31.0) * 0.6;',
        'float g = clamp((vBind.x + 2.1) / 4.2, 0.0, 1.0);',
        'float arm = 1.0 - smoothstep(0.0, 0.5, g);',
        'float th = uForm * 1.14 - 0.07 - arm * arm * 1.25;',
        'if (n > th) discard;',
        'float edge = smoothstep(th - 0.16, th, n);',
        'totalEmissiveRadiance += uGlow * edge * (0.9 + uNight);',
        // a soft lavender light on the silhouette, stronger once the sky is dark
        'float fres = pow(1.0 - max(dot(normal, normalize(vViewPosition)), 0.0), 3.0);',
        'totalEmissiveRadiance += vec3(0.6, 0.52, 1.0) * fres * (0.18 + 0.55 * uNight);',
        'totalEmissiveRadiance += diffuseColor.rgb * uNight * 0.22;',
      ].join('\n'));
  };
  return mat;
}

const STAR_VERT = [
  'uniform mat4 uBones[BONES];',
  'uniform float uTime, uForm, uDissolve, uAlpha, uPR, uD, uNight;',
  'attribute vec4 aSkin; attribute vec3 aScatter; attribute float aSize, aSeed, aKind;',
  'varying float vAlpha, vKind; varying vec3 vColor;',
  'void main() {',
  '  vec4 bp = vec4(position, 1.0);',
  '  vec3 p = (uBones[int(aSkin.x + 0.5)] * bp).xyz * aSkin.y + (uBones[int(aSkin.z + 0.5)] * bp).xyz * aSkin.w;',
  '  float g = clamp((position.x + 2.1) / 4.2, 0.0, 1.0);',
  '  float tail = 1.0 - smoothstep(0.05, 0.34, g);', // along the frayed arm the stars drift loose: the arm becomes a trail
  '  float f = 1.0 - uForm;',
  '  p += aScatter * (f * f * 0.12 + tail * tail * 0.05) * uD;',
  '  float d = uDissolve;',
  '  p += (vec3(aScatter.x * 0.5, 0.6 + aScatter.y * 0.4, aScatter.z * 0.3) * d * d + vec3(0.0, d * 0.05, 0.0)) * uD * 0.25;',
  '  float tw = 0.7 + 0.3 * sin(uTime * (1.5 + aSeed * 2.5) + aSeed * 41.0);',
  '  float a = (aKind > 0.5 ? 1.0 : 0.85) * tw * uAlpha * (1.0 - d * d) * smoothstep(0.0, 0.08, g) * (0.65 + 0.35 * uNight);',
  '  vAlpha = a; vKind = aKind; vColor = mix(vec3(0.93, 0.9, 1.0), vec3(1.0), aKind);',
  '  vec4 mv = viewMatrix * vec4(p, 1.0);',
  '  gl_PointSize = aSize * uPR * (1.0 + 0.7 * f + 0.9 * d + 0.4 * tail) * (uD / -mv.z);',
  '  gl_Position = projectionMatrix * mv;',
  '}',
].join('\n');
const STAR_FRAG = [
  'precision highp float;',
  'varying float vAlpha, vKind; varying vec3 vColor;',
  'void main() {',
  '  vec2 c = gl_PointCoord - 0.5;',
  '  float r = length(c) * 2.0;',
  '  if (r > 1.0) discard;',
  '  float a = 1.0 - r; a *= a;',
  '  if (vKind > 0.5) {',
  '    float cr = max(exp(-abs(c.x) * 18.0 - abs(c.y) * 3.0), exp(-abs(c.y) * 18.0 - abs(c.x) * 3.0));',
  '    a = max(a, cr * (1.0 - r));',
  '    a = max(a, 1.0 - r * 2.4);',
  '  }',
  '  a = clamp(a, 0.0, 1.0) * vAlpha;',
  '  gl_FragColor = vec4(vColor * a, a);',
  '}',
].join('\n');

/* ---------------------------------------------------------------- the scene */
export function start(canvas, state) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping || THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 40000);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  if ('environmentIntensity' in scene) scene.environmentIntensity = 0.55;
  // warm key from the upper left, cool fill from the right, a lavender rim from behind
  const key = new THREE.DirectionalLight(0xffd9bc, 2.3); key.position.set(-600, 900, 1200); scene.add(key);
  const fill = new THREE.DirectionalLight(0x9fb4ff, 0.8); fill.position.set(900, -300, 700); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xcdbcff, 1.5); rim.position.set(500, 600, -900); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xdcd2ff, 0x1e1848, 0.5));

  const rig = buildRig();
  const tune = Object.assign({}, TUNE, state.tune || {});
  const mobile = () => (canvas.clientWidth || innerWidth) < 900;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const hands = [];
  let built = false;

  const makeHand = (geo, seed, back) => {
    // a fresh skeleton per hand, bound in the rest pose
    const group = new THREE.Group();
    group.matrixAutoUpdate = false;
    const root = new THREE.Bone();
    const bones = rig.map((b) => {
      const bone = new THREE.Bone();
      bone.position.set(b.p < 0 ? b.at[0] : rig[b.p].len, b.p < 0 ? b.at[1] : 0, b.p < 0 ? b.at[2] : 0);
      bone.rotation.set(b.rot[2] * DEG, b.rot[1] * DEG, b.rot[0] * DEG, 'ZYX');
      return bone;
    });
    rig.forEach((b, i) => (b.p < 0 ? root : bones[b.p]).add(bones[i]));
    group.add(root);
    root.updateMatrixWorld(true);
    const skeleton = new THREE.Skeleton(bones);
    const u = { uForm: { value: 0 }, uNight: { value: 0 }, uGlow: { value: new THREE.Vector3(0.82, 0.74, 1.0) } };
    const mesh = new THREE.SkinnedMesh(geo, makeSkinMaterial(u));
    mesh.frustumCulled = false;
    group.add(mesh);
    mesh.bind(skeleton);
    scene.add(group);
    // stars that ride on the surface, skinned by the same bones
    let s = seed >>> 0;
    const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const n = 300, pos = geo.attributes.position, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight;
    const sp = [], skin = [], scatter = [], size = [], sd = [], kind = [];
    for (let i = 0; i < n; i++) {
      const v = Math.floor(rnd() * pos.count);
      sp.push(pos.getX(v), pos.getY(v), pos.getZ(v));
      skin.push(si.getX(v), sw.getX(v), si.getY(v), sw.getY(v));
      let x, y, z, l;
      do { x = rnd() * 2 - 1; y = rnd() * 2 - 1; z = rnd() * 2 - 1; l = x * x + y * y + z * z; } while (l > 1 || l < 0.01);
      scatter.push(x, y, z * 0.5);
      const big = rnd() < 0.12;
      size.push(big ? lerp(5.5, 8.5, rnd()) : lerp(2.2, 4.2, rnd())); sd.push(rnd()); kind.push(big ? 1 : 0);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    sg.setAttribute('aSkin', new THREE.Float32BufferAttribute(skin, 4));
    sg.setAttribute('aScatter', new THREE.Float32BufferAttribute(scatter, 3));
    sg.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
    sg.setAttribute('aSeed', new THREE.Float32BufferAttribute(sd, 1));
    sg.setAttribute('aKind', new THREE.Float32BufferAttribute(kind, 1));
    const boneArr = new Float32Array(rig.length * 16);
    const su = { uBones: { value: boneArr }, uTime: { value: 0 }, uForm: { value: 0 }, uDissolve: { value: 0 }, uAlpha: { value: 0 }, uPR: { value: dpr }, uD: { value: 1000 }, uNight: { value: 0 } };
    const stars = new THREE.Points(sg, new THREE.ShaderMaterial({ defines: { BONES: rig.length }, uniforms: su, vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, transparent: true, depthTest: true, depthWrite: false, premultipliedAlpha: true }));
    stars.frustumCulled = false;
    scene.add(stars);
    return { group, mesh, skeleton, bones, u, stars, su, boneArr, back, root: new THREE.Matrix4(), from: new THREE.Vector2(), rest: new THREE.Vector2(), z: 0, angle: 0 };
  };

  const build = () => {
    const geo = buildSurface(rig, mobile() ? [104, 46, 25] : [128, 56, 30], { min: [-2.25, -0.78, -0.5], max: [2.3, 1.27, 0.55] });
    hands.push(makeHand(geo, 11, false), makeHand(geo, 29, true));
    built = true;
    place();
  };
  const ready = new Promise((resolve) => setTimeout(() => { build(); resolve(); }, 80));

  // ---- sizing: 1 world unit = 1 CSS px on the z = 0 plane, origin at the stage centre
  let vw = 1, vh = 1, D = 1000, W = 150;
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
    W = clamp(Math.min(vw * 0.33, vh * tune.sizeK), 90, 200); // palm width in px
    place();
  };
  /* the staging: state.cx/cy (stage fractions, y down) is the grip, on the reaching forearm just below its wrist.
     Hand A reaches up from below; hand B comes in from the right, palm toward the forearm, and closes around it. */
  const place = () => {
    clasp.set(((state.cx ?? 0.5) - 0.5) * vw, (0.5 - (state.cy ?? 0.5)) * vh);
    hands.forEach((h) => {
      h.su.uD.value = D;
      if (!h.back) {
        h.angle = tune.aAngle * DEG;
        const dir = new THREE.Vector2(Math.cos(h.angle), Math.sin(h.angle));
        h.rest.copy(clasp).addScaledVector(dir, tune.grabBelow * W);
        h.z = 0;
        h.from.set(h.rest.x, h.rest.y - vh * 0.95);
      } else {
        h.angle = tune.bAngle * DEG;
        const dir = new THREE.Vector2(Math.cos(h.angle), Math.sin(h.angle));
        const along = new THREE.Vector2(Math.cos(tune.aAngle * DEG), Math.sin(tune.aAngle * DEG));
        // the palm centre (0.62 along the hand) sits back from the forearm axis so the knuckles reach its far edge
        const palm = new THREE.Vector2().copy(clasp).addScaledVector(dir, -tune.bShift * W).addScaledVector(along, tune.bUp * W);
        h.rest.copy(palm).addScaledVector(dir, -0.62 * W);
        h.z = tune.bZ * W;
        h.from.set(h.rest.x + vw * 0.8, h.rest.y + vh * 0.18);
      }
    });
  };
  resize();
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); });

  const _pos = new THREE.Vector2(), _dir = new THREE.Vector2(), _m = new THREE.Matrix4();
  const ease = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const setRoot = (h, reach, time, phase, curl) => {
    const e = ease(reach);
    _dir.copy(h.rest).sub(h.from);
    _pos.copy(h.from).lerp(h.rest, e);
    const L = _dir.length() || 1;
    const arc = Math.sin(e * Math.PI) * 0.05 * L * (h.back ? 1 : -1);
    _pos.x += -_dir.y / L * arc;
    _pos.y += _dir.x / L * arc;
    // alive at rest: a slow sway and bob, shared by both hands once they hold
    const own = Math.sin(time * 0.8 + phase) * 1.4 * DEG;
    const together = Math.sin(time * 0.7) * 0.9 * DEG;
    const sway = lerp(own, together, curl) * e;
    const bob = lerp(Math.sin(time * 1.1 + phase) * 0.03, Math.sin(time * 0.9) * 0.02, curl) * W * e;
    const settle = (1 - e) * (h.back ? -10 : 8) * DEG;
    _pos.y += bob;
    h.root.makeTranslation(_pos.x, _pos.y, h.z);
    h.root.multiply(_m.makeRotationZ(h.angle + sway + settle));
    if (h.back) h.root.multiply(_m.makeRotationX(Math.PI)); // palm toward the forearm, knuckles toward us
    h.root.multiply(_m.makeScale(W, W, W));
    h.group.matrix.copy(h.root);
    h.group.matrixWorldNeedsUpdate = true;
  };
  const pose = (h, a, b, t) => {
    for (let i = 0; i < rig.length; i++) {
      const bone = rig[i];
      if (!bone.joint) continue;
      const ja = a[bone.joint], jb = b[bone.joint];
      h.bones[i].rotation.set(bone.rot[2] * DEG, (bone.rot[1] + lerp(ja[1], jb[1], t) * bone.k) * DEG, (bone.rot[0] + lerp(ja[0], jb[0], t) * bone.k) * DEG, 'ZYX');
    }
  };

  let cleared = true, lastActive = false;
  function render(now) {
    const active = !!state.active && built;
    if (!active) {
      if (!cleared) { renderer.clear(); cleared = true; }
      lastActive = false;
      return;
    }
    if (!lastActive) { lastActive = true; place(); }
    cleared = false;
    const time = now / 1000;
    const curl = clamp(state.curl, 0, 1);
    const dissolve = clamp(state.dissolve, 0, 1);
    const night = smooth(0, 0.5, state.reveal || 0);
    hands.forEach((h, idx) => {
      const reach = h.back ? state.reachB : state.reachA;
      setRoot(h, reach, time, idx * 2.1, curl);
      pose(h, POSES.open, h.back ? POSES.grip : POSES.hold, curl);
      h.group.updateMatrixWorld(true);
      h.skeleton.update();
      h.boneArr.set(h.skeleton.boneMatrices.subarray(0, rig.length * 16));
      const form = clamp(reach / 0.72, 0, 1) * (1 - dissolve);
      h.u.uForm.value = form;
      h.u.uNight.value = night;
      h.mesh.material.emissiveIntensity = 0.3 + 0.5 * night;
      const su = h.su;
      su.uTime.value = time; su.uForm.value = clamp(reach / 0.72, 0, 1); su.uDissolve.value = dissolve;
      su.uAlpha.value = clamp(state.alpha, 0, 1) * clamp(reach / 0.25, 0, 1); su.uNight.value = night;
    });
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(render);
  document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : render));

  return {
    renderer, scene, state, ready, tune,
    settle: () => { render(performance.now()); },
    relayout: place,
  };
}
