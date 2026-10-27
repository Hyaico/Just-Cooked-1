/* Just Cooked — stylised 3D food and utensils, built from primitives.
   Each maker returns a Group roughly one unit tall, centred near the origin,
   in a soft matte "clay" finish that sits well on the cream page. */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const clay = (hex, extra = {}) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.6, metalness: 0, ...extra });
export const M = {
  red: clay(0xE24D2A), yolk: clay(0xF2B134, { roughness: 0.42 }), white: clay(0xFBF6EC), cream: clay(0xF5EFE6),
  lemon: clay(0xF6D262), lemonIn: clay(0xFBE9A2), orange: clay(0xF0932E), orangeIn: clay(0xF9C27A),
  green: clay(0x8FAE7B), dgreen: clay(0x5E7A47), tan: clay(0xD6B38C), golden: clay(0xE0A96D), syrup: clay(0xB5753B, { roughness: 0.35 }),
  butter: clay(0xF7D56B), cheese: clay(0xF2C14E), crust: clay(0xC9955B), crumb: clay(0xF3E2B9), coffee: clay(0x4A2E1E, { roughness: 0.3 }),
  wood: clay(0xD4A574), woodDark: clay(0xB8865A), ceramic: clay(0xFBF6EC, { roughness: 0.4 }), brand: clay(0xE94B1F, { roughness: 0.45 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xD8D6D1, metalness: 0.9, roughness: 0.28 }),
  graphite: new THREE.MeshStandardMaterial({ color: 0x3A3A3E, metalness: 0.6, roughness: 0.45 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xF2F0EA, roughness: 0.15, metalness: 0.05, transparent: true, opacity: 0.85 }),
};

const mesh = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.scale.set(sx, sy, sz);
  return m;
};
const group = (...meshes) => { const g = new THREE.Group(); meshes.forEach((m) => g.add(m)); return g; };

function wobblyDisc(radius, wobble, segments, depth) {
  const shape = new THREE.Shape();
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const r = radius * (1 + wobble * Math.sin(a * 3 + 0.8) + wobble * 0.5 * Math.cos(a * 5));
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: depth * 0.7, bevelSize: depth * 0.8, bevelSegments: 4, curveSegments: 12 });
  geo.center();
  return geo;
}

export function tomato() {
  const body = mesh(new THREE.SphereGeometry(0.42, 32, 24), M.red, 0, 0, 0, 0, 0, 0, 1, 0.9, 1);
  const stem = mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.14, 8), M.dgreen, 0, 0.42, 0);
  const g = group(body, stem);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leaf = mesh(new THREE.ConeGeometry(0.07, 0.22, 6), M.dgreen, Math.cos(a) * 0.12, 0.37, Math.sin(a) * 0.12, 0, 0, 0, 1, 1, 0.45);
    leaf.rotation.set(Math.sin(a) * 1.25, 0, -Math.cos(a) * 1.25);
    g.add(leaf);
  }
  return g;
}

export function egg() {
  const white = mesh(wobblyDisc(0.5, 0.06, 40, 0.05), M.white);
  const yolk = mesh(new THREE.SphereGeometry(0.21, 28, 18), M.yolk, 0.04, 0.02, 0.07, 0, 0, 0, 1, 1, 0.62);
  return group(white, yolk);
}

function citrus(rind, flesh) {
  const r = mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.12, 40), rind, 0, 0, 0, Math.PI / 2);
  const f = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.13, 40), flesh, 0, 0, 0, Math.PI / 2);
  const g = group(r, f);
  for (let i = 0; i < 6; i++) g.add(mesh(new THREE.BoxGeometry(0.02, 0.72, 0.14), M.white, 0, 0, 0, 0, 0, (i / 6) * Math.PI));
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 12), M.white, 0, 0, 0, Math.PI / 2));
  return g;
}
export function lemon() { return citrus(M.lemon, M.lemonIn); }
export function orangeSlice() { return citrus(M.orange, M.orangeIn); }

export function broccoli() {
  const stem = mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.42, 12), M.green, 0, -0.2, 0);
  const g = group(stem);
  const buds = [[0, 0.12, 0, 0.26], [-0.2, 0.02, 0.05, 0.2], [0.2, 0.04, 0.02, 0.21], [0.05, 0.08, -0.2, 0.19], [-0.04, 0.1, 0.2, 0.2], [0.1, 0.28, 0.06, 0.17], [-0.14, 0.24, -0.08, 0.15]];
  buds.forEach(([x, y, z, r]) => g.add(mesh(new THREE.SphereGeometry(r, 20, 16), M.dgreen, x, y, z)));
  return g;
}

export function mushroom() {
  const cap = mesh(new THREE.SphereGeometry(0.36, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.tan, 0, 0.02, 0);
  const underside = mesh(new THREE.CircleGeometry(0.36, 32), M.cream, 0, 0.02, 0, -Math.PI / 2);
  const stem = mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.34, 16), M.cream, 0, -0.16, 0);
  return group(cap, underside, stem);
}

export function pancakes() {
  const g = group();
  const offs = [[0, -0.2, 0.02], [0.03, -0.07, -0.02], [-0.02, 0.06, 0.01]];
  offs.forEach(([x, y, z]) => g.add(mesh(new THREE.CylinderGeometry(0.42, 0.4, 0.12, 36), M.golden, x, y, z)));
  g.add(mesh(new THREE.CylinderGeometry(0.3, 0.33, 0.03, 36), M.syrup, -0.02, 0.135, 0.01));
  g.add(mesh(new RoundedBoxGeometry(0.17, 0.09, 0.17, 2, 0.02), M.butter, 0.02, 0.19, 0.02, 0, 0.4, 0));
  return g;
}

export function mug() {
  const body = mesh(new THREE.CylinderGeometry(0.3, 0.27, 0.52, 36), M.ceramic, 0, 0, 0);
  const band = mesh(new THREE.CylinderGeometry(0.305, 0.3, 0.1, 36), M.brand, 0, 0.19, 0);
  const coffee = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.02, 36), M.coffee, 0, 0.25, 0);
  const handle = mesh(new THREE.TorusGeometry(0.15, 0.045, 12, 28), M.ceramic, 0.33, 0, 0);
  return group(body, band, coffee, handle);
}

export function cheese() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.45, -0.25); shape.lineTo(0.45, -0.25); shape.lineTo(0.1, 0.32); shape.closePath();
  const wedge = mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 }), M.cheese, 0, 0, -0.15);
  const g = group(wedge);
  [[-0.1, -0.05], [0.15, -0.12], [0.02, 0.08]].forEach(([x, y]) => g.add(mesh(new THREE.SphereGeometry(0.05, 12, 10), M.yolk, x, y, 0.19)));
  return g;
}

export function bread() {
  const crust = mesh(new RoundedBoxGeometry(0.72, 0.64, 0.14, 3, 0.1), M.crust);
  const crumb = mesh(new RoundedBoxGeometry(0.6, 0.52, 0.15, 3, 0.08), M.crumb, 0, -0.02, 0);
  const top = mesh(new THREE.SphereGeometry(0.2, 20, 14), M.crust, -0.16, 0.3, 0, 0, 0, 0, 1, 0.6, 0.35);
  const top2 = mesh(new THREE.SphereGeometry(0.2, 20, 14), M.crust, 0.16, 0.3, 0, 0, 0, 0, 1, 0.6, 0.35);
  return group(crust, crumb, top, top2);
}

export function saltShaker() {
  const body = mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.46, 24), M.glass, 0, -0.08, 0);
  const salt = mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.3, 24), M.white, 0, -0.15, 0);
  const cap = mesh(new THREE.CylinderGeometry(0.18, 0.17, 0.12, 24), M.metal, 0, 0.21, 0);
  const g = group(body, salt, cap);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 8), M.graphite, Math.cos(a) * 0.08, 0.275, Math.sin(a) * 0.08));
  }
  return g;
}

export function spoon() {
  const bowl = mesh(new THREE.SphereGeometry(0.22, 24, 16), M.metal, 0, 0.38, 0, 0, 0, 0, 1, 0.42, 1.25);
  const neck = mesh(new RoundedBoxGeometry(0.07, 0.2, 0.03, 2, 0.01), M.metal, 0, 0.1, 0);
  const handle = mesh(new RoundedBoxGeometry(0.1, 0.78, 0.035, 2, 0.015), M.metal, 0, -0.34, 0);
  return group(bowl, neck, handle);
}

export function fork() {
  const handle = mesh(new RoundedBoxGeometry(0.1, 0.74, 0.035, 2, 0.015), M.metal, 0, -0.32, 0);
  const neck = mesh(new RoundedBoxGeometry(0.26, 0.16, 0.03, 2, 0.012), M.metal, 0, 0.12, 0);
  const g = group(handle, neck);
  for (let i = 0; i < 4; i++) g.add(mesh(new RoundedBoxGeometry(0.04, 0.38, 0.03, 1, 0.012), M.metal, -0.1 + i * 0.0667, 0.37, 0));
  return g;
}

export function knife() {
  const handle = mesh(new RoundedBoxGeometry(0.12, 0.5, 0.055, 2, 0.02), M.graphite, 0, -0.42, 0);
  const shape = new THREE.Shape();
  shape.moveTo(-0.07, 0); shape.lineTo(0.07, 0); shape.lineTo(0.08, 0.55); shape.lineTo(-0.02, 0.82); shape.lineTo(-0.07, 0.6); shape.closePath();
  const blade = mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 }), M.metal, 0, -0.17, -0.009);
  return group(handle, blade);
}

export function whisk() {
  const handle = mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.55, 12), M.wood, 0, -0.4, 0);
  const collar = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), M.metal, 0, -0.1, 0);
  const g = group(handle, collar);
  for (let i = 0; i < 4; i++) g.add(mesh(new THREE.TorusGeometry(0.2, 0.011, 8, 36), M.metal, 0, 0.22, 0, 0, (i / 4) * Math.PI, 0, 1, 1.65, 1));
  return g;
}

export function pan() {
  const side = new THREE.MeshStandardMaterial({ color: 0x3A3A3E, metalness: 0.6, roughness: 0.45, side: THREE.DoubleSide });
  const body = mesh(new THREE.CylinderGeometry(0.5, 0.44, 0.16, 36, 1, true), side, 0, 0, 0);
  const floor = mesh(new THREE.CircleGeometry(0.44, 36), M.graphite, 0, -0.07, 0, -Math.PI / 2);
  const rim = mesh(new THREE.TorusGeometry(0.5, 0.02, 8, 48), M.graphite, 0, 0.08, 0, Math.PI / 2);
  const handle = mesh(new RoundedBoxGeometry(0.14, 0.62, 0.05, 2, 0.02), M.graphite, 0.78, 0.06, 0, 0, 0, Math.PI / 2);
  const grip = mesh(new RoundedBoxGeometry(0.16, 0.3, 0.06, 2, 0.025), M.wood, 1.0, 0.06, 0, 0, 0, Math.PI / 2);
  return group(body, floor, rim, handle, grip);
}

export function rollingPin() {
  const roller = mesh(new THREE.CylinderGeometry(0.17, 0.17, 1.0, 24), M.wood, 0, 0, 0, 0, 0, Math.PI / 2);
  const h1 = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.26, 12), M.woodDark, 0.63, 0, 0, 0, 0, Math.PI / 2);
  const h2 = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.26, 12), M.woodDark, -0.63, 0, 0, 0, 0, Math.PI / 2);
  return group(roller, h1, h2);
}

export function bowl() {
  const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(0.28, 0), new THREE.Vector2(0.4, 0.05), new THREE.Vector2(0.5, 0.2), new THREE.Vector2(0.54, 0.4), new THREE.Vector2(0.55, 0.44)];
  const mat = new THREE.MeshStandardMaterial({ color: 0xFBF6EC, roughness: 0.4, metalness: 0, side: THREE.DoubleSide });
  return group(mesh(new THREE.LatheGeometry(pts, 36), mat, 0, -0.22, 0));
}

export const MAKERS = { tomato, egg, lemon, orangeSlice, broccoli, mushroom, pancakes, mug, cheese, bread, saltShaker, spoon, fork, knife, whisk, pan, rollingPin, bowl };
