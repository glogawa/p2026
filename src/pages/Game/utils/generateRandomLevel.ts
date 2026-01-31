interface Level {
  id: number;
  gridSize: number;
  positions: { [key: string]: 'start' | 'end' | 'objective' | 'fence' | 'npc' | null };
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

export function generateRandomLevels(count: number = 3): Level[] {
  return Array.from({ length: count }, (_, i) => generateRandomLevel(i + 1));
}
