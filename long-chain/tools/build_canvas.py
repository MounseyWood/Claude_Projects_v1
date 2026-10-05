#!/usr/bin/env python3
"""Build the Canvas (VLE) version of The Thread and the Loop.

index.html is written as a claude.ai artifact page, so it has no
<html>/<head>/<body> wrapper. This script wraps it in a complete,
self-contained HTML document that can be uploaded to Canvas Files and
embedded in a Canvas page with an iframe. Nothing loads from outside the file.

Run from anywhere:  python3 long-chain/tools/build_canvas.py
"""
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'index.html').read_text(encoding='utf-8')

style = re.search(r'<style>.*?</style>', src, re.S)
title = re.search(r'<title>(.*?)</title>', src, re.S).group(1).strip()
body = src[style.end():].strip()

page = f"""<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="An interactive fibre lab from the Phygital Materials Studio: make a polyester thread, then find out if it can come back.">
<meta name="author" content="Matthew Mounsey-Wood FHEA MA (RCA) LCF Alumni">
{style.group(0)}
</head>
<body>
{body}
</body>
</html>
"""
out = root / 'canvas' / 'the-thread-and-the-loop.html'
out.write_text(page, encoding='utf-8')
print(f'wrote {out} ({len(page.encode("utf-8")) // 1024} KB)')
