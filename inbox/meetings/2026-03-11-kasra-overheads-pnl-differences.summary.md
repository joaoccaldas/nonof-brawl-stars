# Meeting Summary — Kasra on overheads and P&L differences

- **Date:** 2026-03-11
- **Type:** Troubleshooting / reconciliation discussion
- **Participants (identified or likely):** João, Kasra
- **Source file:** `/Users/joao/.openclaw/media/inbound/11_kasra_ovh_and_pnl_differences_original---0354431a-b521-4057-be9e-3f391f82c0ce.txt`
- **Confidence:** High on issue pattern, medium on exact numeric detail because of transcript noise

## Core topics
- Mismatch between BW/P&L views and Kasra’s overhead report
- Need for one consistent interpretation of market result / overhead data
- Power BI / BW instability and refresh/mapping issues
- Need for a simpler shared way to reconcile numbers

## Main takeaways
### 1) João is frustrated by seeing different numbers for what should be the same underlying result
- He compares BW/P&L values with Kasra’s overhead/reporting file and sees inconsistent results.
- His core concern is not only the specific number, but the fact that two people working from “the same” source are not seeing the same answer.
- This is a good example of João’s intolerance for finance ambiguity when reporting should be reproducible.

### 2) Kasra explains that BW/report structures and recent changes are part of the problem
- Kasra says underlying BW/report setup changed again, which affects how he has to fix/rebuild parts of the logic.
- Some report tabs are estimated/allocated views and therefore will not exactly match strict European P&L views.
- This creates a gray zone between “useful management view” and “true financial view.”

### 3) The real need is a shared, simple reconciliation logic
- João says they need an easy way to consistently reach the same number.
- This is less about one specific dashboard and more about creating a transparent bridge between:
  - European P&L / official BW view
  - overhead monitoring view
  - local management/reporting views

### 4) Power BI is useful, but only if its mapping/logic stays understandable
- Kasra mentions adding tabs and logic in Power BI, but also that certain selections/mappings can break or become hard to maintain.
- João likes the speed and visibility but wants a method that is robust enough to be trusted repeatedly.

### 5) This is another example of a recurring Miele pain point: too much fragile interpretation work
- Even a relatively basic management question (“why is your number different from mine?”) turns into a manual reconciliation exercise.
- That reinforces a wider theme across transcripts:
  - too many reports
  - too many slightly different logics
  - too much dependence on people remembering hidden assumptions

## Decisions / agreements
- Kasra will look again at the mapping/report logic after his other urgent tasks.
- João will also recheck after restarting/reopening his own environment.
- The team needs a more reliable shared approach for comparing overhead/P&L views.

## Action items
- **Kasra:** revisit the mapping/report logic and clarify where the difference comes from.
- **João:** recheck his own extracts/views and compare again.
- **Team:** move toward a more transparent bridge between official P&L and local management reporting.

## Risks / process pain points
- Same source data can still produce different management conclusions because logic is layered and fragile.
- Power BI/BW changes can silently break confidence in the output.
- Reporting trust erodes when finance cannot immediately explain why two views differ.

## Why it matters for João / Miele knowledge
This transcript matters because it shows a small but very representative finance pain point:
- reporting is not only about having data
- it is about having a **shared, stable interpretation path**

It also reinforces João’s broader operating principle: if two smart people cannot reproduce the same number easily, the process still needs redesign.
