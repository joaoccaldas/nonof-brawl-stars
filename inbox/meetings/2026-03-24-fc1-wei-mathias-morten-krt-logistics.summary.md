# Meeting Summary — FC1 with Wei / Mathias / Morten (KRT logistics)

- **Date:** 2026-03-24
- **Type:** Forecast-one working session
- **Participants (identified or likely):** João, Wei, Morten, possibly Mathias contextually
- **Source file:** `/Users/joao/.openclaw/media/inbound/Fc1_wei_mathias_morten_krt_logistics_original---2bb80975-ef27-497a-a034-4086232d98cb.txt`
- **Confidence:** High on themes and decisions

## Core topics
- How to handle forecast-one logistics planning pragmatically
- Relationship between sales assumptions, units, mix, and logistics cost
- KRT/project channel complexity
- Need for defensible assumptions instead of fake precision
- Building reusable calculation structure rather than reworking manually each round

## Main takeaways
### 1) João wants a pragmatic, assumption-driven logistics model
- He does not want the team paralyzed by lack of perfect data.
- The objective is to define the best defendable assumptions now, document them, and let the model update when final sales/unit inputs arrive.
- He repeatedly emphasizes that if the structure is correct, later changes should flow through automatically rather than trigger total rebuilds.

### 2) Morten wants to avoid repeated rework
- He explicitly says supply-chain planning should not be reworked 3–5 times while sales assumptions are still moving.
- Preferred approach:
  - prepare structure and assumptions now
  - wait for final approved quantities / sales inputs
  - then press the button and generate final FC1 supply-chain numbers
- He sees this as both a communication problem and a process-structure problem.

### 3) KRT/project business is harder to model than other channels
- Wei explains KRT is much less straightforward than more direct/retail channels.
- Forecasting at granular product detail can become partly “artificial” because project behavior is less stable / more bespoke.
- João pushes back slightly: even if assumptions are imperfect, they still need an explicit assumption set rather than vague intuition.
- The right standard becomes: **explicit assumptions + business rationale + later variance explanation**.

### 4) Logistics should likely be modeled initially as percent of net sales
- They discuss whether to use per-unit cost vs percent-of-net-sales.
- For FC1, the pragmatic near-term method appears to be using percent of net sales by market/channel/business bucket, informed by budget, prior year, and year-to-date actuals.
- Longer term, better customer/channel allocation logic is desired.

### 5) The team wants a clearer table/model structure
- Discussion moves toward building a cleaner matrix by market / business / month with items like freight, logistics, etc.
- They want to stop relying on messy inherited files and instead create a simpler model that can be explained and maintained.

### 6) Assumptions must be documented visibly
- Examples mentioned include:
  - inflation assumptions
  - freight contract changes
  - fuel surcharge risks
  - warehouse cost changes / reclassification questions
  - direct-vs-channel mix changes
- João suggests these assumptions should also feed a simple explanatory slide / waterfall logic versus budget.

## Decisions / agreements
- Morten / team will prepare assumption structure now rather than wait passively.
- Logistics model should be simple, pragmatic, and changeable.
- FC1 should prioritize defendable assumptions over false precision.
- João will send more explicit deck/structure follow-up and align again before presentation.

## Action items
- **Morten:** continue building assumption list and logistics structure.
- **Wei/Mathias/context owners:** provide relevant channel / net-sales / unit assumptions.
- **João:** send deck idea / alignment follow-up and help connect logistics to forecast-one presentation logic.
- **Team:** document assumptions and make model responsive to input changes.

## Risks / process pain points
- KRT/project behavior is structurally harder to model than repeat channels.
- Legacy files are messy and not ideal for reusable forecasting.
- Timing is tight; there is a strong temptation to chase false precision.
- Some cost buckets / ownership boundaries (e.g. warehouse-related items) may be blurred.

## Stakeholders / entities to track
- João
- Wei
- Morten
- Mathias
- Nicholas
- KRT / project channel owners

## Why it matters for João / Miele knowledge
This transcript is a strong example of João’s practical systems leadership style:
- he pushes for better structure without waiting for perfect systems
- he prefers explicit assumptions over hidden intuition
- he is building a forecasting culture where models should be updateable, explainable, and increasingly automated
