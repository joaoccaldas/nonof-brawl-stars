#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "🎮 Starting Noah's Brawl Stars server..."
echo "📁 Serving from: $(pwd)/build"

# Kill any existing caddy on port 8765
lsof -ti:8765 | xargs kill -9 2>/dev/null || true

# Start caddy
caddy run --config Caddyfile &
CADDY_PID=$!

sleep 2

# Check if caddy is running
if ! kill -0 $CADDY_PID 2>/dev/null; then
    echo "❌ Caddy failed to start"
    exit 1
fi

echo "✅ Caddy running on http://localhost:8765"
echo "🌐 Tailscale IP: $(tailscale ip -4 2>/dev/null || echo 'not available')"
echo ""
echo "Options:"
echo "  • Local:     http://localhost:8765"
echo "  • Tailnet:   http://$(tailscale ip -4 2>/dev/null || echo 'YOUR-TAILSCALE-IP'):8765"
echo ""
echo "To expose to internet: tailscale funnel 8765"
echo "To expose to tailnet:  tailscale serve --https 8765"
echo ""

# Wait for caddy
wait $CADDY_PID
