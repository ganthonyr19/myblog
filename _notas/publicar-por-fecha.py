#!/usr/bin/env python3
"""Publicación escalonada de las series Caso clínico estadístico y Vademécum.

Cada entrada (casos/<slug>/index.qmd y vademecum/<slug>/index.qmd) tiene su
fecha en el YAML. Este script compara esa fecha con la de hoy (o la que se
indique) y deja el sitio coherente:

  - fecha futura  -> `draft: true` en el YAML y, en la portada de la serie,
                     la tarjeta queda como «pronto» (sin enlace, con la fecha).
  - fecha cumplida -> se quita `draft: true` y la tarjeta vuelve a enlazar.

También avisa si una entrada publicada enlaza a otra que sigue en borrador,
y lista los archivos que hay que renderizar.

Uso (desde la raíz del repo):
    python3 _notas/publicar-por-fecha.py                 # usa la fecha de hoy
    python3 _notas/publicar-por-fecha.py --hoy 2026-11-03
    python3 _notas/publicar-por-fecha.py --simular       # solo muestra, no cambia nada
"""
import argparse
import datetime as dt
import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SERIES = ["casos", "vademecum"]
MESES = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.",
         "jul.", "ago.", "set.", "oct.", "nov.", "dic."]


def leer_fecha(texto):
    m = re.search(r"^date:\s*(\d{4}-\d{2}-\d{2})\s*$", texto, re.M)
    return dt.date.fromisoformat(m.group(1)) if m else None


def fijar_draft(texto, borrador):
    yaml_fin = texto.index("\n---", 3)
    cab, resto = texto[:yaml_fin], texto[yaml_fin:]
    cab = re.sub(r"\ndraft:\s*true[^\n]*", "", cab)
    if borrador:
        cab = re.sub(r"(\ndate:[^\n]*)", r"\1\ndraft: true", cab, count=1)
    return cab + resto


def tarjeta(slug, interior, borrador, fecha):
    interior = re.sub(r" · \d{1,2} [a-z]{3,4}\.</span>", "</span>", interior, count=1)
    if borrador:
        etiqueta = f" · {fecha.day} {MESES[fecha.month - 1]}"
        interior = re.sub(r'(<span class="n">[^<]*)</span>', r"\1" + etiqueta + "</span>",
                          interior, count=1)
        return f'<div class="serie-item pronto" data-slug="{slug}">{interior}</div>'
    return f'<a class="serie-item" href="{slug}/index.html">{interior}</a>'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--hoy", type=dt.date.fromisoformat, default=dt.date.today())
    ap.add_argument("--simular", action="store_true")
    a = ap.parse_args()

    estado = {}          # (serie, slug) -> (fecha, borrador)
    cambiados = []
    for serie in SERIES:
        for qmd in sorted((RAIZ / serie).glob("*/index.qmd")):
            slug = qmd.parent.name
            texto = qmd.read_text(encoding="utf-8")
            fecha = leer_fecha(texto)
            if fecha is None:
                print(f"AVISO: {qmd.relative_to(RAIZ)} no tiene fecha; no se toca.")
                continue
            borrador = fecha > a.hoy
            estado[(serie, slug)] = (fecha, borrador)
            nuevo = fijar_draft(texto, borrador)
            if nuevo != texto:
                cambiados.append(qmd)
                if not a.simular:
                    qmd.write_text(nuevo, encoding="utf-8")

        portada = RAIZ / serie / "index.qmd"
        texto = portada.read_text(encoding="utf-8")
        patron = re.compile(
            r'<a class="serie-item" href="([a-z0-9-]+)/index\.html">(.*?)</a>'
            r'|<div class="serie-item pronto" data-slug="([a-z0-9-]+)">(.*?)</div>', re.S)

        def cambiar(m):
            slug = m.group(1) or m.group(3)
            interior = m.group(2) if m.group(1) else m.group(4)
            if (serie, slug) not in estado:
                return m.group(0)
            fecha, borrador = estado[(serie, slug)]
            return tarjeta(slug, interior, borrador, fecha)

        nuevo = patron.sub(cambiar, texto)
        if nuevo != texto:
            cambiados.append(portada)
            if not a.simular:
                portada.write_text(nuevo, encoding="utf-8")

    # Enlaces entre entradas. Quarto (draft-mode: gone) deja como texto sin
    # enlace cualquier enlace hacia un borrador; al publicarse el destino, la
    # página que enlaza debe volver a renderizarse para recuperar el enlace.
    def enlaza(origen, destino):
        (s1, d1), (s2, d2) = origen, destino
        texto = (RAIZ / s1 / d1 / "index.qmd").read_text(encoding="utf-8")
        rutas = [f"{s2}/{d2}/"]
        if s1 == s2:
            rutas += [f"](../{d2}/", f'"../{d2}/']
        return any(r in texto for r in rutas)

    cambiaron = {(c.parent.parent.name, c.parent.name) for c in cambiados
                 if c.name == "index.qmd" and c.parent.parent.name in SERIES}
    publicadas_k = [k for k, (_, b) in estado.items() if not b]
    rerender, sin_enlace = set(), []
    for o in publicadas_k:
        for d, (_, b) in estado.items():
            if o != d and enlaza(o, d):
                if b:
                    sin_enlace.append(f"{o[0]}/{o[1]} -> {d[0]}/{d[1]}")
                elif d in cambiaron and o not in cambiaron:
                    rerender.add(o)

    publicadas = sorted(f"{s}/{d}" for (s, d) in publicadas_k)
    print(f"Fecha de corte: {a.hoy}")
    print(f"Publicadas ({len(publicadas)}): " + ", ".join(publicadas))
    print("Archivos modificados:" if cambiados else "Sin cambios: todo estaba al día.")
    for c in cambiados:
        print("  " + str(c.relative_to(RAIZ)))
    if rerender:
        print("\nRenderiza también (enlazan a lo que se acaba de publicar):")
        for s, d in sorted(rerender):
            print(f"  {s}/{d}/index.qmd")
    if sin_enlace:
        print("\nEnlaces que por ahora se muestran como texto (destino en borrador):")
        for x in sorted(sin_enlace):
            print("  " + x)
    if (cambiados or rerender) and not a.simular:
        print("\nRenderiza uno por uno los archivos listados y luego blog.qmd, index.qmd y temas.qmd.")


if __name__ == "__main__":
    main()
