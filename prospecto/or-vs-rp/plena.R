# ¿OR o razón de prevalencias? · Prospecto R n.º 1 · dosis plena
# Prospecto R · Anthony Romero Cerdán · anthonyromero.netlify.app/prospecto
# Datos: ENDES 2024 (INEI). Descárgalos como indica el Paso 1 del tutorial.

options(OutDec = ",")
fmt <- function(x, d = 2) formatC(x, format = "f", digits = d, decimal.mark = ",", big.mark = "\u00a0")
pct <- function(x, d = 1) paste0(fmt(100 * x, d), "\u00a0%")

# ---- fig-teoria ----
library(ggplot2)
teoria <- expand.grid(p0 = seq(0.01, 0.30, by = 0.005), rp = c(1.5, 2, 3))
teoria$p1 <- teoria$p0 * teoria$rp
teoria$or <- with(teoria, (p1 / (1 - p1)) / (p0 / (1 - p0)))
ggplot(teoria, aes(p0, or, colour = factor(rp))) +
  geom_hline(aes(yintercept = rp, colour = factor(rp)), linetype = "dashed") +
  geom_line(linewidth = 1) +
  scale_x_continuous("Prevalencia en no expuestos (P0)",
                     labels = scales::label_percent(decimal.mark = ",", suffix = "\u00a0%")) +
  scale_y_continuous("Odds ratio", labels = scales::label_number(decimal.mark = ",")) +
  scale_colour_manual("Razón de prevalencias", values = c("#4FC3C8", "#7FB2F0", "#E5636F")) +
  theme_minimal(base_size = 13) +
  theme(legend.position = "top")

# ---- lectura ----
library(data.table)

ruta <- "ENDES/2024"   # carpeta con los módulos descomprimidos
if (!dir.exists(ruta)) stop("No encuentro la carpeta '", ruta, "'. Revisa el Paso 1 o cambia `ruta`.")

salud <- fread(file.path(ruta, "968-Modulo1640/CSALUD01_2024.csv"), encoding = "UTF-8")
hogar <- fread(file.path(ruta, "968-Modulo1629/RECH0_2024.csv"), encoding = "UTF-8",
               select = c("HHID", "HV001", "HV022", "HV025"))
mujer <- fread(file.path(ruta, "968-Modulo1632/RE223132_2024.csv"), encoding = "UTF-8",
               select = c("CASEID", "V213"))

# la llave del hogar trae espacios a la izquierda: hay que limpiarla
salud[, HHID := trimws(HHID)]
hogar[, HHID := trimws(HHID)]

# CASEID = hogar + número de línea de la mujer
mujer[, `:=`(HHID  = trimws(substr(CASEID, 1, nchar(CASEID) - 3)),
             linea = as.integer(substr(CASEID, nchar(CASEID) - 1, nchar(CASEID))))]

d <- merge(salud, hogar, by = "HHID")
d <- merge(d, mujer[, .(HHID, linea, V213)],
           by.x = c("HHID", "QS20C"), by.y = c("HHID", "linea"), all.x = TRUE)
nrow(d)
n_union <- nrow(d)

# ---- variables ----
d <- d[!is.na(PESO15_AMAS)]                     # personas con entrevista de salud
d[, peso  := PESO15_AMAS / 1e6]                 # el factor viene con 6 decimales implícitos
d[, mujer := factor(QSSEXO, 1:2, c("Hombre", "Mujer"))]
d[, area  := factor(HV025, 1:2, c("Urbana", "Rural"))]
d[, edad  := cut(QS23, c(15, 30, 45, 60, Inf), right = FALSE,
                 labels = c("15-29", "30-44", "45-59", "60+"))]
d[, gestante := !is.na(V213) & V213 == 1]

# perímetro abdominal válido: medido (QS908 = 1) y dentro del rango del diccionario
d[, cintura := fifelse(QS908 == 1 & QS907 >= 55 & QS907 <= 170, as.numeric(QS907), NA_real_)]
d[gestante == TRUE, cintura := NA]
d[, obes_abd := as.integer(fifelse(mujer == "Mujer", cintura > 88, cintura > 102))]

d[, .N, by = .(mujer, medida = !is.na(obes_abd))][order(mujer, medida)]

# ---- diseno ----
library(survey)
options(survey.lonely.psu = "adjust")

diseno <- svydesign(ids = ~HV001, strata = ~HV022, weights = ~peso,
                    data = d, nest = TRUE)
dis_cint <- subset(diseno, !is.na(obes_abd))

# ---- prevalencias ----
prev <- svyby(~obes_abd, ~mujer, dis_cint, svymean)
prev

# ---- prev-texto (cifras auxiliares para el texto) ----
p_h <- coef(prev)[["Hombre"]]; p_m <- coef(prev)[["Mujer"]]
n_cint <- nrow(dis_cint)

# ---- rp ----
m_rp <- svyglm(obes_abd ~ mujer, design = dis_cint, family = quasipoisson(link = "log"))
rp <- exp(cbind(RP = coef(m_rp), confint(m_rp)))["mujerMujer", ]
rp

# ---- or ----
m_or <- svyglm(obes_abd ~ mujer, design = dis_cint, family = quasibinomial())
or <- exp(cbind(OR = coef(m_or), confint(m_or)))["mujerMujer", ]
or

# ---- comprobacion ----
p_m / p_h
(p_m / (1 - p_m)) / (p_h / (1 - p_h))

# ---- resultado-texto (cifras auxiliares para el texto) ----
rp_txt <- sprintf("%s (IC 95\u00a0%%: %s a %s)", fmt(rp[1]), fmt(rp[2]), fmt(rp[3]))
or_txt <- sprintf("%s (IC 95\u00a0%%: %s a %s)", fmt(or[1]), fmt(or[2]), fmt(or[3]))

# ---- ajuste ----
m_rp_aj <- svyglm(obes_abd ~ mujer + edad + area, design = dis_cint,
                  family = quasipoisson(link = "log"))
m_or_aj <- svyglm(obes_abd ~ mujer + edad + area, design = dis_cint,
                  family = quasibinomial())
ajustados <- rbind(
  RP = exp(c(coef(m_rp_aj)["mujerMujer"], confint(m_rp_aj)["mujerMujer", ])),
  OR = exp(c(coef(m_or_aj)["mujerMujer"], confint(m_or_aj)["mujerMujer", ]))
)
colnames(ajustados) <- c("Estimación", "IC 2,5 %", "IC 97,5 %")
round(ajustados, 2)

# ---- sin-diseno ----
dc <- d[!is.na(obes_abd)]
# 1. sin pesos: prevalencias de la muestra, no de la población
sin_pesos <- dc[, .(prevalencia = mean(obes_abd)), by = mujer]
sin_pesos
rp_sp <- sin_pesos[mujer == "Mujer", prevalencia] / sin_pesos[mujer == "Hombre", prevalencia]
rp_sp
# 2. con pesos pero sin conglomerados ni estratos: el error estándar cambia
dis_ingenuo <- svydesign(ids = ~1, weights = ~peso, data = dc)
m_ingenuo <- svyglm(obes_abd ~ mujer, design = dis_ingenuo, family = quasipoisson(link = "log"))
c(diseno_completo = SE(m_rp)[["mujerMujer"]], solo_pesos = SE(m_ingenuo)[["mujerMujer"]])

# ---- sin-diseno-texto (cifras auxiliares para el texto) ----
pm_sp <- sin_pesos[mujer == "Mujer", prevalencia]; ph_sp <- sin_pesos[mujer == "Hombre", prevalencia]

# ---- estandarizacion ----
mf <- model.frame(m_or_aj)
w  <- weights(dis_cint)
todas_mujeres  <- transform(mf, mujer = factor("Mujer",  levels(mf$mujer)))
todos_hombres  <- transform(mf, mujer = factor("Hombre", levels(mf$mujer)))
p1 <- predict(m_or_aj, newdata = todas_mujeres, type = "response")
p0 <- predict(m_or_aj, newdata = todos_hombres, type = "response")
weighted.mean(p1, w) / weighted.mean(p0, w)

# ---- estandarizacion-me ----
library(marginaleffects)
rp_std <- avg_comparisons(m_or_aj, variables = "mujer",
                          comparison = "ratioavg", wts = "(weights)")
as.data.frame(rp_std)[, c("contrast", "estimate", "conf.low", "conf.high")]

# ---- estandarizacion-texto (cifras auxiliares para el texto) ----
rp_mal <- avg_comparisons(m_or_aj, variables = "mujer", comparison = "ratio", wts = "(weights)")$estimate

# ---- log-binomial ----
m_lb <- tryCatch(
  svyglm(obes_abd ~ mujer + edad + area, design = dis_cint,
         family = quasibinomial(link = "log")),
  error = function(e) conditionMessage(e))
m_lb

# ---- control ----
d[, pas := (QS903S + QS905S) / 2][, pad := (QS903D + QS905D) / 2]
d[QS906 != 1 | is.na(QS906) | QS903S >= 999 | QS905S >= 999 |
    QS903D >= 999 | QS905D >= 999, c("pas", "pad") := NA]
d[, pa_alta := as.integer(pas >= 140 | pad >= 90)]
diseno <- svydesign(ids = ~HV001, strata = ~HV022, weights = ~peso, data = d, nest = TRUE)
dis_pa <- subset(diseno, !is.na(pa_alta) & !gestante)
svymean(~pa_alta, dis_pa)
svyby(~pa_alta, ~mujer, dis_pa, svymean)

# ---- control-texto (cifras auxiliares para el texto) ----
ctrl <- coef(svymean(~pa_alta, dis_pa)); ctrl_s <- coef(svyby(~pa_alta, ~mujer, dis_pa, svymean))
