#!/bin/bash
# Double-click this file to start the Nova Hub.
set -e
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  echo ">> installing dependencies (first run only)…"
  npm install
fi
echo ">> scanning projects…"
npm run scan
echo ">> starting dev server at http://127.0.0.1:5177"
npm run dev
