# Just Cooked Website — V1.2c Rebrand Apply Plan

Audit-and-plan only. Read-only pass. Nothing in the site was edited. This document maps
the portable spec (`WEBSITE_REBRAND_SPEC.md`, sections 1 to 5) onto the actual codebase
and stages the execution work. Execution is a later prompt.

House style note for this document and all proposed copy below: no em dashes anywhere.

---

## 0. TL;DR and the one decision that blocks the recipe page

- The site is a **plain static HTML + vanilla JS** project (no build, no framework, no
  `package.json`). Tailwind runs from the **CDN with a per-page inline config**, plus two
  hand-written stylesheets (`styles.css`, `premium.css`) linked on every page. Inter is
  already loaded from Google Fonts on every page.
- The brand orange is **fragmented across three different orange families** and several
  files, with **no single token**. Inter and a warm-cream-ish background already partially
  exist, so two of the three rebrand pillars are half done. The widest change is recoloring
  every orange to `#E94B1F` and reconciling the cream surfaces.
- The **shared recipe page** (`api/recipe/[shareId].js`) is a Vercel serverless function.
  It currently renders the **legacy white-card look (spec 5.11)**, not the V1.2c notebook
  (spec 5.1 to 5.10). It also **intentionally blurs method steps 2+ behind a "Cook the full
  recipe in Just Cooked" gate** to drive app installs. That gate is a **conversion funnel
  (product decision), not styling**. The spec 5 target ("full method orange step cards")
  directly conflicts with it. **This is the single blocking question** (see section 8, Q1).

---

## 1. STACK

### What is actually here

| Concern | Reality |
|---|---|
| Framework | None. Standalone `.html` files, one per route. Header and footer markup is **duplicated by hand in every page** (no includes or partials), so any chrome change repeats across ~10 files. |
| Language | HTML5 + vanilla JS. One Node/ESM serverless function (`api/recipe/[shareId].js`). One ESM module script in the auth callback. No TypeScript. |
| Styling system | **Tailwind via CDN** (`https://cdn.tailwindcss.com`) configured by a **per-page inline `tailwind.config = {...}` `<script>`**, PLUS two linked stylesheets: `styles.css` (legacy custom) and `premium.css` (the active brand layer). `index.html` and `faq.html` add their own inline `<style>` blocks. The recipe page has its own fully self-contained inline `<style>`. |
| Routing | Clean URLs via `vercel.json` (`cleanUrls: true`): `/faq` serves `faq.html`, etc. One rewrite: `/recipe/:shareId` to `/api/recipe/:shareId`. Auth callback at `/auth/callback/index.html`. No client-side router. All nav and footer links are extensionless and depend on `cleanUrls`. |
| Build | **None.** `tailwind.config.js` exists at the repo root but is **inert** (the CDN runtime uses the inline per-page configs, not this file). No PostCSS, no npm scripts, no `node_modules`. |
| Hosting | **Both configured.** GitHub Pages (`.github/workflows/static.yml`, `CNAME` = `justcooked.app`, `.nojekyll`) and Vercel (`vercel.json` + `/api`). The dynamic `/recipe/*` and `/api/*` routes only run on Vercel, so **treat Vercel as the real production host**; GitHub Pages can only serve the static pages. |

### Where global styles, tokens, and fonts live today

- **Global styles**: there is no single global stylesheet. The de-facto globals are the two
  root files linked in every `<head>`: `styles.css` (loaded first) then `premium.css`
  (loaded second, wins on conflicts). `premium.css` is the **active brand layer**
  (`:root` tokens, glass utilities, `.nav-link-premium`, and the `.prose` typography that
  drives the policy pages). `styles.css` is older and partly superseded.
- **Theme tokens**: today they are scattered. `premium.css :root` holds `--primary-orange:
  #FF6B00`, a gradient, glass tokens, and text colors. `styles.css :root` holds a
  conflicting `--primary-color: #FF4500`. Each page's inline `tailwind.config` redefines
  `orange.500 #FF6B00 / orange.600 #E65D00` and `surface.*`. The recipe page hardcodes its
  own hex values inline.
- **Fonts**: Inter is loaded via a Google Fonts `<link>` on **every** page and again inside
  the recipe function. Weight sets are inconsistent: `index/faq/download` request
  `400;500;600;700;800`; the prose pages (`support`, `privacy`, `terms`, `cookies`, `eula`,
  `disclaimer`, `delete`) request only `400;500;600;700` (missing **800**). Inter is wired
  as the Tailwind `sans` family inline and in the `premium.css` body stack.

### How the spec tokens should land here

There is no compiled CSS pipeline, so tokens must land in the files that actually ship:

1. **Canonical token home = `premium.css :root`.** Define the full spec 1.1 palette there as
   CSS custom properties (cream ramp, ink ramp, orange family, sage family, plus shadows,
   radii, spacing). This file is linked on every static page, so it is the single best home.
2. **Mirror the brand orange into every page's inline `tailwind.config`.** Because Tailwind
   is CDN + per-page, any utility class a page uses (`text-orange-500`, `bg-orange-50`,
   `orange.600`, `surface.*`) resolves from the **inline** config, not from
   `tailwind.config.js` (which is inert). So `orange.500/600` must be remapped to the new
   brand values in each page's inline config, or those utilities will keep painting the old
   orange. Optionally add `cream.*` / `sage.*` to the inline palettes for new utility use.
3. **Fonts**: add weight **800** to the prose pages' Google Fonts `<link>` so the display
   scale is available everywhere; keep Inter on the CDN (confirmed decision: load real
   Inter). No self-hosting required unless desired.
4. **The recipe page is a separate surface.** It shares nothing with `premium.css`; its
   tokens and font link live inside the JS template string and must be rebranded **inside
   that file** as a distinct task.
5. **`styles.css`** holds stale, conflicting values (`#FF4500`, `#F97316`, `#EA580C`). Its
   legacy oranges and duplicate `body{}` / scrollbar rules must be reconciled (recolor or
   retire) so they stop fighting `premium.css`.

### Token-landing summary

> `premium.css :root` = canonical tokens. Replicate brand orange + any new utility colors
> into every page's inline `tailwind.config`. Add Inter 800 to the prose pages' font link.
> Recipe page handled separately inside `api/recipe/[shareId].js`. Reconcile or retire the
> conflicting values in `styles.css`. `tailwind.config.js` at root is inert; leave it.

---

## 2. PAGE INVENTORY

| Route (file) | Purpose | Category |
|---|---|---|
| `/` (`index.html`) | Marketing home / landing. Hero, bento feature grid, value-prop section, store CTAs, footer. | **CONTENT** |
| `/faq` (`faq.html`) | Product FAQ, four accordion topic groups, contact CTA. | **CONTENT** |
| `/support` (`support.html`) | How to get help: contact info (mailto + tel), what to have ready, common issues, response times. | **CONTENT** (preserve the `mailto:` and `tel:` links; everything else is restylable) |
| `/download` (`download.html`) | App download page. **Head script auto-redirects iOS/Android to the stores** before paint; desktop sees a fallback card with store buttons. | **FUNCTIONAL** (the redirect script + store URLs/IDs are off-limits; the desktop fallback card chrome and copy are restylable) |
| `/privacy` (`privacy.html`) | UK GDPR privacy policy. | **POLICY** |
| `/terms` (`terms.html`) | Terms of Use. | **POLICY** |
| `/eula` (`eula.html`) | End User Licence Agreement. | **POLICY** |
| `/cookies` (`cookies.html`) | Cookie and Tracking Policy. | **POLICY** |
| `/disclaimer` (`disclaimer.html`) | Medical, Allergy and AI Disclaimer. | **POLICY** |
| `/delete` (`delete.html`) | Account-deletion **instructions** (open app, Settings, Delete Account) plus data-retention statements. **Confirmed: no form, no API, mailto only.** | **POLICY** (container restructure only; do not reword the deletion steps or retention timelines without owner sign-off) |
| `/recipe/:shareId` (`api/recipe/[shareId].js`) | Server-rendered public shared-recipe page. Fetches from Supabase, tracks views, renders inline-styled HTML. Currently the legacy 5.11 look with a step-gate install funnel. | **FUNCTIONAL renderer with a large restylable presentation layer** (see section 5; treat all data/tracking/deep-link logic as off-limits) |
| `/auth/callback/index.html` | Supabase OAuth / magic-link callback. Exchanges code for session, redirects to `/`. | **FUNCTIONAL** (leave entirely) |

### Flags / ambiguities

- **`delete.html` is instructional, not a legal document and not a form.** It carries
  data-retention statements that read as compliance copy. Treat it as POLICY for the
  container restructure and do not reword the substance.
- **`download.html` is dual-natured**: a functional redirect page with a restylable desktop
  card. It is categorized FUNCTIONAL so execution treats the redirect script and store
  links as untouchable, but the visible desktop card is in scope for styling and copy.
- **The recipe renderer is the gray-zone case**: it is a functional file, but the brief
  names the shared recipe page as a rebrand target. The plan treats its data/logic as
  off-limits and only its presentation layer (the `<style>` block, static markup chrome, and
  visible non-legal copy) as in scope. Confirm this is intended (section 8, Q4).

---

## 3. DESIGN SYSTEM MAPPING (spec section 1 onto this codebase)

### 3.1 Colour tokens

Define the spec 1.1 palette once in `premium.css :root` as CSS variables, then remap the
old orange utilities. The current state has **three competing orange families** and several
neutral surfaces that must reconcile to the cream system. None of `#E94B1F` exists yet.

| Spec token | Value | Where it must land / what it replaces |
|---|---|---|
| `cream.base` | `#F5EFE6` | Flat fallback behind the marble SVG; replaces `#FAFAFA` body and `bg-gray-50`. |
| `cream.raised` | `#FBF6EC` | Card surfaces; replaces `glass-panel` near-white `rgba(255,255,255,0.7)`. |
| `cream.shadow` | `#E0D5C2` | Borders / hairlines; replaces `gray-100/200` borders. |
| `cream.ink` | `#1A1815` | Primary text; replaces `#111827` / `gray-900`. |
| `cream.inkBody` | `#3A342E` | Body text; replaces `#4B5563` / `gray-500`. |
| `cream.inkMuted` | `#8B847C` | Captions / fine print; replaces `gray-400`. |
| `orange.primary` | `#E94B1F` | The one brand orange. Replaces all of: `--primary-color #FF4500`, `#F97316`/`#EA580C`, `--primary-orange #FF6B00`, `orange.500/600 #FF6B00/#E65D00`, and the recipe page `#FF6B00/#FF4500/#CC2200`. |
| `orange.hot` | `#FF6B35` | Hover/active. Replaces `#E63E00` / `#E65D00` / `#E55D00` hovers. |
| `orange.soft` | `#FBE3D2` | Chip/badge fills; replaces `bg-orange-50/100` tints. |
| `orange.ink` | `#7A2410` | Deep orange for linework on cream. |
| `sage.*` | per spec | New. Practical CTAs, the recipe "Recipe Details" card and seal. No sage in the site today. |
| monogram gradient | `#FF6500 → #FF1500` | Logo mark only, distinct from CTA orange. The mark is the `JustCookIcon.svg` asset. |

**Conflicting global rules to reconcile (state, not yet fixed):**

- `styles.css` `--primary-color #FF4500` and hardcoded `#F97316` (`.nav-link`,
  `.cta-button`, scrollbar) and `#EA580C` (hovers).
- `premium.css` `--primary-orange #FF6B00`, `--primary-gradient` to `#FF8534`,
  `.nav-link-premium`, `.gradient-text`, `.prose li::before` bullet, `.prose blockquote`
  border.
- Each page's inline `tailwind.config` `orange.500 #FF6B00 / orange.600 #E65D00` (every
  `text-orange-*` / `bg-orange-*` / `hover:text-orange-*` utility in markup resolves here).
- **Duplicate `body{}` rules** (`styles.css` layout vs `premium.css` typography+bg) both
  apply; cascade order matters.
- **Duplicate scrollbar** definitions: `styles.css` orange thumb vs `index.html` inline gray
  thumb. De-duplicate to one cream/orange scrollbar.
- **Duplicate `.glass-panel`** definition: `faq.html` inline overrides `premium.css`.
- Home **rainbow feature icons** (blue, green, purple, gray) and a blue "Tailored" badge,
  plus a blue decorative blob, all clash with single-orange + sage.
- Home **value-prop section is fully monochrome** (gray circles, gray icons); brand color is
  absent where it should appear.

### 3.2 Type scale + Inter loading

- Inter is already the active font everywhere (CDN). **Add weight 800** to the prose pages'
  Google Fonts link so `hero/display` weights are available site-wide.
- Encode the spec 1.3 roles as utilities or component classes: `hero` 42/800/-0.8,
  `display` 34/800/-0.5, `subhead` 16/500, `body` 16/400/1.5, `label` 13/600 uppercase
  (+0.4). `premium.css` already sets `h1-h6 { letter-spacing: -0.02em }`, which is close to
  the spec's tight tracking and can be tuned per role.
- Optional mono stack (`ui-monospace, 'SF Mono', Menlo, Consolas, monospace`) for numeric
  meta chips if the "technical" readout feel is wanted on the recipe meta row.

### 3.3 Spacing, radii, shadows

- Spacing scale (4/8/12/16/24/32/48) and radii (8/12/16/24/999) per spec 1.4 to 1.5. Tailwind
  defaults are close; add the `pill` (999) and `xl` (24) radii where used.
- **Shadows must move from pure-black to ink-tinted.** Everything currently uses
  `rgba(0,0,0,...)`. Replace with the spec 1.6 set: card `0 12px 24px rgba(26,24,21,0.08)`,
  v3 card `0 16px 33px rgba(26,24,21,0.13)`, doorway `0 22px 46px rgba(26,24,21,0.16)`, and
  the orange CTA glow `0 8px 16px rgba(233,75,31,0.32)`.

### 3.4 Marble-cream live SVG background

- Confirmed decision: render the **marble-cream texture as a live SVG** (spec 1.7 recipe:
  base gradient + radial glows + `feTurbulence`/`feDisplacementMap` veins + fine grain), with
  **`#F5EFE6` flat fallback**. Apply it full-bleed behind the cream/default pages, replacing
  the `premium.css` body gradient (`#FFFFFF → #FFF7ED`) and the `#FAFAFA` body color.
- Implementation note: an inline SVG (data-URI or `<svg>` fixed behind content) avoids a
  raster asset and scales crisply. Set the flat fallback as the `background-color` so it
  shows before/instead of the SVG.
- **The recipe page is the exception**: it uses its own lined-notebook surface (spec 5.1),
  not marble. Do not put marble behind the recipe page.

### 3.5 paper-grain overlay (optional)

- Confirmed: include only if cheap. A single `body::after` with a tiled SVG `feTurbulence`
  noise at **4 to 6% opacity** is cheap and asset-free. Add it on cream pages; skip if it
  adds cost or muddies the marble.

### 3.6 CTA patterns

- **Primary CTA = orange fill pill** (spec 1.8): `border-radius: 999px`, height 56px,
  padding 24px, Inter 600/17, label color `#FBF6EC`, accent shadow
  `0 8px 16px rgba(233,75,31,0.32)`, `:active { transform: scale(0.96) }`.
- **Practical/secondary actions = sage fill** variant (`#6B8159` fill, cream text).
- Current CTAs are off-system: `.btn-premium` is black, the App Store / Google Play buttons
  are `bg-gray-900`, `.cta-button` is `#F97316`, and the FAQ "Contact Support" CTA is
  `bg-gray-900`. Introduce the orange pill as the primary, keep the black Apple/Google store
  badges as-is (those are platform conventions and the icons are brand-neutral), and move
  generic CTAs onto the orange/sage system.

### 3.7 Cards

- Card surface `#FBF6EC` (or frosted `rgba(251,246,236,0.72)` over texture), hairline
  `1px solid rgba(224,213,194,0.6)`, radius 16px (24px for large feature cards), and the
  ink-tinted shadows above. Replaces `glass-panel` near-white glass and the home
  `.bento-card`. The `glass-nav` header should move to a cream-tinted frosted bar.

---

## 4. CONTENT PAGES PLAN

### 4.1 Home (`index.html`)

**Current copy + styling (notable):**
- Badge "The Future of Home Cooking"; H1 "Your Kitchen." / "Reimagined." (rendered in a
  **gray** gradient, so brand color never appears in the headline); subhead "The advanced
  utility that transforms ingredients into delicious meals. Intelligent, intuitive, and
  tailored exclusively to you." CTAs are black/white store buttons.
- Bento features: "Photo Cook"; "Smart Recipe Generation" (badge "Tailored", body "Our
  algorithms craft unique recipes..."); "Dietary Protection" ("Safety is built into the
  core."); "Seamless Input". Rainbow icon colors + blue badge.
- Value-prop section "Designed for the Modern Lifestyle." with "Personalized Profile",
  "Cooking Journey", "Smart Pantry"; fully monochrome.
- Footer tagline "The intelligent cooking companion for the modern home."; copyright
  "© 2025 Hyaico Ltd...". Inline `<style>` overrides the scrollbar to gray.

**Rebrand changes:**
- **Hero gets the locked copy (spec 3.1).** Lead with the tagline **"Not perfect. Just
  cooked."** and the supporting line **"For when food feels hard."** Use the StoryBrand hero
  as the subhead: **"Food feels hard for a lot of people. Just Cooked helps you find your
  way back, one small meal at a time."** Primary CTA label **"Start where you are."** Render
  the headline in `cream.ink` with the brand accent present (drop the gray gradient).
- **Voice fixes (spec 3.2):** retire "advanced utility", "Our algorithms", "Dietary
  Protection / Safety is built into the core", "The Future of Home Cooking", "Designed for
  the Modern Lifestyle." Rewrite to a guide-to-a-friend voice with plain nouns and verbs, no
  triple cadence, no over-adjective phrasing, no em dashes. Keep feature substance (photo
  cook, recipe generation, allergy handling, voice/receipt input) but warm and plain.
- **Color/system:** recolor the rainbow feature icons and the blue "Tailored" badge to the
  orange + sage system; inject the accent into the monochrome value-prop section; convert the
  primary CTA to the orange pill; move surfaces to cream cards; de-duplicate the scrollbar.
- **Footer tagline** rewritten to brand voice. Note the **stale "2025" copyright** (today is
  2026): a content/legal line, flagged for owner sign-off, not a styling change.

### 4.2 FAQ (`faq.html`)

**Current:** four accordion groups (Getting Started, Smart Recipe Generation, Health &
Dietary, Privacy & Data). Glass-panel accordion items, orange hover, a `bg-gray-900`
"Contact Support" CTA, an own inline accordion + mobile-menu script. **Contains one real em
dash** in the allergy answer ("...avoid \"peanuts\"—it will also exclude...").

**Rebrand changes:**
- Restyle accordion cards to cream/orange; recolor hover from old orange; convert the dark
  "Contact Support" CTA to the orange pill (keep the `mailto:` href).
- **Remove the em dash** in the peanut answer (replace with a comma or full stop) per the
  binding voice rule. This is the one true em dash in visible copy on the static pages.
- Voice pass on superlatives ("maximize your experience", "perfect meal match every time")
  is optional and light. **Do not alter the substance of the privacy-related answers** ("We
  do not sell your personal data", data-sync claims): those overlap policy statements
  (section 8, Q11).
- **Keep the accordion JS contract**: `.faq-btn`, `.faq-answer`, `.open`, `aria-expanded`,
  `.mobile-menu`, `.hidden` class names must survive any markup restyle.

### 4.3 Support (`support.html`)

**Current:** H1 "Support" / "We're here to help"; contact box (`bg-orange-50` with
`bg-orange-100` icon circles) holding `mailto:support@justcooked.app` and
`tel:+443301333988`; "Before You Contact Us" list (orange `.prose` bullets); "Common Issues"
with internal links to `/faq` and `/delete`; "Response Times" ("24-48 hours"). Voice is
already warm and on-brand.

**Rebrand changes:**
- Recolor the contact box and icon circles to `orange.soft` / sage; recolor `.prose` bullets
  and links from `#FF6B00` to brand orange; move the card to a cream surface.
- **Preserve the `mailto:` and `tel:` links verbatim** (functional). Keep British spelling
  ("enquiries"). No copy rewrite needed beyond optional warmth; no em dashes present.

### 4.4 Download (`download.html`) — FUNCTIONAL, restyle the desktop card only

**Current:** head script UA-sniffs and `window.location.replace()` to the App Store / Google
Play **before paint**; desktop sees a glass card (H1 "Get Just Cooked™", subhead, "Available
for iOS 15.0+ and Android 8.0+") with black/white store buttons and an orange glow blob.

**Rebrand changes:**
- **Do not touch** the redirect script (lines ~9 to 27), the store URLs, or the store IDs.
- Restyle only the desktop fallback card: cream surface, ink-tinted shadow, recolor the
  `orange-200/20` glow blob and `hover:shadow-orange-500/20` to the new orange, convert any
  generic CTA styling to the system. Keep the Apple/Google store badges and their FontAwesome
  brand icons. Optional light voice pass on the subhead.

---

## 5. SHARED RECIPE PAGE PLAN (`api/recipe/[shareId].js`, spec section 5)

This page is server-rendered HTML inside a serverless function, with one self-contained
inline `<style>` block (roughly lines 250 to 579) and one inline client `<script>` (roughly
677 to 712). It currently renders the **legacy 5.11 look the spec warns against**, not the
V1.2c notebook. Rebranding it is a **separate execution surface** from the shared CSS.

### 5.1 What is OFF-LIMITS in this file (do not touch)

Supabase RPC fetch (`get_shared_recipe`) and env keys; view tracking (`track_share_view`);
bot detection; IP+UA SHA-256 hashing; device/store-link detection; deep-link + canonical URL
construction; caching headers and status routing; OG/Twitter meta; `apple-itunes-app` banner;
the client deep-link opener `<script>` and **all element IDs it binds** (`top-open-btn`,
`main-open-btn`, `mob-open-btn`, `side-open-btn`, `*-dl-btn`); every `${...}` data
interpolation and every `escHtml()` call (XSS-load-bearing); the adaptive step-1 clamp
value (computed in code). Only the static CSS, the static markup chrome, the decorative SVG
icons, and the **visible non-legal copy** are in scope.

### 5.2 Current vs spec-5 target (gap map)

| Spec 5 target | Current state | Gap / action |
|---|---|---|
| **5.1 Notebook lined background** (cream→tan gradient, 26px rules, vertical margin rule) | Flat `#F7F5F2`, no rules. | Add the lined-notebook surface (gradient + ruled lines + margin rule, or SVG). |
| **5.2 Hero = rounded image card at 0.82x width + cream placeholder** | Full-bleed banner, fixed 380/560px, title sits ON the image, no-image fallback is an orange gradient. | Rebuild as a rounded image card at ~0.82x content width; replace the orange fallback with the warm-cream placeholder (icon chip + caption). Confirmed: optional photo, cream placeholder, landscape 0.82x. |
| **5.2 Overlapping title card** | Title is white text on the hero. | Move the title into a separate `cream.raised` card overlapping the hero by -24px, orange-tinted border, byline beneath. |
| **5.3 Meta row: N/5 + time + serves** | Three inline pills already showing time, "Level N/5", "Serves N". | Difficulty already uses **N/5** (good) and time is the plain value (good). Restyle the inline pills into the spec's three equal stacked chips (icon → value → label) inside the title card. |
| **5.4 Amber ingredients box + cook-along checkboxes** | Plain white card, name/qty rows, **no checkboxes**. | Amber-tint the box, add the section header chip, and add **local cook-along checkboxes** (client-side, confirmed in scope). Ingredients are not gated, so checkboxes are safe here. |
| **5.5 Orange method step cards + timer pills** | **All steps in one card; step 1 clamped; steps 2+ rendered then blurred behind the install gate.** Per-step `timer`/`imageUrl` never rendered. | **Blocked by the gate decision (section 8, Q1).** If the teaser stays: restyle the visible step 1 as an orange step card and rebrand the gate. If full method is approved as a product change: render per-step orange cards with "STEP N" labels and timer pills. |
| **5.6 Sage Recipe Details rows** | A "Recipe Details" card exists (Cuisine/Diet/Allergens/Equipment) but white with multicolor icon tints. | Recolor the card to sage (`#EEF4E5`) with `#5E7A47` icon chips and the sage label treatment. Structurally close. (Label reads "Allergens Avoided" vs spec "Allergies Avoided" — copy nuance.) |
| **5.3 Nutrition panel, blurred + click-to-reveal** | **Entirely absent** (no calories/protein rendered at all). | Net-new. Confirmed decision: blurred by default with client-side click-to-reveal, nothing stored, no body/weight/calorie language. Requires reading `calories`/`protein_g` from the already-fetched recipe object and rendering the panel. See section 8, Q2 (the "CALORIES/kcal" tile label vs the no-calorie-language rule needs reconciling). |
| **5.8 Byline / attribution** | `authorLabel()` output inside a frosted glass pill on the hero. | Keep the `authorLabel()` logic; move the byline under the title card in brand orange ("By {author}"). No "Shared with you" banner unless wanted. |
| **5.7 Trimmed actions** (read, share/copy link, Open in Just Cooked) | "Open in App" + "Download Just Cooked" CTAs present (good). **No share/copy-link** anywhere. No cook/save/favourite/edit (correctly absent). | Add a **share / copy-link** control (client-side). Keep the Open-in-app and download CTAs and their element IDs. |
| Em dashes | Four `&mdash;` in `<title>`/footer ("Made with Just Cooked &mdash; Your kitchen companion", etc.). | Remove per the binding rule. Replace with a full stop or comma. |
| Colours / shadows | Legacy `#FF6B00`/`#FF4500`/`#CC2200`, cool grays, pure-black shadows. | Recolor to brand orange + cream ink ramp; switch shadows to ink-tinted. |

### 5.3 The lock-gate constraint (critical)

The step-blur gate is a **deliberate conversion funnel**: step 1 is truncated by a clamp
computed in code, steps 2+ are rendered as real text then obscured with `filter: blur(9px)`
+ `pointer-events:none` + `user-select:none` behind a glass panel whose CTAs drive installs.
**Rebranding the gate (recolor, new lock icon, new copy) is in scope; removing the blur,
unclamping, or rendering the full method is a product/growth change, not styling.** Hold for
the product decision in section 8, Q1.

### 5.4 Error pages

`renderNotFound()` and `renderError()` (the "Recipe not found" / "This link may have expired
or been removed." pages, spec 5.9) are safe to restyle and reword to the cream system.

---

## 6. POLICY PAGES RESTRUCTURE PLAN

All six policy pages (`privacy`, `terms`, `eula`, `cookies`, `disclaimer`, `delete`) are
built from one near-identical template. **The legal text is already cleanly separable from
its presentation**, which makes the requested "one styled container, plain text inside"
model straightforward.

### 6.1 Where styling is currently woven into the policy content

- **Container**: `main.min-h-screen.pt-32.pb-24.px-4... > div.max-w-4xl.mx-auto > [centered
  header div with `h1` + "Last updated"] + [div.glass-panel.rounded-2xl.p-8.md:p-12 >
  div.prose.prose-lg.max-w-none]`. All body text lives inside that single `.prose` wrapper.
- **Typography source**: the `@tailwindcss/typography` plugin referenced in the inline config
  is **inert under the CDN**, so the actual `.prose` styling comes from the **`.prose`
  overrides in `premium.css`** (heading sizes, `p` color, `ul` list-style none, `li::before`
  orange bullet, blockquote border). This is the real lever.
- **Per-element styling woven into the copy is minimal**, only three things:
  1. every section divider is `<hr class="my-8 border-gray-100">`;
  2. every email/external link carries `class="text-orange-500 hover:underline"`;
  3. **privacy only**: the §5.1 legal-bases table has hardcoded utilities
     (`overflow-x-auto` wrapper; `table.min-w-full.border-collapse.border.border-gray-200`;
     `thead.bg-gray-50`; `th.border.p-3.text-left`; `td.border.p-3`) plus one `p.mt-4`.
- No inline `style=""`, no forms, no fetch/API/auth, no analytics, no cookie banner. The only
  functional elements are the `mailto:support@justcooked.app` links, the nav/footer hrefs,
  the shared includes, and `script.js` (mobile menu).

### 6.2 Proposed clean structure

Create **one styled container that owns all typography and spacing via descendant
selectors**, so each policy body becomes paste-ready plain semantic HTML with **no classes
on any element**. Define the container styles in `premium.css` (replacing/retiring the
current `.prose` overrides) and strip the per-element utilities from the bodies (absorbing
the `hr`, link, and table styling into the container).

**Exact container shape to create (per page):**

```html
<main class="policy-page">
  <article class="policy-card">
    <header class="policy-head">
      <h1>Privacy Policy</h1>
      <p class="policy-updated">Last updated: 22/12/2025</p>   <!-- omit on delete.html -->
    </header>

    <div class="policy-body">
      <!--
        PASTE-READY PLAIN POLICY HTML LIVES HERE.
        Allowed elements only, no classes, no inline styles:
        h2, h3, h4, p, ul, ol, li, blockquote, hr, table/thead/tbody/tr/th/td,
        strong, em, a (mailto/external).
        Wording is dropped in verbatim and never edited here.
      -->
    </div>
  </article>
</main>
```

**Container CSS owns everything (in `premium.css`):**

```css
.policy-page   { /* marble-cream bg + page padding + max-width centering */ }
.policy-card   { background: var(--cream-raised); border: 1px solid var(--cream-shadow);
                 border-radius: 24px; box-shadow: 0 16px 33px rgba(26,24,21,0.13);
                 padding: clamp(24px, 4vw, 48px); }
.policy-head h1        { /* display scale, cream.ink */ }
.policy-updated        { color: var(--cream-ink-muted); }
.policy-body h2        { /* section heading scale + top spacing */ }
.policy-body h3        { /* sub-heading scale */ }
.policy-body p,
.policy-body li        { color: var(--cream-ink-body); line-height: 1.75; }
.policy-body ul li::before { content: "•"; color: var(--orange-primary); }
.policy-body hr        { border: 0; border-top: 1px solid var(--cream-shadow); margin: 32px 0; }
.policy-body a         { color: var(--orange-primary); text-decoration: underline; }
.policy-body blockquote{ border-left: 4px solid var(--orange-primary);
                         background: rgba(233,75,31,0.04); }
.policy-body table     { width: 100%; border-collapse: collapse; }
.policy-body th,
.policy-body td        { border: 1px solid var(--cream-shadow); padding: 12px; text-align: left; }
.policy-body thead     { background: var(--cream-pressed); }
```

This lets the founder drop in new policy copy by pasting plain HTML into `.policy-body`
without touching layout, and the `<hr>` dividers, link color, blockquote callouts, and the
privacy table all style automatically.

### 6.3 Hard rules and watch-outs for this restructure

- **Do not alter any wording.** Leave verbatim: the en dashes (–) in `privacy`/`cookies`
  bullets (these are not em dashes and are inside locked legal copy), curly quotes, the
  inconsistent "Last updated" date formats, the `©`/`™` differences between files, the
  US "License" vs UK "Licence" split in the EULA, and the data-retention timelines in
  `delete.html`. The container must **tolerate the missing "Last updated" line on
  `delete.html`**.
- **Keep functional bits**: `mailto:` hrefs, nav/footer links, `script.js` mobile-menu hooks
  (`.mobile-menu`, `.mobile-menu-button`, `.hidden`).
- There is a **malformed/unclosed `<li>`** noted in `disclaimer.html` §8. Recording only; do
  not "fix" wording or structure as part of styling unless explicitly approved.

---

## 7. EXECUTION SHAPE

Suggested staging with natural STOP points for review. Each stage is independently
reviewable; the recipe page and the gate decision are deliberately last.

**Stage A — Tokens, fonts, background foundation.** In `premium.css :root` define the full
spec palette (cream/ink/orange/sage), ink-tinted shadows, radii, spacing. Remap brand orange
in **every page's inline `tailwind.config`** (`orange.500/600`). Add Inter **800** to the
prose pages' Google Fonts link. Build the **marble-cream live SVG** with `#F5EFE6` fallback
and apply it to cream pages. Reconcile/retire the conflicting oranges and duplicate
`body{}` / scrollbar rules in `styles.css`. Optional 4 to 6% paper-grain overlay.
**STOP — confirm tokens and background render correctly across all static pages.**

**Stage B — Shared chrome.** Rebrand the duplicated header (`glass-nav` → cream frosted bar,
JC monogram + "Just Cooked" wordmark), footer, `.nav-link` styles, the orange-pill primary
CTA + sage variant, and the card surface. Applied across ~10 files (no partials).
**STOP — confirm chrome is consistent everywhere and JS hooks still work.**

**Stage C — Policy container restructure (section 6).** Introduce the `.policy-*` container,
move typography into descendant CSS, strip per-element utilities from the six bodies, drop in
the verbatim text unchanged.
**STOP — confirm all six policy pages render with wording untouched.**

**Stage D — Content pages.** Home (locked hero + tagline from spec 3.1, voice pass, recolor
rainbow icons, accent the value-prop section), then FAQ (restyle + remove the one em dash),
Support (recolor, preserve mailto/tel), Download (desktop card chrome only).
**STOP after Home, then STOP after the rest.**

**Stage E — Shared recipe page (`api/recipe/[shareId].js`).** Only after the Q1 gate
decision. Rebrand the inline `<style>` to cream/orange/sage + ink shadows; add the notebook
background, the rounded 0.82x hero card + cream placeholder, the overlapping title card, the
stacked meta chips, the amber ingredients box with cook-along checkboxes, the sage Recipe
Details, the blurred click-to-reveal nutrition panel, the byline, and a share/copy-link
action; remove the four em dashes. **Preserve every functional region and element ID from
5.1.** Restyle the not-found/error pages.
**STOP — this file is the most delicate; review carefully.**

### Files execution must NOT touch (the off-limits list)

- `vercel.json` (routing, `cleanUrls`, AASA header)
- `.github/workflows/static.yml` (CI/CD)
- `CNAME`, `.nojekyll`
- `.well-known/assetlinks.json`, `.well-known/apple-app-site-association` (app association)
- `auth/callback/index.html` (auth handshake; entire file)
- `api/recipe/[shareId].js` **functional regions**: Supabase fetch + env keys, bot
  detection, IP+UA hashing, view tracking, device/store-link logic, deep-link + canonical
  construction, caching headers, status routing, OG/Twitter + `apple-itunes-app` meta, the
  client deep-link `<script>` and **all element IDs it binds**, every `${...}` interpolation,
  every `escHtml()`, the adaptive clamp value, and the **lock-gate behavior** (blur/clamp/
  pointer-events/user-select and the CTA hrefs)
- `download.html` device-detect redirect script and store URLs/IDs
- Store badge links and app-store URLs in `index.html` / `download.html`
- `script.js` logic and its **JS class-name contract**: `.faq-question` / `.faq-btn` /
  `.faq-answer` / `.open` / `aria-expanded`, `.mobile-menu` / `.mobile-menu-button` /
  `.hidden`, `.scrolled`, `.animate-fade-in`
- All `mailto:` and `tel:` hrefs
- All legal/policy **wording** (and the FAQ privacy-claim answers' substance)
- The two App Store IDs (`id6741609869` vs `id6754169071`): do **not** normalize
- Hardcoded secrets (the anon JWT in the auth callback, the Supabase URL fallback): do not
  surface, move, or regenerate

---

## 8. OPEN QUESTIONS

These block or shape execution and need your decision. Spec-level questions already answered
by the confirmed decisions are not repeated.

1. **Recipe steps: teaser gate vs full method (BLOCKING).** The live recipe page deliberately
   blurs method steps 2+ behind a "Cook the full recipe in Just Cooked" install gate. Spec 5
   targets full orange step cards with timer pills. Converting teaser → full method is a
   **product/growth change**, not styling, and would remove the install funnel. Do we (a) keep
   the teaser and only **rebrand the gate** (recolor, new lock icon, reworded CTA), or (b)
   approve opening the full method as a deliberate product change? Everything else on the
   recipe page can proceed either way.

2. **Public nutrition panel specifics.** Confirmed: blurred by default, client-side
   click-to-reveal, nothing stored, no body/weight/calorie language. Two clarifications: (a)
   it is **currently absent entirely**, so adding it renders `calories`/`protein_g` from the
   fetched recipe data, which means reading those fields inside the serverless template (a
   small data touch in an otherwise off-limits file). OK to proceed? (b) The spec's nutrition
   tile literally reads "CALORIES / kcal" and "PROTEIN / g". How do we reconcile the
   "no calorie language" rule with a calories tile? Show only protein, show both behind the
   blur, or relabel?

3. **Editing the serverless recipe file for styling.** `api/recipe/[shareId].js` is a
   FUNCTIONAL file, but it is the shared recipe page the brief names as a target. Confirm that
   styling edits inside its template string (the `<style>` block, static markup, visible
   copy) are in scope, with all logic/IDs/escaping preserved per section 5.1.

4. **Header wordmark.** Confirmed: JC monogram + "Just Cooked" in Inter until an official
   lockup is supplied. The current logo asset is `JustCookIcon.svg` (an icon mark; the recipe
   topbar already uses it as a "wordmark"). Do we set the text "Just Cooked" beside the
   monogram now, or keep the icon-only mark until the official wordmark arrives?

5. **Two App Store IDs.** The marketing pages link `id6754169071`; the recipe page and
   `apple-itunes-app` banner use `id6741609869`. These look intentional (different listings).
   Confirm we leave both as-is and do not normalize during the rebrand.

6. **Stale and inconsistent legal/footer text (owner sign-off).** The footer copyright is
   hardcoded "2025" (today is 2026), the `©` symbol is present on some pages and missing on
   others, "Last updated" date formats vary, and the EULA mixes US "License" with UK
   "Licence". These are copy/legal, out of the styling scope. Do you want any of them
   corrected as part of this work, or left to a separate legal pass?

7. **FAQ vs policy substance.** The FAQ "Privacy & Data" answers make claims that mirror the
   privacy policy ("We do not sell your personal data"). Confirm we may do a light **voice**
   pass on FAQ copy but must **not** change the substance of those privacy claims.

8. **Phase palettes and dark stone on web.** Confirmed: cream + orange + sage by default,
   phase beats (rose/sky/terracotta) and dark stone only where a section earns it. For this
   pass, is any page expected to use a phase beat or dark stone, or should the whole site stay
   cream/orange/sage? (Affects whether we port the dark ink + glass tokens at all.)

9. **Stale project docs.** `README.md` and `CONTEXT.md` still describe a white/`#FF4500`,
   GitHub-Pages-only stack and an outdated nav. Out of scope for styling. Update them as part
   of this work, or leave them?

---

End of plan. No code, copy, styles, or config were changed in this pass. Awaiting review and
the section 8 decisions (Q1 in particular) before execution.
