"""Build optimised web assets from the raw app screenshots in assets/*.png.

Screen crops (assets/screens) feed the 3D phone textures; framed shots
(assets/shots) are the no-WebGL fallbacks. Also regenerates the download QR.

    pip install pillow segno
    python scripts/build-assets.py .
"""
import os, sys
from PIL import Image, ImageDraw
import segno

repo = sys.argv[1]
SRC = {
    "home": "MainHero", "next-meal": "NextMeal", "recipe": "RecipeResult",
    "pantry": "ScanReceiptInPantry", "savings": "TakeawaySupportFeature",
    "support": "SupportHero", "support-settings": "SupportFeaturesToggle",
}
SCREEN = (68, 169, 1252, 2740)   # inside the black bezel
OUTER = (23, 120, 1297, 2788)    # phone body edge
OUTER_RADIUS = 175               # frame corner radius at full res

os.makedirs(f"{repo}/assets/screens", exist_ok=True)
os.makedirs(f"{repo}/assets/shots", exist_ok=True)

for key, name in SRC.items():
    im = Image.open(f"{repo}/assets/{name}.png").convert("RGBA")
    # 1) screen texture (720 wide)
    s = im.crop(SCREEN)
    w = 720; h = round(s.height * w / s.width)
    s = s.resize((w, h), Image.LANCZOS).convert("RGB")
    s.save(f"{repo}/assets/screens/{key}.webp", "WEBP", quality=84, method=6)
    # 2) framed shot with transparent rounded corners, two widths
    o = im.crop(OUTER)
    mask = Image.new("L", o.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, o.width - 1, o.height - 1), radius=OUTER_RADIUS, fill=255)
    o.putalpha(mask)
    for tw in (560, 980):
        th = round(o.height * tw / o.width)
        r = o.resize((tw, th), Image.LANCZOS)
        r.save(f"{repo}/assets/shots/{key}-{tw}.webp", "WEBP", quality=82, method=6)
    print(key, "screen", s.size, "shot", o.size)

# 3) QR code for the download page (phones get redirected to their store there)
qr = segno.make("https://www.justcooked.app/download", error="m")
qr.save(f"{repo}/assets/qr-download.svg", scale=8, border=0, dark="#1A1815", light=None, svgclass=None, lineclass=None, omitsize=False)
print("qr ok")
