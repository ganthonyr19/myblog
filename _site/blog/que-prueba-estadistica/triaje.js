/* Triaje estadístico · Consultorio estadístico · Anthony Romero Cerdán · MIT
   Árbol de preguntas → «receta» con la prueba, cuándo usarla, alternativas,
   código en R y cómo reportarla. */
(function () {
  "use strict";
  var DIC = "../../prospecto/diccionario.html#";
  var P1 = "../../prospecto/or-vs-rp/inicial.html", P2 = "../../prospecto/tabla-1/inicial.html";
  var CALC = "../../herramientas/muestra/index.html";

  // ---------------- preguntas ----------------
  var Q = {
    inicio: { t: "¿Qué quieres hacer con tus datos?", o: [
      ["Describir a mis participantes o estimar una frecuencia", "desc"],
      ["Comparar grupos o ver si dos variables se relacionan", "comp"],
      ["Medir una asociación ajustando por otras variables", "ajus"],
      ["Evaluar una prueba diagnóstica o la concordancia entre mediciones", "dx"] ] },
    desc: { t: "¿Qué tipo de variable quieres describir?", o: [
      ["Categórica (sexo, sí/no, nivel educativo)", "R:desc_cat"],
      ["Numérica (edad, hemoglobina, días de estancia)", "R:desc_num"] ] },
    comp: { t: "¿Qué tipo de variable es la que comparas entre los grupos (el desenlace)?", o: [
      ["Categórica: sí/no o varias categorías", "comp_cat"],
      ["Numérica", "comp_num"],
      ["Tiempo hasta que ocurre un evento (supervivencia)", "R:km"] ] },
    comp_cat: { t: "¿Los grupos son personas distintas o las mismas personas medidas más de una vez?", o: [
      ["Personas distintas (grupos independientes)", "R:chi"],
      ["Las mismas personas medidas dos veces, o pares emparejados", "R:mcnemar"],
      ["Las mismas personas medidas tres o más veces", "R:cochran"] ] },
    comp_num: { t: "¿Qué estás comparando exactamente?", o: [
      ["Dos grupos de personas distintas", "dist2"],
      ["Tres o más grupos de personas distintas", "dist3"],
      ["La misma persona en dos momentos (antes y después)", "dist2p"],
      ["La misma persona en tres o más momentos", "dist3p"],
      ["Dos variables numéricas entre sí (¿se relacionan?)", "distcor"] ] },
    ajus: { t: "¿Qué tipo de desenlace tienes?", o: [
      ["Binario: sí/no", "ajus_bin"],
      ["Numérico", "R:lineal"],
      ["Un conteo (número de eventos, de visitas)", "R:conteo"],
      ["Tiempo hasta un evento", "R:cox"] ] },
    ajus_bin: { t: "¿Cuál es el diseño de tu estudio?", o: [
      ["Transversal o cohorte", "R:poisson"],
      ["Casos y controles", "R:logistica"] ] },
    dx: { t: "¿Qué quieres evaluar?", o: [
      ["Qué tan bien una prueba detecta una enfermedad frente a un estándar de referencia", "R:validez"],
      ["Si dos observadores (o dos métodos) coinciden al clasificar en categorías", "R:kappa"],
      ["Si dos mediciones numéricas coinciden (dos equipos, dos evaluadores)", "R:cci"] ] }
  };
  // la pregunta de la distribución se repite para las comparaciones numéricas
  function preguntaDist(par, nopar) {
    return { t: "¿La variable tiene una distribución más o menos simétrica, sin valores extremos? (Mira su histograma.)", o: [
      ["Sí, o la muestra es grande (más de 30 por grupo, aproximadamente)", "R:" + par],
      ["No: está muy sesgada, tiene valores extremos o es ordinal (escala tipo Likert)", "R:" + nopar] ],
      nota: "No hace falta aplicar Shapiro-Wilk a todo: lee el mito n.º 1 más abajo." };
  }
  Q.dist2 = preguntaDist("t", "mw");
  Q.dist3 = preguntaDist("anova", "kw");
  Q.dist2p = preguntaDist("tpar", "wilcox");
  Q.dist3p = preguntaDist("anovarm", "friedman");
  Q.distcor = { t: "¿Las dos variables tienen una relación lineal y sin valores extremos?", o: [
    ["Sí (míralo en un diagrama de dispersión)", "R:pearson"],
    ["No, o alguna es ordinal", "R:spearman"] ] };

  // ---------------- recetas ----------------
  var R = {
    desc_cat: { n: "Frecuencias y porcentajes, con su intervalo de confianza",
      para: "Cuántos participantes hay en cada categoría y qué porcentaje representan. Si el objetivo es estimar una prevalencia, acompáñala de su intervalo de confianza al 95 %.",
      dd: ["Si tus datos vienen de una encuesta con diseño complejo (ENDES, ENAHO), los porcentajes deben ser ponderados: mira la dosis plena de «La Tabla 1 de tu tesis»."],
      r: "library(gtsummary)\ndatos |> tbl_summary(include = c(sexo, anemia))\n\n# Intervalo de confianza de una proporción (exacto de Clopper-Pearson)\nbinom.test(x = 48, n = 200)$conf.int",
      rep: "La prevalencia de anemia fue de 24,0 % (IC 95 %: 18,3 a 30,5).",
      ver: [[P2, "Prospecto R n.º 2: La Tabla 1 de tu tesis"]] },
    desc_num: { n: "Media y desviación estándar, o mediana y rango intercuartílico",
      para: "Resume dónde se ubica la variable y cuánto varía. Media (DE) si la distribución es simétrica; mediana (RIC) si es sesgada o tiene valores extremos.",
      dd: ["Si dudas, revisa el histograma: un sesgo marcado o valores extremos indican mediana (RIC)."],
      r: "library(gtsummary)\ndatos |> tbl_summary(include = c(edad, hemoglobina),\n                     statistic = list(edad ~ \"{mean} ({sd})\",\n                                      hemoglobina ~ \"{median} ({p25}, {p75})\"))",
      rep: "La edad media fue de 34,2 años (DE: 8,1) y la mediana de estancia, 4 días (RIC: 3 a 7).",
      ver: [[P2, "Prospecto R n.º 2: La Tabla 1 de tu tesis"], [DIC + "mediana-y-ric", "Diccionario: mediana y RIC"]] },
    chi: { n: "Chi cuadrado de Pearson (o prueba exacta de Fisher)",
      para: "Evalúa si la distribución de una variable categórica difiere entre grupos independientes, por ejemplo, si la frecuencia de anemia difiere según el área de residencia.",
      cuando: "Úsala si a lo más 20 % de las celdas tiene una frecuencia esperada menor que 5 y ninguna menor que 1 (criterio de Cochran). Si no se cumple, usa la prueba exacta de Fisher.",
      dd: ["Si son las mismas personas medidas dos veces → McNemar, no chi cuadrado.", "El chi cuadrado no mide la fuerza de la asociación: para eso reporta la RP o el OR con su IC 95 %.", "Si la variable es ordinal y quieres ver una tendencia, considera la prueba de tendencia lineal."],
      r: "tabla <- table(datos$area, datos$anemia)\nchisq.test(tabla)$expected   # frecuencias esperadas\nchisq.test(tabla)\nfisher.test(tabla)            # si hay esperadas < 5\n\n# En la tabla de tu tesis, gtsummary elige entre las dos:\nlibrary(gtsummary)\ndatos |> tbl_summary(by = area, include = anemia) |> add_p()",
      rep: "La frecuencia de anemia fue mayor en el área rural (32,1 %) que en la urbana (18,4 %) (p = 0,003; chi cuadrado de Pearson).",
      ver: [[P2, "Prospecto R n.º 2: La Tabla 1 de tu tesis"], [DIC + "prueba-de-chi-cuadrado", "Diccionario: prueba de chi cuadrado"]] },
    mcnemar: { n: "Prueba de McNemar",
      para: "Compara una variable binaria medida dos veces en las mismas personas (antes y después de una intervención) o en pares emparejados (un caso con su control).",
      dd: ["Si los grupos son independientes → chi cuadrado.", "Con tres o más mediciones → Q de Cochran."],
      r: "tabla <- table(antes = datos$conoce_antes, despues = datos$conoce_despues)\nmcnemar.test(tabla)",
      rep: "La proporción de madres que identificaban los signos de alarma aumentó de 42,0 % a 71,0 % después de la sesión educativa (p < 0,001; prueba de McNemar)." },
    cochran: { n: "Q de Cochran",
      para: "Compara una variable binaria medida tres o más veces en las mismas personas.",
      dd: ["Con solo dos mediciones → McNemar.", "Si además quieres ajustar por otras variables, se usan modelos para medidas repetidas (GEE o modelos mixtos)."],
      r: "# Datos en formato largo: una fila por persona y momento\nlibrary(rstatix)\ncochran_qtest(datos_largos, respuesta ~ momento | id)",
      rep: "La proporción de adherencia cambió entre los tres controles (p = 0,01; Q de Cochran)." },
    t: { n: "Prueba t para dos muestras independientes (de Welch)",
      para: "Compara la media de una variable numérica entre dos grupos de personas distintas.",
      cuando: "R usa por defecto la versión de Welch, que no exige que las varianzas sean iguales; es la opción recomendada.",
      dd: ["Si la variable está muy sesgada o es ordinal → U de Mann-Whitney.", "Si son las mismas personas antes y después → t pareada.", "Con tres o más grupos → ANOVA, no varias pruebas t."],
      r: "t.test(hemoglobina ~ sexo, data = datos)   # Welch por defecto\n\nlibrary(gtsummary)\ndatos |> tbl_summary(by = sexo, include = hemoglobina,\n                     statistic = hemoglobina ~ \"{mean} ({sd})\") |>\n  add_p(test = hemoglobina ~ \"t.test\")",
      rep: "La hemoglobina media fue mayor en los hombres (14,1 g/dL; DE: 1,2) que en las mujeres (12,6 g/dL; DE: 1,1); diferencia: 1,5 g/dL (IC 95 %: 1,2 a 1,8; p < 0,001).",
      ver: [[CALC, "Calcula el tamaño de muestra para comparar dos medias"]] },
    mw: { n: "U de Mann-Whitney (suma de rangos de Wilcoxon)",
      para: "Compara la distribución de una variable numérica sesgada u ordinal entre dos grupos de personas distintas.",
      dd: ["Si la distribución es razonablemente simétrica o la muestra es grande → t de Welch.", "Si son las mismas personas → rangos con signo de Wilcoxon."],
      r: "wilcox.test(dias_estancia ~ grupo, data = datos)\n\nlibrary(gtsummary)\ndatos |> tbl_summary(by = grupo, include = dias_estancia) |> add_p()   # mediana (RIC) y Wilcoxon",
      rep: "La mediana de estancia fue de 6 días (RIC: 4 a 9) en los pacientes con complicaciones y de 3 días (RIC: 2 a 5) en los demás (p < 0,001; U de Mann-Whitney)." },
    anova: { n: "ANOVA de un factor (de Welch)",
      para: "Compara la media de una variable numérica entre tres o más grupos de personas distintas.",
      cuando: "Si el ANOVA es significativo, identifica qué grupos difieren con comparaciones múltiples (Tukey, o Games-Howell si las varianzas difieren).",
      dd: ["Variable muy sesgada u ordinal → Kruskal-Wallis.", "Hacer varias pruebas t entre pares sin corregir aumenta los falsos positivos."],
      r: "oneway.test(imc ~ nivel_educativo, data = datos)     # ANOVA de Welch\nTukeyHSD(aov(imc ~ nivel_educativo, data = datos))    # comparaciones múltiples\nrstatix::games_howell_test(datos, imc ~ nivel_educativo)",
      rep: "El IMC medio difirió según el nivel educativo (p = 0,002; ANOVA de Welch); fue mayor en el nivel secundario que en el superior (diferencia: 1,4 kg/m²; p ajustado = 0,004)." },
    kw: { n: "Kruskal-Wallis",
      para: "Compara una variable numérica sesgada u ordinal entre tres o más grupos de personas distintas.",
      cuando: "Si resulta significativa, usa la prueba de Dunn con ajuste de los valores p para saber qué grupos difieren.",
      dd: ["Distribución simétrica o muestra grande → ANOVA.", "Solo dos grupos → U de Mann-Whitney."],
      r: "kruskal.test(puntaje ~ grupo, data = datos)\nrstatix::dunn_test(datos, puntaje ~ grupo, p.adjust.method = \"holm\")",
      rep: "El puntaje de calidad de vida difirió entre los tres grupos (p < 0,001; Kruskal-Wallis)." },
    tpar: { n: "Prueba t pareada",
      para: "Compara la media de una variable numérica medida dos veces en las mismas personas (antes y después).",
      dd: ["Si las diferencias están muy sesgadas → rangos con signo de Wilcoxon.", "Si son grupos distintos → t de Welch."],
      r: "t.test(datos$pas_despues, datos$pas_antes, paired = TRUE)",
      rep: "La presión arterial sistólica disminuyó en promedio 8,4 mmHg después de la intervención (IC 95 %: 5,1 a 11,7; p < 0,001; t pareada)." },
    wilcox: { n: "Rangos con signo de Wilcoxon",
      para: "Compara una variable numérica sesgada u ordinal medida dos veces en las mismas personas.",
      dd: ["Si las diferencias son simétricas → t pareada.", "Si son grupos distintos → U de Mann-Whitney."],
      r: "wilcox.test(datos$dolor_despues, datos$dolor_antes, paired = TRUE)",
      rep: "La mediana del puntaje de dolor bajó de 7 (RIC: 6 a 8) a 4 (RIC: 3 a 5) (p < 0,001; rangos con signo de Wilcoxon)." },
    anovarm: { n: "ANOVA de medidas repetidas",
      para: "Compara la media de una variable numérica medida tres o más veces en las mismas personas.",
      cuando: "Revisa la esfericidad (prueba de Mauchly); si no se cumple, usa la corrección de Greenhouse-Geisser, que rstatix aplica automáticamente.",
      dd: ["Datos sesgados u ordinales → Friedman.", "Si hay datos faltantes o quieres ajustar por covariables → modelos mixtos."],
      r: "# Datos en formato largo: una fila por persona y momento\nlibrary(rstatix)\nanova_test(data = datos_largos, dv = hemoglobina, wid = id, within = momento)",
      rep: "La hemoglobina media cambió entre los tres controles (p < 0,001; ANOVA de medidas repetidas con corrección de Greenhouse-Geisser)." },
    friedman: { n: "Prueba de Friedman",
      para: "Compara una variable numérica sesgada u ordinal medida tres o más veces en las mismas personas.",
      dd: ["Datos simétricos → ANOVA de medidas repetidas."],
      r: "friedman.test(puntaje ~ momento | id, data = datos_largos)",
      rep: "El puntaje cambió entre las tres mediciones (p = 0,002; prueba de Friedman)." },
    pearson: { n: "Correlación de Pearson",
      para: "Mide la fuerza y la dirección de la relación lineal entre dos variables numéricas.",
      dd: ["Relación no lineal, valores extremos o variables ordinales → Spearman.", "Correlación no es concordancia: para saber si dos métodos dan el mismo valor usa el CCI y Bland-Altman."],
      r: "cor.test(datos$edad, datos$pas, method = \"pearson\")\nplot(datos$edad, datos$pas)   # mira siempre el diagrama de dispersión",
      rep: "La edad se correlacionó de forma positiva y moderada con la presión arterial sistólica (r = 0,42; IC 95 %: 0,31 a 0,52; p < 0,001).",
      ver: [[CALC, "Calcula el tamaño de muestra para una correlación"], [DIC + "coeficiente-de-correlacion", "Diccionario: coeficiente de correlación"]] },
    spearman: { n: "Correlación de Spearman",
      para: "Mide la relación entre dos variables usando sus rangos; no exige linealidad ni normalidad y sirve para variables ordinales.",
      dd: ["Relación lineal sin valores extremos → Pearson."],
      r: "cor.test(datos$ansiedad, datos$horas_sueno, method = \"spearman\", exact = FALSE)",
      rep: "El puntaje de ansiedad se correlacionó de forma negativa con las horas de sueño (rho = −0,35; p < 0,001)." },
    km: { n: "Kaplan-Meier y prueba de log-rank",
      para: "Compara el tiempo hasta un evento (muerte, recaída, alta) entre grupos, aprovechando a los participantes que no tuvieron el evento durante el seguimiento (datos censurados).",
      dd: ["Si quieres ajustar por otras variables → regresión de Cox.", "No compares el tiempo con una t: ignora a los censurados."],
      r: "library(survival)\nsurvfit(Surv(tiempo, evento) ~ grupo, data = datos)    # curvas y medianas\nsurvdiff(Surv(tiempo, evento) ~ grupo, data = datos)   # log-rank",
      rep: "La supervivencia a 12 meses fue de 78,0 % en el grupo A y de 61,0 % en el grupo B (p = 0,004; log-rank)." },
    poisson: { n: "Regresión de Poisson con varianza robusta (razón de prevalencias o riesgo relativo)",
      para: "Estima la asociación entre una exposición y un desenlace binario ajustando por confusores. Da razones de prevalencias (transversales) o riesgos relativos (cohortes), más fáciles de interpretar que el OR cuando el desenlace es frecuente.",
      cuando: "Si el desenlace es frecuente (más de 10 %), el OR exagera la asociación; por eso en transversales se prefiere la RP.",
      dd: ["En casos y controles solo se puede estimar el OR → regresión logística.", "Para pocos eventos por variable (menos de 10), simplifica el modelo."],
      r: "m <- glm(anemia ~ exposicion + edad + area, family = poisson(link = \"log\"), data = datos)\nlmtest::coeftest(m, vcov = sandwich::vcovHC(m, type = \"HC0\"))\n# RP e IC 95 % paso a paso: Prospecto R n.º 1",
      rep: "Tras ajustar por edad y área de residencia, la exposición se asoció con una mayor prevalencia de anemia (RPa: 1,45; IC 95 %: 1,18 a 1,79).",
      ver: [[P1, "Prospecto R n.º 1: ¿OR o razón de prevalencias?"], [DIC + "varianza-robusta", "Diccionario: varianza robusta"]] },
    logistica: { n: "Regresión logística (odds ratio)",
      para: "Estima la asociación entre una exposición y un desenlace binario ajustando por confusores. Es el modelo natural para casos y controles, donde la medida válida es el OR.",
      dd: ["En transversales o cohortes con desenlace frecuente → Poisson con varianza robusta (RP o RR).", "Si los casos y controles están emparejados → regresión logística condicional."],
      r: "m <- glm(caso ~ exposicion + edad + sexo, family = binomial, data = datos)\nlibrary(gtsummary)\ntbl_regression(m, exponentiate = TRUE)   # OR e IC 95 %",
      rep: "La exposición se asoció con mayor odds de ser caso (ORa: 2,31; IC 95 %: 1,42 a 3,76), tras ajustar por edad y sexo.",
      ver: [[DIC + "odds-ratio", "Diccionario: odds ratio"], [DIC + "regresion-logistica", "Diccionario: regresión logística"]] },
    lineal: { n: "Regresión lineal múltiple",
      para: "Estima cuánto cambia, en promedio, un desenlace numérico por cada unidad (o categoría) de la exposición, ajustando por otras variables.",
      cuando: "Revisa los residuos: linealidad, varianza constante y ausencia de valores muy influyentes. Lo que debe ser aproximadamente normal son los residuos, no la variable.",
      dd: ["Desenlace binario → Poisson robusta o logística.", "Conteos → Poisson o binomial negativa."],
      r: "m <- lm(hemoglobina ~ exposicion + edad + sexo, data = datos)\nsummary(m)\nplot(m)                                # diagnóstico de residuos\ngtsummary::tbl_regression(m)",
      rep: "Tras ajustar por edad y sexo, la hemoglobina fue 0,8 g/dL menor en los expuestos (coeficiente: −0,8; IC 95 %: −1,2 a −0,4)." },
    conteo: { n: "Regresión de Poisson o binomial negativa",
      para: "Modela un conteo (número de crisis, de consultas) o una tasa (eventos por persona-tiempo).",
      cuando: "Si la varianza del conteo es mucho mayor que su media (sobredispersión), usa la binomial negativa.",
      dd: ["Si el desenlace es solo sí/no → Poisson con varianza robusta o logística."],
      r: "m <- glm(n_crisis ~ exposicion + edad + offset(log(meses_seguimiento)),\n         family = poisson, data = datos)\nm_nb <- MASS::glm.nb(n_crisis ~ exposicion + edad + offset(log(meses_seguimiento)), data = datos)\ngtsummary::tbl_regression(m_nb, exponentiate = TRUE)   # razón de tasas",
      rep: "La tasa de crisis fue 1,6 veces mayor en los expuestos (razón de tasas ajustada: 1,6; IC 95 %: 1,2 a 2,1)." },
    cox: { n: "Regresión de Cox (hazard ratio)",
      para: "Estima la asociación entre una exposición y el tiempo hasta un evento, ajustando por otras variables y aprovechando los datos censurados.",
      cuando: "Comprueba el supuesto de riesgos proporcionales con cox.zph().",
      dd: ["Sin ajuste, para comparar curvas → Kaplan-Meier y log-rank."],
      r: "library(survival)\nm <- coxph(Surv(tiempo, evento) ~ exposicion + edad, data = datos)\ncox.zph(m)                               # riesgos proporcionales\ngtsummary::tbl_regression(m, exponentiate = TRUE)",
      rep: "La exposición se asoció con mayor riesgo de muerte durante el seguimiento (HR ajustado: 1,9; IC 95 %: 1,3 a 2,8)." },
    validez: { n: "Sensibilidad, especificidad, valores predictivos y curva ROC",
      para: "Mide qué tan bien una prueba clasifica a las personas con y sin la enfermedad, comparada con un estándar de referencia. Si la prueba da un valor numérico, la curva ROC ayuda a elegir el punto de corte.",
      cuando: "Los valores predictivos dependen de la prevalencia: repórtalos junto con ella.",
      dd: ["Si no hay estándar de referencia y comparas dos observadores → kappa.", "La correlación no sirve para evaluar una prueba diagnóstica."],
      r: "# Tabla 2×2: filas = prueba (+, −), columnas = estándar (+, −)\ntabla <- as.table(matrix(c(85, 20, 15, 180), nrow = 2, byrow = TRUE))\nepiR::epi.tests(tabla, conf.level = 0.95)\n\n# Prueba numérica: curva ROC\nroc <- pROC::roc(enfermo ~ marcador, data = datos)\npROC::ci.auc(roc)",
      rep: "La prueba tuvo una sensibilidad de 85,0 % (IC 95 %: 76,5 a 91,4) y una especificidad de 90,0 % (IC 95 %: 85,0 a 93,8).",
      ver: [[CALC, "Calcula el tamaño de muestra para una prueba diagnóstica"], [DIC + "sensibilidad", "Diccionario: sensibilidad"]] },
    kappa: { n: "Coeficiente kappa de Cohen",
      para: "Mide cuánto coinciden dos observadores (o dos métodos) al clasificar en categorías, descontando el acuerdo esperado por azar.",
      cuando: "Si las categorías son ordenadas (leve, moderado, severo), usa el kappa ponderado.",
      dd: ["El porcentaje de acuerdo simple sobreestima la concordancia.", "Para mediciones numéricas → CCI y Bland-Altman."],
      r: "library(irr)\nkappa2(datos[, c(\"observador1\", \"observador2\")])\nkappa2(datos[, c(\"obs1\", \"obs2\")], weight = \"squared\")   # categorías ordenadas",
      rep: "La concordancia entre los dos evaluadores fue sustancial (kappa = 0,72; IC 95 %: 0,61 a 0,83)." },
    cci: { n: "Coeficiente de correlación intraclase (CCI) y Bland-Altman",
      para: "Evalúan si dos mediciones numéricas del mismo fenómeno coinciden. El CCI resume la concordancia; el gráfico de Bland-Altman muestra el sesgo promedio y los límites de acuerdo.",
      dd: ["La correlación de Pearson no sirve: dos métodos pueden correlacionar perfectamente y dar valores distintos."],
      r: "library(irr)\nicc(datos[, c(\"metodo1\", \"metodo2\")], model = \"twoway\", type = \"agreement\", unit = \"single\")\n\n# Bland-Altman\ndif <- datos$metodo1 - datos$metodo2\nmean(dif) + c(-1.96, 0, 1.96) * sd(dif)   # límites de acuerdo y sesgo",
      rep: "La concordancia entre ambos equipos fue excelente (CCI: 0,93; IC 95 %: 0,89 a 0,96), con un sesgo promedio de 0,2 g/dL (límites de acuerdo: −0,6 a 1,0)." }
  };

  // ---------------- interfaz ----------------
  var raiz, ruta = [];
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function pintar() {
    var actual = ruta.length ? ruta[ruta.length - 1].sig : "inicio";
    var h = '<div class="tri-ruta">';
    ruta.forEach(function (p, i) {
      h += '<button type="button" class="tri-paso" data-i="' + i + '"><span>' + (i + 1) + '</span>' + esc(p.resp) + '</button>';
    });
    h += "</div>";
    if (actual.indexOf("R:") === 0) {
      var x = R[actual.slice(2)];
      h += '<article class="tri-receta"><p class="tri-rp">Rp/</p><h3>' + esc(x.n) + '</h3>' +
        '<p class="tri-et">Indicación</p><p>' + esc(x.para) + '</p>' +
        (x.cuando ? '<p class="tri-et">Posología</p><p>' + esc(x.cuando) + '</p>' : "") +
        '<p class="tri-et">Diagnóstico diferencial</p><ul>' + x.dd.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul>" +
        '<p class="tri-et">En R</p><pre class="codigo"><code>' + esc(x.r) + '</code></pre>' +
        '<p class="tri-et">Cómo reportarlo (ejemplo ilustrativo)</p><blockquote>' + esc(x.rep) + '</blockquote>' +
        (x.ver ? '<p class="tri-et">Para profundizar</p><ul>' + x.ver.map(function (v) { return '<li><a href="' + v[0] + '">' + esc(v[1]) + "</a></li>"; }).join("") + "</ul>" : "") +
        '<button type="button" class="tri-reinicio">Empezar otro triaje</button></article>';
    } else {
      var q = Q[actual];
      h += '<div class="tri-pregunta"><p class="tri-num">Pregunta ' + (ruta.length + 1) + '</p><h3>' + esc(q.t) + '</h3><div class="tri-opciones">' +
        q.o.map(function (o, i) { return '<button type="button" class="tri-op" data-o="' + i + '">' + esc(o[0]) + "</button>"; }).join("") +
        "</div>" + (q.nota ? '<p class="tri-nota">' + esc(q.nota) + "</p>" : "") + "</div>";
    }
    raiz.innerHTML = h;
  }
  function iniciar() {
    raiz = document.getElementById("triaje"); if (!raiz) return;
    raiz.addEventListener("click", function (ev) {
      var b = ev.target.closest("button"); if (!b) return;
      var actual = ruta.length ? ruta[ruta.length - 1].sig : "inicio";
      if (b.classList.contains("tri-op")) { var o = Q[actual].o[+b.getAttribute("data-o")]; ruta.push({ resp: o[0], sig: o[1] }); }
      else if (b.classList.contains("tri-paso")) { ruta = ruta.slice(0, +b.getAttribute("data-i")); }
      else if (b.classList.contains("tri-reinicio")) { ruta = []; }
      pintar();
      raiz.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    pintar();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
