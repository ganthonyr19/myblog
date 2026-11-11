#!/usr/bin/env python3
"""Revisa que ningún archivo del sitio traiga tildes dañadas.

Busca «<U+00E9>» (lo que escribe R cuando corre sin configuración UTF-8, p. ej. con LANG=C)
y el texto mal decodificado tipo «Ã©». Revisa los PDF descargables (con pdftotext), los
scripts .R, los JSON, CSV y TXT, y las páginas .html de _site.

Uso (desde la raíz del repo), antes de cada commit que toque descargas o Prospecto R:
    python3 _notas/revisar-descargables.py
Termina con código 1 si encuentra algo.
"""
import pathlib, re, subprocess, sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
MALO = re.compile(r"<U\+[0-9A-Fa-f]{4}>|Ã[©¡³±º­‰“]")
TEXTO = {".r", ".json", ".csv", ".txt", ".html", ".md", ".qmd"}
problemas = []
for f in sorted(RAIZ.rglob("*")):
    if not f.is_file() or {".git", "node_modules", "_freeze", "_notas"} & set(f.parts):
        continue
    ext = f.suffix.lower()
    if ext == ".pdf":
        try:
            t = subprocess.run(["pdftotext", "-q", str(f), "-"], capture_output=True, text=True).stdout
        except FileNotFoundError:
            sys.exit("Falta pdftotext (paquete poppler-utils).")
    elif ext in TEXTO:
        t = f.read_text(encoding="utf-8", errors="replace")
    else:
        continue
    m = MALO.findall(t)
    if m:
        problemas.append(f"{f.relative_to(RAIZ)}: {len(m)} (p. ej., {m[0]})")
if problemas:
    print("Tildes dañadas en:")
    print("\n".join("  " + p for p in problemas))
    print("\nCausa habitual: R corrió sin UTF-8. Vuelve a generar con LANG=C.UTF-8; "
          "para las fichas, `node prospecto/_plantilla/render.js <receta.json> --solo-ficha`.")
    sys.exit(1)
print("Sin tildes dañadas.")
