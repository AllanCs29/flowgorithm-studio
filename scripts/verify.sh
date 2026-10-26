#!/usr/bin/env bash
set -euo pipefail
node scripts/test-mobile-layout.cjs
node scripts/test-v143-layout.cjs
node scripts/test-v146-mobile.cjs
npm run lint
npm test
npm run build
