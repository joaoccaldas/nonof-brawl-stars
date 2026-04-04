# Meeting Summary — Bonus accrual / CRM training (part 2)

- **Date:** 2026-03-23
- **Type:** Process training / working session
- **Participants (identified or likely):** Kasper, Barbara, Delphine, FP&A / commercial controllers, others
- **Source file:** `/Users/joao/.openclaw/media/inbound/Mgs_bonus_accrual_crm_part_2_23.03.2026_original---85aa0687-2e0a-455d-a925-4b77ed368e26.txt`
- **Confidence:** High on process content

## Core topic
Practical training on CRM/SERUM bonus agreement handling: agreement maintenance, reprocessing, partial/final settlement, and extracting customer-facing credit note documentation.

## What was covered
### 1) Where bonus handling happens in CRM
- Bonus management area is the core place to work.
- Main functions highlighted:
  - rebate agreements (master data / agreement setup)
  - rebate due list items (settlement processing)
  - rebate due list display/export
  - settlement documents display/output

### 2) Agreement maintenance rules
- Agreement master data has strict limits on what can be changed.
- Some fields (like payer / structural elements) cannot simply be edited mid-year; incorrect setup may require reprocessing to zero and closure.
- Actions / settlement header text can be updated for customer-facing clarity.
- Settlement values must be entered **net**, because CRM adds gross/VAT automatically.

### 3) Condition maintenance and reprocessing
- Team was shown how to add/change/deactivate conditions.
- Removing conditions requires reprocessing to zero before deactivation.
- If accrual percentages change (for example growth bonus from 3% to 4%), reprocessing recalculates historically from the agreement validity start date.
- Posting date selection is critical because it determines where the P&L impact lands.
- For month-end, they use the last date of the closing month to avoid shifting impact to the next period.
- Fast-track processing is usually preferred, but can be congested around closing.

### 4) Settlement execution
- Team reviewed partial vs final settlement logic:
  - **Partial settlement** for regular in-year payouts
  - **Final settlement** closes the agreement and must be used carefully
- For monthly-settled agreements, many partial settlements are done, then a final settlement at year-end.
- Settlement processing requires careful checking of date and net value.
- System does not sum values conveniently across many lines, so export/check in Excel is often needed.

### 5) Retrieving customer-facing credit note PDFs
- Settlement documents can be looked up via settlement id or agreement id.
- Previous output can be re-sent / printed to email as PDF.

## Key process lessons
- FP&A / market teams own accrual quality and business correctness.
- Barbara / ESF own technical handling support in the system.
- Clear separation is needed between **ownership** and **execution support**.
- There is a strong need for a documented workflow with clear responsibilities, handoffs, and timing.

## Decisions / agreements
- The session should serve as training documentation for reuse.
- Team needs a more streamlined, documented workflow with clear stakeholder ownership.
- Immediate practical focus before March close:
  - make sure agreements exist and are running
  - ensure accrual percentages are roughly correct already now
  - avoid waiting until month-end to fix master data / agreements

## Action items
- **Market/controller side:** ensure agreements are in CRM and approximately correct already before closing.
- **Market/controller side:** review customers with missing or incorrect accruals.
- **Controllers:** prepare for March settlement / quarter close using correct dates.
- **Regional/process owners:** document end-to-end workflow and stakeholder responsibilities.
- **KRT / local teams:** clean up agreements for 2026, even where signatures are still in progress, using best known agreed terms.

## Risks / process pain points
- Too much relies on expert knowledge held by a few people.
- System actions are operationally sensitive: wrong settlement type or wrong posting date can create accounting/process problems.
- There is still no elegant bulk handling for some repetitive settlement/export work.
- Agreement setup delays distort accrual accuracy and therefore planning / forecast quality.
- Link to AR/credit-management flow is not fully documented even if it is usually manageable in practice.

## Stakeholders / entities to track
- Kasper
- Barbara
- Delphine
- ESF / technical support
- Market bonus/accrual owners

## Why it matters for João / Miele knowledge
This is a core source transcript for the **bonus accrual control workflow** João wants to harden. It captures:
- practical CRM mechanics
- ownership split between business and technical support
- why pre-close setup matters for forecast quality
- why a documented workflow is needed for scaling and handover
