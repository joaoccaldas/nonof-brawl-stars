# INGESTION-ARCHITECTURE.md

## Purpose

Shared rules for all recurring ingestion workflows.

These rules apply across:
- audio ingestion
- YouTube ingestion
- image ingestion
- meeting transcript ingestion
- future repeated source pipelines

The goal is to ensure all ingested content is:
- normalized
- deduplicated
- stored predictably
- reusable for later knowledge graph / entity-relation extraction

---

## Core ingestion contract

Each source should move through these layers:

1. **Raw source**
   - original file, link, or transcript
   - preserved in `inbox/` or the appropriate raw area

2. **Normalized artifact**
   - cleaned text / normalized metadata / stable file naming
   - canonical processing representation

3. **Structured extraction**
   - entities, dates, topics, actions, decisions, tags, confidence

4. **Routing**
   - `memory/` for event/context trace
   - `knowledge/` for durable distilled knowledge
   - `projects/` for active work outputs

5. **User-visible confirmation**
   - explicit status of what was processed and where it was stored

---

## Normalization rules

Every recurring ingestion workflow should normalize:
- dates
- source ids / canonical urls
- names when high confidence
- section structure
- artifact naming
- processing status

Prefer stable, grep-friendly naming that includes:
- processing or source date
- source id when available
- stable slug

---

## Deduplication rules

Avoid duplicates at multiple levels:
- raw source processed twice
- same source stored under multiple ambiguous names
- same summary re-created unnecessarily
- same durable fact promoted repeatedly

Preferred dedup signals:
- source id / canonical url
- filename match
- transcript hash if needed later
- semantic duplicate detection when sources overlap heavily

If something already exists, prefer:
- updating delta
- linking to the canonical artifact
- stating it already exists

---

## Metadata minimums

When possible, structured extraction should include:
- source type
- source id
- canonical url or file reference
- date or date range
- people/entities
- organizations
- topics
- actions
- decisions
- open questions
- tags
- confidence / ambiguity markers

Not every source needs all fields, but recurring workflows should aim toward this shape.

---

## Memory and privacy routing

- Raw/private material should not be over-promoted.
- `memory/YYYY-MM-DD.md` is the first landing zone for contextual events and provisional learnings.
- `knowledge/` should contain more distilled, stable knowledge.
- Sensitive business and intimate personal details should be handled with restraint.
- Hypotheses about a person are not the same as stable facts.

---

## Model / agent routing principle

Do not assume the same model is best for every stage.

Different stages may use different strengths:
- fast extraction
- long-context synthesis
- coding/automation implementation
- lightweight repeated parsing

Skills should gradually document the preferred model/agent lane for each workflow stage.

---

## Future graph-readiness

Store outputs so future systems can connect:
- people
- companies
- relationships
- meetings
- projects
- ideas
- actions
- recurring concepts

This means consistent identifiers and structured fields matter even before a graph exists.
