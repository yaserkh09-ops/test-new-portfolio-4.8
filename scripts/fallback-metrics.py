#!/usr/bin/env python3
"""Compute metric-matched @font-face fallback overrides (CLS 0).

Reads the real self-hosted WOFF2 head/OS-2 tables and maps a local system face
to IBM Plex metrics using Fontaine's xAvgCharWidth algorithm. The emitted
size-adjust / ascent-override / descent-override / line-gap-override values are
committed verbatim into src/styles/fonts.css.

Usage:
    pip install fonttools brotli
    python3 scripts/fallback-metrics.py
"""
from fontTools.ttLib import TTFont

# Reference fallback faces (OS/2 xAvgCharWidth, unitsPerEm, typo metrics).
ARIAL = dict(upm=2048, ascent=1854, descent=-434, lineGap=67, xAvg=904)
COURIER = dict(upm=2048, ascent=1705, descent=-615, lineGap=0, xAvg=1229)


def metrics(path):
    f = TTFont(path)
    upm = f["head"].unitsPerEm
    os2, hhea = f["OS/2"], f["hhea"]
    return dict(
        upm=upm,
        ascent=getattr(os2, "sTypoAscender", hhea.ascent),
        descent=getattr(os2, "sTypoDescender", hhea.descent),
        lineGap=getattr(os2, "sTypoLineGap", hhea.lineGap),
        xAvg=os2.xAvgCharWidth,
    )


def overrides(web, fb):
    size_adjust = (web["xAvg"] / web["upm"]) / (fb["xAvg"] / fb["upm"])
    return (
        size_adjust,
        (web["ascent"] / web["upm"]) / size_adjust,
        (abs(web["descent"]) / web["upm"]) / size_adjust,
        (web["lineGap"] / web["upm"]) / size_adjust,
    )


JOBS = [
    ("IBM Plex Sans", "public/fonts/plex-sans-latin-400.woff2", ARIAL),
    ("IBM Plex Mono", "public/fonts/plex-mono-latin-500.woff2", COURIER),
    ("IBM Plex Sans Arabic", "public/fonts/plex-arabic-400.woff2", ARIAL),
]

if __name__ == "__main__":
    for name, path, fb in JOBS:
        sa, a, d, g = overrides(metrics(path), fb)
        print(f"{name}:")
        print(f"  size-adjust: {sa * 100:.2f}%")
        print(f"  ascent-override: {a * 100:.2f}%")
        print(f"  descent-override: {d * 100:.2f}%")
        print(f"  line-gap-override: {g * 100:.2f}%\n")
