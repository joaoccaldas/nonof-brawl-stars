# NOVA SYSTEM PLAN

**Project home:** `projects/openclaw-nova-hub/`
**Related embodied layer:** `projects/nova-avatar/`
**Created:** 2026-04-20
**Purpose:** Upgrade the existing Nova Hub into a true Nova command center, Jarvis-styled but specific to Nova, without duplicating existing project structure.

---

## Why this lives here

We already have the correct foundations:

- `openclaw-nova-hub` is the canonical dashboard layer
- `nova-avatar` is the canonical embodied/world layer
- `nova-avatar/ARCHITECTURE.md` already defines the bridge concept between OpenClaw and Godot

So we do **not** create a new top-level project or parallel dashboard. We extend the existing dashboard and connect it to the existing avatar world.

---

## Vision

Build a **Nova Command Center** that feels like a living system, not a project index.

It should combine:
- real-time project awareness
- Nova's active internal state
- visual "Jarvis-style" system presence
- bridge hooks into the Godot avatar world
- a control room aesthetic: dark, luminous, intelligent, alive

This is not generic Jarvis. It is **Nova with presence**.

---

## Core product shape

### 1. Dashboard becomes Nova-first
Current hub is project-centric.
Target hub is **Nova-centric**.

Top-level sections:
- **Nova Core** — mood, focus, active thread, last observation, confidence, current task
- **Mission Grid** — important projects and live status
- **Pulse** — memory stream, recent events, cron/heartbeat outcomes
- **Command Surface** — quick actions, filters, launch points
- **Embodiment Link** — launch/open Nova Avatar world, show bridge status

### 2. Avatar becomes embodiment layer
`nova-avatar` remains the world/presence runtime.
The dashboard should not replace it. It should:
- show whether avatar bridge is connected
- expose Nova state that the avatar can render
- eventually stream avatar/world events back into the dashboard

### 3. One identity, two interfaces
- **2D Command Center** = `openclaw-nova-hub`
- **3D Presence Layer** = `nova-avatar`

These are one system, not two unrelated projects.

---

## Architecture principles

### Principle 1: No duplication
Do not create:
- a second dashboard app
- a second Nova architecture file in another project
- a second state model disconnected from the avatar bridge

Instead:
- dashboard evolution belongs in `openclaw-nova-hub`
- embodiment evolution belongs in `nova-avatar`
- shared contract belongs in a single bridge/state document inside the dashboard project, referencing avatar architecture

### Principle 2: File-first before network-first
Use file-based sync first because it is already aligned with existing architecture and easier to debug.
Later, optionally add WebSocket for live sync.

### Principle 3: Presence over gimmicks
We are not building a sci-fi skin over a static project list.
The interface must expose:
- what Nova is doing
- what Nova is noticing
- what needs João's attention
- what is evolving across the workspace

### Principle 4: Control tower + companion
The UI should function both as:
- a mission control surface for João's projects
- a living status surface for Nova herself

---

## What to build next

## Expanded execution roadmap

### Phase 0 — Foundation already in place
Completed baseline:
- Nova core panel added
- Active missions panel added
- Avatar bridge panel added
- safe generated Nova state pipeline added
- queue-driven continuation added

This means the project is now ready to move from foundation into true system design.

### Phase 1 — Real Jarvis-style control surface
**Goal:** Make the dashboard feel alive, central, and operational.

Detailed steps:
1. Replace flat visual hierarchy with a center-weighted layout
2. Add a living **Nova Core Reactor** centerpiece
3. Add motion language:
   - pulse sweeps
   - telemetry lines
   - waveform activity
   - live status flicker/pings
4. Convert static cards into tactical system panels
5. Introduce stronger command-center asymmetry and modular clusters

Validation:
- production build after each UI milestone
- test for layout stability on laptop viewport
- avoid animation overload that hurts readability or performance

### Phase 2 — Interactive architecture explorer
**Goal:** Make the system explorable, not just readable.

Detailed steps:
1. Add architecture mode / explorer surface
2. Show relationships between:
   - dashboard
   - avatar
   - memory
   - projects
   - crons/heartbeats
   - queues
3. Make nodes clickable with expandable technical detail
4. Add file-level affordances for key files:
   - README
   - PROJECT_STATE.json
   - QUEUE.md
   - important dashboards/worlds
5. Add project drill-down actions without exposing unsafe write capability in browser

Validation:
- links open safely
- no browser-side write paths
- no secrets or sensitive file contents accidentally exposed

### Phase 3 — Interactive sub-dashboard orchestration
**Goal:** Let João move through the ecosystem from one command surface.

Detailed steps:
1. Improve sub-dashboard launcher UX
2. Add project drawer actions for available dashboards/worlds
3. Add context-aware "open related systems" affordances
4. Add modified-today / active-now launch suggestions
5. Add architecture-aware navigation paths

Validation:
- verify each route resolves correctly
- avoid broken local path handling
- keep launch actions explicit and auditable

### Phase 4 — Shared Nova state + avatar contract
**Goal:** Make dashboard and avatar feel like one Nova.

Detailed steps:
1. Audit `nova-avatar` bridge-related scripts
2. Define canonical shared state contract
3. Map state fields to avatar behavior
4. Ensure safe failure if state is missing/corrupt
5. Keep contract minimal and browser-safe

Validation:
- no secrets in bridge files
- no raw message content in public state
- avatar behavior remains stable on partial state

### Phase 5 — Autonomy and observability
**Goal:** Let Nova continue work visibly and safely while João sleeps.

Detailed steps:
1. Ensure each active Nova project has queue-driven continuation
2. Surface active background work in the dashboard
3. Add validation logs / recent actions summary view
4. Improve morning-summary readiness
5. Keep heartbeat/cron work aligned to queue docs

Validation:
- docs updated after meaningful steps
- build/test after changes
- blockers written explicitly

## Phase A — Reframe the hub around Nova

### A1. Add Nova System Panel
Create a dedicated panel in the dashboard for:
- current focus
- current mode/state (`idle`, `observing`, `thinking`, `speaking`, `building`, `blocked`)
- confidence level
- active project
- open threads
- last meaningful action

### A2. Add operational telemetry
Expose meaningful telemetry, for example:
- heartbeats succeeded/failed today
- cron health snapshot
- latest project activity
- memory pulse
- current connected surfaces (dashboard, avatar, WhatsApp, etc.)

### A3. Add Jarvis-style command surface
Introduce a command-console area with:
- launch project
- open sub-dashboard
- focus by domain
- show active work only
- highlight modified-today projects

---

## Phase B — Define shared Nova state contract

Create a shared JSON contract for the dashboard and avatar to consume.

Suggested path:
- `projects/openclaw-nova-hub/public/nova-state.json`

Initial schema:
```json
{
  "timestamp": "ISO-8601",
  "nova": {
    "state": "thinking",
    "mood": "focused",
    "focus": "connectome-emulation",
    "activeThread": "real_time_neural_activity_visualization",
    "confidence": 0.82,
    "lastObservation": "Connectome and nova-avatar were modified today",
    "lastAction": "Updated project scan",
    "openLoops": [
      "Unify dashboard and avatar presence",
      "Add live neural telemetry viewer"
    ]
  },
  "systems": {
    "dashboard": "online",
    "avatar": "unknown",
    "whatsapp": "online",
    "memory": "online"
  }
}
```

This should become the bridge seed for both:
- dashboard rendering
- avatar world rendering

---

## Phase C — Connect the avatar intentionally

### C1. Respect existing avatar architecture
`projects/nova-avatar/ARCHITECTURE.md` already recommends hybrid communication with file-first sync.
Use that, do not fork it.

### C2. Add bridge visibility to dashboard
Dashboard should display:
- avatar bridge file present/missing
- avatar world last updated
- last avatar event
- "open in Godot" or launch instructions

### C3. Future: bidirectional presence
Later:
- avatar reacts to dashboard state
- dashboard shows avatar events
- both share one Nova state model

---

## Suggested implementation order

1. **Enhance existing dashboard UI** in `openclaw-nova-hub/src/components/`
2. **Add Nova state source** (`public/nova-state.json` + generator script later)
3. **Add dashboard components** for Nova core state and system telemetry
4. **Update scanner metadata** to better elevate active/today-modified projects
5. **Connect avatar bridge status** into the dashboard
6. **Later** wire state into `nova-avatar`

---

## Specific code direction

### Reuse existing files
Use and extend:
- `src/App.jsx`
- `src/components/Header.jsx`
- `src/components/DashboardExplorer.jsx`
- `src/components/CommandPalette.jsx`
- `src/components/PulseFeed.jsx`
- `src/components/NeuralGraph.jsx`

### New dashboard components to add
Inside `projects/openclaw-nova-hub/src/components/`:
- `NovaCorePanel.jsx`
- `SystemTelemetryPanel.jsx`
- `ActiveMissionsPanel.jsx`
- `AvatarBridgePanel.jsx`

This avoids creating a new app while keeping the architecture clean.

---

## Project ownership boundaries

### `openclaw-nova-hub`
Owns:
- dashboard UI
- project intelligence view
- Nova status/control surface
- aggregate state display

### `nova-avatar`
Owns:
- 3D embodiment
- interactive world scenes
- avatar behavior rendering
- in-world UI and spatial presence

### Shared contract
Owns:
- Nova state JSON schema
- avatar/dashboard bridge status model

---

## Immediate next goal

Turn `openclaw-nova-hub` from a good project map into a **Nova command center** with:
- Nova core identity/status always visible
- current important projects emphasized
- stronger Jarvis-style visual hierarchy
- clean bridge path into `nova-avatar`

---

## Why this is the right move

Because João does not need another prototype.
He already has:
- a dashboard
- an avatar world
- a memory system
- active projects

What is missing is **integration, identity, and presence**.

So the right next step is not expansion by duplication.
It is **fusion**.
