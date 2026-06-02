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

echo "GitHub Pages smoke check passed"
