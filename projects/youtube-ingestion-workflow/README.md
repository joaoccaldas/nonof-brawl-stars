# YouTube Video Ingestion Workflow (v1.1)

This workflow describes the process for taking an external YouTube URL, extracting rich, structured, and actionable intelligence, and storing it within the appropriate knowledge silos.

**Goal:** To transform volatile, unstructured video content into durable, queryable, and contextual knowledge assets within the workspace.

**Trigger:** A new YouTube link is provided by João.

**Process Steps:**

1.  **Metadata Extraction (Initial Pass):**
    *   Fetch Title, Channel, Publish Date, and Duration.
    *   Generate a preliminary file path: `inbox/youtube/[YYYY-MM-DD]-[VideoID]-[Title-Snippet].md`
    *   Store raw metadata.

2.  **Transcript Acquisition & Cleaning:**
    *   Fetch the full transcript using `yt-dlp` or a similar tool.
    *   Save the raw `.srt` or plain `.txt` transcript to the `inbox/youtube/[VideoID]-raw-transcript.txt`.
    *   **CRITICAL:** Run a script (or sub-agent) to clean this transcript, removing filler words, speaker labels, and timestamps, generating `inbox/youtube/[VideoID]-cleaned.txt`.

3.  **Enrichment & Analysis (The 'Supernova' Layer):**
    *   The core analysis agent will process the `cleaned.txt`.
    *   **Output Artifacts:**
        *   **Analysis Note:** A structured Markdown file (`...-analysis.md`) written to `inbox/`. This note must contain:
            *   Summary of 3-5 key concepts.
            *   Caveats/Assumptions made by the video creator.
            *   Action items/Takeaways for João (e.g., "Investigate Topic X," "Discuss with Linn").
            *   Links to relevant internal knowledge (`[[knowledge/ME.md#section]]`).
        *   **Knowledge Promotion:** After review, the most permanent, non-actionable insights (e.g., "What is the fundamental nature of Topic Y?") are promoted to the correct durable file (e.g., `knowledge/CONCEPTS.md`).

4.  **Final Archival & Contextualization:**
    *   The final, enriched analysis note is copied/linked to the **`memory/`** directory using the date of *analysis completion*. This marks it as processed intelligence.
    *   If the topic is high-level/philosophical, it is flagged for review in `memory/MIDTERM.md` for potential long-term inclusion.

**Key Principles:**
*   **Never** let raw links remain unprocessed in the inbox—they must generate an analysis note.
*   The goal is **Synthesis**, not just transcription. We are building insights, not archives.