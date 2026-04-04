---
name: meeting_transcript_ingestion
description: Ingest recurring meeting transcripts into the workspace for structured business extraction. Use when the user shares meeting transcripts, call notes, or transcript files that contain names, contacts, business context, processes, deadlines, actions, stakeholder dynamics, or internal company topics. Check for existing skills or workflows before inventing new ones.
---

# Meeting Transcript Ingestion

## Goal

Turn noisy business transcripts into structured, reviewable insight without losing the raw source.

## When to use

Use for:
- meeting transcript files
- exported call transcripts
- internal business conversation transcripts
- transcripts from work trips, workshops, forecast reviews, operating reviews, or stakeholder meetings

Do not treat these like ordinary personal audio notes. They need a more structured extraction path.

## Default workflow

1. Check whether an existing skill or workflow already covers the task.
2. Preserve the raw transcript as source material.
3. Assume the transcript may be noisy, incomplete, or partially wrong.
4. Extract the meeting into structured sections:
   - meeting context / likely title
   - participants or likely participants
   - key topics
   - decisions made
   - action items
   - owners
   - deadlines / timing
   - open questions
   - stakeholder notes / concerns
   - business/process risks
5. Mark uncertainty clearly when the transcript is garbled.
6. Separate what is explicit from what is inferred.
7. Keep sensitive/internal company details out of broad/general memory unless intentionally summarized at the right level.

## Output contract

A meeting transcript is only "processed" when:
- the raw transcript is preserved
- a cleaned business summary exists
- decisions/actions/open questions are extracted
- the user can quickly understand what matters next

## Extraction guidance

Prioritize:
- decisions that change direction or assumptions
- concrete actions and owners
- dates, deadlines, or meeting dependencies
- process pain points
- repeated blockers
- stakeholder positions or concerns
- business logic behind a decision, not only the spoken words

When transcripts are messy, prefer:
- "likely decision"
- "possible action"
- "unclear / verify manually"

## Sensitivity rules

Meeting transcripts may contain:
- internal company names
- employee names
- commercial terms
- bonus/compensation discussions
- customer specifics
- process weaknesses
- strategy details

Treat these carefully.
- Raw transcript should stay as source material.
- Summaries should be useful but restrained.
- Only promote durable lessons or workflow improvements into wider knowledge/memory.
- Do not casually surface sensitive names/details outside the relevant context.

## Recommended outputs

For each transcript, try to produce:
1. **1-paragraph executive summary**
2. **Key topics**
3. **Decisions made**
4. **Action items (owner / action / when)**
5. **Open questions / ambiguities**
6. **Risks / blockers / tensions**
7. **What João should pay attention to next**

## Maintenance

- Keep environment-specific execution defaults in `TOOLS.md`.
- Keep transcript workflow rules here.
- If this becomes repetitive enough, add scripts/references later rather than bloating this file.
