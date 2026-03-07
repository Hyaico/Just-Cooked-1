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

  const heroStyleBg = thumbnailUrl
    ? `url('${thumbnailUrl}') center 30% / cover no-repeat`
    : 'linear-gradient(145deg,#FF6B00 0%,#FF4500 60%,#CC2200 100%)';

  const ogImage = thumbnailUrl
    ? `<meta property="og:image" content="${thumbnailUrl}" />
  <meta name="twitter:image" content="${thumbnailUrl}" />
  <meta name="twitter:card" content="summary_large_image" />`
    : '<meta name="twitter:card" content="summary" />';

  // ── Ingredients ─────────────────────────────────────────────────────────────
  const ingHtml = ingredients.map((ing, i) => {
    const divider = i < ingredients.length - 1 ? 'border-bottom:1px solid #F3F1EE;' : '';
    const qty = [ing.quantity, ing.unit].filter(Boolean).join(' ');
    return `<div class="ing-row" style="${divider}">
      <span class="ing-name">${escHtml(ing.name || '')}</span>
      ${qty ? `<span class="ing-qty">${escHtml(qty)}</span>` : ''}
    </div>`;
  }).join('');

  // ── Step 1 (partial) ─────────────────────────────────────────────────────────
  const step1 = instructions[0];
  const step1Html = step1 ? `
    <div class="step-item step-first">
      <div class="step-row">
        <div class="step-num">1</div>
        <p class="step-text">${escHtml(step1.description || '')}</p>
      </div>
      <div class="step-fade-cover"></div>
    </div>` : '';

  // ── Locked steps (2+) — real text, blurred behind glass overlay ────────────
  const lockedStepsHtml = instructions.slice(1).map((step, idx) => {
    const stepNum = idx + 2;
    return `<div class="step-item">
      <div class="step-row">
        <div class="step-num">${stepNum}</div>
        <p class="step-text">${escHtml(step.description || '')}</p>
      </div>
    </div>`;
  }).join('');

  // ── Meta pills ───────────────────────────────────────────────────────────────
  const clockIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
  const barIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
  const userIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`;
  const metaHtml = [
    timeStr ? `<span class="pill">${clockIcon}${timeStr}</span>` : '',
    difficulty ? `<span class="pill">${barIcon}Level ${difficulty}/5</span>` : '',
    servings ? `<span class="pill">${userIcon}Serves ${servings}</span>` : '',
  ].filter(Boolean).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${name} &mdash; Just Cooked</title>
  <link rel="icon" href="/assets/Icon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900&display=swap" rel="stylesheet" />
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
    :root { color-scheme: light; }
    html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #F7F5F2;
      color: #111827;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ─── Topbar ─────────────────────────────────────────────── */
    .topbar {
      position: sticky; top: 0; z-index: 100;
      height: 60px;
      background: rgba(255,255,255,0.92);
      backdrop-filter: saturate(180%) blur(20px);
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      border-bottom: 1px solid rgba(0,0,0,0.07);
      padding: 0 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .brand {
      display: flex; align-items: center; gap: 10px;
      font-size: 17px; font-weight: 800; color: #111827; letter-spacing: -0.5px;
      text-decoration: none;
    }
    .brand-icon {
      width: 32px; height: 32px; border-radius: 8px;
      object-fit: cover; flex-shrink: 0;
    }
    .brand-name { color: #111827; }
    .topbar-cta {
      background: #FF6B00; color: #fff !important;
      border-radius: 100px; padding: 9px 22px;
      font-size: 13px; font-weight: 700; font-family: inherit;
      text-decoration: none; white-space: nowrap;
      transition: background 0.15s, transform 0.1s;
    }
    .topbar-cta:hover { background: #E55D00; transform: translateY(-1px); }
    .topbar-cta:active { transform: scale(0.97); }

    /* ─── Hero ───────────────────────────────────────────────── */
    .hero {
      width: 100%; height: 380px;
      background: ${heroStyleBg};
      position: relative; overflow: hidden;
    }
    @media (min-width: 900px) { .hero { height: 560px; } }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.12) 0%,
        rgba(0,0,0,0.05) 35%,
        rgba(0,0,0,0.55) 75%,
        rgba(0,0,0,0.82) 100%
      );
    }
    .hero-content {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 32px 28px;
      max-width: 780px;
    }
    @media (min-width: 900px) {
      .hero-content { padding: 48px 64px; max-width: 900px; }
    }
    .attr-pill {
      display: inline-flex; align-items: center; gap: 7px;
      background: rgba(255,255,255,0.14);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.22);
      padding: 6px 14px; border-radius: 100px;
      font-size: 12px; color: rgba(255,255,255,0.9); font-weight: 500;
      margin-bottom: 12px; letter-spacing: 0.1px;
    }
    .hero-title {
      font-size: 30px; font-weight: 900; letter-spacing: -0.8px; line-height: 1.1;
      color: #fff;
      text-shadow: 0 2px 20px rgba(0,0,0,0.5);
    }
    @media (min-width: 900px) {
      .hero-title { font-size: 52px; letter-spacing: -1.5px; }
    }

    /* ─── Page body ──────────────────────────────────────────── */
    .page-outer {
      max-width: 1280px; margin: 0 auto;
      padding: 0 20px 80px;
    }
    @media (min-width: 900px) {
      .page-outer { padding: 0 48px 80px; }
    }
    .page-grid {
      display: flex; flex-direction: column; gap: 0;
      padding-top: 32px;
    }
    @media (min-width: 900px) {
      .page-grid {
        flex-direction: row; align-items: flex-start;
        gap: 40px; padding-top: 48px;
      }
      .page-main { flex: 1; min-width: 0; }
      .page-sidebar {
        width: 360px; flex-shrink: 0;
        position: sticky; top: 76px;
      }
      .sidebar-mobile-only { display: none !important; }
    }
    @media (max-width: 899px) {
      .sidebar-desktop-only { display: none !important; }
    }

    /* ─── Section headers ────────────────────────────────────── */
    .section-hd {
      font-size: 11px; font-weight: 700; letter-spacing: 1.4px;
      text-transform: uppercase; color: #9CA3AF;
      margin: 0 0 12px;
    }
    .section-gap { margin-top: 36px; }

    /* ─── Description ────────────────────────────────────────── */
    .desc {
      font-size: 16px; line-height: 1.75; color: #4B5563;
      margin-bottom: 20px;
    }

    /* ─── Meta pills ─────────────────────────────────────────── */
    .meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
    .pill {
      background: #fff; border: 1px solid #E5E7EB;
      border-radius: 100px; padding: 7px 16px;
      font-size: 13px; font-weight: 500; color: #374151;
      display: inline-flex; align-items: center; gap: 7px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }

    /* ─── Cards ──────────────────────────────────────────────── */
    .card {
      background: #fff; border-radius: 20px;
      border: 1px solid #EDECEA;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.03);
      overflow: hidden;
    }

    /* ─── Ingredients ────────────────────────────────────────── */
    .ing-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 22px; gap: 16px;
    }
    .ing-name { font-size: 15px; font-weight: 500; color: #111827; }
    .ing-qty { font-size: 14px; color: #9CA3AF; font-weight: 400; flex-shrink: 0; }

    /* ─── Steps ──────────────────────────────────────────────── */
    .step-item { position: relative; }
    .step-item + .step-item { border-top: 1px solid #F3F1EE; }
    .step-row {
      display: flex; gap: 16px; align-items: flex-start;
      padding: 18px 22px;
    }
    .step-num {
      min-width: 32px; height: 32px;
      background: #FF6B00; color: #fff;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 800; flex-shrink: 0; margin-top: 2px;
    }
    .step-text { font-size: 15px; color: #111827; line-height: 1.75; flex: 1; }

    /* Step 1: clip + gradient fade */
    .step-first { overflow: hidden; }
    .step-first .step-text {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 4;
      overflow: hidden;
    }
    .step-fade-cover {
      height: 48px; margin-top: -48px; position: relative; z-index: 2;
      background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.97) 100%);
      pointer-events: none;
    }

    /* ─── Lock gate ──────────────────────────────────────────── */
    .lock-section {
      border-top: 1px solid #F3F1EE;
      position: relative; overflow: hidden;
    }
    /* Actual step content shown blurred beneath glass */
    .locked-steps {
      filter: blur(9px);
      -webkit-filter: blur(9px);
      pointer-events: none; user-select: none;
      /* Scale slightly to hide blur edge bleed */
      transform: scale(1.02);
      transform-origin: top center;
    }
    /* Glass gradient panel sits over the blurred steps */
    .lock-panel {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom,
        rgba(255,255,255,0)    0%,
        rgba(255,255,255,0.15) 12%,
        rgba(255,255,255,0.72) 36%,
        rgba(255,255,255,0.97) 58%,
        rgba(255,255,255,1)    100%
      );
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
      padding: 32px 28px 40px;
      text-align: center;
    }
    .lock-icon-wrap {
      width: 52px; height: 52px; border-radius: 16px;
      background: linear-gradient(135deg,#FF6B00,#FF4500);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
      box-shadow: 0 6px 20px rgba(255,107,0,0.4);
    }
    .lock-panel h3 {
      font-size: 20px; font-weight: 800; letter-spacing: -0.4px; color: #111827;
      margin-bottom: 8px; line-height: 1.2;
    }
    .lock-panel p {
      font-size: 14px; color: #6B7280; line-height: 1.6;
      margin-bottom: 24px; max-width: 300px;
    }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      background: #FF6B00; color: #fff; border-radius: 100px;
      padding: 15px 36px; font-size: 15px; font-weight: 700; font-family: inherit;
      text-decoration: none; letter-spacing: -0.2px;
      box-shadow: 0 6px 24px rgba(255,107,0,0.4);
      transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
    }
    .btn-primary:hover { background: #E55D00; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255,107,0,0.45); }
    .btn-secondary {
      display: inline-flex; align-items: center; gap: 6px;
      color: #FF6B00; font-size: 14px; font-weight: 600; text-decoration: none;
      padding: 10px 20px; border-radius: 100px; border: 1.5px solid rgba(255,107,0,0.4);
      transition: background 0.15s, border-color 0.15s;
      margin-top: 10px;
    }
    .btn-secondary:hover { background: rgba(255,107,0,0.06); border-color: #FF6B00; }

    /* ─── Sidebar card ───────────────────────────────────────── */
    .sidebar-card {
      background: #fff; border-radius: 24px; border: 1px solid #EDECEA;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
      padding: 32px 28px; text-align: center;
    }
    .sidebar-app-icon {
      width: 80px; height: 80px; border-radius: 22px;
      object-fit: cover; margin: 0 auto 20px; display: block;
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    .sidebar-card h3 {
      font-size: 20px; font-weight: 800; letter-spacing: -0.4px;
      color: #111827; margin-bottom: 6px;
    }
    .sidebar-card .tagline {
      font-size: 14px; color: #6B7280; line-height: 1.6; margin-bottom: 28px;
    }
    .sidebar-dl {
      display: block; background: #FF6B00; color: #fff;
      border-radius: 100px; padding: 15px 24px;
      font-size: 15px; font-weight: 700; font-family: inherit;
      text-decoration: none; margin-bottom: 10px;
      box-shadow: 0 4px 16px rgba(255,107,0,0.35);
      transition: background 0.15s, transform 0.1s;
    }
    .sidebar-dl:hover { background: #E55D00; transform: translateY(-1px); }
    .sidebar-open {
      display: block; background: #F9F7F4; color: #374151;
      border-radius: 100px; padding: 13px 24px;
      font-size: 14px; font-weight: 600; font-family: inherit;
      text-decoration: none; border: 1px solid #EDECEA;
      transition: background 0.15s;
    }
    .sidebar-open:hover { background: #F0EDE8; }
    .store-badges {
      display: flex; justify-content: center; gap: 10px; margin-top: 18px;
      flex-wrap: wrap;
    }
    .store-badge {
      display: inline-flex; align-items: center; gap: 7px;
      background: #111827; color: #fff; border-radius: 10px;
      padding: 8px 16px; font-size: 11px; font-weight: 600;
      text-decoration: none; letter-spacing: 0.1px;
    }
    .store-badge:hover { background: #1F2937; }

    /* ─── Mobile CTA card ────────────────────────────────────── */
    .mobile-cta {
      background: #fff; border-radius: 20px; border: 1px solid #EDECEA;
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
      padding: 28px 24px; text-align: center; margin-top: 36px;
    }
    .mobile-cta h3 { font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 6px; }
    .mobile-cta p { font-size: 14px; color: #6B7280; margin-bottom: 20px; line-height: 1.55; }
    .mobile-cta .btn-primary { width: 100%; justify-content: center; }

    /* ─── Footer ─────────────────────────────────────────────── */
    footer {
      text-align: center; padding: 32px 24px;
      font-size: 13px; color: #9CA3AF; margin-top: 48px;
      border-top: 1px solid #EDECEA; background: #fff;
    }
    footer a { color: #FF6B00; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>

  <!-- Topbar -->
  <header class="topbar">
    <a href="https://www.justcooked.app" class="brand">
      <img src="/assets/Icon.svg" alt="Just Cooked" class="brand-icon" />
      <span class="brand-name">Just Cooked</span>
    </a>
    <a href="${deepLink}" class="topbar-cta" id="top-open-btn">Open in App</a>
  </header>

  <!-- Hero -->
  <div class="hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="attr-pill">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        ${attribution}
      </div>
      <h1 class="hero-title">${name}</h1>
    </div>
  </div>

  <!-- Page body -->
  <div class="page-outer">
    <div class="page-grid">

      <!-- Main content -->
      <main class="page-main">
        ${desc ? `<p class="desc">${desc}</p>` : ''}
        ${metaHtml ? `<div class="meta-row">${metaHtml}</div>` : ''}

        ${ingHtml ? `
        <p class="section-hd">Ingredients</p>
        <div class="card">${ingHtml}</div>` : ''}

        ${step1Html ? `
        <p class="section-hd section-gap">Instructions</p>
        <div class="card" style="overflow:hidden;">
          ${step1Html}
          <div class="lock-section">
            <div class="locked-steps">${lockedStepsHtml}</div>
            <div class="lock-panel">
              <div class="lock-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3>Cook the full recipe in&nbsp;Just&nbsp;Cooked</h3>
              <p>Step-by-step cook mode, built-in timers, and thousands of AI&#8209;powered recipes.</p>
              <a href="${storeLink}" class="btn-primary" id="main-dl-btn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12l4 4 4-4M12 8v8"/></svg>
                Download Just Cooked &mdash; Free
              </a>
              <a href="${deepLink}" class="btn-secondary" id="main-open-btn">Already have the app? Open it &rarr;</a>
            </div>
          </div>
        </div>` : ''}

        <!-- Mobile-only CTA -->
        <div class="mobile-cta sidebar-mobile-only">
          <h3>Cook this in Just Cooked</h3>
          <p>Step-by-step cook mode, timers, and thousands more AI recipes.</p>
          <a href="${storeLink}" class="btn-primary" id="mob-dl-btn">Download Just Cooked &mdash; Free</a>
          <br />
          <a href="${deepLink}" class="btn-secondary" id="mob-open-btn" style="margin-top:12px;">Open in App &rarr;</a>
        </div>
      </main>

      <!-- Desktop sidebar -->
      <aside class="page-sidebar sidebar-desktop-only">
        <div class="sidebar-card">
          <img src="/assets/Icon.svg" alt="Just Cooked app icon" class="sidebar-app-icon" />
          <h3>Just Cooked</h3>
          <p class="tagline">AI-powered recipes tailored to your ingredients, time, and taste.</p>
          <a href="${storeLink}" class="sidebar-dl" id="side-dl-btn">Download &mdash; Free</a>
          <a href="${deepLink}" class="sidebar-open" id="side-open-btn">Open in App</a>
          <div class="store-badges">
            <a href="https://apps.apple.com/app/just-cooked/id6741609869" class="store-badge" target="_blank">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              App Store
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.justcooked.app" class="store-badge" target="_blank">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.85c.3.16.64.22.99.16l12.87-7.44-2.81-2.81L3.18 23.85zm-1.68-2.15V2.3L13.23 12 1.5 21.7zm16.5-8.6l2.26 1.31c.76.44.76 1.16 0 1.6l-2.26 1.31-3.03-3.03 3.03-3.19zm-2.39-1.38L3.18.15c-.35-.06-.69 0-.99.16L13.23 12l2.88-2.88z"/></svg>
              Google Play
            </a>
          </div>
        </div>
      </aside>

    </div>
  </div>

  <footer>
    Made with <a href="https://www.justcooked.app">Just Cooked</a> &mdash; Your AI-powered kitchen companion
  </footer>

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
