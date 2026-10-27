/* Just Cooked — the reach (v10).
   Two real 3D hands for the Support passage. A hand is modelled as a smooth surface:
   a tapered, gently domed palm, a thumb pad and a heel pad, fingers swept along smooth
   curves, a slim wrist and a forearm, all melted together and turned into a mesh with
   marching cubes at load, then smoothed and skinned to a small skeleton. From then on it
   is an ordinary skinned mesh: one hand rises from below reaching for help, the other
   comes across and closes around it, and the first closes back. They condense out of
   (and fray back into) stardust through a noise threshold in the fragment shader, with
   a few hundred stars riding on the skin. Lit warm, on its own transparent canvas. */

import * as THREE from 'three';
import { edgeTable, triTable } from 'three/addons/objects/MarchingCubes.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const DEG = Math.PI / 180;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* ---------------------------------------------------------------- the hand
   A left hand in its own frame: wrist at the origin, fingers along +x, thumb toward +y, palm facing +z.
   Units are palm widths. Finger joints take pose angles (degrees about the finger's own y axis,
   negative curls toward the palm), scaled by the finger's `w`. */
const FINGERS = [
  { k: [1.01, 0.325], dir: 12, ph: [0.36, 0.26, 0.21], r: [0.105, 0.07], w: 0.9 },
  { k: [1.08, 0.077], dir: 1, ph: [0.4, 0.3, 0.23], r: [0.11, 0.074], w: 1.0 },
  { k: [1.02, -0.158], dir: -9, ph: [0.37, 0.28, 0.22], r: [0.105, 0.07], w: 1.05 },
  { k: [0.886, -0.369], dir: -19, ph: [0.3, 0.21, 0.17], r: [0.092, 0.062], w: 1.1 },
];
const THUMB = { base: [0.16, 0.27, 0.05], dirZ: 58, dirY: -12, bend: [-14, -12], ph: [0.5, 0.3, 0.26], r: [0.125, 0.08] };
const POSES = {
  open: { f: [-8, -12, -6], t: [-4, -4, -6, -4] },            // reaching, relaxed: knuckle, middle, tip; thumb: [z, y] at the base, then two bends
  hold: { f: [-12, -18, -10], t: [-8, 6, -8, -6] },           // the reaching hand closes a little, fingers still showing
  grip: { f: [-38, -64, -40], t: [20, 12, -6, -4] },          // the helping hand closes round the reaching palm's far edge, thumb spread flat across it
};
/* the staging, in palm widths and degrees: tweakable from the dev page.
   The reaching hand (them: a right hand, palm toward us) comes up from the lower left; the helping hand
   (us: a right hand, palm toward it) comes down from the upper right, turns at the wrist to lie across the
   reaching palm with its knuckles at the far edge, and closes round it. */
const TUNE = {
  aAngle: 32,      // the reaching hand's finger direction (degrees, counter-clockwise from +x): up and to the right
  bAngle: 268,     // the helping hand's finger direction: down across the reaching palm
  bArm: 44,        // the helping forearm runs off toward this direction (up and to the right); the wrist bends to match
  bAlong: 0.0,     // the helping palm centre, from the reaching palm centre: along the reaching fingers...
  bAcross: -0.02,  // ...and along the helping fingers (so its knuckles sit on the far edge)
  bZ: 0.27,        // ...and toward us
  bRoll: -8,       // the helping hand rolls about its fingers: negative shows a little more of its thumb side
  sizeK: 0.17,     // palm width as a share of the viewport height (phones are capped by their width instead)
  holdK: 1,        // scale of the reaching hand's closing
  gripK: 1,        // scale of the helping hand's grip
};
const THEM = { arm: 0xa77fe0, palm: 0xc49af0, tip: 0xf0cdfb, emissive: 0x4a2a7a, stars: 170 }; // the hand reaching for help
const US = { arm: 0x4c40cf, palm: 0x6d5ae6, tip: 0xa492f8, emissive: 0x2a1e86, stars: 340 };  // the hand that comes to take it
const GRAD_LO = -2.05, GRAD_SPAN = 4.1; // where along the hand a point sits: 0 at the arm's end, 1 at the fingertips

/* bones: 0 = the palm (with the wrist and the pads), 1 = the forearm (so the wrist can turn); then 3 per
   finger, 3 for the thumb */
function buildSkeleton(pose) {
  const root = new THREE.Bone();
  const fore = new THREE.Bone();
  fore.position.set(-0.05, 0, 0);
  root.add(fore);
  const bones = [root, fore];
  const chains = [];
  FINGERS.forEach((f) => {
    let parent = root;
    const chain = [];
    f.ph.forEach((len, j) => {
      const b = new THREE.Bone();
      if (j === 0) { b.position.set(f.k[0], f.k[1], 0); b.rotation.set(0, pose.f[0] * f.w * DEG, f.dir * DEG, 'ZYX'); }
      else { b.position.set(f.ph[j - 1], 0, 0); b.rotation.set(0, pose.f[j] * f.w * DEG, 0, 'ZYX'); }
      parent.add(b); bones.push(b); chain.push(b); parent = b;
    });
    chains.push({ def: f, bones: chain });
  });
  const tc = [];
  let parent = root;
  THUMB.ph.forEach((len, j) => {
    const b = new THREE.Bone();
    if (j === 0) { b.position.set(THUMB.base[0], THUMB.base[1], THUMB.base[2]); b.rotation.set(0, (THUMB.dirY + pose.t[1]) * DEG, (THUMB.dirZ + pose.t[0]) * DEG, 'ZYX'); }
    else { b.position.set(THUMB.ph[j - 1], 0, 0); b.rotation.set(0, pose.t[j + 1] * DEG, THUMB.bend[j - 1] * DEG, 'ZYX'); }
    parent.add(b); bones.push(b); tc.push(b); parent = b;
  });
  chains.push({ def: { ph: THUMB.ph, r: THUMB.r }, bones: tc, thumb: true });
  root.updateMatrixWorld(true);
  return { root, fore, bones, chains };
}
function posePose(sk, pose, k) {
  sk.chains.forEach((c) => {
    c.bones.forEach((b, j) => {
      if (c.thumb) {
        if (j === 0) b.rotation.set(0, (THUMB.dirY + pose.t[1] * k) * DEG, (THUMB.dirZ + pose.t[0] * k) * DEG, 'ZYX');
        else b.rotation.set(0, pose.t[j + 1] * k * DEG, THUMB.bend[j - 1] * DEG, 'ZYX');
      } else {
        const f = c.def;
        if (j === 0) b.rotation.set(0, pose.f[0] * f.w * k * DEG, f.dir * DEG, 'ZYX');
        else b.rotation.set(0, pose.f[j] * f.w * k * DEG, 0, 'ZYX');
      }
    });
  });
}

/* ---------------------------------------------------------------- the surface */
function smin(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }
const segDist = (px, py, pz, ax, ay, az, bx, by, bz) => {
  const dx = bx - ax, dy = by - ay, dz = bz - az;
  const l2 = dx * dx + dy * dy + dz * dz || 1e-9;
  const t = clamp(((px - ax) * dx + (py - ay) * dy + (pz - az) * dz) / l2, 0, 1);
  return Math.hypot(px - ax - dx * t, py - ay - dy * t, pz - az - dz * t);
};

/* the pieces of the hand as signed-distance functions over hand space, each with the box it can reach */
function buildPrims(sk) {
  const prims = [];
  const v = new THREE.Vector3();
  // the palm: a rounded slab, narrower at the wrist, a little thicker along its middle
  prims.push({ k: 0.1, box: [-0.1, 1.2, -0.62, 0.62, -0.3, 0.3], f: (x, y, z) => {
    const t = clamp((x - 0.05) / 0.95, 0, 1);
    const hy = 0.4 * (0.8 + 0.2 * t);
    const dome = 1 + 0.3 * (1 - clamp((y / hy) * (y / hy), 0, 1));
    const qx = Math.abs(x - 0.56) - 0.47, qy = Math.abs(y) - hy, qz = Math.abs(z / dome) - 0.035;
    const mx = Math.max(qx, 0), my = Math.max(qy, 0), mz = Math.max(qz, 0);
    return Math.hypot(mx, my, mz) + Math.min(Math.max(qx, qy, qz), 0) - 0.085;
  } });
  // pads: the thumb's muscle and the heel of the hand
  const ell = (cx, cy, cz, rx, ry, rz, k) => prims.push({ k, box: [cx - rx - 0.2, cx + rx + 0.2, cy - ry - 0.2, cy + ry + 0.2, cz - rz - 0.2, cz + rz + 0.2], f: (x, y, z) => {
    const nx = (x - cx) / rx, ny = (y - cy) / ry, nz = (z - cz) / rz;
    return (Math.hypot(nx, ny, nz) - 1) * Math.min(rx, ry, rz);
  } });
  ell(0.32, 0.24, 0.02, 0.26, 0.16, 0.13, 0.12);
  ell(0.4, -0.33, 0.0, 0.36, 0.17, 0.125, 0.1);
  // the wrist and the forearm
  const cap = (ax, ay, az, bx, by, bz, r0, r1, flat, k) => {
    const R = Math.max(r0, r1) + 0.2;
    prims.push({ k, box: [Math.min(ax, bx) - R, Math.max(ax, bx) + R, Math.min(ay, by) - R, Math.max(ay, by) + R, Math.min(az, bz) - R, Math.max(az, bz) + R], f: (x, y, z) => {
      const dx = bx - ax, dy = by - ay, dz = bz - az, l2 = dx * dx + dy * dy + dz * dz || 1e-9;
      const t = clamp(((x - ax) * dx + (y - ay) * dy + (z - az) * dz) / l2, 0, 1);
      return Math.hypot(x - ax - dx * t, y - ay - dy * t, (z - az - dz * t) / flat) - lerp(r0, r1, t);
    } });
  };
  cap(0.0, 0, 0, -0.42, 0, 0, 0.27, 0.27, 0.62, 0.12);
  cap(-0.3, 0, 0, -2.05, 0, 0, 0.27, 0.34, 0.76, 0.1);
  // fingers and thumb: each a smooth curve through its joints (the posed chain), swept with a tapering radius
  sk.chains.forEach((c) => {
    const joints = [];
    c.bones.forEach((b, j) => { joints.push(v.set(0, 0, 0).applyMatrix4(b.matrixWorld).clone()); if (j === c.bones.length - 1) joints.push(v.set(c.def.ph[j], 0, 0).applyMatrix4(b.matrixWorld).clone()); });
    // a little of the metacarpal behind the knuckle so the finger roots into the palm
    const back = joints[0].clone().sub(joints[1]).normalize().multiplyScalar(0.22).add(joints[0]);
    let pts = [back, joints[0], joints[1], joints[2], joints[3]];
    for (let it = 0; it < 3; it++) { // corner cutting keeps the ends and rounds the joints
      const out = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        out.push(pts[i].clone().lerp(pts[i + 1], 0.25), pts[i].clone().lerp(pts[i + 1], 0.75));
      }
      out.push(pts[pts.length - 1]);
      pts = out;
    }
    let total = 0;
    const cum = [0];
    for (let i = 1; i < pts.length; i++) { total += pts[i].distanceTo(pts[i - 1]); cum.push(total); }
    const r0 = c.def.r[0], r1 = c.def.r[1], flat = c.thumb ? 0.95 : 0.92, k = c.thumb ? 0.1 : 0.07;
    const start = 0.22 / total; // the rooted part keeps the base radius
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const ta = Math.max(0, (cum[i] / total - start) / (1 - start)), tb = Math.max(0, (cum[i + 1] / total - start) / (1 - start));
      const ra = lerp(r0, r1, Math.pow(ta, 0.85)), rb = lerp(r0, r1, Math.pow(tb, 0.85));
      cap(a.x, a.y, a.z, b.x, b.y, b.z, ra, rb, flat, k);
    }
  });
  return prims;
}

const CORNER = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
const EDGE = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];

function buildSurface(sk, grid, bounds) {
  const prims = buildPrims(sk);
  const [nx, ny, nz] = grid;
  const lo = bounds.min, hi = bounds.max;
  const dx = (hi[0] - lo[0]) / (nx - 1), dy = (hi[1] - lo[1]) / (ny - 1), dz = (hi[2] - lo[2]) / (nz - 1);
  const sdf = new Float32Array(nx * ny * nz).fill(10);
  prims.forEach((p) => {
    const [x0, x1, y0, y1, z0, z1] = p.box;
    const i0 = clamp(Math.floor((x0 - lo[0]) / dx), 1, nx - 2), i1 = clamp(Math.ceil((x1 - lo[0]) / dx), 1, nx - 2);
    const j0 = clamp(Math.floor((y0 - lo[1]) / dy), 1, ny - 2), j1 = clamp(Math.ceil((y1 - lo[1]) / dy), 1, ny - 2);
    const k0 = clamp(Math.floor((z0 - lo[2]) / dz), 1, nz - 2), k1 = clamp(Math.ceil((z1 - lo[2]) / dz), 1, nz - 2);
    for (let k = k0; k <= k1; k++) {
      const z = lo[2] + k * dz;
      for (let j = j0; j <= j1; j++) {
        const y = lo[1] + j * dy;
        let q = k * nx * ny + j * nx + i0;
        for (let i = i0; i <= i1; i++, q++) sdf[q] = smin(sdf[q], p.f(lo[0] + i * dx, y, z), p.k);
      }
    }
  });
  // marching cubes: a vertex wherever an edge crosses the surface, normals from the gradient
  const at = (i, j, k) => sdf[k * nx * ny + j * nx + i];
  const grad = (i, j, k, out) => {
    out[0] = (at(Math.min(i + 1, nx - 1), j, k) - at(Math.max(i - 1, 0), j, k)) / dx;
    out[1] = (at(i, Math.min(j + 1, ny - 1), k) - at(i, Math.max(j - 1, 0), k)) / dy;
    out[2] = (at(i, j, Math.min(k + 1, nz - 1)) - at(i, j, Math.max(k - 1, 0))) / dz;
  };
  const positions = [], normals = [];
  const val = new Float32Array(8), vx = new Float32Array(36), vn = new Float32Array(36);
  const ga = [0, 0, 0], gb = [0, 0, 0];
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let cube = 0;
    for (let c = 0; c < 8; c++) {
      val[c] = -at(i + CORNER[c][0], j + CORNER[c][1], k + CORNER[c][2]);
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
      for (let q = 0; q < 3; q++) {
        const e = triTable[o + q];
        positions.push(vx[e * 3], vx[e * 3 + 1], vx[e * 3 + 2]);
        normals.push(vn[e * 3], vn[e * 3 + 1], vn[e * 3 + 2]);
      }
    }
  }
  let geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo = mergeVertices(geo, 1e-4);
  // two passes of gentle smoothing take the grid's ripple out of the skin
  const pos = geo.attributes.position, n = pos.count, idx = geo.index.array;
  const nb = new Array(n).fill(null).map(() => []);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2];
    nb[a].push(b, c); nb[b].push(a, c); nb[c].push(a, b);
  }
  const src = pos.array, tmp = new Float32Array(src.length);
  for (let pass = 0; pass < 2; pass++) {
    for (let v = 0; v < n; v++) {
      const list = nb[v];
      if (!list.length) { tmp[v * 3] = src[v * 3]; tmp[v * 3 + 1] = src[v * 3 + 1]; tmp[v * 3 + 2] = src[v * 3 + 2]; continue; }
      let sx = 0, sy = 0, sz = 0;
      for (let m = 0; m < list.length; m++) { const w = list[m] * 3; sx += src[w]; sy += src[w + 1]; sz += src[w + 2]; }
      const inv = 1 / list.length;
      tmp[v * 3] = lerp(src[v * 3], sx * inv, 0.5); tmp[v * 3 + 1] = lerp(src[v * 3 + 1], sy * inv, 0.5); tmp[v * 3 + 2] = lerp(src[v * 3 + 2], sz * inv, 0.5);
    }
    src.set(tmp);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  // skinning: each vertex follows the two nearest bones; the palm, pads and wrist belong to the root, the forearm to its own bone
  const v = new THREE.Vector3();
  const chords = [
    { bone: 0, f: (x, y, z) => Math.min(...prims.slice(0, 4).map((p) => p.f(x, y, z))) },
    { bone: 1, f: (x, y, z) => prims[4].f(x, y, z) },
  ];
  sk.chains.forEach((c) => c.bones.forEach((b, j) => {
    const a = v.set(0, 0, 0).applyMatrix4(b.matrixWorld).clone(), e = v.set(c.def.ph[j], 0, 0).applyMatrix4(b.matrixWorld).clone();
    const r = lerp(c.def.r[0], c.def.r[1], (j + 0.5) / 3);
    chords.push({ bone: sk.bones.indexOf(b), f: (x, y, z) => segDist(x, y, z, a.x, a.y, a.z, e.x, e.y, e.z) - r });
  }));
  const skinIndex = new Uint16Array(n * 4), skinWeight = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    let b1 = 0, d1 = 1e9, b2 = 0, d2 = 1e9;
    for (let c = 0; c < chords.length; c++) {
      const d = chords[c].f(x, y, z);
      if (d < d1) { b2 = b1; d2 = d1; b1 = chords[c].bone; d1 = d; } else if (d < d2) { b2 = chords[c].bone; d2 = d; }
    }
    const w2 = Math.exp(-(d2 - d1) / 0.04), s = 1 + w2;
    skinIndex[i * 4] = b1; skinIndex[i * 4 + 1] = b2;
    skinWeight[i * 4] = 1 / s; skinWeight[i * 4 + 1] = w2 / s;
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
  return geo;
}
/* a copy of the hand in its own colours, running from the arm to the fingertips */
function coloured(geo, c) {
  const g = geo.clone();
  const pos = g.attributes.position, n = pos.count, color = new Float32Array(n * 3);
  const cArm = new THREE.Color(c.arm), cPalm = new THREE.Color(c.palm), cTip = new THREE.Color(c.tip), cTmp = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const gg = clamp((pos.getX(i) - GRAD_LO) / GRAD_SPAN, 0, 1);
    cTmp.copy(cArm).lerp(cPalm, smooth(0.3, 0.6, gg)).lerp(cTip, smooth(0.68, 1.0, gg));
    color[i * 3] = cTmp.r; color[i * 3 + 1] = cTmp.g; color[i * 3 + 2] = cTmp.b;
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
  return g;
}

/* ---------------------------------------------------------------- materials */
const NOISE = [
  'float hash3(vec3 p) { p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }',
  'float vnoise(vec3 x) { vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);',
  '  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),',
  '             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z); }',
].join('\n');

function makeSkinMaterial(u, emissive) {
  const mat = new THREE.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.55, metalness: 0, envMapIntensity: 0.7,
    sheen: 1.0, sheenRoughness: 0.45, sheenColor: new THREE.Color(0xffc4b4),
    clearcoat: 0.25, clearcoatRoughness: 0.55,
    emissive: new THREE.Color(emissive), emissiveIntensity: 0.3,
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
        'float g = clamp((vBind.x + 2.05) / 4.1, 0.0, 1.0);',
        'float arm = 1.0 - smoothstep(0.0, 0.5, g);',
        'float th = uForm * 1.14 - 0.07 - arm * arm * 1.25;',
        'if (n > th) discard;',
        'float edge = smoothstep(th - 0.16, th, n);',
        'totalEmissiveRadiance += uGlow * edge * (0.9 + uNight);',
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
  '  float g = clamp((position.x + 2.05) / 4.1, 0.0, 1.0);',
  '  float tail = 1.0 - smoothstep(0.05, 0.34, g);',
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
  const key = new THREE.DirectionalLight(0xffd9bc, 2.3); key.position.set(-600, 900, 1200); scene.add(key);
  const fill = new THREE.DirectionalLight(0x9fb4ff, 0.8); fill.position.set(900, -300, 700); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xcdbcff, 1.5); rim.position.set(500, 600, -900); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xdcd2ff, 0x1e1848, 0.5));

  let tune = Object.assign({}, TUNE, state.tune || {}); // the page may set state.tune per breakpoint before relayout()
  const mobile = () => (canvas.clientWidth || innerWidth) < 900;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const hands = [];
  let built = false, boneCount = 16;

  const makeHand = (geo, seed, back, look) => {
    const group = new THREE.Group();
    group.matrixAutoUpdate = false;
    const sk = buildSkeleton(POSES.open);
    group.add(sk.root);
    sk.root.updateMatrixWorld(true);
    const skeleton = new THREE.Skeleton(sk.bones);
    const u = { uForm: { value: 0 }, uNight: { value: 0 }, uGlow: { value: new THREE.Vector3(0.82, 0.74, 1.0) } };
    const mesh = new THREE.SkinnedMesh(geo, makeSkinMaterial(u, look.emissive));
    mesh.frustumCulled = false;
    group.add(mesh);
    mesh.bind(skeleton);
    scene.add(group);
    // stars that ride on the surface, skinned by the same bones
    let s = seed >>> 0;
    const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const n = look.stars, pos = geo.attributes.position, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight;
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
    const boneArr = new Float32Array(sk.bones.length * 16);
    const su = { uBones: { value: boneArr }, uTime: { value: 0 }, uForm: { value: 0 }, uDissolve: { value: 0 }, uAlpha: { value: 0 }, uPR: { value: dpr }, uD: { value: 1000 }, uNight: { value: 0 } };
    const stars = new THREE.Points(sg, new THREE.ShaderMaterial({ defines: { BONES: sk.bones.length }, uniforms: su, vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, transparent: true, depthTest: true, depthWrite: false, premultipliedAlpha: true }));
    stars.frustumCulled = false;
    scene.add(stars);
    return { group, mesh, skeleton, sk, u, stars, su, boneArr, back, root: new THREE.Matrix4(), rot: new THREE.Matrix4(), from: new THREE.Vector3(), rest: new THREE.Vector3() };
  };

  const build = () => {
    const sk = buildSkeleton(POSES.open);
    const fine = !mobile();
    const geo = buildSurface(sk, fine ? [172, 86, 42] : [130, 66, 32], { min: [-2.2, -0.78, -0.42], max: [2.2, 1.3, 0.58] });
    boneCount = sk.bones.length;
    hands.push(makeHand(coloured(geo, THEM), 11, false, THEM), makeHand(coloured(geo, US), 29, true, US)); // them reaching, us helping
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
    place();
  };
  /* the staging: state.cx/cy (stage fractions, y down) is the centre of the reaching palm; see TUNE. */
  const place = () => {
    tune = Object.assign({}, TUNE, state.tune || {});
    W = clamp(Math.min(vw * 0.33, vh * tune.sizeK), 84, 200); // palm width in px
    clasp.set(((state.cx ?? 0.5) - 0.5) * vw, (0.5 - (state.cy ?? 0.66)) * vh);
    const C = new THREE.Vector3(clasp.x, clasp.y, 0);
    const diag = Math.hypot(vw, vh);
    const aDir = new THREE.Vector3(Math.cos(tune.aAngle * DEG), Math.sin(tune.aAngle * DEG), 0);
    const bDir = new THREE.Vector3(Math.cos(tune.bAngle * DEG), Math.sin(tune.bAngle * DEG), 0);
    const bArm = new THREE.Vector3(Math.cos(tune.bArm * DEG), Math.sin(tune.bArm * DEG), 0);
    hands.forEach((h) => {
      h.su.uD.value = D;
      if (!h.back) {
        h.rot.makeRotationZ(tune.aAngle * DEG);
        h.sk.fore.rotation.set(0, 0, 0);
        const palm = C.clone();
        h.rest.copy(palm).sub(new THREE.Vector3(0.56 * W, 0, 0).applyMatrix4(h.rot)); // the wrist, so the palm centre lands there
        h.from.copy(h.rest).addScaledVector(aDir, -diag * 0.8);
      } else {
        h.rot.makeRotationZ(tune.bAngle * DEG).multiply(new THREE.Matrix4().makeRotationX(Math.PI + tune.bRoll * DEG)); // palm toward the other hand
        // the forearm turns at the wrist so it runs off toward bArm (its y axis is flipped with the palm)
        h.sk.fore.rotation.set(0, 0, (180 - (tune.bArm - tune.bAngle)) * DEG);
        const palm = C.clone().addScaledVector(aDir, tune.bAlong * W).addScaledVector(bDir, tune.bAcross * W);
        palm.z = tune.bZ * W;
        h.rest.copy(palm).sub(new THREE.Vector3(0.56 * W, 0, 0).applyMatrix4(h.rot));
        h.from.copy(h.rest).addScaledVector(bArm, diag * 0.8);
      }
    });
  };
  resize();
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); });

  const _pos = new THREE.Vector3(), _dir = new THREE.Vector3(), _m = new THREE.Matrix4();
  const ease = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const setRoot = (h, reach, time, phase, curl) => {
    const e = ease(reach);
    _dir.copy(h.rest).sub(h.from);
    _pos.copy(h.from).lerp(h.rest, e);
    const L = _dir.length() || 1;
    const arc = Math.sin(e * Math.PI) * 0.05 * L * (h.back ? 1 : -1);
    _pos.x += -_dir.y / L * arc;
    _pos.y += _dir.x / L * arc;
    const own = Math.sin(time * 0.8 + phase) * 1.4 * DEG;
    const together = Math.sin(time * 0.7) * 0.9 * DEG;
    const sway = lerp(own, together, curl) * e;
    const bob = lerp(Math.sin(time * 1.1 + phase) * 0.03, Math.sin(time * 0.9) * 0.02, curl) * W * e;
    const settle = (1 - e) * (h.back ? -10 : 8) * DEG;
    _pos.y += bob;
    h.root.makeTranslation(_pos.x, _pos.y, _pos.z);
    h.root.multiply(_m.makeRotationZ(sway + settle));
    h.root.multiply(h.rot);
    h.root.multiply(_m.makeScale(W, W, W));
    h.group.matrix.copy(h.root);
    h.group.matrixWorldNeedsUpdate = true;
  };
  const blend = (a, b, t) => ({ f: a.f.map((v, i) => lerp(v, b.f[i], t)), t: a.t.map((v, i) => lerp(v, b.t[i], t)) });

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
      posePose(h.sk, blend(POSES.open, h.back ? POSES.grip : POSES.hold, curl * (h.back ? tune.gripK : tune.holdK)), 1);
      h.group.updateMatrixWorld(true);
      h.skeleton.update();
      h.boneArr.set(h.skeleton.boneMatrices.subarray(0, boneCount * 16));
      h.u.uForm.value = clamp(reach / 0.72, 0, 1) * (1 - dissolve);
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
