El PDF del mapa (`mapa-pruebas-estadisticas.pdf`) sale de `_mapa-pdf.html`.
Si cambias la tabla del mapa en `index.qmd`, copia la tabla a `_mapa-pdf.html` y vuelve a generar el PDF con Chromium
(Playwright: `page.pdf({ width: '297mm', height: '210mm', printBackground: true })`).
