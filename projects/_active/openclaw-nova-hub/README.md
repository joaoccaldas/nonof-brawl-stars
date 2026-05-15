# Openclaw · Nova Hub

Entry-point dashboard for the entire OpenClaw ecosystem.

Nova Hub acts as your **Mission Control**. It is a living, 3D visualization that unifies your projects, your codebase, your personnel network, and your Second Brain knowledge graph into a single, actionable interface.

## Stack
- **Vite 5 + React 18** (JSX)
- **Three.js + React-Force-Graph-3D** (Cinematic 3D Engine with Bloom and Bezier Synapses)
- **Tailwind CSS 3** (Glassmorphism, custom `ink` + `nova` + `synapse` palettes)
- **Framer Motion** for HUD transitions
- Zero-dependency Node.js pipelines (`scripts/*.mjs`) that watch the filesystem and emit static JSON

## Getting started

```bash
cd projects/openclaw-nova-hub
npm install          # first time only

# Start the Hub (Runs all data pipelines first, then starts dev server)
npm run build        # Optional: verify compilation
npm run dev          # Opens http://127.0.0.1:5181/
```

## The Data Pipeline Architecture
The magic of Nova Hub relies on a suite of backend scripts that do the heavy lifting, outputting static `.json` files to `public/` so the React frontend stays incredibly fast.

- `scan.mjs`: Walks `workspace/projects/`, reading `README.md` and `PROJECT_STATE.json`. Extracts domain, status, and sub-dashboards.
- `scan-contacts.mjs`: Resolves your human network.
- `scan-knowledge-pipeline.mjs`: NLP extraction of entities and concepts from your markdown memories.
- `scan-codebase-graph.mjs`: Maps the actual file structure of your projects.
- `generate-nexus-data.mjs`: The final compiler that filters "word noise" and creates the curated 3D node map for Mission Control.

## Key Features
- **Nexus Graph (Default View)**: A 3D map of your entire life. Projects are gold icosahedrons, people are green spheres, core code files are blue cubes. Click any node to open the Actionable HUD sidebar.
- **Dashboard Explorer**: Instantly launch local sub-dashboards via iframes or native app links.
- **People View**: Your context-aware CRM, mapping who is involved in which missions based on recent memory mentions.
- **Voice Chat**: Talk directly to Nova (using local Whisper for STT).

## Roadmap ideas
- [ ] Add a WebSocket endpoint instead of polling JSON
- [ ] Move Voice Visualizer out of the modal and into the persistent header
- [ ] Scrape actual profile pictures for People View avatars
