import { useEffect, useRef } from 'react';
import { Engine, Scene, Vector3, MeshBuilder, KeyboardEventTypes, Color3 } from '@babylonjs/core';
import { createGround } from '../pages/assets/ground';
import { createCamera } from '../pages/assets/camera';
import { createLight } from '../pages/assets/light';

interface UseGameEngineOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentLevel: any;
  joystickMovement: { x: number; z: number };
  onLevelComplete: () => void;
  onObjectiveCollected: (objectivePos: string) => void;
  collectedObjectives: Set<string>;
  enabled: boolean;
}

export function useGameEngine({
  canvasRef,
  currentLevel,
  joystickMovement,
  onLevelComplete,
  onObjectiveCollected,
  collectedObjectives,
  enabled,
}: UseGameEngineOptions) {
  const objectiveTilesRef = useRef<{ [key: string]: { tile: any; material: any } }>({});
  const collectedRef = useRef(collectedObjectives);
  const onObjectiveCollectedRef = useRef(onObjectiveCollected);
  const onLevelCompleteRef = useRef(onLevelComplete);

  // Update the refs when callbacks change
  useEffect(() => {
    collectedRef.current = collectedObjectives;
  }, [collectedObjectives]);

  useEffect(() => {
    onObjectiveCollectedRef.current = onObjectiveCollected;
    onLevelCompleteRef.current = onLevelComplete;
  }, [onObjectiveCollected, onLevelComplete]);

  useEffect(() => {
    if (!enabled || !canvasRef.current || !currentLevel) return;

    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    createCamera(scene, canvasRef.current);
    createLight(scene);
    const gridSize = currentLevel.gridSize;
    const objectiveTiles = createGround(scene, gridSize, currentLevel.positions, collectedRef.current);
    objectiveTilesRef.current = objectiveTiles;

    // Focus canvas
    canvasRef.current.tabIndex = 0;
    canvasRef.current.focus();

    // Create player box
    let box: any = null;
    const startEntry = Object.entries(currentLevel.positions).find(
      ([_, type]) => type === 'start'
    );
    if (startEntry) {
      const [pos] = startEntry as [string, string];
      const [x, y] = pos.split(',').map(Number);
      const worldX = x - gridSize / 2 + 0.5;
      const worldZ = y - gridSize / 2 + 0.5;
      box = MeshBuilder.CreateBox('player', { size: 1 }, scene);
      box.position = new Vector3(worldX, 0.5, worldZ);
    }

    // Find objectives
    const objectives: { [key: string]: Vector3 } = {};
    Object.entries(currentLevel.positions).forEach(([pos, type]) => {
      if (type === 'objective') {
        const [x, y] = pos.split(',').map(Number);
        const worldX = x - gridSize / 2 + 0.5;
        const worldZ = y - gridSize / 2 + 0.5;
        objectives[pos] = new Vector3(worldX, 0.5, worldZ);
      }
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
      endPos = new Vector3(worldX, 0.5, worldZ);
    }

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
      if (box) {
        // Keyboard movement
        if (inputMap['w']) box.position.z += 0.1;
        if (inputMap['s']) box.position.z -= 0.1;
        if (inputMap['a']) box.position.x -= 0.1;
        if (inputMap['d']) box.position.x += 0.1;
        // Joystick movement
        box.position.x += joystickMovement.x;
        box.position.z += joystickMovement.z;

        // Check if reached objective
        Object.entries(objectives).forEach(([objectivePos, objectiveVector]) => {
          if (!collectedRef.current.has(objectivePos) && Vector3.Distance(box.position, objectiveVector) < 0.5) {
            collectedRef.current.add(objectivePos);
            onObjectiveCollectedRef.current(objectivePos);
            // Hide the objective tile
            if (objectiveTilesRef.current[objectivePos]) {
              objectiveTilesRef.current[objectivePos].tile.isVisible = false;
            }
          }
        });

        // Check if reached end (only if all objectives are collected)
        if (endPos && collectedRef.current.size === Object.keys(objectives).length) {
          if (Vector3.Distance(box.position, endPos) < 0.5) {
            onLevelCompleteRef.current();
          }
        }
      }
      scene.render();
    });

    return () => {
      engine.dispose();
    };
  }, [enabled, canvasRef, currentLevel, joystickMovement]);
}
