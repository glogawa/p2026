import { Scene, MeshBuilder, Color3, StandardMaterial, Vector3 } from '@babylonjs/core';
import { AdvancedDynamicTexture, Rectangle, TextBlock, Line, Ellipse } from '@babylonjs/gui';

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

export type NPCState = 'thinking' | 'socializing' | 'wandering' | 'staggered' | 'panic';

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
}

export function createNPC(scene: Scene, position: Vector3): any {
  // Create reverse pyramid using a cylinder that's tapered
  const npc = MeshBuilder.CreateCylinder('npc', { diameterTop: 0, diameterBottom: 0.8, height: 1, tessellation: 8 }, scene);
  npc.position = position;

  const material = new StandardMaterial('npcMaterial', scene);
  material.diffuseColor = new Color3(1, 0.647, 0); // Orange
  material.specularColor = new Color3(0.2, 0.2, 0.2);
  npc.material = material;
  (npc as any).npcMaterial = material; // Store for later disposal

  return npc;
}

export function attachNPCGUI(npc: NPCInstance, scene: Scene, textureRef: AdvancedDynamicTexture): void {
  // Create a rectangle to display the state
  const stateRect = new Rectangle();
  const borderColor = "#ffffff55";
  stateRect.width = 0.15;
  stateRect.height = '40px';
  stateRect.cornerRadius = 10;
  stateRect.color = borderColor;
  stateRect.thickness = 1;
  stateRect.background = 'rgba(0, 0, 0, 0.7)';
  textureRef.addControl(stateRect);
  stateRect.linkWithMesh(npc.mesh);
  stateRect.linkOffsetY = -100;

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
  line.y2 = 20;
  line.linkOffsetY = 0;
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

export function changeNPCState(npc: NPCInstance, newState: NPCState, now: number, gridSize: number = 20): void {
  npc.state = newState;
  npc.stateStartTime = now;
  npc.lastStateChangeTime = now;
  npc.targetPosition = undefined;
  npc.targetNPC = undefined;

  // Update GUI label to reflect the new state
  updateNPCGUILabel(npc, newState);

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
