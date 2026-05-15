# Command Center Purpose

## Core framing

The Nova Command Center should not be a generic dashboard.

It should be a living cognitive cockpit for João and Nova.

Nova remains the center of the experience, but the surface must also provide real leverage:
- truth about what is happening now
- access to architecture, knowledge, and projects
- orientation about what matters next
- a fast path into action

## The 5 highest-value uses

### 1. Presence
A strong sense that Nova is here, alive, oriented, and in a real state.

Questions answered:
- What state is Nova in right now?
- What is she focused on?
- Is she acting, waiting, idle, or blocked?

UI implication:
- Nova embodiment is primary
- state is ambient, not verbose
- avoid explanatory dashboard prose

### 2. Runtime truth
A trustworthy view of live system/runtime reality.

Questions answered:
- What is running?
- What is healthy or drifting?
- Are automations active, scheduled, or idle?
- Is runtime truth aligned with what the UI implies?

UI implication:
- no misleading labels like "0 automation" when runtime work exists elsewhere
- distinguish scheduled jobs from live orchestration and available automation surfaces
- favor compact, truthful signals over decorative status blocks

### 3. Navigation
A clean way to move through projects, architecture, and documents without turning Home into menu clutter.

Questions answered:
- Where do I go next?
- How do I reach a project, dashboard, doc, or system?
- How do I inspect the architecture without losing the sense of center?

UI implication:
- Home stays minimal
- Explorer handles density and browsing
- navigation should be layered, not dumped onto Home

### 4. Leverage
The command center should help João and Nova act, not just observe.

Questions answered:
- What should we do next?
- What is waiting?
- What is the strongest next move?
- Where is the highest leverage right now?

UI implication:
- Home should surface only the highest-value next signals
- command strip / chips are better than panel-heavy explanations
- focus on action energy, not passive reporting

### 5. Shared cognition
The surface should help both João and Nova think better together.

Questions answered:
- How do we make better use of this workspace?
- How do memory, architecture, projects, and runtime connect?
- How does the command center become useful for both of us?

UI implication:
- architecture should be navigable, but secondary to presence
- knowledge/doc access should feel like extension of cognition, not admin UI
- the surface should help build continuity and shared situational awareness

## Product rule

If an element does not strengthen one of these 5 uses, it should be removed, demoted to Explorer, or hidden behind progressive reveal.

## Home vs Explorer

### Home
Home is for:
- presence
- runtime truth
- highest-leverage action signals
- minimal navigation affordances

Home is not for:
- dense browsing
- full architecture listing
- document dumps
- large menu systems

### Explorer
Explorer is for:
- architecture navigation
- project browsing
- document/project discovery
- denser interaction surfaces

Explorer should complement Home, not replace it.

## Immediate design consequences

1. Fix the misleading automation section to represent runtime truth honestly. ✅ Initial pass completed, now models scheduled plus live runtime plus available surfaces.
2. Keep shrinking text and panel chrome on Home.
3. Make Nova embodiment more premium and more central.
4. Treat architecture/document access as layered navigation, mostly outside Home.
5. Design future additions by use-case first, not panel-first.
