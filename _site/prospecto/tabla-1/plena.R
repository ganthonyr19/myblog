# La Tabla 1 de tu tesis · Prospecto R n.º 2 · dosis plena
# Prospecto R · Anthony Romero Cerdán · anthonyromero.netlify.app/prospecto
# Datos: ENDES 2024 (INEI). Descárgalos como indica el Paso 1 del tutorial.

options(OutDec = ",")
fmt <- function(x, d = 2) formatC(x, format = "f", digits = d, decimal.mark = ",", big.mark = "\u00a0")
pct <- function(x, d = 1) paste0(fmt(100 * x, d), "\u00a0%")

# ---- preparacion ----
library(data.table)

ruta <- "ENDES/2024"   # carpeta con los módulos descomprimidos
if (!dir.exists(ruta)) stop("No encuentro la carpeta '", ruta, "'. Revisa el Paso 1 o cambia `ruta`.")

# 1. lee solo las columnas que se usan
salud <- fread(file.path(ruta, "968-Modulo1640/CSALUD01_2024.csv"), encoding = "UTF-8",
               select = c("HHID", "QS20C", "QSSEXO", "QS23", "QS109", "QS200", "QS201",
                          "QS206", "QS208", "QS210", "QS903S", "QS903D", "QS905S",
                          "QS905D", "QS906", "PESO15_AMAS"))
hogar <- fread(file.path(ruta, "968-Modulo1629/RECH0_2024.csv"),
               select = c("HHID", "HV001", "HV022", "HV025"))
miembros <- fread(file.path(ruta, "968-Modulo1629/RECH1_2024.csv"),
                  select = c("HHID", "HVIDX", "HV106"))
vivienda <- fread(file.path(ruta, "968-Modulo1630/RECH23_2024.csv"),
                  select = c("HHID", "SHREGION", "HV270"))
mujer <- fread(file.path(ruta, "968-Modulo1632/RE223132_2024.csv"), encoding = "UTF-8",
               select = c("CASEID", "V213"))

# 2. une los módulos: el hogar por HHID; la persona por HHID + número de línea
for (x in list(salud, hogar, miembros, vivienda)) x[, HHID := trimws(HHID)]
mujer[, `:=`(HHID  = trimws(substr(CASEID, 1, nchar(CASEID) - 3)),
             QS20C = as.integer(substr(CASEID, nchar(CASEID) - 1, nchar(CASEID))))]
d <- merge(salud, hogar, by = "HHID")
d <- merge(d, vivienda, by = "HHID", all.x = TRUE)
d <- merge(d, miembros, by.x = c("HHID", "QS20C"), by.y = c("HHID", "HVIDX"), all.x = TRUE)
d <- merge(d, mujer[, .(HHID, QS20C, V213)], by = c("HHID", "QS20C"), all.x = TRUE)
d <- d[!is.na(PESO15_AMAS)]                     # personas con entrevista de salud

# 3. desenlace: presión arterial alta según el promedio de dos mediciones
d[, pas := (QS903S + QS905S) / 2][, pad := (QS903D + QS905D) / 2]
d[QS906 != 1 | is.na(QS906) | QS903S >= 999 | QS905S >= 999 |
    QS903D >= 999 | QS905D >= 999, c("pas", "pad") := NA]
d[, pa_alta := factor(as.integer(pas >= 140 | pad >= 90), levels = 0:1,
                      labels = c("Sin presión arterial alta", "Con presión arterial alta"))]
d[, gestante := !is.na(V213) & V213 == 1]

# 4. características de los participantes
d[, edad       := QS23]
d[, grupo_edad := cut(QS23, c(15, 30, 45, 60, Inf), right = FALSE,
                      labels = c("15 a 29", "30 a 44", "45 a 59", "60 a más"))]
d[, sexo       := factor(QSSEXO, 1:2, c("Hombre", "Mujer"))]
d[, area       := factor(HV025, 1:2, c("Urbana", "Rural"))]
d[, region     := factor(SHREGION, 1:4, c("Lima Metropolitana", "Resto de la Costa", "Sierra", "Selva"))]
d[, educacion  := factor(fifelse(HV106 == 8, NA_integer_, HV106), 0:3,
                         c("Sin nivel o inicial", "Primaria", "Secundaria", "Superior"))]
d[, riqueza    := factor(HV270, 1:5, c("Quintil 1 (más pobre)", "Quintil 2", "Quintil 3",
                                       "Quintil 4", "Quintil 5 (más rico)"))]
d[, fuma       := fcase(QS200 == 2, FALSE, QS200 == 1 & QS201 == 1, TRUE,
                        QS200 == 1 & QS201 == 2, FALSE, default = NA)]
d[, alcohol    := fcase(QS206 == 2 | QS208 == 2, FALSE, QS210 == 1, TRUE,
                        QS210 == 2, FALSE, default = NA)]
d[, diabetes   := fcase(QS109 == 1, TRUE, QS109 == 2, FALSE, default = NA)]

# 5. participantes: presión arterial medida y no gestantes (criterio del INEI)
participantes <- d[!is.na(pa_alta) & !gestante]
nrow(participantes)

# ---- diseno ----
library(survey)
options(survey.lonely.psu = "adjust")

d[, peso := PESO15_AMAS / 1e6]                  # el factor viene con 6 decimales implícitos
diseno <- svydesign(ids = ~HV001, strata = ~HV022, weights = ~peso, data = d, nest = TRUE)
dis_part <- subset(diseno, !is.na(pa_alta) & !gestante)

# ---- tabla-cruda ----
library(gtsummary)
theme_gtsummary_language("es", decimal.mark = ",", big.mark = " ")

variables <- c("edad", "grupo_edad", "sexo", "area", "region", "educacion",
               "riqueza", "fuma", "alcohol", "diabetes")
tbl_svysummary(dis_part, by = pa_alta, include = all_of(variables))

# ---- n-ponderada (cifras auxiliares para el texto) ----
n_pond <- sum(weights(dis_part))

# ---- tabla-final ----
etiquetas <- list(
  edad ~ "Edad (años)", grupo_edad ~ "Grupo de edad", sexo ~ "Sexo",
  area ~ "Área de residencia", region ~ "Región natural",
  educacion ~ "Nivel educativo", riqueza ~ "Índice de riqueza",
  fuma ~ "Fuma actualmente", alcohol ~ "Consumió alcohol en los últimos 30 días",
  diabetes ~ "Diabetes diagnosticada"
)
tabla_1 <- tbl_svysummary(
  dis_part,
  by = pa_alta,
  include = all_of(variables),
  label = etiquetas,
  statistic = list(all_continuous() ~ "{median} ({p25} – {p75})",
                   all_categorical() ~ "{n_unweighted} ({p} %)"),
  digits = list(all_categorical() ~ c(0, 1)),
  missing_text = "Sin dato"
) |>
  add_overall(last = FALSE) |>
  add_p() |>
  modify_header(all_stat_cols() ~ "**{level}**  \nn = {style_number(n_unweighted)}") |>
  modify_footnote_header("n sin ponderar (% ponderado); mediana ponderada (Q1 – Q3)",
                         columns = all_stat_cols()) |>
  modify_footnote_header("Prueba de rangos basada en el diseño; chi cuadrado de Pearson con corrección de Rao-Scott",
                         columns = p.value) |>
  bold_labels()
tabla_1

# ---- pruebas-texto (cifras auxiliares para el texto) ----
pv <- function(t, v) t$table_body$p.value[t$table_body$variable == v & t$table_body$row_type == "label"]
celda <- function(var, nivel, grupo) {
  x <- participantes[pa_alta == grupo]
  sprintf("%s (%s)", fmt(sum(x[[var]] == nivel, na.rm = TRUE), 0),
          pct(coef(svymean(as.formula(paste0("~I(", var, " == '", nivel, "')")),
                           subset(dis_part, pa_alta == grupo), na.rm = TRUE))[2]))
}
hombres_con <- celda("sexo", "Hombre", "Con presión arterial alta")

# ---- tabla-filas ----
dis_part <- update(dis_part, alta = as.numeric(pa_alta == "Con presión arterial alta"))
categoricas <- setdiff(variables, "edad")

prevalencia <- function(var) {
  r <- svyby(~alta, as.formula(paste0("~", var)), dis_part, svyciprop,
             vartype = "ci", method = "logit", na.rm = TRUE)
  data.frame(
    Característica = var,
    Categoría = c("FALSE" = "No", "TRUE" = "Sí")[as.character(r[[var]])] |>
      (\(x) ifelse(is.na(x), as.character(r[[var]]), x))(),
    n = fmt(as.integer(table(participantes[[var]])[as.character(r[[var]])]), 0),
    Prevalencia = sprintf("%s (%s a %s)", pct(r$alta), pct(r$ci_l), pct(r$ci_u))
  )
}
total <- svyciprop(~alta, dis_part, method = "logit")
tabla_2 <- rbind(
  data.frame(Característica = "Total", Categoría = "", n = fmt(nrow(participantes), 0),
             Prevalencia = sprintf("%s (%s a %s)", pct(coef(total)),
                                   pct(confint(total)[1]), pct(confint(total)[2]))),
  do.call(rbind, lapply(categoricas, prevalencia))
)
tabla_2$Característica <- vapply(tabla_2$Característica, function(v) {
  i <- vapply(etiquetas, function(f) all.vars(f)[1] == v, logical(1))
  if (any(i)) as.character(etiquetas[[which(i)]][[3]]) else v
}, character(1))
tabla_2$Característica[duplicated(tabla_2$Característica)] <- ""
names(tabla_2)[3:4] <- c("n sin ponderar", "Prevalencia (IC 95 %)")
gt::gt(tabla_2)

# ---- word ----
as_flex_table(tabla_1) |>
  flextable::save_as_docx(path = "tabla1_plena.docx")
flextable::flextable(tabla_2) |>
  flextable::autofit() |>
  flextable::save_as_docx(path = "tabla2_plena.docx")

# ---- resultado-texto (cifras auxiliares para el texto) ----
prev_por <- function(var, nivel) {
  r <- svyby(~alta, as.formula(paste0("~", var)), dis_part, svyciprop, vartype = "ci", method = "logit")
  pct(r$alta[as.character(r[[var]]) == nivel])
}
mediana_pond <- function(g) fmt(coef(svyquantile(~edad, subset(dis_part, pa_alta == g), 0.5)), 0)
con_g <- "Con presión arterial alta"; sin_g <- "Sin presión arterial alta"
p_alcohol_pond <- pv(tabla_1, "alcohol")
p_alcohol_muestra <- pv(tbl_summary(participantes[, .(alcohol, pa_alta)], by = pa_alta) |> add_p(), "alcohol")

# ---- muestra-vs-poblacion ----
comparar <- function(var, nivel) data.frame(
  Variable = paste(var, "=", nivel),
  Muestra = pct(mean(participantes[[var]] == nivel)),
  Población = pct(coef(svymean(as.formula(paste0("~I(", var, " == '", nivel, "')")), dis_part))[2])
)
rbind(comparar("area", "Rural"), comparar("region", "Lima Metropolitana"),
      comparar("riqueza", "Quintil 1 (más pobre)"))
