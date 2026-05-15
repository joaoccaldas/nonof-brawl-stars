# Knowledge Pipeline

## Purpose

Nova Hub now builds its knowledge graph from real `memory/YYYY-MM-DD*.md` files instead of synthetic demo nodes.

## Outputs

- `public/knowledge-graph.json` — graph payload consumed by the React UI
- `.cache/knowledge-pipeline-cache.json` — incremental parse cache keyed by file hash

## Pipeline flow

1. Discover memory markdown files matching `memory/YYYY-MM-DD*.md`
2. Reuse cached parses when file SHA-1 is unchanged
3. Parse each memory into:
   - memory node
   - entity nodes (people, organizations, projects, concepts, events)
   - event nodes from markdown sections
   - temporal signals from dates and `HH:MM` mentions
   - sentiment/intensity from lightweight lexical scoring
4. Aggregate cross-file relationships:
   - co-occurrence links inside sections
   - memory → event containment links
   - theme → entity amplification links for emerging concepts
5. Emit UI-ready JSON for D3 force layout

## Entity extraction

The scanner combines several heuristics:

- markdown headings
- emphasized bullet labels like `- **Voice Clone Created**`
- inline code references
- title-cased phrases
- repeated multi-word keyword phrases

Normalization deduplicates casing and accents, so `OpenClaw`, `openclaw`, and `OPENCLAW` collapse to the same canonical entity key.

## Incremental updates

Cache file structure:

```json
{
  "files": {
    "2026-04-27.md": {
      "hash": "...",
      "parsed": { "...": "..." }
    }
  },
  "graph": {
    "generated": "...",
    "reparsed": 3,
    "fileCount": 54
  }
}
```

Only changed memory files are reparsed. Deleted files are evicted from cache before regenerating the graph.

## Graph schema highlights

Top-level payload:

- `generated`
- `stats`
- `nodes`
- `links`
- `emergingThemes`
- `unexpectedConnections`
- `timeline`
- `sourceInfo`

Node types used by the UI:

- `memory`
- `person`
- `organization`
- `project`
- `concept`
- `event`
- `theme`

Link types used by the UI:

- `relates`
- `co_occurs`
- `contains`
- `amplifies`

## Running

```bash
npm run scan-knowledge
```

This now points to `scripts/scan-knowledge-pipeline.mjs`.

## Testing

`tests/knowledge-pipeline.test.mjs` covers:

- pipeline output validity
- deduplication of entity aliases
- presence of emerging themes and relationship strength
- client hook file existence and component integration markers

Run:

```bash
node --test tests/knowledge-pipeline.test.mjs
```
