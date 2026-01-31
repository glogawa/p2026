import { Scene, MeshBuilder, Color3, StandardMaterial, Vector3, TransformNode } from '@babylonjs/core';
import { AdvancedDynamicTexture, Rectangle, TextBlock, Line, Ellipse } from '@babylonjs/gui';
import { createRandomNPCModel } from './npcModels';

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
  wanderingSpeedPerMs: 0.0005, // 0.5 units per second
  socializingSpeedPerMs: 0.0003, // 0.3 units per second
  staggerDurationMs: 500, // 500ms stagger
  staggerBounceDistance: 0.3, // 0.3 units bounce
  panicSpeedPerMs: 0.001, // 1.0 units per second (panic is only slightly faster)
};

export type NPCState = 'thinking' | 'socializing' | 'wandering' | 'staggered' | 'panic' | 'escaping' | 'fleeing';

export interface NPCInstance {
  mesh: any;
  material?: StandardMaterial;
  position: Vector3;
  state: NPCState;
  stateStartTime: number;
  targetPosition?: Vector3;
  targetNPC?: NPCInstance;
  panicStartTime?: number;
  lastStateChangeTime?: number;
  guiLabel?: TextBlock;
  guiRect?: Rectangle;
  guiTarget?: Ellipse;
  guiLine?: Line;
  stamina?: number;
  agility?: number;
  isThief?: boolean;
  stolenObjective?: string; // Position of the stolen objective (e.g., "5,3")
  fleeingEndTime?: number; // When to transition from fleeing back to escaping (2s duration)
  escapingTemporaryState?: NPCState; // Temporary state while escaping (thinking/wandering/socializing)
  escapingTemporaryStateEndTime?: number; // When to return to escaping
}

export function createNPC(scene: Scene, position: Vector3, scale: number = 1): TransformNode {
  // Create a random NPC model with the specified scale
  const npcRig = createRandomNPCModel(scene, scale);
  
  // Set the position
  npcRig.position = position;
  
  return npcRig;
}

export function attachNPCGUI(npc: NPCInstance, scene: Scene, textureRef: AdvancedDynamicTexture): void {
  // Create a rectangle to display the state
  const stateRect = new Rectangle();
  // Use red border for thieves, white for regular NPCs
  const borderColor = npc.isThief ? "#ff0000aa" : "#ffffff55";
  stateRect.width = 0.15;
  stateRect.height = '30px';
  stateRect.cornerRadius = 10;
  stateRect.color = borderColor;
  stateRect.thickness = 2;
  stateRect.background = 'rgba(0, 0, 0, 0.7)';
  textureRef.addControl(stateRect);
  stateRect.linkWithMesh(npc.mesh);
  stateRect.linkOffsetY = -150;

  // Create text block to show the state
  const label = new TextBlock();
  label.text = npc.state.toUpperCase();
  label.fontSize = 14;
  label.fontFamily = 'Arial, sans-serif';
  label.color = 'white';
  label.fontWeight = 'bold';
  stateRect.addControl(label);

  // Create a line connecting to the state label
  const line = new Line();
  line.lineWidth = 2;
  line.color = borderColor;
  line.y2 = 15;
  line.linkOffsetY = -70;
  textureRef.addControl(line);
  line.linkWithMesh(npc.mesh);
  line.connectedControl = stateRect;

  // Store GUI elements in the NPC instance for later updates
  npc.guiLabel = label;
  npc.guiRect = stateRect;
  npc.guiLine = line;
}

export function updateNPCGUILabel(npc: NPCInstance, newState: NPCState): void {
  // Update the state label text
  if (npc.guiLabel) {
    npc.guiLabel.text = newState.toUpperCase();
    
    // Change color based on state
    switch (newState) {
      case 'thinking':
        npc.guiLabel.color = 'white';
        break;
      case 'socializing':
        npc.guiLabel.color = 'lightblue';
        break;
      case 'wandering':
        npc.guiLabel.color = 'lightgreen';
        break;
      case 'staggered':
        npc.guiLabel.color = 'red';
        break;
      case 'panic':
        npc.guiLabel.color = 'darkorange';
        break;
      case 'escaping':
        npc.guiLabel.color = 'purple';
        break;
      case 'fleeing':
        npc.guiLabel.color = 'red';
        break;
    }
  }
}

export function getRandomPositionInGrid(gridSize: number, minDistance: number = 0): Vector3 {
  const halfGrid = gridSize / 2;
  const x = (Math.random() - 0.5) * (gridSize - minDistance * 2);
  const z = (Math.random() - 0.5) * (gridSize - minDistance * 2);
  return new Vector3(x, 0.5, z);
}

export function getRandomAdjacentPosition(npc: NPCInstance, gridSize: number, positions?: { [key: string]: string | null }, playerPos?: Vector3): Vector3 {
  // Get an adjacent tile position, avoiding fences and player if provided
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
  
  for (let attempt = 0; attempt < 10; attempt++) {
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    const newX = npc.position.x + randomDir.x * 1.2;
    const newZ = npc.position.z + randomDir.z * 1.2;
    
    // Clamp to grid boundaries
    const halfGrid = gridSize / 2;
    const minBound = -halfGrid + 0.5;
    const maxBound = halfGrid - 0.5;
    const clampedX = Math.max(minBound, Math.min(maxBound, newX));
    const clampedZ = Math.max(minBound, Math.min(maxBound, newZ));
    
    // Convert to grid coordinates
    const gridX = Math.round(clampedX + gridSize / 2 - 0.5);
    const gridY = Math.round(clampedZ + gridSize / 2 - 0.5);
    const posKey = `${gridX},${gridY}`;
    
    // Check if position has a fence (if positions provided)
    if (positions && positions[posKey] === 'fence') continue;
    
    // Check if too close to player (if playerPos provided)
    if (playerPos) {
      const distToPlayer = Math.sqrt((clampedX - playerPos.x) ** 2 + (clampedZ - playerPos.z) ** 2);
      if (distToPlayer < 1.0) continue;
    }
    
    return new Vector3(clampedX, 0.5, clampedZ);
  }
  
  // Fallback: return a random adjacent without checks
  const randomDir = directions[Math.floor(Math.random() * directions.length)];
  const newX = npc.position.x + randomDir.x * 1.2;
  const newZ = npc.position.z + randomDir.z * 1.2;
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

export function changeNPCState(npc: NPCInstance, newState: NPCState, now: number, gridSize: number = 20, playerPos?: Vector3): void {
  npc.state = newState;
  npc.stateStartTime = now;
  npc.lastStateChangeTime = now;
  npc.targetPosition = undefined;
  npc.targetNPC = undefined;

  // Clear temporary escape state if transitioning back to escaping
  if (newState === 'escaping') {
    npc.escapingTemporaryState = undefined;
    npc.escapingTemporaryStateEndTime = undefined;
  }

  // Set fleeing end time if entering fleeing state (2 second duration)
  if (newState === 'fleeing') {
    npc.fleeingEndTime = now + 2000; // 2 seconds fleeing
  }

  // Update GUI label to reflect the new state
  updateNPCGUILabel(npc, newState);

  if (newState === 'panic') {
    npc.panicStartTime = now;
    // Set initial panic destination away from player
    if (playerPos) {
      const dirX = npc.position.x - playerPos.x;
      const dirZ = npc.position.z - playerPos.z;
      const length = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
      const awayX = npc.position.x + (dirX / length) * 1.2;
      const awayZ = npc.position.z + (dirZ / length) * 1.2;
      // Clamp to grid boundaries
      const halfGrid = gridSize / 2;
      const minBound = -halfGrid + 0.5;
      const maxBound = halfGrid - 0.5;
      const clampedX = Math.max(minBound, Math.min(maxBound, awayX));
      const clampedZ = Math.max(minBound, Math.min(maxBound, awayZ));
      npc.targetPosition = new Vector3(clampedX, 0.5, clampedZ);
    } else {
      // Fallback to random adjacent
      npc.targetPosition = getRandomAdjacentPosition(npc, gridSize);
    }
  }
}

export function getNextNPCState(npc: NPCInstance, allNPCs: NPCInstance[], now: number): NPCState | null {
  const timeSinceStateChange = now - npc.stateStartTime;
  const staminaMultiplier = npc.stamina ? npc.stamina / 5 : 1; // Lower stamina means quicker changes
  
  const stayProbabilities: Record<NPCState, number> = {
    thinking: 0,
    socializing: 0.3,
    wandering: 0.6,
    staggered: 0.1,
    panic: 0.5,
    escaping: 0,
    fleeing: 0
  };
  
  switch (npc.state) {
    case 'thinking': {
      // Check if this is a temporary escape distraction that should end
      if (npc.escapingTemporaryState === 'thinking' && npc.escapingTemporaryStateEndTime && now >= npc.escapingTemporaryStateEndTime) {
        npc.escapingTemporaryState = undefined;
        npc.escapingTemporaryStateEndTime = undefined;
        return 'escaping';
      }
      // Random chance to transition out of thinking
      if (timeSinceStateChange > defaultNPCConfig.thinkingDurationMs / staminaMultiplier) {
        // 60% chance to wander, 40% chance to socialize
        return Math.random() > 0.4 ? 'wandering' : 'socializing';
      }
      break;
    }

    case 'socializing': {
      // Check if this is a temporary escape distraction that should end
      if (npc.escapingTemporaryState === 'socializing' && npc.escapingTemporaryStateEndTime && now >= npc.escapingTemporaryStateEndTime) {
        npc.escapingTemporaryState = undefined;
        npc.escapingTemporaryStateEndTime = undefined;
        return 'escaping';
      }
      if (timeSinceStateChange > defaultNPCConfig.socializingDurationMs / staminaMultiplier) {
        if (Math.random() < stayProbabilities.socializing) {
          return 'socializing';
        } else {
          return 'thinking';
        }
      }
      break;
    }

    case 'wandering': {
      // Check if this is a temporary escape distraction that should end
      if (npc.escapingTemporaryState === 'wandering' && npc.escapingTemporaryStateEndTime && now >= npc.escapingTemporaryStateEndTime) {
        npc.escapingTemporaryState = undefined;
        npc.escapingTemporaryStateEndTime = undefined;
        return 'escaping';
      }
      if (timeSinceStateChange > defaultNPCConfig.thinkingDurationMs * 0.8 / staminaMultiplier) {
        if (Math.random() < stayProbabilities.wandering) {
          return 'wandering';
        } else {
          // After wandering for a bit, go back to thinking
          return 'thinking';
        }
      }
      break;
    }

    case 'staggered': {
      // Thieves with stolen objectives recover faster (50% of normal time)
      const recoveryTime = npc.stolenObjective ? defaultNPCConfig.staggerDurationMs * 0.5 / staminaMultiplier : defaultNPCConfig.staggerDurationMs / staminaMultiplier;
      if (timeSinceStateChange > recoveryTime) {
        if (Math.random() < stayProbabilities.staggered) {
          return 'staggered';
        } else {
          // Only thieves with stolen objectives go to escaping
          if (npc.isThief && npc.stolenObjective) {
            return 'escaping';
          } else {
            return 'panic';
          }
        }
      }
      break;
    }

    case 'panic': {
      // Thieves with stolen objectives recover faster (50% of normal time)
      const recoveryTime = npc.stolenObjective ? defaultNPCConfig.staggerDurationMs * 1.5 / staminaMultiplier : defaultNPCConfig.staggerDurationMs * 3 / staminaMultiplier;
      if (timeSinceStateChange > recoveryTime) {
        if (Math.random() < stayProbabilities.panic) {
          return 'panic';
        } else {
          // Only thieves with stolen objectives go to escaping
          if (npc.isThief && npc.stolenObjective) {
            return 'escaping';
          } else {
            return 'thinking';
          }
        }
      }
      break;
    }

    case 'escaping': {
      // 20% chance to become distracted for 2 seconds
      // This creates gameplay opportunities for the player to catch them
      const distractionChance = 0.20; // 20% chance per frame
      if (Math.random() < distractionChance) {
        // Pick a random temporary state: thinking, wandering, or socializing
        const tempStates: NPCState[] = ['thinking', 'wandering', 'socializing'];
        const tempState = tempStates[Math.floor(Math.random() * tempStates.length)];
        // Set to return to escaping after 2 seconds
        npc.escapingTemporaryState = tempState;
        npc.escapingTemporaryStateEndTime = now + 2000; // 2 seconds
        return tempState;
      }
      break;
    }

    case 'fleeing': {
      // Fleeing lasts for 2 seconds, then transition based on whether objective is still stolen
      if (npc.fleeingEndTime && now >= npc.fleeingEndTime) {
        npc.fleeingEndTime = undefined; // Clear fleeing end time
        // Only transition to escaping if still has stolen objective, otherwise go to panic
        return npc.stolenObjective ? 'escaping' : 'panic';
      }
      break;
    }
  }

  return null;
}

export interface NPCStatsConfig {
  stamina: number;
  staminaVariance: number;
  agility: { min: number; max: number };
}

export function generateNPCStats(config: NPCStatsConfig): { stamina: number; agility: number } {
  // Generate stamina with variance
  const variance = Math.floor((Math.random() - 0.5) * 2 * config.staminaVariance);
  const stamina = Math.max(1, config.stamina + variance);

  // Generate agility randomly within min/max range
  const agility = Math.floor(Math.random() * (config.agility.max - config.agility.min + 1)) + config.agility.min;

  return { stamina, agility };
}
