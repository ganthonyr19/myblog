// Uso: node render.js ../<entrega>/receta_<nivel>.json [--solo-ficha]
// Crea junto al JSON: receta_<nivel>.png (1080 × 1350), receta_<nivel>_web.png (1200 × 630)
// y ficha_<nivel>.pdf (A4, una página). Con --solo-ficha, solo rehace el PDF.
// Se detiene si el JSON trae texto dañado tipo «<U+00E9>»: eso pasa cuando R escribió el JSON
// sin una configuración regional UTF-8 (p. ej., LANG=C). Compila con LANG=C.UTF-8 y vuelve a intentar.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const json = path.resolve(process.argv[2]);
  const d = require(json);
  const soloFicha = process.argv.includes('--solo-ficha');
  const danado = JSON.stringify(d).match(/<U\+[0-9A-Fa-f]{4}>|Ã[©¡³±º­]/g);
  if (danado) {
    console.error(`ERROR: ${json} trae ${danado.length} caracteres dañados (p. ej., ${danado[0]}).`);
    console.error('R escribió el JSON sin UTF-8. Vuelve a compilar el .qmd con LANG=C.UTF-8 (o en RStudio en Windows) y repite.');
    process.exit(1);
  }
  const base = json.replace(/\.json$/, '');
  const q = encodeURIComponent(JSON.stringify(d));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  for (const [lay, w, h, suf] of soloFicha ? [] : [['ig', 1080, 1350, ''], ['web', 1200, 630, '_web']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('file://' + __dirname + '/hero.html?layout=' + lay + '&d=' + q);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `${base}${suf}.png` });
  }
  if (d.ficha) {
    const p = await b.newPage();
    await p.goto('file://' + __dirname + '/ficha.html?d=' + q);
    await p.evaluate(() => document.fonts.ready);
    const pdf = path.join(path.dirname(json), `ficha_${d.nivel}.pdf`);
    await p.pdf({ path: pdf, format: 'A4', printBackground: true, pageRanges: '1' });
    console.log('Ficha creada:', pdf);
  }
  await b.close();
})();
