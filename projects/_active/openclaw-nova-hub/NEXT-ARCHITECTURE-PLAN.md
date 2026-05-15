# Next Architecture Plan — Nova Improvement Stack

Updated: 2026-04-21

## Immediate priority

### 1. Continuity + statefulness layer
Why:
- This is the biggest trust and flow breaker right now.
- João experiences it as drift, reset, or silence after action.
- A Jarvis-like system must stay synchronized between work state and visible conversation state.

What to build:
- A lightweight continuity contract for Nova Hub and runtime status.
- Explicit state buckets:
  - acknowledged
  - acting
  - waiting-on-tool
  - blocked
  - delivered
- Surface recent completed actions and pending waits in the hub.
- Add a small "Nova is doing" / "Nova is waiting for" surface.

### 2. Harden OpenClaw bridge
Why:
- Current runtime panel still exposes partial CLI mismatch.
- The dashboard should report truth, not placeholder or broken command assumptions.

What to fix:
- sessions: use supported `openclaw sessions --json`
- tasks: use `openclaw tasks maintenance --json` and/or `openclaw tasks audit --json`
- models: probe with lower timeout / fallback to non-probe status if probe times out
- convert raw CLI outputs to concise health summaries

### 3. Visual identity polish
Why:
- The center now has presence, but the identity system is still incomplete.
- Nova needs a consistent visual language across hero, sidebars, badges, and future avatar renders.

What to build:
- mood-driven palette system
- small portrait/crest component
- unified iconography / signals / accents
- make right sidebar feel premium, not diagnostic

### 4. Reliable screenshot loop
Why:
- Fast visual iteration needs reliable capture.
- If Nova can show current state visually, João can review without friction.

What to build:
- fix host browser capture path
- fallback capture path if browser tool is unavailable
- add a repeatable screenshot workflow

## Skills we should have

### A. continuity-debugging
Why:
- We have now repeatedly identified the same failure class: action/reply desync.
- This should become a reusable diagnostic and repair workflow, not remain implicit.

Should cover:
- detect stale acknowledgment patterns
- check if work started but no user-facing completion followed
- identify likely conversational state drift
- propose fix path and logging conventions

### B. dashboard-runtime-hardening
Why:
- Nova Hub now has multiple bridges and runtime surfaces.
- We need one canonical workflow for adding or fixing operational panels safely.

Should cover:
- safe JSON generation
- CLI compatibility checks
- display-safe transformation rules
- browser-safe telemetry policy

### C. screenshot-review-loop
Why:
- We are visually iterating often now.
- Screenshot capture, review, and compare should be explicit and reliable.

Should cover:
- capture path selection
- naming and storage convention
- comparison prompts
- fallback if browser tools fail

## Cron jobs we should have

### 1. Nova continuity audit heartbeat
Why:
- Detect if the system is repeatedly going silent or drifting after action.

Should check:
- recent messages vs recent task completions
- repeated placeholder acknowledgments
- long-running waits without closure

### 2. Nova Hub runtime refresh
Why:
- Keep `system-status.json` and `openclaw-status.json` fresh even when not actively editing.

Should run:
- every 1-5 minutes locally, lightweight

### 3. Screenshot health or preview refresh (later)
Why:
- If we add reliable capture, we can keep a recent preview artifact for rapid review.

## MCP servers / integrations worth adding

### 1. File/system telemetry MCP or local bridge
Why:
- Cleaner access to machine stats than parsing shell output forever.
- Better structured telemetry for CPU, RAM, disk, maybe battery/temperature.

### 2. Browser automation / screenshot MCP path
Why:
- We need robust visual inspection and screenshot delivery.
- This directly improves iteration speed.

### 3. Git / repo insight MCP
Why:
- Helpful for surfacing changed files, recent commits, and project drift in the hub.
- Makes the command center more aware of actual workspace movement.

### 4. Optional local SQLite / search bridge for runtime history
Why:
- Later we may want to track action continuity, recent completions, and state transitions historically.

## Plugins / tool directions

### Strongly useful
- better screenshot capture path
- structured runtime telemetry
- task/session observability
- safe local action launcher for dashboard buttons

### Avoid for now
- too many new surfaces before continuity is fixed
- fancy autonomy plugins without observability
- network complexity before file-first flows are stable

## Recommendation

The next concrete build step should be:
1. fix and harden `openclaw-bridge.mjs`
2. add a small continuity status panel to the hub
3. document a dedicated continuity-debugging skill

That sequence improves trust, truthfulness, and future autonomy all at once.
