#!/usr/bin/env python3
"""Extract a frequency-sorted palette from an image; optionally split and mutate it."""

from __future__ import annotations

import argparse
import json
import math
import os
import random
import sys
import warnings
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw, ImageFont

MAX_CLUSTER_EDGE = 512
BAR_H = 80
LABEL_H = 28
CANVAS_BG = (248, 248, 246)
LABEL_FG = (32, 32, 32)
GROUP_GAP = 4
MIN_SWATCH_W = 72
PROPORTIONAL_TARGET_W = 1600
EQUAL_SWATCH_W = 80

D65 = (0.95047, 1.00000, 1.08883)
DELTA = 6.0 / 29.0


def rgb_to_hex(rgb: tuple[int, int, int] | list[int]) -> str:
    r, g, b = (int(c) for c in rgb)
    return f"#{r:02X}{g:02X}{b:02X}"


def _srgb_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _linear_to_srgb(c: float) -> float:
    return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1.0 / 2.4)) - 0.055


def rgb_to_lab(rgb: tuple[int, int, int] | list[int]) -> tuple[float, float, float]:
    r, g, b = (max(0.0, min(255.0, float(c))) / 255.0 for c in rgb)
    r, g, b = _srgb_to_linear(r), _srgb_to_linear(g), _srgb_to_linear(b)
    x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
    y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
    z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041
    return xyz_to_lab((x, y, z))


def xyz_to_lab(xyz: tuple[float, float, float]) -> tuple[float, float, float]:
    def f(t: float) -> float:
        return t ** (1.0 / 3.0) if t > DELTA**3 else t / (3.0 * DELTA**2) + 4.0 / 29.0

    x, y, z = xyz
    xn, yn, zn = D65
    fx, fy, fz = f(x / xn), f(y / yn), f(z / zn)
    L = 116.0 * fy - 16.0
    a = 500.0 * (fx - fy)
    b = 200.0 * (fy - fz)
    return (L, a, b)


def lab_to_xyz(lab: tuple[float, float, float]) -> tuple[float, float, float]:
    L, a, b = lab
    fy = (L + 16.0) / 116.0
    fx = fy + a / 500.0
    fz = fy - b / 200.0

    def finv(t: float) -> float:
        return t**3 if t > DELTA else 3.0 * DELTA**2 * (t - 4.0 / 29.0)

    xn, yn, zn = D65
    return (finv(fx) * xn, finv(fy) * yn, finv(fz) * zn)


def lab_to_rgb(lab: tuple[float, float, float]) -> tuple[int, int, int]:
    L, a, b = lab
    L = max(0.0, min(100.0, L))
    x, y, z = lab_to_xyz((L, a, b))
    r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314
    g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560
    b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252
    r, g, b = _linear_to_srgb(r), _linear_to_srgb(g), _linear_to_srgb(b)
    return (
        int(round(max(0.0, min(1.0, r)) * 255.0)),
        int(round(max(0.0, min(1.0, g)) * 255.0)),
        int(round(max(0.0, min(1.0, b)) * 255.0)),
    )


def lab_distance(
    a: tuple[float, float, float], b: tuple[float, float, float]
) -> float:
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)


def load_font(size: int) -> ImageFont.ImageFont | ImageFont.FreeTypeFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/croscore/Arimo-Regular.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        if os.path.isfile(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def color_entry(
    rgb: tuple[int, int, int] | list[int],
    count: int = 0,
    ratio: float = 0.0,
) -> dict[str, Any]:
    rgb_list = [int(c) for c in rgb]
    return {
        "hex": rgb_to_hex(rgb_list),
        "rgb": rgb_list,
        "count": int(count),
        "ratio": float(ratio),
    }


def extract_palette(image_path: Path, colors: int) -> list[dict[str, Any]]:
    if colors < 1 or colors > 256:
        raise ValueError("--colors must be between 1 and 256")

    im = Image.open(image_path)
    rgba = im.convert("RGBA")
    arr = np.asarray(rgba)
    alpha = arr[:, :, 3]
    opaque = alpha > 0
    if not np.any(opaque):
        raise ValueError(f"{image_path} has no visible (non-transparent) pixels")

    rgb = arr[:, :, :3].astype(np.float32)
    a = (alpha.astype(np.float32) / 255.0)[..., None]
    flattened = (rgb * a + 255.0 * (1.0 - a)).clip(0, 255).astype(np.uint8)
    rgb_img = Image.fromarray(flattened, "RGB")

    w, h = rgb_img.size
    longest = max(w, h)
    if longest > MAX_CLUSTER_EDGE:
        scale = MAX_CLUSTER_EDGE / longest
        small = rgb_img.resize(
            (max(1, int(round(w * scale))), max(1, int(round(h * scale)))),
            Image.Resampling.BOX,
        )
    else:
        small = rgb_img

    quantized_small = small.quantize(
        colors=colors,
        method=Image.Quantize.MEDIANCUT,
        dither=Image.Dither.NONE,
    )
    quantized_full = rgb_img.quantize(
        palette=quantized_small,
        dither=Image.Dither.NONE,
    )

    indices = np.asarray(quantized_full)
    opaque_indices = indices[opaque]
    unique, counts = np.unique(opaque_indices, return_counts=True)
    palette_bytes = quantized_full.getpalette() or quantized_small.getpalette()
    if palette_bytes is None:
        raise RuntimeError("quantized image has no palette")

    total = int(counts.sum())
    entries: list[dict[str, Any]] = []
    for index, count in zip(unique.tolist(), counts.tolist()):
        base = index * 3
        rgb_tuple = (
            int(palette_bytes[base]),
            int(palette_bytes[base + 1]),
            int(palette_bytes[base + 2]),
        )
        entries.append(color_entry(rgb_tuple, count=int(count), ratio=int(count) / total))
    entries.sort(key=lambda e: (-e["count"], e["hex"]))
    return entries


def proportional_widths(ratios: list[float], min_w: int = MIN_SWATCH_W) -> list[int]:
    n = len(ratios)
    if n == 0:
        return []
    floor = n * min_w
    extra = max(PROPORTIONAL_TARGET_W - floor, 0)
    raw = [min_w + extra * r for r in ratios]
    widths = [max(min_w, int(round(w))) for w in raw]
    return widths


def equal_widths(n: int) -> list[int]:
    if n <= 0:
        return []
    w = max(36, min(EQUAL_SWATCH_W, 2000 // n))
    return [w] * n


def render_swatches(
    entries: list[dict[str, Any]],
    *,
    proportional: bool = False,
    group_sizes: tuple[int, int] | None = None,
    title: str | None = None,
) -> Image.Image:
    if not entries:
        raise ValueError("cannot render an empty palette")

    ratios = [float(e.get("ratio") or 0.0) for e in entries]
    if proportional:
        widths = proportional_widths(ratios)
    else:
        widths = equal_widths(len(entries))

    gaps = [0] * len(entries)
    if group_sizes is not None:
        similar_n, dissimilar_n = group_sizes
        if similar_n > 0 and dissimilar_n > 0 and similar_n < len(entries):
            gaps[similar_n - 1] = GROUP_GAP

    title_h = 22 if title else 0
    total_w = max(1, sum(widths) + sum(gaps))
    total_h = title_h + BAR_H + LABEL_H
    img = Image.new("RGB", (total_w, total_h), CANVAS_BG)
    draw = ImageDraw.Draw(img)
    font = load_font(12)
    title_font = load_font(13)

    y0 = title_h
    if title:
        draw.text((8, 4), title, fill=LABEL_FG, font=title_font)

    x = 0
    for i, entry in enumerate(entries):
        w = widths[i]
        rgb = tuple(int(c) for c in entry["rgb"])
        draw.rectangle([x, y0, x + w - 1, y0 + BAR_H - 1], fill=rgb)
        label = str(entry["hex"])
        bbox = draw.textbbox((0, 0), label, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        tx = x + max(2, (w - tw) // 2)
        ty = y0 + BAR_H + max(4, (LABEL_H - th) // 2)
        draw.text((tx, ty), label, fill=LABEL_FG, font=font)
        x += w + gaps[i]
    return img


def resolve_split_counts(
    split: int | None,
    similar: int | None,
    dissimilar: int | None,
) -> tuple[int, int] | None:
    if similar is not None and similar < 0:
        raise ValueError("--similar must be >= 0")
    if dissimilar is not None and dissimilar < 0:
        raise ValueError("--dissimilar must be >= 0")
    if split is not None and split < 1:
        raise ValueError("--split must be >= 1")

    if similar is not None and dissimilar is not None:
        total = similar + dissimilar
        if total < 1:
            raise ValueError("--similar and --dissimilar must sum to at least 1")
        if split is not None and split != total:
            raise ValueError(
                f"--split {split} does not match --similar {similar} + --dissimilar {dissimilar} ({total})"
            )
        return similar, dissimilar

    if split is None:
        if similar is not None or dissimilar is not None:
            raise ValueError(
                "set --split N, or set both --similar and --dissimilar"
            )
        return None

    if similar is not None:
        if similar > split:
            raise ValueError(f"--similar {similar} cannot exceed --split {split}")
        return similar, split - similar
    if dissimilar is not None:
        if dissimilar > split:
            raise ValueError(f"--dissimilar {dissimilar} cannot exceed --split {split}")
        return split - dissimilar, dissimilar

    sim = int(round(split * 0.8))
    dis = split - sim
    if split >= 2 and dis == 0:
        dis = 1
        sim = split - 1
    if split >= 2 and sim == 0:
        sim = 1
        dis = split - 1
    return sim, dis


def _sample_from_pool(
    pool: list[int],
    k: int,
    rng: random.Random,
    fallback: list[int],
) -> list[int]:
    if k <= 0:
        return []
    chosen: list[int] = []
    available = list(pool)
    rng.shuffle(available)
    for idx in available:
        if idx not in chosen:
            chosen.append(idx)
            if len(chosen) >= k:
                return chosen
    for idx in fallback:
        if idx not in chosen:
            chosen.append(idx)
            if len(chosen) >= k:
                break
    return chosen


def make_splits(
    palette: list[dict[str, Any]],
    similar_n: int,
    dissimilar_n: int,
    sections: int,
    rng: random.Random,
) -> list[dict[str, Any]]:
    n_needed = similar_n + dissimilar_n
    if n_needed < 1:
        raise ValueError("split palette size must be at least 1")
    if sections < 1:
        raise ValueError("--sections must be >= 1")

    if len(palette) < n_needed:
        warnings.warn(
            f"base palette has {len(palette)} colors; requested {n_needed}. "
            "Using all available colors.",
            stacklevel=2,
        )
        similar_n = min(similar_n, len(palette))
        dissimilar_n = min(dissimilar_n, max(0, len(palette) - similar_n))

    labs = [rgb_to_lab(e["rgb"]) for e in palette]
    used_seeds: set[int] = set()
    results: list[dict[str, Any]] = []

    for section_i in range(1, sections + 1):
        available_seeds = [i for i in range(len(palette)) if i not in used_seeds]
        if not available_seeds:
            available_seeds = list(range(len(palette)))
        seed_idx = rng.choice(available_seeds)
        used_seeds.add(seed_idx)

        others = [i for i in range(len(palette)) if i != seed_idx]
        others.sort(key=lambda i: lab_distance(labs[i], labs[seed_idx]))

        similar_idxs: list[int] = []
        if similar_n >= 1:
            similar_idxs.append(seed_idx)
            need = similar_n - 1
            if need > 0 and others:
                closest_count = max(len(others) // 2, need)
                closest_pool = others[:closest_count]
                similar_idxs.extend(
                    _sample_from_pool(closest_pool, need, rng, others)
                )

        taken = set(similar_idxs)
        remaining = [i for i in others if i not in taken]
        remaining_far = list(reversed(remaining))
        dissimilar_idxs: list[int] = []
        if dissimilar_n > 0 and remaining_far:
            farthest_count = max(len(remaining_far) // 2, dissimilar_n)
            farthest_pool = remaining_far[:farthest_count]
            dissimilar_idxs = _sample_from_pool(
                farthest_pool, dissimilar_n, rng, remaining_far
            )

        combined_idxs = similar_idxs + dissimilar_idxs
        similar_colors = [dict(palette[i]) for i in similar_idxs]
        dissimilar_colors = [dict(palette[i]) for i in dissimilar_idxs]
        combined = [dict(palette[i]) for i in combined_idxs]
        results.append(
            {
                "index": section_i,
                "seed": palette[seed_idx]["hex"],
                "similar": similar_colors,
                "dissimilar": dissimilar_colors,
                "colors": combined,
            }
        )
    return results


def jitter_color(
    rgb: tuple[int, int, int] | list[int],
    scale: float,
    rng: random.Random,
) -> tuple[int, int, int]:
    L, a, b = rgb_to_lab(rgb)
    L2 = L + rng.uniform(-scale * 25.0, scale * 25.0)
    a2 = a + rng.uniform(-scale * 40.0, scale * 40.0)
    b2 = b + rng.uniform(-scale * 40.0, scale * 40.0)
    return lab_to_rgb((L2, a2, b2))


def make_mutations(
    palette: list[dict[str, Any]],
    count: int,
    rng: random.Random,
) -> list[dict[str, Any]]:
    if count < 1:
        raise ValueError("--mutations must be >= 1")
    n = len(palette)
    results: list[dict[str, Any]] = []
    for i in range(1, count + 1):
        scale = i / count
        mutated = []
        for entry in palette:
            rgb = jitter_color(entry["rgb"], scale, rng)
            mutated.append(
                color_entry(rgb, count=entry.get("count", 0), ratio=entry.get("ratio", 0.0))
            )
        k = int(round(scale * n))
        if k >= 2:
            positions = list(range(n))
            rng.shuffle(positions)
            shuffle_set = sorted(positions[:k])
            values = [mutated[p] for p in shuffle_set]
            rng.shuffle(values)
            for pos, value in zip(shuffle_set, values):
                mutated[pos] = value
        results.append({"index": i, "scale": scale, "colors": mutated})
    return results


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Extract a frequency-sorted color palette from an image. "
            "Optionally split it into similar/dissimilar palettes and "
            "generate increasingly strong mutations."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "examples:\n"
            "  python palette_gen.py IMAGE.png\n"
            "  python palette_gen.py IMAGE.png --colors 48 -o ./out\n"
            "  python palette_gen.py IMAGE.png --split 10 --sections 6\n"
            "  python palette_gen.py IMAGE.png --split 10 --similar 6 --dissimilar 4\n"
            "  python palette_gen.py IMAGE.png --mutations 5\n"
            "  python palette_gen.py IMAGE.png --split 8 --mutations 3 --seed 42\n"
        ),
    )
    parser.add_argument("image", type=Path, help="input image path")
    parser.add_argument(
        "-o",
        "--out",
        type=Path,
        default=None,
        help="output directory (default: same directory as the image)",
    )
    parser.add_argument(
        "-c",
        "--colors",
        type=int,
        default=32,
        help="extracted palette size (default: 32)",
    )
    parser.add_argument(
        "--split",
        type=int,
        default=None,
        metavar="N",
        help="colors per split palette; 80/20 similar/dissimilar unless overridden",
    )
    parser.add_argument(
        "--similar",
        type=int,
        default=None,
        metavar="X",
        help="similar-color count override",
    )
    parser.add_argument(
        "--dissimilar",
        type=int,
        default=None,
        metavar="Y",
        help="dissimilar-color count override",
    )
    parser.add_argument(
        "--sections",
        type=int,
        default=4,
        metavar="K",
        help="number of split palettes (default: 4; ignored unless split is on)",
    )
    parser.add_argument(
        "--mutations",
        type=int,
        default=None,
        metavar="M",
        help="number of increasingly strong mutations of the base palette",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="RNG seed",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    image_path: Path = args.image
    if not image_path.is_file():
        print(f"error: image not found: {image_path}", file=sys.stderr)
        return 1

    try:
        split_counts = resolve_split_counts(args.split, args.similar, args.dissimilar)
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2

    out_dir: Path = args.out if args.out is not None else image_path.parent
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = image_path.stem
    rng = random.Random(args.seed)

    try:
        palette = extract_palette(image_path, args.colors)
    except (ValueError, OSError, RuntimeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    payload: dict[str, Any] = {
        "source": str(image_path),
        "colors": args.colors,
        "palette": palette,
    }

    freq_img = render_swatches(
        palette,
        proportional=True,
        title=f"{stem}  ·  {len(palette)} colors by frequency",
    )
    freq_path = out_dir / f"{stem}_palette.png"
    freq_img.save(freq_path)

    if split_counts is not None:
        similar_n, dissimilar_n = split_counts
        splits = make_splits(palette, similar_n, dissimilar_n, args.sections, rng)
        payload["splits"] = splits
        payload["split"] = {
            "similar": similar_n,
            "dissimilar": dissimilar_n,
            "sections": args.sections,
        }
        for split in splits:
            img = render_swatches(
                split["colors"],
                proportional=False,
                group_sizes=(len(split["similar"]), len(split["dissimilar"])),
                title=(
                    f"split {split['index']}  ·  seed {split['seed']}  ·  "
                    f"{len(split['similar'])} similar / {len(split['dissimilar'])} dissimilar"
                ),
            )
            img.save(out_dir / f"{stem}_split_{split['index']}.png")

    if args.mutations is not None:
        if args.mutations < 1:
            print("error: --mutations must be >= 1", file=sys.stderr)
            return 2
        mutations = make_mutations(palette, args.mutations, rng)
        payload["mutations"] = mutations
        for mutation in mutations:
            img = render_swatches(
                mutation["colors"],
                proportional=False,
                title=f"mutation {mutation['index']}  ·  scale {mutation['scale']:.2f}",
            )
            img.save(out_dir / f"{stem}_mutation_{mutation['index']}.png")

    json_path = out_dir / f"{stem}_palette.json"
    json_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {freq_path}")
    print(f"wrote {json_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
