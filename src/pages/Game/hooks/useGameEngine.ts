import { useEffect, useRef } from 'react';
import { Engine, Scene, Vector3, MeshBuilder, KeyboardEventTypes, Color3, StandardMaterial } from '@babylonjs/core';
import { AdvancedDynamicTexture } from '@babylonjs/gui';
import { createGround } from '../../assets/ground';
import { createCamera } from '../../assets/camera';
import { createLight } from '../../assets/light';
import { createFence, defaultFenceConfig, FenceConfig } from '../../assets/fence';
import { createNPC, defaultNPCConfig, NPCInstance, NPCState, changeNPCState, findNearestNPC, getRandomPositionInGrid, getNextNPCState, getRandomAdjacentPosition, attachNPCGUI, updateNPCGUILabel, generateNPCStats, NPCStatsConfig } from '../../assets/npc';
import { createPlayer } from '../../assets/player';

interface UseGameEngineOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentLevel: any;
  joystickMovement: { x: number; z: number };
  onLevelComplete: () => void;
  onGameLost: () => void;
  onObjectiveCollected: (objectivePos: string) => void;
  onObjectiveLost: (objectivePos: string) => void;
  onNPCCollision?: (isThief: boolean) => void;
  collectedObjectives: Set<string>;
  enabled: boolean;
  fenceConfig?: FenceConfig;
  showNPCGui?: boolean;
  npcStats?: NPCStatsConfig;
  playerStats?: { stamina: number; agility: number };
  alertPhase?: 'high' | 'low';
}

export function useGameEngine({
  canvasRef,
  currentLevel,
  joystickMovement,
  onLevelComplete,
  onGameLost,
  onObjectiveCollected,
  onObjectiveLost,
  onNPCCollision,
  collectedObjectives,
  enabled,
  fenceConfig = defaultFenceConfig,
  showNPCGui = true,
  npcStats,
  playerStats,
  alertPhase = 'low',
}: UseGameEngineOptions) {
  const objectiveTilesRef = useRef<{ [key: string]: { tile: any; material: any } }>({});
  const collectedRef = useRef(collectedObjectives);
  const onObjectiveCollectedRef = useRef(onObjectiveCollected);
  const onNPCCollisionRef = useRef(onNPCCollision);
  const onObjectiveLostRef = useRef(onObjectiveLost);
  const onLevelCompleteRef = useRef(onLevelComplete);
  const onGameLostRef = useRef(onGameLost);
  const staggerStateRef = useRef({ isStaggered: false, staggerEndTime: 0 });
  const fenceMeshesRef = useRef<{ [key: string]: any }>({});
  const npcsRef = useRef<NPCInstance[]>([]);
  const playerStaggerTimeRef = useRef(0);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const guiTextureRef = useRef<AdvancedDynamicTexture | null>(null);
  const groundPlaneRef = useRef<any>(null);
  const groundMaterialRef = useRef<any>(null);
  const startMeshesRef = useRef<any[]>([]);
  const exitMeshesRef = useRef<any[]>([]);
  const playerBoxRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const joystickMovementRef = useRef(joystickMovement);

  // Sync refs when callbacks or props change
  useEffect(() => {
    collectedRef.current = new Set(collectedObjectives);
  }, [collectedObjectives]);

  useEffect(() => {
    onObjectiveCollectedRef.current = onObjectiveCollected;
    onObjectiveLostRef.current = onObjectiveLost;
    onLevelCompleteRef.current = onLevelComplete;
    onGameLostRef.current = onGameLost;
  }, [onObjectiveCollected, onObjectiveLost, onLevelComplete, onGameLost]);

  useEffect(() => {
    joystickMovementRef.current = joystickMovement;
  }, [joystickMovement]);

  // Handle NPC GUI visibility toggle
  useEffect(() => {
    if (guiTextureRef.current) {
      npcsRef.current.forEach((npc) => {
        if (npc.guiRect) {
          npc.guiRect.isVisible = showNPCGui;
        }
        if (npc.guiLine) {
          npc.guiLine.isVisible = showNPCGui;
        }
      });
    }
  }, [showNPCGui]);

  useEffect(() => {
    if (!enabled || !canvasRef.current || !currentLevel) return;

    let engine: Engine | null = null;
    let scene: Scene | null = null;
    let cleanupDone = false;

    const cleanup = () => {
      if (cleanupDone) return;
      cleanupDone = true;
      
      console.log('[CLEANUP] Starting cleanup of game engine and NPCs...');
      
      if (engine) {
        engine.stopRenderLoop();
        console.log('[CLEANUP] Render loop stopped');
      }

      if (cameraRef.current && cameraRef.current.dispose) {
        try {
          cameraRef.current.dispose();
        } catch (e) {
          console.error('Error disposing camera:', e);
        }
      }

      if (guiTextureRef.current) {
        try {
          guiTextureRef.current.dispose();
        } catch (e) {
          console.error('Error disposing GUI texture:', e);
        }
        guiTextureRef.current = null;
      }

      console.log(`[CLEANUP] Disposing ${npcsRef.current.length} NPCs...`);
      npcsRef.current.forEach((npc) => {
        try {
          if (npc.guiRect) npc.guiRect.dispose();
          if (npc.guiLine) npc.guiLine.dispose();
          if (npc.guiTarget) npc.guiTarget.dispose();
          if (npc.mesh && npc.mesh.npcMaterials && Array.isArray(npc.mesh.npcMaterials)) {
            npc.mesh.npcMaterials.forEach((material: any) => {
              try {
                if (material && material.dispose) material.dispose();
              } catch (e) {
                console.error('Error disposing NPC material:', e);
              }
            });
          }
        } catch (e) {
          console.error('Error disposing NPC:', e);
        }
      });

      Object.values(fenceMeshesRef.current).forEach((fenceMesh) => {
        try {
          if (fenceMesh && typeof fenceMesh !== 'boolean') {
            if (fenceMesh.fenceMaterial) fenceMesh.fenceMaterial.dispose();
            if (fenceMesh.dispose) fenceMesh.dispose();
          }
        } catch (e) {
          console.error('Error disposing fence:', e);
        }
      });

      Object.values(objectiveTilesRef.current).forEach((tileData) => {
        try {
          if (tileData.tile) {
            if (tileData.tile.objectiveMaterial) tileData.tile.objectiveMaterial.dispose();
            if (tileData.tile.blueMaterial) tileData.tile.blueMaterial.dispose();
            if (tileData.tile.allMeshes && Array.isArray(tileData.tile.allMeshes)) {
              tileData.tile.allMeshes.forEach((mesh: any) => {
                try {
                  if (mesh && mesh.dispose) mesh.dispose();
                } catch (e) {
                  console.error('Error disposing child mesh:', e);
                }
              });
            }
            if (tileData.tile.dispose) tileData.tile.dispose();
          }
          if (tileData.material) tileData.material.dispose();
        } catch (e) {
          console.error('Error disposing objective tile:', e);
        }
      });

      if (groundPlaneRef.current && groundPlaneRef.current.dispose) {
        try {
          groundPlaneRef.current.dispose();
        } catch (e) {
          console.error('Error disposing ground:', e);
        }
      }
      if (groundMaterialRef.current && groundMaterialRef.current.dispose) {
        try {
          groundMaterialRef.current.dispose();
        } catch (e) {
          console.error('Error disposing ground material:', e);
        }
      }

      startMeshesRef.current.forEach((mesh) => {
        try {
          if (mesh.startMaterial) mesh.startMaterial.dispose();
          if (mesh.frameMaterial) mesh.frameMaterial.dispose();
          if (mesh.handleMaterial) mesh.handleMaterial.dispose();
          if (mesh.dispose) mesh.dispose();
        } catch (e) {
          console.error('Error disposing start mesh:', e);
        }
      });
      exitMeshesRef.current.forEach((mesh) => {
        try {
          if (mesh.exitMaterial) mesh.exitMaterial.dispose();
          if (mesh.dispose) mesh.dispose();
        } catch (e) {
          console.error('Error disposing exit mesh:', e);
        }
      });

      if (playerBoxRef.current) {
        try {
          if (playerBoxRef.current.playerMaterials && Array.isArray(playerBoxRef.current.playerMaterials)) {
            playerBoxRef.current.playerMaterials.forEach((material: any) => {
              try {
                if (material && material.dispose) material.dispose();
              } catch (e) {
                console.error('Error disposing player material:', e);
              }
            });
          }
          if (playerBoxRef.current.dispose) playerBoxRef.current.dispose();
        } catch (e) {
          console.error('Error disposing player:', e);
        }
      }

      npcsRef.current = [];
      fenceMeshesRef.current = {};
      objectiveTilesRef.current = {};
      groundPlaneRef.current = null;
      groundMaterialRef.current = null;
      startMeshesRef.current = [];
      exitMeshesRef.current = [];
      playerBoxRef.current = null;

      if (scene) {
        try {
          scene.dispose();
        } catch (e) {
          console.error('Error disposing scene:', e);
        }
      }

      if (engine) {
        try {
          engine.dispose();
        } catch (e) {
          console.error('Error disposing engine:', e);
        }
      }

      console.log('[CLEANUP] Cleanup complete! Old level resources should be gone.');
    };

    const setupScene = async () => {
      engine = new Engine(canvasRef.current!, false);
      engine.enableOfflineSupport = false;
      engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
      
      scene = new Scene(engine!);
      const sceneRef = scene;
      const engineRef = engine;
      const camera = createCamera(scene, canvasRef.current!);
      cameraRef.current = camera;
      createLight(scene);
      const gridSize = currentLevel.gridSize;
      const { objectiveTiles, groundPlane, groundMaterial, startMeshes, exitMeshes } = await createGround(scene, gridSize, currentLevel.positions, collectedRef.current);
      objectiveTilesRef.current = objectiveTiles;
      groundPlaneRef.current = groundPlane;
      groundMaterialRef.current = groundMaterial;
      startMeshesRef.current = startMeshes;
      exitMeshesRef.current = exitMeshes;

      // Focus canvas
      canvasRef.current!.tabIndex = 0;
      canvasRef.current!.focus();

      // Create player
      let playerRig: any = null;
      const startEntry = Object.entries(currentLevel.positions).find(
        ([_, type]) => type === 'start'
      );
      if (startEntry) {
        const [pos] = startEntry as [string, string];
        const [x, y] = pos.split(',').map(Number);
        const worldX = x - gridSize / 2 + 0.5;
        const worldZ = y - gridSize / 2 + 0.5;
        playerRig = createPlayer(scene, new Vector3(worldX, 0, worldZ), 0.5, 0);
        playerBoxRef.current = playerRig;
        // Set camera to follow the player
        if (cameraRef.current) {
          cameraRef.current.lockedTarget = playerRig;
        }
      }

      // Find objectives - use actual tile positions
      const objectives: { [key: string]: Vector3 } = {};
      Object.keys(objectiveTiles).forEach(pos => {
        objectives[pos] = objectiveTiles[pos].tile.position.clone();
      });

      // Find end position
      let endPos: Vector3 | null = null;
      const endEntry = Object.entries(currentLevel.positions).find(
        ([_, type]) => type === 'end'
      );
      if (endEntry) {
        const [pos] = endEntry as [string, string];
        const [x, y] = pos.split(',').map(Number);
        const worldX = x - gridSize / 2 + 0.5;
        const worldZ = y - gridSize / 2 + 0.5;
        endPos = new Vector3(worldX, 0, worldZ);
      }

      // Create fences
      const fences: Vector3[] = [];
      Object.entries(currentLevel.positions).forEach(([pos, type]) => {
        if (type === 'fence') {
          const [x, y] = pos.split(',').map(Number);
          const worldX = x - gridSize / 2 + 0.5;
          const worldZ = y - gridSize / 2 + 0.5;
          const fenceMesh = createFence(scene!, new Vector3(worldX, 0, worldZ), fenceConfig);
          fenceMeshesRef.current[pos] = fenceMesh;
          fences.push(new Vector3(worldX, 0, worldZ));
        }
      });

      // Create NPCs
      const now = performance.now();
      // Create GUI texture for NPC labels
      const guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("NPCLabelsUI");
      guiTextureRef.current = guiTexture;
      
      Object.entries(currentLevel.positions).forEach(([pos, type]) => {
        if (type === 'npc') {
          const [x, y] = pos.split(',').map(Number);
          const worldX = x - gridSize / 2 + 0.5;
          const worldZ = y - gridSize / 2 + 0.5;
          const npcMesh = createNPC(scene!, new Vector3(worldX, 0, worldZ), 0.5);
          
          let npcStats_data = { stamina: 3, agility: 5 };
          if (npcStats) {
            npcStats_data = generateNPCStats(npcStats);
          }
          
          const npcInstance: NPCInstance = {
            mesh: npcMesh,
            position: new Vector3(worldX, 0, worldZ),
            state: 'thinking',
            stateStartTime: 0, // Set to 0 so it immediately starts changing state
            stamina: npcStats_data.stamina,
            agility: npcStats_data.agility,
            isThief: false, // Will be assigned below
          };
          npcsRef.current.push(npcInstance);
        }
      });

      // Assign thieves randomly (max 1/3 of total NPCs, rounded down)
      const totalNPCs = npcsRef.current.length;
      const maxThieves = Math.floor(totalNPCs / 3);
      const numThieves = maxThieves > 0 ? Math.floor(Math.random() * maxThieves) + (maxThieves > 0 ? 1 : 0) : 0;
      
      if (numThieves > 0) {
        const thiefIndices = new Set<number>();
        while (thiefIndices.size < numThieves) {
          thiefIndices.add(Math.floor(Math.random() * totalNPCs));
        }
        thiefIndices.forEach((index) => {
          npcsRef.current[index].isThief = true;
        });
      }

      // Attach GUI labels to all NPCs
      npcsRef.current.forEach((npcInstance) => {
        attachNPCGUI(npcInstance, scene!, guiTexture);
        if (npcInstance.guiRect) {
          npcInstance.guiRect.isVisible = showNPCGui;
        }
        if (npcInstance.guiLine) {
          npcInstance.guiLine.isVisible = showNPCGui;
        }
      });

      // Keyboard input
      const inputMap: { [key: string]: boolean } = {};
      scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
          case KeyboardEventTypes.KEYDOWN:
            inputMap[kbInfo.event.key.toLowerCase()] = true;
            break;
          case KeyboardEventTypes.KEYUP:
            inputMap[kbInfo.event.key.toLowerCase()] = false;
            break;
        }
      });

      // Render loop
      engine.runRenderLoop(() => {
        engine!.resize();
        if (playerRig) {
          const currentTime = performance.now();
          const deltaTime = Math.min(currentTime - lastFrameTimeRef.current, 50); // Cap at 50ms to prevent large jumps
          lastFrameTimeRef.current = currentTime;

          const isStaggered = staggerStateRef.current.isStaggered && currentTime < staggerStateRef.current.staggerEndTime;

          // Clear stagger state if time has expired
          if (staggerStateRef.current.isStaggered && currentTime >= staggerStateRef.current.staggerEndTime) {
            staggerStateRef.current.isStaggered = false;
          }

          // Only allow movement if not staggered
          if (!isStaggered) {
            const speedMultiplier = playerStats ? playerStats.agility / 20 : 1;
            // Keyboard movement
            if (inputMap['w']) {
              playerRig.position.x -= Math.sin(playerRig.rotation.y) * 0.2 * speedMultiplier;
              playerRig.position.z -= Math.cos(playerRig.rotation.y) * 0.2 * speedMultiplier;
            }
            if (inputMap['s']) {
              playerRig.position.x += Math.sin(playerRig.rotation.y) * 0.1 * speedMultiplier;
              playerRig.position.z += Math.cos(playerRig.rotation.y) * 0.1 * speedMultiplier;
            }
            if (inputMap['a']) playerRig.rotation.y -= 0.025;
            if (inputMap['d']) playerRig.rotation.y += 0.025;
            // Joystick movement
            playerRig.position.x += joystickMovementRef.current.x * speedMultiplier;
            playerRig.position.z += joystickMovementRef.current.z * speedMultiplier;
          }

        // Check fence collisions (fence is 1x1 box, so collision radius is ~0.7 from center to corner)
        // Only check if not already staggered to prevent repeated collisions
        if (!isStaggered) {
          fences.forEach((fencePos) => {
            const distance = Vector3.Distance(playerRig.position, fencePos);
            const collisionRadius = 0.65; // Slightly larger than fence radius (0.5) to catch near-misses
            if (distance < collisionRadius) {
              // Collision detected - apply stagger
              staggerStateRef.current.isStaggered = true;
              staggerStateRef.current.staggerEndTime = currentTime + fenceConfig.staggerDuration;
              // Push player back from fence
              const dirX = playerRig.position.x - fencePos.x;
              const dirZ = playerRig.position.z - fencePos.z;
              const length = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
              playerRig.position.x += (dirX / length) * fenceConfig.bounceDistance;
              playerRig.position.z += (dirZ / length) * fenceConfig.bounceDistance;
            }
          });
        }

        // Clamp player position to grid boundaries (with slight margin for visual smoothness)
        const halfGrid = gridSize / 2;
        const minBound = -halfGrid + 0.5;
        const maxBound = halfGrid - 0.5;
        playerRig.position.x = Math.max(minBound, Math.min(maxBound, playerRig.position.x));
        playerRig.position.z = Math.max(minBound, Math.min(maxBound, playerRig.position.z));

        // Check if reached objective
        Object.entries(objectives).forEach(([objectivePos, objectiveVector]) => {
          if (!collectedRef.current.has(objectivePos) && Vector3.Distance(playerRig.position, objectiveVector) < 0.5) {
            collectedRef.current.add(objectivePos);
            onObjectiveCollectedRef.current(objectivePos);
            // Dispose and remove the objective tile
            if (objectiveTilesRef.current[objectivePos]) {
              const tileData = objectiveTilesRef.current[objectivePos];
              if (tileData.tile && tileData.tile.objectiveMaterial) {
                tileData.tile.objectiveMaterial.dispose();
              }
              if (tileData.tile && tileData.tile.blueMaterial) {
                tileData.tile.blueMaterial.dispose();
              }
              tileData.tile.dispose();
              delete objectiveTilesRef.current[objectivePos];
            }
          }
        });

        // Check if reached end (only if all objectives are collected and no thieves escaped)
        if (endPos && collectedRef.current.size === Object.keys(objectives).length) {
          if (Vector3.Distance(playerRig.position, endPos) < 0.5) {
            onLevelCompleteRef.current();
          }
        }

        // Check if any thief with stolen objective reached the exit
        npcsRef.current.forEach((npc) => {
          if (npc.stolenObjective && endPos && Vector3.Distance(npc.position, endPos) < 0.5) {
            // Thief escaped! Game over - player loses
            onGameLostRef.current();
          }
        });

        // Update NPC AI
        npcsRef.current.forEach((npc) => {
          const timeSinceStateChange = currentTime - npc.stateStartTime;
          const distanceToPlayer = Vector3.Distance(playerRig.position, npc.position);

          // Check player collision with NPC (both are ~0.5 units in size, collision at ~0.65 units)
          const npcCollisionRadius = 0.65;
          if (distanceToPlayer < npcCollisionRadius && !isStaggered) {
            let shouldApplyStagger = true;
            let collisionHandled = false;

            // Skip collision if thief is fleeing (immune to all interactions for 2 seconds)
            if (npc.isThief && npc.state === 'fleeing') {
              // No collision interactions - thief is in full escape mode
              shouldApplyStagger = false;
              collisionHandled = true;
            }
            
            // Try to steal back objective from thief (any state except fleeing)
            if (!collisionHandled && npc.isThief && npc.stolenObjective && npc.state !== 'fleeing') {
              // Steal back the objective
              collectedRef.current.add(npc.stolenObjective);
              onObjectiveCollectedRef.current(npc.stolenObjective);
              npc.stolenObjective = undefined;
              // Enter staggered state after being hit
              changeNPCState(npc, 'staggered', currentTime, undefined, playerRig.position);
              npc.panicStartTime = currentTime;
              // Push NPC back (further because they had stolen objective)
              const dirX = npc.position.x - playerRig.position.x;
              const dirZ = npc.position.z - playerRig.position.z;
              const length = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
              npc.position.x += (dirX / length) * defaultNPCConfig.staggerBounceDistance * 1.5;
              npc.position.z += (dirZ / length) * defaultNPCConfig.staggerBounceDistance * 1.5;
              collisionHandled = true;
            }
            
            // Try to steal new objective (only if not already handled and not in restricted states)
            if (!collisionHandled && npc.state !== 'staggered' && npc.state !== 'panic' && npc.state !== 'fleeing' && npc.state !== 'escaping') {
              if (npc.isThief && collectedRef.current.size > 0 && !npc.stolenObjective) {
                // Pick a random collected objective to steal
                const collectedObjectives = Array.from(collectedRef.current);
                const stolenObjectivePos = collectedObjectives[Math.floor(Math.random() * collectedObjectives.length)];
                npc.stolenObjective = stolenObjectivePos;
                collectedRef.current.delete(stolenObjectivePos);
                onObjectiveLostRef.current(stolenObjectivePos);
                // Immediately enter fleeing state (immune to all interactions for 2 seconds)
                changeNPCState(npc, 'fleeing', currentTime, gridSize, playerRig.position);
                // Trigger collision callback for thief
                onNPCCollisionRef.current?.(true);
              } else {
                // Regular collision - NPC gets staggered
                changeNPCState(npc, 'staggered', currentTime, undefined, playerRig.position);
                npc.panicStartTime = currentTime;
                // Trigger collision callback for non-thief NPC during low alert
                if (alertPhase === 'low') {
                  onNPCCollisionRef.current?.(false);
                }
              }
              // Push NPC back
              const dirX = npc.position.x - playerRig.position.x;
              const dirZ = npc.position.z - playerRig.position.z;
              const length = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
              const knockbackMultiplier = npc.stolenObjective ? 1.5 : 1; // 1.5x knockback for thieves with stolen objectives
              npc.position.x += (dirX / length) * defaultNPCConfig.staggerBounceDistance * knockbackMultiplier;
              npc.position.z += (dirZ / length) * defaultNPCConfig.staggerBounceDistance * knockbackMultiplier;
              collisionHandled = true;
            }

            // Player enters stagger state only if not fleeing
            if (shouldApplyStagger) {
              playerStaggerTimeRef.current = currentTime + defaultNPCConfig.staggerDurationMs;
              staggerStateRef.current.isStaggered = true;
              staggerStateRef.current.staggerEndTime = playerStaggerTimeRef.current;
            }
          }

          // Check if NPC should transition to a new state
          const nextState = getNextNPCState(npc, npcsRef.current, currentTime);
          if (nextState) {
            changeNPCState(npc, nextState, currentTime, gridSize, playerRig.position);
          }

          // NPC state machine - movement and behavior
          switch (npc.state) {
            case 'thinking':
              // Stand still - no movement
              break;

            case 'socializing':
              if (npc.targetNPC) {
                const distToTarget = Vector3.Distance(npc.position, npc.targetNPC.position);
                if (distToTarget > 1.5) {
                  // Move towards NPC
                  const dirX = npc.targetNPC.position.x - npc.position.x;
                  const dirZ = npc.targetNPC.position.z - npc.position.z;
                  const length = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
                  const agilityMultiplier = npc.agility ? npc.agility / 5 : 1;
                  const moveDistance = defaultNPCConfig.socializingSpeedPerMs * deltaTime * agilityMultiplier;
                  npc.position.x += (dirX / length) * moveDistance;
                  npc.position.z += (dirZ / length) * moveDistance;
                }
              } else {
                // Find nearest NPC to socialize with
                const nearbyNPC = findNearestNPC(npc, npcsRef.current, 3);
                if (nearbyNPC) {
                  npc.targetNPC = nearbyNPC;
                } else if (!npc.targetPosition) {
                  // If no NPC nearby, move to adjacent tile
                  npc.targetPosition = getRandomAdjacentPosition(npc, gridSize);
                }
              }
              // Move towards adjacent target if no NPC nearby
              if (!npc.targetNPC && npc.targetPosition) {
                const distToTarget = Vector3.Distance(npc.position, npc.targetPosition);
                if (distToTarget > 0.2) {
                  const dirX = npc.targetPosition.x - npc.position.x;
                  const dirZ = npc.targetPosition.z - npc.position.z;
                  const length = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
                  const agilityMultiplier = npc.agility ? npc.agility / 5 : 1;
                  const moveDistance = defaultNPCConfig.socializingSpeedPerMs * deltaTime * agilityMultiplier;
                  npc.position.x += (dirX / length) * moveDistance;
                  npc.position.z += (dirZ / length) * moveDistance;
                } else {
                  npc.targetPosition = undefined;
                }
              }
              break;

            case 'wandering':
              if (!npc.targetPosition) {
                npc.targetPosition = getRandomAdjacentPosition(npc, gridSize);
              }
              if (npc.targetPosition) {
                const distToTarget = Vector3.Distance(npc.position, npc.targetPosition);
                if (distToTarget > 0.2) {
                  // Move towards adjacent target
                  const dirX = npc.targetPosition.x - npc.position.x;
                  const dirZ = npc.targetPosition.z - npc.position.z;
                  const length = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
                  const agilityMultiplier = npc.agility ? npc.agility / 5 : 1;
                  const moveDistance = defaultNPCConfig.wanderingSpeedPerMs * deltaTime * agilityMultiplier;
                  npc.position.x += (dirX / length) * moveDistance;
                  npc.position.z += (dirZ / length) * moveDistance;
                } else {
                  // Reached adjacent target, pick a new adjacent one
                  npc.targetPosition = getRandomAdjacentPosition(npc, gridSize);
                }
              }
              break;

            case 'staggered':
              // No movement while staggered
              break;

            case 'panic':
              // Move to adjacent tiles randomly at high speed
              if (!npc.targetPosition || Vector3.Distance(npc.position, npc.targetPosition) < 0.3) {
                npc.targetPosition = getRandomAdjacentPosition(npc, gridSize, currentLevel.positions, playerRig.position);
              }
              if (npc.targetPosition) {
                const dirX = npc.targetPosition.x - npc.position.x;
                const dirZ = npc.targetPosition.z - npc.position.z;
                const length = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
                const agilityMultiplier = npc.agility ? npc.agility / 5 : 1;
                const moveDistance = defaultNPCConfig.panicSpeedPerMs * deltaTime * agilityMultiplier;
                npc.position.x += (dirX / length) * moveDistance;
                npc.position.z += (dirZ / length) * moveDistance;
              }
              break;

            case 'escaping':
              // Move towards exit at slightly faster speed (1.1x panic speed)
              if (endPos) {
                const dirX = endPos.x - npc.position.x;
                const dirZ = endPos.z - npc.position.z;
                const length = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
                const agilityMultiplier = npc.agility ? npc.agility / 5 : 1;
                // Escaping speed is 1.1x the panic speed
                const moveDistance = defaultNPCConfig.panicSpeedPerMs * 1.1 * deltaTime * agilityMultiplier;
                npc.position.x += (dirX / length) * moveDistance;
                npc.position.z += (dirZ / length) * moveDistance;
              }
              break;

            case 'fleeing':
              // Move towards exit at faster speed (1.5x panic speed), immune to collisions
              if (endPos) {
                const dirX = endPos.x - npc.position.x;
                const dirZ = endPos.z - npc.position.z;
                const length = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
                const agilityMultiplier = npc.agility ? npc.agility / 5 : 1;
                // Fleeing speed is 1.5x the panic speed
                const moveDistance = defaultNPCConfig.panicSpeedPerMs * 1.5 * deltaTime * agilityMultiplier;
                npc.position.x += (dirX / length) * moveDistance;
                npc.position.z += (dirZ / length) * moveDistance;
              }
              break;
          }

          // Clamp NPC position to grid boundaries
          const halfGrid = gridSize / 2;
          const minBound = -halfGrid + 0.5;
          const maxBound = halfGrid - 0.5;
          npc.position.x = Math.max(minBound, Math.min(maxBound, npc.position.x));
          npc.position.z = Math.max(minBound, Math.min(maxBound, npc.position.z));
          npc.mesh.position = npc.position;
        });
        }
        scene!.render();
      });

      return () => {
        // Stop the render loop
        engine!.stopRenderLoop();

        // Dispose GUI texture
        if (guiTextureRef.current) {
          guiTextureRef.current.dispose();
          guiTextureRef.current = null;
        }
      };
    };

    // Call the async setup function
    setupScene();

    // Return cleanup function to be called on unmount or dependency change
    return cleanup;
  }, [enabled, canvasRef, currentLevel, showNPCGui]);
}
