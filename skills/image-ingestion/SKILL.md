---
name: image_ingestion
description: Ingest recurring images into the workspace for analysis, structured extraction, and knowledge building. Use when the user sends images/screenshots/photos that should be analyzed, summarized, mined for data, or linked to projects, memory, or knowledge. Check for existing workflows before creating new ones.
---

# Image Ingestion

## Goal

Turn user-shared images into structured, queryable insight instead of one-off observations.

## Default workflow

1. Check whether an existing bundled/local workflow already covers the task.
2. Identify the image type:
   - screenshot
   - photo
   - document snapshot
   - whiteboard/diagram
   - chart/table/data image
3. Use the image analysis tool to extract the relevant signal.
4. Save any structured output or notes to the appropriate workspace area when the result should persist.
5. If the image contains actionable/project information, connect it to `projects/`, `memory/`, or `knowledge/` as appropriate.

## Output contract

An image is only "processed" when:
- the requested analysis/extraction has been completed
- any durable artifact that should persist has been written to the workspace
- the user has a clear summary of what was extracted

## Routing guidance

- Raw or one-off image interpretation may not need file writes.
- Reusable structured extraction should land in the right domain location:
  - `inbox/` for raw captured notes
  - `memory/` for event/context trace
  - `knowledge/` for durable truths
  - `projects/` for active work artifacts

## Maintenance

- Keep environment-specific model/tool defaults in `TOOLS.md`.
- Keep image workflow rules here.
