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
| [GSAP](https://gsap.com) 3.12 + ScrollTrigger | The home-page timeline and interior reveals |

The food and kitchen models in `assets/models` are from the [Kenney Food Kit](https://kenney.nl/assets/food-kit)
(CC0, no attribution required). `scripts/build-decor.py` regenerates the star layers and the QR code.

Everything degrades: without JavaScript or WebGL the pages show static screenshots and
plain content. `prefers-reduced-motion` turns the motion off.

## Files

```
index.html            Home (the play: hero, three steps, the reach, Support hub, the day-sheet finale)
faq.html support.html download.html 404.html
terms.html privacy.html cookies.html disclaimer.html eula.html delete.html
css/site.css          Design system: tokens from the V1.2c rebrand spec, components, pages
js/site.js            Nav, reveals, Next Meal story, dusk tint, FAQ/TOC helpers
js/scene.js           Three.js scene (lazy-loaded by site.js on the home page only)
js/hands.js           The reach: two skinned 3D hands (built as a smooth surface at load) on their own canvas
api/recipe/[shareId].js   Vercel function that renders a shared recipe
assets/screens/       Screen-only crops used as 3D phone textures
assets/shots/         Framed phone shots (560w / 980w WebP) used as fallbacks
assets/*.png          Raw app screenshots (source for the two folders above)
scripts/build-assets.py   Regenerates assets/screens, assets/shots and the download QR
```

## How the home page works

The home page is one pinned stage (`.play` in `index.html`). Scrolling never moves the
page; it drives a GSAP timeline (`initPlay` in `js/site.js`) that plays the scenes in
place: hero, three steps around the centred phone, then the Support hub introduces itself:
the phone fades, the words land at the top of the stage ("Introducing the Support hub",
"Support, for everything food touches.", "Support made for you."), and beneath them a hand
rises from below reaching for help, a second comes across to take it, and where they meet
a flash and a ripple of light carry the night across the sky (`.play__night` is clipped to
a circle whose radius is the `--reveal` variable the timeline tweens) while the words turn
from ink to light. The hands fray back into stardust, the words settle to the centre, the
phone returns with the Support screen and each of its two screens gets its own message
(`.hub--a`, `.hub--b`). For the finale the cream page comes back as a day sheet (`.play__sheet`) with
one curved edge over the night: the phone sits on the line between the two worlds and the
words sit on the cream. While the night is on screen the nav bar turns to night glass
(`.nav.is-night`, with the `theme-color` meta to match). Each scene is a `.scene` block;
the invisible `.play__anchor` boxes tell the timeline where the phone rests in the hero
and download scenes, so moving them in CSS moves the phone.
Append `?nosnap` to the URL to turn off scroll snapping while tuning.

`js/hands.js` draws the two hands on a second transparent canvas that only renders during
the passage. A hand is modelled as a smooth surface: a tapered, gently domed palm, a thumb
pad and a heel pad, fingers swept along smooth curves, a slim wrist and a forearm, all
melted together and turned into a mesh with marching cubes at load (about a second, off
the critical path), then smoothed and skinned to a small skeleton. From then on it is an
ordinary skinned mesh with a warm physical material. The reaching hand (them, in soft
pink-lavender, palm toward us) comes up from the lower left; the helping hand (us, in the
deep starry violet) comes down from the upper right, turns at the wrist to lie across the
reaching palm and closes round its far edge while the reaching fingers close a little in
return. They condense out of stardust and fray back into it through a noise threshold in
the fragment shader, with stars riding on the surface. The timeline drives it through
`handsState` in `js/site.js` (`reachA`, `reachB`, `curl`, `dissolve`, `reveal`, and a
per-breakpoint `tune`), and the staging numbers live in `TUNE` at the top of the module.
An uncommitted `dev-hands.html` at the repo root renders the hands alone with query
parameters for tuning.

`js/scene.js` draws the phone on a fixed, transparent canvas, pinned to the single
`[data-phone-slot]` element. The timeline shares a small state object with it (which
screen to show, resting angle, how visible the props are). The phone turns by how far the
mouse or finger is from the phone itself (half a viewport away is a full turn), follows the
gyroscope on Android, and can be dragged to spin. The food and kitchen models only react
when the mouse is over them; their positions are
declared at the top of `js/scene.js` (`HERO_*`, `STEPS_*`, `FINALE_*`), anchored to the phone, the text block or the stage.

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
