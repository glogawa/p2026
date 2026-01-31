# Game Rules Implementation Summary

## Objective System Added

### Features:
1. **Objective Collection**
   - Player must collect all objective tiles (blue colored) by walking over them
   - When an objective is collected, its tile changes color from blue to gray
   - Visual feedback that the objective has been taken

2. **Level Exit Gate Locked Until Objectives Collected**
   - Player can only exit through the exit tile (red) when ALL objectives have been collected
   - If player reaches the exit before collecting all objectives, nothing happens
   - Once all objectives are taken, the player can proceed to the next level

### Color Coding:
- **Green Tile**: Start position
- **Blue Tile**: Objective (to be collected)
- **Gray Tile**: Collected objective
- **Red Tile**: Exit (level end, only accessible after collecting all objectives)

### Implementation Details:
- `useGameState` hook now tracks `collectedObjectives` as a Set<string>
- `useGameEngine` hook handles:
  - Objective detection when player is within 0.5 units
  - Tile color updates when objectives are collected
  - Exit gate validation (checks if all objectives collected before allowing level completion)
- `createGround` function now returns objective tiles for dynamic updates
- Objectives are reset when moving to the next level via `resetCollectedObjectives()`

### Game Flow:
1. Player spawns on start tile (green)
2. Player collects all objective tiles (blue → gray)
3. Once all objectives collected, player can reach exit tile (red)
4. Level completes, move to next level
5. Objectives reset for the new level

## Modified Files:
- `src/hooks/useGameState.ts` - Added objective tracking
- `src/hooks/useGameEngine.ts` - Added objective collision and exit gate logic
- `src/pages/assets/ground.ts` - Added dynamic tile coloring
- `src/pages/Game/Game.tsx` - Integrated new features
