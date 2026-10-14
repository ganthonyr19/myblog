# anthonyromero.netlify.app

Código fuente de la web personal de **Anthony Romero Cerdán**, médico cirujano (UNMSM): tutoriales, recursos y novedades sobre R y análisis de datos aplicados a la investigación en salud.

🌐 **Sitio:** <https://anthonyromero.netlify.app>

## Qué hay en la web

| Sección | Contenido |
|---|---|
| **Aprende › Prospecto R** | Minitutoriales de análisis de datos de salud en R con datos reales del Perú (ENDES). Cada tema viene en dos niveles: *dosis inicial* y *dosis plena*. |
| **Aprende › Tutoriales** | Guías paso a paso, como el manual de instalación de R, RStudio y Rtools. |
| **Aprende › Blog** | Opinión y novedades. |
| **Recursos** | Cheatsheets de R creados y traducidos al español, para descargar. |
| **Sobre mí** | CV, proyectos y publicaciones. |

## Cómo está hecha

- Sitio web de [Quarto](https://quarto.org) (versión **1.10.18**) con código en R.
- El sitio se compila **en local** (`quarto render`) y la carpeta `_site/` se sube al repositorio. Netlify publica esa carpeta cuando hay cambios en `master`.
- Las entregas de Prospecto R usan `freeze`: sus resultados quedan guardados en `_freeze/`, así que el sitio se puede compilar sin volver a ejecutar sus análisis.
- Los comentarios de Prospecto R usan [giscus](https://giscus.app) y se guardan en las *Discussions* de este repositorio.

## Estructura

```
├── _quarto.yml          configuración del sitio y del menú
├── index.qmd            inicio
├── prospecto/           Prospecto R: una carpeta por tema, diccionario, estilo y plantillas
├── tutoriales/, posts/  tutoriales
├── blog/                entradas del blog
├── recursos.qmd         cheatsheets (datos en recursos/*.yml)
├── about.qmd            sobre mí
├── _site/               sitio compilado que publica Netlify
└── _notas/              notas de trabajo (no se publican)
```

## Compilar en local

1. Instala [R](https://cran.r-project.org) y [Quarto 1.10.18](https://quarto.org/docs/download/).
2. Clona el repositorio y, en la carpeta del proyecto, ejecuta `quarto render`.
3. Para revisar el resultado: `quarto preview`.

Para volver a ejecutar una entrega de Prospecto R hacen falta los microdatos de la ENDES, que no se incluyen en el repositorio: cada tutorial explica cómo descargarlos del [portal del INEI](https://proyectos.inei.gob.pe/microdatos/).

## Licencia

El contenido del sitio se publica bajo [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Los cheatsheets tienen licencia [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Las tipografías de `prospecto/estilo/fuentes/` (Inter, Fraunces y JetBrains Mono) tienen licencia SIL Open Font License 1.1.
