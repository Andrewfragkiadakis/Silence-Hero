#!/usr/bin/env bash
# Regenerates fonts/*.woff2 + fonts/fonts.css from Google Fonts, so Inter can
# be self-hosted instead of loaded at runtime from fonts.googleapis.com.
# Only keeps the Latin + Greek subsets (this extension ships en/el locales).
set -euo pipefail
cd "$(dirname "$0")/.."

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
WEIGHTS="400;500;600;700;800"
RANGES="latin greek greek-ext"

TMP_CSS="$(mktemp)"
curl -sS -A "$UA" "https://fonts.googleapis.com/css2?family=Inter:wght@${WEIGHTS}&display=swap" -o "$TMP_CSS"

mkdir -p fonts
python3 - "$TMP_CSS" "$RANGES" <<'PYEOF'
import re, sys, urllib.request

css = open(sys.argv[1]).read()
wanted = set(sys.argv[2].split())

blocks = re.findall(r'/\* (\S+) \*/\s*@font-face \{([^}]*)\}', css)
seen = set()
for range_name, body in blocks:
    if range_name not in wanted or range_name in seen:
        continue
    url = re.search(r'url\((https://[^)]+)\)', body).group(1)
    print('downloading', range_name, url)
    urllib.request.urlretrieve(url, f'fonts/inter-{range_name}.woff2')
    seen.add(range_name)
PYEOF

rm -f "$TMP_CSS"
echo "Done. fonts/fonts.css unicode-range values only need updating if Google changes them upstream."
