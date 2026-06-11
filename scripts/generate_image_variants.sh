#!/usr/bin/env bash
# Generate responsive WebP variants (-480.webp, -960.webp) for card/cover images.
# picture.html picks them up automatically (it checks file existence at build
# time), so this is safe to re-run after adding new images.
# Requires: imagemagick (magick), cwebp.
set -euo pipefail
cd "$(dirname "$0")/.."

targets=$(find assets/images/blog assets/images/news assets/images/projects \
  -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \) \
  ! -name '*-480.*' ! -name '*-960.*'; echo assets/images/profile_picture.jpg)

for f in $targets; do
  base="${f%.*}"
  w=$(magick identify -format '%w' "$f"[0])
  if [ "$w" -gt 480 ] && [ ! -f "${base}-480.webp" ]; then
    cwebp -quiet -q 80 -resize 480 0 "$f" -o "${base}-480.webp"
    echo "created ${base}-480.webp"
  fi
  if [ "$w" -gt 960 ] && [ ! -f "${base}-960.webp" ]; then
    cwebp -quiet -q 80 -resize 960 0 "$f" -o "${base}-960.webp"
    echo "created ${base}-960.webp"
  fi
done
