#!/bin/bash
export ELEVENLABS_API_KEY=d6dfb74a64f1cc92217fd4b69e169e7bdd27b597eb5e81eae66d7516ae5a40b3
kill $(lsof -t -i:5178) 2>/dev/null
sleep 1
cd /Users/joao/.openclaw/workspace/projects/openclaw-nova-hub
node src/server/voice-server.js > /tmp/voice-server.log 2>&1 &
echo $!