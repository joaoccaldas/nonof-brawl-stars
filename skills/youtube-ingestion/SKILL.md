---
name: youtube_ingestion
description: Ingest YouTube videos into the workspace as repeatable knowledge artifacts. Use when the user sends YouTube links that should be processed into metadata, transcript, cleaned text, analysis, action items, and possible knowledge promotion. Check for existing workflows before creating new ones.
---

# YouTube Ingestion

## Goal

Turn a YouTube URL into structured, reusable knowledge artifacts.

## Default workflow

1. Check for an existing relevant skill/workflow before inventing another one.
2. Capture metadata with `yt-dlp`:
   - title
   - channel
   - publish date
   - duration
   - canonical URL / video id
3. Save raw subtitle/transcript output into `inbox/youtube/`.
4. Generate a cleaned text transcript in `inbox/youtube/`.
5. Write an analysis note in `inbox/youtube/` using the processing date.
6. Frame the analysis in terms of João's actual interests/goals when relevant.
7. Distinguish hype from durable signal.
8. Promote only durable concepts later into `knowledge/`.

## Output contract

A YouTube video is only "processed" when these exist:
- raw subtitle/transcript artifact in `inbox/youtube/`
- cleaned transcript in `inbox/youtube/`
- analysis note in `inbox/youtube/`
- user-visible confirmation that the artifacts were stored

Optional later steps:
- memory note in `memory/YYYY-MM-DD.md`
- concept promotion to `knowledge/CONCEPTS.md`
- project linkage when actionable

## Naming guidance

- Raw artifacts may use source/publish date when derived from source metadata.
- Analysis notes should use processing date + video id + stable slug.
- Keep naming consistent enough for grep/search by video id.

## Analysis guidance

Prefer extracting:
- 3-5 key concepts
- why it matters to João
- caveats / assumptions / hype filter
- practical action items or reflective questions
- relation to Miele / side business / learning when relevant

## Maintenance

- Keep tool/machine specifics in `TOOLS.md` only when they are environment-specific.
- Keep workflow rules here.
- If this grows, add `references/` or `scripts/` rather than bloating `SKILL.md`.
