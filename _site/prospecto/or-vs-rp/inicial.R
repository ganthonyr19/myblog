# ¿OR o razón de prevalencias? · Prospecto R n.º 1 · dosis inicial
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
                     labels = scales::label_percent(decimal.mark = ",", suffix = " %")) +
  scale_y_continuous("Odds ratio", labels = scales::label_number(decimal.mark = ",")) +
  scale_colour_manual("Razón de prevalencias", values = c("#4FC3C8", "#7FB2F0", "#E5636F")) +
  theme_minimal(base_size = 13) +
  theme(legend.position = "top")

# ---- preparacion ----
library(data.table)

ruta <- "ENDES/2024"   # carpeta con los módulos descomprimidos
if (!dir.exists(ruta)) stop("No encuentro la carpeta '", ruta, "'. Revisa el Paso 1 o cambia `ruta`.")

# 1. lee solo las columnas que se usan
salud <- fread(file.path(ruta, "968-Modulo1640/CSALUD01_2024.csv"), encoding = "UTF-8",
               select = c("HHID", "QS20C", "QSSEXO", "QS23", "QS907", "QS908", "PESO15_AMAS"))
mujer <- fread(file.path(ruta, "968-Modulo1632/RE223132_2024.csv"), encoding = "UTF-8",
               select = c("CASEID", "V213"))

# 2. une los módulos: la mujer se identifica por su hogar (HHID) y su número de línea
salud[, HHID := trimws(HHID)]
mujer[, `:=`(HHID  = trimws(substr(CASEID, 1, nchar(CASEID) - 3)),
             QS20C = as.integer(substr(CASEID, nchar(CASEID) - 1, nchar(CASEID))))]
d <- merge(salud, mujer[, .(HHID, QS20C, V213)], by = c("HHID", "QS20C"), all.x = TRUE)

# 3. crea las variables
d <- d[!is.na(PESO15_AMAS)]                                  # personas con entrevista de salud
d[, sexo := factor(QSSEXO, 1:2, c("Hombre", "Mujer"))]
d[, edad := cut(QS23, c(15, 30, 45, 60, Inf), right = FALSE,
                labels = c("15-29", "30-44", "45-59", "60+"))]
d[, gestante := !is.na(V213) & V213 == 1]                    # V213 = 1: embarazada ahora
d[, cintura := fifelse(QS908 == 1 & QS907 >= 55 & QS907 <= 170, as.numeric(QS907), NA_real_)]
d[gestante == TRUE, cintura := NA]
d[, obes_abd := as.integer(fifelse(sexo == "Mujer", cintura > 88, cintura > 102))]

# 4. quédate con quienes tienen la medición válida
dc <- d[!is.na(obes_abd)]
nrow(dc)

# ---- tabla ----
tab <- table(Sexo = relevel(dc$sexo, ref = "Mujer"),
             Obesidad = factor(dc$obes_abd, levels = c(1, 0), labels = c("Sí", "No")))
tab

# ---- a-mano ----
a  <- tab["Mujer", "Sí"];  b  <- tab["Mujer", "No"]    # expuestas
cc <- tab["Hombre", "Sí"]; dd <- tab["Hombre", "No"]   # no expuestos
p1 <- a / (a + b)     # prevalencia en mujeres
p0 <- cc / (cc + dd)  # prevalencia en hombres
c(P1 = p1, P0 = p0, RP = p1 / p0, OR = (a * dd) / (b * cc))

# ---- epir ----
library(epiR)
res <- epi.2by2(tab, method = "cross.sectional")
# las dos medidas que interesan, redondeadas
cbind(res$massoc.summary[1:2, "var", drop = FALSE], round(res$massoc.summary[1:2, -1], 2))

# ---- epir-texto (cifras auxiliares para el texto) ----
rp <- unlist(res$massoc.summary[res$massoc.summary$var == "Prev risk ratio", c("est", "lower", "upper")])
or <- unlist(res$massoc.summary[res$massoc.summary$var == "Prev odds ratio", c("est", "lower", "upper")])

# ---- poisson ----
library(sandwich)
library(lmtest)
m_rp <- glm(obes_abd ~ sexo, data = dc, family = poisson(link = "log"))
ic_rp <- coefci(m_rp, vcov. = vcovHC(m_rp, type = "HC0"))
exp(cbind(RP = coef(m_rp), ic_rp))["sexoMujer", ]

# ---- poisson-ajustado ----
m_rp_aj <- glm(obes_abd ~ sexo + edad, data = dc, family = poisson(link = "log"))
ic_aj <- coefci(m_rp_aj, vcov. = vcovHC(m_rp_aj, type = "HC0"))
rp_aj <- exp(cbind(RP = coef(m_rp_aj), ic_aj))["sexoMujer", ]
rp_aj

# ---- logistica ----
m_or <- glm(obes_abd ~ sexo, data = dc, family = binomial)
exp(cbind(OR = coef(m_or), confint.default(m_or)))["sexoMujer", ]

# ---- resultado-texto (cifras auxiliares para el texto) ----
ic <- function(x) sprintf("%s (IC 95 %%: %s a %s)", fmt(x[1]), fmt(x[2]), fmt(x[3]))
