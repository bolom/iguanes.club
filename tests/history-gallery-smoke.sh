#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

media_root="public/images/final-candidates"
media_index="$media_root/MEDIA_INDEX.md"
history_expected=8
gallery_expected=21

if [[ ! -d "$media_root" ]]; then
  echo "Missing media root: $media_root"
  exit 1
fi

original_count="$(find "$media_root" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) | wc -l | tr -d ' ')"
if [[ "$original_count" != "21" ]]; then
  echo "Expected 21 original selected images, found $original_count"
  exit 1
fi

if [[ ! -f "$media_index" ]]; then
  echo "Missing media index: $media_index"
  exit 1
fi

web_count="$(find "$media_root/web" -maxdepth 1 -type f -iname '*.webp' 2>/dev/null | wc -l | tr -d ' ')"
thumb_count="$(find "$media_root/thumbs" -maxdepth 1 -type f -iname '*.webp' 2>/dev/null | wc -l | tr -d ' ')"

if [[ "$web_count" != "21" ]]; then
  echo "Expected 21 web derivatives, found $web_count"
  exit 1
fi

if [[ "$thumb_count" != "21" ]]; then
  echo "Expected 21 gallery thumbnails, found $thumb_count"
  exit 1
fi

index_entries="$(rg -c '^## ' "$media_index")"
if [[ "$index_entries" != "21" ]]; then
  echo "Expected 21 media index entries, found $index_entries"
  exit 1
fi

history_items="$(rg -o 'data-history-item=' index.html | wc -l | tr -d ' ')"
gallery_items="$(rg -o 'data-gallery-item=' index.html | wc -l | tr -d ' ')"

if [[ "$history_items" != "$history_expected" ]]; then
  echo "Expected $history_expected history media items in index.html, found $history_items"
  exit 1
fi

if [[ "$gallery_items" != "$gallery_expected" ]]; then
  echo "Expected $gallery_expected gallery media items in index.html, found $gallery_items"
  exit 1
fi

for ref in 'id="history-lightbox"' 'history__gallery' 'gallery-grid'; do
  if ! rg -Fq "$ref" index.html; then
    echo "Missing required history/gallery markup: $ref"
    exit 1
  fi
done

while IFS= read -r asset; do
  if [[ ! -f "$asset" ]]; then
    echo "Referenced asset is missing from disk: $asset"
    exit 1
  fi

  if ! git ls-files --error-unmatch "$asset" >/dev/null 2>&1; then
    echo "Referenced asset is not tracked by git: $asset"
    exit 1
  fi
done < <(
  rg -o 'assets-web/[^"]+' index.html | sort -u
)

if rg -Fq 'public/images/final-candidates/' index.html; then
  echo "History/gallery markup still references public/images/final-candidates/"
  exit 1
fi

echo "History/gallery smoke check passed"
