// Uso: node render.js ../<entrega>/receta_<nivel>.json
// Crea junto al JSON: receta_<nivel>.png (1080 × 1350), receta_<nivel>_web.png (1200 × 630)
// y ficha_<nivel>.pdf (A4, una página).
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const json = path.resolve(process.argv[2]);
  const d = require(json);
  const base = json.replace(/\.json$/, '');
  const q = encodeURIComponent(JSON.stringify(d));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  for (const [lay, w, h, suf] of [['ig', 1080, 1350, ''], ['web', 1200, 630, '_web']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('file://' + __dirname + '/hero.html?layout=' + lay + '&d=' + q);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `${base}${suf}.png` });
  }
  if (d.ficha) {
    const p = await b.newPage();
    await p.goto('file://' + __dirname + '/ficha.html?d=' + q);
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: path.join(path.dirname(json), `ficha_${d.nivel}.pdf`), format: 'A4', printBackground: true, pageRanges: '1' });
  }
  await b.close();
})();
