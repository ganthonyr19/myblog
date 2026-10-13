const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  for (const [lay, w, h] of [['web', 1200, 630], ['ig', 1080, 1350]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const j = require(process.argv[2] || './receta.json'); await p.goto('file://' + __dirname + '/hero.html?layout=' + lay + '&rp=' + encodeURIComponent(j.rp) + '&or=' + encodeURIComponent(j.or) + '&or0=' + encodeURIComponent(j.or0));
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: (process.argv[3] || '.') + `/hero_${lay}.png` });
  }
  await b.close();
})();
