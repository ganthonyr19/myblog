# La Tabla 1 de tu tesis <U+00B7> Prospecto R n.<U+00BA> 2 <U+00B7> dosis inicial
# Prospecto R <U+00B7> Anthony Romero Cerd<U+00E1>n <U+00B7> anthonyromero.netlify.app/prospecto
# Datos: ENDES 2024 (INEI). Desc<U+00E1>rgalos como indica el Paso 1 del tutorial.

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

# ---- tabla-cruda ----
library(gtsummary)
theme_gtsummary_language("es", decimal.mark = ",", big.mark = " ")

variables <- c("edad", "grupo_edad", "sexo", "area", "region", "educacion",
               "riqueza", "fuma", "alcohol", "diabetes")
tabla <- participantes[, c(variables, "pa_alta"), with = FALSE]

tbl_summary(tabla, by = pa_alta)

# ---- tabla-final ----
tabla_1 <- tbl_summary(
  tabla,
  by = pa_alta,
  label = list(
    edad ~ "Edad (años)", grupo_edad ~ "Grupo de edad", sexo ~ "Sexo",
    area ~ "Área de residencia", region ~ "Región natural",
    educacion ~ "Nivel educativo", riqueza ~ "Índice de riqueza",
    fuma ~ "Fuma actualmente", alcohol ~ "Consumió alcohol en los últimos 30 días",
    diabetes ~ "Diabetes diagnosticada"
  ),
  statistic = list(all_categorical() ~ "{n} ({p} %)"),
  digits = list(all_categorical() ~ c(0, 1)),
  missing_text = "Sin dato"
) |>
  add_overall(last = FALSE) |>
  add_p() |>
  modify_header(label ~ "**Característica**") |>
  modify_footnote_header("Mediana (Q1 – Q3); n (%)", columns = all_stat_cols()) |>
  bold_labels()
tabla_1

# ---- word ----
as_flex_table(tabla_1) |>
  flextable::save_as_docx(path = "tabla1_inicial.docx")

# ---- resultado-texto (cifras auxiliares para el texto) ----
grupo <- function(g) participantes[pa_alta == g]
con <- grupo("Con presión arterial alta"); sin <- grupo("Sin presión arterial alta")
med <- function(x) fmt(median(x), 0)
prop <- function(x) pct(mean(x, na.rm = TRUE))
