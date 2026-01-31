interface PlayerStats {
  stamina: number;
  agility: number;
}

interface NPCStats {
  stamina: number;
  staminaVariance: number;
  agility: { min: number; max: number };
}

interface Level {
  id: number;
  gridSize: number;
  positions: { [key: string]: 'start' | 'end' | 'objective' | 'fence' | 'npc' | null };
}

interface LevelDataWithStats {
  general: {
    fenceStaggerDurationMs: number;
    fenceBounceDistance: number;
    playerStats: PlayerStats;
    npcStats: NPCStats;
  };
  locations: Level[];
}

function getRandomPosition(gridSize: number, excludePositions: Set<string>): string {
  let x, y, pos;
  do {
    x = Math.floor(Math.random() * gridSize);
    y = Math.floor(Math.random() * gridSize);
    pos = `${x},${y}`;
  } while (excludePositions.has(pos));
  return pos;
}

function generateRandomPlayerStats(): PlayerStats {
  // Randomize player stamina between 8 and 12
  const stamina = Math.floor(Math.random() * 5) + 8; // 8-12
  
  // Randomize player agility between 3 and 7
  const agility = Math.floor(Math.random() * 5) + 3; // 3-7
  
  return { stamina, agility };
}

function generateRandomNPCStats(): NPCStats {
  // Randomize NPC base stamina between 2 and 4 (centered on 3)
  const stamina = Math.floor(Math.random() * 3) + 2; // 2-4
  
  // Randomize stamina variance between 0 and 2 (±0 to ±2)
  const staminaVariance = Math.floor(Math.random() * 3); // 0-2
  
  // Randomize agility range within 0-10 as per original request
  const agilityMin = Math.floor(Math.random() * 4); // 0-3
  const agilityMax = Math.floor(Math.random() * 4) + 7; // 7-10
  
  return {
    stamina,
    staminaVariance,
    agility: { min: agilityMin, max: Math.max(agilityMin + 2, agilityMax) }, // Ensure max > min by at least 2
  };
}

export function generateRandomLevel(id: number = 1): Level {
  const gridSize = Math.floor(Math.random() * (20 - 6 + 1)) + 6; // Random between 6 and 20
  const positions: { [key: string]: 'start' | 'end' | 'objective' | 'fence' | 'npc' | null } = {};
  const usedPositions = new Set<string>();

  // Generate start position
  const startPos = getRandomPosition(gridSize, usedPositions);
  positions[startPos] = 'start';
  usedPositions.add(startPos);

  // Generate end position
  const endPos = getRandomPosition(gridSize, usedPositions);
  positions[endPos] = 'end';
  usedPositions.add(endPos);

  // Generate random number of objectives (1 to 3)
  const objectiveCount = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < objectiveCount; i++) {
    const objPos = getRandomPosition(gridSize, usedPositions);
    positions[objPos] = 'objective';
    usedPositions.add(objPos);
  }

  // Generate random number of fences (0 to 5)
  const fenceCount = Math.floor(Math.random() * 6);
  const fencePositions: string[] = [];
  for (let i = 0; i < fenceCount; i++) {
    let fencePos: string;
    if (i === 0 || Math.random() < 0.5) {
      // Place randomly
      fencePos = getRandomPosition(gridSize, usedPositions);
    } else {
      // Try to place adjacent to an existing fence
      const randomFence = fencePositions[Math.floor(Math.random() * fencePositions.length)];
      const [x, y] = randomFence.split(',').map(Number);
      const adjCandidates: string[] = [
        x > 0 ? `${x-1},${y}` : null,
        x < gridSize - 1 ? `${x+1},${y}` : null,
        y > 0 ? `${x},${y-1}` : null,
        y < gridSize - 1 ? `${x},${y+1}` : null,
      ].filter((pos): pos is string => pos !== null && !usedPositions.has(pos));
      if (adjCandidates.length > 0) {
        fencePos = adjCandidates[Math.floor(Math.random() * adjCandidates.length)];
      } else {
        // Fallback to random
        fencePos = getRandomPosition(gridSize, usedPositions);
      }
    }
    positions[fencePos] = 'fence';
    usedPositions.add(fencePos);
    fencePositions.push(fencePos);
  }

  // Generate random number of NPCs (0 to 5)
  const npcCount = Math.floor(Math.random() * 6);
  for (let i = 0; i < npcCount; i++) {
    const npcPos = getRandomPosition(gridSize, usedPositions);
    positions[npcPos] = 'npc';
    usedPositions.add(npcPos);
  }

  return {
    id,
    gridSize,
    positions,
  };
}

export function generateRandomLevels(count: number = 3): LevelDataWithStats {
  const levels = Array.from({ length: count }, (_, i) => generateRandomLevel(i + 1));
  
  return {
    general: {
      fenceStaggerDurationMs: 500,
      fenceBounceDistance: 0.2,
      playerStats: generateRandomPlayerStats(),
      npcStats: generateRandomNPCStats(),
    },
    locations: levels,
  };
}
