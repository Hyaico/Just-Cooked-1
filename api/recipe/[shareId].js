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
    const isIos = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const storeLink = isIos
      ? 'https://apps.apple.com/app/just-cooked/id6741609869'
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

function fmtTime(mins) {
  if (!mins) return '';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
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
  const difficulty = recipe.difficultyLevel ? escHtml(String(recipe.difficultyLevel)) : '';
  const servings = recipe.servings ? escHtml(String(recipe.servings)) : '';
  const attribution = authorLabel(recipe, ownerUsername);
  const ingredients = recipe.ingredients || [];
  const instructions = recipe.instructions || [];
  const totalSteps = instructions.length;

  const heroStyle = thumbnailUrl
    ? `background:url('${thumbnailUrl}') center/cover no-repeat;`
    : 'background:linear-gradient(135deg,#FF6B00 0%,#FF8C00 100%);';

  const ogImage = thumbnailUrl
    ? `<meta property="og:image" content="${thumbnailUrl}" />
  <meta name="twitter:image" content="${thumbnailUrl}" />
  <meta name="twitter:card" content="summary_large_image" />`
    : '<meta name="twitter:card" content="summary" />';

  // ── Ingredients HTML ────────────────────────────────────────────────────────
  const ingHtml = ingredients.map((ing, i) => {
    const border = i < ingredients.length - 1
      ? 'border-bottom:1px solid #F0EDE9;'
      : '';
    return `<div class="ing-row" style="${border}">
      <span class="ing-name">${escHtml(ing.name)}</span>
      <span class="ing-qty">${escHtml(ing.quantity || '')} ${escHtml(ing.unit || '')}</span>
    </div>`;
  }).join('');

  // ── Instructions HTML ───────────────────────────────────────────────────────
  // Step 1: show text but fade bottom half out (mask + blur overlay)
  // Steps 2+: fully blurred
  const stepsHtml = instructions.map((step, idx) => {
    const text = escHtml(step.description || '');
    if (idx === 0) {
      // First step: visible content with gradient fade on bottom half
      return `<div class="step-item step-first">
        <div class="step-row">
          <div class="step-badge">1</div>
          <p class="step-text step-text-fade">${text}</p>
        </div>
      </div>`;
    }
    // Blurred steps: opacity increases per step
    const blurPx = Math.min(6 + (idx - 1) * 3, 18);
    const ovAlpha = Math.min(0.55 + (idx - 1) * 0.1, 0.92);
    return `<div class="step-item step-blurred" style="position:relative;overflow:hidden;">
      <div class="step-row" style="filter:blur(${blurPx}px);user-select:none;pointer-events:none;">
        <div class="step-badge">${idx + 1}</div>
        <p class="step-text">${text}</p>
      </div>
      <div style="position:absolute;inset:0;background:rgba(250,250,249,${ovAlpha});"></div>
    </div>`;
  }).join('');

  // ── Meta pills ─────────────────────────────────────────────────────────────
  const metaHtml = [
    timeStr ? `<span class="pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>${timeStr}</span>` : '',
    difficulty ? `<span class="pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Difficulty ${difficulty}/5</span>` : '',
    servings ? `<span class="pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Serves ${servings}</span>` : '',
  ].filter(Boolean).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} &mdash; Just Cooked</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <meta property="og:title" content="${name}" />
  <meta property="og:description" content="${desc || 'A recipe shared on Just Cooked.'}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:site_name" content="Just Cooked" />
  ${ogImage}
  <meta name="twitter:title" content="${name}" />
  <meta name="twitter:description" content="${desc || 'Shared on Just Cooked'}" />
  <meta name="apple-itunes-app" content="app-id=6741609869, app-argument=${deepLink}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #FAFAF9;
      color: #1A1A1A;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Topbar ── */
    .topbar {
      position: sticky; top: 0; z-index: 50;
      background: #fff;
      border-bottom: 1px solid #EDEBE8;
      padding: 0 20px;
      height: 56px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .brand {
      display: flex; align-items: center; gap: 8px;
      font-size: 17px; font-weight: 800; color: #FF6B00; letter-spacing: -0.4px;
      text-decoration: none;
    }
    .brand-dot {
      width: 8px; height: 8px; background: #FF6B00; border-radius: 50%;
    }
    .open-btn {
      background: #FF6B00; color: #fff; border: none; border-radius: 22px;
      padding: 9px 20px; font-size: 13px; font-weight: 700; font-family: inherit;
      cursor: pointer; text-decoration: none; display: inline-block;
      white-space: nowrap;
    }
    .open-btn:hover { background: #E65D00; }

    /* ── Hero ── */
    .hero {
      width: 100%; height: 300px;
      position: relative; overflow: hidden;
      ${heroStyle}
    }
    @media (min-width: 768px) { .hero { height: 420px; } }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 40%, rgba(0,0,0,0.6) 100%);
    }
    .hero-content {
      position: absolute; bottom: 0; left: 0; right: 0; padding: 24px 20px;
      color: #fff;
    }
    .attr-pill {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.25);
      padding: 5px 12px; border-radius: 20px;
      font-size: 12px; color: rgba(255,255,255,0.95); font-weight: 500;
      margin-bottom: 10px;
    }
    .hero-title {
      font-size: 26px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.15;
      text-shadow: 0 1px 8px rgba(0,0,0,0.4);
    }
    @media (min-width: 768px) { .hero-title { font-size: 36px; } }

    /* ── Layout ── */
    .page-wrap {
      max-width: 1080px; margin: 0 auto; padding: 24px 16px 100px;
    }
    @media (min-width: 900px) {
      .page-wrap { display: grid; grid-template-columns: 1fr 360px; gap: 40px; padding: 36px 24px 100px; }
      .sidebar { position: sticky; top: 72px; align-self: start; }
      .sidebar-mobile { display: none !important; }
    }
    @media (max-width: 899px) {
      .sidebar { display: none !important; }
    }

    /* ── Section ── */
    .section-label {
      font-size: 11px; font-weight: 700; letter-spacing: 1.2px;
      text-transform: uppercase; color: #AAA; margin-bottom: 10px; margin-top: 28px;
    }
    .section-label:first-child { margin-top: 20px; }

    /* ── Description ── */
    .desc {
      font-size: 15px; color: #5A5A5A; line-height: 1.65; margin: 20px 0 4px;
    }

    /* ── Meta pills ── */
    .meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 4px; }
    .pill {
      background: #fff; border: 1px solid #EDEBE8; border-radius: 20px;
      padding: 6px 14px; font-size: 13px; color: #5A5A5A; font-weight: 500;
      display: inline-flex; align-items: center; gap: 6px;
    }

    /* ── Card ── */
    .card {
      background: #fff; border-radius: 18px; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 2px 12px rgba(0,0,0,0.04);
      margin-bottom: 4px;
    }

    /* ── Ingredients ── */
    .ing-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 13px 18px; gap: 12px;
    }
    .ing-name { font-size: 15px; font-weight: 500; color: #1A1A1A; }
    .ing-qty { font-size: 14px; color: #888; flex-shrink: 0; }

    /* ── Steps ── */
    .step-item { background: #fff; }
    .step-item + .step-item { border-top: 1px solid #F0EDE9; }
    .step-row {
      display: flex; gap: 14px; align-items: flex-start; padding: 16px 18px;
    }
    .step-badge {
      min-width: 30px; height: 30px; background: #FF6B00; color: #fff;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; flex-shrink: 0; margin-top: 1px;
    }
    .step-text { font-size: 15px; color: #1A1A1A; line-height: 1.65; flex: 1; }

    /* ── Step 1 fade ── */
    .step-first { position: relative; }
    .step-text-fade {
      -webkit-mask-image: linear-gradient(to bottom, black 45%, transparent 90%);
      mask-image: linear-gradient(to bottom, black 45%, transparent 90%);
      max-height: 140px; overflow: hidden;
    }

    /* ── Blur CTA gate ── */
    .blur-gate {
      background: #fff;
      border-top: 1px solid #F0EDE9;
      padding: 28px 20px 32px;
      text-align: center;
      border-radius: 0 0 18px 18px;
    }
    .blur-gate-label {
      font-size: 13px; font-weight: 600; color: #C54800;
      background: #FFF3EC; border-radius: 20px; padding: 6px 14px;
      display: inline-block; margin-bottom: 16px;
    }
    .blur-gate h3 { font-size: 17px; font-weight: 800; color: #1A1A1A; margin-bottom: 8px; }
    .blur-gate p { font-size: 14px; color: #666; line-height: 1.55; margin-bottom: 20px; }
    .dl-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: #FF6B00; color: #fff; border-radius: 28px;
      padding: 14px 32px; font-size: 15px; font-weight: 700; font-family: inherit;
      text-decoration: none; margin-bottom: 12px;
      box-shadow: 0 4px 16px rgba(255,107,0,0.35);
    }
    .dl-btn:hover { background: #E65D00; }
    .open-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: #FF6B00; font-size: 14px; font-weight: 600; text-decoration: none;
      padding: 9px 18px; border-radius: 22px; border: 1.5px solid #FF6B00;
    }
    .open-link:hover { background: rgba(255,107,0,0.06); }

    /* ── Sidebar ── */
    .sidebar-card {
      background: #fff; border: 1px solid #EDEBE8; border-radius: 22px;
      padding: 28px 24px; text-align: center;
      box-shadow: 0 2px 16px rgba(0,0,0,0.06);
    }
    .app-icon {
      width: 72px; height: 72px; border-radius: 20px;
      background: linear-gradient(135deg, #FF6B00, #FF8C00);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 18px;
      box-shadow: 0 4px 14px rgba(255,107,0,0.3);
    }
    .sidebar-card h3 { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
    .sidebar-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: #FFF3EC; color: #C54800; border-radius: 20px;
      padding: 5px 12px; font-size: 13px; font-weight: 600;
      margin-bottom: 14px;
    }
    .sidebar-card p { font-size: 14px; color: #666; line-height: 1.55; margin-bottom: 22px; }
    .sidebar-dl-btn {
      display: block; background: #FF6B00; color: #fff; border-radius: 28px;
      padding: 14px 24px; font-size: 15px; font-weight: 700; font-family: inherit;
      text-decoration: none; margin-bottom: 10px;
      box-shadow: 0 4px 14px rgba(255,107,0,0.3);
    }
    .sidebar-open-btn {
      display: block; background: #F5F3F0; color: #444; border-radius: 28px;
      padding: 12px 24px; font-size: 14px; font-weight: 600; font-family: inherit;
      text-decoration: none;
    }

    /* ── Mobile bottom CTA ── */
    .sidebar-mobile {
      background: #fff; border: 1px solid #EDEBE8; border-radius: 20px;
      padding: 22px 20px; text-align: center; margin-top: 28px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    }
    .sidebar-mobile .dl-btn { width: 100%; justify-content: center; margin-bottom: 10px; }
    .sidebar-mobile .open-link { display: inline-flex; }

    /* ── Footer ── */
    footer {
      text-align: center; padding: 28px 20px;
      font-size: 13px; color: #999;
      border-top: 1px solid #EDEBE8; background: #fff; margin-top: 48px;
    }
    footer a { color: #FF6B00; text-decoration: none; font-weight: 600; }

    /* ── Dark mode ── */
    @media (prefers-color-scheme: dark) {
      body { background: #141414; color: #F0EDE9; }
      .topbar { background: #1C1C1C; border-color: #2C2C2C; }
      .card { background: #1C1C1C; box-shadow: none; }
      .step-item { background: #1C1C1C; }
      .step-item + .step-item { border-color: #2C2C2C; }
      .blur-gate { background: #1C1C1C; border-color: #2C2C2C; }
      .blur-gate h3 { color: #F0EDE9; }
      .blur-gate p { color: #888; }
      .ing-name { color: #F0EDE9; }
      .ing-row { border-color: #2C2C2C !important; }
      .ing-qty { color: #666; }
      .step-text { color: #F0EDE9; }
      .desc { color: #999; }
      .pill { background: #242424; border-color: #333; color: #CCC; }
      .sidebar-card { background: #1C1C1C; border-color: #2C2C2C; }
      .sidebar-card h3 { color: #F0EDE9; }
      .sidebar-card p { color: #888; }
      .sidebar-open-btn { background: #272727; color: #CCC; }
      .sidebar-mobile { background: #1C1C1C; border-color: #2C2C2C; }
      footer { background: #1C1C1C; border-color: #2C2C2C; color: #555; }
      .section-label { color: #555; }
    }
  </style>
</head>
<body>

  <!-- Sticky topbar -->
  <header class="topbar">
    <a href="https://www.justcooked.app" class="brand">
      <span class="brand-dot"></span>
      Just Cooked
    </a>
    <a href="${deepLink}" class="open-btn" id="top-open-btn">Open in App</a>
  </header>

  <!-- Hero -->
  <div class="hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="attr-pill">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        ${attribution}
      </div>
      <div class="hero-title">${name}</div>
    </div>
  </div>

  <!-- Body -->
  <div class="page-wrap">
    <main>
      ${desc ? `<p class="desc">${desc}</p>` : ''}
      ${metaHtml ? `<div class="meta-row">${metaHtml}</div>` : ''}

      ${ingHtml ? `
      <p class="section-label">Ingredients</p>
      <div class="card">${ingHtml}</div>` : ''}

      ${stepsHtml ? `
      <p class="section-label">Instructions</p>
      <div class="card" style="padding:0;overflow:hidden;">
        ${stepsHtml}
        <div class="blur-gate">
          <div class="blur-gate-label">&#128274; ${totalSteps} steps total</div>
          <h3>Cook the full recipe in Just Cooked</h3>
          <p>Step-by-step cook mode, timers, and more &mdash; all in the app.</p>
          <div>
            <a href="${storeLink}" class="dl-btn" id="main-dl-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Just Cooked
            </a>
          </div>
          <a href="${deepLink}" class="open-link" id="main-open-btn">Open in App &rarr;</a>
        </div>
      </div>` : ''}

      <!-- Mobile CTA -->
      <div class="sidebar-mobile">
        <div class="sidebar-badge">${totalSteps} steps &middot; Full recipe in app</div>
        <a href="${storeLink}" class="dl-btn" id="mob-dl-btn">Download Just Cooked</a>
        <a href="${deepLink}" class="open-link" id="mob-open-btn">Open in App &rarr;</a>
      </div>
    </main>

    <!-- Desktop sidebar -->
    <aside class="sidebar">
      <div class="sidebar-card">
        <div class="app-icon">
          <svg width="38" height="38" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="20" stroke="white" stroke-width="3" opacity="0.9"/>
            <path d="M30 20v10l6 6" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>Cook this recipe</h3>
        <div class="sidebar-badge">${totalSteps} steps inside the app</div>
        <p>Get the full recipe, step-by-step cook mode, and discover more with <strong>Just Cooked</strong>.</p>
        <a href="${storeLink}" class="sidebar-dl-btn" id="side-dl-btn">Download Just Cooked</a>
        <a href="${deepLink}" class="sidebar-open-btn" id="side-open-btn">Open in App</a>
      </div>
    </aside>
  </div>

  <footer>Made with <a href="https://www.justcooked.app">Just Cooked</a> &mdash; Your AI-powered cooking companion</footer>

  <script>
    (function () {
      var ua = navigator.userAgent;
      var isIos = /iPhone|iPad|iPod/i.test(ua);
      var isAndroid = /Android/i.test(ua);
      var STORE = isIos
        ? 'https://apps.apple.com/app/just-cooked/id6741609869'
        : isAndroid
        ? 'https://play.google.com/store/apps/details?id=com.justcooked.app'
        : 'https://www.justcooked.app/download';

      ['main-dl-btn', 'mob-dl-btn', 'side-dl-btn'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.href = STORE;
      });

      function tryOpenApp(e) {
        e.preventDefault();
        var timer = setTimeout(function () { window.location.href = STORE; }, 1500);
        window.addEventListener('blur', function () { clearTimeout(timer); }, { once: true });
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) clearTimeout(timer);
        }, { once: true });
        window.location.href = '${deepLink}';
      }

      ['top-open-btn', 'main-open-btn', 'mob-open-btn', 'side-open-btn'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', tryOpenApp);
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
  <title>Recipe Not Found &mdash; Just Cooked</title>
  <style>
    body{font-family:-apple-system,sans-serif;background:#FAFAF9;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px;}
    h1{font-size:22px;font-weight:800;margin-bottom:8px;color:#1A1A1A;}
    p{color:#666;margin-bottom:24px;font-size:15px;}
    a{background:#FF6B00;color:#fff;border-radius:28px;padding:12px 28px;text-decoration:none;font-weight:700;font-size:15px;}
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
  <title>Error &mdash; Just Cooked</title>
  <style>
    body{font-family:-apple-system,sans-serif;background:#FAFAF9;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px;}
    p{color:#666;font-size:15px;}
  </style>
</head>
<body><p>${msg}</p></body>
</html>`;
}
