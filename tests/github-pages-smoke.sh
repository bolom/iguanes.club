#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

index_file="index.html"

if [[ ! -f "$index_file" ]]; then
  echo "Missing $index_file at repository root"
  exit 1
fi

for asset in iguanes-v3.css iguanes-v3.js; do
  if [[ ! -f "$asset" ]]; then
    echo "Missing required asset: $asset"
    exit 1
  fi
done

for ref in 'href="iguanes-v3.css"' 'src="iguanes-v3.js"'; do
  if ! rg -Fq "$ref" "$index_file"; then
    echo "Missing required reference in $index_file: $ref"
    exit 1
  fi
done

for competition in "samedi 25 avril" "dimanche 3 mai" "samedi 9 mai" "dimanche 24 mai" "samedi 30 mai" "samedi 6" "samedi 20 juin"; do
  if ! rg -Fq "$competition" "$index_file"; then
    echo "Missing competition entry in $index_file: $competition"
    exit 1
  fi
done

for score in "0 - 15" "18 - 19" "12 - 24" "6 - 22" "12 - 14"; do
  if ! rg -Fq "$score" "$index_file"; then
    echo "Missing score entry in $index_file: $score"
    exit 1
  fi
done

for standing in "Rapaces" "Canners" "Gators" "Iguanes" "+149" "+6" "-109" "-46" "15"; do
  if ! rg -Fq -- "$standing" "$index_file"; then
    echo "Missing standings entry in $index_file: $standing"
    exit 1
  fi
done

echo "GitHub Pages smoke check passed"
