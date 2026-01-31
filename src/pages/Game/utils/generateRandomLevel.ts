interface Level {
  id: number;
  gridSize: number;
  positions: { [key: string]: 'start' | 'end' | 'objective' | null };
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
  const positions: { [key: string]: 'start' | 'end' | 'objective' | null } = {};
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

  return {
    id,
    gridSize,
    positions,
  };
}

export function generateRandomLevels(count: number = 3): Level[] {
  return Array.from({ length: count }, (_, i) => generateRandomLevel(i + 1));
}
