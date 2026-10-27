# Just Cooked website

The marketing site for Just Cooked, plus the public recipe-share page the app links to.
Live at https://www.justcooked.app (Vercel, `vercel.json` handles clean URLs and the
`/recipe/:shareId` rewrite).

> This branch (`redesign/proof-of-concept`) is a full visual redesign. The legal copy,
> the recipe-share content and the app itself are unchanged.

## Stack

No build step. Plain HTML, modern CSS and ES modules, with two libraries from CDNs:

| Library | Used for |
|---|---|
| [three.js](https://threejs.org) 0.170 | The 3D phone and clay shapes on the home page (`js/scene.js`) |
| [GSAP](https://gsap.com) 3.12 + ScrollTrigger | Scroll-driven reveals, the pinned tools strip, the dusk tint, word reveal |

Everything degrades: without JavaScript or WebGL the pages show static screenshots and
plain content. `prefers-reduced-motion` turns the motion off.

## Files

```
index.html            Home (hero, story, bento, savings, Support hub, CTA)
faq.html support.html download.html 404.html
terms.html privacy.html cookies.html disclaimer.html eula.html delete.html
css/site.css          Design system: tokens from the V1.2c rebrand spec, components, pages
js/site.js            Nav, reveals, Next Meal story, dusk tint, FAQ/TOC helpers
js/scene.js           Three.js scene (lazy-loaded by site.js on the home page only)
api/recipe/[shareId].js   Vercel function that renders a shared recipe
assets/screens/       Screen-only crops used as 3D phone textures
assets/shots/         Framed phone shots (560w / 980w WebP) used as fallbacks
assets/*.png          Raw app screenshots (source for the two folders above)
scripts/build-assets.py   Regenerates assets/screens, assets/shots and the download QR
```

## How the 3D phone works

`js/scene.js` draws one phone on a fixed, transparent canvas. Any element with
`data-phone-slot` is a landing spot: the phone sizes itself to the slot, follows it as it
scrolls, and shows the screen named by `data-screen` (a key from `assets/screens`).
`data-rot="ry,rx"` sets the resting angle. The `<img>` inside each slot is the fallback
and is hidden once WebGL is running. The Next Meal section swaps `data-screen` on the
slot as each step becomes active. The phone reacts to the mouse, the finger while
scrolling, the gyroscope on Android, scroll speed, and can be dragged to spin.

## Editing a policy

Each legal page keeps its text as Markdown inside
`<script type="text/markdown" id="policy-source">`. Replace that block and the page
renders it, builds the table of contents and the section count on its own.

## Updating app screenshots

Drop the new 1320x2868 screenshots into `assets/` with the same names, then run
`python scripts/build-assets.py .` (needs `pip install pillow segno`).

## Local preview

```
node scripts/preview.mjs
```

Then open http://localhost:4173. The script also prints an address for your phone on the
same Wi-Fi, and serves a sample recipe at `/recipe/demo`. It mirrors what Vercel does in
production (clean URLs and the recipe route) with no dependencies. To run the recipe route
against live data use `vercel dev` with `SUPABASE_SERVICE_ROLE_KEY` set.
