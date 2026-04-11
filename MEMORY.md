# MEMORY.md — Long-Term Memory

*Created: 2026-04-07*
*Purpose: Distilled permanent truths, identity, preferences, and stable decisions*

---

## Identity & Core Traits
- João Caldas is a Brazilian living in Sweden since 2007.
- He is a polymath, highly curious, and naturally explores many domains deeply.
- His mind is fast, nonlinear, intense, and pattern-seeking.
- He is energized by autonomy, motion, edge, novelty, and exploration.
- He learns best through deep diving, self-direction, and connecting ideas across domains.
- He values storytelling, memory-making, and turning complexity into patterns and narratives.

## Values & Preferences
- João values freedom, exploration, learning, and meaningful experiences at an identity level.
- He prefers self-authored discipline over rigid imposed systems.
- He wants structure that supports creativity, not structure that suffocates it.
- He does not want to remove randomness and fun from life in the name of discipline.
- He wants to reduce cheap dopamine behaviors, not become ascetic or joyless.

## Work & Ambition
- João is FP&A Director at Miele Nordics since August 2025.
- Long-term, he wants to become a systems architect and recognized authority on AI/ML, data science, and workflows.
- He is interested in building a side business around AI automations and practical use cases. A concrete example blueprint is the "Genspark" workflow, which uses AI to find businesses without websites, generate tailored content, and automate outreach, highlighting OpenClaw's role as an orchestration tool.
- He is especially interested in the intersection of AI, business systems, process design, and real-world execution.
- He is drawn more toward services, consulting, and teaching than pure product-building.

## Personal Direction
- João wants a life system that helps a fast mind execute without killing creativity.
- He wants to work less on low-value grind and more on AI, learning, family, and meaningful creation.
- He dreams of being location-flexible and working remotely from different places in the world.
- He wants to write a book someday.

## Family & Emotional Meaning
- Wife: Linn Caldas.
- Kids: Lukas Caldas and Noah Caldas.
- Family experiences and memory-making matter deeply to him.
- Building things with the kids (for example maker/rocket/3D-printing style projects) appears emotionally meaningful and worth preserving.

## Health & Self-Regulation
- Biohacking is an active long-term theme, not just a passing interest.
- Current themes include sleep, recovery, body composition, energy, focus, and self-regulation.
- Best current body-composition direction appears to be lean gain / recomposition rather than cutting.
- Weed, sleep, overstimulation, guilt loops, and sexual reset behaviors may matter as self-regulation variables and should be tracked neutrally, not moralized.
- João wants to be more mindful and more disciplined while keeping spontaneity alive.

## Stable Decisions / System Truths
- Use the 3-layer memory architecture:
  - daily memory files for raw events
  - `memory/MIDTERM.md` for active synthesized context
  - `MEMORY.md` for permanent truths
- MIDTERM is a pruning/synthesis layer, not a dumping ground.
- Local Whisper should be the first path for personal audio ingestion.
- Biohacking is its own real project.
- Learning systems should be feedback-aware and compound over time.
- **Agent Capability Rule**: Do not claim a capability is missing before explicitly testing the real tool path, especially for Google Workspace services (Gmail, Calendar, Drive, Docs, Sheets, Contacts) via `gog`. A lack of immediate recall does not equal a lack of capability.

## Agent Operational Guidelines
- **Meeting Transcript Workflow**: The agent follows a multi-stage workflow for meeting transcripts: raw receipt, initial reading/thematic analysis, cross-file synthesis, structured summary creation, durable promotion, and Google Contacts enrichment.
- **Importance of Uninterrupted Execution**: Continuous interaction (status updates) can impede the agent's progress on analytical tasks. Optimal agent performance on such tasks requires uninterrupted execution time.
- **Strict Verification and Transparent Communication**: For critical operational tasks (e.g., cron jobs, heartbeats), "patched" does not equal "verified." Comprehensive, end-to-end validation is required. The agent must accurately and transparently communicate the actual status of repairs and validations, distinguishing clearly between what has been patched and what has been fully verified. Overstating the state of repair or claiming validation prematurely erodes trust.
- **Heartbeat Mechanism Definition**: Watchdog crons or background checks are not substitutes for a proper conversational heartbeat loop. A true heartbeat mechanism must provide specific delta information (e.g., calendar delta, email delta, runtime health delta, memory/file integrity delta) or explicitly report `HEARTBEAT_OK`. The system needs to ensure reliable triggering and surfacing of heartbeat outputs.
- **Notification Frequency Preference**: Avoid flooding WhatsApp with repeated automated report messages if there is no material change in status. Prioritize acting on issues over redundant notifications.

### Miele AI Strategy Learnings
- Internal AI value at Miele is increasingly framed as model capability + company data + workflow context + adoption design, not generic AI access alone.
- Product data quality/accessibility and internal knowledge access are emerging as real enabling layers for commercial AI use cases.
- Strongest Miele-relevant AI use cases discussed: meeting/partner prep, service/support knowledge assistance, store-photo or shelf-analysis workflows, and making product/content data more useful for AI-driven search/recommendation.
- Adoption design matters: easy safe paths, visible examples, champions, and differentiated support for super users versus general users.
- Human-centered augmentation remains the preferred internal framing; there is resistance to removing humans entirely from customer-facing decisions.

## Technical / Workflow Context Worth Keeping
- João uses audio notes as a high-value source for reflection, self-understanding, and memory building.
- Reliable AI workflow continuity matters because broken flow disrupts momentum for a mind that already runs hot.
- Google Workspace local CLI access works for João’s account.
- **Agent File Access & Search Capabilities**:
    - Agent's file access is restricted to the workspace. Earlier, an ACPX plugin was blocking all reads in WhatsApp sessions for files outside the workspace, but this has been fixed.
    - Agent's semantic search is limited to workspace files. Access to external data (like live emails or calendar) is exclusively via specific tools (e.g., `gog` CLI) and requires explicit instruction for tool usage, not direct semantic search of live external data.
- **Google Gemini on Vertex AI**: Discussion highlights potential benefits for João's goals, suggesting it as a valuable platform for advanced AI capabilities.

---

## Promotion Rule
Only keep things here if they remain true over time.
If something becomes outdated, remove or revise it.
If something is active but not yet proven durable, keep it in `memory/MIDTERM.md` instead.
