/* Calculadora de tamaño de muestra · lógica de la página · Anthony Romero Cerdán · MIT
   Lee los supuestos, llama a motor.js (window.Muestra) y escribe: el n con su desglose,
   las observaciones típicas del jurado, el párrafo para la tesis, el código en R y la
   curva de sensibilidad. */
(function () {
  "use strict";
  var M = window.Muestra;
  var $ = function (id) { return document.getElementById(id); };

  // ---------- formato con coma decimal ----------
  function num(x, dec) {
    if (dec === undefined) dec = 2;
    var s = (Math.round(x * Math.pow(10, dec)) / Math.pow(10, dec)).toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",");
  }
  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function pct(x, dec) { return num(x * 100, dec === undefined ? 1 : dec) + " %"; }
  function r4(x) { return String(Math.round(x * 1e4) / 1e4); }   // número para el código R
  function marca(t) { return "<mark>[" + t + "]</mark>"; }
  function val(id) { var v = parseFloat(String($(id).value).replace(",", ".")); return isNaN(v) ? NaN : v; }

  // ---------- lectura de supuestos ----------
  function modulo() { return document.querySelector('input[name="mod"]:checked').value; }
  function comunes() {
    return { conf: parseFloat($("conf").value), pot: parseFloat($("pot").value), L: (val("perd") || 0) / 100 };
  }

  var NOMBRE_DIS = { cc: "casos y controles", co: "cohortes", tr: "transversal analítico" };
  var MEDIDA = { cc: "OR", co: "RR", tr: "RP" };

  // ---------- cálculo por módulo ----------
  function calcular(mod, c) {
    var R = { avisos: [], desglose: [], grupos: [], unidad: "participantes" };
    var zc = M.qnorm(1 - (1 - c.conf) / 2);
    var confTxt = pct(c.conf, 0), potTxt = pct(c.pot, 0), L = c.L;
    var perdTxt = L > 0 ? "; al considerar " + pct(L, 0) + " de pérdidas" : "";

    if (mod === "prop") {
      var p = val("prop-p") / 100, d = val("prop-d") / 100, N = val("prop-N"), clu = $("prop-clu").checked;
      var deff = clu ? val("prop-deff") : 1;
      if (!(p > 0 && p < 1) || !(d > 0 && d < 1) || !(deff >= 1)) throw "Revisa los valores: la prevalencia y la precisión deben estar entre 0 y 100 %, y el DEFF ser 1 o más.";
      var o = { p: p, d: d, conf: c.conf, N: N > 0 ? N : 0, deff: deff };
      var x = M.unaProporcion(o), n = x.n, nf = M.porPerdidas(n, L);
      R.n = nf;
      R.desglose.push("Fórmula para una proporción: n₀ = " + num(x.n0, 1));
      if (deff > 1) R.desglose.push("× efecto de diseño " + num(deff) + " = " + num(x.n0 * deff, 1));
      if (o.N) R.desglose.push("Corrección por población finita (N = " + miles(o.N) + "): " + num(x.crudo, 1));
      R.desglose.push("Redondeado hacia arriba: " + miles(n));
      if (L > 0) R.desglose.push("Con " + pct(L, 0) + " de pérdidas: " + miles(n) + " / (1 − " + num(L) + ") = " + miles(nf));
      // avisos
      if (Math.abs(p - 0.5) < 1e-9) R.avisos.push("Usaste 50 %. Es válido solo si no existe ningún antecedente; si lo hay, usa su prevalencia y cítala. Con 50 % sin justificación el jurado suele observarlo.");
      if (d >= p || d > (1 - p)) R.avisos.push("La precisión (" + pct(d) + ") es igual o mayor que la prevalencia esperada: el intervalo de confianza podría incluir el 0 % o el 100 %. Reduce la precisión; para prevalencias bajas, muchos autores usan una precisión de la mitad de la prevalencia o menos.");
      else if (d > p / 2 && p < 0.1) R.avisos.push("Con una prevalencia baja (" + pct(p) + "), una precisión de ±" + pct(d) + " es poco informativa. Considera una precisión menor.");
      if (o.N && x.n0 * deff / o.N < 0.05) R.avisos.push("Tu muestra es menos de 5 % de la población: la corrección por población finita casi no cambia el resultado. Puedes omitirla.");
      if (o.N && n >= o.N * 0.9) R.avisos.push("Necesitarías casi toda la población. En ese caso conviene plantear un censo (incluir a todos) y justificarlo.");
      if (clu && deff === 1) R.avisos.push("Marcaste muestreo por conglomerados pero el DEFF es 1: así se ignora el diseño.");
      if (!clu) R.avisos.push("Si tus datos vienen de la ENDES u otra encuesta con conglomerados, marca la casilla del efecto de diseño: sin él el tamaño queda subestimado.");
      if (L === 0) R.avisos.push("No consideraste pérdidas. El jurado suele preguntar por la no respuesta o las historias clínicas incompletas.");
      R.parrafo = "Para estimar la prevalencia de " + marca("desenlace") + " se calculó el tamaño de muestra con la fórmula para estimar una proporción (Lwanga y Lemeshow, 1991), considerando una prevalencia esperada de " + pct(p) + " reportada por " + marca("autor, año") + ", una precisión absoluta de " + pct(d) + " y un nivel de confianza de " + confTxt + " (z = " + num(zc) + ")" +
        (deff > 1 ? ", con un efecto de diseño de " + num(deff) + " por el muestreo por conglomerados" : "") +
        (o.N ? " y la corrección para una población finita de " + miles(o.N) + " " + marca("unidades") : "") +
        ". Se obtuvo un tamaño de muestra de " + miles(n) + " participantes" + (L > 0 ? perdTxt + ", el tamaño de muestra final es de " + miles(nf) + " participantes." : ".");
      R.codigo = [
        "# Tamaño de muestra para estimar una proporción (Lwanga y Lemeshow, 1991)",
        "p    <- " + r4(p) + "   # prevalencia esperada",
        "d    <- " + r4(d) + "   # precisión absoluta",
        "conf <- " + c.conf + "    # nivel de confianza",
        "deff <- " + r4(deff) + "      # efecto de diseño (1 = muestreo aleatorio simple)",
        "N    <- " + (o.N ? o.N : "NA") + "      # población (NA si es grande o desconocida)",
        "perdidas <- " + r4(L),
        "",
        "z  <- qnorm(1 - (1 - conf) / 2)",
        "n0 <- z^2 * p * (1 - p) / d^2 * deff",
        "n  <- if (is.na(N)) n0 else n0 / (1 + (n0 - 1) / N)",
        "n  <- ceiling(n)              # " + n,
        "ceiling(n / (1 - perdidas))   # " + nf + "  (con pérdidas)",
        "",
        "# Comprobación con epiR (sin población finita):",
        "# epiR::epi.sssimpleestb(Py = p, epsilon = d, error = \"absolute\", se = 1, sp = 1, conf.level = conf)"
      ].join("\n");
      // curva: n según la precisión
      R.graf = { titulo: "¿Y si cambias la precisión?", eje: "Precisión absoluta (± %)", actual: d * 100,
        desde: Math.max(0.5, d * 100 * 0.4), hasta: Math.min(30, d * 100 * 2.5),
        f: function (xx) { var oo = Object.assign({}, o, { d: xx / 100 }); return M.porPerdidas(M.unaProporcion(oo).n, L); },
        sub: "Cada punto es el tamaño final (con pérdidas) para otra precisión, con los demás supuestos iguales." };
      return R;
    }

    if (mod === "dprop") {
      var dis = $("dp-dis").value, p0 = val("dp-p0") / 100, ef = val("dp-ef"), cc = $("dp-cc").checked, r, e;
      if (!(p0 > 0 && p0 < 1) || !(ef > 0) || ef === 1) throw "Revisa los valores: la proporción debe estar entre 0 y 100 % y la medida de efecto ser distinta de 1.";
      if (dis === "tr") { e = val("dp-e") / 100; if (!(e > 0 && e < 1)) throw "El % de expuestos debe estar entre 0 y 100."; r = (1 - e) / e; }
      else { r = val("dp-r"); if (!(r > 0)) throw "La relación entre grupos debe ser mayor que 0."; }
      var p1 = dis === "cc" ? M.p1desdeOR(p0, ef) : M.p1desdeRR(p0, ef);
      if (!(p1 > 0 && p1 < 1)) throw "Con esa proporción y ese " + MEDIDA[dis] + " la proporción en el otro grupo pasaría de 100 %. Revisa los supuestos.";
      var od = { p1: p1, p0: p0, r: r, cc: cc, conf: c.conf, pot: c.pot };
      var y = M.dosProporciones(od);
      var g1 = M.porPerdidas(y.n1, L), g0 = M.porPerdidas(y.n0, L);
      var nom1 = dis === "cc" ? "casos" : "expuestos", nom0 = dis === "cc" ? "controles" : "no expuestos";
      R.n = g1 + g0;
      R.grupos = [miles(g1) + " " + nom1, miles(g0) + " " + nom0];
      R.desglose.push((dis === "cc" ? "Expuestos entre los casos" : "Desenlace en los expuestos") + " (derivado del " + MEDIDA[dis] + "): " + pct(p1));
      R.desglose.push("Fórmula de Fleiss" + (cc ? " con corrección de continuidad" : "") + ": " + num(y.crudo1, 1) + " " + nom1 + " y " + num(y.crudo1 * r, 1) + " " + nom0);
      R.desglose.push("Redondeado hacia arriba: " + miles(y.n1) + " + " + miles(y.n0) + " = " + miles(y.total));
      if (L > 0) R.desglose.push("Con " + pct(L, 0) + " de pérdidas en cada grupo: " + miles(g1) + " + " + miles(g0) + " = " + miles(g1 + g0));
      // avisos
      if (ef > 0.67 && ef < 1.5) R.avisos.push("Un " + MEDIDA[dis] + " tan cercano a 1 exige muestras muy grandes. Verifica que sea el mínimo con importancia clínica y que tenga sustento en antecedentes.");
      if (ef >= 4 || ef <= 0.25) R.avisos.push("Un " + MEDIDA[dis] + " de " + num(ef) + " es un efecto grande. Si no está respaldado por antecedentes, el jurado puede considerarlo optimista y tu estudio quedaría sin potencia para efectos más pequeños.");
      if (dis === "cc" && r > 4) R.avisos.push("Más de 4 controles por caso casi no aumenta la potencia. Suele ser más eficiente quedarse en 4.");
      if (dis === "cc") R.avisos.push("Recuerda: el " + Math.round(p0 * 100) + " % es la frecuencia de la exposición entre los controles, no la prevalencia de la enfermedad. Es la confusión más frecuente en casos y controles.");
      if (dis === "tr") R.avisos.push("Si después ajustarás por confusores con un modelo (Poisson o logístico con varias variables), este tamaño es un mínimo: el análisis multivariado suele necesitar más participantes.");
      if (!cc) R.avisos.push("Sin corrección de continuidad el tamaño es menor, pero la aproximación normal sobreestima la potencia. Es preferible dejarla marcada.");
      if (L === 0) R.avisos.push("No consideraste pérdidas. El jurado suele preguntar por la no respuesta o las historias clínicas incompletas.");
      var base = { cc: "una frecuencia de exposición de " + pct(p0) + " en los controles", co: "una incidencia de " + marca("desenlace") + " de " + pct(p0) + " en los no expuestos", tr: "una prevalencia de " + marca("desenlace") + " de " + pct(p0) + " en los no expuestos" }[dis];
      var relTxt = dis === "cc" ? "una relación de " + num(r) + " control" + (r === 1 ? "" : "es") + " por caso" :
                   dis === "co" ? "una relación de " + num(r) + " no expuesto" + (r === 1 ? "" : "s") + " por expuesto" :
                   "una frecuencia de exposición de " + pct(e) + " en la población";
      R.parrafo = "Se calculó el tamaño de muestra para un estudio de " + NOMBRE_DIS[dis] + " con la fórmula de Fleiss para comparar dos proporciones" + (cc ? ", con corrección de continuidad" : "") + " (Fleiss, Levin y Paik, 2003). Se consideró " + base + " según " + marca("autor, año") + ", un " + MEDIDA[dis] + " mínimo a detectar de " + num(ef) + ", un nivel de confianza de " + confTxt + ", una potencia de " + potTxt + " y " + relTxt + ". Se requieren " + miles(y.n1) + " " + nom1 + " y " + miles(y.n0) + " " + nom0 + " (" + miles(y.total) + " en total)" +
        (L > 0 ? perdTxt + ", la muestra final es de " + miles(g1) + " " + nom1 + " y " + miles(g0) + " " + nom0 + " (" + miles(g1 + g0) + " en total)." : ".");
      R.codigo = [
        "# Comparar dos proporciones: fórmula de Fleiss (Fleiss, Levin y Paik, 2003)",
        "p0   <- " + r4(p0) + (dis === "cc" ? "   # expuestos entre los controles" : "   # desenlace en no expuestos"),
        dis === "cc" ? "OR   <- " + r4(ef) + "\np1   <- OR * p0 / (1 + p0 * (OR - 1))   # expuestos entre los casos" : MEDIDA[dis] + "   <- " + r4(ef) + "\np1   <- " + MEDIDA[dis] + " * p0                       # desenlace en expuestos",
        "r    <- " + r4(r) + "   # " + nom0 + " por cada " + nom1.replace(/s$/, ""),
        "conf <- " + c.conf + "; potencia <- " + c.pot + "; perdidas <- " + r4(L),
        "",
        "za <- qnorm(1 - (1 - conf) / 2); zb <- qnorm(potencia)",
        "pm <- (p1 + r * p0) / (r + 1)",
        "n1 <- (za * sqrt((r + 1) * pm * (1 - pm)) + zb * sqrt(r * p1 * (1 - p1) + p0 * (1 - p0)))^2 /",
        "      (r * (p1 - p0)^2)",
        cc ? "n1 <- n1 / 4 * (1 + sqrt(1 + 2 * (r + 1) / (n1 * r * abs(p1 - p0))))^2   # corrección de continuidad" : "# (sin corrección de continuidad)",
        "c(" + nom1.replace(/ /g, "_") + " = ceiling(n1), " + nom0.replace(/ /g, "_") + " = ceiling(r * n1))   # " + y.n1 + " y " + y.n0,
        "ceiling(ceiling(c(n1, r * n1)) / (1 - perdidas))       # " + g1 + " y " + g0 + "  (con pérdidas)",
        "",
        "# Comprobación (mismo resultado):",
        "# EnvStats::propTestN(p.or.p1 = p1, p0.or.p2 = p0, power = potencia, alpha = 1 - conf,",
        "#                     sample.type = \"two.sample\", ratio = r, correct = " + (cc ? "TRUE" : "FALSE") + ")"
      ].join("\n");
      var lo, hi;
      if (ef > 1) { lo = 1 + (ef - 1) * 0.5; hi = 1 + (ef - 1) * 2.2; }
      else { lo = ef * 0.5; hi = 1 - (1 - ef) * 0.45; }
      R.graf = { titulo: "¿Y si el efecto real es otro?", eje: MEDIDA[dis] + " mínimo a detectar", actual: ef, desde: lo, hasta: hi, log: true,
        f: function (xx) {
          var pp1 = dis === "cc" ? M.p1desdeOR(p0, xx) : M.p1desdeRR(p0, xx);
          if (!(pp1 > 0 && pp1 < 1) || Math.abs(pp1 - p0) < 1e-9) return NaN;
          var yy = M.dosProporciones(Object.assign({}, od, { p1: pp1 }));
          return M.porPerdidas(yy.n1, L) + M.porPerdidas(yy.n0, L);
        },
        sub: "Tamaño total (con pérdidas) para otros valores del " + MEDIDA[dis] + ", con los demás supuestos iguales. Fíjate cómo crece al acercarse a 1." };
      return R;
    }

    if (mod === "med") {
      var dif = val("med-dif"), sd = val("med-sd"), rr = val("med-r");
      if (!(dif > 0) || !(sd > 0) || !(rr > 0)) throw "La diferencia, la desviación estándar y la relación entre grupos deben ser mayores que 0.";
      var om = { dif: dif, sd: sd, r: rr, conf: c.conf, pot: c.pot };
      var w = M.dosMedias(om), a1 = M.porPerdidas(w.n1, L), a0 = M.porPerdidas(w.n0, L);
      var dCohen = dif / sd;
      R.n = a1 + a0; R.grupos = [miles(a1) + " en el grupo 1", miles(a0) + " en el grupo 2"];
      R.desglose.push("Diferencia estandarizada (d de Cohen): " + num(dCohen) );
      R.desglose.push("Prueba t con potencia exacta: " + num(w.crudo1, 1) + " en el grupo 1" + (rr !== 1 ? " y " + num(w.crudo1 * rr, 1) + " en el grupo 2" : " por grupo"));
      R.desglose.push("Redondeado hacia arriba: " + miles(w.n1) + " + " + miles(w.n0) + " = " + miles(w.total));
      if (L > 0) R.desglose.push("Con " + pct(L, 0) + " de pérdidas en cada grupo: " + miles(a1) + " + " + miles(a0) + " = " + miles(a1 + a0));
      if (dCohen >= 0.8) R.avisos.push("La diferencia equivale a " + num(dCohen) + " desviaciones estándar, un efecto grande. Si no está respaldada por antecedentes, puede parecer optimista.");
      if (dCohen < 0.2) R.avisos.push("La diferencia es menor que 0,2 desviaciones estándar (efecto pequeño): necesitarás muchos participantes. Verifica que sea clínicamente importante.");
      R.avisos.push("La desviación estándar debe venir de un antecedente o un piloto, y debes citarlo. Es el supuesto que más observan en comparaciones de medias.");
      if (w.n1 < 30) R.avisos.push("Con menos de 30 por grupo, si la variable no tiene distribución aproximadamente normal tendrás que justificar la prueba t o usar una alternativa no paramétrica.");
      if (L === 0) R.avisos.push("No consideraste pérdidas. El jurado suele preguntar por la no respuesta o las historias clínicas incompletas.");
      R.parrafo = "Se calculó el tamaño de muestra para comparar dos medias con la prueba t de Student para muestras independientes, considerando una diferencia mínima a detectar de " + num(dif) + " " + marca("unidades") + ", una desviación estándar de " + num(sd) + " " + marca("unidades") + " según " + marca("autor, año") + ", un nivel de confianza de " + confTxt + " y una potencia de " + potTxt +
        (rr !== 1 ? ", con una relación de " + num(rr) + " participantes del grupo 2 por cada uno del grupo 1" : "") + ". Se requieren " + miles(w.n1) + (rr !== 1 ? " participantes en el grupo 1 y " + miles(w.n0) + " en el grupo 2" : " participantes por grupo") + " (" + miles(w.total) + " en total)" +
        (L > 0 ? perdTxt + ", la muestra final es de " + miles(a1 + a0) + " participantes." : ".");
      R.codigo = (rr === 1 ? [
        "# Comparar dos medias: prueba t para dos grupos del mismo tamaño",
        "power.t.test(delta = " + r4(dif) + ", sd = " + r4(sd) + ", sig.level = " + r4(1 - c.conf) + ", power = " + c.pot + ")",
        "# n por grupo (redondea hacia arriba): " + w.n1,
        "ceiling(" + w.n1 + " / (1 - " + r4(L) + "))   # " + a1 + " por grupo con pérdidas"
      ] : [
        "# Comparar dos medias: prueba t con grupos de distinto tamaño (r = n2 / n1)",
        "dif <- " + r4(dif) + "; s <- " + r4(sd) + "; r <- " + r4(rr),
        "alfa <- " + r4(1 - c.conf) + "; potencia <- " + c.pot + "; perdidas <- " + r4(L),
        "pot_t <- function(n1) {",
        "  df <- n1 * (1 + r) - 2",
        "  ncp <- (dif / s) / sqrt(1 / n1 + 1 / (r * n1))",
        "  1 - pt(qt(1 - alfa / 2, df), df, ncp)   # t no central",
        "}",
        "n1 <- uniroot(function(n) pot_t(n) - potencia, c(2, 1e6), tol = 1e-9)$root",
        "c(grupo1 = ceiling(n1), grupo2 = ceiling(r * n1))   # " + w.n1 + " y " + w.n0,
        "ceiling(ceiling(c(n1, r * n1)) / (1 - perdidas))     # " + a1 + " y " + a0 + "  (con pérdidas)"
      ]).join("\n");
      R.graf = { titulo: "¿Y si la diferencia real es otra?", eje: "Diferencia mínima a detectar", actual: dif, desde: dif * 0.5, hasta: dif * 2, log: true,
        f: function (xx) { var ww = M.dosMedias(Object.assign({}, om, { dif: xx })); return M.porPerdidas(ww.n1, L) + M.porPerdidas(ww.n0, L); },
        sub: "Tamaño total (con pérdidas) para otras diferencias, con la misma desviación estándar." };
      return R;
    }

    if (mod === "dx") {
      var se = val("dx-se") / 100, sp = val("dx-sp") / 100, prev = val("dx-prev") / 100, dd = val("dx-d") / 100;
      if (!(se > 0 && se < 1) || !(sp > 0 && sp < 1) || !(prev > 0 && prev < 1) || !(dd > 0 && dd < 1)) throw "Todos los porcentajes deben estar entre 0 y 100.";
      var odx = { se: se, sp: sp, prev: prev, d: dd, conf: c.conf };
      var q = M.diagnostica(odx), nfq = M.porPerdidas(q.n, L);
      R.n = nfq;
      R.grupos = ["≈ " + miles(Math.round(nfq * prev)) + " con la enfermedad", "≈ " + miles(Math.round(nfq * (1 - prev))) + " sin la enfermedad"];
      R.desglose.push("Para la sensibilidad: " + miles(q.nSe));
      R.desglose.push("Para la especificidad: " + miles(q.nSp));
      R.desglose.push("Se usa el mayor (" + q.manda + "): " + miles(q.n));
      if (L > 0) R.desglose.push("Con " + pct(L, 0) + " de pérdidas: " + miles(nfq));
      if (prev < 0.1) R.avisos.push("Con una prevalencia de " + pct(prev) + " necesitas reclutar a muchas personas para tener suficientes enfermos. Si eliges a los participantes según su diagnóstico (diseño de casos y controles diagnóstico), calcula por separado " + miles(Math.ceil(q.nSe * prev)) + " enfermos y " + miles(Math.ceil(q.nSp * (1 - prev))) + " no enfermos, y advierte el riesgo de sesgo de espectro.");
      if (se + dd >= 1 || sp + dd >= 1) R.avisos.push("La precisión es grande para una sensibilidad o especificidad tan alta: el intervalo superaría el 100 %. Reduce la precisión.");
      R.avisos.push("La prevalencia debe ser la de la población donde aplicarás la prueba (por ejemplo, los pacientes que acuden con sospecha), no la prevalencia nacional.");
      if (L === 0) R.avisos.push("No consideraste pérdidas: resultados del estándar de referencia no disponibles, muestras inadecuadas, etc.");
      R.parrafo = "El tamaño de muestra se calculó con la fórmula de Buderer (1996) para estimar la sensibilidad y la especificidad, considerando una sensibilidad esperada de " + pct(se) + " y una especificidad esperada de " + pct(sp) + " según " + marca("autor, año") + ", una prevalencia de " + marca("enfermedad") + " de " + pct(prev) + " en la población de estudio, una precisión absoluta de " + pct(dd) + " y un nivel de confianza de " + confTxt + ". Se requieren " + miles(q.nSe) + " participantes para estimar la sensibilidad y " + miles(q.nSp) + " para la especificidad; se eligió el mayor, " + miles(q.n) + " participantes" +
        (L > 0 ? perdTxt + ", la muestra final es de " + miles(nfq) + " participantes." : ".");
      R.codigo = [
        "# Sensibilidad y especificidad (Buderer, 1996)",
        "se <- " + r4(se) + "; sp <- " + r4(sp) + "; prev <- " + r4(prev) + "; d <- " + r4(dd),
        "conf <- " + c.conf + "; perdidas <- " + r4(L),
        "z <- qnorm(1 - (1 - conf) / 2)",
        "n_se <- ceiling(z^2 * se * (1 - se) / (d^2 * prev))         # " + q.nSe,
        "n_sp <- ceiling(z^2 * sp * (1 - sp) / (d^2 * (1 - prev)))   # " + q.nSp,
        "n <- max(n_se, n_sp)                                        # " + q.n,
        "ceiling(n / (1 - perdidas))                                 # " + nfq + "  (con pérdidas)"
      ].join("\n");
      R.graf = { titulo: "¿Y si la prevalencia es otra?", eje: "Prevalencia de la enfermedad (%)", actual: prev * 100, desde: Math.max(1, prev * 100 * 0.4), hasta: Math.min(90, prev * 100 * 2.5), log: true,
        f: function (xx) { return M.porPerdidas(M.diagnostica(Object.assign({}, odx, { prev: xx / 100 })).n, L); },
        sub: "Tamaño final (con pérdidas) para otras prevalencias. Cuanto más rara la enfermedad, más participantes." };
      return R;
    }

    // correlación
    var rho = val("cor-r");
    if (!(rho > 0 && rho < 1)) throw "El coeficiente de correlación debe estar entre 0 y 1 (usa el valor absoluto).";
    var oc = { rho: rho, conf: c.conf, pot: c.pot };
    var k = M.correlacion(oc), nk = M.porPerdidas(k.n, L);
    R.n = nk;
    R.desglose.push("Transformación z de Fisher: C = " + num(0.5 * Math.log((1 + rho) / (1 - rho)), 3));
    R.desglose.push("n = ((z₁₋α/₂ + z₁₋β) / C)² + 3 = " + num(k.crudo, 1) + " → " + miles(k.n));
    if (L > 0) R.desglose.push("Con " + pct(L, 0) + " de pérdidas: " + miles(nk));
    if (rho >= 0.5) R.avisos.push("Una correlación de " + num(rho) + " es fuerte. Si no tiene sustento en antecedentes, puede parecer optimista y tu estudio no tendría potencia para correlaciones moderadas.");
    R.avisos.push("Este cálculo supone una relación lineal y sirve igual para Pearson; para Spearman suele aceptarse como aproximación.");
    if (L === 0) R.avisos.push("No consideraste pérdidas. El jurado suele preguntar por la no respuesta o los datos incompletos.");
    R.parrafo = "Se calculó el tamaño de muestra para detectar un coeficiente de correlación de al menos " + num(rho) + " según " + marca("autor, año") + ", con un nivel de confianza de " + confTxt + " y una potencia de " + potTxt + ", mediante la transformación z de Fisher (Hulley et al., 2013). Se requieren " + miles(k.n) + " participantes" +
      (L > 0 ? perdTxt + ", la muestra final es de " + miles(nk) + " participantes." : ".");
    R.codigo = [
      "# Correlación: transformación z de Fisher (Hulley et al., 2013)",
      "r <- " + r4(rho) + "; conf <- " + c.conf + "; potencia <- " + c.pot + "; perdidas <- " + r4(L),
      "za <- qnorm(1 - (1 - conf) / 2); zb <- qnorm(potencia)",
      "n <- ceiling(((za + zb) / atanh(r))^2 + 3)   # " + k.n,
      "ceiling(n / (1 - perdidas))                  # " + nk + "  (con pérdidas)",
      "# Referencia: pwr::pwr.r.test(r = r, power = potencia) usa otra aproximación y puede dar 1 menos"
    ].join("\n");
    R.graf = { titulo: "¿Y si la correlación real es otra?", eje: "Coeficiente de correlación", actual: rho, desde: Math.max(0.05, rho * 0.5), hasta: Math.min(0.95, rho * 1.8), log: true,
      f: function (xx) { return M.porPerdidas(M.correlacion(Object.assign({}, oc, { rho: xx })).n, L); },
      sub: "Tamaño final (con pérdidas) para otros coeficientes." };
    return R;
  }

  // ---------- gráfico de sensibilidad (SVG) ----------
  function graficar(g) {
    var cont = $("grafico"), W = 640, H = 300, m = { l: 62, r: 18, t: 18, b: 46 };
    var pts = [], i, xx, yy;
    for (i = 0; i <= 60; i++) { xx = g.desde + (g.hasta - g.desde) * i / 60; yy = g.f(xx); if (isFinite(yy) && yy > 0) pts.push([xx, yy]); }
    var ya = g.f(g.actual);
    if (pts.length < 2) { cont.innerHTML = ""; return; }
    var ymin = Math.min.apply(null, pts.map(function (p) { return p[1]; }).concat([ya]));
    var ymax = Math.max.apply(null, pts.map(function (p) { return p[1]; }).concat([ya]));
    var log = g.log && ymax / ymin > 4;
    var ty = log ? Math.log10 : function (v) { return v; };
    var y0 = log ? ty(ymin) : 0, y1 = ty(ymax);
    if (y1 - y0 < 1e-9) y1 = y0 + 1;
    var X = function (v) { return m.l + (v - g.desde) / (g.hasta - g.desde) * (W - m.l - m.r); };
    var Y = function (v) { return H - m.b - (ty(v) - y0) / (y1 - y0) * (H - m.t - m.b); };
    // marcas del eje y
    var ticks = [];
    if (log) {
      var serie = (y1 - y0) < 1.2 ? [1, 1.5, 2, 3, 5, 7] : [1, 2, 5];
      for (var e = Math.floor(y0); e <= Math.ceil(y1); e++) serie.forEach(function (k) { var v = k * Math.pow(10, e); if (ty(v) >= y0 - 1e-9 && ty(v) <= y1 + 1e-9) ticks.push(v); });
    } else {
      var paso = Math.pow(10, Math.floor(Math.log10(ymax / 4))); [1, 2, 5].some(function (k) { if (ymax / (paso * k) <= 6) { paso *= k; return true; } return false; });
      for (var t = 0; t <= ymax; t += paso) ticks.push(t);
    }
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';
    ticks.forEach(function (v) { s += '<line class="eje" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke-dasharray="3 4"/><text x="' + (m.l - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end" font-size="12">' + miles(Math.round(v)) + '</text>'; });
    // marcas del eje x en valores redondos
    var rango = g.hasta - g.desde, px = Math.pow(10, Math.floor(Math.log10(rango / 5)));
    [1, 2, 2.5, 5, 10].some(function (k) { if (rango / (px * k) <= 6) { px *= k; return true; } return false; });
    for (xx = Math.ceil(g.desde / px - 1e-9) * px; xx <= g.hasta + 1e-9; xx += px) {
      s += '<line class="eje" x1="' + X(xx) + '" x2="' + X(xx) + '" y1="' + (H - m.b) + '" y2="' + (H - m.b + 5) + '"/>' +
           '<text x="' + X(xx) + '" y="' + (H - m.b + 19) + '" text-anchor="middle" font-size="12">' + num(xx, 2) + '</text>';
    }
    s += '<text x="' + ((m.l + W - m.r) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="12.5">' + g.eje + '</text>';
    s += '<text x="14" y="' + ((m.t + H - m.b) / 2) + '" text-anchor="middle" font-size="12.5" transform="rotate(-90 14 ' + ((m.t + H - m.b) / 2) + ')">Tamaño de muestra' + (log ? " (escala log)" : "") + '</text>';
    s += '<path class="linea" d="' + pts.map(function (p, j) { return (j ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join(" ") + '"/>';
    if (isFinite(ya)) {
      var cx = X(g.actual), cy = Y(ya), izq = cx > W * 0.62;
      s += '<circle class="punto" cx="' + cx + '" cy="' + cy + '" r="6"/>';
      s += '<text class="etq" x="' + (cx + (izq ? -10 : 10)) + '" y="' + (cy - 10) + '" text-anchor="' + (izq ? "end" : "start") + '" font-size="13">Tu supuesto: ' + miles(ya) + '</text>';
    }
    s += '<g id="g-hover" visibility="hidden"><circle class="punto" r="4.5" style="fill:var(--pr-turquesa)"/><text class="etq" font-size="12.5"></text></g>';
    s += '<rect x="' + m.l + '" y="' + m.t + '" width="' + (W - m.l - m.r) + '" height="' + (H - m.t - m.b) + '" fill="transparent" id="g-zona"/>';
    s += "</svg>";
    cont.innerHTML = s;
    var svg = cont.querySelector("svg"), hov = svg.querySelector("#g-hover"), zona = svg.querySelector("#g-zona");
    zona.addEventListener("pointermove", function (ev) {
      var b = svg.getBoundingClientRect(), px = (ev.clientX - b.left) / b.width * W;
      var best = pts[0]; pts.forEach(function (p) { if (Math.abs(X(p[0]) - px) < Math.abs(X(best[0]) - px)) best = p; });
      var c = hov.querySelector("circle"), tx = hov.querySelector("text"), hx = X(best[0]), hy = Y(best[1]), iz = hx > W * 0.62;
      c.setAttribute("cx", hx); c.setAttribute("cy", hy);
      tx.setAttribute("x", hx + (iz ? -9 : 9)); tx.setAttribute("y", hy + 18); tx.setAttribute("text-anchor", iz ? "end" : "start");
      tx.textContent = num(best[0], 2) + " → " + miles(best[1]);
      hov.setAttribute("visibility", "visible");
    });
    zona.addEventListener("pointerleave", function () { hov.setAttribute("visibility", "hidden"); });
  }

  // ---------- pintar ----------
  function actualizar() {
    var mod = modulo(), c = comunes();
    document.querySelectorAll(".modulo").forEach(function (d) { d.hidden = d.getAttribute("data-mod") !== mod; });
    $("pot-box").hidden = (mod === "prop" || mod === "dx");
    etiquetasDprop();
    var R;
    try { R = calcular(mod, c); $("r-error").hidden = true; }
    catch (err) {
      $("r-error").textContent = typeof err === "string" ? err : "No se pudo calcular con esos valores.";
      $("r-error").hidden = false; $("r-n").textContent = "—"; return;
    }
    $("r-n").textContent = miles(R.n);
    $("r-u").textContent = R.grupos.length && mod !== "dx" ? "participantes en total" : "participantes";
    $("r-grupos").innerHTML = R.grupos.map(function (g) { return "<span>" + g + "</span>"; }).join("");
    $("r-desglose").innerHTML = R.desglose.map(function (d) { return "<li>" + d + "</li>"; }).join("");
    $("r-avisos").hidden = !R.avisos.length;
    $("r-avisos-l").innerHTML = R.avisos.map(function (a) { return "<li>" + a + "</li>"; }).join("");
    $("r-parrafo").innerHTML = R.parrafo;
    $("r-codigo").textContent = R.codigo;
    $("g-titulo").textContent = R.graf.titulo; $("g-sub").textContent = R.graf.sub;
    $("r-lee").innerHTML = LEE[mod === "dprop" ? "dprop_" + $("dp-dis").value : mod] || "";
    graficar(R.graf);
  }

  function etiquetasDprop() {
    var dis = $("dp-dis").value;
    var lab = { cc: "% de expuestos entre los controles", co: "% de desenlace en los no expuestos (incidencia)", tr: "% de desenlace en los no expuestos (prevalencia)" };
    var ay = { cc: "En casos y controles es la frecuencia de la exposición en personas sin la enfermedad. Tómala de un antecedente o de una encuesta poblacional. No es la prevalencia de la enfermedad.",
               co: "Es la incidencia del desenlace en el grupo no expuesto durante el seguimiento. Tómala de una cohorte previa parecida a la tuya.",
               tr: "Es la prevalencia del desenlace entre quienes no tienen la exposición. Puedes obtenerla de un antecedente o de una encuesta nacional como la ENDES." };
    var med = { cc: ["odds-ratio", "odds ratio"], co: ["riesgo-relativo", "riesgo relativo"], tr: ["razon-de-prevalencias", "razón de prevalencias"] };
    $("dp-p0-lab").textContent = lab[dis];
    $("dp-p0-ayuda").textContent = ay[dis];
    var a = $("dp-ef-lab").querySelector("a.dic");
    a.textContent = med[dis][1]; a.setAttribute("href", "../../prospecto/diccionario.html#" + med[dis][0]);
    $("dp-ef-lab").firstChild.textContent = dis === "tr" ? "Mínima " : "Mínimo ";
    $("dp-r-lab").textContent = dis === "cc" ? "Controles por cada caso" : "No expuestos por cada expuesto";
    $("dp-r-box").hidden = dis === "tr"; $("dp-e-box").hidden = dis !== "tr";
  }

  // ---------- lecturas recomendadas según el diseño ----------
  var D = "../../disenos/", P = "../../prospecto/";
  var LEE = {
    prop: 'Lee más: <a href="' + D + 'transversal/index.html">el estudio transversal</a> y <a href="' + P + 'tabla-1/inicial.html">La Tabla 1 de tu tesis</a> (Prospecto R).',
    dprop_cc: 'Lee más: <a href="' + D + 'casos-y-controles/index.html">el estudio de casos y controles</a> y por qué ahí solo se estima el OR.',
    dprop_co: 'Lee más: <a href="' + D + 'cohortes/index.html">el estudio de cohortes</a> y cómo se calcula el riesgo relativo.',
    dprop_tr: 'Lee más: <a href="' + D + 'transversal/index.html">el estudio transversal</a> y <a href="' + P + 'or-vs-rp/inicial.html">¿OR o razón de prevalencias?</a> (Prospecto R).',
    med: '¿Qué prueba usarás después? Míralo en el <a href="../../blog/que-prueba-estadistica/index.html#haz-tu-triaje">Triaje estadístico</a>.',
    dx: 'Para analizar tu prueba diagnóstica, revisa la receta de validez en el <a href="../../blog/que-prueba-estadistica/index.html#haz-tu-triaje">Triaje estadístico</a>.',
    cor: 'Pearson o Spearman: decídelo en el <a href="../../blog/que-prueba-estadistica/index.html#haz-tu-triaje">Triaje estadístico</a>.'
  };

  // abre la calculadora ya configurada desde un enlace: #mod=dprop&dis=cc
  function desdeEnlace() {
    var h = new URLSearchParams(location.hash.replace(/^#/, ""));
    var mod = h.get("mod");
    if (mod && document.querySelector('input[name="mod"][value="' + mod + '"]')) {
      document.querySelector('input[name="mod"][value="' + mod + '"]').checked = true;
      var dis = h.get("dis");
      if (dis && document.querySelector('#dp-dis option[value="' + dis + '"]')) $("dp-dis").value = dis;
    }
  }

  // ---------- eventos ----------
  function iniciar() {
    desdeEnlace();
    // deslizadores sincronizados con su casilla numérica
    document.querySelectorAll('input[type=range][data-par]').forEach(function (rg) {
      var nb = $(rg.getAttribute("data-par"));
      rg.addEventListener("input", function () { nb.value = rg.value; actualizar(); });
      nb.addEventListener("input", function () { var v = val(nb.id); if (!isNaN(v)) rg.value = v; });
    });
    $("prop-clu").addEventListener("change", function () { $("prop-deff-box").hidden = !this.checked; });
    $("calc").addEventListener("input", actualizar);
    $("calc").addEventListener("change", actualizar);
    // copiar
    document.querySelectorAll("[data-copiar]").forEach(function (b) {
      var etq = b.textContent;
      b.addEventListener("click", function () {
        var el = $(b.getAttribute("data-copiar")), t = el.innerText.replace(/ /g, " ").trim();
        var listo = function () { b.textContent = "¡Copiado!"; setTimeout(function () { b.textContent = etq; }, 1800); };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(listo);
        else { var ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); listo(); }
      });
    });
    window.addEventListener("hashchange", function () { desdeEnlace(); actualizar(); });
    actualizar();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
