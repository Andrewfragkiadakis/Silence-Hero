#!/usr/bin/env bash
# Builds the Chrome Web Store submission zip, containing only the files the
# extension actually needs at runtime (manifest.json's declared surface).
# Excludes README/marketing assets (banner*, logo.png, screenshot.png),
# dev-only files (icons.html), and repo/docs files (README.MD,
# PRIVACY_POLICY.md, LICENSE, .git*) so reviewers only see the runtime code.
set -euo pipefail
cd "$(dirname "$0")"

OUT="Silence-Hero-Store.zip"
rm -f "$OUT"

zip -r -X "$OUT" \
  manifest.json \
  background.js \
  state.js \
  theme.js \
  quietTimeLogic.js \
  offscreen.html \
  offscreen.js \
  popup.html \
  popup.css \
  popup.js \
  settings.html \
  settings.css \
  settings.js \
  onboarding.html \
  onboarding.css \
  onboarding.js \
  icons \
  fonts \
  _locales \
  -x '**/.DS_Store'

echo "Created $OUT"
