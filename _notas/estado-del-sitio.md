# Estado del sitio y de Prospecto R

Última actualización: 13 de octubre de 2026. Este archivo resume lo hecho en la conversación que creó Prospecto R, para continuar el trabajo del sitio en otra conversación sin perder contexto. Quarto no publica las carpetas que empiezan con `_`, así que este archivo no aparece en la web.

## 1. Ramas

| Rama | Estado | Contenido |
|---|---|---|
| `master` | Publicada en Netlify | Sitio actual. Netlify publica la carpeta `_site` tal como está en el repositorio (se renderiza en local). |
| `fase-2-estructura` | Sin unir | Menú en español (Inicio, Tutoriales, Blog, Recursos, Sobre mí), `lang: es`, página Recursos, carpetas `tutoriales/` y `blog/`. |
| `prospecto-r` | Sin unir | Toda la serie Prospecto R (ver sección 2). Parte de `master`. |
| **`integracion-web`** | **Lista para revisar** | `fase-2-estructura` + `prospecto-r`. Es la rama a publicar. |

En `integracion-web` el menú queda: **Inicio · Aprende ▾ (Prospecto R, Tutoriales, Blog) · Recursos · Sobre mí** (decisión de Anthony: Prospecto R con entrada propia, agrupada con Tutoriales y Blog en el menú desplegable «Aprende»). El enlace de X es `https://x.com/ganthonyrc` (en `fase-2-estructura` estaba el antiguo `twitter.com/ganthonyr94`; la integración usa el correcto).

Otros cambios en `integracion-web` pedidos por Anthony: se quitó el botón «Descargar CV en PDF» de Sobre mí y la mención a Percy Soto en Recursos (se mantiene en las referencias del CV, que no pidió cambiar). La sección Blog (`blog/`) está vacía: queda reservada para entradas de opinión y novedades, distintas de los tutoriales.

### Recursos: cheatsheets (rama `recursos-cheatsheets`)

`recursos.qmd` muestra los cheatsheets en tarjetas, con dos listados que se alimentan de archivos YAML:

- `recursos/cheatsheets-propios.yml`: epiR, survival y rstatix (originales de Anthony, PDF en español e inglés).
- `recursos/cheatsheets-traducidos.yml`: gtsummary, srvyr, labelled, stata2r, regex, R base (con Thatiane Ramírez Porras) y Git y GitHub.
- `recursos/cheatsheets.ejs`: plantilla de las tarjetas. Los estilos están al final de `styles.css` (sección CHEATSHEETS).
- PDF en `pdf-files/` y miniaturas (primera página, JPEG de 800 px) en `images/cheatsheets/`.
- Cada tarjeta tiene el campo `posit:`. Cuando Anthony tenga el enlace de Posit, se escribe ahí y aparece el botón «Ver en Posit»; si está vacío, no aparece.
- Origen de los archivos: `F:\OneDrive\R\My R projects\contribuciones\cheatsheets` en el equipo de Anthony (estado de cada envío a Posit en su `README.md`).

### Antes de publicar (pendiente)

1. Renderizar el sitio completo **en local** con Quarto 1.10.18: `quarto render`. Aquí no se pudo porque:
   - `about.qmd` usa `pacman` y `scholar` (consulta Google Scholar).
   - `posts/Manual/index.qmd` usa `vembedr`.
   Por eso `_site/about.html` y `_site/posts/Manual/index.html` aún tienen el menú antiguo.
2. Revisar el sitio (menú, Prospecto R, comentarios).
3. Hacer commit de `_site`, subir y abrir el PR de `integracion-web` hacia `master`. **Unir a `master` publica el sitio: requiere la autorización explícita de Anthony.**
4. Después, se pueden borrar `fase-2-estructura` y `prospecto-r`.

### Versión de Quarto

El sitio se renderiza con **Quarto 1.10.18**. Usar otra versión rompe el JavaScript (`quarto.js` es un módulo desde 1.10). También se actualizó `_site/site_libs/quarto-listing/quarto-listing.js`, que venía de una versión antigua y hacía que el filtro por categorías no mostrara ninguna entrada.

## 2. Prospecto R

Serie de minitutoriales de análisis de datos de salud en R, al estilo de las *recipes* de Posit, con datos reales del Perú. Firma: Anthony Romero Cerdán + Bioestadística en línea (@bioestadistica.en.linea). Nombres de los niveles: **Dosis inicial** y **Dosis plena** (decisión final de Anthony).

El botón «Escríbeme» (`contacto:` en `prospecto/_metadata.yml`) abre WhatsApp (51955446754) con el mensaje «Hola, vi tu tutorial Prospecto R en tu página web y quiero información sobre asesoría para mi tesis», distinto del de Instagram, para saber de dónde llega cada contacto.

### Convenciones

- Todo en español y con **coma decimal** (`options(OutDec = ",")`, funciones `fmt()` y `pct()`, espacio no separable antes de `%`).
- Las cifras del texto se calculan al compilar; nunca se escriben a mano.
- Los datos (ENDES, ENAHO) **no se suben**: cada lector los descarga del INEI. `.gitignore` excluye `prospecto/**/ENDES`.
- Estructura de cada entrega (metáfora del prospecto de un medicamento): Indicación, Composición, Posología (pasos), Resultado, Contraindicaciones y reacciones adversas, Cómo reportarlo, Autoevaluación, Referencias, Reproducibilidad.

### Dos niveles por tema

| Archivo | Nivel | Contenido |
|---|---|---|
| `inicial.qmd` | **Dosis inicial** | Lo indispensable (p. ej., sin diseño muestral). Termina con «Siguiente dosis». |
| `plena.qmd` | **Dosis plena** | Todo, incluido lo complejo. |

Cada dosis empieza con la casilla «¿Qué dosis te toca?» (3 preguntas de sí o no del tema) y una franja que indica el nivel. La primera categoría es `Dosis inicial` o `Dosis plena` (filtro del listado). Reglas completas en `prospecto/_plantilla/LEEME.md`.

### Archivos

- `prospecto/index.qmd`: listado (tarjetas con imagen, título, subtítulo y tiempo de lectura; filtro por categorías; sin comentarios).
- `prospecto/diccionario.qmd`: 20 términos con definición propia y fuentes (Porta, Rothman, Kirkwood, Hosmer, Lumley, ficha técnica ENDES 2024, etc.). Pendiente: que Anthony revise las definiciones.
- `prospecto/_metadata.yml`: opciones comunes (CSS, script, código plegado, `freeze: auto`, enlace `contacto`, comentarios giscus).
- `prospecto/estilo/`: `prospecto.css`, `prospecto.html` (definiciones emergentes y botón «Copiar para mi tesis») y `fuentes/` (Inter, Fraunces, JetBrains Mono autoalojadas, licencia OFL).
- `prospecto/_plantilla/`: `hero.html` (imagen «receta»), `ficha.html` (ficha PDF A4), `render.js`, `LEEME.md`. Uso: `node render.js ../<tema>/receta_<nivel>.json` crea `receta_<nivel>.png` (1080 × 1350), `receta_<nivel>_web.png` (1200 × 630) y `ficha_<nivel>.pdf`.
- `prospecto/or-vs-rp/`: entrega n.º 1, «¿OR o razón de prevalencias?» (ENDES 2024, obesidad abdominal mujeres vs. hombres).
  - Dosis inicial (muestra, sin diseño): RP 3,44 (3,31 a 3,58); OR 6,92.
  - Dosis plena (con diseño): prevalencias 62,0 % y 20,3 %; RP 3,05 (2,86 a 3,24); OR 6,38; RP estandarizada desde la logística 2,97.
  - Cada dosis genera al compilar su script descargable (`inicial.R`, `plena.R`, verificados de principio a fin) y su JSON de receta y ficha. Compilar primero `plena.qmd`, porque `inicial.qmd` lee `receta_plena.json`.

### Entrega n.º 2: «La Tabla 1 de tu tesis» (`prospecto/tabla-1/`)

- Pregunta: características de las personas de 15 y más años con y sin presión arterial alta (criterio del INEI: promedio de dos mediciones ≥ 140/90, sin gestantes). Módulos ENDES 2024: 1640 (CSALUD01), 1629 (RECH0, RECH1), 1630 (RECH23) y 1632 (RE223132).
- Dosis inicial: `tbl_summary()` sin diseño, formato de tesis, exportación a Word (`tabla1_inicial.docx`).
- Dosis plena: `tbl_svysummary()` con el diseño; n sin ponderar con % ponderado (la N ponderada es suma de pesos); nota al pie de las pruebas en español; tabla de prevalencias por fila con `svyciprop()` (advertencia: `add_ci()` con `percent = "row"` da intervalos por columna); Word (`tabla1_plena.docx`, `tabla2_plena.docx`).
- Cifras: n = 30 825; presión alta 14,2 % (IC 95 %: 13,5 a 14,9), hombres 18,3 %, mujeres 10,2 % (INEI: 14,2; 18,3; 10,3). Zona rural: 36,7 % en la muestra y 17,9 % en la población.
- Paquetes usados al compilar: gtsummary 2.6.1, gt 1.3.0, flextable 0.10.1, survey 4.5, broom 1.0.13, knitr 1.52. Para volver a ejecutar las páginas en otra computadora hacen falta versiones recientes de esos paquetes (gtsummary 2.x exige survey ≥ 4.5 y flextable ≥ 0.9.11).
- El diccionario sumó: mediana y RIC, porcentaje por columna y por fila, prueba de chi cuadrado (Rao-Scott) y valor p.
- La plantilla de la receta acepta el campo `big` (cifra destacada en HTML); si falta, muestra RP y OR como en la entrega 1.

### Elementos de cada página

Código plegado («Ver código»), resultados en bloques «Mira el resultado», guía «Cómo leerlo» tras cada salida, enlaces punteados al diccionario con definición al pasar el mouse, botones de descarga (.R y ficha PDF), botón «Copiar para mi tesis», autoevaluación de 3 preguntas, llamada a la asesoría y comentarios.

### Comentarios (giscus)

Activados en `prospecto/_metadata.yml`: repositorio `ganthonyr19/myblog`, categoría de Discussions **Prospecto R** (formato Announcement), `repo-id: R_kgDOVFWTfQ`, `category-id: DIC_kwDOVFWTfc4DIXEF`, mapeo `pathname`, en español. Discussions activado y app giscus instalada solo en `myblog`. Funcionan cuando el sitio se publique.

### Pendientes de Prospecto R

- Revisar en el sitio publicado que las fórmulas (KaTeX desde CDN) y los comentarios se vean bien.
- Las imágenes y textos para redes de la entrega 1 (en `ig_asesorias\prospecto\p1` del equipo de Anthony) usan las cifras de la dosis plena y no llevan distintivo de nivel.

## Consultorio estadístico (`herramientas/`)

Nombre elegido por Anthony (15 oct 2026): **Consultorio estadístico**. Menú superior: «Consultorio» (`herramientas/index.qmd`, portada con los módulos). Módulos: **Muestra** (`herramientas/muestra/`) y **Triaje** (vive dentro de la entrada de blog `blog/que-prueba-estadistica/`, sección «Haz tu triaje»). También aparece en `recursos.qmd`.

### Calculadora de tamaño de muestra (`herramientas/muestra/`)

- `index.qmd`: interfaz en HTML fijo (para que los enlaces `a.dic` tengan definición emergente con `prospecto/estilo/prospecto.html`), fórmulas, verificación, referencias y llamada a WhatsApp.
- `motor.js`: cálculos. Una proporción (Lwanga y Lemeshow 1991, con DEFF y población finita n0/(1+(n0−1)/N)); dos proporciones (Fleiss con y sin corrección de continuidad, casos y controles con OR, cohorte con RR, transversal con RP y r = (1−e)/e); dos medias (t no central, Lenth AS 243, igual a `power.t.test`); diagnóstica (Buderer 1996); correlación (z de Fisher, Hulley 2013). Pérdidas: ceiling(n/(1−L)) por grupo.
- `app.js`: lee supuestos, escribe n con desglose, observaciones del jurado, párrafo para la tesis (con marcas amarillas para completar), código R, curva de sensibilidad SVG y enlaces de lectura según el diseño. Acepta enlaces preconfigurados: `#mod=prop`, `#mod=dprop&dis=cc|co|tr`, `#mod=med`, `#mod=dx`, `#mod=cor`.
- `verificacion.R`: compara el motor con R. Resultado al 15 oct 2026: dos proporciones = `EnvStats::propTestN` (dif. máx. 2,6e-7) y `power.prop.test`; dos medias = `power.t.test` (r = 1) y potencia exacta en R para r ≠ 1; una proporción = fórmula en R y `epiR::epi.sssimpleestb` sin N (con N epiR usa n0/(1+n0/N) y puede dar 1 menos); `epiR::epi.sscc(fleiss = TRUE)` devuelve NA en epiR 2.0.99.

### Triaje (`blog/que-prueba-estadistica/`)

- `index.qmd`: entrada «¿Qué prueba estadística uso?»: las cuatro preguntas, triaje interactivo, mapa completo, cinco mitos, párrafo para el proyecto, autoevaluación y referencias verificadas.
- `triaje.js`: árbol de preguntas (`Q`) y recetas (`R`) con indicación, posología, diagnóstico diferencial, código R (funciones verificadas: epiR::epi.tests, irr::kappa2/icc, rstatix::cochran_qtest/dunn_test/games_howell_test/anova_test) y ejemplo de reporte (cifras ilustrativas).

## Serie «Diseños de estudio» (`disenos/`)

- Una entrada por diseño (decisión de Anthony, para generar volumen). Hechas: `transversal/`, `casos-y-controles/`, `cohortes/`. Anunciadas como «Próximamente» en la portada `disenos/index.qmd`: ensayo clínico, pruebas diagnósticas, ecológico, reporte y serie de casos.
- Estructura de cada entrada: sello, frase central, diagrama SVG, cuándo elegirlo, cómo se analiza (tabla 2×2 con cifras ilustrativas y código R), fortalezas y límites, sesgos, errores frecuentes en tesis, tamaño de muestra (enlace a la calculadora ya configurada), STROBE, autoevaluación, referencias, llamada a WhatsApp.
- El transversal usa cifras reales del Prospecto R n.º 1 (ENDES 2024: obesidad abdominal 62,0 % vs. 20,3 %; RP 3,05; OR 6,38).
- `disenos/_metadata.yml` aplica `prospecto.css`, `estilo/editorial.css` y el script del diccionario.
- Las entradas aparecen en el listado del blog y en «Lo más reciente» del inicio (`"disenos/*/index.qmd"`).

## Identidad visual

- Emblemas SVG propios en `images/marcas/`: `prospecto`, `consultorio`, `muestra`, `triaje`, `disenos`, `blog`. Se muestran como «sello» al inicio de cada página (clase `.sello` en `estilo/editorial.css`).
- Portadas 1200 × 630 de cada entrada: `node images/marcas/tarjeta.js salida.png '{"emblema":"disenos","serie":"…","subserie":"…","titulo":"…","bajada":"…"}'` (con `CHROMIUM=/ruta/a/chromium` si hace falta). Usa `tarjeta.html`, las fuentes de Prospecto R y el logo `logo-bel.png`.
- Componentes editoriales nuevos en `estilo/editorial.css`: tarjetas numeradas, triaje, mapa de pruebas, mitos, diagramas, pros y contras, llamada a la calculadora, rejilla de serie.

## Instagram (@bioestadistica.en.linea)

- Ícono en el menú superior, enlace en el pie de página, en el inicio y en «Sobre mí».
- Tarjeta «¿Te sirvió? Seguir @bioestadistica.en.linea» al final de cada página con título que no sea listado ni el inicio: `_includes/sigue.html` (incluido en `_quarto.yml`), estilos en `styles.css`. Para ocultarla en una página: clase `sin-sigue` en el body.

## Cómo renderizar aquí (lecciones del 15 oct 2026)

- No usar `quarto render` del proyecto completo en el contenedor: limpia `_site/`, falla en `about.qmd` (scholar) y deja el sitio a medias. Si pasa, `git restore _site`.
- Renderizar archivo por archivo. Las páginas de Prospecto R con `--use-freezer` y `LANG=C.UTF-8` (si no, se re-ejecutan y cambian `_freeze`).
- Al renderizar un archivo suelto, Quarto no siempre actualiza los recursos copiados (`styles.css`, `.js`): compararlos con `cmp` y copiarlos a `_site/`.
- `about.qmd` (ahora con el enlace a Instagram) y `posts/Manual/index.qmd` deben renderizarse en la computadora de Anthony; mientras tanto conservan el menú anterior.
