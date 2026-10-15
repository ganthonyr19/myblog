// Genera la imagen de portada (1200 × 630) de una entrada.
// Uso: node images/marcas/tarjeta.js salida.png '{"emblema":"disenos","serie":"Diseños de estudio","titulo":"...","bajada":"..."}'
const path = require('path');
const { chromium } = require(path.join(__dirname, '../../prospecto/_plantilla/node_modules/playwright'));
(async () => {
  const [salida, json] = process.argv.slice(2);
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('file://' + path.join(__dirname, 'tarjeta.html') + '?d=' + encodeURIComponent(json));
  await p.waitForTimeout(700);
  await p.screenshot({ path: salida });
  await b.close();
})();
