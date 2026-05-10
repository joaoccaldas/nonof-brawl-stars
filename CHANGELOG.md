## 2026-04-26 - Combat Mechanics & Physics Update

### Features
- **Combat Effects System**:
  - Introduced `src/modules/effects.js` to handle status modifiers.
  - Implemented **Pushback**: Entities are now knocked back when hit by bullets.
  - Implemented **Stuns**: Entities (Player and AI) are completely immobilized during a stun.
- **Super Ability Enhancements**:
  - **Solar Blast (Sun Bear)**: Now applies massive radial pushback and a 1-second stun to all hit enemies.
- **Physics Integration**:
  - Added `updateEntitiesPhysics` to the main game loop to handle velocity, friction, and effect timers.
  - AI states (Patrol, Chase, etc.) now respect stun status and pause movement when immobilized.
- **Gameplay Polish**:
  - Added visual particles to pushback and stun events.
  - Improved overall "oomph" of combat encounters.


### Features
- **Account Progression System**: 
  - Added global `accountLevel` and `accountXP` to the player profile.
  - Implemented XP gain logic upon match completion.
  - Created a scaling XP-to-level formula.
- **Brawl Pass Reward Track**:
  - Defined a 50-tier reward structure (Free and Premium tracks).
  - Rewards include Coins, Gems, and unlocked Brawler Skins.
  - Added logic to claim rewards upon reaching new levels.
- **Daily Quest System**:
  - Implemented 3 rotating daily quests (e.g., "Damage Dealer", "Slayer", "Gem Collector").
  - Added quest tracking in the game state (damage dealt, kills, gems collected).
  - Quest completion grants significant XP and Coin bonuses.
- **Progression UI**:
  - Created a new "Pass" screen with a scrollable reward track.
  - Added an XP progress bar and level indicator to the landing screen.
  - Added a "Quests" tab to view active objectives and their progress.

### Bug Fixes
- Fixed an issue where XP was not persisting after a match.
- Resolved a UI glitch where the reward track would overflow on smaller screens.

### Next
- Robust AI System (State-based behavior and team coordination).
- Brawler Gallery / Profile view.
- Advanced combat mechanics (Knockback, Stuns).
