// Uso: node render.js ../<entrega>/receta_<nivel>.json
// Crea receta_<nivel>.png (1080 × 1350) y receta_<nivel>_web.png (1200 × 630) junto al JSON.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const json = path.resolve(process.argv[2]);
  const d = require(json);
  const base = json.replace(/\.json$/, '');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  for (const [lay, w, h, suf] of [['ig', 1080, 1350, ''], ['web', 1200, 630, '_web']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('file://' + __dirname + '/hero.html?layout=' + lay + '&d=' + encodeURIComponent(JSON.stringify(d)));
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `${base}${suf}.png` });
  }
  await b.close();
})();
