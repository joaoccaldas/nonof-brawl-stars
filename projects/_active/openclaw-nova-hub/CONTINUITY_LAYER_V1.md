# Continuity Layer V1

Updated: 2026-04-21

## Current Status

**V2 Released 2026-04-21**: Runtime-aware continuity now ingests OpenClaw bridge data for waiting-on and drift signals. See implementation section for details.

## Purpose

Continuity Layer V1 gives Nova a visible, explicit state model that keeps action, waiting, completion, and drift in sync across conversation and dashboard surfaces.

It is not full autonomy.
It is the first reliable glue between:
- user request
- Nova action
- Nova visible reply
- Nova dashboard state

## Core problem it solves

Observed failure pattern:
- João answers
- Nova behaves as if she is still waiting
- Nova starts acting but visible reply does not reflect that
- Nova goes silent after action and leaves the interaction emotionally unresolved

V1 exists to reduce those failures.

## V1 outputs

### 1. State buckets
The continuity layer should always try to classify Nova into one primary state:
- `idle`
- `acknowledged`
- `acting`
- `waiting_on_tool`
- `waiting_on_user`
- `blocked`
- `delivered`
- `drift_risk`

Only one primary state should be surfaced at a time.

### 2. Visible dashboard fields
`public/continuity-status.json` should grow toward this shape:

```json
{
  "timestamp": "ISO-8601",
  "status": {
    "mode": "acting",
    "staleRisk": "low|medium|high",
    "summary": "short plain-language state"
  },
  "doingNow": [],
  "waitingOn": [],
  "lastCompleted": [],
  "nextRecommended": [],
  "openLoops": [],
  "lastUserSignal": {
    "type": "approval|question|reply|media|unknown",
    "summary": "short summary",
    "timestamp": "ISO-8601"
  },
  "lastNovaVisibleAction": {
    "type": "reply|tool-result|status-update|none",
    "summary": "short summary",
    "timestamp": "ISO-8601"
  },
  "driftSignals": []
}
```

### 3. Behavioral goals
The continuity layer should influence behavior so that Nova:
- does not ask again for already-granted approval
- does not reply as if still waiting when work has started
- closes loops after meaningful completions
- names exact blockers when blocked
- avoids empty placeholders unless a real follow-through exists

## V1 file ownership

### Dashboard project files
- `projects/openclaw-nova-hub/scripts/generate-continuity-status.mjs`
  - file-first continuity synthesis
- `projects/openclaw-nova-hub/public/continuity-status.json`
  - browser-safe continuity state
- `projects/openclaw-nova-hub/src/components/ContinuityPanel.jsx`
  - continuity display surface
- `projects/openclaw-nova-hub/QUEUE.md`
  - manual project queue context
- `projects/openclaw-nova-hub/NEXT-ARCHITECTURE-PLAN.md`
  - architecture direction

### Future skill files
- `skills/continuity-debugging/SKILL.md`
  - reusable repair workflow once V1 is stable

## V1 implementation phases

### Phase 1 — file-first synthesis ✅ COMPLETED
Sources continuity from:
- queue docs
- architecture docs
- safe generated runtime files

This was intentionally simple and browser-safe.

### Phase 2 — runtime-aware continuity ✅ COMPLETED (2026-04-21)
**Implementation**: `scripts/generate-continuity-status.mjs` v2.0-runtime-aware

Now ingests from:
- `openclaw-status.json` bridge data
- Active session detection (deduplicated by sessionId)
- Session age analysis (stale: 5-15 min, drift: >15 min)
- Waiting-on signals:
  - `user`: active group conversations
  - `subagent`: running subagent work
  - `system`: gateway offline or other system issues
- Drift signals: stale/drifted sessions with human-readable duration formatting
- Cron health: failed job detection
- Stale risk computation: low/medium/high based on runtime state

### Phase 3 — conversation-aware continuity
**Status:** NOT YET IMPLEMENTED

Add careful synthesis of:
- whether user already answered
- whether Nova already acknowledged and moved
- whether follow-up is stale or synchronized

This phase should be done carefully to avoid exposing raw conversation content in public JSON.

## V1 stale/drift signals

Examples of signals to compute later:
- work started but no visible completion after threshold
- user approval received but state still says waiting
- tool finished but no visible update after threshold
- repeated placeholder acknowledgments without closure

## Success criteria for V1

V1 is good enough when:
- the hub shows useful continuity state, not just project state
- Nova has a structured place to record doing/waiting/completed
- João can inspect continuity instead of guessing
- the most common action/reply desync patterns become easier to notice and reduce

## Non-goals for V1

Do not try to solve everything now:
- full autonomous orchestration
- perfect conversation memory synthesis
- broad plugin expansion
- fancy analytics before reliable state exists

## Recommendation

**Phase 2 (Runtime-aware) is now complete.** The continuity layer now ingests OpenClaw bridge data and synthesizes waiting-on signals, drift detection, and stale risk from real runtime state.

Phase 3 (conversation-aware) should be implemented once:
- Phase 2 proves stable in daily use
- Safe patterns for conversation signal extraction are established
- Privacy-preserving message synthesis is validated

The continuity layer is now a narrow reliability layer with runtime truth.
