import { Scene, MeshBuilder, Color3, StandardMaterial, Vector3 } from '@babylonjs/core';

export interface NPCConfig {
  thinkingDurationMs: number; // How long NPCs stand still
  socializingDurationMs: number; // How long NPCs socialize
  wanderingSpeedPerMs: number; // Speed when wandering
  socializingSpeedPerMs: number; // Speed when moving to socialize
  staggerDurationMs: number; // How long after player collision
  staggerBounceDistance: number; // How far to push back
  panicSpeedPerMs: number; // Speed when panicked
}

export const defaultNPCConfig: NPCConfig = {
  thinkingDurationMs: 3000, // 3 seconds thinking
  socializingDurationMs: 2000, // 2 seconds socializing
  wanderingSpeedPerMs: 0.02, // 0.02 units per ms
  socializingSpeedPerMs: 0.015, // 0.015 units per ms
  staggerDurationMs: 500, // 500ms stagger
  staggerBounceDistance: 0.3, // 0.3 units bounce
  panicSpeedPerMs: 0.04, // 0.04 units per ms (faster)
};

export type NPCState = 'thinking' | 'socializing' | 'wandering' | 'staggered' | 'panic';

export interface NPCInstance {
  mesh: any;
  position: Vector3;
  state: NPCState;
  stateStartTime: number;
  targetPosition?: Vector3;
  targetNPC?: NPCInstance;
  panicStartTime?: number;
  lastStateChangeTime?: number;
}

export function createNPC(scene: Scene, position: Vector3): any {
  // Create reverse pyramid using a cylinder that's tapered
  const npc = MeshBuilder.CreateCylinder('npc', { diameterTop: 0, diameterBottom: 0.8, height: 1, tessellation: 8 }, scene);
  npc.position = position;

  const material = new StandardMaterial('npcMaterial', scene);
  material.diffuseColor = new Color3(1, 0.647, 0); // Orange
  material.specularColor = new Color3(0.2, 0.2, 0.2);
  npc.material = material;

  return npc;
}

export function getRandomPositionInGrid(gridSize: number, minDistance: number = 0): Vector3 {
  const halfGrid = gridSize / 2;
  const x = (Math.random() - 0.5) * (gridSize - minDistance * 2);
  const z = (Math.random() - 0.5) * (gridSize - minDistance * 2);
  return new Vector3(x, 0.5, z);
}

export function getRandomAdjacentPosition(npc: NPCInstance, gridSize: number): Vector3 {
  // Get an adjacent tile position (one of 8 neighbors or 4 cardinal directions)
  const directions = [
    { x: 1, z: 0 },   // right
    { x: -1, z: 0 },  // left
    { x: 0, z: 1 },   // forward
    { x: 0, z: -1 },  // back
    { x: 1, z: 1 },   // diagonal
    { x: 1, z: -1 },  // diagonal
    { x: -1, z: 1 },  // diagonal
    { x: -1, z: -1 }, // diagonal
  ];
  
  const randomDir = directions[Math.floor(Math.random() * directions.length)];
  const newX = npc.position.x + randomDir.x * 1.2; // 1.2 units is roughly one grid cell
  const newZ = npc.position.z + randomDir.z * 1.2;
  
  // Clamp to grid boundaries
  const halfGrid = gridSize / 2;
  const minBound = -halfGrid + 0.5;
  const maxBound = halfGrid - 0.5;
  
  return new Vector3(
    Math.max(minBound, Math.min(maxBound, newX)),
    0.5,
    Math.max(minBound, Math.min(maxBound, newZ))
  );
}

export function findNearestNPC(npc: NPCInstance, npcs: NPCInstance[], minDistance: number = 2): NPCInstance | null {
  let nearest: NPCInstance | null = null;
  let minDist = minDistance;

  for (const other of npcs) {
    if (other === npc) continue;
    const dist = Vector3.Distance(npc.position, other.position);
    if (dist < minDist) {
      minDist = dist;
      nearest = other;
    }
  }

  return nearest;
}

export function changeNPCState(npc: NPCInstance, newState: NPCState, now: number, gridSize: number = 20): void {
  npc.state = newState;
  npc.stateStartTime = now;
  npc.lastStateChangeTime = now;
  npc.targetPosition = undefined;
  npc.targetNPC = undefined;

  if (newState === 'panic') {
    npc.panicStartTime = now;
    // Set initial adjacent panic destination
    npc.targetPosition = getRandomAdjacentPosition(npc, gridSize);
  }
}

export function getNextNPCState(npc: NPCInstance, allNPCs: NPCInstance[], now: number): NPCState | null {
  const timeSinceStateChange = now - npc.stateStartTime;
  
  switch (npc.state) {
    case 'thinking': {
      // Random chance to transition out of thinking
      if (timeSinceStateChange > defaultNPCConfig.thinkingDurationMs) {
        // 60% chance to wander, 40% chance to socialize
        return Math.random() > 0.4 ? 'wandering' : 'socializing';
      }
      break;
    }

    case 'socializing': {
      if (timeSinceStateChange > defaultNPCConfig.socializingDurationMs) {
        return 'thinking';
      }
      break;
    }

    case 'wandering': {
      if (timeSinceStateChange > defaultNPCConfig.thinkingDurationMs * 0.8) {
        // After wandering for a bit, go back to thinking
        return 'thinking';
      }
      break;
    }

    case 'staggered': {
      if (timeSinceStateChange > defaultNPCConfig.staggerDurationMs) {
        return 'panic';
      }
      break;
    }

    case 'panic': {
      if (timeSinceStateChange > defaultNPCConfig.staggerDurationMs * 3) {
        // Exit panic and return to normal
        return 'thinking';
      }
      break;
    }
  }

  return null;
}
