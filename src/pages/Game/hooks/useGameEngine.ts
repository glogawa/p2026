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
  onObjectiveCollected: (objectivePos: string) => void;
  collectedObjectives: Set<string>;
  enabled: boolean;
  fenceConfig?: FenceConfig;
  showNPCGui?: boolean;
  npcStats?: NPCStatsConfig;
  playerStats?: { stamina: number; agility: number };
}

export function useGameEngine({
  canvasRef,
  currentLevel,
  joystickMovement,
  onLevelComplete,
  onObjectiveCollected,
  collectedObjectives,
  enabled,
  fenceConfig = defaultFenceConfig,
  showNPCGui = true,
  npcStats,
  playerStats,
}: UseGameEngineOptions) {
  const objectiveTilesRef = useRef<{ [key: string]: { tile: any; material: any } }>({});
  const collectedRef = useRef(collectedObjectives);
  const onObjectiveCollectedRef = useRef(onObjectiveCollected);
  const onLevelCompleteRef = useRef(onLevelComplete);
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

  // Update the refs when callbacks change
  useEffect(() => {
    collectedRef.current = collectedObjectives;
  }, [collectedObjectives]);

  useEffect(() => {
    onObjectiveCollectedRef.current = onObjectiveCollected;
    onLevelCompleteRef.current = onLevelComplete;
  }, [onObjectiveCollected, onLevelComplete]);

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

    const setupScene = async () => {
      const engine = new Engine(canvasRef.current!, true);
      engine.enableOfflineSupport = false;
      
      const scene = new Scene(engine);
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
          const fenceMesh = createFence(scene, new Vector3(worldX, 0, worldZ), fenceConfig);
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
          const npcMesh = createNPC(scene, new Vector3(worldX, 0, worldZ), 0.5);
          
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
          };
          npcsRef.current.push(npcInstance);
          
          // Attach GUI label to NPC (and set initial visibility)
          attachNPCGUI(npcInstance, scene, guiTexture);
          if (npcInstance.guiRect) {
            npcInstance.guiRect.isVisible = showNPCGui;
          }
          if (npcInstance.guiLine) {
            npcInstance.guiLine.isVisible = showNPCGui;
          }
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

        // Check if reached end (only if all objectives are collected)
        if (endPos && collectedRef.current.size === Object.keys(objectives).length) {
          if (Vector3.Distance(playerRig.position, endPos) < 0.5) {
            onLevelCompleteRef.current();
          }
        }

        // Update NPC AI
        npcsRef.current.forEach((npc) => {
          const timeSinceStateChange = currentTime - npc.stateStartTime;
          const distanceToPlayer = Vector3.Distance(playerRig.position, npc.position);

          // Check player collision with NPC (both are ~0.5 units in size, collision at ~0.65 units)
          const npcCollisionRadius = 0.65;
          if (distanceToPlayer < npcCollisionRadius && !isStaggered) {
            if (npc.state !== 'staggered' && npc.state !== 'panic') {
              // NPC gets staggered
              changeNPCState(npc, 'staggered', currentTime, undefined, playerRig.position);
              npc.panicStartTime = currentTime;
              // Push NPC back
              const dirX = npc.position.x - playerRig.position.x;
              const dirZ = npc.position.z - playerRig.position.z;
              const length = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
              npc.position.x += (dirX / length) * defaultNPCConfig.staggerBounceDistance;
              npc.position.z += (dirZ / length) * defaultNPCConfig.staggerBounceDistance;
            }
            // Player enters stagger state
            playerStaggerTimeRef.current = currentTime + defaultNPCConfig.staggerDurationMs;
            staggerStateRef.current.isStaggered = true;
            staggerStateRef.current.staggerEndTime = playerStaggerTimeRef.current;
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
        scene.render();
      });

      return () => {
        // Stop the render loop
        engine.stopRenderLoop();

        // Dispose GUI texture
        if (guiTextureRef.current) {
          guiTextureRef.current.dispose();
          guiTextureRef.current = null;
        }

        // Dispose NPC GUI elements and materials
        npcsRef.current.forEach((npc) => {
          if (npc.guiRect) {
            npc.guiRect.dispose();
          }
          if (npc.guiLine) {
            npc.guiLine.dispose();
          }
          if (npc.guiTarget) {
            npc.guiTarget.dispose();
          }
          if (npc.mesh && npc.mesh.npcMaterial) {
            npc.mesh.npcMaterial.dispose();
          }
          // Mesh is disposed with scene
        });

        // Dispose fence meshes and materials
        Object.values(fenceMeshesRef.current).forEach((fenceMesh) => {
          if (fenceMesh && typeof fenceMesh !== 'boolean') {
            if (fenceMesh.fenceMaterial) {
              fenceMesh.fenceMaterial.dispose();
            }
            fenceMesh.dispose();
          }
        });

        // Dispose objective tile materials
        Object.values(objectiveTilesRef.current).forEach((tileData) => {
          if (tileData.tile && tileData.tile.objectiveMaterial) {
            tileData.tile.objectiveMaterial.dispose();
          }
          if (tileData.material) {
            tileData.material.dispose();
          }
          // Tile mesh is disposed with scene
        });

        // Dispose ground plane and material
        if (groundPlaneRef.current) {
          groundPlaneRef.current.dispose();
        }
        if (groundMaterialRef.current) {
          groundMaterialRef.current.dispose();
        }

        // Dispose start and exit meshes and materials
        startMeshesRef.current.forEach((mesh) => {
          if (mesh.startMaterial) {
            mesh.startMaterial.dispose();
          }
          mesh.dispose();
        });
        exitMeshesRef.current.forEach((mesh) => {
          if (mesh.exitMaterial) {
            mesh.exitMaterial.dispose();
          }
          mesh.dispose();
        });

        // Dispose player
        if (playerBoxRef.current) {
          playerBoxRef.current.dispose();
        }

        // Clear refs
        npcsRef.current = [];
        fenceMeshesRef.current = {};
        objectiveTilesRef.current = {};
        groundPlaneRef.current = null;
        groundMaterialRef.current = null;
        startMeshesRef.current = [];
        exitMeshesRef.current = [];
        playerBoxRef.current = null;

        // Dispose scene and engine
        scene.dispose();
        engine.dispose();
      };
    };

    // Call the async setup function
    setupScene();
  }, [enabled, canvasRef, currentLevel, showNPCGui]);
}
