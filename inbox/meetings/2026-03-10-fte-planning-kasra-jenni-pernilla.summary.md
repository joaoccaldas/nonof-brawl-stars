# Meeting Summary — FTE planning with Kasra, Jenni, and Pernilla

- **Date:** 2026-03-10
- **Type:** Working session / process design
- **Participants (identified or likely):** João, Kasra, Jenni, Pernilla
- **Source file:** `/Users/joao/.openclaw/media/inbound/Fte_planning_kasra_jenni_and_pernilla_10032026_original---20e35524-1c03-4569-816a-56e3340e8861.txt`
- **Confidence:** High on process content

## Core topics
- Rebuilding the Nordic FTE planning file/process
- One-source-of-truth ambition for workforce planning
- HR/finance ownership split
- Use of Azets extracts vs manual local maintenance
- Versioning, update cadence, and forecast snapshots
- Sensitive payroll/salary-data handling concerns

## Main takeaways
### 1) Current FTE planning process is too messy and fragmented
- Team describes the current setup as built from multiple files/tables with unclear logic.
- A core frustration is not only process design, but also that people do not use the tools already available and do not respect deadlines.
- There is a strong signal that poor compliance, not just poor file structure, is part of the problem.

### 2) Kasra is designing a new centralized FTE planning structure
- Kasra presents a new shared structure with:
  - one Nordic-level file/folder setup
  - country-specific tabs/files
  - a Nordic consolidated view
- Goal is one place to go for workforce planning instead of scattered email/file requests.
- The proposed logic is to keep the market/HR input light while Kasra handles more of the technical calculations in the background.

### 3) Azets data should be used as a starting point, but not blindly trusted
- Kasra wants extracts from Azets to validate who is actually employed, salary details, and cost-center assignment.
- However, João/Jenni point out Azets is not fully reliable, especially in Norway and in split-cost-center cases.
- Decision pattern emerging: use Azets as starting point, then correct with HR/local knowledge.

### 4) The team wants to separate “true source” planning from historical clutter
- João explicitly says the old file had too much historical baggage.
- The new ambition is cleaner:
  - maintain a current/accurate planning file
  - keep separate follow-up for changes over time if needed
- The file should not become a graveyard of old lines just to preserve history.

### 5) They need explicit handling for mid-year salary/job changes
- Important design challenge raised:
  - promotions during the year
  - role changes
  - salary changes outside the normal increase cycle
- Proposed approach: add structured change columns/flags so adjustments are transparent and formula-driven rather than hidden manual overrides.

### 6) Forecast versions vs rolling updates must be separated
- Strong discussion about how to preserve forecast assumptions over time.
- They want both:
  - formal forecast snapshots (budget / forecast 1 / forecast 2 / etc.)
  - a rolling operational version updated more continuously
- This is a recurring João pattern: distinguish “official assumption version” from day-to-day running reality.

### 7) Sensitive payroll data is being shared too loosely today
- A very important governance issue appears:
  - payroll PDFs/files with names, salaries, social security numbers, and even bank details may be visible in places they should not be
  - MGs / accounting / SharePoint handling seems poorly controlled
- Team is clearly alarmed by this.
- This is not treated as theoretical; they see it as a live data-governance problem.

### 8) This is bigger than one file — it is standardization work
- Team repeatedly frames this as needed standardization across countries and across HR/finance interfaces.
- They want one common structure even if some country benefits/components differ.
- This mirrors João’s broader operating pattern: standardize first, then handle exceptions consciously.

## Decisions / agreements
- Proceed with the new centralized FTE-planning/shared-file structure.
- Use Azets extracts as an input source, but validate/correct with HR and finance.
- Keep forecast snapshots separate from the continuously updated version.
- Add structured handling for promotions/role changes/salary changes.
- HR should remain accountable for correctness of core people data; Kasra can own more technical calculations/modeling.

## Action items
- **Kasra:** share/access-enable the new FTE planning structure for relevant HR/finance stakeholders.
- **HR/local HR:** validate employees, salaries, cost centers, leavers/joiners against Azets extract.
- **João/Jenni/team:** define how forecast snapshot vs rolling-update versions should be handled.
- **Team:** investigate payroll-file exposure and tighten access/governance.

## Risks / process pain points
- Azets data quality is not reliable enough to trust blindly.
- Split-cost-center handling is especially problematic.
- Forecast assumptions can be lost if rolling updates overwrite the baseline.
- Sensitive payroll data may be over-shared today.
- Manual file sprawl could reappear if versioning/update rules are not explicit.

## Why it matters for João / Miele knowledge
This transcript matters because it is another strong example of João trying to turn a messy recurring admin/finance process into:
- one structured source of truth
- explicit ownership split
- better version control
- less historical clutter
- stronger data governance

It also reinforces a very important recurring theme: many Miele pain points are not only analytical — they are **workflow + ownership + data hygiene** problems.
