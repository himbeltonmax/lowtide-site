#!/usr/bin/env python3
"""Builds the Dutch homepage (lowtide.eu/nl/) from index.html.

index.html holds both languages: <span lang="nl"> / <span lang="en">. CSS shows only
the language in <html data-lang>. This script flips that to Dutch, swaps the head
texts and points relative links one folder up. Run: python3 tools/build-nl.py OUTDIR
"""
import re, sys, os

out = sys.argv[1] if len(sys.argv) > 1 else '_site'
src = open('index.html', encoding='utf-8').read()

swap = [
    ('<html lang="en" data-lang="en">', '<html lang="nl" data-lang="nl">'),
    ('Lowtide · Scroll less. See more.', 'Lowtide · Scroll minder. Zie meer.'),
    ("Your own Instagram, calm. Just the people you follow, and the feed ends when you're caught up.",
     'Je eigen Instagram, rustig. Alleen wie je volgt, en de feed stopt als je bij bent.'),
    ('<meta property="og:url" content="https://lowtide.eu/">', '<meta property="og:url" content="https://lowtide.eu/nl/">'),
    ('<link rel="canonical" href="https://lowtide.eu/">', '<link rel="canonical" href="https://lowtide.eu/nl/">'),
]
for a, b in swap:
    if a not in src:
        sys.exit('build-nl: not found in index.html: ' + a)
    src = src.replace(a, b)

# Relative links/images (icon.png, filter.html, ...) live one folder up.
src = re.sub(r'((?:src|href)=")(?!https?:|#|/|\./|mailto:|data:)([^"]+")', r'\1../\2', src)

src = src.replace('<!doctype html>\n', '<!doctype html>\n<!-- GENERATED from index.html by tools/build-nl.py. Do not edit: edit index.html (span lang="nl" pairs). -->\n', 1)

os.makedirs(os.path.join(out, 'nl'), exist_ok=True)
open(os.path.join(out, 'nl', 'index.html'), 'w', encoding='utf-8').write(src)
print('built', os.path.join(out, 'nl', 'index.html'))
