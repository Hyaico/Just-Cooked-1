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
index.html            Home (the play: hero, three steps, the wish and the shooting star, Support hub, the day-sheet finale)
faq.html support.html download.html 404.html
terms.html privacy.html cookies.html disclaimer.html eula.html delete.html
css/site.css          Design system: tokens from the V1.2c rebrand spec, components, pages
js/site.js            Nav, reveals, Next Meal story, dusk tint, FAQ/TOC helpers
js/scene.js           Three.js scene (lazy-loaded by site.js on the home page only)
js/star.js            The shooting star: a GPU particle trail and a flare head on their own canvas
api/recipe/[shareId].js   Vercel function that renders a shared recipe
assets/screens/       Screen-only crops used as 3D phone textures
assets/shots/         Framed phone shots (560w / 980w WebP) used as fallbacks
assets/*.png          Raw app screenshots (source for the two folders above)
scripts/build-assets.py   Regenerates assets/screens, assets/shots and the download QR
```

## How the home page works

The home page is one pinned stage (`.play` in `index.html`). Scrolling never moves the
page; it drives a GSAP timeline (`initPlay` in `js/site.js`) that plays the scenes in
place: hero, three steps around the centred phone, then the wish. The phone fades into
the dusk, and arriving at the `wish` label starts the moment: one real-time timeline
(`moment` in `initPlay`, started by a ScrollTrigger, never scrubbed) in which a speech
bubble comes up and types out "I wish there was support made for me." letter by letter
with a caret, stays for a beat, and then a shooting star crosses from off the left edge to
off the right. The night sky is painted in behind the star by a soft mask on
`.play__night` whose edge (`--sweep`) rides the star's head, the bubble dissolves left to
right under the star through a second soft mask on `.wish` (`--wipe`, measured across the
bubble's own box, whose padding takes in the tail and the shadow), and once the star has
gone the hub's words land in the night ("Introducing the Support hub", "Support, for
everything food touches.", "Support made for you."). While the moment plays the page holds
at the wish: scrolling on (wheel, touch, keys) is held and any overshoot is pulled back,
and the hold lets go a beat after the words are in (with a safety timeout). Scrolling back
up past the wish fades the night, its stars and the words away together and then resets
the moment, ready to play again. The words have two layers so the real-time moment and
the scroll can never undo each other: the moment lands the inner `.scene__block`, the
scroll takes the outer `.scene--title` away as you move on to the hub. Landing below the
wish (a reload, a jump) shows the moment's end state straight away. Then the phone returns
with the Support screen and each of its two screens gets its own message (`.hub--a`,
`.hub--b`). Snapping between scenes is deliberately slow (0.9 to 1.7 s, with a 1.1 s
scrub) so each scene's entrance has room to play out. For the finale the cream page comes back as a day sheet (`.play__sheet`) with
one curved edge over the night: the phone sits on the line between the two worlds and the
words sit on the cream. While the night is on screen the nav bar turns to night glass
(`.nav.is-night`, with the `theme-color` meta to match). Each scene is a `.scene` block;
the invisible `.play__anchor` boxes tell the timeline where the phone rests in the hero
and download scenes, so moving them in CSS moves the phone.
Append `?nosnap` to the URL to turn off scroll snapping while tuning.

`js/star.js` draws the shooting star on a second transparent canvas that only renders
while the star is up. The head is one small quad (core, corona, halo and four soft rays),
so it never depends on the GPU's point-size limit. As it goes it sheds light: a soft
glowing cloud, a hair-thin bright streak and falling sparks, about 2,400 particles in one
draw call. Each particle is born where the head was at its own moment and then drifts,
spreads and fades over its own lifetime, so the trail lingers behind the star and
dissolves into the night rather than travelling with it, and the canvas only switches off
once the last of it has faded. The page drives it through `starState` in `js/site.js`
(`active`, `sec` since launch, `dur` for the head to run the arc, the arc as three
stage-fraction points in `path`, and `emit`, the visible stretch of the arc where it
sheds light).

`js/scene.js` draws the phone on a fixed, transparent canvas, pinned to the single
`[data-phone-slot]` element. The timeline shares a small state object with it (which
screen to show, resting angle, how visible the props are). The phone turns to face the
mouse or finger: from its resting pose it eases to the same full turn on either side,
reached at the screen's edge on that side, so a phone that rests angled one way still turns
just as far the other way. It follows the gyroscope on Android and can be dragged to spin.
The food and kitchen models only react when the mouse is over them. Their positions are
declared at the top of `js/scene.js` (`HERO_*`, `STEPS_*`, `FINALE_*`) as fractions of
the stage, and they were fitted so that none covers the phone, the words, a button or the
nav on any screen size of its class (desktop: 1024x768 up to 1920x1080; phones: 320x568
up to 430x932). A prop with `min: [w, h]` only appears on screens at least that big,
where there is room for it. Keep them in clear space when you move them.

For speed: the phone's canvas skips drawing while the page has faded it out (the wish and
the star), the sky's twinkling pauses until the night arrives (`.play__stars.is-on`), and
dense screens (most phones) render without multisampling. One trap when scripting the
page: `labelToScroll()` on the play's timeline refreshes ScrollTrigger (its trigger starts
at 0), which cancels any snap in progress, so never call it from a scroll handler.

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
