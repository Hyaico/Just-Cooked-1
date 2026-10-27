// Local preview for the static site. Zero dependencies, Node 18+.
//
//   node scripts/preview.mjs            -> http://localhost:4173
//   node scripts/preview.mjs 8080       -> pick a port
//
// Mimics the two things Vercel does for us in production: clean URLs (/faq -> faq.html)
// and the /recipe/:shareId route. The recipe route renders the real page template with a
// built-in sample recipe, so you can check its design without a Supabase key. To preview
// against live data use `vercel dev` instead.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2] || 4173);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml',
};

const SAMPLE = {
  recipe_data: {
    name: 'Creamy Carbonara',
    description: 'Al dente pasta in a rich, savoury sauce made from eggs and cheese, balanced with crispy pancetta.',
    totalTimeMinutes: 25, difficultyLevel: 'easy', servings: 2, calories: 640, protein_g: 32,
    authorType: 'jc', cuisineType: 'Italian', dietType: 'omnivore', allergenInfo: ['Eggs', 'Dairy', 'Gluten'],
    requiredEquipment: ['large pan', 'pot'],
    ingredients: [
      { name: 'spaghetti', quantity: 200, unit: 'g' },
      { name: 'pancetta', quantity: 100, unit: 'g', preparation: 'diced' },
      { name: 'eggs', quantity: 2 },
      { name: 'parmesan', quantity: 50, unit: 'g', preparation: 'grated' },
      { name: 'black pepper', quantity: 1, unit: 'tsp' },
    ],
    instructions: [
      { description: 'Bring a large pot of salted water to the boil and cook the spaghetti until al dente, about 9 minutes. Reserve a mug of the pasta water before draining.', timer: 9 },
      { description: 'Meanwhile, fry the pancetta in a large pan over medium heat until golden and crisp, about 5 minutes. Take the pan off the heat.', timer: 5 },
      { description: 'Whisk the eggs with the parmesan and plenty of black pepper in a bowl.' },
      { description: 'Tip the drained pasta into the pan with the pancetta, pour over the egg mixture and toss quickly, adding splashes of pasta water until glossy. Serve straight away.' },
    ],
  },
  owner_username: 'julius',
  thumbnail_url: null,
};

// The recipe function talks to Supabase; here we answer those calls with the sample above.
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'preview';
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (String(url).includes('supabase.co')) {
    if (String(url).includes('track_share_view')) return new Response('{}', { status: 200 });
    return new Response(JSON.stringify(SAMPLE), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  return realFetch(url, opts);
};
const recipeHandler = (await import(pathToFileURL(path.join(ROOT, 'api', 'recipe', '[shareId].js')).href)).default;

function send(res, code, type, body) {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let p = decodeURIComponent(url.pathname);
  if (p.includes('..')) return send(res, 400, 'text/plain', 'Bad path');

  const recipe = p.match(/^\/recipe\/([^/]+)$/);
  if (recipe) {
    const shim = {
      statusCode: 200, headers: {},
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      status(c) { this.statusCode = c; return this; },
      send(body) { res.writeHead(this.statusCode, this.headers); res.end(body); },
    };
    await recipeHandler({ query: { shareId: recipe[1] }, headers: req.headers }, shim);
    return;
  }

  if (p.endsWith('/') && p !== '/') p = p.slice(0, -1);
  const candidates = p === '/' ? ['index.html'] : [p, p + '.html', path.join(p, 'index.html')];
  for (const c of candidates) {
    const f = path.join(ROOT, c);
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      return send(res, 200, MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', fs.readFileSync(f));
    }
  }
  const notFound = path.join(ROOT, '404.html');
  return send(res, 404, 'text/html; charset=utf-8', fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not found');
}).listen(PORT, () => {
  const lan = Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
  console.log('Just Cooked preview');
  console.log('  This computer:  http://localhost:' + PORT);
  lan.forEach((ip) => console.log('  Your phone:     http://' + ip + ':' + PORT + '   (same Wi-Fi)'));
  console.log('  Recipe page:    http://localhost:' + PORT + '/recipe/demo');
  console.log('Press Ctrl+C to stop.');
});
