import { Scene, MeshBuilder, Color3, StandardMaterial, Vector3 } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials/grid';
import { createObjective } from './objective';
import { createStart } from './start';
import { createExit } from './exit';

export async function createGround(
  scene: Scene,
  gridSize: number,
  positions: { [key: string]: 'start' | 'end' | 'objective' | null },
  collectedObjectives?: Set<string>
) {
    const plane = MeshBuilder.CreateGround("ground", { width: gridSize, height: gridSize }, scene);
    const gridMaterial = new GridMaterial("grid", scene);
    gridMaterial.gridRatio = 1;
    gridMaterial.mainColor = new Color3(0.5, 0.5, 0.5);
    gridMaterial.lineColor = new Color3(0, 0, 0);
    plane.material = gridMaterial;

    const objectiveTiles: { [key: string]: { tile: any; material: StandardMaterial } } = {};
    const startMeshes: any[] = [];
    const exitMeshes: any[] = [];

    // Create 3D models for positions
    for (const [pos, type] of Object.entries(positions)) {
        if (type) {
            const [x, y] = pos.split(',').map(Number);
            const worldX = x - gridSize / 2 + 0.5;
            const worldZ = y - gridSize / 2 + 0.5;
            const position = new Vector3(worldX, 0.35, worldZ);
            
            // Check if objective is collected
            const isCollected = collectedObjectives?.has(pos) ?? false;
            
            switch (type) {
                case 'start':
                    const startMesh = await createStart(scene, position, 0.8, -0.4);
                    // Determine rotation based on edge position for doors to face inward
                    // x=0 is left, x=gridSize-1 is right, y=0 is back, y=gridSize-1 is front
                    let startRotation = 0;
                    if (x === 0) startRotation = Math.PI / 2; // Left edge, face right (inward, +X)
                    else if (x === gridSize - 1) startRotation = -Math.PI / 2; // Right edge, face left (inward, -X)
                    else if (y === 0) startRotation = 0; // Back edge, face forward (inward, +Z)
                    else if (y === gridSize - 1) startRotation = Math.PI; // Front edge, face back (inward, -Z)
                    startMesh.rotation.y = startRotation;
                    startMeshes.push(startMesh);
                    break;
                case 'end':
                    const exitMesh = createExit(scene, position, 0.8, -0.4);
                    // Determine rotation based on edge position for doors to face inward
                    // x=0 is left, x=gridSize-1 is right, y=0 is back, y=gridSize-1 is front
                    let exitRotation = 0;
                    if (x === 0) exitRotation = Math.PI / 2; // Left edge, face right (inward, +X)
                    else if (x === gridSize - 1) exitRotation = -Math.PI / 2; // Right edge, face left (inward, -X)
                    else if (y === 0) exitRotation = 0; // Back edge, face forward (inward, +Z)
                    else if (y === gridSize - 1) exitRotation = Math.PI; // Front edge, face back (inward, -Z)
                    exitMesh.rotation.y = exitRotation;
                    exitMeshes.push(exitMesh);
                    break;
                case 'objective':
                    const objective = createObjective(scene, position, 0.4, -0.3);
                    if (isCollected) {
                        objective.isVisible = false;
                    }
                    objectiveTiles[pos] = { tile: objective, material: objective.material };
                    break;
            }
        }
    }

    return { objectiveTiles, groundPlane: plane, groundMaterial: gridMaterial, startMeshes, exitMeshes };
}
