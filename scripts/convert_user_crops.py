"""Convert hand-cropped PNGs from img/ into web-ready PNG + WebP assets
in img/assets/. Re-runnable, idempotent.

Each entry maps a source file to the slug used in HTML/CSS. To remove
an asset from the site, also remove its entry here.
"""
import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")
Image.MAX_IMAGE_PIXELS = None

SRC_DIR = "img"
OUT_DIR = os.path.join(SRC_DIR, "assets")
os.makedirs(OUT_DIR, exist_ok=True)

# (source_filename, output_slug, max_long_edge)
ASSETS = [
    ("header_names.png",                 "title-elizabeth-matthieu", 1400),
    ("handwritten_date.png",             "date-29-aout",              800),

    # Section icons
    ("table.png",                        "scene-vanity",              700),
    ("table_icon.png",                   "scene-plate",               400),
    ("church.png",                       "scene-church",              450),
    ("dancing_chicken_evening.png",      "scene-chicken-dance",       550),

    # Chicken decorations
    ("chicken_looking_down.png",         "chicken-1",                 500),
    ("chicken_on_fence.png",             "chicken-3-fence",           500),
    ("sitting_chicken.png",              "chicken-mother",            500),
    ("single_chick.png",                 "chick-single",              250),

    # Pattern + pear-tree side decorations
    ("squared_line.png",                 "gingham-strip",            1400),
    ("pear_trees_left.png",              "pear-trees-left",           700),
    ("pear_trees_right.png",             "pear-trees-right",          700),

    # Venue hero
    ("orangerie.png",                    "orangerie-venue",          1600),
]


def fit_long_edge(im, max_long_edge):
    w, h = im.size
    long = max(w, h)
    if long <= max_long_edge:
        return im
    scale = max_long_edge / long
    return im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)


def export(src_path, slug, max_long_edge):
    with Image.open(src_path) as im:
        # Preserve alpha if present
        has_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
        target_mode = "RGBA" if has_alpha else "RGB"
        if im.mode != target_mode:
            im = im.convert(target_mode)
        im = fit_long_edge(im, max_long_edge)

        png_path = os.path.join(OUT_DIR, f"{slug}.png")
        webp_path = os.path.join(OUT_DIR, f"{slug}.webp")
        im.save(png_path, "PNG", optimize=True)
        im.save(webp_path, "WEBP", quality=88, method=6)

        sz_png = os.path.getsize(png_path) / 1024
        sz_webp = os.path.getsize(webp_path) / 1024
        flag = "[A]" if has_alpha else "[ ]"
        print(f"  {flag} {slug:30s}  {im.size[0]:>4}x{im.size[1]:<4}  "
              f"png {sz_png:6.1f}KB  webp {sz_webp:6.1f}KB")


def main():
    print("== Converting hand-cropped images to web assets ==")
    missing = []
    for src_name, slug, max_edge in ASSETS:
        src_path = os.path.join(SRC_DIR, src_name)
        if not os.path.exists(src_path):
            missing.append(src_name)
            print(f"  ?? MISSING: {src_name}  (skipping {slug})")
            continue
        export(src_path, slug, max_edge)
    if missing:
        print(f"\n{len(missing)} source file(s) missing — those slugs were not regenerated.")
    print("\nDone. Assets in img/assets/")


if __name__ == "__main__":
    main()
