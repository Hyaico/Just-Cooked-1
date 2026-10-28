/* Just Cooked — the shooting star (v14).
   One wish, one star. The head (a bright core, a corona, a halo and four soft rays) runs a
   gentle arc from well off the left edge to well off the right. As it goes it sheds light:
   a soft glowing cloud, a hair-thin bright streak and sparks. Each particle is born where
   the head was at its own moment, drifts on a little, spreads and fades over its own
   lifetime, so the trail lingers behind the star and dissolves into the night instead of
   travelling with it. Everything comes from one clock in the vertex shader: two draw calls
   (the trail as points, the head as one small quad) on the play's second transparent
   canvas, drawn only while the star is up. */

import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

const BEZ = [
  'uniform vec2 uP0, uP1, uC;',
  'vec2 bez(float s) { float u = 1.0 - s; return u * u * uP0 + 2.0 * u * s * uC + s * s * uP1; }',
  'vec2 dbez(float s) { return 2.0 * (1.0 - s) * (uC - uP0) + 2.0 * s * (uP1 - uC); }',
].join('\n');

// kinds: 0 the soft cloud, 1 the bright streak, 2 sparks
const TRAIL_VERT = [
  BEZ,
  'uniform float uSec, uDur, uTime, uPR, uAlpha, uScale;',
  'uniform vec2 uEmit;',
  'attribute float aBirth, aLife, aSeed, aSize, aKind, aSpread;',
  'attribute vec2 aVel;',
  'varying float vAlpha, vKind; varying vec3 vColor;',
  'void main() {',
  '  float sb = mix(uEmit.x, uEmit.y, aBirth);', // where on the arc this particle was shed
  '  float age = uSec - sb * uDur;', // seconds since the head passed that point
  '  float k = age / aLife;',
  '  vKind = aKind;',
  '  if (age < 0.0 || k >= 1.0) { vAlpha = 0.0; vColor = vec3(0.0); gl_PointSize = 0.0; gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }',
  '  vec2 d = dbez(sb);',
  '  float dl = max(length(d), 1e-4);',
  '  vec2 tg = d / dl; vec2 nm = vec2(-tg.y, tg.x);',
  '  float speed = dl / uDur;', // how fast the head was going, px per second
  '  vec2 p = bez(sb);',
  '  float a; float size; vec3 col;',
  '  if (aKind < 0.5) {', // the cloud: carried on a little, then it slows, spreads and swells as it fades
  '    p += tg * speed * 0.1 * (1.0 - exp(-age / 0.45)) + nm * aSpread * uScale * (5.0 + 30.0 * k);',
  '    a = 0.09 * smoothstep(0.0, 0.08, age) * pow(1.0 - k, 1.5);',
  '    size = aSize * uScale * (0.75 + 0.95 * k);',
  '    col = mix(vec3(0.82, 0.76, 1.0), vec3(0.5, 0.4, 0.95), k);',
  '  } else if (aKind < 1.5) {', // the streak: a hair-thin bright line just behind the head
  '    p += tg * speed * 0.08 * (1.0 - exp(-age / 0.2)) + nm * aSpread * uScale * 1.5;',
  '    a = 0.85 * pow(1.0 - k, 2.0);',
  '    size = aSize * uScale * (1.0 - 0.5 * k);',
  '    col = mix(vec3(1.0), vec3(0.85, 0.8, 1.0), k);',
  '  } else {', // sparks: thrown off, pulled down, twinkling out
  '    p += (tg * speed * 0.12 + aVel * uScale) * age + vec2(0.0, -75.0 * uScale) * age * age;',
  '    float tw = 0.55 + 0.45 * sin(uTime * (6.0 + aSeed * 10.0) + aSeed * 60.0);',
  '    a = 0.8 * tw * (1.0 - k);',
  '    size = aSize * uScale * (1.0 - 0.5 * k);',
  '    col = vec3(0.96, 0.93, 1.0);',
  '  }',
  '  vAlpha = a * uAlpha; vColor = col;',
  '  gl_PointSize = size * uPR;',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);',
  '}',
].join('\n');
const TRAIL_FRAG = [
  'precision highp float;',
  'varying float vAlpha, vKind; varying vec3 vColor;',
  'void main() {',
  '  vec2 c = gl_PointCoord - 0.5;',
  '  float r = length(c) * 2.0;',
  '  if (r > 1.0 || vAlpha <= 0.0) discard;',
  '  float a = vKind < 0.5 ? exp(-r * r * 2.6) * (1.0 - smoothstep(0.7, 1.0, r)) : (1.0 - r) * (1.0 - r);',
  '  a = clamp(a, 0.0, 1.0) * vAlpha;',
  '  gl_FragColor = vec4(vColor * a, a);',
  '}',
].join('\n');

// the head: one quad that rides the arc, painted with a core, a corona, a wide halo and four soft rays
const HEAD_VERT = [
  BEZ,
  'uniform float uS, uScale, uSize;',
  'varying vec2 vQ;',
  'void main() {',
  '  vQ = position.xy;',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(bez(uS) + position.xy * uSize * uScale, 0.0, 1.0);',
  '}',
].join('\n');
const HEAD_FRAG = [
  'precision highp float;',
  'uniform float uS, uOn, uTime, uAlpha;',
  'varying vec2 vQ;',
  'void main() {',
  '  float r = length(vQ);',
  '  float ends = smoothstep(0.0, 0.03, uS) * (1.0 - smoothstep(0.97, 1.0, uS));',
  '  float breathe = 1.0 + 0.1 * sin(uTime * 7.0);',
  '  float core = exp(-r * r * 160.0);',
  '  float corona = 0.55 * exp(-r * r * 28.0);',
  '  float halo = 0.3 * exp(-r * r * 4.2 / breathe);',
  '  float rays = (0.9 * exp(-abs(vQ.y) * 70.0 - abs(vQ.x) * 2.4) + 0.55 * exp(-abs(vQ.x) * 70.0 - abs(vQ.y) * 5.0)) * (1.0 - smoothstep(0.45, 1.0, r));',
  '  float k = uAlpha * uOn * ends;',
  '  vec3 col = vec3(1.0) * (core + corona) + vec3(0.72, 0.64, 1.0) * halo + vec3(0.95, 0.92, 1.0) * rays;',
  '  gl_FragColor = vec4(col * k, clamp(core + corona + halo + rays, 0.0, 1.0) * k);',
  '}',
].join('\n');

export function start(canvas, state) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance', premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  camera.position.z = 5;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const mobile = (canvas.clientWidth || innerWidth) < 900;

  // the light it sheds: births spread evenly along the visible stretch of the arc, each with its own lifetime
  const k = mobile ? 0.65 : 1;
  let s = 7;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const birth = [], life = [], seed = [], size = [], kind = [], spread = [], vel = [], pos = [];
  const add = (count, kindId, sz, lf) => {
    for (let i = 0; i < Math.round(count * k); i++) {
      birth.push(rnd()); life.push(lerp(lf[0], lf[1], rnd())); seed.push(rnd()); kind.push(kindId);
      size.push(lerp(sz[0], sz[1], rnd())); spread.push(rnd() * 2 - 1);
      vel.push(-(20 + rnd() * 60), (rnd() * 2 - 1) * 70); // sparks are thrown back and out
      pos.push(0, 0, 0);
    }
  };
  add(900, 0, [12, 26], [0.9, 1.6]); // the cloud lingers longest
  add(1100, 1, [2.2, 4.4], [0.25, 0.5]); // the streak is short and bright
  add(380, 2, [1.6, 3.6], [0.6, 1.3]); // the sparks
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aBirth', new THREE.Float32BufferAttribute(birth, 1));
  geo.setAttribute('aLife', new THREE.Float32BufferAttribute(life, 1));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
  geo.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
  geo.setAttribute('aKind', new THREE.Float32BufferAttribute(kind, 1));
  geo.setAttribute('aSpread', new THREE.Float32BufferAttribute(spread, 1));
  geo.setAttribute('aVel', new THREE.Float32BufferAttribute(vel, 2));
  const shared = {
    uP0: { value: new THREE.Vector2() }, uP1: { value: new THREE.Vector2() }, uC: { value: new THREE.Vector2() },
    uTime: { value: 0 }, uAlpha: { value: 1 }, uScale: { value: 1 },
  };
  const trail = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: Object.assign({ uPR: { value: dpr }, uSec: { value: 0 }, uDur: { value: 3.8 }, uEmit: { value: new THREE.Vector2(0, 1) } }, shared),
    vertexShader: TRAIL_VERT, fragmentShader: TRAIL_FRAG, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, premultipliedAlpha: true,
  }));
  trail.frustumCulled = false;
  const head = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: Object.assign({ uSize: { value: 230 }, uS: { value: 0 }, uOn: { value: 0 } }, shared),
    vertexShader: HEAD_VERT, fragmentShader: HEAD_FRAG, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, premultipliedAlpha: true,
  }));
  head.frustumCulled = false;
  scene.add(trail);
  scene.add(head);
  const tu = trail.material.uniforms, hu = head.material.uniforms;

  // ---- sizing: 1 world unit = 1 CSS px, origin at the stage centre, y up
  let vw = 1, vh = 1;
  const toWorld = (fx, fy) => new THREE.Vector2((fx - 0.5) * vw, (0.5 - fy) * vh);
  const place = () => {
    const path = state.path || [[-0.2, 0.3], [0.5, 0.56], [1.32, 0.4]]; // stage fractions (y down): start, control, end
    shared.uP0.value.copy(toWorld(path[0][0], path[0][1]));
    shared.uC.value.copy(toWorld(path[1][0], path[1][1]));
    shared.uP1.value.copy(toWorld(path[2][0], path[2][1]));
    shared.uScale.value = clamp(Math.min(vw, vh) / 800, 0.6, 1.15);
    if (state.emit) tu.uEmit.value.set(state.emit[0], state.emit[1]);
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

  let cleared = true;
  function render(now) {
    if (!state.active) {
      if (!cleared) { renderer.clear(); cleared = true; }
      return;
    }
    cleared = false;
    const dur = state.dur || 3.8, sec = state.sec || 0;
    tu.uSec.value = sec; tu.uDur.value = dur;
    hu.uS.value = clamp(sec / dur, 0, 1);
    hu.uOn.value = sec < dur ? 1 : 0;
    shared.uTime.value = now / 1000;
    shared.uAlpha.value = clamp(state.alpha ?? 1, 0, 1);
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(render);
  document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : render));

  return { renderer, scene, state, relayout: place, settle: () => render(performance.now()) };
}
