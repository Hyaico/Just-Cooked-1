"""Generate the decorative SVGs the site uses:

  assets/stars-a.svg, assets/stars-b.svg   two star layers (animated against each other to twinkle)
  assets/qr-download.svg                   dot-style QR for the download page / finale, with the app mark

    pip install segno
    python scripts/build-decor.py .
"""
import os
import random
import sys

import segno

REPO = sys.argv[1] if len(sys.argv) > 1 else "."
OUT = os.path.join(REPO, "assets")


def stars(path, seed, n_tiny=230, n_small=40, n_bright=7):
    rnd = random.Random(seed)
    W, H = 1600, 1000
    parts = []
    for _ in range(n_tiny):
        x, y = rnd.uniform(0, W), rnd.uniform(0, H)
        r = rnd.uniform(0.45, 1.0)
        o = rnd.uniform(0.35, 0.9)
        col = "#FFE9D6" if rnd.random() < 0.15 else ("#DCE6FF" if rnd.random() < 0.3 else "#FFFFFF")
        parts.append('<circle cx="%.1f" cy="%.1f" r="%.2f" fill="%s" opacity="%.2f"/>' % (x, y, r, col, o))
    for _ in range(n_small):
        x, y = rnd.uniform(0, W), rnd.uniform(0, H)
        r = rnd.uniform(1.1, 1.7)
        parts.append('<circle cx="%.1f" cy="%.1f" r="%.2f" fill="#FFFFFF" opacity="%.2f"/>' % (x, y, r, rnd.uniform(0.7, 1)))
    for _ in range(n_bright):
        x, y = rnd.uniform(60, W - 60), rnd.uniform(60, H - 60)
        arm = rnd.uniform(7, 12)
        parts.append('<path d="M%.1f %.1f l%.1f %.1f l%.1f %.1f l%.1f %.1f z M%.1f %.1f l%.1f %.1f l%.1f %.1f l%.1f %.1f z" fill="#FFFFFF" opacity="0.85"/>'
                     % (x - arm, y, arm, -1.1, arm, 1.1, -arm, 1.1, x, y - arm, 1.1, arm, -1.1, arm, -1.1, -arm))
        parts.append('<circle cx="%.1f" cy="%.1f" r="1.9" fill="#FFFFFF"/>' % (x, y))
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" preserveAspectRatio="xMidYMid slice">%s</svg>'
           % (W, H, W, H, "".join(parts)))
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(svg)
    print("wrote", os.path.relpath(path, REPO), len(svg), "bytes")


def qr(path, url):
    q = segno.make(url, error="h")
    m = [list(row) for row in q.matrix]
    n = len(m)
    quiet = 2
    size = n + quiet * 2
    ink, cream, orange = "#1A1815", "#FBF6EC", "#E94B1F"
    finders = [(0, 0), (0, n - 7), (n - 7, 0)]  # (row, col) of each 7x7 finder pattern

    def in_finder(r, c):
        return any(fr <= r < fr + 7 and fc <= c < fc + 7 for fr, fc in finders)

    # centre hole for the app mark (error level H tolerates it comfortably)
    hole = 9
    h0 = (n - hole) // 2

    def in_hole(r, c):
        return h0 <= r < h0 + hole and h0 <= c < h0 + hole

    parts = ['<rect width="%d" height="%d" rx="3" fill="%s"/>' % (size, size, cream)]
    for r in range(n):
        for c in range(n):
            if not m[r][c] or in_finder(r, c) or in_hole(r, c):
                continue
            parts.append('<circle cx="%.1f" cy="%.1f" r="0.4" fill="%s"/>' % (c + quiet + 0.5, r + quiet + 0.5, ink))
    for fr, fc in finders:
        x, y = fc + quiet, fr + quiet
        parts.append('<rect x="%d" y="%d" width="7" height="7" rx="2" fill="%s"/>' % (x, y, ink))
        parts.append('<rect x="%d" y="%d" width="5" height="5" rx="1.4" fill="%s"/>' % (x + 1, y + 1, cream))
        parts.append('<rect x="%d" y="%d" width="3" height="3" rx="0.9" fill="%s"/>' % (x + 2, y + 2, orange))
    # app mark: orange rounded square with the white ring and dot
    cx = cy = quiet + n / 2
    s = hole - 2
    parts.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="%s"/>' % (cx - s / 2, cy - s / 2, s, s, s * 0.26, orange))
    parts.append('<circle cx="%.1f" cy="%.1f" r="%.2f" fill="none" stroke="#FFFFFF" stroke-width="%.2f"/>' % (cx, cy, s * 0.3, s * 0.085))
    parts.append('<circle cx="%.1f" cy="%.1f" r="%.2f" fill="#FFFFFF"/>' % (cx, cy, s * 0.14))
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d" shape-rendering="geometricPrecision">%s</svg>'
           % (size, size, size * 8, size * 8, "".join(parts)))
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(svg)
    print("wrote", os.path.relpath(path, REPO), "modules:", n, "bytes:", len(svg))


stars(os.path.join(OUT, "stars-a.svg"), 11)
stars(os.path.join(OUT, "stars-b.svg"), 23)
qr(os.path.join(OUT, "qr-download.svg"), "https://www.justcooked.app/download")
