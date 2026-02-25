#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code on the web environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install root dependencies
npm install

# Install backend/functions dependencies
# Uses --legacy-peer-deps due to hono version conflict between
# hono@^3.12.0 and @hono/node-server@^1.8.0 (requires hono@^4)
if [ -f "backend/functions/package.json" ]; then
  cd backend/functions && npm install --legacy-peer-deps && cd "$CLAUDE_PROJECT_DIR"
fi
