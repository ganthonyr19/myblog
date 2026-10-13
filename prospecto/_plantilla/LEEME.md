# Plantilla de la receta (imagen de portada de cada Prospecto R)

Genera dos imágenes a partir de las cifras que escribe cada tutorial en `receta.json`:

- `hero_ig.png` (1080 × 1350): portada del tutorial y publicación de Instagram → se copia como `receta.png`.
- `hero_web.png` (1200 × 630): vista previa de enlaces en X, LinkedIn y WhatsApp → se copia como `receta_web.png`.

Pasos:

1. `npm install` (instala Playwright y las tipografías Fraunces, Inter y JetBrains Mono).
2. Edita en `hero.html` el bloque `D` con el número, el título y los textos de la nueva entrega.
3. Renderiza el tutorial para que se cree `receta.json` con las cifras.
4. `node render.js ../<entrega>/receta.json .` y copia las imágenes a la carpeta de la entrega.

Las cifras de la imagen salen siempre de `receta.json`, para que coincidan con el texto.
