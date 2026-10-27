/* Just Cooked — stylised 3D food and utensils, built from primitives.
   Each maker returns a Group roughly one unit tall, centred near the origin,
   in a soft matte "clay" finish that sits well on the cream page. */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const clay = (hex, extra = {}) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.62, metalness: 0, ...extra });
export const M = {
  red: clay(0xE24D2A), orange: clay(0xF07F2E), yolk: clay(0xF2B134), white: clay(0xFBF6EC), cream: clay(0xF5EFE6),
  lemon: clay(0xF6D262), lemonIn: clay(0xFBE9A2), green: clay(0x8FAE7B), dgreen: clay(0x5E7A47), lgreen: clay(0xB9CF8E),
  tan: clay(0xD6B38C), wood: clay(0xD4A574), woodDark: clay(0xB8865A), pit: clay(0x8B5A33), ceramic: clay(0xFBF6EC, { roughness: 0.4 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xD8D6D1, metalness: 0.9, roughness: 0.28 }),
  graphite: new THREE.MeshStandardMaterial({ color: 0x3A3A3E, metalness: 0.6, roughness: 0.45 }),
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
    const r = radius * (1 + wobble * Math.sin(a * 3 + 0.8) + wobble * 0.6 * Math.cos(a * 5));
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: depth * 0.6, bevelSize: depth * 0.6, bevelSegments: 3, curveSegments: 8 });
  geo.center();
  return geo;
}

export function tomato() {
  const body = mesh(new THREE.SphereGeometry(0.42, 28, 20), M.red, 0, 0, 0, 0, 0, 0, 1, 0.9, 1);
  const stem = mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.14, 8), M.dgreen, 0, 0.42, 0);
  const g = group(body, stem);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leaf = mesh(new THREE.ConeGeometry(0.075, 0.24, 6), M.dgreen, Math.cos(a) * 0.12, 0.37, Math.sin(a) * 0.12, 0, 0, 0, 1, 1, 0.45);
    leaf.rotation.set(Math.sin(a) * 1.25, 0, -Math.cos(a) * 1.25);
    g.add(leaf);
  }
  return g;
}

export function egg() {
  const white = mesh(wobblyDisc(0.5, 0.09, 24, 0.05), M.white, 0, 0, 0, 0, 0, 0);
  const yolk = mesh(new THREE.SphereGeometry(0.21, 24, 16), M.yolk, 0.04, 0.02, 0.07, 0, 0, 0, 1, 1, 0.6);
  return group(white, yolk);
}

export function lemon() {
  const rind = mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.12, 36), M.lemon, 0, 0, 0, Math.PI / 2);
  const flesh = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.13, 36), M.lemonIn, 0, 0, 0, Math.PI / 2);
  const g = group(rind, flesh);
  for (let i = 0; i < 6; i++) {
    g.add(mesh(new THREE.BoxGeometry(0.02, 0.72, 0.14), M.white, 0, 0, 0, 0, 0, (i / 6) * Math.PI));
  }
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 12), M.white, 0, 0, 0, Math.PI / 2));
  return g;
}

export function broccoli() {
  const stem = mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.42, 10), M.lgreen, 0, -0.2, 0);
  const g = group(stem);
  const buds = [[0, 0.12, 0, 0.26], [-0.2, 0.02, 0.05, 0.2], [0.2, 0.04, 0.02, 0.21], [0.05, 0.08, -0.2, 0.19], [-0.04, 0.1, 0.2, 0.2], [0.1, 0.28, 0.06, 0.17]];
  buds.forEach(([x, y, z, r]) => g.add(mesh(new THREE.SphereGeometry(r, 18, 14), M.dgreen, x, y, z)));
  return g;
}

export function carrot() {
  const body = mesh(new THREE.ConeGeometry(0.15, 0.95, 20), M.orange, 0, -0.1, 0, Math.PI);
  const g = group(body);
  for (let i = 0; i < 3; i++) {
    g.add(mesh(new THREE.ConeGeometry(0.05, 0.34, 6), M.green, (i - 1) * 0.07, 0.5, 0, 0, 0, (i - 1) * 0.35, 1, 1, 0.5));
  }
  return g;
}

export function mushroom() {
  const cap = mesh(new THREE.SphereGeometry(0.36, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), M.tan, 0, 0.02, 0);
  const underside = mesh(new THREE.CircleGeometry(0.36, 28), M.cream, 0, 0.02, 0, -Math.PI / 2);
  const stem = mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.34, 14), M.cream, 0, -0.16, 0);
  return group(cap, underside, stem);
}

export function avocado() {
  const skin = mesh(new THREE.SphereGeometry(0.42, 28, 20), M.dgreen, 0, 0, -0.08, 0, 0, 0, 0.82, 1, 0.5);
  const flesh = mesh(new THREE.CircleGeometry(0.4, 32), M.lgreen, 0, 0, 0.13, 0, 0, 0, 0.8, 1, 1);
  const pit = mesh(new THREE.SphereGeometry(0.15, 20, 14), M.pit, 0, -0.08, 0.16);
  return group(skin, flesh, pit);
}

export function chilli() {
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.45, 0), new THREE.Vector3(0.1, -0.15, 0.02), new THREE.Vector3(0.06, 0.15, 0), new THREE.Vector3(-0.1, 0.42, 0)]);
  const tube = mesh(new THREE.TubeGeometry(curve, 24, 0.085, 10, false), M.red);
  const tip = mesh(new THREE.SphereGeometry(0.085, 12, 10), M.red, 0, -0.45, 0);
  const top = mesh(new THREE.SphereGeometry(0.085, 12, 10), M.red, -0.1, 0.42, 0);
  const stem = mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.2, 8), M.dgreen, -0.13, 0.52, 0, 0, 0, 0.5);
  return group(tube, tip, top, stem);
}

export function basil() {
  const leaf = mesh(new THREE.SphereGeometry(0.4, 24, 16), M.green, 0, 0, 0, 0, 0, 0, 0.62, 0.08, 1);
  const vein = mesh(new THREE.BoxGeometry(0.03, 0.03, 0.72), M.dgreen, 0, 0.04, 0);
  const stem = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 8), M.dgreen, 0, 0, -0.48, Math.PI / 2);
  return group(leaf, vein, stem);
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
  for (let i = 0; i < 4; i++) {
    g.add(mesh(new THREE.TorusGeometry(0.2, 0.011, 8, 36), M.metal, 0, 0.22, 0, 0, (i / 4) * Math.PI, 0, 1, 1.65, 1));
  }
  return g;
}

export function pan() {
  const body = mesh(new THREE.CylinderGeometry(0.5, 0.44, 0.16, 36, 1, true), M.graphite, 0, 0, 0);
  body.material = new THREE.MeshStandardMaterial({ color: 0x3A3A3E, metalness: 0.6, roughness: 0.45, side: THREE.DoubleSide });
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
  const b = mesh(new THREE.LatheGeometry(pts, 36), mat, 0, -0.22, 0);
  return group(b);
}

export const MAKERS = { tomato, egg, lemon, broccoli, carrot, mushroom, avocado, chilli, basil, spoon, fork, knife, whisk, pan, rollingPin, bowl };
