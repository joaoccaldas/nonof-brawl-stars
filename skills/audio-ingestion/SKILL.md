---
name: audio_ingestion
description: Ingest recurring personal audio notes or voice messages into the workspace. Use when the user sends audio/voice notes that should be transcribed, summarized, mined for durable context, or routed into inbox/memory. Prefer the existing local Whisper path first; check for existing audio/transcript skills or workflows before inventing new ones.
---

# Audio Ingestion

## Goal

Turn raw audio messages into useful, safe, reusable workspace artifacts.

## Default workflow

1. Check whether an existing bundled/local skill or workflow already covers the task before adding anything new.
2. Save the raw transcript in `inbox/notes/`.
3. Prefer local Whisper for short voice notes on this MacBook Air.
4. Start with the lightweight local path already validated in this workspace:
   - local `whisper`
   - `--model base`
   - specify language when obvious
   - output transcript as `.txt` into `inbox/notes/`
5. Only escalate to a larger model if transcript quality is clearly insufficient.
6. Treat the raw transcript as inbox material, not durable memory.
7. Extract only durable, useful signals into memory:
   - stable facts
   - preferences
   - recurring themes
   - meaningful life/career context
8. Avoid over-promoting intimate/private details unless clearly useful for future help.

## Output contract

A voice note is only "processed" when these exist:
- raw transcript in `inbox/notes/`
- user-facing synthesis in chat
- any durable facts promoted intentionally to memory (only when justified)

## Privacy + memory rules

- Raw transcript stays in `inbox/notes/`.
- `memory/YYYY-MM-DD.md` gets event/log style notes when the content matters.
- `MEMORY.md` only gets distilled long-term facts in private/main-session contexts.
- Do not dump full personal transcripts into long-term memory.

## Maintenance

- Keep machine-specific execution defaults in `TOOLS.md`.
- Keep workflow logic here.
- If a new transcription path is tested and proven better, update this skill and then update `TOOLS.md` if the change is environment-specific.
