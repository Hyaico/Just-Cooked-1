# Just Cooked — Website Rebrand Spec

A portable, self-contained branding + design spec extracted from the Just Cooked
app (the V1.2c rebrand design system). Everything here is expressed in web-ready
values (hex, px, font weights, line heights, radii, aspect ratios) so the website
repo can apply it with no access to the app codebase.

> This document stands alone. There are no "see file X" pointers — every value
> needed to rebuild the look on the web is inline below.

---

## 0. READ FIRST — which orange, and what "current branding" means

The app contains **two different orange systems**. Use the right one.

| System | Primary orange | Where it lives | Use on web? |
|---|---|---|---|
| **V1.2c rebrand (TARGET)** | `#E94B1F` | The new onboarding / rebrand design language | **YES — this is the brand.** |
| Legacy app theme (OLD) | `#FF4500` | The pre-rebrand app-wide theme (Strava-style orange) | No. Being migrated away from. |

The rebrand is mid-flight in the app: the legacy `#FF4500` still appears on some
not-yet-migrated screens, and a documented "theme swap" task is still pending. For
the website, build everything on the **V1.2c rebrand palette** below. Ignore
`#FF4500` except to recognise it as the old colour when you see it.

The overall feel is **warm editorial kitchen**: cream paper surfaces, marble
countertop textures, a confident burnt-orange accent, a calm sage as the
secondary, ink-brown text (never pure black), and soft ink-tinted shadows (never
pure-black drop shadows).

---

## 1. DESIGN SYSTEM

### 1.1 Colour tokens

All values are final hex / rgba. rgba values are given as-is and are valid CSS.

#### Cream + ink ramp (surfaces and text — the backbone)

| Token | Hex | Role on web |
|---|---|---|
| `cream.base` | `#F5EFE6` | Page background (the cream behind everything) |
| `cream.raised` | `#FBF6EC` | Card / raised surface above the page; also "ink on dark" text |
| `cream.pressed` | `#EDE5D6` | Pressed / active surface state |
| `cream.shadow` | `#E0D5C2` | Borders, dividers, hairlines, subtle depth |
| `cream.ink` | `#1A1815` | Primary text (warm near-black — never use `#000`) |
| `cream.inkBody` | `#3A342E` | Body text |
| `cream.inkMuted` | `#8B847C` | Tertiary text, hints, placeholders, captions |

#### Brand orange family (primary accent — "symptom"/brand beats)

| Token | Hex | Role |
|---|---|---|
| `orange.primary` | `#E94B1F` | Primary CTA fill, brand mark, selected states |
| `orange.hot` | `#FF6B35` | Hover / active state, gradient top |
| `orange.warm` | `#F39568` | Gradient mid, illustration fills |
| `orange.soft` | `#FBE3D2` | Chip / badge backgrounds, soft fills, edge-wash tint |
| `orange.ink` | `#7A2410` | Deep orange for text/linework emphasis on cream |

#### JC monogram gradient (logo lockup only — distinct from the CTA orange)

The "JC" concentric-ring mark uses its **own** brighter gradient, not the CTA
orange:

| Token | Hex |
|---|---|
| `monogram.gradientTop` | `#FF6500` |
| `monogram.gradientBottom` | `#FF1500` |

Mark fill: `linear-gradient(135deg, #FF6500 0%, #FF1500 100%)`.

#### Sage family (secondary accent — "practical"/solution beats)

Sage is the calm counterweight to orange. It marks the **practical / solution**
side of the experience (practical-phase CTAs, progress, badges, the recipe-card
seal).

| Token | Hex | Role |
|---|---|---|
| `sage.primary` | `#9CB58A` | Practical-phase progress + badges; seal medallion fill |
| `sage.light` | `#C8D5B9` | Sage phase background |
| `sage.soft` | `#E4ECDC` | Sage chip fills |
| `sage.ink` | `#4A5C3D` | Sage-tinted text for contrast |
| `sage.button` | `#6B8159` | Practical-phase CTA fill (darker, confident sage) |
| `sage.buttonHot` | `#5A7048` | Practical-phase CTA pressed state |

#### Supporting phase colours

```
sky.primary   #A8C5D9    sky.light   #C2DCE8    sky.ink   #3A5567
butter.light  #F5E6B8    butter.soft #FAF1D4    butter.ink #6B5A24
rose.light    #F0D4D4    rose.soft   #F8E4E4    rose.ink   #7A3F3F
```

- **Sky** — hope / calm accent.
- **Butter** — quote-board card fills, warm-gold "soon" tones.
- **Rose** — softer emotional beats.

#### Terracotta family (friction / "the hard part" — deliberately NOT brand orange)

Used for failure / friction / consequence moments. Kept visually distinct from the
brand orange on purpose. Never use brand orange to signal failure.

| Token | Hex | Role |
|---|---|---|
| `terracotta.base` | `#B23A1F` | Full-bleed consequence background; serious, not alarming |
| `terracotta.deep` | `#7A2410` | Gradient depth (same as `orange.ink`) |
| `terracotta.light` | `#D9633F` | Gradient highlight |
| `terracotta.paper` | `#FBE8DE` | Cream-on-terracotta surfaces |
| `terracotta.deepRed` | `#9E1B0E` | Failure-line / "you" bar gradient stop |
| `terracotta.darkRed` | `#5C0F08` | Failure-label text, bar gradient base |
| `terracotta.midRed` | `#C13418` | Bar gradient top |
| `terracotta.softRed` | `#F5DCD6` | Soft red pill backgrounds |

#### Severity tints (subtle problem-grouping — calm, never medical/alarming)

Three-level grouping used to colour problem/symptom cards. green = small practical
friction, amber = bigger repeated loops/cost, red = most serious. Backgrounds are
**opaque** tinted creams (so cards never read as see-through over texture).

| Level | bar | tint background | tint border | swatch bg | glyph |
|---|---|---|---|---|---|
| green | `#9CB58A` | `#EBF0E2` | `rgba(155,181,138,0.55)` | `#E4ECDC` | `#6B8159` |
| amber | `#D98E3C` | `#F7EBDB` | `rgba(217,142,60,0.52)` | `#F7E6CC` | `#B5752A` |
| red | `#B23A1F` | `#F6E6DF` | `rgba(178,58,31,0.42)` | `#F5DCD6` | `#9E1B0E` |

#### Per-goal chip colours (icon-chip bg + icon, for goal lists)

```
eat_more_regularly  bg #FBE3D2  icon #E94B1F      gain_weight       bg #FBE3D2  icon #E94B1F
eat_enough          bg #FAF1D4  icon #6B5A24      lose_weight       bg #C2DCE8  icon #3A5567
improve_nutrition   bg #E4ECDC  icon #9CB58A      build_muscle      bg #FBE3D2  icon #E94B1F
reduce_takeaway     bg #F8E4E4  icon #7A3F3F      hit_protein       bg #FBE8DE  icon #B23A1F
less_waste          bg #E4ECDC  icon #9CB58A      more_home_cooked  bg #FAF1D4  icon #6B5A24
feel_calmer         bg #C2DCE8  icon #3A5567      less_effort       bg #E4ECDC  icon #9CB58A
```

#### Expiry / freshness tones (calm → warm, NEVER red)

For any "use it soon" indicator. Stays warm and low-pressure.

| Status | background | text (ink) | dot |
|---|---|---|---|
| today | `rgba(251,227,210,0.8)` | `#7A2410` | `#E07B3C` |
| soon | `rgba(245,230,184,0.7)` | `#6B5A24` | `#B98A2E` |
| fresh | `rgba(228,236,220,0.8)` | `#41502F` | `#6B8159` |
| none | `rgba(237,229,214,0.7)` | `#8B847C` | `#8B847C` |

#### Dark-surface ink ramp + glass (for dark stone backgrounds)

When content sits on the dark stone textures (soapstone / stone-deep):

```
darkInk.primary    #FBF6EC                      (headlines + body on dark)
darkInk.body       rgba(245,239,230,0.78)
darkInk.muted      rgba(245,239,230,0.55)
darkInk.faint      rgba(245,239,230,0.45)
darkInk.highlight  #FF8855                      (accent word on dark)

glass.fill         rgba(245,239,230,0.06)
glass.fillStrong   rgba(245,239,230,0.10)
glass.border       rgba(245,239,230,0.14)
glass.borderSoft   rgba(245,239,230,0.18)
glass.iconOrange      rgba(255,107,53,0.18)   glass.iconOrangeInk #FFB07A
glass.iconSage        rgba(155,181,138,0.20)  glass.iconSageInk   #C2D5A6
```

#### Surface / glass tints for cards over texture

```
creamEdge        rgba(224,213,194,0.6)    hairline on every card/surface (lets texture show)
glassFill        rgba(251,246,236,0.72)   translucent cream (frosted glass surface)
glassEdge        rgba(255,255,255,0.6)    white hairline on glass
whiteGlassTop    rgba(255,255,255,0.55)   glass highlight (top)
whiteGlassBottom rgba(255,255,255,0.15)   glass highlight (bottom)
```

### 1.2 Phase palettes (sage = practical, orange = symptom) + accent backgrounds

The onboarding runs as a two-tone emotional journey. **Orange marks the
symptom/struggle/brand beats** (most quiz screens, the "what is food costing you"
symptom selection, the primary brand CTA). **Sage marks the practical/solution
beats** (practical-phase CTAs, progress, success). Other phases get their own tonal
page background for specific emotional moments.

Each phase defines a page **background**, an **accent**, and an **ink** (text)
colour:

| Phase | Background | Accent | Ink (text) | Meaning |
|---|---|---|---|---|
| cream | `#F5EFE6` | `#E94B1F` | `#1A1815` | Default — most quiz + product screens |
| cream-raised | `#FBF6EC` | `#E94B1F` | `#1A1815` | Warmer cream (product carousel) |
| rose | `#F0D4D4` | `#7A3F3F` | `#7A3F3F` | Impact / emotional selection |
| terracotta | `#B23A1F` | `#FBF6EC` | `#FBF6EC` | Consequence carousel (full-bleed) |
| sky | `#C2DCE8` | `#3A5567` | `#3A5567` | Hope beat |
| sage-light | `#C8D5B9` | `#4A5C3D` | `#4A5C3D` | System-graph / practical proof |

Notes for web:
- The **cream / cream-raised** phases are not flat fills in the app — they render
  the **marble-cream texture** full-bleed (see §1.8). On web, use the marble-cream
  background for default pages, not a flat `#F5EFE6`.
- The **terracotta** phase is a full-bleed vertical gradient, not a flat fill:
  `linear-gradient(180deg, #D9633F 0%, #B23A1F 50%, #7A2410 100%)`.
- rose / sky / sage-light are intentional solid tonal beats.

### 1.3 Typography

**Family:** Inter, across the entire system.

> **Important font caveat for web.** The app *references* `Inter` everywhere but
> does **not** actually bundle/load the Inter font files — so in the app it falls
> back to the platform system font (San Francisco on iOS, Roboto on Android). The
> design intent is genuine Inter. On the website you should **load real Inter**
> (Google Fonts or self-hosted) to honour the intended look. Recommended CSS stack:
> `font-family: 'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif;`

**Numerals / technical labels (mono):** there is no bundled mono font; the app uses
the platform monospace (`Menlo` on iOS, `monospace` on Android). On web use:
`font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;` for numeric
readouts / meta chips if you want the same "technical" feel.

**Weights used:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold),
800 (extrabold).

#### Type scale (the V1.2c roles)

`line-height` and `letter-spacing` below are in px (web-ready). The unitless
line-height ratio is given in parentheses if you prefer it.

| Role | Size | Weight | Line height | Letter spacing | Notes |
|---|---|---|---|---|---|
| hero | 42px | 800 | 46px (≈1.10) | -0.8px | Biggest headline |
| display | 34px | 800 | 38px (≈1.12) | -0.5px | Screen titles |
| pill | 17px | 500 | 22px (≈1.29) | -0.1px | Option/pill text |
| button | 17px | 600 | 22px (≈1.29) | -0.1px | CTA label |
| subhead | 16px | 500 | 22px (≈1.38) | -0.1px | Supporting line under titles |
| body | 16px | 400 | 24px (1.50) | 0 | Paragraph text |
| label | 13px | 600 | 16px (≈1.23) | 0.4px | UPPERCASE small labels |

The `label` role is uppercase (`text-transform: uppercase`).

#### Legacy app type scale (reference only — for parity with not-yet-migrated screens)

Sizes: xs 12 / sm 14 / md 18 / lg 20 / xl 24 / xxl 31 px. Weights 400/500/600/700.
Line-height ratios: tight 1.2 / normal 1.5 / relaxed 1.75. Prefer the V1.2c scale
above for new web work.

### 1.4 Spacing scale

| Token | px |
|---|---|
| xs | 4 |
| s | 8 |
| m | 12 |
| l | 16 |
| xl | 24 |
| xxl | 32 |
| xxxl | 48 |

(Legacy theme scale, for reference: xs 4 / sm 8 / md 16 / lg 24 / xl 32 / xxl 48.)

### 1.5 Border radius

| Token | px |
|---|---|
| s | 8 |
| m | 12 |
| l | 16 |
| xl | 24 |
| pill | 999 (fully rounded) |

### 1.6 Shadows (web `box-shadow` values)

The rebrand uses **ink-tinted** shadows (warm near-black `#1A1815` =
`rgb(26,24,21)`), never pure black, and never harsh. Orange buttons get an
orange-tinted glow.

| Token | `box-shadow` |
|---|---|
| card (base) | `0 12px 24px rgba(26,24,21,0.08)` |
| pill | `0 2px 8px rgba(26,24,21,0.04)` |
| v3 card (calendar / recent cards) | `0 16px 33px rgba(26,24,21,0.13)` |
| v3 doorway (big feature cards) | `0 22px 46px rgba(26,24,21,0.16)` |
| v3 soft (frosted bars / lists) | `0 6px 18px rgba(26,24,21,0.07)` |
| v3 accent (orange CTAs) | `0 8px 16px rgba(233,75,31,0.32)` |

(`rgb(233,75,31)` = `#E94B1F` = the brand orange.)

> RN-only note: the app sets both iOS `shadow*` and Android `elevation`. `elevation`
> has no web equivalent — ignore it; the `box-shadow` values above already encode
> the intended look.

### 1.7 Background textures

The signature surfaces are **stone/marble kitchen-countertop** textures. There are
four variants plus a paper-grain overlay.

**How they are sourced (important for web recreation):**
- The **source of truth is an SVG** for each texture, built from layered CSS-style
  gradients plus `feTurbulence` + `feDisplacementMap` filters (these draw the
  warped marble veins). The app cannot run those SVG filters at runtime, so it ships
  **pre-rasterised JPGs** (at 1x/2x/3x) instead.
- **On the web you have two good options:**
  1. **Render the SVG directly.** Browsers fully support `feTurbulence` /
     `feDisplacementMap`, so you can rebuild the texture as a live SVG using the
     recipes below (crisp at any size, tiny file).
  2. **Use a static raster** (export a JPG/WebP) if you prefer a fixed image.
- Each texture is authored at viewBox `0 0 400 860` (portrait) and scaled with
  `preserveAspectRatio: xMidYMid slice` (i.e. CSS `background-size: cover`).

The four variants:

| Variant | Where used | Mood |
|---|---|---|
| **marble-cream** | Default page background ("the kitchen countertop") | Warm cream marble |
| **marble-hero** | Hero / landing screen | Warmer cream marble + vignette |
| **soapstone** | Mid-journey dark beat | Warm dark stone |
| **stone-deep** | Product-reveal / deepest beat | Darkest stone, heavy vignette |

#### marble-cream (the default countertop — use this behind most pages)

- **Base:** `linear-gradient(135deg, #FBF6EC 0%, #F4EDE0 55%, #ECE2CE 100%)`
- **Top-left glow (radial):** centre 22% 14%, radius ~80%, `#FFFFFF` 0.55 → 0
- **Bottom-right warm wash (radial):** centre 80% 92%, radius ~60%, `#FBE3D2` 0.28 → 0
- **Soft cloud mottling:** low-frequency fractal noise tinted brown
  (≈ `#52453380`), ~18% opacity, blurred (`stdDeviation 2.5`)
- **Marble veins:** thin warped strokes in `#3A2C1C` (primary veins, ~0.16–0.32
  opacity, 0.6–1.6px) and `#4A3826` (finer veins, ~0.12–0.18 opacity, 0.3–0.45px),
  distorted by `feTurbulence baseFrequency 0.006 0.009` / `feDisplacementMap scale 140`
- **Fine grain:** high-frequency noise at ~5% black

If recreating as a single flat fallback colour, use `#F5EFE6` (`cream.base`).

#### marble-hero (hero / landing)

- **Base:** `linear-gradient(135deg, #FCF7EE 0%, #F2EBDA 55%, #E3D7BC 100%)`
- **Top-left glow (radial):** centre 20% 10%, `#FFFFFF` 0.70 → 0 (brighter than cream)
- **Bottom-right warm wash (radial):** centre 80% 95%, `#FBE3D2` 0.40 → 0
- **Vignette (radial):** centre 50% 50%, transparent at 55% → `#3A2410` 0.28 at 100%
- **Veins:** three depths — `#2A1E10` (boldest, up to 2.4px, ~0.26–0.30 op),
  `#3A2410` (mid), `#5A3E20` (finest)
- **Cloud + grain:** as marble-cream (cloud ~22% opacity)
- Flat fallback: `#F5EFE6`.

#### soapstone (warm dark stone)

- **Base:** `linear-gradient(135deg, #3A342E 0%, #2E2924 55%, #23201C 100%)`
- **Top-left glow (radial):** centre 28% 14%, `#6A5A45` 0.45 → 0
- **Bottom-right warm wash (radial):** centre 82% 90%, `#7A2410` 0.20 → 0
- **Veins:** light strokes — `#E8D9BE` (bright veins, ~0.16–0.32 op) and `#D4C4A6`
  (fine veins)
- **Flecks:** sparkle-like turbulence speckle in pale stone, ~18% opacity
- **Grain:** ~5% white noise
- Flat fallback: `#1A1815` (`cream.ink`).

#### stone-deep (darkest stone, product reveal)

- **Base:** `linear-gradient(135deg, #2C2620 0%, #22201C 55%, #191815 100%)`
- **Top-left glow (radial):** centre 26% 14%, `#8B6B45` 0.35 → 0
- **Bottom-right warm wash (radial):** centre 78% 92%, `#7A2410` 0.18 → 0
- **Heavy vignette (radial):** centre 50% 55%, transparent at 55% → black 0.45 at 100%
- **Veins:** `#C99560` (warm gold veins) + `#A77845` (finer)
- **Pebble speckle + grain:** warm pale speckle ~16% opacity, ~5% white grain
- Flat fallback: `#1A1815`.

#### paper-grain overlay

- A tileable warm paper-grain texture, **512×512 px**, intended to tile seamlessly.
- Rendered as an overlay at **4% opacity** on cream phases and **6%** on the
  terracotta phase. Think recipe-book paper, not aggressive grain.
- Status: in the app this is a *pending/optional* asset (`paper-grain.png`); if
  absent the app shows the background with no grain. For web, recreate as a subtle
  tiled noise PNG or an SVG `feTurbulence` overlay at the opacities above.

### 1.8 Core reusable patterns

#### Primary CTA (filled pill button)

- Shape: fully rounded pill — `border-radius: 999px`.
- Height: **56px**; horizontal padding **24px**; content centred.
- Label: Inter **600**, **17px**, letter-spacing -0.1px.
- Optional trailing chevron icon (18px) in the label colour, 8px to the right of
  the label.
- Disabled / loading: 40% opacity (`opacity: 0.4`).
- Press feedback: scale to **0.96** over ~120ms (CSS: `transform: scale(0.96)` on
  `:active` with a 120ms transition). *(In-app this also fires haptics — N/A on web.)*
- Suggested accent shadow on the orange variant: `0 8px 16px rgba(233,75,31,0.32)`.

Surface variants (background / text-colour pairs):

| Variant | Background | Text |
|---|---|---|
| cream (default) | `#E94B1F` | `#FBF6EC` |
| cream-raised | `#E94B1F` | `#FBF6EC` |
| **practical** | `#6B8159` (sage) | `#FBF6EC` |
| rose | `#FBF6EC` | `#1A1815` |
| terracotta | `#FBF6EC` | `#B23A1F` |
| sky | `#FBF6EC` | `#3A5567` |
| sage | `#FBF6EC` | `#4A5C3D` |

The default brand CTA is **orange fill, cream text**. On practical/solution
sections, swap to the **sage fill** variant.

#### Secondary CTA (text button, no fill)

- No background, no border. Height **44px**, centred label.
- Label: Inter **500**, **17px**.
- Colour: `#8B847C` (`cream.inkMuted`) normally, or `#1A1815` (`cream.ink`) when
  emphasised.

#### Cards (general surface)

- Surface fill: `#FBF6EC` (`cream.raised`) — or a frosted `rgba(251,246,236,0.72)`
  when floating over texture.
- Hairline edge: `1px solid rgba(224,213,194,0.6)` (`creamEdge`) so the countertop
  texture reads through the edge.
- Corner radius: **16px** (`l`) for standard cards, **24px** (`xl`) for large
  feature cards.
- Shadow: `0 16px 33px rgba(26,24,21,0.13)` (standard) or
  `0 22px 46px rgba(26,24,21,0.16)` (large "doorway" feature cards).

---

## 2. RECIPE CARD — DEEP SPEC

The RecipeCard is the **hero object** of the rebrand: a portrait "warm paper
certificate / recipe card" artifact. On the website it is the model for the shared
recipe page. It is brand-fixed (cream paper + deep-orange linework + sage seal) and
does **not** recolour per phase. Its only state logic is **empty vs filled**.

Build it to be fully self-contained from the values below.

### 2.1 Overall dimensions

- Reference size: **286 × 380 px** (width × height).
- **Aspect ratio: 286 : 380 ≈ 0.753 : 1** (portrait, ≈ 3:4). Scale proportionally.
- Corner radius: **16px**. `overflow: hidden` to clip the inner layers.
- Drop shadow (the whole card floats): **`0 12px 22px rgba(26,24,21,0.16)`**.

### 2.2 Paper surface (the material — layer stack, bottom to top)

Render these layers inside the 16px-rounded clipped box, in order:

1. **Base paper gradient:**
   `linear-gradient(180deg, #FDF8EE 0%, #FBF3E4 50%, #F5E8D2 100%)`.
2. **Warm radial edge wash** (darkens/warms the edges):
   radial gradient centred at 50% 50%, ellipse radius ≈ 75% × 62%, from
   `rgba(251,227,210,0)` at 32% to **`rgba(251,227,210,0.55)`** at 100%.
   (`#FBE3D2` = `orange.soft`.)
3. **Diagonal glass shine** (top-left sheen):
   `linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 35%)`,
   applied to the whole surface at ~60% layer opacity.
4. **Inner foil frame (double hairline):**
   - Outer foil: inset **10px** from all edges, `border: 0.75px solid
     rgba(122,36,16,0.22)`, `border-radius: 10px`.
   - Inner foil: inset **13px**, `border: 0.5px solid rgba(224,213,194,0.55)`,
     `border-radius: 8px`.
5. **Dog-ear** (folded paper corner), top-right: a small **14×14px** triangle
   filled `rgba(224,213,194,0.85)`, sitting in the very top-right corner.
6. **Specular border:** `0.75px solid rgba(224,213,194,0.6)` around the full card
   (radius 16px).
7. **Top highlight:** a **1px** line of `rgba(255,255,255,0.85)` along the top
   edge (inset 1px left/right) — a bright lip.

(Grain is intentionally omitted on the card; the gradient + washes carry it.)

### 2.3 Content padding + structure

- Content padding: **24px** on all sides, **22px** bottom.
- Three vertical regions stacked top → middle (vertically centred, fills space) →
  bottom.

### 2.4 TOP row

Horizontal row, vertically centred:
- **JC monogram mark**, 24×24px (spec in §2.7).
- **Hairline flourish:** a 1px-tall line that fills the remaining width, 10px to the
  right of the mark:
  `linear-gradient(90deg, rgba(122,36,16,0.28) 0%, rgba(122,36,16,0) 100%)`.

### 2.5 MIDDLE block (vertically + horizontally centred)

In order, top to bottom:

1. **Eyebrow label** (uppercase):
   - Text: `PERSONALISED FOR` when filled, `A PLAN FOR` when empty.
   - Inter **700**, **9.5px**, letter-spacing **1.4px**, `text-transform: uppercase`,
     colour `#8B847C` (`cream.inkMuted`).
2. *gap 12px*
3. **Name (the focal line):**
   - Filled: the user's name + a full stop, e.g. `You.` — Inter **800**, **36px**,
     line-height 36px, letter-spacing **-1.1px**, colour `#1A1815` (`cream.ink`).
   - Empty: the word `you.` — same size, but **italic** and **opacity 0.18**.
4. *gap 18px*
5. **Ornament** (centred decorative rule): a horizontal row with 8px gaps:
   `[36px line] [8px diamond] [36px line]`.
   - Diamond: an 8×8px rotated square (◆).
   - Tint: `rgba(122,36,16,0.45)` when filled, `rgba(122,36,16,0.25)` when empty.
   - Left line (1px tall, 36px wide):
     `linear-gradient(90deg, rgba(122,36,16,0) 0%, <tint> 100%)`.
   - Right line: `linear-gradient(90deg, <tint> 0%, rgba(122,36,16,0) 100%)`.
   - Diamond fill = `<tint>`.
6. *gap 16px*
7. **Subhead** (italic, centred, horizontal padding 12px):
   - Filled: `Built for the <resultLabel>.` (default resultLabel = `the way you
     actually eat`).
   - Empty: `A plan built around how you actually eat.`
   - Inter **500 italic**, **14px**, line-height 19px, letter-spacing -0.1px.
   - Colour: filled `#3A342E` (`cream.inkBody`); empty `#8B847C` (`cream.inkMuted`).
8. **Note (filled only):** *gap 10px*, then `Make food easier. Feel more like
   yourself.` — Inter **500**, **12px**, line-height 17px, colour `#8B847C`,
   centred, horizontal padding 8px.

### 2.6 BOTTOM block

1. **Divider** (1px tall, full width):
   `linear-gradient(90deg, rgba(122,36,16,0) 0%, rgba(122,36,16,0.18) 50%, rgba(122,36,16,0) 100%)`.
2. **Bottom row** (margin-top 12px, items aligned to the bottom, space-between):
   - **Left column:**
     - `STARTING` label — Inter **700**, **9px**, letter-spacing 1.2px, uppercase,
       colour `#8B847C`.
     - Value (margin-top 2px) — Inter **600**, **12px**, letter-spacing -0.1px.
       Filled: a date in `D Mon YYYY` format (e.g. `9 Jun 2026`), colour `#1A1815`.
       Empty: the word `Soon`, colour `#8B847C`.
   - **Right (filled only):** the **seal stamp** (§2.8), 40px, rotated 11°, nudged
     into the corner (≈ -2px right / -2px down).

### 2.7 JC monogram mark (used at 24px on the card)

A concentric-ring "JC" mark. Render as SVG in a 100×100 coordinate space, scaled to
the target size:
- **Rounded-square tile:** full 100×100, corner radius **22** (i.e. `border-radius`
  = 22% of size), filled with `linear-gradient(135deg, #FF6500 0%, #FF1500 100%)`.
- **Cream ring:** an annulus (outer radius 34, inner radius 26.1) centred at 50,50,
  filled `#F5EFE6` (`cream.base`).
- **Cream centre disc:** radius 23.87 at 50,50, `#F5EFE6`.
  (Net: the gradient tile shows through only as a thin ring between the annulus and
  disc — a bold orange ring on cream.)
- **Accent dot:** a tiny `#F5EFE6` dot, radius 1.61, at (73.78, 30.52) — i.e. ~1
  o'clock, just outside the ring.
- **Soft shadow on the tile:** `0 2px 4px rgba(122,36,16,0.18)`, corner radius 22%.

### 2.8 Seal stamp (sage medallion — the "sealed/approved" mark)

Used at **40px** on the card (also exists at 32px and 108px elsewhere).
- **Disc:** circle, `background: #9CB58A` (`sage.primary`), fully round.
- **Inner pressure ring:** an inset ring — inset ≈ 6% of size (≈2–3px),
  `border: ~4.5%-of-size solid rgba(74,92,61,0.28)` (≈1.8px at 40), fully round.
- **Checkmark:** a white-ish check, stroke colour `#FBF6EC` (`cream.raised`),
  rounded caps/joins, sized ~50% of the disc (≈20px), centred. (Path in a 24×24
  box: `M5 12.5 l4.5 4.5 L19 7.5`, stroke-width ~2.6.)
- **Drop shadow:** `0 2px 6px rgba(74,92,61,0.30)` (`sage.ink`-tinted).
- **Rotation:** rotated **11°** on the card for a hand-stamped feel.
- **Unsealed variant** (not shown on the filled card; for reference): a transparent
  circle with a `1.5px solid #E0D5C2` (`cream.shadow`) outline.

### 2.9 Empty vs filled summary

| Element | Empty state | Filled state |
|---|---|---|
| Eyebrow | `A PLAN FOR` | `PERSONALISED FOR` |
| Name | `you.` italic, 18% opacity | `<Name>.` solid `#1A1815` |
| Ornament tint | `rgba(122,36,16,0.25)` | `rgba(122,36,16,0.45)` |
| Subhead | `A plan built around how you actually eat.` (muted) | `Built for the <result>.` (body ink) |
| Note line | (hidden) | `Make food easier. Feel more like yourself.` |
| STARTING value | `Soon` (muted) | date `D Mon YYYY` (ink) |
| Seal | (none) | sage seal, 40px, 11° |

### 2.10 RN-only behaviours (NOT applicable to web)

- Entry animation: card scales `0.94 → 1.0` while fading in, ~spring, ~200ms delay.
  *(Reproduce on web with a CSS/JS fade+scale if desired; optional.)*
- Seal "stamp in": scale `1.4 → 1.0` and rotation `15° → 11°` on a spring, checkmark
  fades in over 200ms. *(Optional to reproduce on web.)*
- Haptic feedback (light on card settle, medium/success on seal) — **N/A on web.**

---

## 3. BRAND VOICE AND COPY RULES

### 3.1 Locked messaging (use these verbatim)

- **Tagline:** `Not perfect. Just cooked.`
- **Supporting line:** `For when food feels hard.`
- **StoryBrand hero:**
  `Food feels hard for a lot of people. Just Cooked helps you find your way back, one small meal at a time.`
- **Primary CTA:** `Start where you are.`

> Note: this locked set is the **current/intended** brand copy. The app repo's
> older positioning line still reads `Just Cooked — for when food feels hard.`
> (and the in-app onboarding copy hasn't been updated to this exact set yet). The
> website should use the locked set above. See Open Questions §4.

### 3.2 Tone rules (hard constraints)

- Voice: **a guide talking to a friend, not a brand selling.** Warm, plain,
  grounded. Acknowledge the struggle first, then offer the next small step.
- **No em dashes anywhere.** (This is a binding house-style rule.) Use full stops,
  commas, or restructure the sentence.
- **No triple cadence** (avoid the "X, Y, and Z" rule-of-three rhythm and
  three-beat slogans).
- **No over-adjective phrasing.** Don't stack adjectives; let plain nouns and verbs
  carry it.
- **No aggressive language.** Nothing pushy, hype, urgent, or shaming. Low-pressure,
  never alarming — this extends to colour too (e.g. expiry/health states are warm,
  never red; see §1.1).
- Speak in direct second person ("you"), and offer agency and possibility without
  guaranteeing outcomes.

### 3.3 Brand name treatment

- Always **"Just Cooked"** — two words, capital J, capital C. Never `just cooked`,
  never `JUST COOKED`, never `JustCooked` in prose.
- The **"JC" monogram** is the mark (the concentric-ring symbol in §2.7); the brand
  gradient for the mark is `#FF6500 → #FF1500` (distinct from the CTA orange).

### 3.4 On-brand copy patterns observed in the app (reusable / adaptable on web)

These are real strings/patterns from the app that fit the voice. Treat them as
**style references and reusable phrasing**, not necessarily locked, and adapt to
each web context (and check any that read as not-yet-final with the founder).

**Positioning / narrative beats (the emotional arc):**
- "Food is not just food. It shapes your energy, your mood, your money, your goals,
  your headspace. When food feels hard, the cost shows up everywhere."
- "Your relationship with food can change."
- "Food is not optional. You face it every day. A better relationship with food
  gives you a better way through life."
- "No more overthinking food."
- "Built for the days food feels hard. Not the days everything is going right."

**Reassurance / low-pressure microcopy (very on-brand):**
- "No judgement."
- "Pick anything that sounds like you."
- "We'll only suggest meals you can actually make."
- "Start where you are." (the locked CTA — fits this family)

**CTA / button label patterns (short, plain, forward-moving):**
- "Continue", "Show me how", "Start now" — and the locked "Start where you are."
- Pattern: a plain verb phrase, no hype, no exclamation.

**Goal labels (short forms, if the site lists goals):**
`Eat regularly · Eat enough · Better nutrition · Reduce takeaway · Waste less ·
Gain weight · Lose weight · Build muscle · Hit protein · Home-cooked · Feel calmer ·
Less effort`.

**Recipe-content copy rule (carry to web recipe pages):** dish titles name the dish
clearly — no trailing "Delight"/"Medley", no leading filler adjectives; descriptions
read naturally; no em dashes.

---

## 4. OPEN QUESTIONS (for the website apply pass)

1. **Locked tagline vs repo copy.** The locked set in §3.1 (`Not perfect. Just
   cooked.` / `Start where you are.` / the StoryBrand hero) does **not** appear in
   the app repo yet — the app still uses `Just Cooked — for when food feels hard.`
   and different onboarding lines. Confirm the §3.1 set is the canonical website
   copy (assumed yes), and whether the app is expected to migrate to match.

2. **Inter font, for real.** The app references Inter but doesn't bundle it (renders
   system font). For the website, confirm we should load genuine Inter (Google Fonts
   / self-hosted) at weights 400/500/600/700/800. Any licensing preference
   (Google Fonts CDN vs self-host)?

3. **Marble texture asset.** Do you want the website to (a) render the marble-cream
   SVG live (recipe in §1.7), or (b) ship a high-res raster (JPG/WebP) export? If
   raster, at what max dimensions / which focal crop? The app's rasters are portrait
   (400×860 authored) and may not suit wide desktop layouts — a desktop-width crop
   may be needed.

4. **paper-grain asset.** This is a pending/optional asset in the app (may not
   exist as a file). Should the website include the 4–6% paper-grain overlay, and do
   you have a source PNG, or should it be regenerated?

5. **Recipe page hero image.** The app's RecipeCard is a *typographic certificate*
   with **no photo** — it's a paper artifact, not a food photo. The brief calls this
   the model for the website's shared recipe page. Confirm: should the web recipe
   page keep the photo-free certificate treatment, or add a hero food image (and if
   so, what aspect ratio / placement, since the current card has no image slot)?

6. **Dark stone surfaces on web.** soapstone / stone-deep are used for specific
   emotional beats in onboarding. Does the website need them at all, or is the web
   experience cream/marble-only? (Affects whether we port the dark ink ramp + glass
   tokens.)

7. **Logo lockup / wordmark.** This spec covers the JC monogram mark and its
   gradient, but there's no full horizontal wordmark/logo lockup defined here.
   Provide the official wordmark (font, spacing, mark-to-text relationship) if the
   website header needs one.

8. **Phase palette scope on web.** The rose / sky / terracotta / sage-light phase
   backgrounds are onboarding-journey beats. Confirm which (if any) the website
   should reuse as section themes, versus keeping the site on cream + orange + sage
   only.

---

## 5. RECIPE VIEW (ACTUAL IN-APP RECIPE DISPLAY)

This is the screen a user sees when viewing a **real, cookable recipe** (dish name,
ingredients, method, cook meta). It is the model for the website's shared recipe
page. It is a **completely different screen** from the onboarding personalisation
certificate documented in Section 2 — that certificate is a name-and-seal artifact
with no ingredients or method. Do not confuse them. Build the website's recipe page
from THIS section.

There are two in-app screens that render a full recipe:

- **PRIMARY — the rebranded recipe detail screen** (the "lined notebook" V1.2c
  redesign). This is the current design language and the one the website should
  follow. Everything in 5.1–5.10 documents this screen.
- **SECONDARY — the public "shared recipe" page** (opened from a share link). This
  is literally the existing public page, BUT it has **not yet been rebranded** — it
  still uses the OLD legacy white-card / `#FF4500` theme. It is documented in 5.11
  as a caution, not as the target. The website should adopt the PRIMARY look.

**Recipe data fields available** (so you know what content the page renders):
`name`, `description`, `servings`, time (`totalTime` / `preparationTime` /
`totalTimeMinutes`), `difficultyLevel`, `ingredients[]` (each:
`name`, `quantity`, `unit`, optional `preparation`, optional `source` =
`pantry`|`photo`), `instructions[]` (each: `step` number, `description`, optional
`timer`, optional `imageUrl`), `appliedCuisines[]`/`cuisineType`, `appliedDiets[]`,
`appliedAllergies[]`, `requiredEquipment[]`, nutrition (`calories`, `protein_g`),
`author`/`authorType`, `sourceUrl`, `tags[]`.

> Colour note specific to this screen: the rebranded detail screen mostly uses the
> V1.2c tokens (`#1A1815`, `#8B847C`, `#3A342E`, `#E94B1F`, `#FBF6EC`, `#7A2410`,
> `#FBE3D2`) but a few accents still reference the LEGACY orange `#FF4500`
> (the byline, the meta-chip icons, the cooked-count badge, the bottom-bar
> buttons). On the website, use the brand orange **`#E94B1F`** everywhere for these;
> treat any `#FF4500` you infer as a leftover to be normalised.

### 5.1 PAGE FRAME

- **Background — a lined-notebook page** (not the marble of §1.7; this screen uses
  its own "recipe notebook" surface):
  - Base: `linear-gradient(180deg, #FCF8F0 0%, #F1E7D3 100%)` (warm cream → tan,
    top to bottom).
  - Horizontal ruled lines every **26px**, colour `#C2A47B` at **0.26** opacity,
    **1.1px** thick.
  - One vertical margin rule near the left edge (at x ≈ 52px on a 390px-wide
    canvas, i.e. ~13% in), colour `#D7967A` (dusty rose) at **0.32** opacity,
    **1.3px**.
  - Solid fallback colour while it loads: `#FCF8F0`.
- **Max content width: 500px.** Content is full-width on phones and centred at a
  max of 500px on wider screens. For the website, cap the recipe column around
  500–640px and centre it on the notebook background.
- **Page padding / layout:** content is a single vertical scroll of **floating
  "lined cards"** stacked on the notebook page. Each card is inset **16px** from the
  left/right edges with **14px** vertical gaps between cards. The top header bar and
  the bottom action bar use **16px** horizontal padding.
- **Scroll structure:** fixed top header (back + action buttons, transparent over
  the notebook). Scrolling body of cards. Fixed bottom action bar. Bottom scroll
  padding ≈ 120px so content clears the action bar.
- **Card pattern (every section is one of these):**
  - Corner radius **20px**, **1px** border, soft shadow
    `0 14px 30px rgba(26,24,21,0.08)`.
  - Default fill `#FCFAF3` (near-cream). Accent-tinted variants (see 5.3/5.4/5.5):
    sage `#EEF4E5`, amber `#FBF1D8`, orange `#FCFAF3`.
  - Each card also has faint **ruled lines inside it** (so the "paper" reads through
    the card): horizontal lines `#A8895C` at 0.30 opacity, 1.2px, every 26px, plus a
    vertical margin rule at x≈31px in `#D7967A` at 0.28 opacity, 1.3px. (Optional on
    web; it reinforces the notebook feel.)

### 5.2 HERO

- The hero is a **rounded image card**, not a full-bleed banner.
  - Width: the card minus the 16px side insets. Height ≈ **0.82 × content width**
    (so roughly a 1 : 0.82 landscape rectangle — at the 500px max width, ~410px
    tall). Corner radius **22px**. Shadow `0 14px 28px rgba(26,24,21,0.14)`.
  - **Image treatment:** the dish photo fills the card (`object-fit: cover`),
    rounded to 22px.
  - **Placeholder when there is no image** (common — many recipes have no photo):
    a warm-cream gradient `linear-gradient(135deg, #E4D8C0 0%, #D8CAAC 50%, #CBBB98 100%)`
    with a centred **60×60px** rounded-square icon chip (corner radius 19px, fill
    `rgba(255,252,245,0.6)`, border `1.5px rgba(120,95,60,0.28)`, icon tint
    `rgba(86,66,42,0.62)`) and a caption beneath it (Inter 600, 11px, line-height
    16px, colour `rgba(86,66,42,0.62)`, centred, max-width 230px). Card border
    `1px rgba(120,95,60,0.18)`.
- **The dish TITLE is NOT on the hero.** It lives in a separate "title card" that
  overlaps upward onto the bottom of the hero (negative top margin of **-24px**,
  raised above the hero). Title card: fill `#FCFAF3`, border `1px rgba(233,75,31,0.18)`
  (orange-tinted), radius 20px, padding 24px, shadow `0 14px 30px rgba(26,24,21,0.08)`.
  - **Dish title:** colour `#1A1815` (cream.ink), **29px**, weight **800**,
    letter-spacing **-0.8px**, line-height 34px.
  - **Byline** (directly under the title): see 5.8.
- **Hero overlays** (badges on the image — mostly app-only, see 5.10):
  - Session-type badge, top-left: a small pill, fill `rgba(0,0,0,0.4)`, radius 6px,
    padding 8×4px, white icon + white text (11px, 600). Labels: "Photo Cook" /
    "Recipe Cook" / "Pantry Cook".
  - Before/After toggle, bottom-centre (photo cooks only): 140px pill, fill
    `rgba(0,0,0,0.4)`, radius 20px, two segments; the active segment is white with
    dark text.
  - Camera button, bottom-right: 32×32px, fill `rgba(0,0,0,0.4)`, radius 16px.
  - These are cook-session affordances; a public web recipe page does not need them.

### 5.3 META ROW + NUTRITION

**Meta row** (inside the title card, directly under the byline): **three equal
chips** in a row, 8px gap, 16px top margin.
- Each chip: fill `rgba(255,253,248,0.85)`, border `1px rgba(224,213,194,0.85)`,
  radius **14px**, padding 11px vertical / 6px horizontal, centred, stacked
  vertically as **icon → value → label**.
  - Icon: 16px, brand orange (`#E94B1F`).
  - Value: `#1A1815`, **14px**, weight **800**.
  - Label: `#8B847C`, **8.5px**, weight 700, letter-spacing 0.6px, UPPERCASE.
- The three chips:
  1. **Total** — clock icon; value = total/prep time (a string like "30 min",
     defaults to "30 min").
  2. **Difficulty** — speedometer icon; value shown as **"N/5"**. Mapping from the
     stored level: very easy → 1/5, easy → 2/5, medium → 3/5, hard → 4/5, very hard
     → 5/5; a numeric 1–5 is shown as-is; default 3/5.
  3. **Serves** — people icon; value = servings count.

**Nutrition** is shown as a panel **nested inside the "Recipe Details" card** (see
5.4 for that card), titled "Nutrition · per serving". It is **calories + protein
only — there is no macro (carbs/fat) display.**
- Panel container: fill `#FFFDF8`, border `1px rgba(94,122,71,0.28)`, radius 16px,
  padding 14×13px.
- Header: a 26×26px sage chip (fill `#DCE8CF`, radius 8px) with a speedometer icon
  (`#5E7A47`, 14px), the title "Nutrition" (`#1A1815`, 14.5px, weight 800) with
  "· per serving" in `#8B847C` (11px, 500), and a right-aligned "Settings" pill
  (fill `rgba(255,253,248,0.9)`, border `rgba(224,213,194,0.9)`, radius 999px,
  height 28px; cog icon 13px + "Settings" text `#3A342E` 11px 600).
- When shown, **two tiles** side by side (10px gap):
  - **Calories tile:** fill `#FCFAF3`, border `rgba(233,75,31,0.25)`, radius 14px,
    padding 14×13px. 40×40px icon chip (radius 12px, fill `#E94B1F`, white flame
    icon 19px). Value `#1A1815` **24px** weight 800 letter-spacing -0.6px, with a
    `kcal` unit in `#8B847C` (12px, 700) baseline-aligned. Label "CALORIES" in
    `#E94B1F`, 9.5px, 700, letter-spacing 0.7px.
  - **Protein tile:** fill `#EEF4E5`, border `rgba(94,122,71,0.25)`. Icon chip fill
    `#5E7A47` (sage), barbell icon. Value + `g` unit. Label "PROTEIN" in `#5E7A47`.

**Nutrition gating (CRITICAL for the public website):**
- In the app, calories show only if the user's **`show_calories`** flag is on (and a
  value exists); protein shows only if **`show_protein`** is on. These flags are set
  by the user during onboarding (the nutrition-visibility question) and via Gentle
  Mode, and are the single source of truth (founder decision Q4). Calories and
  protein gate **independently**.
- If both are off, the panel renders a **hidden placeholder instead of any numbers**:
  the text "Nutrition is hidden. Turn calories or protein back on anytime." plus a
  "Show" button (fill `#FBE3D2`, radius 11px, height 34px, text `#7A2410` 12.5px
  700). No numbers ever leak when off.
- The whole panel is hidden if the recipe has no usable nutrition data. A real `0`
  (e.g. 0 g protein) is treated as a value and IS shown when the flag is on.
- **Flag for the website:** a public shared recipe page has **no logged-in user and
  no per-user signal** to gate on. Decide a single public policy: always show
  calories + protein, always hide nutrition, or show only when the recipe author
  opted in. The per-user `show_calories`/`show_protein` mechanism does not exist on
  an anonymous public page. This needs a product decision (see open questions).

### 5.4 INGREDIENTS

- Section card: **amber-tinted** (fill `#FBF1D8`, border `rgba(176,133,31,0.22)`).
- Header (the shared section-header pattern): a 32×32px icon chip (radius 10px, fill
  = amber line `#B0851F`, white basket icon 16px), title "Ingredients List"
  (`#1A1815`, 18px, weight 800, letter-spacing -0.4px), a count "· N items"
  (`#8B847C`, 12px, 600), then a short accent rule beneath (42px wide, 2.5px tall,
  radius 2px, colour `#B0851F`).
- **One single inner box holds the whole list** (NOT a card per ingredient): fill
  `#FFFDF8`, border `1px rgba(176,133,31,0.3)`, radius 14px, padding 14px horizontal
  / 4px vertical.
- **Each ingredient is a checkbox row** (a cook-along affordance — this one IS
  web-appropriate; render as a real checkbox):
  - Checkbox: **24×24px**, radius 8px, **2px** border `rgba(176,133,31,0.5)`.
    Checked state: fill + border `#E94B1F` with a white check (14px). Checked text
    becomes `#8B847C` with strikethrough.
  - Row vertical padding 9px.
  - Text formatting: **`Name — quantity unit, preparation`**. The name is
    title-cased and bold (`#1A1815`, 15px, weight 700); the amount portion (" — 2
    tbsp, divided") is `#8B847C`, 14px, weight 500. Example: **"Olive Oil — 2 tbsp,
    divided"**. Overall line 16px, line-height 24px.
- **Grouping by source (optional):** if ingredients carry a `source`, the list
  splits into dot-headed sub-groups inside the same box, separated by a hairline
  (`rgba(176,133,31,0.22)`, top border, 10px top margin, 8px top padding):
  - Group header: an **8×8px** dot (radius 4px) + UPPERCASE title (`#1A1815`, 12.5px,
    800, letter-spacing 0.3px) + count "· N" (`#8B847C`, 12px, 600).
  - Groups + dot colours: **"From your photo"** (dot orange `#E94B1F`), **"From your
    pantry"** (dot green `#10B981`), **"Other"** (dot grey `#9CA3AF`). These are
    personalisation cues from app cook flows; a generic web recipe will usually just
    show the flat list.

### 5.5 METHOD / STEPS

- Section card: **orange-tinted** (fill `#FCFAF3`, border `rgba(233,75,31,0.18)`).
- Header: 32×32px icon chip (fill orange line `#E94B1F`, white restaurant icon),
  title "Method", count "· N steps", accent rule `#E94B1F`.
- **Each step is its own "step card"** (steps are stacked with 16px gaps):
  - Card: fill `#FFFDF8`, border `1px rgba(224,213,194,0.95)`, radius 14px,
    padding 13px, soft shadow `0 3px 10px rgba(26,24,21,0.05)`, with the faint
    internal ruled lines.
  - Header row (9px bottom margin, 10px gap): a **numbered badge** (30×30px, radius
    10px, fill `#E94B1F`, white number, 14px weight 800) + the label "STEP N"
    (`#8B847C`, 10px, 700, letter-spacing 1.2px, UPPERCASE) + an optional **timer
    pill** (fill `#FBE3D2`, radius 999px, clock icon 11px `#7A2410` + "N MIN" text
    `#7A2410`, 10px, 700).
  - Optional **step image** (if the step has one): a rounded image card, radius
    12px, height 160px, with 8px vertical margins.
  - Step text: `#1A1815`, **16px**, line-height 26px, letter-spacing 0.1px.
- **Numbering style:** explicit numbered badge (1, 2, 3 …) paired with the "STEP N"
  label. Numbers come from the data (`instruction.step`).
- **Timers:** optional per step; a number is rendered as "N MIN", a string is shown
  verbatim.
- Optional extras: if a recipe has a `sourceUrl`, a "View Original Recipe" link card
  appears above the steps (orange-tinted, shows the domain). If most steps have
  photos, a swipeable step-photo carousel with pagination dots is shown (app gesture;
  on web use a simple gallery).

### 5.6 TAGS / CHIPS

- **Important:** the recipe view does **NOT** render the goal/category chips from
  Section 1.1 (`goalColors`). There is no coloured tag-chip row on this screen.
- Category / dietary metadata is instead shown as **labeled "Recipe Details" rows**
  inside a **sage-tinted** card (fill `#EEF4E5`, border `rgba(94,122,71,0.22)`;
  header icon chip fill `#5E7A47`, title "Recipe Details", accent rule `#5E7A47`):
  - Each row: fill `#FFFDF8`, border `1px rgba(94,122,71,0.28)`, radius 13px, 8px
    bottom margin, padding 12–13px. A 36×36px icon chip (radius 11px, fill `#5E7A47`,
    white icon 18px) + a two-line label/value: label (`#5E7A47`, 9.5px, 700,
    letter-spacing 1px, UPPERCASE) over value (`#1A1815`, 15px, weight 700).
  - Rows shown when present: **Cuisine** (globe), **Diet** (leaf), **Allergies
    Avoided** (shield-check), **Equipment Needed** (wrench).
- For freshly-generated recipes there is also a one-line **personalisation callout**
  (a sparkles icon + grey text, `#757575`, 13px, 500), e.g. "Uses 3 of your
  ingredients · Italian · vegetarian".
- If the website wants actual coloured chips for cuisine/diet/category, it MAY use
  the Section 1.1 chip palette — but know that the app's recipe view uses the
  labeled-row treatment above, not chips.

### 5.7 ACTIONS

The recipe view's buttons. Most are app-only flows (creating cook sessions, saving
to a personal library, editing). On the public website, replace those with an
"Open in Just Cooked / Get the app" CTA, and keep only the genuinely web-friendly
actions (share/copy link, and the cook-along ingredient checkboxes which are local).

**Top header (round 38×38px buttons: fill `rgba(255,252,246,0.95)`, border
`1px rgba(224,213,194,0.9)`, radius 19px, shadow `0 2px 6px rgba(26,24,21,0.08)`):**

| Button | What it does | Web treatment |
|---|---|---|
| Back (chevron) | App navigation back | Back / breadcrumb |
| Save (bookmark) | Saves to the user's library; active = filled `#E94B1F` with cream icon | **App-only** → "Save in app / Get the app" |
| Favourite (heart) | Toggles favourite (heart fills red `#EF4444`); only when saved | App-only |
| Settings (cog) | Opens nutrition-visibility settings | App-only (per-user) |
| **Share** | Creates a share link + opens the native share sheet | **Replicate** — web share / copy-link |
| Edit (pencil) | Edits a custom recipe; only for user-created recipes | App-only |
| "Recipe" pill (book) | Jumps to the saved recipe during a cook | App-only |

**Bottom action bar** (translucent cream `rgba(252,248,240,0.96)`, 1px top border
`rgba(224,213,194,0.9)`). One context-dependent primary button (pill/rounded, radius
12–15px, white label 16px weight 600, icon + label):

| Button | Colour | Purpose | Web treatment |
|---|---|---|---|
| **Cook this recipe** | orange `#E94B1F`, shadow `0 6px 14px rgba(233,75,31,0.28)` | Start cooking a saved recipe | **App-only** → primary "Open in app" CTA |
| Cook This Recipe | orange | Pick this recipe in a multi-recipe session | App-only |
| Log This Cook | green `#10B981` | Mark a cook complete (+ streak hint line below) | App-only |
| Cook Again | orange | Re-cook a finished recipe | App-only |
| New Cook | green | Start a fresh session | App-only |
| Make a Copy | (section button, orange outline) | Duplicate into an editable copy | App-only (needs an account) |

The "Log This Cook" button shows a small streak hint beneath it (grey, 11px, 600),
e.g. "Log to keep your 3-day streak · 2/4 this week" — app-only.

### 5.8 ATTRIBUTION / SOCIAL

- **Byline** under the dish title: "By {author}". Author resolves to: the user's
  username (author is the current user), a custom author name, or **"Just Cooked"**
  for AI-generated recipes. An optional created date is appended: "By Just Cooked ·
  9 Jun 2026". Styled in orange (`#E94B1F` on the website), 14px, weight 600,
  letter-spacing 0.5px.
- **Provenance sub-labels** (small, `#757575`, 12px, 500): "Referenced by @username"
  and "Copied from @username" — permanent attribution shown on shared/copied
  recipes. Relevant to the website's shared page and the future social layer.
- **Cooked-count badge** (saved recipes): a small flame pill, "Cooked N times".
- **Share-performance card** (owner-only, Strava-style engagement): a row of four
  stats — **Views / Saved / Favorited / Cooked** (each a big number `#1A1815` 20px
  800 over a grey label) separated by thin dividers; expandable to show the
  avatars + handles of who saved/favourited ("@alex, @sam +4 more"). This is the
  social proof layer; the public web page could surface a lighter version (e.g. a
  view/save count) but the avatar lists are an in-app owner feature.
- On the public shared page specifically, a banner sits above the title: "Shared
  with you · Not in your library yet" (or "Your shared recipe" for the owner), and
  the byline reads "By {author} · @ownername".

### 5.9 STATES

Populated state is fully specified above. Briefly:
- **Loading** (shared page): a centred spinner (brand orange) with "Loading
  recipe…".
- **Not found / expired** (shared page): a link icon, "Recipe not found", and "This
  link may have expired or been removed." — relevant for the website (dead share
  links).
- Empty sub-states inside a populated recipe (e.g. "No past cooks for this recipe
  yet") are app-only and not needed on the public page.

### 5.10 RN-ONLY BEHAVIOURS (not applicable to web)

- **Reveal animation** for freshly-generated recipes: a full-screen overlay
  dismisses, then the hero (fade + scale 0.95→1), title (rise + fade), meta, and
  personalisation line stagger in (~150ms apart). N/A on web (optional to mimic with
  a light fade-in).
- **Haptics** throughout (tapping ingredients, finishing a cook, button presses):
  N/A on web.
- **Swipe/paging gestures** on the step-photo carousel and the full-screen photo
  viewer: N/A on web (use a standard gallery/lightbox).
- **Before/After photo toggle, camera-to-add-photo, thumbnail picker**: tied to cook
  sessions and device camera/library. N/A on web.
- The **ingredient cook-along checkboxes** ARE web-appropriate (local check state) —
  keep them.

### 5.11 The public "Shared Recipe" page (secondary — currently on the OLD theme)

The actual share-link page exists and is the closest thing to the website's target,
but it has **not been migrated to the V1.2c rebrand** — it still uses the legacy
white-card / `#FF4500` design. **Recommendation: the website should follow the
rebranded look in 5.1–5.10, not this legacy styling.** Documented here so you
recognise it and don't copy the old look by mistake:

- **Hero:** full-bleed image, height = **1.1 × content width** (portrait, taller
  than wide — note this differs from the rebranded detail screen's 0.82 ratio),
  `object-fit: cover`; if no image, an orange gradient (`#FF4500 → #FF7F50`). A top
  dark fade (`rgba(0,0,0,0.4) → transparent`, ~35% of hero height) keeps a floating
  white close button legible (close button: 40px, fill `rgba(0,0,0,0.35)`, radius
  20px, top-left).
- **Cards are plain white** (`#FFFFFF`) on a light-grey app background, with
  **centred** section titles (22px, 800). Legacy orange `#FF4500` is the accent.
- **Title** 32px, 800, letter-spacing -1px, line-height 38px, colour `#1A1A1A`.
- **Meta chips:** grey fill `#F3F4F6`, radius 8px, horizontal row; time shown as
  "{m} min" or "{h}h {m}m"; difficulty as a WORD (1 Very Easy / 2 Easy / 3 Medium /
  4 Hard / 5 Expert) — note this differs from the rebranded screen's "N/5"; "Serves
  N".
- **Ingredients:** grey rows (`#F9FAFB`, radius 12px), same "Name — qty unit, prep"
  formatting, but **no checkboxes** here.
- **Steps:** centred "STEP N · {timer}" headers, body text 17px, line-height 28px.
- **Nutrition:** calories + protein grid, gated by the same `show_calories` /
  `show_protein` flags (so the same public-gating question applies).
- **Bottom actions:** primary "Cook this recipe" (orange pill); secondary row "Save"
  + "Make My Copy" (hidden if the owner disabled copying); owner sees "This is your
  recipe". All require the app/account.

### 5.12 Open questions for the recipe view

1. **Public nutrition policy.** As above (5.3): an anonymous web page has no
   per-user `show_calories`/`show_protein` signal. Decide the public rule — always
   show, always hide, or author-opt-in.
2. **Photo-optional design.** Many recipes have no image and use the cream
   placeholder. Confirm whether the website should require/encourage a hero photo or
   keep the elegant photo-free placeholder. The detail hero is landscape (~0.82×
   width); the legacy share page is portrait (1.1× width) — pick one aspect ratio
   for the web hero.
3. **Which actions exist on the public page.** Confirm the website keeps only
   Share + (optionally) a "Get the app / Open in app" CTA, and drops the cook/log/
   save/favourite/edit flows (all need the app + an account). Should the cook-along
   ingredient checkboxes ship on web?
4. **Social/engagement surface.** Should the public page show any engagement
   counts (views/saves/cooks) or attribution beyond the byline, given the future
   social layer? The in-app owner analytics (avatars, handles) are not appropriate
   for an anonymous page.
5. **Rebrand the share page.** The live shared-recipe page (5.11) is still on the
   old white/`#FF4500` theme. Confirm the website is the new canonical public
   surface and that this divergence is expected (and whether the in-app share page
   should later be brought to the same rebranded look).
6. **Difficulty + time formatting.** Two formats exist in-app ("N/5" vs words like
   "Medium"; raw time string vs "Xh Ym"). Pick one convention for the website.
