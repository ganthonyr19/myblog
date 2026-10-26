# CLAUDE.md · Serie «Caso clínico estadístico»

> **Cómo usar este archivo.** La parte I (secciones 1 a 10) contiene las instrucciones de la serie. La parte II (secciones 11 a 17) contiene el estado del trabajo, los pendientes, los puntos por revisar y el registro de cambios. La parte III (sección 18) reúne los demás trabajos hechos en la cuenta secundaria: Vademécum estadístico, piezas para Instagram, Recetario del tesista y el diseño de «Historia clínica de tu tesis». Lee todo antes de empezar y actualiza las partes II y III al terminar cada tarea.

Instrucciones para redactar las entradas de la serie **Caso clínico estadístico** del sitio de Anthony Romero-Cerdán (anthonyromero.netlify.app, repositorio `ganthonyr19/myblog`). Lee todo antes de escribir la primera línea.

---

# PARTE I · INSTRUCCIONES

## 1. Quién es el autor y cómo trabajar con él

- **Autor:** Anthony Romero-Cerdán, MD. Es médico cirujano colegiado, egresado de la UNMSM (Lima, Perú). Asesora tesis de ciencias de la salud en metodología y bioestadística con R.
- **Marca:** Bioestadística en línea (Instagram @bioestadistica.en.linea).
- **Idioma:** responde siempre en español.
- **No inventar nada:** ningún dato, cifra, cita ni referencia. Si no sabes algo o no puedes verificarlo, dilo.
- **Rigor máximo:** cada afirmación estadística debe ser correcta y defendible ante un jurado de tesis.
- **Configuración paso a paso:** si guías a Anthony en Git, RStudio u otra configuración, da un paso a la vez y espera su confirmación.
- **Decimales con coma** en todo el texto (1,96; IC 95 %: 1,2 a 3,4). En el código R se usa punto.
- **Mensajes de WhatsApp** que pida: informales, como escritos desde el celular, sin guiones.

---

## 2. Qué es la serie

Un formato breve de autoevaluación, inspirado en la sección *Endgames · Statistical question* de Philip Sedgwick en el BMJ:

1. Se resume un estudio.
2. Se plantean afirmaciones (a, b, c, d) para decidir cuáles son verdaderas.
3. Se explica cada respuesta.

**Regla de derechos de autor (obligatoria).** Los artículos de Sedgwick sirven solo como inspiración de temas y formato. No se traducen, no se copian sus viñetas, sus afirmaciones ni sus explicaciones, y no se reproducen sus ejemplos. Cada caso es original y en español.

Los PDF están en la carpeta local `myblog-nuevo/P. SEDGWICK/`. Esa carpeta está en `.gitignore` y nunca se sube al repositorio.

**Diferencial frente al original:**
- Contexto peruano y de tesis.
- Un bloque «En R» con el código para reproducir el cálculo.
- Enlaces a las herramientas y entradas del sitio.
- La analogía clínica de la marca.

---

## 3. Sello de marca: la analogía clínica

Es permanente y obligatoria en todo el sitio. Se usa con naturalidad, sin forzarla:

- **Caso clínico:** la viñeta del estudio.
- **Anamnesis:** qué se hizo y con quién.
- **Diagnóstico diferencial:** lo que se confunde con el concepto.
- **Receta (Rp/):** la conclusión práctica.
- **Pase de visita:** la discusión de las afirmaciones.

Las otras series del sitio usan el mismo lenguaje:
- **Prospecto R:** dosis inicial y dosis plena, indicación, posología, contraindicaciones.
- **Consultorio estadístico:** módulos Muestra y Triaje.
- **Diseños de estudio.**

---

## 4. Estructura de cada entrada

Ubicación: `casos/<slug>/index.qmd`, por ejemplo `casos/rr-vs-or/index.qmd`. Un caso por carpeta.

### 4.1 Encabezado YAML

```yaml
---
title: "¿El odds ratio es un riesgo relativo?"      # pregunta corta y atractiva
description: "Caso clínico estadístico: un ensayo sobre ... Decide qué afirmaciones son verdaderas y por qué."
date: 2026-10-20          # fechas escalonadas, nunca dos entradas el mismo día
image: portada.png        # se genera con images/marcas/tarjeta.js (ver sección 7)
categories: [Caso clínico estadístico, Medidas de asociación, Ensayo clínico]
---
```

- El autor («Anthony Romero-Cerdán, MD»), el idioma, los estilos y el script del diccionario se heredan de `casos/_metadata.yml`, que hay que crear al iniciar la serie (ver 5.1).
- **No uses `subtitle`:** el banner ya muestra `description`, y con subtítulo el texto se duplica.
- **Categorías:**
  - La primera siempre es «Caso clínico estadístico».
  - Las demás deben coincidir exactamente, con mayúsculas y tildes, con las que ya usa el sitio, cuando existan: Epidemiología, Diseños de estudio, Pruebas estadísticas, Tamaño de muestra, Tesis, medidas de asociación, estudios transversales, ENDES…
  - Al hacer clic, cada categoría abre `temas.html#tema=<categoría>`.

### 4.2 Cuerpo, en este orden

1. **Sello de la serie:**
   ```markdown
   [![](../../images/marcas/casos.svg)<span><b>Caso clínico estadístico</b><em>Caso n.º 1</em></span>](../index.qmd){.sello}
   ```
2. **El caso** (`## El caso`). Viñeta de 120 a 200 palabras, narrada como una presentación clínica: pregunta del estudio, diseño, población, intervención o exposición, desenlace y resultados con sus cifras e IC 95 %.
   - **Fuente del estudio:** un estudio real con referencia verificada, idealmente peruano o latinoamericano, o un estudio ilustrativo declarado como tal («Caso ilustrativo, con datos simulados»).
   - Nunca presentes datos inventados como reales.
3. **La pregunta** (`## ¿Cuáles de estas afirmaciones son verdaderas?`). Cuatro afirmaciones, de la a) a la d), sobre un concepto central. Mezcla verdaderas y falsas; pueden ser todas verdaderas o todas falsas, pero que no sea predecible.
4. **Pase de visita** (`## Pase de visita`). Una explicación por afirmación, plegable para que el lector piense antes de mirar:
   ```markdown
   ::: {.autoeval}
   ::: {.pregunta}
   **a) Texto de la afirmación.**

   <details><summary>Ver respuesta</summary>
   **Verdadera.** Explicación de 2 a 5 oraciones, con el razonamiento y la cifra del caso.
   </details>
   :::
   :::
   ```
   Repite el bloque `.pregunta` para b), c) y d), todos dentro del mismo `.autoeval`.
5. **La receta** (`## Rp/`). Una frase central con la clase `.en-una-frase`: la idea que el lector debe llevarse.
   ```markdown
   ::: {.en-una-frase}
   El OR se acerca al RR solo cuando el desenlace es raro.
   :::
   ```
6. **Diagnóstico diferencial** (opcional, `## Diagnóstico diferencial`). Dos o tres conceptos con los que se confunde, con enlace al diccionario.
7. **En R** (`## En R`). Código corto, verificado y que se ejecuta, que reproduce el cálculo central con las cifras del caso.
   - Si el chunk se ejecuta en el render, usa `#| echo: true` y datos construidos en el propio código; no uses bases externas.
   - El código se pliega solo, porque el sitio tiene `code-fold: true`.
8. **Para profundizar.** Enlaces internos que correspondan (ver sección 6).
9. **Referencias.** Estilo Vancouver, todas verificadas. Si no puedes verificar una referencia, no la pongas.
10. **Llamada a la asesoría** (bloque `.cta`):
    ```markdown
    ::: {.cta}
    **¿Te tocó un caso así en tu tesis?**

    Te ayudo a elegir e interpretar el análisis correcto.

    [Escríbeme por WhatsApp](https://api.whatsapp.com/send?phone=51955446754&text=Hola%2C%20le%C3%AD%20un%20caso%20cl%C3%ADnico%20estad%C3%ADstico%20en%20tu%20web%20y%20quiero%20informaci%C3%B3n%20sobre%20asesor%C3%ADa%20para%20mi%20tesis)
    :::
    ```

La tarjeta «Seguir @bioestadistica.en.linea» y el tiempo de lectura se agregan solos (`_includes/`). No los pongas a mano. **No hay comentarios en el sitio.**

### 4.3 Extensión y tono

- Entre 500 y 900 palabras. Debe ser una entrada corta y de lectura rápida.
- Formal pero cercano, didáctico. Habla al tesista («tu tesis», «el jurado»).
- Frases cortas, sin relleno.
- Párrafos justificados: el sitio los justifica solo.

---

## 5. Archivos de la serie

### 5.1 Al iniciar la serie (una sola vez)

- **`casos/_metadata.yml`:** copia `disenos/_metadata.yml` y cambia solo el comentario. Debe quedar:
  ```yaml
  lang: es
  author: "Anthony Romero-Cerdán, MD"
  title-block-banner: true
  toc: true
  toc-title: "En este caso"
  date-format: "D [de] MMMM [de] YYYY"
  format:
    html:
      css:
        - ../prospecto/estilo/prospecto.css
        - ../estilo/editorial.css
      include-after-body: ../prospecto/estilo/prospecto.html
  ```
- **`casos/index.qmd`:** portada de la serie. Toma como modelo `disenos/index.qmd`: sello, explicación breve del formato y una rejilla `.serie-grid` con las entradas, más las próximas marcadas con `.serie-item.pronto`.
- **Emblema `images/marcas/casos.svg`:** de 64 × 64, en el mismo estilo que los demás emblemas: fondo `#0B1F3A` con `rx="14"`, trazo blanco `#F5F7FA` de 4 px, acentos coral `#E5636F` y turquesa `#2A9DA3`. Una idea es un estetoscopio estilizado o una ficha clínica con un signo de interrogación. Debe ser original.
- **Menú (`_quarto.yml`):** agrega «Caso clínico estadístico» dentro del desplegable «Aprende», junto a Diseños de estudio.
- **Listados:** agrega `"casos/*/index.qmd"` a:
  - `contents` de `blog.qmd`;
  - `contents` de `index.qmd` (Lo más reciente);
  - `contents` de `temas.qmd` (si no lo agregas, las palabras clave no encontrarán estas entradas).

### 5.2 Paleta y tipografía

- **Colores:** azul marino `#0B1F3A`, azul secundario `#12305A`, coral `#E5636F`, turquesa `#2A9DA3`, papel `#FBF7EE`.
- **Tipografías:** Fraunces para los títulos e Inter para el texto, ya cargadas por `prospecto.css`.

### 5.3 Componentes disponibles

Están definidos en `prospecto/estilo/prospecto.css` y `estilo/editorial.css`; no inventes otros:

| Clase | Para qué |
|---|---|
| `.sello` | Sello de la serie al inicio |
| `.en-una-frase` | Frase central destacada |
| `.autoeval` > `.pregunta` + `<details>` | Afirmaciones con respuesta plegable |
| `.mitos` > `.mito` | Mito frente a realidad (dos columnas) |
| `.pros-contras` | Dos columnas de fortalezas y límites |
| `.diagrama` | Contenedor de un SVG propio, con `<p class="cap">` como leyenda |
| `.mapa` | Tabla con estilo (por ejemplo, una tabla 2 × 2) |
| `.usa-calc` | Llamada a una herramienta, con un emblema a la izquierda |
| `.reporte` > blockquote | Párrafo con el botón «Copiar para mi tesis» |
| `.cta` | Llamada a la asesoría por WhatsApp |
| `a.dic` / `{.dic}` | Término enlazado al diccionario, con definición emergente |

---

## 6. Enlaces internos (úsalos siempre que correspondan)

### Diccionario

`../../prospecto/diccionario.qmd#<id>` con la clase `{.dic}`:

```markdown
[odds ratio](../../prospecto/diccionario.qmd#odds-ratio){.dic}
```

**Entradas que ya existen:**

| Tema | Ids |
|---|---|
| Medidas de asociación | odds, odds-ratio, riesgo-relativo, razon-de-prevalencias, tabla-2x2 |
| Inferencia | intervalo-de-confianza, valor-p, error-estandar, nivel-de-confianza, potencia-estadistica, precision, tamano-del-efecto |
| Confusión y regresión | confusion, regresion-logistica, regresion-de-poisson, regresion-de-cox, varianza-robusta, modelo-log-binomial, estandarizacion-marginal |
| Encuestas y muestreo | conglomerado, estrato, diseno-muestral-complejo, factor-de-expansion, efecto-de-diseno, correccion-por-poblacion-finita, perdidas, endes |
| Diseño y medición | estudio-transversal, prevalencia, persona-tiempo, sensibilidad, especificidad, desviacion-estandar, mediana-y-ric, porcentaje-por-columna |
| Pruebas | prueba-de-chi-cuadrado, coeficiente-de-correlacion, correccion-de-continuidad, obesidad-abdominal |
| Agregadas el 16/10/2026 (paquete, sin integrar) | cegamiento, curva-roc, dato-censurado, efecto-hawthorne, efecto-placebo, ensayo-cruzado, error-tipo-i-y-ii, falacia-ecologica, hazard-ratio, heterogeneidad, intencion-de-tratar, intervalo-de-prediccion, metodo-de-kaplan-meier, numero-necesario-a-tratar, reduccion-absoluta-del-riesgo, regresion-a-la-media, sesgo-de-publicacion, sesgo-de-recuerdo, sesgo-de-seleccion, tasa-de-incidencia |

- Si hace falta un término nuevo, agrégalo a `prospecto/diccionario.qmd` en orden alfabético por id, con el formato de las demás entradas.
- Cada entrada nueva lleva la línea `[Fuentes: …]{.fuente}` con fuentes de la lista final del diccionario, o agrega la fuente nueva a esa lista.

### Herramientas

- **Calculadora de muestra, abre ya configurada:**
  - `../../herramientas/muestra/index.qmd#mod=prop` (una prevalencia)
  - `#mod=dprop&dis=cc` (casos y controles), `&dis=co` (cohorte), `&dis=tr` (transversal)
  - `#mod=med` (dos medias), `#mod=dx` (prueba diagnóstica), `#mod=cor` (correlación)
- **Triaje:** `../../blog/que-prueba-estadistica/index.qmd#haz-tu-triaje`

### Entradas del sitio

- **Diseños de estudio:**
  - `../../disenos/transversal/index.qmd`
  - `../../disenos/casos-y-controles/index.qmd`
  - `../../disenos/cohortes/index.qmd`
- **Prospecto R:**
  - `../../prospecto/or-vs-rp/inicial.qmd` (¿OR o RP?)
  - `../../prospecto/tabla-1/inicial.qmd` (La Tabla 1 de tu tesis)

---

## 7. Portada de cada entrada (1200 × 630)

Desde la raíz del repositorio:

```bash
CHROMIUM=/ruta/a/chromium node images/marcas/tarjeta.js casos/<slug>/portada.png \
  '{"emblema":"casos","serie":"Caso clínico estadístico","subserie":"Caso n.º 1","titulo":"¿El odds ratio es un riesgo relativo?","bajada":"Un caso, cuatro afirmaciones y la explicación de cada una."}'
```

- La tarjeta ya firma «Anthony Romero-Cerdán, MD», la web y @bioestadistica.en.linea.
- El campo `emblema` es el nombre del SVG en `images/marcas/` sin extensión; requiere que exista `casos.svg`.

---

## 8. Temas candidatos

Los títulos de la carpeta de Sedgwick sirven de inspiración. El caso y las afirmaciones deben ser propios.

1. RR frente a OR
2. Confusión en un ensayo clínico
3. NNT y NNH
4. Riesgo absoluto y relativo
5. Tasa de incidencia y persona-tiempo
6. Hazard y hazard ratio
7. Kaplan-Meier y datos censurados
8. Intervalo de confianza frente a valor p
9. Significancia clínica y estadística
10. Error tipo I y II
11. «Ausencia de evidencia no es evidencia de ausencia»
12. Desviación estándar frente a error estándar
13. Distribuciones sesgadas y pruebas no paramétricas
14. Prueba t para muestras independientes y relacionadas
15. Sesgos en transversales, en casos y controles y en cohortes
16. Sesgo de respuesta
17. Casos y controles anidado
18. Cohorte retrospectiva
19. Muestreo por conveniencia, bola de nieve, por conglomerados y multietápico
20. Unidad de análisis frente a unidad de observación
21. Falacia ecológica
22. Efecto Hawthorne
23. Efecto placebo
24. Intención de tratar frente a análisis por protocolo
25. Ensayos explicativos y pragmáticos
26. Fases del ensayo clínico
27. Cegamiento
28. Ensayo cruzado
29. Curva ROC
30. Forest plot, funnel plot, heterogeneidad y sesgo de publicación
31. Tamaño de muestra en cohortes y ensayos

Prioriza los que conectan con entradas existentes:
- RR frente a OR, que conecta con ¿OR o RP?;
- sesgos por diseño, que conectan con Diseños de estudio;
- IC frente a valor p, que conecta con el diccionario;
- Kaplan-Meier, que conecta con la entrada de cohortes y el triaje.

---

## 9. Reglas técnicas del repositorio (importante)

- **Producción:** Netlify publica la carpeta `_site` ya renderizada de la rama `master`. Netlify no renderiza.
- **Flujo de Git:**
  1. Crea una rama nueva desde `master`.
  2. Abre un PR.
  3. **Anthony une los PR él mismo:** no hagas merge.
- **Render:**
  - Renderiza archivo por archivo: `quarto render casos/<slug>/index.qmd`.
  - **No uses `quarto render` del proyecto completo** fuera de la computadora de Anthony: `about.qmd` consulta Google Scholar y `posts/Manual` usa `vembedr`. Si falla a mitad de camino, deja `_site/` incompleto. Si pasa, ejecuta `git restore _site`.
  - Las páginas de Prospecto R se renderizan con `LANG=C.UTF-8 quarto render <archivo> --use-freezer`, para no reejecutarlas.
  - Al renderizar un archivo suelto, Quarto no siempre copia los recursos actualizados (`styles.css`, `.js`, `.png`). Compáralos con `cmp` y cópialos a `_site/` si difieren.
  - Después de una entrada nueva, vuelve a renderizar los listados: `blog.qmd`, `index.qmd`, `temas.qmd` y `casos/index.qmd`.
- **Revisión visual:** antes de entregar, revisa cada página en navegador de escritorio (1280 px) y celular (390 px). Sin desbordes horizontales, sin errores en la consola, el diccionario con sus definiciones emergentes y las respuestas plegables funcionando.
- **Las fórmulas** (KaTeX) cargan desde internet: escríbelas en LaTeX normal.
- **Notas de traspaso:** documenta lo hecho en `_notas/estado-del-sitio.md`, en una sección «Serie Caso clínico estadístico», para que la siguiente conversación sepa qué existe.

---

## 10. Lista de verificación antes de entregar cada caso

- [ ] Caso original (no traducido ni parafraseado de Sedgwick); si es ilustrativo, se declara.
- [ ] Todas las cifras del caso son coherentes entre sí (totales, porcentajes, IC).
- [ ] Cada afirmación tiene una respuesta inequívoca y explicada.
- [ ] El código R se ejecutó y da las cifras del texto.
- [ ] Referencias en Vancouver, todas verificadas.
- [ ] Coma decimal en el texto, «IC 95 %», espacio antes de «%».
- [ ] Autor y firma: «Anthony Romero-Cerdán, MD».
- [ ] Categorías coherentes con las existentes; la primera es «Caso clínico estadístico».
- [ ] Términos técnicos enlazados al diccionario; enlaces a la calculadora, al triaje, a Diseños y a Prospecto R cuando correspondan.
- [ ] Portada generada; fecha distinta a las demás entradas.
- [ ] Renderizado y revisado en escritorio y celular; listados actualizados.
- [ ] Notas de traspaso actualizadas.


---

# PARTE II · ESTADO DE LA SERIE Y TRASPASO

Esta parte registra lo trabajado en la serie, lo pendiente y lo que hay que revisar. **Léela antes de tocar la serie** y **actualízala al terminar cada tarea**, en la sección 17 (registro de cambios) y en las que correspondan.

Última actualización: 16 de octubre de 2026.

## 11. Resumen del estado

- **Redactados los 29 casos** de la serie, que cubren los 31 temas de la sección 8; algunos casos cubren dos temas (ver 13).
- **Todo está fuera del repositorio.** Los casos se escribieron en una cuenta secundaria de Claude, sin commits, ramas ni PR, a pedido de Anthony. Están en el paquete `caso-clinico-estadistico.zip`.
- **Nada se ha renderizado con Quarto ni se ha revisado en el navegador.** En esa sesión no había Quarto. El código R sí se ejecutó (R 4.3.3): los 29 bloques corren sin errores y dan las cifras del texto.
- **Faltan las portadas PNG**, las ediciones a cuatro archivos existentes, el render, la revisión visual y las notas de traspaso del sitio (ver 15).
- **Calendario semanal**, todos los martes, del 20 de octubre de 2026 al 4 de mayo de 2027. Siguiente fecha libre: 11 de mayo de 2027.

## 12. Contenido del paquete

El paquete está construido sobre la rama `master` de `ganthonyr19/myblog`, commit `6e62028`, del 16 de octubre de 2026. Trae archivos nuevos y **una versión modificada de un archivo existente**, `prospecto/diccionario.qmd`:

| Ruta | Qué es |
|---|---|
| `casos/_metadata.yml` | Opciones comunes de la serie, copiadas de `disenos/_metadata.yml` con TOC «En este caso» |
| `casos/index.qmd` | Portada de la serie: sello, explicación y rejilla `.serie-grid` con los 29 casos, sin «Próximamente» |
| `casos/<slug>/index.qmd` | Un caso por carpeta; ver la tabla de la sección 13 |
| `images/marcas/casos.svg` | Emblema de 64 × 64: ficha clínica con pinza turquesa y signo de interrogación coral, en el estilo de los demás emblemas |
| `prospecto/diccionario.qmd` | **Archivo existente modificado**: las 39 entradas originales sin cambios más 20 nuevas (ver sección 6), en orden alfabético por id, y 17 fuentes nuevas al final de la lista. Si tu copia del diccionario cambió desde el commit `6e62028`, no lo reemplaces: aplica el parche |
| `_notas/diccionario-terminos-nuevos.patch` | El mismo cambio como parche: `git apply _notas/diccionario-terminos-nuevos.patch` desde la raíz (se comprobó que aplica limpio sobre `6e62028`). Quarto no publica `_notas/` |
| `vademecum/` e `images/marcas/vademecum.svg` | Serie nueva «Vademécum estadístico» (ver sección 18.1) |
| `_notas/historia-clinica-de-tu-tesis.md` | Documento de diseño de la herramienta (ver sección 18.4) |
| `CLAUDE.md` | Este archivo: las instrucciones originales (parte I), el estado de la serie (parte II) y los demás trabajos (parte III) |

Las piezas para Instagram y el Recetario **no van al repositorio**: están en un segundo paquete, `redes-y-recetario.zip` (ver secciones 18.2 y 18.3).

## 13. Los 29 casos

En la columna V/F, V es verdadera y F es falsa, en el orden a), b), c), d). Los temas usan la numeración de la sección 8.

| N.º | Slug | Título | Fecha | Temas | Fuente | V/F |
|---|---|---|---|---|---|---|
| 1 | `rr-vs-or` | ¿El odds ratio es un riesgo relativo? | 2026-10-20 | 1 | Ilustrativo (inducción del parto y cesárea) | VFVF |
| 2 | `ic-vs-valor-p` | p = 0,07: ¿la intervención no sirve? | 2026-10-27 | 8, 11 | Ilustrativo (agentes comunitarios e HTA) | FVFV |
| 3 | `kaplan-meier` | ¿Qué hago con los pacientes que se fueron? | 2026-11-03 | 7 | Ilustrativo (10 pacientes con cáncer gástrico) | FVVF |
| 4 | `nnt-y-nnh` | ¿A cuántos hay que tratar para que uno se beneficie? | 2026-11-10 | 3, 4 | Ilustrativo (tromboprofilaxis) | FVFF |
| 5 | `sesgos-por-diseno` | ¿Las madres recuerdan igual? | 2026-11-17 | 15 (casos y controles) | Ilustrativo (ITU y malformaciones) | VVFF |
| 6 | `de-vs-ee` | ¿11,2 ± 0,1 describe a los niños? | 2026-11-24 | 12 | Ilustrativo (hemoglobina en niños) | FVVV |
| 7 | `error-tipo-i-y-ii` | ¿La aspirina no sirve si eres Géminis? | 2026-12-01 | 10 | Real: ISIS-2, Lancet 1988 | FVVF |
| 8 | `itt-vs-protocolo` | ¿Funciona el fármaco si el placebo también funciona? | 2026-12-08 | 24 | Real: Coronary Drug Project, NEJM 1980 | VFVF |
| 9 | `falacia-ecologica` | ¿Comer chocolate te acerca al Nobel? | 2026-12-15 | 21, 20 | Real: Messerli, NEJM 2012 | VFFV |
| 10 | `curva-roc` | ¿Qué punto de corte elijo para el PSA? | 2026-12-22 | 29 | Real: Thompson et al., JAMA 2005 (PCPT) | VFFV |
| 11 | `cegamiento` | ¿Importa quién evalúa al paciente? | 2026-12-29 | 27 | Real: Noseworthy et al., Neurology 1994 | VVVF |
| 12 | `sesgo-de-publicacion` | ¿Dónde están los ensayos negativos? | 2027-01-05 | 30 (sesgo de publicación, funnel) | Real: Turner et al., NEJM 2008 | VVFF |
| 13 | `efecto-hawthorne` | ¿Nos lavamos más las manos cuando nos miran? | 2027-01-12 | 22 | Real: Srigley et al., BMJ Qual Saf 2014 | VVFV |
| 14 | `ensayo-cruzado` | ¿Y si cada paciente es su propio control? | 2027-01-19 | 28, 14 | Real: PATH-BP, Circulation 2022 | FVFF |
| 15 | `sesgo-de-respuesta` | ¿Quién acepta participar? | 2027-01-26 | 16 | Real: UK Biobank, Fry et al., Am J Epidemiol 2017 | FVVF |
| 16 | `hazard-ratio` | ¿Qué significa un hazard ratio de 0,86? | 2027-02-02 | 6 | Real: EMPA-REG OUTCOME, NEJM 2015 | FFVV |
| 17 | `confusion` | ¿Por qué el ensayo contradijo a la cohorte? | 2027-02-09 | 2 | Real: Nurses' Health Study 1996 y WHI 2002 | VFVF |
| 18 | `muestreo-por-conveniencia` | ¿Quién responde a un anuncio en Facebook? | 2027-02-16 | 19 | Real: Bendavid et al., preprint de medRxiv 2020 | VFVV |
| 19 | `tasa-de-incidencia` | ¿Porcentaje o tasa? | 2027-02-23 | 5 | Real: iPrEx, NEJM 2010 (con sedes en el Perú) | VFFV |
| 20 | `significancia-clinica` | ¿Significativo es lo mismo que importante? | 2027-03-02 | 9 | Real: CLARITY AD (lecanemab), NEJM 2023 | FVVF |
| 21 | `ensayos-pragmaticos` | ¿Funciona en la vida real? | 2027-03-09 | 25 | Real: Salford Lung Study, NEJM 2016 | FFVF |
| 22 | `efecto-placebo` | ¿Operar o fingir que se opera? | 2027-03-16 | 23 | Real: Moseley et al., NEJM 2002 | FVVV |
| 23 | `distribuciones-sesgadas` | ¿La media de la bilirrubina describe al paciente típico? | 2027-03-23 | 13 | Real: datos `pbc` del ensayo de la Clínica Mayo (paquete `survival`) | VFVV |
| 24 | `fases-del-ensayo` | ¿Por qué la fase 1 empieza con tan pocos voluntarios? | 2027-03-30 | 26 | Real: TGN1412, NEJM 2006 | VVVF |
| 25 | `casos-y-controles-anidado` | ¿Un estudio de casos y controles dentro de una cohorte? | 2027-04-06 | 17 | Real: Lee et al., JAMA Intern Med 2015 | VVFF |
| 26 | `cohorte-retrospectiva` | ¿Se puede seguir hacia adelante con datos del pasado? | 2027-04-13 | 18 | Real: Hviid et al., Ann Intern Med 2019 | VFVV |
| 27 | `tamano-de-muestra` | ¿Cuántos pacientes necesito para replicar un ensayo? | 2027-04-20 | 31 | Cálculo hipotético con cifras reales del EMPA-REG | FVVV |
| 28 | `forest-plot` | ¿Cómo se lee un forest plot? | 2027-04-27 | 30 (forest plot, heterogeneidad) | Real: Colditz et al., JAMA 1994 (datos `dat.bcg` de `metafor`) | VFFV |
| 29 | `sesgos-transversales-y-cohortes` | ¿Beber poco alarga la vida? | 2027-05-04 | 15 (transversal y cohorte) | Real: Stockwell et al., J Stud Alcohol Drugs 2016 | FVFV |

**Simulaciones declaradas.** En los casos 8, 11, 14, 17, 22 y 29, el bloque «En R» es una simulación, y el texto lo dice. En los demás, el código usa las cifras del caso o datos reales incluidos en paquetes de R.

**Dependencias de R para el render:** `survival` (casos 3 y 23) y `metafor` (caso 28). En los demás casos basta R base.

**Categorías usadas.** Todas ya existen en el sitio, salvo «Caso clínico estadístico»: Epidemiología, Diseños de estudio, Pruebas estadísticas, Tamaño de muestra, Tesis, medidas de asociación, estadística descriptiva y estudios transversales. Las tres últimas van en minúscula, como en el sitio.

## 14. Puntos por revisar (antes de publicar)

1. **Coincidencia con Sedgwick.** Contrasta los estudios reales con los PDF de `P. SEDGWICK/`. Varios son ejemplos clásicos (ISIS-2, el chocolate, Hawthorne, la BCG) y él pudo usarlos. Si alguno coincide, el texto sigue siendo original, pero conviene cambiar de estudio para que no parezca una adaptación.
2. **Caso 8 (Coronary Drug Project).** La mortalidad por adherencia está redondeada al entero (15 %, 25 %, 15 %, 28 %). Si tienes el artículo de 1980, pon los decimales exactos.
3. **Caso 11 (cegamiento).** No se da el número de pacientes, porque ninguna fuente consultada lo reportaba. Puede agregarse desde el artículo original.
4. **Caso 18 (Santa Clara).** Se cita el preprint de medRxiv de abril de 2020. Existe una versión publicada en *Int J Epidemiol* en 2021, pero no se verificaron su volumen, sus páginas ni si sus cifras coinciden.
5. **Caso 19 (iPrEx).** El artículo no reporta el persona-tiempo de cada grupo. Se usó la tasa global (100/3324), y el cociente 36/64 se presenta como aproximación.
6. **Caso 20 (lecanemab).** No se da una cifra de diferencia mínima clínicamente importante para la escala CDR-SB, porque no se pudo verificar la fuente; el texto dice que su relevancia «ha sido debatida». Si encuentras una referencia sólida, puede agregarse.
7. **Caso 26 (Hviid).** Dos fuentes secundarias dan como límite superior del IC 1,02, y el resumen original podría decir 1,01. El texto evita la cifra y dice que el IC «incluía el 1». Si tienes el artículo, puedes poner el IC exacto.
8. **Listas de autores.** En algunas referencias, los autores después del tercero se completaron de memoria con alta confianza, sin verificarlos uno por uno: Zinman (casos 16 y 27), Rossouw (17), Grant (19), van Dyck (20), Vestbo (21), Moseley (22) y Stockwell (29). Revísalos en PubMed.
9. **Caso 3.** En la tabla, la supervivencia a los 4 meses (0,7875) se redondeó a 0,788, mientras que R la imprime como 0,787.
10. **Emblema `casos.svg`.** Está dibujado a mano; revísalo junto a los demás emblemas.
11. **Ubicación de este CLAUDE.md.** Si está en la raíz del repo, confirma que Quarto no lo publique en un render completo. El README.md de la raíz no se publica, pero no se comprobó qué pasa con otros `.md`.
12. **Definiciones nuevas del diccionario.** Las 20 entradas agregadas el 16/10/2026 son resúmenes propios con fuentes verificadas; revisa que el tono y la extensión te convengan, como con las demás definiciones del diccionario.
13. **Términos que siguen sin entrada.** Diferencia mínima clínicamente importante, efecto de arrastre, sesgo del exbebedor enfermo, sesgo de prevalencia-incidencia, efecto del voluntario sano y muestreo por densidad de incidencia aparecen en los casos sin enlace. Pueden agregarse si se repiten en otras entradas del sitio.

## 15. Pendientes para integrar en el repositorio

En orden. Hazlo en una rama nueva desde `master`, abre un PR y deja que Anthony haga el merge (sección 9).

1. **Copiar los archivos nuevos** del paquete con sus rutas (sección 12) y **aplicar el parche del diccionario** (o reemplazar `prospecto/diccionario.qmd` si tu copia no cambió). Después, renderizar `prospecto/diccionario.qmd`, porque las definiciones emergentes se leen de la página publicada.
2. **Editar `_quarto.yml`**: dentro de «Aprende», debajo de Diseños de estudio, agregar:
   ```yaml
             - text: Caso clínico estadístico
               href: casos/index.qmd
   ```
3. **Agregar `- "casos/*/index.qmd"`** en `contents` de `blog.qmd`, `index.qmd` y `temas.qmd`, debajo de la línea de `disenos`.
4. **Generar las portadas** (sección 7): `casos/portada.png` y `casos/<slug>/portada.png` de los 29 casos. Usa `"emblema":"casos"`, `"serie":"Caso clínico estadístico"`, `"subserie":"Caso n.º N"`, el título del caso como `"titulo"` y, como `"bajada"`, «Un caso, cuatro afirmaciones y la explicación de cada una.». Para la portada de la serie: `"subserie":"Un caso, cuatro afirmaciones"` y `"bajada":"Pon a prueba tu criterio estadístico antes de defender tu tesis."`.
5. **Renderizar archivo por archivo**: `casos/index.qmd` y cada caso; después, `blog.qmd`, `index.qmd` y `temas.qmd`. Compara los recursos con `cmp` (sección 9).
6. **Revisión visual** en 1280 px y 390 px: respuestas plegables, definiciones emergentes del diccionario, tablas `.mapa` sin desborde, el forest plot del caso 28 y los gráficos de los casos 3, 10 y 23.
7. **Notas de traspaso**: agregar a `_notas/estado-del-sitio.md` una sección «Serie Caso clínico estadístico» que resuma este archivo.
8. **Lista de verificación** de la sección 10 para cada caso.

## 16. Decisiones tomadas y preferencias de Anthony

- **Fuentes.** Anthony pidió preferir **estudios reales, no necesariamente peruanos**, y no ser rígidos. Los casos 1 a 6 son ilustrativos y lo declaran en la primera línea de «El caso». Los demás son reales y se identifican igual: «*Estudio real: …*».
- **Verificación.** Cada cifra de un estudio real se tomó de su resumen o de una fuente secundaria confiable. Cuando no se pudo verificar un dato, no se puso (casos 11, 19, 20 y 26).
- **Formato.** Coma decimal en el texto y punto en el código R; «IC 95 %» con espacio antes de «%»; sin `subtitle`.
- **Tablas.** Se usan con HTML y la clase `mapa`, como en `disenos/`.
- **Respuestas.** El patrón de verdaderas y falsas se varió entre casos; ninguno se repite más de cuatro veces.
- **Enlaces.** Se comprobó que todos los enlaces internos (diseños, Prospecto R, calculadora, triaje y otros casos) apuntan a archivos existentes en el commit `6e62028`, y que los 48 ids del diccionario que usan los casos existen en el diccionario del paquete.
- **Diccionario.** Los términos nuevos se enlazan en su primera aparición dentro de las explicaciones o del caso, nunca en el enunciado de una afirmación.
- **Extensión.** Cada caso tiene entre 660 y 840 palabras, contadas desde «El caso» hasta antes de las referencias, sin código.
- **Flujo de trabajo en la cuenta secundaria.** No se hacen commits ni PR; se entrega el paquete y Anthony lo pasa a su cuenta principal.

## 17. Registro de cambios

Agrega una línea por cada tarea, con la fecha.

- **2026-10-16.** Se montó la serie (metadatos, portada y emblema) y se redactaron los casos 1 a 29 en una cuenta secundaria, sin tocar el repositorio. Se verificaron las referencias y se ejecutó el código R de todos los casos. Se reordenaron las afirmaciones de los casos 15, 16, 25 y 29 para variar el patrón de respuestas. Se creó la parte II de este archivo.
- **2026-10-16.** Se agregaron 20 términos al diccionario (`prospecto/diccionario.qmd`), con 17 fuentes nuevas, y se enlazaron en 18 casos (22 enlaces). Se generó el parche `_notas/diccionario-terminos-nuevos.patch`.
- **2026-10-16.** Se crearon el Vademécum estadístico (4 fichas), las piezas para Instagram de los 29 casos (174 imágenes de carrusel, 29 recetas y el calendario con textos), el Recetario del tesista en PDF y el documento de diseño de «Historia clínica de tu tesis». Se agregó la parte III de este archivo.
- **2026-10-23.** Se anotó la idea de Anthony de una sección de temas de tesis para pregrado (sección 18.6), sin desarrollar.


---

# PARTE III · OTROS TRABAJOS DE LA CUENTA SECUNDARIA

## 18. Trabajos adicionales (16/10/2026)

Anthony pidió avanzar, además de los casos, las ideas que se pudieran hacer sin tocar el repositorio. Todo sigue el mismo método: paquete fuera del repositorio, sin commits ni PR.

### 18.1 Vademécum estadístico (`vademecum/`, va al repositorio)

Serie nueva: cada prueba estadística descrita como la monografía de un fármaco (indicación, mecanismo de acción, contraindicaciones, posología, interacciones, reacciones adversas frecuentes en tesis, presentación en R, cómo reportarlo y diagnóstico diferencial). Complementa al triaje: el triaje da la receta corta y la ficha, todo lo demás.

| Ficha | Ruta | Fecha propuesta |
|---|---|---|
| 1. Chi cuadrado y prueba exacta de Fisher | `vademecum/chi-cuadrado/` | 2026-10-22 |
| 2. Prueba t para dos muestras independientes | `vademecum/t-de-welch/` | 2026-10-29 |
| 3. U de Mann-Whitney | `vademecum/u-de-mann-whitney/` | 2026-11-05 |
| 4. Correlación de Pearson y de Spearman | `vademecum/correlacion/` | 2026-11-12 |

- **Fechas:** los jueves, para no coincidir con los casos (martes).
- **Datos:** todos los ejemplos usan la base `pbc` del paquete `survival` (ensayo real de la Clínica Mayo, 312 pacientes), igual que el caso n.º 23. El código se ejecutó y da las cifras del texto.
- **Portada de la serie** (`vademecum/index.qmd`): rejilla con las 4 fichas y 4 «Próximamente» (ANOVA y Kruskal-Wallis, t pareada y Wilcoxon, McNemar, Poisson con varianza robusta).
- **Categorías:** «Vademécum estadístico» (nueva), Pruebas estadísticas y Tesis.
- **Emblema:** `images/marcas/vademecum.svg` (cápsula con barras), en el estilo de los demás.
- **Para integrar**, en la misma rama que los casos:
  1. Agregar «Vademécum estadístico» al menú «Aprende» de `_quarto.yml` (`href: vademecum/index.qmd`).
  2. Agregar `- "vademecum/*/index.qmd"` a `contents` de `blog.qmd`, `index.qmd` y `temas.qmd`.
  3. Generar las portadas con `"emblema":"vademecum"`, `"serie":"Vademécum estadístico"` y `"subserie":"Ficha n.º N"`.
  4. Renderizar archivo por archivo y revisar en 1280 y 390 px (sobre todo los bloques `.usa-calc` y `.reporte`).
- **Por revisar:**
  - Se comparó cada ficha con su receta de `triaje.js` (t, Mann-Whitney, chi cuadrado, Pearson y Spearman) y no se contradicen. Un matiz: el ejemplo de reporte de Pearson del triaje dice «moderada», mientras que la ficha de correlación recomienda no depender de esas etiquetas. Conviene armonizarlo.
  - Las referencias se verificaron, salvo que Kirkwood, Cochran (1954) y Lumley (2002) se tomaron de las referencias que ya usa la entrada del triaje.

### 18.2 Piezas para Instagram (`redes/`, no va al repositorio)

| Contenido | Detalle |
|---|---|
| `carruseles/NN-slug/` | 29 carruseles de 6 imágenes de 1080 × 1350: portada, las 4 afirmaciones y un cierre con el enlace al caso |
| `recetas/` | 29 tarjetas «Receta del día» de 1080 × 1350 con la frase Rp/ de cada caso |
| `calendario-instagram.md` | Textos listos para copiar: pie del carrusel (martes), 5 historias con encuesta y respuestas (miércoles) y pie de la receta (viernes), con fechas sincronizadas con la web |
| `calendario-instagram.csv` | El mismo calendario en tabla (87 publicaciones) |
| `casos.json` | Datos extraídos de los 29 casos (afirmaciones, respuestas, recetas, diagnósticos diferenciales) |
| `plantilla/` | `ig.html` (plantilla con las fuentes y colores del sitio), `generar.js` (Playwright) y los logos |

- **Regenerar** tras editar un caso: `python3 plantilla/extraer.py <ruta>/casos casos.json` y después `node plantilla/generar.js casos.json .` (con `CHROMIUM=/ruta` si hace falta). Se puede generar un solo caso añadiendo su número al final.
- **Logo:** `logo-bel.png` es blanco; para fondos claros se generó `logo-oscuro.png` (mismo logo recoloreado en azul marino). Revisa que te guste.
- **Las historias** solo dicen verdadera o falsa y envían a la web para el porqué. Las encuestas se arman en Instagram con el sticker de encuesta.
- **Los enlaces** `anthonyromero.netlify.app/casos/<slug>` solo funcionarán cuando los casos estén publicados: no publiques un carrusel antes que su caso.

### 18.3 Recetario del tesista (`recetario/`, no va al repositorio)

- `recetario-del-tesista.pdf`: 38 páginas A5 (portada, cómo usarlo e índice, 6 separadores por tema, 29 recetas con su diagnóstico diferencial y un código QR al caso, y contraportada con la llamada a la asesoría).
- Se regenera con `python3 construir.py && node imprimir.js` (lee `redes/casos.json`).
- **Pendiente de decidir:** cómo entregarlo a cambio del correo. Como el sitio está en Netlify, una opción sin servidor es un formulario de Netlify Forms en una página del sitio (por ejemplo, `recursos/recetario.qmd`) que muestre el enlace de descarga al enviarse. No se implementó.
- **Los códigos QR** apuntan a `https://anthonyromero.netlify.app/casos/<slug>/`: el PDF solo debe difundirse cuando los 29 casos estén publicados, o habrá que regenerarlo con menos recetas.

### 18.4 Historia clínica de tu tesis (`_notas/historia-clinica-de-tu-tesis.md`, va al repositorio)

Documento de diseño de la herramienta propuesta para el Consultorio: flujo de 9 preguntas, reglas de decisión (diseño, medida, modelo, prueba, tamaño de muestra, guía de reporte, observaciones del jurado), formato de la epicrisis, técnica (mismo patrón que el triaje, sin servidor), casos de prueba y fases. **No hay código**: conviene programarla en la cuenta principal, donde se puede probar en el navegador. Al final del documento hay tres decisiones pendientes para Anthony.

### 18.5 Ideas propuestas y aún no trabajadas

- **«Interconsulta»:** responder cada semana una duda real de tesis enviada por seguidores, sin datos que identifiquen al autor.
- **«Atlas de bases peruanas»:** guía práctica de la ENDES, la ENAHO y otras bases (módulos, uniones, factores de expansión). Requiere verificar la documentación del INEI.
- **«Errata de guardia»:** errores reales vistos en tesis, anonimizados, para redes. Requiere los ejemplos de Anthony.
- **«Kit de la tesis»:** plantilla de proyecto en RStudio y Quarto.

### 18.6 Idea de Anthony: temas de tesis para pregrado (23/10/2026)

**Propuesta de Anthony.** Una sección, probablemente para redes, que proponga temas de tesis de pregrado de forma informativa e interesante. «Inspiración» es un nombre provisional; el definitivo está por decidir. Aún no se trabajó.

**Sugerencias para desarrollarla** (por validar con Anthony):

- **Nombres coherentes con la analogía clínica:** «Interconsulta de temas», «Diagnóstico presuntivo», «Hallazgo incidental», «Casos para tu tesis».
- **Formato de cada propuesta, como una ficha breve:**
  - Pregunta de investigación.
  - Por qué importa en el Perú, con un dato verificado y su fuente.
  - Diseño sugerido y fuente de datos posible (ENDES, ENAHO, registros, historias clínicas, recojo propio).
  - Variables principales y medida de asociación.
  - Nivel de dificultad y tiempo aproximado.
  - Un riesgo o una advertencia del jurado.
  - Enlaces a Diseños de estudio, al Vademécum, a los casos y a la calculadora.
- **Formatos posibles:**
  - **Redes:** carrusel «Tema de la semana».
  - **Web:** una página que reúna y filtre todas las fichas por área (salud pública, materno-infantil, crónicas, salud mental), por fuente de datos y por dificultad.
- **Rigor:**
  - Todo dato de contexto, como prevalencias o brechas, debe verificarse con su fuente; no se inventan cifras.
  - Antes de proponer un tema, revisar que no esté ya muy estudiado en el Perú, para no empujar a los tesistas hacia temas repetidos.
  - Que las preguntas sean factibles para un tesista de pregrado, en tiempo, acceso a datos y ética.
  - Con bases públicas como la ENDES y la ENAHO, aclarar que el análisis debe considerar el diseño muestral complejo.
- **Conexión con la asesoría:** cada ficha puede cerrar con «¿Te interesa este tema? Te ayudo a convertirlo en proyecto», con un mensaje de WhatsApp propio para medir de dónde llegan los contactos.

- **2026-10-26.** Integrado en el repositorio (rama `casos-y-vademecum`): pasos 1 a 7 de la sección 15 y los de 18.1. Publicación escalonada con `_notas/publicar-por-fecha.py`; al 26/10 solo están publicados el caso n.º 1 y la ficha n.º 1. Las tablas `.mapa` se envolvieron en `overflow-x:auto`. Este archivo se guardó como `_notas/series-casos-y-vademecum.md` (no en la raíz, porque Quarto publicaría un `.md` suelto).
