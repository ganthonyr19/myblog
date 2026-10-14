# Sistema de Prospecto R

## Niveles

Cada tema se publica en dos dosis, dentro de la misma carpeta (`prospecto/<tema>/`):

| Archivo | Nivel | Contenido |
|---|---|---|
| `inicial.qmd` | Dosis inicial | Lo indispensable: elegir el método, aplicarlo e interpretarlo. Sin complejidades (p. ej., sin diseño muestral). Termina con la sección **Siguiente dosis**, que dice qué deja fuera y qué cambia con ello. |
| `plena.qmd` | Dosis plena | Todo: lo de la inicial más lo complejo (diseño muestral, alternativas de modelo, trampas de los datos, control de calidad). |

Reglas:

1. Las dos dosis comparten datos, pregunta y estructura (Indicación, Composición, Posología, Resultado, Contraindicaciones, Cómo reportarlo, Referencias, Reproducibilidad).
2. Ambas llevan al inicio la casilla **¿Qué dosis te toca?** con tres preguntas de sí o no propias del tema, y una franja que dice en qué dosis está el lector, con enlace a la otra.
3. La ficha inicial incluye la fila **Nivel**.
4. La primera categoría es `Dosis inicial` o `Dosis plena` (sirve de filtro en el listado).
5. Las cifras que la dosis inicial cita de la plena se leen de `receta_plena.json`: compila primero `plena.qmd`.

## Receta (imagen de portada)

Cada dosis escribe al compilarse `receta_<nivel>.json` con todos los textos y cifras de la imagen (campo `nivel`: `inicial` o `plena`).

1. `npm install` en esta carpeta (Playwright y las tipografías Fraunces, Inter y JetBrains Mono).
2. Compila el tutorial: `quarto render prospecto/<tema>/plena.qmd` y luego `inicial.qmd`.
3. `node render.js ../<tema>/receta_<nivel>.json`

Se crean junto al JSON `receta_<nivel>.png` (1080 × 1350: portada e Instagram) y `receta_<nivel>_web.png` (1200 × 630: vista previa en X, LinkedIn y WhatsApp). El distintivo de nivel sale del campo `nivel`. La cifra destacada del hallazgo sale del campo `big` (HTML, por ejemplo `"<b>36,7 %</b> → <b>17,9 %</b>"`); si no existe, se muestran `rp` y `or`.
