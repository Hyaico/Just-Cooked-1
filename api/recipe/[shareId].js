// Vercel Serverless Function — /api/recipe/[shareId]
// Queries Supabase directly and returns a fully-styled HTML recipe page.

export default async function handler(req, res) {
  const { shareId } = req.query;

  if (!shareId || typeof shareId !== 'string') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(renderNotFound());
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sglxaaehziokuimtnnqw.supabase.co';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_KEY) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(renderError('Server configuration error.'));
  }

  try {
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_shared_recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ p_share_id: shareId }),
    });

    if (!rpcRes.ok) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(renderNotFound());
    }

    const data = await rpcRes.json();
    if (!data) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(renderNotFound());
    }

    const recipe = data.recipe_data || {};
    const ownerUsername = data.owner_username || 'someone';
    const thumbnailUrl = data.thumbnail_url || null;

    const ua = req.headers['user-agent'] || '';

    // Skip tracking for bots, crawlers, and link-preview scrapers (Slack, iMessage, WhatsApp, etc.)
    const BOT_PATTERN = /bot|crawl|spider|slurp|facebookexternalhit|twitterbot|whatsapp|slack|telegram|discord|linkedinbot|applebot|googlebot|bingbot|yandex|curl|wget|python|java|go-http|okhttp|axios|node-fetch|preview|prerender|headless|phantom|puppeteer|lighthouse/i;
    const isBot = BOT_PATTERN.test(ua) || !ua;

    // Track unique view: hash IP + UA so each unique visitor counts once
    if (!isBot) {
      (async () => {
        try {
          const crypto = await import('crypto');
          const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
          const viewerId = 'web_' + crypto.createHash('sha256')
            .update(`${ip}:${ua.slice(0, 120)}`).digest('hex').slice(0, 24);
          await fetch(`${SUPABASE_URL}/rest/v1/rpc/track_share_view`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`,
            },
            body: JSON.stringify({ p_share_id: shareId, p_viewer_id: viewerId, p_viewer_type: 'web_anon' }),
          });
        } catch { /* non-critical */ }
      })();
    }
    const isIos = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const storeLink = isIos
      ? 'https://apps.apple.com/app/just-cooked/id6754169071'
      : isAndroid
      ? 'https://play.google.com/store/apps/details?id=com.justcooked.app'
      : 'https://www.justcooked.app/download';

    const deepLink = `justcookedapp://recipe/${shareId}`;
    const canonicalUrl = `https://www.justcooked.app/recipe/${shareId}`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.status(200).send(
      renderRecipePage(recipe, ownerUsername, thumbnailUrl, deepLink, canonicalUrl, storeLink)
    );
  } catch (err) {
    console.error('[recipe page]', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(renderError('Could not load recipe.'));
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function titleCase(s) {
  if (!s) return '';
  return String(s).replace(/\b\w/g, c => c.toUpperCase());
}

function fmtTime(mins) {
  if (!mins) return '';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// Presentation only: map the stored difficulty (word or 1-5 number) to N/5 (spec 5.3).
function difficultyToN(d) {
  if (typeof d === 'number' && d >= 1 && d <= 5) return Math.round(d);
  const map = { 'very easy': 1, easy: 2, medium: 3, hard: 4, 'very hard': 5, expert: 5 };
  const k = String(d == null ? '' : d).toLowerCase().trim();
  if (map[k]) return map[k];
  const n = parseInt(d, 10);
  return (n >= 1 && n <= 5) ? n : 3;
}

function authorLabel(recipe, username) {
  const isCustom = recipe.authorType === 'custom' && recipe.author;
  const authorName = isCustom
    ? escHtml(recipe.author)
    : recipe.authorType === 'me'
    ? `@${escHtml(username)}`
    : 'Just Cooked';

  if (isCustom) {
    return `Recipe by <strong>${authorName}</strong> &middot; Referenced by @${escHtml(username)}`;
  }
  if (recipe.authorType === 'me') {
    return `Recipe by <strong>${authorName}</strong>`;
  }
  return `Recipe by <strong>${authorName}</strong> &middot; Shared by @${escHtml(username)}`;
}

// ─── Page renderer ────────────────────────────────────────────────────────────

function renderRecipePage(recipe, ownerUsername, thumbnailUrl, deepLink, canonicalUrl, storeLink) {
  const name = escHtml(recipe.name || 'Recipe');
  const desc = recipe.description ? escHtml(recipe.description) : '';
  const timeStr = fmtTime(recipe.totalTimeMinutes) || escHtml(recipe.preparationTime || '');
  const hasDifficulty = recipe.difficultyLevel !== undefined && recipe.difficultyLevel !== null && recipe.difficultyLevel !== '';
  const difficultyN = difficultyToN(recipe.difficultyLevel);
  const servings = recipe.servings ? escHtml(String(recipe.servings)) : '';
  const attribution = authorLabel(recipe, ownerUsername);
  const ingredients = recipe.ingredients || [];
  const instructions = recipe.instructions || [];

  // Optional hero photo; warm-cream placeholder when there is none.
  const heroStyle = thumbnailUrl ? ` style="background-image:url('${thumbnailUrl}')"` : '';
  const heroInner = thumbnailUrl
    ? ''
    : `<div class="hero-placeholder">
        <span class="hero-ph-chip"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M6 11v8M18 11v8M4 19h16"/></svg></span>
        <span class="hero-ph-cap">A Just Cooked recipe. Photo coming soon.</span>
      </div>`;

  const ogImage = thumbnailUrl
    ? `<meta property="og:image" content="${thumbnailUrl}" />
  <meta name="twitter:image" content="${thumbnailUrl}" />
  <meta name="twitter:card" content="summary_large_image" />`
    : '<meta name="twitter:card" content="summary" />';

  const checkSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  // ── Ingredients (cook-along checkboxes) ──────────────────────────────────────
  const ingHtml = ingredients.map((ing) => {
    const amtParts = [ing.quantity, ing.unit].filter(Boolean).join(' ');
    const amtText = [amtParts, ing.preparation].filter(Boolean).map(x => escHtml(String(x))).join(', ');
    const amt = amtText ? `<span class="ing-amt">${amtText}</span>` : '';
    return `<label class="ing-row">
      <input type="checkbox">
      <span class="ing-check">${checkSvg}</span>
      <span class="ing-text"><span class="ing-name">${escHtml(titleCase(ing.name || ''))}</span> ${amt}</span>
    </label>`;
  }).join('');

  const ingredientsHtml = ingHtml ? `
      <div class="card card-amber section-gap">
        <div class="sec-head">
          <span class="sec-chip sec-chip-amber"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11l-2 9h18l-2-9"/><path d="M9 11V7a3 3 0 0 1 6 0v4"/></svg></span>
          <span class="sec-title">Ingredients</span><span class="sec-count">&middot; ${ingredients.length} item${ingredients.length === 1 ? '' : 's'}</span>
        </div>
        <div class="accent-rule rule-amber"></div>
        <div class="ing-box">${ingHtml}</div>
      </div>` : '';

  // ── Step 1 (partial, adaptive clamp) ─────────────────────────────────────────
  const step1 = instructions[0];
  // 1 step only, OR step 1 is long (>180 chars) → show ~half (5 lines)
  // Multiple steps with a short step 1 → show most of it (7 lines)
  const hasManySteps = instructions.length > 1;
  const step1IsHuge = (step1 ? step1.description || '' : '').length > 180;
  const step1Clamp = (!hasManySteps || step1IsHuge) ? 5 : 7;
  const timerPill = (t) => {
    if (t === undefined || t === null || t === '') return '';
    const label = typeof t === 'number' ? `${t} MIN` : escHtml(String(t));
    return `<span class="timer-pill"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>${label}</span>`;
  };
  const step1Html = step1 ? `
    <div class="step-card step-first">
      <div class="step-head">
        <span class="step-badge">1</span><span class="step-label">Step 1</span>
        ${timerPill(step1.timer)}
      </div>
      <p class="step-text" style="-webkit-line-clamp:${step1Clamp};">${escHtml(step1.description || '')}</p>
      <div class="step-fade"></div>
    </div>` : '';

  // ── Locked steps (2+) — real text, blurred behind glass overlay ────────────
  const lockedStepsHtml = instructions.slice(1).map((step, idx) => {
    const stepNum = idx + 2;
    return `<div class="step-card"${idx > 0 ? ' style="margin-top:16px;"' : ''}>
      <div class="step-head">
        <span class="step-badge">${stepNum}</span><span class="step-label">Step ${stepNum}</span>
        ${timerPill(step.timer)}
      </div>
      <p class="step-text">${escHtml(step.description || '')}</p>
    </div>`;
  }).join('');

  // ── Meta chips ───────────────────────────────────────────────────────────────
  const clockIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
  const barIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
  const userIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`;
  const metaHtml = [
    timeStr ? `<div class="meta-chip">${clockIcon}<span class="meta-val">${timeStr}</span><span class="meta-lab">Total</span></div>` : '',
    hasDifficulty ? `<div class="meta-chip">${barIcon}<span class="meta-val">${difficultyN}/5</span><span class="meta-lab">Difficulty</span></div>` : '',
    servings ? `<div class="meta-chip">${userIcon}<span class="meta-val">${servings}</span><span class="meta-lab">Serves</span></div>` : '',
  ].filter(Boolean).join('');

  // ── Nutrition (blurred by default, click to reveal; nothing stored) ──────────
  const calVal = recipe.calories;
  const proVal = recipe.protein_g;
  const hasCal = calVal !== undefined && calVal !== null && calVal !== '';
  const hasPro = proVal !== undefined && proVal !== null && proVal !== '';
  const nutriTiles = [
    hasCal ? `<div class="nutri-tile nt-cal">
            <span class="nt-chip nt-chip-cal"><svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-1 .5-2 1-3 0 1.5 1 2 1.5 2 .5 0 1-.5 1-1.5 0-2-1-3.5.5-5.5z"/></svg></span>
            <div><div><span class="nt-val">${escHtml(String(calVal))}</span> <span class="nt-unit">kcal</span></div><div class="nt-lab nt-lab-cal">Calories</div></div>
          </div>` : '',
    hasPro ? `<div class="nutri-tile nt-pro">
            <span class="nt-chip nt-chip-pro"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12"/></svg></span>
            <div><div><span class="nt-val">${escHtml(String(proVal))}</span> <span class="nt-unit">g</span></div><div class="nt-lab nt-lab-pro">Protein</div></div>
          </div>` : '',
  ].filter(Boolean).join('');
  const nutritionHtml = (hasCal || hasPro) ? `
      <div class="card card-sage section-gap">
        <div class="sec-head">
          <span class="sec-chip sec-chip-sage"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg></span>
          <span class="sec-title">Nutrition</span><span class="sec-count">&middot; per serving</span>
        </div>
        <div class="accent-rule rule-sage"></div>
        <div class="nutri-panel" id="nutri">
          <div class="nutri-tiles">
            <div class="nutri-values">${nutriTiles}</div>
            <div class="nutri-reveal" id="nutri-reveal">
              <button class="nutri-reveal-btn" type="button">Show nutrition</button>
              <span class="nutri-reveal-cap">Hidden until you tap. Nothing is saved.</span>
            </div>
          </div>
        </div>
      </div>` : '';

  // ── Recipe details (cuisine, diet, allergens, equipment) ──────────────────
  const cuisineDisplay = (Array.isArray(recipe.appliedCuisines) && recipe.appliedCuisines.length)
    ? recipe.appliedCuisines.join(', ') : (recipe.cuisineType || '');
  const dietDisplay = (Array.isArray(recipe.appliedDiets) && recipe.appliedDiets.length)
    ? recipe.appliedDiets.map(d => titleCase(d)).join(', ')
    : (recipe.dietType ? titleCase(recipe.dietType) : '');
  const allergenDisplay = (Array.isArray(recipe.appliedAllergies) && recipe.appliedAllergies.length)
    ? recipe.appliedAllergies.map(a => titleCase(a)).join(', ')
    : (Array.isArray(recipe.allergenInfo) && recipe.allergenInfo.length ? recipe.allergenInfo.join(', ') : '');
  const equipmentDisplay = (Array.isArray(recipe.requiredEquipment) && recipe.requiredEquipment.length)
    ? recipe.requiredEquipment.map(e => titleCase(e)).join(', ') : '';

  const detailRow = (icon, label, value) => `<div class="detail-row"><span class="detail-chip">${icon}</span><div><div class="detail-label">${label}</div><div class="detail-value">${escHtml(value)}</div></div></div>`;
  const globeIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
  const leafIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/></svg>`;
  const shieldIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`;
  const wrenchIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
  const detailRows = [
    cuisineDisplay ? detailRow(globeIcon, 'Cuisine', cuisineDisplay) : '',
    dietDisplay ? detailRow(leafIcon, 'Diet', dietDisplay) : '',
    allergenDisplay ? detailRow(shieldIcon, 'Allergies Avoided', allergenDisplay) : '',
    equipmentDisplay ? detailRow(wrenchIcon, 'Equipment Needed', equipmentDisplay) : '',
  ].filter(Boolean).join('');
  const detailsHtml = detailRows ? `
      <div class="card card-sage section-gap">
        <div class="sec-head">
          <span class="sec-chip sec-chip-sage"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span>
          <span class="sec-title">Recipe Details</span>
        </div>
        <div class="accent-rule rule-sage"></div>
        ${detailRows}
      </div>` : '';

  const methodHtml = step1Html ? `
      <div class="card card-orange section-gap">
        <div class="sec-head">
          <span class="sec-chip sec-chip-orange"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2a2 2 0 0 0 2-2V2M5 2v20M16 2a4 4 0 0 0-4 4v6h4M16 2v20"/></svg></span>
          <span class="sec-title">Method</span><span class="sec-count">&middot; ${instructions.length} step${instructions.length === 1 ? '' : 's'}</span>
        </div>
        <div class="accent-rule rule-orange"></div>
        <div class="steps">
          ${step1Html}
          ${hasManySteps ? `<div class="lock-section">
            <div class="locked-steps">${lockedStepsHtml}</div>
            <div class="lock-panel">
              <span class="lock-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
              <h3>Cook the full recipe in Just&nbsp;Cooked</h3>
              <p>Step-by-step cook mode, timers and a grocery list, all in the app.</p>
              <a href="${storeLink}" class="btn-primary" id="main-dl-btn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12l4 4 4-4M12 8v8"/></svg>
                Get Just Cooked
              </a>
              <a href="${deepLink}" class="btn-secondary" id="main-open-btn">Already have the app? Open it</a>
            </div>
          </div>` : ''}
        </div>
      </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${name} &middot; Just Cooked</title>
  <link rel="icon" href="/assets/Icon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;1,14..32,500&display=swap" rel="stylesheet" />
  <meta property="og:title" content="${name}" />
  <meta property="og:description" content="${desc || 'A recipe shared on Just Cooked.'}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:site_name" content="Just Cooked" />
  ${ogImage}
  <meta name="twitter:title" content="${name}" />
  <meta name="twitter:description" content="${desc || 'Shared on Just Cooked'}" />
  <meta name="apple-itunes-app" content="app-id=6754169071, app-argument=${deepLink}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    img { max-width: 100%; height: auto; }
    :root { color-scheme: light; }
    html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #E7DDCB;
      color: #1A1815;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ── Notebook page (centred, lined) ── */
    .notebook {
      position: relative;
      max-width: 600px;
      margin: 0 auto;
      min-height: 100vh;
      background-color: #FCF8F0;
      background-image:
        repeating-linear-gradient(to bottom, transparent 0 24.9px, rgba(194,164,123,0.26) 24.9px 26px),
        linear-gradient(180deg, #FCF8F0 0%, #F1E7D3 100%);
      box-shadow: 0 0 50px rgba(26,24,21,0.10);
      overflow: hidden;
    }
    .notebook::before {
      content: ""; position: absolute; top: 0; bottom: 0; left: 13%;
      width: 1.3px; background: rgba(215,150,122,0.32); pointer-events: none;
    }
    .nb-inner { position: relative; z-index: 1; padding: 0 16px 130px; }

    /* ── Topbar ── */
    .topbar {
      position: sticky; top: 0; z-index: 100;
      background: rgba(252,248,240,0.82);
      backdrop-filter: blur(18px) saturate(140%);
      -webkit-backdrop-filter: blur(18px) saturate(140%);
      border-bottom: 1px solid rgba(224,213,194,0.7);
    }
    .topbar-inner {
      max-width: 600px; margin: 0 auto; padding: 12px 16px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
    }
    .brand { display: inline-flex; align-items: center; text-decoration: none; flex-shrink: 1; min-width: 0; }
    .brand img { height: 30px; width: auto; display: block; }
    .topbar-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .icon-btn {
      width: 44px; height: 44px; border-radius: 14px;
      background: rgba(255,253,248,0.9); border: 1px solid rgba(224,213,194,0.9);
      color: #7A2410; display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 2px 6px rgba(26,24,21,0.06); position: relative;
    }
    .icon-btn:active { transform: scale(0.95); }
    .copied-tip {
      position: absolute; top: 50px; right: 0; white-space: nowrap;
      background: #1A1815; color: #FBF6EC; font-size: 12px; font-weight: 600;
      padding: 5px 10px; border-radius: 8px; opacity: 0; transition: opacity .2s; pointer-events: none;
    }
    .copied-tip.show { opacity: 1; }
    .topbar-cta {
      height: 44px; padding: 0 18px; border-radius: 999px;
      background: #E94B1F; color: #FBF6EC; font-size: 14px; font-weight: 600;
      text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
      box-shadow: 0 6px 14px rgba(233,75,31,0.32); white-space: nowrap;
    }
    .topbar-cta:active { transform: scale(0.97); }

    .stack { padding-top: 16px; }
    .stack > * + * { margin-top: 14px; }

    /* ── Hero ── */
    .hero {
      width: 100%; aspect-ratio: 1 / 0.82; border-radius: 22px; overflow: hidden;
      box-shadow: 0 14px 28px rgba(26,24,21,0.14);
      background-size: cover; background-position: center 30%; background-repeat: no-repeat;
      background-color: #E4D8C0;
    }
    .hero-placeholder {
      width: 100%; height: 100%;
      background: linear-gradient(135deg,#E4D8C0 0%,#D8CAAC 50%,#CBBB98 100%);
      border: 1px solid rgba(120,95,60,0.18);
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
      text-align: center; padding: 24px;
    }
    .hero-ph-chip {
      width: 60px; height: 60px; border-radius: 19px;
      background: rgba(255,252,245,0.6); border: 1.5px solid rgba(120,95,60,0.28);
      color: rgba(86,66,42,0.62); display: inline-flex; align-items: center; justify-content: center;
    }
    .hero-ph-cap { font-size: 11px; font-weight: 600; line-height: 16px; color: rgba(86,66,42,0.62); max-width: 230px; }

    /* ── Title card (overlaps hero) ── */
    .title-card {
      position: relative; z-index: 2; margin: -24px 12px 0;
      background: #FCFAF3; border: 1px solid rgba(233,75,31,0.18);
      border-radius: 20px; padding: 24px; box-shadow: 0 14px 30px rgba(26,24,21,0.08);
    }
    .dish-title { color: #1A1815; font-size: 29px; font-weight: 800; letter-spacing: -0.8px; line-height: 34px; }
    .byline { margin-top: 10px; color: #E94B1F; font-size: 14px; font-weight: 600; letter-spacing: 0.2px; }
    .byline strong { font-weight: 700; }
    .dish-desc { margin-top: 12px; color: #3A342E; font-size: 15px; line-height: 23px; }

    .meta-row { display: flex; gap: 8px; margin-top: 16px; }
    .meta-chip { flex: 1; background: rgba(255,253,248,0.85); border: 1px solid rgba(224,213,194,0.85); border-radius: 14px; padding: 11px 6px; display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .meta-chip svg { color: #E94B1F; }
    .meta-val { color: #1A1815; font-size: 14px; font-weight: 800; }
    .meta-lab { color: #8B847C; font-size: 8.5px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; }

    /* ── Section cards ── */
    .card { border-radius: 20px; border: 1px solid; padding: 18px; box-shadow: 0 14px 30px rgba(26,24,21,0.08); }
    .card-amber { background: #FBF1D8; border-color: rgba(176,133,31,0.22); }
    .card-orange { background: #FCFAF3; border-color: rgba(233,75,31,0.18); }
    .card-sage { background: #EEF4E5; border-color: rgba(94,122,71,0.22); }
    .sec-head { display: flex; align-items: center; gap: 10px; }
    .sec-chip { width: 32px; height: 32px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
    .sec-chip-amber { background: #B0851F; } .sec-chip-orange { background: #E94B1F; } .sec-chip-sage { background: #5E7A47; }
    .sec-title { color: #1A1815; font-size: 18px; font-weight: 800; letter-spacing: -0.4px; }
    .sec-count { color: #8B847C; font-size: 12px; font-weight: 600; }
    .accent-rule { height: 2.5px; width: 42px; border-radius: 2px; margin: 8px 0 14px; }
    .rule-amber { background: #B0851F; } .rule-orange { background: #E94B1F; } .rule-sage { background: #5E7A47; }
    .section-gap { margin-top: 16px; }

    /* ── Ingredients ── */
    .ing-box { background: #FFFDF8; border: 1px solid rgba(176,133,31,0.3); border-radius: 14px; padding: 4px 14px; }
    .ing-row { display: flex; align-items: flex-start; gap: 12px; padding: 9px 0; cursor: pointer; min-height: 44px; }
    .ing-row + .ing-row { border-top: 1px solid rgba(176,133,31,0.12); }
    .ing-row input { position: absolute; opacity: 0; width: 0; height: 0; }
    .ing-check { width: 24px; height: 24px; border-radius: 8px; border: 2px solid rgba(176,133,31,0.5); flex-shrink: 0; margin-top: 1px; display: inline-flex; align-items: center; justify-content: center; transition: background .12s, border-color .12s; }
    .ing-check svg { opacity: 0; }
    .ing-row input:checked + .ing-check { background: #E94B1F; border-color: #E94B1F; }
    .ing-row input:checked + .ing-check svg { opacity: 1; }
    .ing-text { font-size: 16px; line-height: 24px; padding-top: 1px; }
    .ing-name { color: #1A1815; font-size: 15px; font-weight: 700; }
    .ing-amt { color: #8B847C; font-size: 14px; font-weight: 500; }
    .ing-row input:checked ~ .ing-text .ing-name,
    .ing-row input:checked ~ .ing-text .ing-amt { color: #8B847C; text-decoration: line-through; }

    /* ── Nutrition ── */
    .nutri-panel { background: #FFFDF8; border: 1px solid rgba(94,122,71,0.28); border-radius: 16px; padding: 13px; }
    .nutri-tiles { display: flex; gap: 10px; position: relative; }
    .nutri-values { display: flex; gap: 10px; flex: 1; }
    .nutri-tile { flex: 1; border-radius: 14px; padding: 14px 13px; display: flex; align-items: center; gap: 12px; }
    .nt-cal { background: #FCFAF3; border: 1px solid rgba(233,75,31,0.25); }
    .nt-pro { background: #EEF4E5; border: 1px solid rgba(94,122,71,0.25); }
    .nt-chip { width: 40px; height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
    .nt-chip-cal { background: #E94B1F; } .nt-chip-pro { background: #5E7A47; }
    .nt-val { color: #1A1815; font-size: 22px; font-weight: 800; letter-spacing: -0.6px; line-height: 1; }
    .nt-unit { color: #8B847C; font-size: 12px; font-weight: 700; }
    .nt-lab { font-size: 9.5px; font-weight: 700; letter-spacing: 0.7px; text-transform: uppercase; margin-top: 3px; }
    .nt-lab-cal { color: #E94B1F; } .nt-lab-pro { color: #5E7A47; }
    .nutri-values { transition: filter .25s; }
    .nutri-panel:not(.revealed) .nutri-values { filter: blur(8px); -webkit-filter: blur(8px); user-select: none; pointer-events: none; }
    .nutri-reveal { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: rgba(255,253,248,0.55); border-radius: 14px; cursor: pointer; text-align: center; padding: 8px; }
    .nutri-panel.revealed .nutri-reveal { display: none; }
    .nutri-reveal-btn { background: #FBE3D2; color: #7A2410; font-size: 12.5px; font-weight: 700; border: none; border-radius: 11px; height: 40px; padding: 0 18px; cursor: pointer; }
    .nutri-reveal-cap { color: #8B847C; font-size: 11px; font-weight: 500; }

    /* ── Method ── */
    .steps { display: flex; flex-direction: column; gap: 16px; }
    .step-card { background: #FFFDF8; border: 1px solid rgba(224,213,194,0.95); border-radius: 14px; padding: 13px; box-shadow: 0 3px 10px rgba(26,24,21,0.05); }
    .step-head { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
    .step-badge { width: 30px; height: 30px; border-radius: 10px; background: #E94B1F; color: #fff; font-size: 14px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .step-label { color: #8B847C; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; }
    .timer-pill { margin-left: auto; background: #FBE3D2; color: #7A2410; border-radius: 999px; height: 24px; padding: 0 10px; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
    .step-text { color: #1A1815; font-size: 16px; line-height: 26px; letter-spacing: 0.1px; }
    .step-first .step-text { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
    .step-fade { height: 48px; margin-top: -48px; position: relative; z-index: 2; pointer-events: none; background: linear-gradient(to bottom, rgba(255,253,248,0) 0%, rgba(252,250,243,0.96) 100%); }

    /* ── Install gate (KEEP blur/lock; restyled) ── */
    .lock-section { position: relative; overflow: hidden; min-height: 260px; max-height: 430px; }
    .locked-steps { filter: blur(9px); -webkit-filter: blur(9px); pointer-events: none; user-select: none; transform: scale(1.02); transform-origin: top center; }
    .lock-panel {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(252,250,243,0) 0%, rgba(252,250,243,0) 6%, rgba(252,250,243,0.45) 26%, rgba(252,250,243,0.85) 50%, rgba(252,250,243,0.98) 66%, #FCFAF3 100%);
      backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
      display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px 22px;
    }
    .lock-icon { width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(135deg,#FF6B35,#E94B1F); color: #fff; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 8px 20px rgba(233,75,31,0.4); }
    .lock-panel h3 { color: #1A1815; font-size: 20px; font-weight: 800; letter-spacing: -0.4px; line-height: 1.2; margin-bottom: 8px; }
    .lock-panel p { color: #6b6258; font-size: 14px; line-height: 1.6; margin-bottom: 22px; max-width: 300px; }
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; height: 52px; padding: 0 30px; border-radius: 999px; background: #E94B1F; color: #FBF6EC; font-size: 15px; font-weight: 700; text-decoration: none; box-shadow: 0 8px 20px rgba(233,75,31,0.36); }
    .btn-primary:active { transform: scale(0.97); }
    .btn-secondary { margin-top: 12px; color: #7A2410; font-size: 14px; font-weight: 600; text-decoration: none; padding: 10px 18px; border-radius: 999px; border: 1.5px solid rgba(233,75,31,0.4); display: inline-flex; align-items: center; }

    /* ── Recipe details ── */
    .detail-row { background: #FFFDF8; border: 1px solid rgba(94,122,71,0.28); border-radius: 13px; padding: 12px 13px; display: flex; align-items: center; gap: 14px; }
    .detail-row + .detail-row { margin-top: 8px; }
    .detail-chip { width: 36px; height: 36px; border-radius: 11px; background: #5E7A47; color: #fff; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .detail-label { color: #5E7A47; font-size: 9.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .detail-value { color: #1A1815; font-size: 15px; font-weight: 700; }

    footer { text-align: center; padding: 28px 24px; font-size: 13px; color: #8B847C; }
    footer a { color: #E94B1F; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="notebook">

    <header class="topbar">
      <div class="topbar-inner">
        <a href="https://www.justcooked.app" class="brand"><img src="/assets/JustCookIcon.svg" alt="Just Cooked" /></a>
        <div class="topbar-actions">
          <button class="icon-btn" id="share-btn" aria-label="Share recipe" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <span class="copied-tip" id="copied-tip">Link copied</span>
          </button>
          <a href="${deepLink}" class="topbar-cta" id="top-open-btn">Open in App
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </div>
    </header>

    <div class="nb-inner">
      <div class="stack">

        <div class="hero"${heroStyle}>${heroInner}</div>

        <div class="title-card">
          <h1 class="dish-title">${name}</h1>
          <div class="byline">${attribution}</div>
          ${desc ? `<p class="dish-desc">${desc}</p>` : ''}
          ${metaHtml ? `<div class="meta-row">${metaHtml}</div>` : ''}
        </div>

        ${ingredientsHtml}
        ${nutritionHtml}
        ${methodHtml}
        ${detailsHtml}

      </div>
    </div>

    <footer>Made with <a href="https://www.justcooked.app">Just Cooked</a>, your kitchen companion</footer>
  </div>

  <script>
    (function () {
      var ua = navigator.userAgent;
      var isIos = /iPhone|iPad|iPod/i.test(ua);
      var isAndroid = /Android/i.test(ua);
      var STORE = isIos
        ? 'https://apps.apple.com/app/just-cooked/id6754169071'
        : isAndroid
        ? 'https://play.google.com/store/apps/details?id=com.justcooked.app'
        : 'https://www.justcooked.app/download';

      ['main-dl-btn', 'mob-dl-btn', 'side-dl-btn'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.href = STORE;
      });

      function tryOpenApp(e) {
        e.preventDefault();
        var gone = false;
        var timer = setTimeout(function () {
          if (!gone) window.location.href = STORE;
        }, 1600);
        function cancel() { gone = true; clearTimeout(timer); }
        window.addEventListener('blur', cancel, { once: true });
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) cancel();
        }, { once: true });
        window.location.href = '${deepLink}';
      }

      ['top-open-btn', 'main-open-btn', 'mob-open-btn', 'side-open-btn'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', tryOpenApp);
      });
    })();

    // Nutrition reveal (client-side only; nothing is stored)
    (function () {
      var n = document.getElementById('nutri');
      var r = document.getElementById('nutri-reveal');
      if (n && r) r.addEventListener('click', function () { n.classList.add('revealed'); });
    })();

    // Share / copy link (client-side only)
    (function () {
      var b = document.getElementById('share-btn');
      var tip = document.getElementById('copied-tip');
      if (!b) return;
      var url = '${canonicalUrl}';
      b.addEventListener('click', function () {
        if (navigator.share) { navigator.share({ title: document.title, url: url }).catch(function () {}); return; }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            if (!tip) return;
            tip.classList.add('show');
            setTimeout(function () { tip.classList.remove('show'); }, 1600);
          });
        }
      });
    })();
  </script>

</body>
</html>`;
}

// ─── Error pages ──────────────────────────────────────────────────────────────

function renderNotFound() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recipe Not Found &middot; Just Cooked</title>
  <style>
    body{font-family:'Inter',-apple-system,'Segoe UI',sans-serif;background:#F5EFE6;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px;color:#1A1815;}
    h1{font-size:22px;font-weight:800;margin-bottom:8px;letter-spacing:-0.4px;}
    p{color:#8B847C;margin-bottom:24px;font-size:15px;}
    a{background:#E94B1F;color:#FBF6EC;border-radius:999px;padding:14px 28px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 8px 16px rgba(233,75,31,0.32);}
  </style>
</head>
<body>
  <div>
    <h1>Recipe not found</h1>
    <p>This link may have expired or been removed.</p>
    <a href="https://www.justcooked.app">Visit Just Cooked</a>
  </div>
</body>
</html>`;
}

function renderError(msg) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Error &middot; Just Cooked</title>
  <style>
    body{font-family:'Inter',-apple-system,'Segoe UI',sans-serif;background:#F5EFE6;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px;color:#3A342E;}
    p{color:#8B847C;font-size:15px;}
  </style>
</head>
<body><p>${msg}</p></body>
</html>`;
}
