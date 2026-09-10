# palette-gen

Extract a frequency-sorted color palette from an image. Optionally split it into similar/dissimilar palettes and generate increasingly strong mutations.

## Setup

```bash
cd palette-gen
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Usage

```bash
python palette_gen.py IMAGE.png
python palette_gen.py IMAGE.png --colors 48 -o ./out
python palette_gen.py IMAGE.png --split 10 --sections 6
python palette_gen.py IMAGE.png --split 10 --similar 6 --dissimilar 4
python palette_gen.py IMAGE.png --mutations 5
python palette_gen.py IMAGE.png --split 8 --mutations 3 --seed 42
```

A run always writes `{stem}_palette.png` (swatches sorted and sized by frequency) and `{stem}_palette.json`. Split and mutation images are written only when those flags are set.

| Flag | Meaning |
| --- | --- |
| `IMAGE` | Input image path (required) |
| `-o` / `--out` | Output directory (default: same directory as the image) |
| `-c` / `--colors` | Extracted palette size (default 32) |
| `--split N` | Colors per split palette; 80/20 similar/dissimilar |
| `--similar X` | Similar-color count override |
| `--dissimilar Y` | Dissimilar-color count override |
| `--sections K` | Number of split palettes (default 4; ignored unless split is on) |
| `--mutations M` | Number of increasingly strong mutations of the base palette |
| `--seed INT` | RNG seed |
