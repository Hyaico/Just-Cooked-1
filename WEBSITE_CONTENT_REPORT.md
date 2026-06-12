# Just Cooked: Website Content and Messaging Report

_Compiled 2026-06-10. Source: a full audit of the live app (onboarding, the five tabs, the Support hub, recipes and cooking, pricing) plus the binding rebrand docs. No code was changed._

## What this document is

This is the **content and messaging** companion to `WEBSITE_REBRAND_SPEC.md`. The two split cleanly:

- `WEBSITE_REBRAND_SPEC.md` covers the **visual identity**: colour tokens, typography, textures, the RecipeCard, and the recipe page layout. Use it for how the site should look.
- **This report** covers **what the site must say**: the new positioning, every feature the rebrand introduced (Next Meal, the Support hub, and more), the value propositions, a ready-to-adapt FAQ, and the things the site must not claim. Use it for what the site should say.

The app is mid-rebrand, repositioned from a generic AI recipe and pantry app into a calm food support tool for the days food feels hard. Everything below reflects what is actually in the app today, with not-yet-shipped and sensitive items flagged so the site does not over-promise.

**House style for all published copy:** warm and plain, low-pressure, non-medical, never shaming, written in direct second person, with no em dashes and no rule-of-three cadence. The same rules the app holds itself to.

## Contents

- [1. Brand identity, positioning & voice](#1-brand-identity-positioning-voice)
- [2. The product at a glance: the five tabs & Next Meal flagship](#2-the-product-at-a-glance-the-five-tabs-next-meal-flagship)
- [3. The Support hub: the differentiator](#3-the-support-hub-the-differentiator)
- [4. Recipes, cooking, pantry & the social layer](#4-recipes-cooking-pantry-the-social-layer)
- [5. Onboarding & personalisation: what the website should echo](#5-onboarding-personalisation-what-the-website-should-echo)
- [6. Pricing, subscription & honest constraints](#6-pricing-subscription-honest-constraints)
- [7. Cautions, sensitivities & not-yet-shipped](#7-cautions-sensitivities-notyetshipped)
- [8. Frequently asked questions](#8-frequently-asked-questions)
- [9. Master must-mention checklist and value propositions](#9-master-mustmention-checklist-and-value-propositions)
- [10. Coverage notes and items to confirm](#10-coverage-notes-and-items-to-confirm)

---

## 1. Brand identity, positioning & voice

### 1.0 Executive summary

The site must reintroduce Just Cooked as a calm food support tool for the days food feels hard, not as a generic AI recipe or pantry app. It speaks to people across the whole range of relationships with food, from the everyday "what do I even cook tonight" friction through to harder days, and it does this without singling anyone out and without ever sounding clinical. Every page should hold the customer as the hero and Just Cooked as the steady guide that helps them find one doable meal at a time. The visual and verbal identity is locked: the name is always written "Just Cooked", the mark is the concentric-ring JC monogram with its own gradient, the brand accent is the V1.2c orange `#E94B1F`, and the locked website tagline set is "Not perfect. Just cooked." with the supporting line "For when food feels hard." and the primary CTA "Start where you are." The voice is a guide talking to a friend: warm, plain, low-pressure, non-medical, never shaming, with no em dashes anywhere. The longer-term "Strava of food" social vision can be hinted at as a direction, but it is not shipped and must not be presented as a live feature.

### 1.1 The repositioning story

Just Cooked has been deliberately moved from a utility into a support tool. The old product was a generic "scan your ingredients, generate a recipe" AI app whose pitch was convenience: what can I cook with what I have. The rebrand keeps those engines but changes what the product is *for*.

| | Old positioning | New positioning |
|---|---|---|
| Category | Generic AI recipe / pantry utility | Calm food support tool "for when food feels hard" |
| Lead message | Convenience, recipes from your ingredients | An emotional truth: food is not just food |
| Who it's for | People who want recipe ideas | Anyone whose relationship with food has friction, from everyday to deeper struggles |
| Promise | A meal plan | A system, and one doable meal at a time |
| Tone | Bright, utility, hype-adjacent | Warm, plain, low-pressure, non-medical, never shaming |

The repositioning is built on one thesis the site should lead with: food is central to a life. In the app's words, "It shapes your energy, your mood, your money, your goals, your headspace. When food feels hard, the cost shows up everywhere." From there the brand offers hope and agency: your relationship with food can change, you can stop overthinking it, and you can stop fighting food alone, one meal at a time.

The brand serves a genuine spectrum. It welcomes people with deeper struggles, but it is a support tool, not treatment. The everyday user and the struggling user should both feel addressed by the same warm copy, with no labels and no shame. The repeated in-app reassurance "No judgement" is core to this.

**Long-term vision.** The original "Strava of food" social ambition is preserved, not dropped. It is an explicitly deferred, multi-sprint direction. The site may gently hint at progress and community as where Just Cooked is heading, but must not describe a feed, followers, comments, or a leaderboard as shipped, and must never use the word "Strava" in customer-facing copy (it survives only as an internal dev comment in the codebase).

### 1.2 Name treatment and the JC monogram

These rules are locked (WEBSITE_REBRAND_SPEC.md §3.3, §2.7).

- The product name is always written **Just Cooked**: two words, capital J, capital C. Never "just cooked", never "JUST COOKED", never "JustCooked" in prose.
- The mark is the **JC monogram**: a concentric-ring "JC" symbol.
- The monogram has its **own gradient**, distinct from the brand CTA orange: `linear-gradient(135deg, #FF6500 0%, #FF1500 100%)` (top `#FF6500`, bottom `#FF1500`).
- The primary brand accent for everything else (CTA fills, selected states, links, the brand orange in general) is the V1.2c orange **`#E94B1F`**. This is the brand. Do not use the legacy Strava-style orange `#FF4500`.
- In the app the monogram appears at the top of the personalisation RecipeCard and in nav/branding; the hero brand object is a typographic "warm paper certificate" RecipeCard (cream paper, deep-orange linework, sage seal), not a food photo.

A note on the two oranges, because it is an easy and visible mistake: the CTA/brand orange (`#E94B1F`) and the monogram gradient (`#FF6500` to `#FF1500`) are intentionally different. The monogram is brighter. Do not "harmonise" them.

### 1.3 Taglines (and the locked-vs-app discrepancy)

The **locked website set** (WEBSITE_REBRAND_SPEC.md §3.1) is the canonical copy for the site and must be used verbatim:

| Role | Locked string |
|---|---|
| Tagline | `Not perfect. Just cooked.` |
| Supporting line | `For when food feels hard.` |
| Primary CTA | `Start where you are.` |

There is a real discrepancy the website team must not paper over. These locked lines and the StoryBrand hero **do not appear anywhere in the app code yet**. They exist only in the website spec. The app's current live positioning line is **`Just Cooked — for when food feels hard.`** (note the em dash, in `.claude/docs/rebrand-context.md`), and the in-app Hero, onboarding, and Support screens use their own live variants, for example:

- Hero headline (live app): "Let's find out what's making food hard."
- Hero subhead (live app): "Built for the days food feels hard. Not the days everything is going right."
- Support subtitle (live app): "For the days food feels hard."

So:

- **Use the locked set on the website.** Do not copy the app's older line.
- The app's `Just Cooked — for when food feels hard.` is the **old form to avoid**, not a model. It also contains an em dash, which the house style forbids.
- It is an **open founder question** whether the app will migrate to match the locked set. Do not present app copy and website copy as already identical.

### 1.4 StoryBrand hero line

The locked customer-as-hero narrative line (WEBSITE_REBRAND_SPEC.md §3.1) is:

> Food feels hard for a lot of people. Just Cooked helps you find your way back, one small meal at a time.

This frames the user as the struggling hero and Just Cooked as the calm guide. It pairs naturally with the locked tagline set on a hero section. Like the taglines, it is website-spec copy only and is **not yet verbatim in the app**, so do not imply the app already shows this wording.

### 1.5 Voice and tone rules (binding house style)

These are hard constraints from WEBSITE_REBRAND_SPEC.md §3.2. They apply to all suggested website copy.

- **Voice:** a guide talking to a friend, not a brand selling. Warm, plain, grounded. Acknowledge the struggle first, then offer the next small step.
- **No em dashes anywhere.** This is binding. Use full stops, commas, or restructure the sentence.
- **No triple cadence.** Avoid the "X, Y, and Z" rule-of-three rhythm and three-beat slogans.
- **No over-adjective phrasing.** Do not stack adjectives. Let plain nouns and verbs carry it.
- **No aggressive language.** Nothing pushy, hype, urgent, or shaming. Low-pressure, never alarming. This extends to colour: expiry and health states are warm, never red.
- **Direct second person ("you").** Offer agency and possibility without guaranteeing outcomes.

On-brand reassurance microcopy to reuse and adapt: "No judgement." / "Pick anything that sounds like you." / "Start where you are." These read as a friend, not a funnel.

A non-medical boundary is part of the voice, not a footnote. The app carries the line "Just Cooked is not a medical or therapeutic tool" on its Support and calculator surfaces, and the website must keep the same framing. Never position the product as medical, clinical, diagnostic, or as eating-disorder treatment. The ED-sensitive surfaces (the calorie/weight calculators and "I need to eat") are gated and discretionary in the app and must not be marketed as recovery care. Founder owns sensitive-content review, and an ED clinical/lived-experience review is still outstanding before those surfaces ship, so do not over-promise clinical safety.

One housekeeping point for consistency: the app currently mixes British "takeaway" and US "takeout", and mixes currency conventions. Pick one of each for the website and hold it.

### 1.6 Must mention / Must not say (identity)

| Must mention | Must not say |
|---|---|
| Name is always **Just Cooked** (two words, capital J, capital C) | "just cooked", "JUST COOKED", or "JustCooked" in prose |
| Locked tagline set verbatim: "Not perfect. Just cooked." / "For when food feels hard." / CTA "Start where you are." | The app's older line "Just Cooked — for when food feels hard." (it also carries an em dash) |
| Positioning is a food-relationship **support tool** for the days food feels hard | That it is a generic recipe / meal-planning app, or a medical, clinical, or eating-disorder treatment tool |
| Voice is a guide talking to a friend: warm, plain, low-pressure, never shaming; struggle first, then the next small step | Hype, urgency, pressure, shaming, or guaranteed outcomes |
| Serves the full spectrum, everyday friction through to deeper struggles, with "No judgement" | Singling anyone out, or implying clinical / recovery care |
| Brand accent `#E94B1F`; JC monogram uses its own gradient `#FF6500` to `#FF1500` | The legacy orange `#FF4500`; harmonising the two oranges |
| StoryBrand hero: "Food feels hard for a lot of people. Just Cooked helps you find your way back, one small meal at a time." (website spec copy) | Claiming the locked taglines or hero already appear in the app |
| The "Strava of food" social vision is a future direction only | Presenting a social feed, followers, comments, or a leaderboard as shipped, or using the word "Strava" to users |
| Any em dash, anywhere | (use full stops, commas, or restructure) |

---

## 2. The product at a glance: the five tabs & Next Meal flagship

The rebrand reorganises the whole app behind a new five-tab navigation. The old IA (Home / Pantry / Scan / Recipes / Profile) is gone. The standalone Scan tab and the floating camera button have been absorbed into the new centre tab. The result is a calmer map of the app, anchored by one flagship action: Next Meal.

### 2.1 The five tabs at a glance

| Tab | Route name | What it is | What it does at a glance |
|---|---|---|---|
| **Home** | `Home` | The daily hub | Opens with a warm, time-of-day greeting using your first name and a low-pressure line ("What feels possible today? Small steps count."). Shows a gentle weekly cooking tracker and your recent cooking activity (meals generating, ready, or cooked). |
| **Saved** | `Kitchen` | The combined Kitchen: pantry + recipes | One screen for "Everything you have, and everything you love." Two doorways: Pantry (what you have at home, with calm freshness tracking) and Recipes (your saved cookbook, organised into albums). |
| **Next Meal** | (centre tab) | The flagship guided meal builder | The elevated centre button. Decides and creates your next meal in three calm, guided steps, built from your pantry, a photo, an idea, or a saved recipe. Also holds a free "Log a cook" for meals you already made. |
| **Support** | `Support` | A calm toolbox for hard food moments | The only dark-themed surface. "A calm toolbox for the hard food moments." Holds the gentle, decision-free "I need to eat" path plus other support tools, chosen for you based on what you shared. |
| **Profile** | `Profile` | Your settings and saved defaults | Your permanent defaults (cuisine, diet, allergies, cooking time, equipment, servings) and preferences. Nutrition figures (calories/protein) appear across the app only when you switch them on here, in Profile > Nutrition. |

A note on the centre button: it is a single static Next Meal emblem. An earlier planned flame-to-camera cross-fade animation was reverted, so the website should not describe an animated or camera-style centre button.

### 2.2 Next Meal: the flagship

Next Meal is the primary way to decide and create a meal in the rebranded app. It lives on the elevated centre tab and reframes the old "scan ingredients then generate" utility into a warm flow built around lowering the friction of deciding what to eat. The in-app eyebrow is "Make the next meal easier", and the home card promises "We'll guide you, one calm step at a time."

#### The guided 3-step build

The big orange "Build your next meal" card opens a flow that takes one step at a time, then ends on a Review screen before anything is created.

| Step | In-app title | What happens |
|---|---|---|
| 1. Request | "What are you in the mood for?" | A craving box ("Type a craving, or leave it open.") with quick suggestion chips (Burger, Chicken wrap, Cheap dinner, Something easy, Comforting). Optional meal-shaping chips (High Cal, Low Cal, Healthy, High Protein) shape this meal only. |
| 2. Settings | "How it's made" | Pre-filled from your profile (cuisine, diet, allergies, cooking time, equipment, servings 1 to 8). The subtitle reads "Everything's pre-set from your profile. Tweak any of it for this meal." Includes a Strict pantry mode ("Only pantry + staples, no extras"). |
| 3. Source | "Where from?" | "Choose what the meal is built around." This is where the four sourcing methods live (below). |
| Review | "Here's exactly what we'll cook up" | A tap-to-edit summary of request, modifiers, diet, time, servings, strict pantry and source. "Tap any line to tweak it before we start." A "Create meal" button starts generation and returns you Home while it cooks. |

Every step carries a one-line reassurance that changes are temporary: "Changes here affect this meal only. Permanent defaults live in Profile." This is a hard guarantee in the rebrand. Per-meal tweaks (diet, cuisine, allergies, time, servings, strict pantry, modifiers) never change your saved profile defaults.

#### The four ways to find a meal

At Step 3 (Where from), there are four clearly framed sources. There is no "buy ingredients" path. Three of the four cook from what you already have.

| Source | In-app label | What it does |
|---|---|---|
| **Full pantry** | "Full pantry — Build it from everything you have" | Builds a meal around everything currently in your pantry, nothing to buy. |
| **Pick pantry items** | "Pick pantry items — Choose the specific ingredients to use" | Choose the exact ingredients this meal is built around, with search and select-all, then cook from just those. |
| **Snap ingredients (photo scan)** | "Snap ingredients — Photograph what you've got, review, cook" | Photograph your ingredients with your phone camera, or pick from your library. The app reads them ("Reading your photo...") and shows a confirmation step (below). |
| **From an idea** | "From an idea — No pantry needed, just your request" | Cooks purely from your request with no pantry required. Type or pick a craving and it builds the meal. This is the path that always works, even with an empty kitchen. |

The "use-expiring-ingredients" path: there is **no** dedicated "use expiring food" button inside Next Meal. Expiry is surfaced in the Pantry (an expiring count and calm, never-red freshness badges). Cooking from food that is going off happens through the pantry sources above, not a separate Next Meal action. The website should not promise a one-tap "cook my expiring items" button.

#### The photo scan: how the old Scan tab and camera button were absorbed

This is one of the clearest before-and-after stories in the rebrand, and worth being precise about on the website.

- **Old:** a separate Scan camera tab plus a floating camera button were the main entry point to generating a recipe.
- **New:** both are gone. Photo scanning is now just one of the four sources inside Next Meal ("Snap ingredients"), and it uses your phone's native camera or photo library rather than an in-app camera surface.

After the photo is read, you land on a check screen titled "We spotted these", with the line "Remove anything wrong, fix the amounts, or add what we missed." You confirm with "Looks right, continue." The scan result is always editable before anything cooks, so a misread never forces you into the wrong meal.

#### Cook from a saved recipe (skip ahead)

From the Next Meal home, under "Or skip ahead", you can choose "Cook from recipe", which jumps to your saved recipes in the Kitchen (Saved) tab to cook one you already have. It is a shortcut past the guided flow, not a fifth generation method.

#### Log a cook (free, no AI, no credits)

Also under "Or skip ahead" is "Log a cook", a composer for meals you already made. It uses no AI and no credits. It captures a name, an optional photo or before-and-after photos, meal type, a description, and an optional takeaway flag ("Was this a takeaway? We will track it, but it will not count as a saved meal."). Logging a cook keeps your kitchen history, streak and takeaway savings complete. Along with the I Need to Eat fallback, it is one of the only genuinely free, no-credit actions.

### 2.3 "I Need to Eat": the zero-friction path

For the hardest days, there is a deliberately decision-free path. Important for the website: **it lives in the Support tab, not inside the Next Meal tab.**

"I need to eat" is one tap. It finds the simplest possible roughly five-minute meal from your pantry, with no decisions and no calorie or macro numbers. The framing is gentle and never shaming: "When it all feels like too much, let us take the deciding off your plate. Anything you eat counts, and any amount is enough." If your pantry is empty, it gives a kind "grab something" suggestion instead of an error.

This surface is sensitive, ED-safety content. Keep any website copy non-medical, low-pressure and never shaming, and never reposition it as a diet or calorie tool. Pre-launch safety review of this copy is the founder's responsibility.

### 2.4 Suggested website copy (warm, plain, house style)

> **Your next meal, decided for you.**
> Tap the centre button and we will guide you, one calm step at a time. Tell us what you fancy, tweak how it is made if you want, and pick where it comes from. We will handle the rest.

> **Four easy ways in.**
> Cook from your full pantry, hand-pick a few ingredients, snap a photo of what you have, or just start from an idea. There is always a path, even with an empty fridge.

> **Already cooked something? Log it for free.**
> No recipe, no fuss. Logging a meal you made keeps your kitchen history and savings complete.

### MUST mention in this section

- Next Meal is the **flagship centre tab** and the primary way to decide and create a meal, opened from the elevated centre button in the new 5-tab nav (Home / Saved / Next Meal / Support / Profile).
- It is a **guided 3-step flow** (What are you in the mood for > How it is made > Where from) followed by a Review screen, described in-app as "We'll guide you, one calm step at a time."
- There are **four ways to source a meal**: your full pantry, hand-picked pantry items, a photo of your ingredients (Snap ingredients), or From an idea (request only, no pantry needed); plus a skip-ahead to cook from a saved recipe.
- The **old in-app Scan tab and the floating camera button are gone.** Photo scanning now lives inside Next Meal and uses your phone's native camera or photo library, then a "We spotted these" / check-the-scan confirmation step.
- **Per-meal tweaks** (diet, cuisine, allergies, time, servings, strict pantry, modifiers) apply to this meal only and never change your saved profile defaults.
- **Log a cook is completely free**, uses no credits and no AI, and is for meals you already made.
- **I Need to Eat** is the zero-friction, decision-free, number-free path, and it lives in the **Support tab, not inside Next Meal.**

### Things to handle carefully (not customer-facing claims)

- **Do not state per-meal credit costs as a price.** Generating a meal (pantry, photo, or From an idea) needs an active subscription or trial, and non-subscribers hit a paywall. Frame generation as included in the subscription or a daily allowance, not a per-meal charge, and do not imply unlimited free generation. Credit-limit copy is gentle: "You're going strong today. You've reached today's limit, it resets tomorrow."
- **One recipe per cook.** There is a soft cap of one recipe per cook right now, and the 1/2/3 recipe picker is hidden. Do not market receiving or choosing multiple recipes per cook.
- **Nutrition is opt-in.** Calorie and protein figures appear anywhere only when the user switches them on in Profile > Nutrition. Do not imply calorie tracking is on by default or central to Next Meal.

---

## 3. The Support hub: the differentiator

The Support hub is the single biggest reason Just Cooked is no longer a recipe app. It is a fifth navigation tab (live at `src/screens/support/SupportNavigator.tsx`, mounted in `TabNavigator.tsx`) presented as **a calm toolbox for the hard food moments**. It carries a distinct visual identity from the rest of the cream app: a dark midnight-plum / navy theme with baby-blue and dusty-rose accents. This is where the rebrand earns its new positioning, "for people with different relationships with food," and it must be the centrepiece of the website.

> **Note for the site team:** The old `src/screens/SupportScreen.tsx` ("Coming soon" placeholder) is no longer mounted. Do not source website copy from it, and do not describe Support as "coming soon." The hub is shipped. The live home screen is `src/screens/support/SupportHomeScreen.tsx`.

### 3.1 How the hub is built (personalisation first)

The most important structural fact: **the hub is personalised, not a fixed feature list.** Tools are auto-curated from the user's onboarding answers (struggle signals, impact areas, goals) in `supportCuration.ts`, so two people see different hubs. The site must never present "everything below" as what every user gets by default.

| Default state | What ships in it |
|---|---|
| On by default for most users | Panic button, Gentle mode, Takeaway help, Choose focus |
| Off until relevant or chosen | I need to eat, Weight goal, Protein goal |
| Always pinned first | Panic button (though it is now itself toggleable in Manage Tools) |

Users stay in control. In **Manage Tools** (cog icon, top right) they can toggle any tool on or off and drag to reorder which cards show on the hub. They can also long-press to reorder cards directly on the hub. Curation-enabled tools are marked **Recommended for you**. The number-producing calculators are labelled **Not recommended for you** for users flagged by the ED gate (see 3.9).

Real copy to reuse: the hub header eyebrow is **"Yours, when you need it,"** the title and subtitle are **"Support — A calm toolbox for the hard food moments,"** and the struggling section reads **"If you're struggling."**

### 3.2 Panic button (grounding / crisis flow)

Pinned first for anyone struggling right now. The hub card carries the eyebrow **"IF YOU'RE STRUGGLING RIGHT NOW"** and the copy **"Panic button — Tap and we'll steady things, slow breathing, your reasons, and someone to call. It's okay to need this,"** with a **"Press for help"** button.

The Panic screen opens calmly with the title and sub **"Let's slow it down. You're okay. One small thing at a time."** It holds:

- Your own saved reason for looking after yourself (default: **"I want to feel calm around food, and proud of looking after myself."**)
- A **"Start breathing"** entry into the guided meditation (card copy: **"Breathe with me — 2 minutes · in for 4, out for 6"**)
- Your trusted people to call (tap to dial, add photos), with an **"Add someone to call — A person you trust"** option
- Resource rows for **"Support lines by country"** and **"Finding the right help"**
- A gentle exit: **"I'm okay now"**

Important: this is not a crisis line. It is a grounding surface that signposts outward. Default-on but user-toggleable.

### 3.3 I need to eat

A one-tap, no-decisions path to a simple meal you can make in about 5 minutes from what is already in the pantry, for the hard days when eating feels like too much. No calorie or macro numbers, no choices. If the pantry is empty it offers a calm "grab something simple" message instead of an error.

Real copy: the hub card reads **"I need to eat — For when eating feels hard. A meal you can make in about 5 minutes, so eating something stays easy on the hard days. Any amount counts."** Inside, the screen says **"When it all feels like too much, let us take the deciding off your plate. Anything you eat counts, and any amount is enough."** The action is **"Find me something now."** The reassurance line is **"There's no right amount and no wrong choice here. Eating something is always worth it, and we're proud of you for showing up."** The empty-pantry fallback is **"No need to cook. Toast, a banana, yoghurt, cheese and crackers, or anything already to hand all count."** This tool is off until relevant or chosen.

### 3.4 Gentle mode

Five softening toggles that quiet the parts of the app that can add pressure. The hub card reads **"Gentle mode — Softening the app so food feels lighter"** and shows On/Off plus chips for whichever softeners are active. The screen subtitle is **"Food help, no numbers or pressure."**

| Toggle | What it does |
|---|---|
| Hide streaks | Removes streak counts |
| Hide goals | Removes the Home progress tracker |
| Hide calories | Hides calorie figures **app-wide**, not just on this screen |
| Hide protein | Hides protein figures **app-wide** |
| Soften expiry language | Shows "Good for now" instead of dates |

The calorie and protein toggles are not cosmetic to this screen. They control visibility everywhere in the app, including the calculators, their progress bars, and the Protein hit / Calories hit tracker options. The site can lean on this honestly: numbers are optional and the user can switch them off completely.

### 3.5 Guided meditation (breathing)

A guided box-breathing session: six slow rounds (about 2 minutes), breathe in for 4 seconds, hold for 4, out for 6, with a breathing orb that grows and shrinks with each phase and rotating reassurance lines. It does **not** auto-start. A calm "ready" screen first reflects the user's saved reason back to them, then begins only when they tap **"Begin when you're ready."** It pauses automatically when the user leaves or backgrounds the app.

Real copy: **"Let's take a moment. Six slow rounds, together. There is nothing to get right."** The reflective opener is **"YOU CAME HERE BECAUSE … That takes real courage. We'll go gently."** (with a no-reason fallback, **"Whatever brought you here, you don't have to carry it alone right now."**). Reassurance lines include **"You are safe. This feeling will pass."** and **"One breath at a time is more than enough."** Completion: **"You did that. Be proud of yourself."**

### 3.6 Calming sound (ambient audio): now live

The meditation has an optional **"Calming sound"**: a soft, looping ambient pad that plays only while the user is actively breathing (begin-gated; it stops on pause or leave). This is **now live**. A real ambient track is bundled at `assets/audio/meditation-ambient.mp3`, confirmed in `meditationAmbientAsset.ts`. Playback is backed by `expo-video` playing the audio-only source on loop, so it shipped without a native rebuild.

The control has three states in copy, so be precise on the site:

- On and available: **"A soft ambient sound will play while you breathe."**
- Off but available: **"Add a soft ambient sound while you breathe."**
- Unavailable fallback: **"A calming ambient sound is coming soon."**

Since the track is bundled, the live experience is the first two states. The third is an honest fallback that only appears if the asset is ever removed. Marketing copy should describe the sound as available, with the option to leave it off for silence.

### 3.7 Takeaway help (savings encouragement)

Shows what the user has saved by cooking instead of ordering in, derived from their completed cooks and the average takeaway cost they enter. The card carries the eyebrow **"SAVED BY COOKING INSTEAD"** (green card). The screen says **"Look how much you've saved"** and **"Every meal you cook or log instead of ordering adds up here,"** with the hint **"Pop in what your usual takeaway costs. Every meal you cook or log adds that amount."**

Behaviour the site must get right:

- Savings are **real**, computed at read time as completed meals multiplied by the average cost entered. They are never a stored running total.
- A meal logged as an actual takeaway is excluded from savings.
- With no average cost entered, savings show as zero or a placeholder, so do not imply automatic savings without setup.
- Viewable over Week / 30 days / 6 months / Year, with a "this week" delta.
- An optional **Savings goal** card shows progress ("% there") with the promise **"We'll celebrate when you hit it."**
- From here the user can make **"Money saved"** their single Home progress tracker via a "Show on Home" toggle.

Frame this as encouragement, never judgement. Do **not** quote specific savings figures as if typical. They are personal and derived.

### 3.8 Trackers and the single-active-tracker rule

**Choose focus** lets the user pick one gentle, doable thing to follow this week. The screen title is **"Choose your focus,"** with the sub **"One focus shows on your Home progress tracker. Change it any time, no streaks lost."**

The picker options live today are:

| Focus | Copy |
|---|---|
| Meals eaten per day | "Hit your daily meal count" |
| Protein hit | "Days you reached your protein" (hidden if protein is hidden) |
| Calories hit | "Days within your range" (hidden if calories are hidden) |
| Logged one meal today | "One logged meal a day, a simple daily check" |

Plus **Money saved** (turned on from Takeaway Help, not picked here) and the neutral default, **Home-cooked days**.

The defining rule: **only one focus is active at a time.** Choosing a new focus replaces the old one. It never adds a second. Switching does not lose streaks. The weekly goal is adjustable 1 to 7 days (default 4), the week starts Monday, and Home and the Trackers screen share one source of truth so they always agree about the same week. The site should not imply users juggle many simultaneous goal dashboards. When Gentle mode hides goals, the screen says **"Gentle Mode is hiding goals right now."**

> **Not-yet-shipped caution:** A broader self-report check-in pipeline (`trackerService.ts`) is created but **unwired**, and its tracker vocabulary is a draft not yet ratified. Tracker types named in older plans (for example "Days without takeaway," "Used expiring food," a full self-report check-in) are **not** all live in the current picker. Do not advertise a complete daily check-in system as shipped. List only the options above.

### 3.9 The calculators (Weight Goal / Protein Goal): optional, gated, estimate-only

Two optional number tools for users who find a target helpful, "at your own pace." Both default **OFF** and are never auto-recommended.

**Weight Goal** estimates a daily calorie figure from weight, height, age and sex using a standard Mifflin-St Jeor calculation (confirmed in `CalcScreen.tsx`). The user picks Lose / Maintain / Gain. The Lose path is deliberately gentle, about 0.4 kg per week, and the estimate is floored at 1200 kcal so a deficit can never produce an unsafe figure. Copy: title **"Your weight goal,"** sub **"We use your details to estimate the daily calories to reach your goal at a steady, healthy pace,"** result note **"A gentle ~0.4 kg per week. An estimate, not a target. Adjust any time, no pressure,"** shown under a **"Daily estimate"** label.

**Protein Goal** estimates a daily protein target in grams from bodyweight and goal (Sustain / Build / Lean), using grams per kilogram of bodyweight. Copy: title **"Your protein goal,"** sub **"Based on your body and goal, here's a daily protein estimate to aim for across your meals,"** result note **"A gentle guide spread across your meals, not a strict target,"** shown under a **"Protein estimate"** label.

Both screens carry this verbatim disclaimer (confirmed in code): **"Just Cooked is not a medical app. These are gentle estimates, not advice."** The website must carry the same estimate-only, non-medical framing and must not present these figures as clinical targets or weight-loss promises.

Two more details worth stating on the site:

- **Body details are collected only inside these tools, at the point of use, never in onboarding.** Opening and saving a tool is the user's own consenting action. The tools read and write the same body details as the profile, so the two never drift.
- **Today progress** (logged total vs goal, plus a streak line) only shows when the matching number is visible and a goal is saved. It is hidden entirely for users who have turned calorie/protein numbers off.

### 3.10 The safety net

The Support tab carries a built-in, **non-clinical** safety layer. It signposts outward to qualified professionals and verified helplines. It is not a crisis service and never auto-contacts anyone.

**Support lines by country.** A searchable directory listing one verified eating-disorder helpline per country (or, where none exists, the best-available mental-health line). Each row shows the flag, organisation, number as published, staffed hours, and an optional note. Tapping a row dials the local number. Subtitle: **"Support lines by country — Real support, wherever you are,"** footer: **"These lines are best reached from within each country. If you are in immediate danger, call your local emergency number."**

Coverage is **12 countries only**, and the site must not imply global or complete coverage:

| Region | Countries (verified line each) |
|---|---|
| ED-specific lines | UK (Beat), US (ANAD), Australia (Butterfly Foundation), Canada (NEDIC), Ireland (Bodywhys), France, Germany, Netherlands, New Zealand |
| Best-available mental-health line (no national ED line) | India, Singapore, South Africa |

Sourcing was careful: data was researched from each organisation's official site and re-verified from a second source, and the discontinued US NEDA line is deliberately excluded in favour of the active ANAD line. The site can lean on this credibility point carefully, but should **not publish specific numbers**, which can drift and which the code flags for founder re-verification before launch. Describe the in-app directory instead.

**Personal emergency contacts.** Users save their own trusted people (name, phone, optional photo) to call in one tap from the Panic screen. Copy: **"Add someone to call — A person you trust to reach in a hard moment."** This is private, user-controlled data stored on the user's own preferences. The app does **not** auto-call, alert, monitor, or dispatch. It only helps the user place a call themselves. Frame it that way.

**Finding the right help.** An evergreen, deliberately number-free guide that hands off to the verified country list. Header: **"Finding the right help — Reaching out is a brave first step."** It covers talking to your doctor (**"A GP can listen without judgment and connect you with specialist eating disorder care"**), telling someone you trust, using a staffed support line, and what to do in an emergency (**"If you feel unsafe or in danger, call your local emergency number right away"**).

**ED-safety gating (automatic).** Self-reported onboarding disclosures automatically flag eating-disorder risk. For flagged users, the weight and protein calculators are never auto-recommended and are labelled **"Not recommended for you,"** tutorials never teach calorie/protein/weight numbers, and any hidden nutrition tracker quietly falls back to a neutral home-cooked view. This is a softening and labelling layer only. It is **not** a clinical screening, assessment, or diagnosis, and it never changes any calculation. The site must not foreground calorie or weight tracking as a headline feature.

> **Caution on the breadth of the gate:** The live gate keys on serious `issue_tags` only. A wider draft gate (adding `impact_areas` + `eating_pattern` signals, `ED_RISK_DRAFT_FOR_REVIEW` in `supportCuration.ts`) is **not active**, pending the founder's clinical sign-off. Do not market a wider automatic safety net than is actually shipped.

> ### Sensitivity & what we must NOT claim
>
> This section touches people's relationship with food. Hold it carefully. The following are hard limits for any website copy.
>
> - **Just Cooked is not a medical, therapeutic, clinical, or treatment tool, and is not a substitute for professional care.** The app states this verbatim: "Just Cooked is not a medical or therapeutic tool. In crisis, please reach a professional or a line below." The website must carry the same disclaimer on sensitive surfaces and must not imply treatment, diagnosis, therapy, or counselling.
> - **Do not claim the app treats, diagnoses, cures, manages, or is clinically validated for eating disorders or any condition.** It does not diagnose anyone. The ED gating is a self-report-driven visibility layer, never an assessment.
> - **Do not present the Support tools as a crisis line or emergency service.** They signpost to external professionals and helplines, and tell users to call local emergency numbers if in danger. Do not promise the app will detect a crisis or intervene.
> - **Do not describe emergency contacts as alerting, monitoring, dispatch, or auto-notification.** The app only helps the user place a call themselves.
> - **Do not lead with diet, weight-loss, calories, macros, before/after, or streak pressure.** The number tools are optional, off by default, gated, and hidden for at-risk users. Leading with them contradicts the brand and the safety model.
> - **Do not publish specific helpline numbers or imply the 12-country directory is global, complete, or guaranteed current.** Numbers drift and require pre-launch re-verification. Describe the in-app list instead.
> - **Do not quote specific savings, streaks, or calorie figures as typical features.** They are personal, derived, and intentionally de-emphasised.
> - **Do not advertise the wider ED-risk gate, the unwired tracker check-in pipeline, or any "coming soon" tile as shipped.**
> - **House style is binding:** no em dashes, warm, plain, low-pressure, non-shaming, non-medical. Match the app's register: "Any amount counts," "no right amount and no wrong choice," encouragement never judgement.

### 3.11 New vs old, in one line

The old generic AI recipe and pantry app had no support surface at all (at most a "coming soon" placeholder). The rebrand adds a whole fifth tab that meets people on the hard days, not just the easy ones: a working panic and grounding flow, guided breathing with live ambient audio, a decision-free "I need to eat," Gentle mode that strips out the pressure mechanics most food apps lean on, a verified 12-country helpline directory, and ED-aware gating that hides number tools for at-risk users. It is, deliberately, the opposite of a typical calorie-tracking food app, and it is the heart of the new identity.

---

## 4. Recipes, cooking, pantry & the social layer

This is the heart of Just Cooked: the loop where an idea or a photo becomes a recipe, a recipe becomes a cook, and a cook becomes a quiet, private record you can look back on. This section covers AI recipe generation, cook sessions and before/after photos, the Saved cookbook, the Pantry with calm expiry tracking and receipt scanning, recipe sharing with attribution, the owner-only share-performance stats, the cook history grid, and Profile identity. It also flags everything that is gated, deferred, or sensitive so the website never over-promises.

### 4.1 MUST mention (non-negotiable for the site)

These come straight from the audit. Get them wrong and the site misrepresents the product or breaks the brand's ED-safe, non-medical positioning.

- **Recipes are AI-generated inspiration, not guaranteed instructions.** They are meant as a starting point, not certified culinary or nutritional advice. The user is always the final judge of what is safe and right for them.
- **Photo detection is camera-based, vendor-unnamed.** Describe it as "point your camera at your ingredients," never as a specific AI vendor. (Internally it is Google Vision today, with GPT-Vision planned later. Do not name either on the site.)
- **Sharing is opt-in and link-based.** Recipes are private by default and only become shareable when the user creates a `justcooked.app/recipe/[id]` link. There is no public posting.
- **The social layer is lightweight and private.** Cooking history is the user's own journal. Share Performance stats (Views, Saved, Favorited, Cooked) appear only to the owner of a recipe they chose to share. There is no public feed, no follower graph, no comments, no likes.
- **Nutrition is calories and protein only, optional, per serving, and hidden unless switched on (ED-safety gate).** Never frame the app as calorie tracking or weight loss.
- **Allergies and diets are best-effort, not a guarantee.** They are applied and shown as "Allergens Avoided," but this is a best-effort pre-filter, not a medical allergen guarantee.
- **Display name and @tag are two different things.** The display name is the warm, non-unique name the app greets you with. The @tag is your unique handle. The site must never conflate them.
- **Subscription gating is real.** Photo scans and recipe generation consume credits, and even paid users can hit a fair-use limit. Do not imply unlimited free generation.
- **Cooking history is private today; the "social" vision is deferred.** The "Strava of food" idea is directional and multi-sprint. What ships today is link-sharing plus owner-only stats, not a competitive or community product.

### 4.2 AI recipe generation: three ways in

Just Cooked turns the "what do I even make" problem into the easy part. There are three entry paths, and the third is the one that matters most for hard days.

| Path | What the user does | What happens |
|---|---|---|
| From a photo | Points the camera at their ingredients | The app recognizes the food and builds recipes around it. Ingredients get tagged "From Photo." |
| From the pantry | Picks from items already in their pantry | Recipes are built from what they have. Ingredients get tagged "From Pantry." |
| From an idea | Types a free-text request, no ingredient list at all | A meal is built from the description alone, even with an empty pantry. |

Each generated recipe surfaces the applied diet, allergens avoided, cuisine, equipment, and tags. When the user asks for more than one recipe, a smart orchestrator spreads ingredients across the options for variety (different cooking methods and flavor profiles) and tries to use as much of what they have as possible. The user picks a "main" recipe to cook.

**Why "From an idea" deserves its own callout.** It lets someone get a real recipe with nothing in the kitchen, just by saying what they feel like. That lowers the barrier on the days when deciding feels heavy. The site should lead with this, not bury it.

**When generation fails, the app stays kind.** Users never see raw errors. They get plain-language guidance with a next step. Real strings:

- "Your pantry is a little too limited for that request right now. Try adding a few items, turning off strict pantry, or starting From an idea to build a meal from your request."
- "We had trouble reaching the kitchen. Please check your connection and try again."
- "You have been cooking up a storm. Please wait a moment, then try again."
- "You've reached today's fair use limit. Your access resets tomorrow thank you for understanding!"

### 4.3 Create your own recipe

Generation is only half the library. Users can add a recipe by hand and keep family recipes, online finds, and AI recipes side by side.

A custom recipe supports: cover photo, title, the story behind it, time, difficulty (1 to 5), servings, optional calories and protein per serving, tags (cuisine, diet, allergens, equipment), ingredients, and steps. Steps are flexible in three modes:

- **Write Steps** — type them out
- **Upload Photos** — add photos or screenshots (handy for a recipe card or a screenshot from elsewhere)
- **Recipe Link** — just save the link to follow along when cooking

Steps reorder by drag-and-drop. Custom recipes track cooks exactly like AI ones. Real placeholder copy: "e.g., Grandma's Spaghetti" (title), "Share the story behind this recipe..." (description), and the nutrition hint "Optional. Leave blank to skip. Calories and protein only." (rephrased here without the em dash for house style).

### 4.4 Cook sessions and before/after photos

A "cook" is one time the user made something. Every cook is a session of one of four types:

| Type | What it is |
|---|---|
| `photo_cook` | Cooking from a photo-generated recipe |
| `pantry_cook` | Cooking from a pantry-generated recipe |
| `recipe_cook` | Cooking a saved recipe again |
| `manual_cook` | A free, hand-logged meal with no recipe (even a takeaway) |

The fourth type is the quiet differentiator: a hand-logged meal with no recipe is a first-class cook. The app supports the days you did not follow a recipe.

Users can add a "before" photo of the ingredients and an "after" photo of the finished dish, then toggle Before/After. These photos turn cooking into a visual record they can look back on.

**Logging a cook** ("Log This Cook") does several things at once: it logs the cook, feeds the streak and weekly goal, increments how many times that recipe has been cooked, and can auto-set the recipe's thumbnail from the cook photo. Then a full-screen celebration plays. The framing is the whole point: it is about the act, not perfection.

Real strings from the completion moment:

- Title: "You cooked. That counts."
- Top label: "Cooked"
- Dismiss: "Nice!"
- Stat pills: "Streak started!", "{n}-day streak", "Weekly goal reached!", "{cooked}/{goal} this week"
- Streak context hints on the cook screen: "Log to keep your {n}-day streak", "Log to start your cooking streak", "Goal met this week", "{n}/{goal} this week"

**One behaviour to mention plainly:** completing a cook that used pantry items can remove those items from the pantry, with a one-time explainer, controlled by a user setting. This is opt-out, not a surprise.

### 4.5 Cook history and the cook post view

Every completed cook lands in the **Cooking History** grid: an Instagram-style 3-column grid, newest first, with a running "{n} cooks" count. Tapping a tile opens a full-screen, post-like view. Long-press lets the user Hide from History or Delete. This is a private cooking journal, not a feed.

The **cook post view** is a post-like card per cook: photo with a Before/After toggle, recipe name and meta, ingredients used, and a "View Cook Session" link. Hand-logged meals show the meal name, note, and meal type, and only if the user has nutrition turned on do calories and protein appear under a "See more" expander. Cook-type badges read "Photo Cook," "Pantry Cook," or "Logged meal."

Empty state: "No cooked recipes yet" / "Your cooking history will appear here."

Hidden cooks are not deleted. They can be viewed and restored later (Profile, then Data & Privacy, then Hidden Cooks), a non-shaming way to curate what shows.

### 4.6 The Saved cookbook (library, albums, folders)

The Saved tab is the combined **Kitchen**: it brings together the Pantry (what you have) and your Recipes (what you love) behind one screen. The tagline copy is "Everything you have, and everything you love." The Kitchen home shows two doorway cards, Pantry ("A good base for simple meals") and Recipes ("Your growing library"), each with live stats.

The recipe library is a two-column grid with search and filter chips: All, Favourites, Recently cooked, Under 15 min. It surfaces a featured "Most cooked meal" card automatically ("Cooked {n} times"). Each card shows the cooked count and a thumbnail pulled from the user's actual cooks.

**Albums (folders / collections):**

- Saved recipes organise into Albums, including nested subfolders
- Albums support custom cover images and renameable section labels
- Deleting an album keeps the recipes in your library (only the grouping is removed)
- Empty states: "No albums yet" / "Create Album"; folder empty state "This folder is empty. Add recipes or create subfolders to organize your collection."

Removing recipes is forgiving and clearly explained: "Delete recipes from your library? Cook history stays in your profile. You can re-save recipes later."

> **Caution for the site:** the "Search saved" button on the Kitchen home is a visible affordance but is **not** wired to a working global search yet. Do not promise global Kitchen search. Per-recipe search inside the Recipes library does work.

### 4.7 The Pantry with calm expiry tracking and receipt scanning

The Pantry is a fridge-style view of what you have at home, framed gently throughout.

**Filling the pantry** has three paths: type an item in, use voice input, or scan a receipt. Quantities support unlimited (the infinity symbol) for staples you never want counted down. Sort by Expiring soon, Recent, or A to Z.

**Calm expiry / freshness tracking** is the standout. Badges are never red or alarming:

| Badge | Meaning | Tone |
|---|---|---|
| Fresh | Plenty of time | Sage green |
| Use soon | Getting there | Warm butter |
| Use today / Today | Use it now | Warm peach-orange |

Expiry dates are fully optional. "No date" is a first-class choice, and there is a one-time, non-nagging hint explaining how to set them: "Set expiry dates. Select items, then tap Set date to choose a date. Tap Done when you are finished." Dates are set with quick presets (Today, Tomorrow, 3 days, 1 week, 2 weeks, 1 month, No date) or a built-in calendar, on one or many items at once. Gentle Mode can soften the wording further, for example "Use now" instead of "Expired."

**Receipt scanning** lets users fill the pantry fast: "Scan Your Receipt. Quickly add grocery items to your pantry by scanning your receipt." Take a photo or choose from library, then review and edit items before adding them all at once ("Review Items", "Add {n} Items to Pantry", "{n} Items Added! Your pantry has been updated").

**Forgiving by design:**

- Deleting an item moves it to a recoverable bin for 7 days ("Move to bin. You can restore it from the bin within 7 days."), then it is removed for good. Nothing is lost by accident.
- Pantry settings let users choose whether cooking removes used ingredients ("Remove ingredients when I cook") and how expired items are handled: "Leave in pantry" (kept with a tag) or "Auto-move to bin" (restorable for 7 days).

> **Caution for the site:** expiry/freshness tracking is a calm reminder feature only. Do not claim food-safety guarantees or medical advice. Keep all framing non-medical and non-alarming. Receipt scanning, voice input, and generation consume credits and are fair-usage gated, so do not market them as truly unlimited.

### 4.8 Recipe sharing and attribution

Any recipe can be shared via a `justcooked.app/recipe/[id]` link that opens a clean web page and deep-links into the app. The shared page looks identical to the in-app detail view (hero image, ingredients, steps, nutrition), so a link is a real, usable recipe page on the web, not a teaser.

**Owner controls.** When sharing, the owner chooses whether recipients can copy the recipe and whether they can re-share it. These permissions can be changed later via "Edit permissions," and the change applies to everyone who already has the link.

**What a recipient sees.** A "Shared with you. Not in your library yet." banner, the author byline, and three actions:

- **Cook this recipe** — cook it without saving
- **Save** — add it to their library (read-only import that live-syncs to the original)
- **Make My Copy** — get their own editable version, if the owner allowed copying

If a recipient owns the recipe, they see "Your shared recipe" and "This is your recipe" instead. A broken or removed link shows "Recipe not found. This link may have expired or been removed."

**Attribution travels with the recipe:**

| Label | When it shows |
|---|---|
| "Copied from @username" | On a copy the user made of someone else's recipe |
| "Referenced by @username" | On a recipe authored by someone else (imported, read-only, live-syncs to the original) |
| "Copy of recipe by @{username}." | Baked into the copy itself as an attribution note |

The "Make a Copy" action also exists for any of your own saved recipes: it duplicates the recipe into an independent, editable copy that keeps attribution. The default share message is "Check out this recipe I made with Just Cooked!"

### 4.9 Share Performance (the Strava-style stats)

For a recipe the user **owns and has shared**, a "Share Performance" card shows four counts:

| Stat | What it counts |
|---|---|
| Views | How many people opened the shared recipe |
| Saved | How many added it to their library |
| Favorited | How many favorited it |
| Cooked | How many cooked it |

The card expands to show who saved and favorited it ("Saved by @user...", "Favorited by ..."). This is the quiet "social proof" glow, the "Strava of food" layer in its shipped form.

**Critical scoping for the site.** This card appears **only to the owner**, and **only for recipes they chose to share**. It is not a public scoreboard, there is no leaderboard, and there is no head-to-head comparison. Frame it as the quiet glow of people enjoying what you made, not competition.

### 4.10 Profile identity

The Profile tab is the user's personal, low-pressure identity and cooking-history hub. The pieces that matter for the site:

- **Display name vs unique @tag.** The display name is warm and non-unique. It drives the Home greeting ("Morning, {name}") and headlines the profile card, defaulting to "Just Cooked Member" before it is set. The @tag is the unique handle, shown as @tag under the display name, validated live for format and availability ("3-20 characters. Letters, numbers, and underscores only."). The two are deliberately separate and can never overwrite each other. The @tag is groundwork for future social, but there is no social product around it today.
- **Avatar.** Set from the photo library (square crop), uploads and auto-saves instantly. No photo falls back to a clean first initial, not a generic placeholder.
- **Cooking history grid.** The same private Instagram-style grid described in 4.5, here on the user's own profile with a running "{n} cooks" count. Private to the user today.
- **Goal and streak celebrations.** Soft, full-screen "you showed up" moments fire when the user hits their weekly goal or reaches a streak milestone (a week, two weeks, a month, fifty days, a hundred days, two hundred days, a year). Copy is warm and largely non-numeric. Body-metric goals (protein, calories) stay especially calm with no confetti; only non-body wins (meals logged, money saved) and the cook streak get gentle confetti. Example strings:
  - "A full week of showing up for yourself, one meal at a time. That matters."
  - "Look at what you saved by cooking this week. That is real, and it is yours."
  - "You hit your protein goal this week. Proud of you."
  - "A whole year of cooking for yourself. What a lovely rhythm you have found. There is no pressure to keep it going. It already counts."
- **Nutrition visibility and Gentle Mode.** Users choose whether calorie and protein numbers show at all. Gentle Mode is a broader calm setting that can hide streaks, hide goals, and soften expiry wording. Numbers are opt-in, never forced.
- **Future social is deferred.** The "Strava of food" social layer is explicitly multi-sprint and not shipped. The cooking-history grid is private-only today. Do not market Profile as a social network, feed, or friends surface.

> **Caution for the site:** the celebration engine is built and now mounted on Home, but per the deferred-work notes its on-device firing was still pending founder verification at audit time. Treat exact celebration behaviour as "subject to final verification," not a hard marketing guarantee.

### 4.11 Suggested website copy (on-brand, ready to adapt)

Warm, plain, no em dashes, no shaming. Drop-in starters for the relevant page sections.

**Recipe generation (hero):**
> Point your camera at what you have, pick from your pantry, or just say what you feel like. Just Cooked turns it into a real recipe you can actually make. Some days the hardest part is deciding. We made that part easy.

**From an idea (sub-block):**
> Empty fridge? Tell us what you are in the mood for and we will build a meal from there. No ingredient list required.

**Cook and log:**
> Cook it, snap a before and after if you want, and log it. Every cook counts, even a quick hand-logged meal with no recipe. You cooked. That counts.

**The pantry:**
> Keep track of what is in your kitchen by typing, talking, or scanning a receipt. Optional freshness reminders stay calm and kind, never an alarming red. And if you remove something by mistake, it waits in a bin for seven days.

**The cookbook:**
> Everything you have, and everything you love, in one place. Save recipes, sort them into albums, and find your most cooked meals fast. Bring your own family recipes and online finds too.

**Sharing:**
> Share a recipe as a clean web page anyone can open. You decide who can save it, copy it, or share it onward, and you can change your mind later. If you like, see the quiet glow of people saving and cooking what you made.

**Privacy and gentleness (trust block):**
> Your recipes and your cooking history are yours and private until you choose to share. Calories and protein stay hidden unless you turn them on. Nothing here is about dieting or numbers. This is about cooking, and showing up for yourself.

### 4.12 FAQ candidates

Lightly edited from the audit for house style.

- **How does Just Cooked make a recipe from my ingredients?** Point your camera at your ingredients and the app recognizes the food, or pick from your pantry, then it builds real, cookable recipes around what you have. You can also skip ingredients entirely and just describe what you feel like with "From an idea."
- **Can I add my own recipes?** Yes. Add a cover photo, the story behind it, time, difficulty, servings, ingredients, and steps. Steps can be typed, added as photos or screenshots, or just a link. Your recipes track cooks the same way AI ones do.
- **What is a "cook" and what does logging one do?** A cook is one time you made something. You can add before and after photos and log it. Logging keeps your streak and weekly goal going, adds to your cooking history, and counts how many times you have made that recipe. Even a hand-logged meal with no recipe counts.
- **Can I share my recipes?** Yes. Create a share link that opens a clean recipe page on the web and deep-links into the app. You decide whether people can save it, copy it, or re-share it, and you can change those permissions later.
- **What is "Share Performance"?** If you have shared a recipe, you can see how many people viewed, saved, favorited, and cooked it, and who saved or favorited it. It only shows to you, the owner, and only for recipes you chose to share. There is no public feed or followers.
- **Does the app track calories?** Only if you want it to. Calories and protein are optional, per serving, and hidden unless you switch them on. Just Cooked is not a diet or calorie-counting app.
- **What is the difference between my name and my @tag?** Your display name is how Just Cooked greets you (like "Morning, Alex") and does not have to be unique. Your @tag is a unique handle that is yours alone. Changing one never changes the other.
- **Is my cooking history public?** No. Today your cooking history is a private grid just for you. You can hide individual cooks, restore them later, or delete them.

### 4.13 Hard "do not" list for writers

- Do not name Google Vision, OpenAI, or GPT. Describe the capability ("recognizes your ingredients," "AI-generated recipes").
- Do not claim a public social network, feed, followers, comments, or likes. The only social surfaces are private cooking history and owner-only Share Performance stats.
- Do not market nutrition, calorie, or protein tracking as a headline feature. It is optional, calories plus protein only, per serving, and hidden by default.
- Do not promise allergen or dietary safety. "Allergens Avoided" is a best-effort pre-filter, not a guarantee or medical advice.
- Do not over-promise recipe accuracy. Recipes are AI-generated inspiration; the user is the judge.
- Do not imply unlimited free generation. Photo scans and generation use credits, and a fair-use limit exists.
- Do not imply a competitive or leaderboard product. The "Strava of food" vision is directional; today it is link-sharing plus owner-only stats.
- Do not promise global Kitchen search; it is not wired yet. Per-recipe library search does work.
- Do not use em dashes, and never use shaming or pressuring language.

---

## 5. Onboarding & personalisation: what the website should echo

The rebranded onboarding is not a signup form. It is a short, story-driven intake that reframes Just Cooked as a "personal food support system" and then proves that promise by building a plan addressed to the user by name. The website should treat this flow as a ready-made narrative spine: the emotional arc, the personalisation quiz, the certificate reveal, and the referral mechanic are the strongest proof points the brand has, and most of the copy is already written and warm. This section maps those beats so the site can reuse them faithfully.

### 5.1 The emotional arc (the story the homepage should retell)

In-app, onboarding walks a deliberate five-stage emotional arc before it ever shows a feature. The website should mirror this ordering instead of leading with recipes or pantry utility, because the whole rebrand thesis is that "most food apps assume the hard part is finding a recipe" and Just Cooked is built around the moment food actually feels hard.

| Stage | The beat | Real in-app copy to reuse |
|---|---|---|
| 1. Struggle (the hook) | Open on an emotional diagnostic, not a feature. | "Let's find out what's making food hard." / "Built for the days food feels hard. Not the days everything is going right." (HeroScreen) |
| 2. The thesis | Food is more than food. | "Food is not just food." / "It shapes your energy, your mood, your money, your goals, your headspace. When food feels hard, the cost shows up everywhere." (FoodIsNotJustFoodScreen) |
| 3. The loop | Name the recognisable pain pattern. | "The loop repeats." / "You're hungry. Stress builds. Decisions pile up. The easy option wins. Without a system, the same loop runs every week, sometimes every day." (TheLoopRepeatsScreen) |
| 4. The cost | Make the price concrete and emotional. | "It costs you more than you think." / "The impulsive takeaways. The groceries you forgot. The meals you skipped. The guilt that followed. Everywhere pays a price." (MostFoodAppsScreen) |
| 5. Hope, then the system | Turn to agency, then deliver the central promise. | "Your relationship with food can change." / "Change is possible." (RelationshipCanChangeScreen). Then: "This time you have a system." / "Without a system, every week becomes another restart. With a plan, the next meal gets easier." (GraphSystemBeatsScreen) |

The brand introduction sits between hope and the system: "Welcome to Just Cooked. Your personal food support system. Built for hard food days, by people who know what they feel like. You're in the right place." (WelcomeToJCScreen). That single line is the cleanest positioning statement in the whole flow and is a strong candidate for the homepage hero or about block.

**The "system" is the load-bearing idea.** The product is reframed from "meal plans" to "a system" and "one doable meal at a time." In-app this is dramatised by an animated divergence chart that contrasts a red failure sawtooth (no system) against a steady climb labelled "With Just Cooked," under the headline "This time you have a system." and the CTA "I'm done starting over." The site can reuse this two-paths visual to defeat the "I could just do this myself" objection.

> Caution: theme.ts internally comments that the primary colour is "Orange-red like Strava," but "Strava" is a dev note, not user-facing copy. Do not write "the Strava of food" or quote Strava anywhere on the site. Convey the system idea through the two-paths chart instead.

### 5.2 How the product reveals itself (the "what you get" mechanic)

After the arc, onboarding reveals the core mechanic in plain, low-pressure terms. The repeated promise is **one doable meal**, chosen from what you have, what you love, and how much effort you have today. This is the single most important feature framing for the site, and it should never be inflated into a rigid plan.

- "Free up your mind." / "No more overthinking food. Just Cooked gives you one doable meal based on what you have, what you love, and how much effort you have today." (KnowWhatToEatNextScreen)
- "Break the loop." / "When stress, boredom, anxiety, or guilt starts driving the decision, Just Cooked gives you the next step before food takes over." (GetHelpBeforeFoodSpiralsScreen)
- "Save more than money." / "Save the time lost wondering what to do, your money, your groceries, and the energy you lose when food becomes another fight you have to face." (MakeYourKitchenScreen)
- "Make food your strength." (AdaptiveMealsScreen)

### 5.3 The personalisation quiz (the proof that it is "actually yours")

The quiz is the engine that makes "personalised" true rather than a slogan. The website's strongest honest claim is that personalisation happens on **two layers at once**: an emotional / relationship-with-food layer and a practical kitchen layer. Crucially, the answers do not just tune recipe generation. They set a personalised plan, choose the default Home tracker, and decide which Support tools are recommended and switched on.

**What the quiz asks, in order of theme:**

| Theme | Question (real copy) | What the user picks | What it personalises |
|---|---|---|---|
| Eating rhythm | "How have you been eating lately?" / "No judgement, just so we can build the right plan." | Regular / Irregular / Skip or forget / Graze / Changes a lot | Skipping or grazing can turn on the "I Need to Eat" Support tool |
| Struggles / cost | "What is food costing you right now?" / "Pick anything that sounds like you. No judgement." | 18-item struggle taxonomy (see 5.4), multi-select | Friction score, plan tone, Support-tool recommendations |
| Frequency | "How often does food feel harder than it should?" | Multiple times a day / Every day / A few times a week / Sometimes | Friction score |
| History | "How long has food felt harder than it should?" | Years / Over a year / A few months / A few weeks / Just noticing | Friction score |
| Stress | "When life gets stressful, does food get harder?" / "Stress is one of the biggest food triggers. Naming it is the first step." | Yes often / Sometimes / Rarely | Friction score |
| Autopilot | "Do you fall into food autopilot when you're bored or tired?" | Yes often / Sometimes / Rarely | Friction score |
| Money regret | "Have you spent money on food you later regretted?" | Takeaway / Unused groceries / No-plan buys / Not really (multi-select) | Takeaway/no-plan answers can turn on the "Takeaway Help" tool |
| Impact areas | "What has food been affecting most?" / "These are common, real, and addressable." | 11 life areas (see 5.4), multi-select | Gentle / Panic recommendations |
| Goals | "What should your plan help with?" / "Pick everything that matters right now." | 11 goal tags (see 5.4), multi-select | Meals, default Home tracker, Weight/Protein tool recommendations |
| Diet | "Any diet your plan should follow?" | One base diet + optional restrictions + religious (combinable) | Keeps suggestions aligned with how you eat |
| Allergies | "Any allergies we should avoid?" / "We'll filter unsafe ingredients out of your suggestions." | 13 allergens + custom free-text + None | Filters unsafe ingredients out |
| Cuisines | "What food do you love?" / "without giving up food you actually enjoy." | 19 cuisines + Any + custom | Keeps the plan enjoyable |
| Effort | "How much effort usually feels realistic?" | Almost no effort / Quick and easy / Simple recipes / Full recipe / Take my time | Tunes recipe complexity |
| Equipment | "What equipment can you cook with?" / "We'll only suggest meals you can actually make." | 12 appliances + custom | Only suggests makeable meals |
| Nutrition visibility | "How do you want nutrition shown?" / "Tick what you want to see. You can change this any time." | Show calories + Show protein, two independent toggles, both default OFF | Whether numbers appear at all; either off nudges Gentle Mode on |
| Name | "What should we call you?" / "We'll use your name when we build your plan." | Name only (age removed) | Personalises the certificate and reveal |

**Two things the site should make a point of:**

- **You decide how much you see.** Calories and protein are off by default, split into two separate opt-in toggles, and editable any time. This is a genuine differentiator versus a generic app that surfaces macros by default, and it supports the non-shaming, non-medical brand. Lead with it.
- **It learns your real kitchen.** Diet, allergies, cuisines, equipment, and effort mean suggestions are things you can actually make and want to eat. Allergies and cuisines accept free-text custom entries, so personalisation is not limited to the preset lists.

### 5.4 The taxonomies (use these as lists, verbatim labels)

These are the canonical labels. The website can show them as "what people tell us" lists to prove the app meets people across a real range.

**Goal labels (the 11 canonical goal_tags, "What should your plan help with?"):**

- Eat meals more regularly
- Eat enough
- Improve nutrition
- Reduce takeaway
- Waste less food
- Weight change
- Build muscle
- Hit protein
- Cook at home more
- Feel calmer around food
- Cook with less effort

**Impact areas (the 11 "What has food been affecting most?" chips):**

- Energy
- Mood
- Confidence
- Money
- Body goals
- Focus
- Routine
- Self-control
- Anxiety around eating
- Grocery waste
- Relationship with food

**Struggle taxonomy ("What is food costing you right now?"):** 18 options, multi-select, grouped by severity from everyday friction to serious food-relationship struggles. The audit confirms the shape and the most-serious end of the list, but does not enumerate all 18 labels verbatim, so the site should not publish an exact 18-item bullet list as if quoted.

- Everyday friction: deciding what to eat, fridge or "fridge paralysis," the groceries-then-takeaway loop, skipping meals.
- Deeper struggles (the most serious answers, named in the audit): "made myself throw up after eating," "avoid eating until starving," "feel out of control around food," "ashamed of how I eat."

> ED-safety, important for the site's stance: when a user selects those most-serious answers, the Weight Goal and Protein Goal calculators are deliberately **not** auto-recommended. The website must not imply the app pushes weight or calorie tools at everyone, and should reflect a careful, non-triggering posture. A widened ED-risk gate that also reads impact areas and eating pattern exists only as a draft and is **not active**; today the gate keys on the serious struggle answers only. Do not describe the broader gating as shipped.

### 5.5 The plan reveal and the "Personalised for [Name]" certificate

The payoff is a sealed paper "certificate" card, the visual artefact of "your plan." This is the single best hero asset for the site, because it makes "personalised" literal and visible.

**The reveal sequence (in order):**

1. **Empty plan card (the promise).** "Let's build your food plan." / "Answer a few questions and we'll build it around the way food feels for you." / "Empty for now. We'll fill it in together." CTA "Build my plan." (EmptyFoodPlanCardScreen)
2. **Drafting / analysing.** Eyebrow "DRAFTING YOUR PLAN," a count-up "Built around your answers," and short status lines written one by one ("Decision stress: mapped.", "Goals: saved.", "Plan: ready."), as the card visibly writes and seals. (LoadingResultScreen)
3. **Food Friction Score.** A personalised "FOOD FRICTION SCORE" bar comparing "You" to an average, with a headline that scales by band: "Food is taking more effort than it should." (low) / "You're stuck in a food-friction loop." (medium) / "Food is carrying too much weight in your day." (high). Explicitly labelled "This is not a medical diagnosis. We use it to personalise your plan."
4. **The certificate (RecipeCard).** A portrait paper certificate with the Just Cooked mark that reads "PERSONALISED FOR [Name].", "Built for the way you actually eat.", "Make food easier. Feel more like yourself.", with a "STARTING" date and a stamped wax-style seal.
5. **Typed reveal.** Letter-by-letter: "Hey, [Name]." / "Welcome to Just Cooked." / "This is your path to a better relationship with food." (PlanPreviewScreen)
6. **Celebration.** "Your plan is ready." / "Built around how you actually eat. Sealed and waiting for you." CTA "Show me my plan." (CongratsPlanReadyScreen)

**What the plan promises to help you do** (the PlanLockedScreen chips, all warm and reusable): Know what to eat next, Stop overthinking food, Use what you already have, Waste less food, Reduce takeaway, Eat more steadily, Feel calmer around food, Take your day back.

> Cautions for the certificate and score on the site:
> - The "Food Friction Score" is a personalisation device, not a clinical measure. Always carry the "not a medical diagnosis" framing. Do not present the score or plan as diagnosis, treatment, or eating-disorder care.
> - The "PERSONALISED FOR [Name]" certificate is an onboarding artefact and promise, not necessarily a downloadable document. Do not imply users receive an exportable plan file.
> - Just Cooked is a paid subscription. After the plan is built, a paywall appears and the plan stays saved but locked until the user subscribes or restores a purchase. In-app trust terms are "Secure purchase. Cancel anytime. Start with your next meal." Any website billing copy must match real App Store and Play Store terms and pricing.
> - The in-app paywall leans on loss aversion ("Don't leave your plan behind.", "Leaving now means going back to deciding alone."). The marketing site should frame value positively rather than over-leaning on pressure, consistent with the low-pressure brand.
> - Onboarding answers are stored locally during the flow and only persisted server-side at the gate. Keep privacy claims factual. Do not imply real-time cloud profiling during the quiz or that the plan syncs to an account before sign-up.

### 5.6 The referral / creator-code mechanism

During setup there is an optional referral or creator code field: "Do you have a referral or creator code?" / "Enter it below to support your favourite creator or unlock special offers." It is validated against the backend and is skippable with "Skip for now." (ReferralCodeScreen).

For the website this supports two honest messages: codes can **support a creator** and can **unlock special offers**. It is optional. Do not promise specific discount amounts on the marketing site unless the actual offer terms are confirmed, since the audit only describes the mechanism, not the values.

### 5.7 Suggested website copy (brand voice, no em dashes)

Drafts the site can lift or adapt. Plain, warm, non-medical, non-shaming.

- Hero: "Built for the days food feels hard. Not the days everything is going right."
- Subhead: "Your personal food support system. Just Cooked gives you one doable meal based on what you have, what you love, and how much effort you have today."
- Personalisation block: "Your plan is built from your answers and addressed to you by name. It learns the cuisines you love, your diet, your allergies, and the equipment in your kitchen, so the next meal is something you can actually make."
- Nutrition control block: "You decide how much you see. Calories and protein are off by default, and you can turn them on any time."
- The system block: "This time you have a system. No more starting over every week. The next meal just gets easier."

### 5.8 MUST mention on the website

- Just Cooked is a **personal food support system built for the days food feels hard**, not a generic recipe or meal-planning app.
- The core thesis: **food is not just food.** It shapes energy, mood, money, goals, and headspace, and when food feels hard the cost shows up everywhere.
- The mechanic: **one doable meal** based on what you have, what you love, and how much effort you have today. It is low-pressure and one meal at a time, not a rigid plan.
- The promise: **"This time you have a system,"** replacing the cycle of starting over.
- Onboarding is a **personalisation quiz, not a generic signup**, with repeated explicit "No judgement" framing, and it personalises on two layers (how food feels AND the practical kitchen).
- Answers **actively change the app**: they set the plan, choose the default Home tracker, and decide which Support tools turn on.
- **Nutrition is opt-in.** Show calories and Show protein are separate toggles, both default OFF, changeable any time. No requirement to track numbers.
- The plan is **personalised and addressed by name** (the certificate reads "PERSONALISED FOR [Name]") and framed around the user's relationship with food.
- The **"Food Friction Score" is not a diagnosis.** Carry that framing every time.
- Just Cooked is **not a medical, clinical, or therapeutic tool.** Honour the non-medical, non-shaming boundary the app itself states. Avoid weight-loss, calorie, shame, or "fix yourself" framing.
- Just Cooked is a **paid subscription**; the plan is built first, then locked behind a paywall until the user subscribes or restores. Match real store terms.

### 5.9 Open flags before publishing

- The struggle taxonomy is 18 items but not fully enumerated verbatim in the audit. Confirm the exact labels with the team before publishing them as a quoted list.
- Some of the most personal answers have no post-onboarding edit screen today, and the Support-tool curation runs only once at onboarding. Do not claim users can freely re-tune their struggle profile and instantly re-personalise.
- The cost figures ("Spend 3-5x less"), time figures, and sodium/fat percentages are illustrative onboarding animations, not measured guarantees. Soften to "can help you spend less" and similar.
- The founder's pre-launch ED-safety review of the Weight/Protein outputs and the "I Need to Eat" copy is still outstanding. Do not over-promise clinical safety.
- The tagline "Not perfect. Just cooked." was not found in these onboarding files. Confirm its canonical source before treating it as verbatim.
- Pick one spelling. The in-app copy mixes "takeaways" (British) and "takeout" (US). Choose one for the site.
- The Atomic Habits / James Clear quote and the three "principle board" lines are strong brand copy but were removed from the live onboarding flow (V1.3.1), and the quote is third-party attributed. Clear usage and licensing before putting it on a public page.

---

## 6. Pricing, subscription & honest constraints

Just Cooked is a paid subscription app available on both the Apple App Store and Google Play. It is not a free app and it is not freemium. There is no permanent free tier. New users get a 3-day free trial with full access, after which a subscription is required to keep using the AI features. This section sets out exactly what is free, what costs, how billing works, and the hard constraints the website must respect.

### 6.1 The pricing model at a glance

| Element | Reality | What the website may say |
|---|---|---|
| Subscription | Single premium tier, sold as Annual or Monthly. Both unlock the whole app. | "One simple subscription unlocks everything. Choose monthly or yearly." |
| Free trial | 3 days, full premium access, no paywalls or feature locks during the trial (trust-first model). | "Try it free for 3 days with full access and no nags." |
| Where billing lives | Apple App Store / Google Play, managed via RevenueCat. | "Manage, change or cancel in your app store account." |
| Exact prices | Live in the store / RevenueCat, NOT in the app code. Vary by region and currency. | Do not publish a number until the founder confirms it (see 6.6). |
| Status source of truth | RevenueCat only. Never persisted as truth in Supabase (Apple compliance, decision Q10). | "Billing is handled securely by your app store." Do not say the app stores billing. |

### 6.2 What is free vs what costs (the credit model)

Subscribers and trial users get a daily AI allowance (shown in-app as "Credits"). Only AI work draws on it. The everyday acts of cooking, logging and browsing never do.

| Action | Draws on daily allowance? | Notes |
|---|---|---|
| Generate a recipe with AI | Yes | Small amount of the daily allowance. |
| Scan a photo or receipt | Yes | Small amount of the daily allowance. |
| Cook from a recipe you already have | No (free) | `recipe_cook = 0` in `usageLimits.ts`. |
| Log a cook (including a hand-logged takeaway) | No (free) | Founder decision Q8. The everyday "I cooked" action is never gated behind payment. |
| View saved recipes | No (free) | Listed in `NON_GATED_ACTIONS`. |
| Manage pantry, create folders, edit preferences | No (free) | Listed in `NON_GATED_ACTIONS`. |

The honest framing for the site: cooking, logging and browsing are always included and never use your allowance. Only AI recipe generation and photo or receipt scanning do. This is a genuine differentiator and worth foregrounding, because the action a struggling user is most likely to take (logging that they ate something) costs nothing.

Important: free actions only work inside a trial or an active subscription. A user with no subscription and no trial has no access. Do not describe these free actions as a standing free tier.

### 6.3 Daily allowance, rollover and the fair-use limit

- Subscribers and trial users get a daily AI allowance that refills each day and rolls over up to a cap, so a quiet day is not wasted.
- There is a calm daily fair-use limit. If a paying subscriber reaches it, they see a gentle bottom sheet, not a paywall, not an upsell, and no error styling. It resets the next day.
- Internal numbers (50/day, a 19,000 rollover cap, an annual cap, trial bonuses) are economics that may change. Do not put exact allowance numbers on the website. Prefer benefit-framed language.

In-app tone benchmark (this is the voice the website should match):

> "To keep Just Cooked fast and fair for everyone, we apply reasonable daily usage limits." (`FairUsageLimitModal.tsx`)
> "You'll be able to continue cooking again tomorrow." (`FairUsageLimitModal.tsx`)

Suggested website copy (warm, plain, no em dashes):

> Generous daily AI usage that refills every day and rolls over, so a quiet day isn't wasted. There's a gentle daily limit to keep things fast and fair for everyone, and it always resets tomorrow.

Do NOT use the word "unlimited." It survives only in legacy `TrialBanner` copy ("keep unlimited access") and would over-promise against a real allowance and a fair-use limit.

### 6.4 If a subscription lapses (read-only access)

This is a strong reassurance and should be foregrounded, because it de-risks the paywall for prospects.

- If a subscription expires, is cancelled, or is refunded, the user keeps soft, read-only access. They can still open the app and view saved recipes, pantry, profile and cooking history.
- A reactivation paywall appears only when they try an AI action (generate or scan).
- Nothing the user saved disappears.

Suggested website copy:

> If you ever need to pause, nothing you saved disappears. You keep your recipes, pantry and cooking history. Only the AI help waits until you're back.

### 6.5 Promo and creator codes, restore, and billing management

| Feature | What it does | Honest constraint for the site |
|---|---|---|
| Redeem a promo or creator code | User enters a code to unlock special offers. Codes can grant subscription time, bonus credits, or both. | Codes are campaign-specific. Do NOT advertise them as a standing public discount. |
| Restore Purchases | Restores an existing subscription on a new device or after reinstall, via the store. | Safe to mention as a convenience. |
| Plan & Billing screen | Shows status as simply "Active" or "Inactive" with dates, a Subscribe CTA when inactive, Restore Purchases, and history. | Billing changes and cancellation happen in the store, not in the app. |

In-app copy the website can echo:

> "Your subscription is managed through your device store account (App Store or Google Play). You can change, cancel, or view your billing history there." (`PlanBillingScreen.tsx`)

Note on status language: the app deliberately shows only "Active" or "Inactive" to users (trial counts as Active). It avoids exposing premium / trial / expired / cancelled / refunded jargon. The website should mirror this calm framing and not surface internal states.

### 6.6 Pricing publishing rules (read before writing any number)

| Rule | Why |
|---|---|
| Do not publish any exact price, currency or discount without founder confirmation. | Prices live in RevenueCat / the App Store / Google Play, not in the app code. They vary by region. |
| The only money figure in the code (about £10 per user per year) is an internal AI cost ceiling, not the customer price. | Using it as a price would be wrong and misleading. |
| Confirm trial length before stating it as a promise. | It is currently 3 days. Some legacy comments mention different trial-credit values (15 vs 50). The current model is full premium access during the trial. |
| Present the app as available on both iOS and Android. | It is one app on both stores, with subscriptions managed in each store. |

Suggested FAQ copy for "How much does it cost?":

> Just Cooked is available as a monthly or yearly subscription. The exact price is shown in the app and on the App Store or Google Play, where it can vary by region and currency.

---

## 7. Cautions, sensitivities & not-yet-shipped

This is the consolidated list of everything the website must NOT claim, or must caveat. It pulls together the cross-cutting risky claims, the ED-safety position, and the features that are gated, stubbed, or not yet shipped. Treat every row as binding. When in doubt, soften the claim or leave it out.

### 7.1 Positioning and medical framing (hard line)

| Do NOT | Do instead |
|---|---|
| Present Just Cooked as medical, clinical, therapeutic, diagnostic, an eating-disorder treatment, nutrition coaching, or a substitute for professional care. | Carry the app's own disclaimer verbatim: "Just Cooked is not a medical or therapeutic tool." Direct people in crisis to call local emergency services or a professional. |
| Imply the app detects or intervenes in a crisis. | Say it surfaces breathing tools and resources and relies on the user to reach out. It is not a crisis service. |
| Claim the ED-safety gating is a screening, assessment, or diagnosis. | Describe it as a gentle softening and visibility layer driven by self-reported answers. It never alters any calculation and never diagnoses anyone. |
| Over-promise clinical or validated safety, or recovery support. | A pre-launch ED review of the calculator outputs and "I need to eat" copy is still outstanding. Do not claim clinical safety. |

In-app disclaimers the website must echo on the matching surfaces:

- "Just Cooked is not a medical app. These are gentle estimates, not advice." (calculators)
- "Just Cooked is not a medical or therapeutic tool. In crisis, please reach a professional or a line below." (Support home footer)

### 7.2 Nutrition, weight and numbers

| Do NOT | Do instead |
|---|---|
| Use diet, weight-loss, calorie-counting, macro-hitting, before/after, or "track your way thinner" framing as headline value. | Lead with calm food support. Numbers are optional, gated, and off by default. |
| Present calorie or protein figures as guaranteed or aggressive targets. | Frame them as gentle estimates the user can adjust any time. The "Lose" path is mild (about 0.4 kg per week) and calories are floored at 1200. |
| Imply nutrition tracking is always on or unavoidable. | Say numbers are opt-in and can be hidden everywhere via Gentle Mode, which is also gated for users whose answers signal eating-disorder risk. |
| Dump calories or protein onto a public or shared recipe web page. | OPEN PRODUCT DECISION: an anonymous public page has no logged-in user, so there is no show_calories / show_protein signal to gate on. The team must decide (always show, always hide, or author opt-in) before building it. Given the ED-safe positioning, do not default to showing them. |

### 7.3 Estimates, savings and outcome claims

| Claim type | Status | Website guidance |
|---|---|---|
| Recipes | AI-generated inspiration, not guaranteed-accurate culinary or nutritional instruction. | Describe capability only. Do not name AI vendors. |
| Allergens / diets | Best-effort pre-filtering, NOT a medical allergen guarantee. | Never present as a safety guarantee for allergies. |
| Takeaway savings | Real, computed at read time from the user's own completed cooks times the average cost they enter. Zero until a cost is entered. | Do not quote sample savings as if typical. Do not imply automatic savings without setup. |
| "Spend 3-5x less", time figures, sodium / fat percentages, "30% less waste" | Illustrative onboarding animations, not measured guarantees. | Soften to "can help you spend less." Do not present as measured results. |

### 7.4 Subscription and billing cautions

- Do NOT publish exact prices, currency or discounts without confirmation. Prices live in RevenueCat / the stores, not the code. The only in-code figure (about £10 per user per year) is an internal cost ceiling.
- Do NOT describe the app as free or freemium. There is no permanent free tier.
- Do NOT use the word "unlimited." A real daily allowance and fair-use limit exist.
- Do NOT say subscription status is stored in the app's backend. RevenueCat is the only source of truth (Apple compliance). The website must not imply the app stores or controls billing.
- Promo and creator codes are campaign-specific. Do NOT advertise them as a standing offer.

### 7.5 Social, sharing and privacy cautions

- Do NOT market a public social network, feed, followers, comments, likes, or a leaderboard. None of these exist today.
- Cooking history is a PRIVATE personal journal. Sharing is opt-in and link-based (justcooked.app/recipe/[id]), with owner-only Share Performance stats (Views / Saved / Favorited / Cooked). The "Strava of food" social layer is a deferred vision, not shipped. Do not quote "Strava" to users (internal dev comment only).
- Do NOT frame personal emergency contacts as monitoring, alerting, dispatch, or auto-notification. The app does not call or message anyone on the user's behalf. It only helps the user place a call. Contacts and photos are the user's private data.
- Keep onboarding privacy copy factual. Answers are stored locally during the quiz and flushed to the backend only at account creation. Support-tool curation runs once at onboarding and does not re-run when answers change, and there is no post-onboarding edit screen for the most personal answers. Do not imply real-time cloud profiling during the quiz, or that users can freely re-tune their struggle profile and instantly re-personalise.

### 7.6 Helpline directory cautions

- Do NOT publish specific helpline phone numbers on the website. They drift, and the code flags a required founder re-verification before launch.
- Coverage is 12 countries only: Australia, Canada, France, Germany, India, Ireland, Netherlands, New Zealand, Singapore, South Africa, United Kingdom, United States. Some entries (India, Singapore, South Africa) are general mental-health lines, not ED-specific. Do not imply global or complete coverage.
- Describe the in-app country list instead, and say numbers are best reached from within each country.

### 7.7 Not-yet-shipped, gated, or stubbed (do not advertise as live)

| Feature | Real status |
|---|---|
| Multi-recipe per cook | Soft-disabled. `MAX_RECIPES_PER_COOK = 1`. Only one recipe per cook today. |
| Self-report daily check-in / tracker_entries pipeline | NOT wired. `trackerService.ts` is created but unimported. Only one focus is active at a time, and "meals eaten" has no real data source. |
| "Days without takeaway" and "Used expiring food" trackers | NOT user-pickable. Live picker options are Meals eaten per day, Protein hit, Calories hit, Logged one meal today, plus Money saved (set from Takeaway Help) and the default Home-cooked days. |
| "Use expiring ingredients" button in Next Meal | Does not exist as a dedicated button. |
| Kitchen-home "Search saved" affordance | Not wired. Per-recipe search inside Recipes does work. |
| Photo "Snap ingredients" path | Does not yet thread the typed request / modifiers through. |
| Broader ED-risk gate (impact_areas + eating_pattern) | DRAFT and inactive pending clinical sign-off. The live gate keys on serious issue_tags only. Do not market a wider automatic safety net than is shipped. |
| Legacy paywall placements (trial_ended, free_limit_hit, settings_upgrade) | Retired. Active placements are onboarding_paywall, onboarding_abandoned, reactivation. Do not describe retired flows. |
| Legacy `src/screens/SupportScreen.tsx` | Old "coming soon" placeholder. The live surface is `src/screens/support/SupportHomeScreen.tsx`. Do not describe "coming soon" tiles as the product. |
| "PERSONALISED FOR [Name]" certificate | An onboarding artefact and promise, not a separate exportable or downloadable file. Do not imply a plan document or that the plan syncs to an account before sign-up. |

### 7.8 Brand, copy and house-style guardrails

- Brand name is always "Just Cooked" (two words, capital J, capital C). Never "just cooked", "JUST COOKED", or "JustCooked" in prose.
- House style is binding: NO em dashes anywhere. Warm, plain, low-pressure, non-medical, never shaming. No hype or urgency. No triple cadence.
- The locked tagline set ("Not perfect. Just cooked.", "For when food feels hard.", CTA "Start where you are.") and the StoryBrand hero exist ONLY in the website spec, not in the app yet. Do NOT claim they already appear in the app. The app's live line still reads "Just Cooked — for when food feels hard." (with an em dash, the old form to avoid). Do not present app and website copy as identical.
- Do NOT name AI vendors. Describe capability only ("recognizes your ingredients", "AI-generated recipes").
- Do NOT use red warning colour semantics or alarming language for food states. Expiry shows as warm "Fresh" / "Use soon" / "Use today", never red.
- Pick one spelling convention ("takeout" vs "takeaway") and one currency symbol, since the app mixes them. The app defaults to the pound sign. Do not assume a single currency for all markets.
- The James Clear / Atomic Habits quote is third-party attributed and the board was removed from the live flow. Clear licensing before putting it on a public page.

---

## 8. Frequently asked questions

Answers are written in brand voice (warm, plain, low-pressure, non-medical, no em dashes) and are ready to adapt for an FAQ page. 57 questions across 8 groups.

### Getting started

**What is Just Cooked?**

Just Cooked is a calm food support tool for when food feels hard. Instead of handing you a rigid plan, it helps you find one doable meal at a time, built around what you have, what you love, and how much effort you have today. It started as an AI recipe and pantry app and has grown into something more supportive.

**Who is Just Cooked for?**

It is for anyone whose relationship with food has some friction, from the everyday 'what do I even cook tonight' to the harder days when food feels like too much. You can start where you are, and the app meets you there with no judgement.

**How is this different from a recipe or meal planning app?**

Most food apps assume the hard part is finding a recipe. Just Cooked is built around the moment food actually feels hard. It helps you break the loop of stress, boredom, and guilt driven eating with a system instead of willpower, and it gives you one next step rather than a week of pressure.

**What does 'Not perfect. Just cooked.' mean?**

It is our tagline, and it is the whole idea. The point is not a perfect meal or a perfect day with food. It is that you cooked something, and that counts. Progress over perfection, one small meal at a time.

**What does the setup ask me?**

Two kinds of things. First, how food has actually been feeling for you, how you have been eating, what food is costing you, and what it affects most, all with no judgement. Then the practical side, like your diet, allergies, the cuisines you love, your equipment, and how much effort feels realistic. Your answers shape your plan, your Home tracker, and which Support tools are switched on for you.

**Is the plan really personalised to me?**

Yes. Just Cooked builds your plan from your setup answers and addresses it to you by name. It is built around the way you actually eat, your goals, your diet, and your allergies, rather than being a generic recipe feed.

**Will it judge me or push me to be perfect?**

No. The whole idea is consistency over perfection. Your next meal matters more than a perfect plan. It is low pressure and warm, and it is designed to never shame you.

**Will it still suggest food I actually like?**

Yes. You tell it the cuisines you love and your diet, and the plan is built to help you feel better without giving up the food you enjoy. It also only suggests meals you can make with the equipment you have.

### Features / how it works

**How do I get my next meal?**

Tap the centre Next Meal button and follow three calm steps. Tell us what you fancy, tweak how it is made if you want, and pick where it comes from, like your pantry, a photo of your ingredients, or just an idea. You will see a summary of exactly what will be cooked, then tap Create meal.

**What are the ways to find a meal?**

There are four sources. Your full pantry, hand picked pantry items, a photo of your ingredients, or 'From an idea' with no pantry needed. You can also skip ahead and cook from a recipe you have already saved.

**Can I cook from a photo of my ingredients?**

Yes. Choose Snap ingredients, take a photo or pick one from your library, and the app reads what is there. You confirm everything on a quick check screen, where you can remove, fix, or add anything before it cooks.

**Where did the camera or scan tab go?**

Scanning now lives inside Next Meal. The old separate scan tab and floating camera button are gone. Snap ingredients uses your phone camera or photo library right inside the flow.

**Will changing settings for one meal change my profile?**

No. Tweaks to diet, cuisine, allergies, time, servings, or strict pantry apply to this meal only. Your saved profile defaults stay exactly the same. Permanent changes live in your Profile.

**What is Log a cook?**

It is a free way to log a meal you already made, with no recipe and no AI needed. Add a name, an optional photo or before and after photos, the meal type, and a note, so your kitchen history, streak, and savings stay complete.

**What is the Kitchen, or Saved, tab?**

It is one place that brings together your Pantry, which is what you have at home, and your Recipes, which are the meals you have saved and love. We describe it as everything you have, and everything you love.

**How do I add things to my pantry?**

Three ways. Type an item in, use voice input, or scan a grocery receipt. With a receipt, the app reads the items so you can review and edit them before adding them all at once.

**How does Just Cooked handle food that is going off?**

You can add optional use by dates to pantry items. They show as soft, calm badges, like Fresh, Use soon, and Use today, in warm tones. We never use an alarming red, and a gentler mode can soften the wording even more. This is a calm reminder, not a food safety guarantee, so always use your own judgement about what is safe to eat.

**If I delete a pantry item by mistake, is it gone?**

No. Deleting moves an item to a recoverable bin for 7 days, so you can restore it. After 7 days it is removed for good.

**Can I add my own recipes?**

Yes. Add a cover photo, the story behind it, time, difficulty, servings, ingredients, and steps. Steps can be typed, added as photos or screenshots, or simply a link to an online recipe, so your family and online favourites can live alongside the ones the app suggests.

**Can I organise my saved recipes?**

Yes. Save recipes to your library, then group them into Albums, including nested folders with custom covers. You can also search your recipes and filter by Favourites, Recently cooked, or Under 15 minutes.

**Can I share my recipes with friends?**

Yes. You can create a share link that opens a clean recipe page on the web and links back into the app. You decide whether people can save it, copy it, or re-share it, and you can change those permissions later.

**Is there a social feed or followers?**

Not today. Your cooking history is a private journal just for you. If you share a recipe, you can see a quiet count of who viewed, saved, favourited, and cooked it, and that is visible only to you. There is no public feed, no followers, and no comments.

**What if it cannot make a recipe?**

You will get a calm, plain nudge rather than a confusing error. It might suggest adding a few items, easing one setting, or starting From an idea to build a meal from your request instead.

### Food relationship & safety

**Is Just Cooked a medical, therapy, or treatment app?**

No. Just Cooked is not a medical or therapeutic tool, and it is not a substitute for professional care. It is a warm, everyday companion for the days food feels hard. If you are struggling, it gently encourages you to reach out for real help, and it can point you toward verified support lines and professionals.

**What if my struggles with food go deeper than what to cook?**

The app is designed for that. The setup options range from everyday friction to deeper food relationship struggles, all phrased with no judgement, and the app quietly adapts the level of support to match. It welcomes you wherever you are, while being honest that it is a supportive tool, not treatment.

**What is the Support tab?**

It is a calm toolbox for the hard food moments. Depending on what you shared during setup, it can include a panic and grounding flow with breathing and people to call, a one tap I need to eat meal, Gentle mode to soften the app, takeaway savings encouragement, and an optional weekly focus. You choose which tools show and in what order.

**What is 'I need to eat'?**

For the days when eating feels like too much, it finds a simple meal you can make in about 5 minutes from what is already in your pantry. There are no calorie or macro numbers and no decisions to make. Any amount counts, and even a few bites is looking after yourself. If your pantry is empty, it gently suggests grabbing something simple instead.

**What is Gentle mode?**

Gentle mode lets you soften the app to your comfort. You can hide calories, hide protein, hide streaks, hide goals, and switch to gentler 'good for now' wording instead of expiry dates. Turn on as much or as little as helps. You are in control.

**What does the Panic button do?**

It opens a calm screen for hard moments. There is a short guided breathing exercise, a personal reason you have written for looking after yourself, your own saved people to call, and links to support resources. It is there whenever a moment feels like too much, and you leave with a gentle 'I'm okay now'.

**Does the breathing exercise have sound?**

Yes. The guided breathing session offers an optional calming sound, a soft looping ambient track that plays only while you are breathing. You can leave it off if you prefer silence.

**Can I add my own people to call?**

Yes. You can save your own trusted contacts, with a name, phone, and an optional photo, and reach them in one tap from the Panic screen. These contacts are private to you. The app only helps you place the call. It never contacts anyone automatically on your behalf.

**Can I get help in a crisis through the app?**

The app can point you toward real help, including a searchable list of verified support lines by country that you can tap to call, and gentle guidance on talking to your doctor or someone you trust. These lines are best reached from within each country. Just Cooked itself is not a crisis service, so if you are in immediate danger, please call your local emergency number.

**Will the app push weight or calorie goals on me?**

No. Calorie, protein, and weight tools are optional and off by default. If your answers suggest food has felt really hard, those number based tools are not recommended to you and stay hidden unless you choose them. You can also turn numbers off everywhere with Gentle mode.

### Nutrition & calories

**Do I have to track calories or weigh myself?**

No. Calorie and protein figures are off unless you choose to turn them on, and they are only ever shown per recipe and per cook. Gentle mode can hide streaks, goals, and numbers too. The defaults are neutral and low pressure, never calorie counting or weigh ins.

**Are the calorie and protein numbers medical advice?**

No. Just Cooked is not a medical app, and the figures are gentle estimates you can adjust any time, not advice or clinical targets. They use standard, well known formulas and are framed as guides, not rules.

**Do I have to enter my body details?**

No. Body details like weight, height, age, and sex are only asked for inside the optional Weight goal and Protein goal tools, at the moment you choose to use them. They are never a required part of setup, and they are used only to estimate those figures.

**What can I choose to track?**

You pick one focus at a time to show on your Home tracker. Options include home cooked days, meals eaten per day, money saved from skipping takeaway, logging one meal a day, and, if you have numbers switched on, protein or calories. You set a gentle weekly day goal, and you can change your focus any time without losing your streak.

**How does the takeaway savings number work?**

You tell the app what your usual takeaway costs, and every meal you actually cook or log instead of ordering counts as that amount saved. The total is worked out from your own meals each time you open it, so it always reflects real activity. Meals you log as an actual takeaway are not counted as savings, and there is nothing to set up if you would rather not.

### Privacy & data

**Is my cooking history public?**

No. Your cooking history is a private grid just for you, a record of the meals you have actually cooked. You can hide individual cooks, restore them later, or delete them.

**What happens to my setup answers?**

They personalise your experience. Your plan, the starting tracker on your Home screen, and which Support tools are switched on are all shaped by what you shared. Your answers are stored on your device during setup and saved to your account when you finish.

**How do I delete my account?**

Go to Profile, then Data and Privacy, then Delete account, and type 'delete' to confirm. This permanently removes your profile, saved recipes and folders, and cooking history and photos. It cannot be undone. Deleting your account does not cancel your store subscription, so cancel that separately in the App Store or Google Play.

**Where can I read your privacy policy and terms?**

From Profile, open About and Legal to find the Privacy Policy, Terms and Conditions, Cookie and Tracking Policy, the Medical, Allergy and AI Disclaimer, and the EULA. They are also available on our website.

### Pricing & subscription

**Is Just Cooked free?**

You can start with a 3 day free trial that gives you full access. After that, Just Cooked is a paid subscription. Cooking from recipes you already have, logging a cook, and browsing your saved recipes and pantry are always included and do not use your daily allowance.

**How much does it cost?**

Just Cooked is available as a monthly or yearly subscription. The exact price is shown in the app and on the App Store or Google Play, where it can vary by region and currency.

**What happens after the free trial?**

During your 3 day trial you have full access with no paywalls. When it ends, you will be asked to subscribe to keep using the AI features. Your saved recipes, pantry, and history stay with you either way.

**Is there a daily limit?**

To keep the app fast and fair for everyone, there is a generous daily allowance for AI actions like generating recipes and scanning, and it refills each day. If you ever reach it, you can continue again tomorrow. Cooking from existing recipes and logging cooks do not count toward it.

**Do I lose my recipes if my subscription ends?**

No. If your subscription lapses you keep read only access to your saved recipes, pantry, profile, and cooking history. You will just be asked to resubscribe to use AI features like generating new recipes or scanning.

**How do I cancel or change my plan?**

Your subscription is managed through your device store account, the App Store or Google Play. You can change, cancel, or view your billing history there. You can also use Restore Purchases to bring your subscription to a new device.

**Can I use a promo or creator code?**

Yes. During setup, or later in the app, you can enter a promo or creator code to support a creator or unlock special offers. It may add subscription time, bonus usage, or both, and it is always optional.

### Account & devices

**What is the difference between my name and my @tag?**

Your display name is how Just Cooked greets you, like 'Morning, Alex', and it does not have to be unique. Your @tag is a unique handle that is yours alone. You set both in Edit Profile, and changing one never changes the other.

**How do I see my subscription status?**

Open Profile, then Plan and Billing. Your plan shows simply as Active or Inactive, along with your member since and valid until dates. There is no confusing premium or expired jargon, just whether you are active right now.

**Can I use Just Cooked on a new phone?**

Yes. Sign in on your new device, and use Restore Purchases in Plan and Billing to bring your subscription across. Your saved recipes, pantry, and cooking history are tied to your account.

**What are the little celebration screens?**

When you hit your weekly goal or reach a cooking streak milestone, Just Cooked shows a soft, no pressure moment to notice that you showed up. They are intentionally gentle, with warm wording like 'it already counts', and they are turned off for anyone using Gentle mode.

### Technical

**Is Just Cooked on both iPhone and Android?**

Yes. Just Cooked runs on iPhone and Android, and you subscribe through the App Store or Google Play depending on your device.

**How does the app recognise my ingredients from a photo?**

Point your camera at your ingredients and the app recognises the food, then builds real, cookable recipes around what you have. You always get a quick check screen to remove, fix, or add anything before it cooks, so the result stays in your hands.

**Are the recipes always accurate?**

The recipes are AI generated and meant as inspiration, so you are the final judge of what is right and safe for you. We apply your diet and allergies on a best effort basis and label allergens avoided, but this is not a medical guarantee, so please check ingredients yourself if you have an allergy.

**How do I contact support?**

From Profile, open Help and Support to email us, request a feature, or report a bug. We typically respond within 24 hours, and you can also email us directly at support@justcooked.app.


---

## 9. Master must-mention checklist and value propositions

A consolidated, deduped quick-reference built from every surface audit. Use this as the launch acceptance checklist for the site.

### 9.1 The non-negotiables (every visitor should leave knowing these)

- [ ] Just Cooked is a calm food SUPPORT tool 'for when food feels hard', NOT a generic recipe/meal-planning app and NOT a medical, clinical, or eating-disorder treatment tool. This non-medical framing appears verbatim across Support, the calculators, and the safety layer and MUST carry to the website.
- [ ] Brand name is always 'Just Cooked' (two words, capital J, capital C). Use the locked tagline set verbatim: 'Not perfect. Just cooked.' / 'For when food feels hard.' / CTA 'Start where you are.' / StoryBrand hero 'Food feels hard for a lot of people. Just Cooked helps you find your way back, one small meal at a time.'
- [ ] House style is binding: NO em dashes anywhere; warm guide-to-a-friend voice; low-pressure, non-medical, never shaming; no hype/urgency; acknowledge the struggle first, then offer the next small step; second person 'you'; offer possibility without guaranteeing outcomes.
- [ ] The core promise is 'one doable meal at a time' based on what you have, what you love, and how much effort you have today, replacing the cycle of starting over. Stop overthinking food; break the loop of stress/boredom/anxiety/guilt-driven eating.
- [ ] It is gentle by default about numbers: calories and protein are OFF by default, fully opt-in, and can be hidden everywhere via Gentle Mode (which can also hide streaks/goals and soften expiry wording). Never market this as calorie-counting, macro-tracking, or weight loss.
- [ ] The product is personalised from an intake quiz that meets people across a full spectrum (everyday 'what's for dinner' friction through to deeper food-relationship struggles), with repeated 'No judgement' framing; answers shape the plan, the Home tracker, and which Support tools turn on.
- [ ] The Support tab is the biggest differentiator: a calm toolbox for hard food moments (Panic/grounding + 2-minute guided breathing with live ambient sound, 'I need to eat', Gentle Mode, Takeaway savings encouragement, Choose Focus), personalised so not everyone sees every tool.
- [ ] ED-safety is real and central: weight/protein number tools default OFF, are never auto-recommended (and are labelled 'Not recommended for you') for users whose answers signal eating-disorder risk, and number content is hidden for gated users. Crisis content signposts OUT to verified helplines and professionals; the app is not a crisis service.
- [ ] Next Meal is the flagship centre tab: a calm 3-step guided build (what you fancy, how it's made, where from) with four sources (full pantry, hand-picked items, a photo of your ingredients, or just an idea), plus a free no-AI 'Log a cook'. The old separate Scan tab and floating camera button are gone.
- [ ] It is a paid subscription (monthly or yearly via App Store / Google Play) with a 3-day free trial that grants full access and no paywalls; manage/cancel in the store. If a subscription lapses you keep read-only access to all your saved data; only AI features require an active subscription.
- [ ] Cooking is celebrated for the act, not perfection: 'You cooked. That counts.' Logging a meal you already made (even a takeaway) is free and counts. The warm, no-pressure tone (greeting 'What feels possible today? Small steps count.', 'Any amount counts') is consistent everywhere.
- [ ] Your cooking history is a PRIVATE personal journal today (Instagram-style grid of meals you cooked); sharing is opt-in and link-based; there is no public feed, followers, or comments. The 'Strava of food' social layer is a future vision, not shipped.
- [ ] The visual brand is warm editorial-kitchen: cream surfaces, ink-brown (not pure black) text, brand orange #E94B1F (not legacy #FF4500), calm sage secondary, the JC concentric-ring monogram (own gradient #FF6500 to #FF1500), marble countertop textures, and the typographic 'warm paper certificate' as the hero object.

### 9.2 Strongest value propositions (hero and landing copy)

- Built for the days food feels hard, not the days everything is going right. A calm food support tool that meets you on your worst days, not just your best.
- Stop overthinking food. Get one doable meal based on what you have, what you love, and how much effort you have today, one calm step at a time.
- A whole toolbox for the hard moments: slow breathing, your reasons and the people you trust to call, and a one-tap 'I need to eat' that finds something simple in about 5 minutes when deciding feels impossible. Any amount counts.
- Numbers only if you want them. Calories and protein are off by default, and Gentle Mode can hide streaks, goals and numbers and soften expiry wording, so the app stays kind on the days you need it to be.
- No judgement, ever. A personalised plan built around how food actually feels for you, from everyday 'what's for dinner' friction to deeper struggles, with no shame and no perfection.
- Decide your next meal in three calm steps, from your pantry, a quick photo of your ingredients, or just an idea, so a blank fridge is never the end of the road.
- Cook from what you already have, waste less, and watch the money add up as you cook instead of ordering in. Encouragement, never judgement.
- Every cook counts. 'You cooked. That counts.' Even a meal you already made or a hand-logged takeaway keeps your private cooking history and progress going, for free.
- One Kitchen for everything you have and everything you love: a fridge-style pantry you fill by typing, voice, or a quick receipt scan, beside your growing recipe library.
- Try it free for 3 days with full access and no nags: no paywalls or feature locks during the trial. One simple subscription, monthly or yearly, manage it in your app store and cancel anytime.
- If you ever pause, nothing you saved disappears. You keep your recipes, pantry and cooking history; only the AI help waits until you're back.
- Built responsibly and gently. Non-medical, non-shaming, with crisis support that points you to qualified professionals and verified helplines around the world. Not perfect. Just cooked.

### 9.3 Do not claim, or must caveat (quick reference)

These protect the brand and keep it honest and non-medical. Cross-check every page against this list.

- Do NOT present Just Cooked as medical, clinical, therapeutic, diagnostic, eating-disorder treatment, nutrition-coaching, or a substitute for professional care. The app explicitly disclaims this ('Just Cooked is not a medical or therapeutic tool', 'not a medical app. These are gentle estimates, not advice'). The website MUST carry the same disclaimer and direct people in crisis to call local emergency services / professionals.
- Do NOT use diet, weight-loss, calorie-counting, macro-hitting, before/after, or 'track your way thinner' framing as headline value. Weight/protein tools are optional, gated, default-OFF, and hidden for ED-risk users; leading with them contradicts the brand and safety model.
- Do NOT publish specific helpline phone numbers on the website. The directory covers only 12 countries, some entries are general mental-health (not ED-specific) lines, numbers/hours drift, and the code itself flags a required founder re-verification before launch. Describe the in-app country list instead, and say numbers are best reached from within each country.
- The HARD PRE-LAUNCH ED REVIEW is still outstanding: the Weight/Protein calculator outputs and all 'I need to eat' copy must be reviewed by someone with eating-disorder clinical or lived experience before they ship. Do not over-promise clinical safety, validated safety, or recovery support.
- Do NOT claim the locked tagline set or StoryBrand hero already appears in the app; they exist only in the website spec. The app's live positioning line still reads 'Just Cooked — for when food feels hard.' (with an em dash, the OLD form to avoid). Do not present app and website copy as identical.
- Do NOT name AI vendors (Google Vision, OpenAI, GPT). Describe capability only ('recognizes your ingredients', 'AI-generated recipes'). Recipes are AI-generated INSPIRATION, not guaranteed-accurate culinary or nutritional instructions; allergens/diets are best-effort pre-filtering, NOT a medical allergen guarantee.
- Do NOT claim 'unlimited'. There is a real daily AI allowance and a 'fair use' daily limit (the word 'unlimited' only survives in legacy TrialBanner copy). Do NOT describe the app as free or freemium: there is no permanent free tier; free actions (cook from a saved recipe, log a cook, browse) only work within a trial or subscription.
- Do NOT publish exact prices, currency, or discounts without confirming them: prices live in RevenueCat / the App Store / Google Play, NOT in the app code (the only in-code figure is an internal ~£10/user/year cost ceiling, not the customer price). Promo/creator codes are campaign-specific, not a standing public offer.
- Do NOT say subscription status is stored in the app's backend. By Apple-compliance decision, RevenueCat is the only source of truth and status is never persisted as truth in Supabase. The website must not imply the app stores or controls billing.
- Do NOT over-promise concrete savings or numbers. 'Spend 3-5x less', the time figures, sodium/fat percentages, '30% less waste', and any sample savings are illustrative onboarding animations, not measured guarantees; soften to 'can help you spend less'. Takeaway savings only populate after the user enters an average cost.
- Do NOT market a public social network, feed, followers, comments, likes, or leaderboard. The only social surfaces today are private cooking history and owner-only Share Performance stats on link-shared recipes. The 'Strava of food' vision is explicitly deferred / multi-sprint.
- Do NOT advertise not-yet-shipped or stubbed features as live: multi-recipe-per-cook is soft-disabled (MAX_RECIPES_PER_COOK = 1, only one recipe per cook today); the self-report daily check-in / tracker_entries pipeline is NOT wired (only one focus is active at a time, and meals_eaten has no real data source); 'Days without takeaway' and 'Used expiring food' are NOT user-pickable trackers; there is no dedicated 'use expiring ingredients' button in Next Meal; the Kitchen-home 'Search saved' affordance is not wired (per-recipe search inside Recipes DOES work); the photo 'Snap ingredients' path does not yet thread the typed request/modifiers through; the broader ED-risk gate (impact_areas + eating_pattern) is DRAFT and inactive (live gate keys on serious issue_tags only).
- Do NOT frame emergency contacts as monitoring, alerting, dispatch, or auto-notification. The app does not call or message anyone on the user's behalf; it only helps the user place a call. Contacts and photos are the user's private data.
- Do NOT imply users receive a downloadable/exportable plan document; the 'PERSONALISED FOR [Name]' certificate is an onboarding artefact/promise, not a separate exportable file. Do not imply the plan syncs to an account before sign-up/purchase.
- Do NOT use red 'warning' colour semantics or alarming language for food/health states (expiry shows as warm 'Fresh' / 'Use soon' / 'Use today', never red). Pick ONE spelling convention ('takeout' vs 'takeaway', currency symbol) since the app mixes them.
- The James Clear / Atomic Habits quote is third-party attributed and the QuotePrincipleBoard was REMOVED from the live onboarding flow; clear usage/licensing before putting that quote on a public page. Do not quote 'Strava' to users (it's only an internal dev comment).

### 9.4 Per-surface must-mention index

**Brand identity, voice, naming, what changed (from rebrand docs)**

- Brand name is always 'Just Cooked' (two words, capital J, capital C). Never 'just cooked', 'JUST COOKED', or 'JustCooked' in prose.
- The website MUST use the locked tagline set verbatim: 'Not perfect. Just cooked.' / 'For when food feels hard.' / 'Start where you are.' Do NOT copy the app's older line.
- NO em dashes anywhere. This is a binding house-style rule; use full stops, commas, or restructure.
- Positioning is a food-relationship SUPPORT tool, not a generic recipe app, and explicitly NOT a medical or clinical app.
- Voice is a guide talking to a friend: warm, plain, low-pressure, non-medical, never shaming. Acknowledge the struggle first, then offer the next small step.
- The brand serves the full spectrum: everyday food friction through to deeper struggles ('for when food feels hard'), without singling anyone out.
- Use the V1.2c brand orange #E94B1F as the primary accent; the JC monogram uses its own distinct gradient (#FF6500 to #FF1500).

**Onboarding narrative & positioning**

- Just Cooked positions itself as a 'personal food support system' built for the days food feels hard, NOT a generic recipe or meal-planning app.
- The core emotional thesis: 'Food is not just food.' It shapes energy, mood, money, goals, and headspace; when food feels hard the cost shows up everywhere.
- The product gives you 'one doable meal' based on what you have, what you love, and how much effort you have today (it is explicitly low-pressure and one-meal-at-a-time, not a rigid plan).
- The brand is built for hard food days but explicitly NOT a medical or therapeutic tool (this disclaimer appears in the Support surface and should be honored on the site).
- The 'system' is the central promise: 'This time you have a system' replaces the cycle of starting over every week.

**Onboarding personalisation quiz (what it asks & collects)**

- The onboarding is a personalisation quiz, not a generic signup: it asks how food has actually been feeling for you, with repeated explicit 'No judgement' framing.
- The product personalises on two layers: an emotional/relationship layer (how food feels, what it's costing you, what it affects, how long it's felt hard) AND a practical kitchen layer (diet, allergies, cuisines, equipment, effort, goals).
- Answers actively change the app: they set a personalised plan, choose your default Home tracker, and decide which Support tools are recommended and switched on.
- Users control whether nutrition numbers appear at all, via separate Show calories and Show protein toggles that both default OFF and can be changed any time.
- The friction 'score' shown during onboarding is explicitly framed as 'not a medical diagnosis' and is used only to personalise the plan.
- The struggle taxonomy spans a real range, from everyday friction (deciding what to eat, fridge paralysis) through loops (groceries-then-takeaway, skipping meals) to serious food-relationship struggles, so the site can honestly say it meets people wherever they are.

**Onboarding plan reveal, "personalised plan" & paywall framing**

- The plan is personalised: it is built from the user's onboarding answers and addressed to them by name (the certificate literally reads 'PERSONALISED FOR [Name]').
- The plan is framed around the user's relationship with food, not just recipes: 'A plan built around how you actually eat' and 'This is your path to a better relationship with food.'
- Just Cooked is a paid subscription. After the plan is built, the app shows a paywall and the plan stays locked until the user subscribes or restores a purchase.
- Trust/billing terms shown at the gate: 'Secure purchase. Cancel anytime. Start with your next meal.' and restore-purchase + sign-out options are available.
- The plan/certificate is the core 'what you get' artefact and is centred on making the next meal easier, one meal at a time.

**Next Meal: the flagship feature**

- Next Meal is the flagship centre tab and the primary way to decide and create a meal, opened from the elevated centre button in the new 5-tab nav (Home / Saved / Next Meal / Support / Profile).
- It is a guided 3-step flow (What are you in the mood for > How it is made > Where from) followed by a Review screen, described in-app as We will guide you, one calm step at a time.
- There are four ways to source a meal: your full pantry, hand-picked pantry items, a photo of your ingredients (Snap ingredients), or From an idea (request only, no pantry needed); plus a skip-ahead to cook from a saved recipe.
- The old in-app camera / Scan tab and the floating camera button are gone: photo scanning now lives inside Next Meal and uses your phone native camera or photo library, then a Check the scan / We spotted these confirmation step.
- Per-meal tweaks (diet, cuisine, allergies, time, servings, strict pantry, modifiers) apply to this meal only and never change your saved profile defaults.
- Log a cook is completely free, uses no credits and no AI, and is for meals you already made.

**Home hub & Kitchen (Pantry + Saved cookbook)**

- The Saved tab is the combined 'Kitchen': it brings together your Pantry (what you have) and your Recipes (what you love) behind one screen — the tagline copy is 'Everything you have, and everything you love.'
- Expiry/freshness is framed calmly and is never red or alarming: badges read 'Fresh', 'Use soon', and 'Use today', using warm sage / butter / peach tones rather than warning colours.
- The Home tracker is low-pressure by design: copy explicitly says things like 'No pressure — every cook counts' and 'Small steps count.'
- Pantry items are never hard-deleted by accident — they go to a recoverable bin for 7 days.
- Receipt scanning, voice input, and manual entry are all ways to fill the pantry; receipt scanning lets you review and edit items before adding.

**Support hub: Gentle Mode, Meditation, Panic, I Need to Eat**

- Just Cooked is not a medical or therapeutic tool. The app itself states this verbatim ('Just Cooked is not a medical or therapeutic tool. In crisis, please reach a professional or a line below.') — the website must carry the same non-medical disclaimer and not imply treatment, diagnosis, or therapy.
- The Support hub is personalised: tools are auto-curated from the user's onboarding answers (struggle signals, impact areas, goals), so what each person sees differs. Don't present a fixed feature list as if everyone gets all of it by default.
- ED-safety gating is real and central: weight/protein calculators are never auto-recommended (and are labelled 'Not recommended for you' + default OFF) for users whose answers signal eating-disorder risk; the personalised tour and number surfaces hide calorie/protein content for gated users. The site must not foreground calorie/weight tracking as a headline feature.
- Crisis signposting points OUT to qualified professionals and verified helplines — Just Cooked does not provide crisis counselling itself.
- Tone is non-shaming and low-pressure throughout ('Any amount counts', 'no right amount and no wrong choice', encouragement never judgement). Marketing copy must match this register and avoid diet/weight-loss framing.
- House style: NO em dashes; warm, gentle, non-medical.

**Support calculators & trackers**

- These calculators produce ESTIMATES, not medical advice. The app says verbatim: 'Just Cooked is not a medical app. These are gentle estimates, not advice.' The website must carry the same non-medical, estimate-only framing and must not present calorie/protein numbers as clinical targets or weight-loss promises.
- Calorie and protein figures are estimates a user can adjust any time, with no pressure. The Weight Goal 'Lose' option is deliberately gentle (about 0.4 kg per week) and the calorie estimate is floored at 1200 kcal so a deficit can never produce an unsafe figure.
- Calorie and protein features are ED-safety gated: if a user has hidden calories/protein (via onboarding or Gentle Mode), those numbers, progress bars, streaks, and the Protein hit / Calories hit tracker options are hidden. The website must not imply nutrition tracking is always shown or unavoidable.
- Takeaway savings are REAL, derived from a user's own completed cook sessions multiplied by the average cost they enter (savings = completed meals x average cost). They are computed at read time, never a stored running total, and any meal logged as an actual takeaway is excluded from savings. The site should not quote fabricated sample savings figures as if typical.
- Only one tracker / focus is active at a time; choosing a new one replaces it. Marketing should not imply users juggle many simultaneous goal dashboards.

**Safety net: ED helplines, emergency contacts, find help**

- Just Cooked is NOT a medical, clinical, therapeutic, or treatment tool, and is not a substitute for professional care. This exact framing is in the app ("Just Cooked is not a medical or therapeutic tool") and must appear on the website.
- The website must tell people in crisis or immediate danger to call their local emergency number / a professional, not rely on the app. The in-app footer reads: "In crisis, please reach a professional or a line below."
- Helpline numbers and hours are point-in-time and country-specific; the code itself flags that they require founder re-verification before launch and "drift" over time. The website must not present the directory as guaranteed-current or exhaustive, and should say numbers are best reached from within each country.
- The directory currently covers 12 countries only (Australia, Canada, France, Germany, India, Ireland, Netherlands, New Zealand, Singapore, South Africa, United Kingdom, United States). Some entries (India, Singapore, South Africa) are general mental-health lines because no national ED-specific line exists there. Do not imply global or complete coverage.
- Personal emergency contacts and any contact photos are the user's own private data; the site should frame this as a private, user-controlled feature, not monitoring or an alert/dispatch service. The app does NOT auto-call or notify anyone on the user's behalf; it only helps the user place a call.
- The ED-safety experience (hiding numbers, not recommending calculators) is a softening/visibility layer, not a clinical assessment or diagnosis; the app never diagnoses an eating disorder.

**Recipe generation, cook sessions, sharing & social proof**

- Recipes are AI-generated and meant as inspiration, not guaranteed-accurate culinary or nutritional instructions; the user is the final judge of what is safe and right for them.
- Sharing is opt-in and link-based (justcooked.app/recipe/[id]); recipes are private by default (is_public:false) and only shared when the user creates a link.
- The 'social' layer is lightweight and supportive: cook history is the user's own private journal, and 'Share Performance' (Views/Saved/Favorited/Cooked) only appears to the owner of a recipe they chose to share. There is no public feed, follower graph, or comments.
- Photo ingredient detection uses Google Vision today; the website should describe it as 'point your camera at your ingredients' rather than naming a specific AI vendor.
- Nutrition is calories + protein only, optional, and per serving; it is hidden everywhere unless the user has it switched on (ED-safety gate). Never frame the app as calorie tracking or weight loss.
- Allergies and diets are applied and shown as 'Allergens Avoided', but the app pre-filters on a best-effort basis and is not a medical allergen guarantee.

**Profile, identity, cook history, celebrations**

- Display name and unique @tag username are two separate things: the display name is how the app warmly addresses you (e.g. the greeting) and is NOT unique; the @tag is your unique handle. The site must not conflate them.
- Subscription status is shown to users only as 'Active' or 'Inactive' (never premium/expired/cancelled/trial/refunded) and is managed through the App Store / Google Play, not in-app.
- Your cooking history is private to you (a personal grid of meals you have cooked); it is NOT a public social feed today.
- Nutrition numbers (calories/protein) are opt-in and can be hidden; Gentle Mode can hide streaks, hide goals, and soften expiry wording. The product is designed to be non-shaming and low-pressure.
- Body details (height/weight/gender/activity) are optional and used only to estimate calorie/protein targets, not to judge the user.

**Pricing, subscription, credits, paywall, fair usage**

- Just Cooked is a paid subscription app: full access requires an active subscription (after the free trial). It is not a free app.
- There is a 3-day free trial that gives full access with no paywalls during the trial.
- Subscription is billed and managed through the Apple App Store / Google Play; users change, cancel, or view billing there, not inside the app.
- Do not publish exact prices on the website unless you confirm them: actual prices, currency and any intro offer live in RevenueCat / the App Store, NOT in the app code. The code only references an internal cost cap (~£10/user/year of AI usage), which is a cost ceiling, not the customer price.
- Subscription/entitlement status is sourced ONLY from RevenueCat (the single source of truth) for consistency and Apple compliance; it is deliberately never persisted as the source of truth in the app's own database.
- If a subscription lapses, users do not lose their saved data: they keep read-only access to saved recipes, pantry, profile and cooking history; only AI actions require reactivating.


---

## 10. Coverage notes and items to confirm

Gaps and judgement calls surfaced during the audit. Confirm these before or during the website build.

- DESIGN SYSTEM / VISUAL BRAND is almost entirely missing from the feature audits but is fully specified in WEBSITE_REBRAND_SPEC.md and is load-bearing for the site: warm editorial-kitchen palette (cream #F5EFE6 base, ink-brown #1A1815 text never pure black), brand orange #E94B1F (NOT the legacy #FF4500), calm sage #9CB58A secondary, the JC concentric-ring monogram with its OWN distinct gradient #FF6500 to #FF1500, marble/stone countertop textures, ink-tinted (never pure-black) shadows, Inter typography. The hero brand object is the typographic 'warm paper certificate' RecipeCard (cream paper, deep-orange linework, sage seal), NOT a food photo.
- The actual COOKABLE RECIPE PAGE (Spec Section 5) is barely touched by the audits and is what a shared-recipe web page must render: lined-notebook surface, photo-optional hero with a cream placeholder (many recipes have NO image), ingredient cook-along checkboxes, numbered method step cards, sage 'Recipe Details' rows (cuisine, diet, allergies avoided, equipment), byline 'By Just Cooked' for AI recipes. This is a DIFFERENT screen from the onboarding certificate and must not be conflated.
- PUBLIC NUTRITION GATING PROBLEM: on an anonymous public/shared recipe web page there is no logged-in user and therefore no show_calories/show_protein signal to gate on. The website team must make a product decision (always show, always hide, or author-opt-in). No audit surfaces this; the spec flags it as an open question. The site must not just dump calories/protein on a public page given the ED-safe positioning.
- Onboarding answers are stored locally (AsyncStorage) during the flow and only flushed to the backend at account creation; the support-tool curation runs ONCE at onboarding and never re-runs when answers change, and there is no post-onboarding edit screen for the most personal answers. Privacy copy must stay factual: no real-time cloud profiling during the quiz, and don't imply users can freely re-tune their struggle profile and instantly re-personalise.
- The exact brand spelling/treatment rules are a gap across audits: always 'Just Cooked' (two words, capital J, capital C), never 'just cooked' / 'JUST COOKED' / 'JustCooked' in prose. The locked CTA is 'Start where you are.' and the StoryBrand hero is 'Food feels hard for a lot of people. Just Cooked helps you find your way back, one small meal at a time.' These exist ONLY in the website spec, not in the app yet.
- Cross-platform reality: this is a single app on BOTH iOS and Android. The site should present it as available on both App Store and Google Play, with subscriptions managed in each store. No audit states the dual-platform availability explicitly.
- Soft / read-only access when a subscription lapses is a strong reassurance the audits mention but the site should foreground: you never lose your saved recipes, pantry, profile or cooking history; only AI generation/scanning requires an active subscription. This de-risks the paywall for prospects.
- Receipt scanning, voice input, and manual typing as THREE ways to fill the pantry (with receipt scan letting you review/edit before adding) is a concrete utility differentiator that is easy to under-sell; it sits in the Kitchen/Pantry audit but deserves landing-page prominence as a low-effort feature.
- Trial mechanics specifics: the 3-day free trial grants FULL premium access with NO paywalls or feature locks during the trial (a deliberate trust-first model). The site should lead with 'full access, no nags' rather than a generic 'free trial'.
- The 'one Kitchen for everything you have and everything you love' framing (Pantry + Recipes unified under the Saved tab, route 'Kitchen', tagline 'Everything you have, and everything you love.') is a clean IA story the audits capture but that should be elevated as a navigational/value pillar alongside Next Meal and Support.
- Albums/folders with nested subfolders and custom covers, plus the gentle 7-day recoverable pantry bin (nothing lost by accident), are forgiving-by-design touches that reinforce the low-pressure brand and are easy to omit from a feature list.
- Sharing model nuance: recipes are PRIVATE by default and only shared via an opt-in justcooked.app/recipe/[id] link, with owner control over copy/re-share permissions, and owner-only 'Share Performance' stats (Views/Saved/Favorited/Cooked). There is NO public feed, followers, or comments today. The site should describe the gentle, private, link-based sharing accurately and not imply a social network.

> Reuse note: several real app strings the report quotes verbatim contain em dashes (for example "Full pantry — Build it from everything you have" and "Support — A calm toolbox for the hard food moments"). The app UI predates strict enforcement of the no-em-dash rule. When reusing any of these strings on the website, rewrite the em dash out (use a full stop or comma) to match the locked house style.


