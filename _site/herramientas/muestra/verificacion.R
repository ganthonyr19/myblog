# Verificación del motor de la calculadora contra R (epiR, stats, pwr)
# Uso: Rscript verificacion.R ruta/js_grid.json   (la grilla la genera Node con motor.js)
suppressMessages({library(jsonlite); library(epiR)})  # además: EnvStats, pwr
g <- fromJSON(commandArgs(TRUE)[1])

# 1. Una proporción: fórmula de Lwanga y Lemeshow con corrección por población finita
r1 <- with(g$prop, mapply(function(p, d, N, conf) {
  z <- qnorm(1 - (1 - conf) / 2); n0 <- z^2 * p * (1 - p) / d^2
  if (N > 0) n0 <- n0 / (1 + (n0 - 1) / N); ceiling(n0 - 1e-9)
}, p, d, N, conf))
e1 <- with(g$prop, mapply(function(p, d, N, conf)
  epi.sssimpleestb(N = if (N > 0) N else NA, Py = p, epsilon = d, error = "absolute",
                   se = 1, sp = 1, nfractional = FALSE, conf.level = conf), p, d, N, conf))
cat("Una proporción  · JS = fórmula R:", all(g$prop$n == r1), "\n")
# Sin población finita, epiR coincide siempre. Con N, epiR usa n0 / (1 + n0 / N) y puede dar 1 menos;
# la calculadora usa n0 / (1 + (n0 - 1) / N), la fórmula clásica N z² p q / [d² (N - 1) + z² p q].
sinN <- g$prop$N == 0
cat("Una proporción  · JS = epiR sin N:", all(g$prop$n[sinN] == unlist(e1)[sinN]),
    " · con N, máx. diferencia:", max(abs(g$prop$n - unlist(e1))), "\n")

# 2. Dos proporciones: Fleiss con y sin corrección de continuidad, contra EnvStats::propTestN()
#    (epiR::epi.sscc(fleiss = TRUE) devuelve NA en epiR 2.0.99, por eso no se usa)
e2 <- with(g$dp, mapply(function(p0, OR, r, cc, pot) { p1 <- OR * p0 / (1 + p0 * (OR - 1))
  x <- EnvStats::propTestN(p.or.p1 = p1, p0.or.p2 = p0, alpha = .05, power = pot, sample.type = "two.sample",
                           ratio = r, correct = cc, round.up = FALSE, warn = FALSE)
  if (is.list(x)) x$n1 else x }, p0, OR, r, cc, pot))   # con r = 1 devuelve un número
cat("Dos proporciones · |n JS - EnvStats| máx:", signif(max(abs(g$dp$c1 - e2)), 3), "\n")
s <- subset(g$dp, r == 1 & !cc)
pp <- with(s, mapply(function(p0, OR, pot) { p1 <- OR * p0 / (1 + p0 * (OR - 1))
  power.prop.test(p1 = p1, p2 = p0, power = pot)$n }, p0, OR, pot))
cat("Dos proporciones · |n JS - power.prop.test| máx (r=1, sin CC):", signif(max(abs(s$c1 - pp)), 3), "\n")

# 3. Dos medias: t no central. r = 1 contra power.t.test(); r != 1 recalculando la potencia en R
s <- subset(g$med, r == 1)
pt1 <- with(s, mapply(function(dif, sd, pot) power.t.test(delta = dif, sd = sd, power = pot)$n, dif, sd, pot))
cat("Dos medias · |n JS - power.t.test| máx (r=1):", signif(max(abs(s$c1 - pt1)), 3), "\n")
s <- subset(g$med, r != 1)
pot_r <- with(s, mapply(function(dif, sd, r, c1) { n2 <- r * c1; df <- c1 + n2 - 2
  ncp <- (dif / sd) / sqrt(1 / c1 + 1 / n2); 1 - pt(qt(.975, df), df, ncp) }, dif, sd, r, c1))
cat("Dos medias · |potencia en R - objetivo| máx (r!=1):", signif(max(abs(pot_r - s$pot)), 3), "\n")

# 4. Diagnóstica: Buderer (1996)
b <- with(g$dx, mapply(function(se, sp, prev, d) { z <- qnorm(.975)
  max(ceiling(z^2 * se * (1 - se) / (d^2 * prev) - 1e-9), ceiling(z^2 * sp * (1 - sp) / (d^2 * (1 - prev)) - 1e-9)) },
  se, sp, prev, d))
cat("Diagnóstica · JS = Buderer en R:", all(g$dx$n == b), "\n")

# 5. Correlación: z de Fisher; referencia pwr.r.test
cr <- with(g$cor, mapply(function(rho, pot) ceiling(((qnorm(.975) + qnorm(pot)) / atanh(rho))^2 + 3 - 1e-9), rho, pot))
pw <- with(g$cor, mapply(function(rho, pot) ceiling(pwr::pwr.r.test(r = rho, power = pot)$n), rho, pot))
cat("Correlación · JS = fórmula R:", all(g$cor$n == cr), "\n"); print(cbind(g$cor[, c("rho","pot","n")], pwr.r.test = pw))
