# «Historia clínica de tu tesis» · Documento de diseño

Herramienta interactiva para el **Consultorio estadístico**. Estado: diseño aprobado para prototipar; **sin código todavía**. Escrito el 16 de octubre de 2026 en la cuenta secundaria de Claude, para programarse en la cuenta principal, donde se puede probar en el navegador.

## 1. Idea

El tesista llena una **anamnesis** de su proyecto: objetivo, diseño, desenlace, exposición, población y datos. La herramienta responde con una **epicrisis**, el resumen que necesita para su plan de análisis:

1. El diseño que describió, con sus límites.
2. La medida de asociación que corresponde.
3. La prueba o el modelo estadístico.
4. El tamaño de muestra, con la calculadora ya configurada.
5. La guía de reporte que debe seguir (STROBE, CONSORT, STARD, etc.).
6. Un párrafo de plan de análisis para copiar en su proyecto.
7. Las «observaciones del jurado» más probables para su caso.
8. Las lecturas del sitio que le corresponden: diseño, ficha del Vademécum, casos y Prospecto R.

Es el producto que une todo el sitio en un solo flujo, y termina en la asesoría por WhatsApp.

## 2. Ubicación y nombre

- Ruta: `herramientas/historia-clinica/index.qmd`, tercer módulo del Consultorio (después de Muestra y Triaje).
- Emblema nuevo: `images/marcas/historia.svg` (por ejemplo, una carpeta de historia clínica con una línea de pulso).
- Agregarla a `herramientas/index.qmd` y a `recursos.qmd`, igual que los otros módulos.

## 3. Flujo de la anamnesis

Una pregunta por pantalla, con una barra de progreso y la opción de volver atrás. Las opciones son botones, como en el triaje. Entre corchetes va la clave interna.

| Paso | Pregunta | Opciones |
|---|---|---|
| 1 | ¿Qué quieres lograr con tu tesis? | Describir una frecuencia o una característica [desc] · Buscar una asociación o un factor de riesgo [asoc] · Evaluar el efecto de una intervención [interv] · Evaluar una prueba diagnóstica [dx] · Resumir estudios publicados [rs] |
| 2 | ¿Tú asignas la intervención? (solo si 1 = interv) | Sí, al azar [eca] · Sí, sin azar [cuasi] · No, ya la recibían [obs] |
| 3 | ¿Cómo eliges a los participantes? (si 1 = asoc u obs) | Por la exposición y los sigo [cohorte] · Por el desenlace (casos y controles) [cc] · Todos a la vez, sin seguimiento [trans] |
| 4 | ¿El seguimiento ya ocurrió? (si cohorte) | Sí, uso registros o historias clínicas [retro] · No, los seguiré desde ahora [pros] |
| 5 | ¿Cómo es tu desenlace principal? | Sí/no [bin] · Numérico [num] · Tiempo hasta un evento [tiempo] · Conteo de eventos [conteo] · Ordinal o escala [ord] |
| 6 | ¿Cuántos grupos comparas? (si no hay regresión) | Dos [2] · Tres o más [3+] · Ninguno: es una sola variable numérica frente a otra [cor] |
| 7 | ¿Son las mismas personas medidas más de una vez? | Sí [par] · No [ind] |
| 8 | ¿De dónde vienen tus datos? | Los recojo yo [primaria] · Historias clínicas o registros [secundaria] · Una encuesta nacional (ENDES, ENAHO) [encuesta] |
| 9 | ¿Quieres ajustar por otras variables (edad, sexo, etc.)? | Sí [ajuste] · No [cruda] |

Las preguntas 2, 3, 4 y 6 aparecen solo cuando corresponden. En la práctica, cada tesista responde entre 5 y 8 preguntas.

## 4. Reglas de decisión (la «epicrisis»)

### 4.1 Diseño

| Respuestas | Diseño | Enlace |
|---|---|---|
| desc + trans | Estudio transversal descriptivo | `disenos/transversal/` |
| asoc + trans | Estudio transversal analítico | `disenos/transversal/` |
| asoc + cohorte + retro/pros | Cohorte retrospectiva o prospectiva | `disenos/cohortes/`, caso n.º 26 |
| asoc + cc | Casos y controles | `disenos/casos-y-controles/`, casos n.º 5 y 25 |
| interv + eca | Ensayo clínico aleatorizado | casos n.º 8, 11, 21 y 24 |
| interv + cuasi | Cuasiexperimental (antes y después o con control no aleatorio) | caso n.º 22 (regresión a la media) |
| dx | Estudio de prueba diagnóstica | caso n.º 10 |
| rs | Revisión sistemática o metaanálisis | casos n.º 12 y 28 |

### 4.2 Medida de asociación y modelo

| Diseño + desenlace | Medida | Modelo si hay ajuste | Enlace |
|---|---|---|---|
| Transversal + bin | Razón de prevalencias | Poisson con varianza robusta | Prospecto R «¿OR o RP?» |
| Cohorte + bin (seguimiento igual) | Riesgo relativo | Poisson con varianza robusta o log-binomial | caso n.º 1 |
| Cohorte + tiempo | Hazard ratio | Regresión de Cox | casos n.º 3 y 16 |
| Cohorte + conteo o seguimiento distinto | Razón de tasas | Poisson con persona-tiempo | caso n.º 19 |
| Casos y controles + bin | Odds ratio | Regresión logística (condicional si hay emparejamiento) | caso n.º 25 |
| ECA + bin | RR, diferencia de riesgos y NNT | Poisson con varianza robusta | caso n.º 4 |
| Cualquier diseño + num | Diferencia de medias | Regresión lineal | ficha t de Welch |
| dx | Sensibilidad, especificidad, AUC | Curva ROC | caso n.º 10 |

### 4.3 Prueba bivariada

Reutilizar el árbol del triaje (`blog/que-prueba-estadistica/triaje.js`): las respuestas 5, 6 y 7 llevan a la misma receta (`R:chi`, `R:t`, `R:mw`, etc.). No hay que duplicar la lógica; conviene extraer el objeto `R` del triaje a un archivo compartido.

### 4.4 Tamaño de muestra

Enlace a la calculadora ya configurada según el diseño, con los anclajes que ya existen:

| Diseño | Enlace |
|---|---|
| desc | `herramientas/muestra/index.qmd#mod=prop` |
| trans + bin | `#mod=dprop&dis=tr` |
| cohorte o ECA + bin | `#mod=dprop&dis=co` |
| cc | `#mod=dprop&dis=cc` |
| num, dos grupos | `#mod=med` |
| cor | `#mod=cor` |
| dx | `#mod=dx` |
| tiempo | Por ahora no hay módulo; mostrar la nota de la fórmula de Schoenfeld (caso n.º 27) |

### 4.5 Guía de reporte

| Diseño | Guía |
|---|---|
| Transversal, cohorte, casos y controles | STROBE |
| Ensayo clínico | CONSORT |
| Prueba diagnóstica | STARD |
| Revisión sistemática | PRISMA |

### 4.6 «Observaciones del jurado» (reglas)

Cada regla se activa con una combinación de respuestas. Ejemplos:

| Condición | Observación |
|---|---|
| trans + asoc | «No uses la palabra "factor de riesgo" con sentido causal: no hay secuencia temporal» (caso n.º 29). |
| trans + bin + ajuste | «El OR exagera la asociación si el desenlace es frecuente: reporta la RP» (caso n.º 1). |
| cohorte + secundaria | «Discute la calidad de los registros y las pérdidas» (caso n.º 26). |
| cc + primaria | «Mide la exposición igual en casos y controles; cuidado con el sesgo de recuerdo» (caso n.º 5). |
| encuesta | «Usa el diseño muestral complejo: factor de expansión, conglomerados y estratos» (Prospecto R). |
| eca | «Analiza por intención de tratar y declara el cegamiento» (casos n.º 8 y 11). |
| cuasi | «Sin grupo control aleatorio, la mejoría puede ser regresión a la media» (caso n.º 22). |
| num + desc | «Si la variable es asimétrica, describe con mediana y RIC» (caso n.º 23). |
| par | «Analiza como datos pareados» (caso n.º 14). |

## 5. Salida (la epicrisis)

Una tarjeta con el estilo del sitio (`.en-una-frase`, `.mapa`, `.usa-calc`, `.reporte`), en este orden:

1. **Resumen** en una línea: «Cohorte retrospectiva con desenlace binario y ajuste por confusores».
2. **Diagnóstico** (diseño), **tratamiento** (medida y modelo) y **exámenes auxiliares** (prueba bivariada y tamaño de muestra).
3. **Plan de análisis** en un bloque `.reporte`, con el botón «Copiar para mi tesis». Usar marcas amarillas para lo que el tesista debe completar, como hace la calculadora. Ejemplo de plantilla:

   > Se describirán las variables categóricas con frecuencias y porcentajes, y las numéricas con media y desviación estándar o mediana y rango intercuartílico, según su distribución. La asociación entre [exposición] y [desenlace] se evaluará con [prueba bivariada]. Para estimar el [medida de asociación] ajustado por [confusores], se usará [modelo]. Se considerará un nivel de significancia de 0,05 y se reportarán intervalos de confianza al 95 %. El análisis se realizará en R versión [versión].

4. **Observaciones del jurado** que apliquen (sección 4.6).
5. **Lecturas recomendadas**: diseño, ficha del Vademécum, casos y Prospecto R.
6. **Llamada a la asesoría** con un botón «Enviar mi epicrisis por WhatsApp». El mensaje prellenado incluye el resumen de una línea, codificado en la URL, para que Anthony sepa de inmediato el caso del tesista.

## 6. Técnica

- **Mismo patrón que el triaje:** HTML fijo en el `.qmd` y un archivo `historia.js` con el árbol de preguntas, las reglas y las plantillas. Sin dependencias externas.
- **Sin servidor y sin guardar datos.** Todo ocurre en el navegador. Opcionalmente, el estado puede guardarse en `localStorage`, dentro de un `try/catch`, para no perder el avance al recargar.
- **Enlaces compartibles:** codificar las respuestas en el ancla (`#r=asoc,cohorte,retro,bin,ind,secundaria,ajuste`) para que la epicrisis se pueda compartir o retomar, igual que los enlaces preconfigurados de la calculadora.
- **Términos con definición emergente:** usar `a.dic` en el HTML fijo para que `prospecto.html` los reconozca.
- **Accesibilidad:** botones navegables con teclado y foco visible; contraste suficiente en el modo oscuro del sitio.

## 7. Casos de prueba (antes de publicar)

| Respuestas | Debe recomendar |
|---|---|
| asoc, trans, bin, ind, encuesta, ajuste | Transversal analítico; RP con Poisson y diseño complejo; `#mod=dprop&dis=tr`; STROBE; observaciones sobre el OR y el diseño muestral |
| asoc, cohorte, retro, tiempo, ind, secundaria, ajuste | Cohorte retrospectiva; HR con Cox; nota de Schoenfeld; STROBE |
| asoc, cc, bin, ind, primaria, ajuste | Casos y controles; OR con regresión logística; `#mod=dprop&dis=cc`; observación sobre el sesgo de recuerdo |
| interv, eca, num, 2, ind, primaria, cruda | ECA; diferencia de medias con t de Welch; `#mod=med`; CONSORT; intención de tratar |
| interv, cuasi, num, par, primaria, cruda | Cuasiexperimental; t pareada; observación sobre la regresión a la media |
| dx, bin, primaria | Prueba diagnóstica; sensibilidad, especificidad y AUC; `#mod=dx`; STARD |
| desc, trans, num, primaria | Transversal descriptivo; media y DE o mediana y RIC; `#mod=prop` no aplica, revisar si hace falta `#mod=med` |

El último caso muestra un vacío: para estimar una media no hay módulo en la calculadora. Decidir si se agrega o si se muestra una nota.

## 8. Fases

1. **Prototipo** con los pasos 1, 3, 5, 7 y 9 y las reglas de las secciones 4.1 a 4.3.
2. **Versión completa** con el tamaño de muestra, la guía de reporte, las observaciones y el plan de análisis.
3. **Medición:** agregar al mensaje de WhatsApp una marca de origen («Hola, hice la historia clínica de mi tesis en tu web…») para saber cuántos contactos llegan por aquí.

## 9. Pendientes de decisión para Anthony

- Nombre final: «Historia clínica de tu tesis», «Anamnesis de tu tesis» u otro.
- Si la epicrisis se puede descargar en PDF. Es útil para el tesista, pero exige más trabajo.
- Si se incluye una pregunta sobre la universidad o la escuela, para personalizar las observaciones.
