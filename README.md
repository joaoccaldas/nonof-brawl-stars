# Noah Brawl Stars

Status: active

## Goal
Build a polished, fun, Brawl Stars-inspired browser game for Noah with strong feel, progression, characters, skins, maps, and repeatable improvement loops.

## Current state
- Playable browser game exists
- Canonical source now lives in projects/noah-brawl-stars/src/index.html
- Served via Tailscale from public/noah-brawl-stars-v2.html
- Project export flow copies source and assets into build/ and public/
- 3 brawlers implemented
- Background scene integrated
- Progression, quests, gadgets, star powers, skins, and map logic partially implemented
- Gameplay still needs balancing, auditing, and feature hardening

## Canonical locations
- Active source: projects/noah-brawl-stars/src/index.html
- Project home: projects/noah-brawl-stars/
- Assets: projects/noah-brawl-stars/assets/
- Project build: projects/noah-brawl-stars/build/noah-brawl-stars-v2.html
- Served build: projects/noah-brawl-stars/dist/index.html
- Export script: projects/noah-brawl-stars/scripts/export.sh
- Validation helpers:
  - projects/noah-brawl-stars/scripts/validate-script.js
  - projects/noah-brawl-stars/scripts/smoke-test.js

## Working model
This project should be advanced through repeated cycles:
1. Audit current state
2. Pick highest-impact next tasks from QUEUE.md
3. Implement a focused batch
4. Test and rebalance
5. Update QUEUE.md and CHANGELOG.md
6. Run projects/noah-brawl-stars/scripts/validate-script.js against the source if major JS changed
7. Run projects/noah-brawl-stars/scripts/smoke-test.js against the source for basic gameplay coverage after combat changes
8. Run projects/noah-brawl-stars/scripts/export.sh
9. Re-validate build/public output and refresh served game

## Priorities
1. Combat feel and bug fixing
2. Character identity and abilities
3. Progression and unlock loop
4. UI polish and clarity
5. Maps, props, and spectacle
6. Better AI and game balance

## Definition of progress
A change counts as progress only if it improves one of:
- fun
- clarity
- fairness
- retention
- polish
- content depth

## Morning deliverable expectation
Each autonomous cycle should leave:
- updated game
- updated QUEUE.md
- updated CHANGELOG.md
- clear next tasks
