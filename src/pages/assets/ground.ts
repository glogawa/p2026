import { Scene, MeshBuilder, Color3 } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials/grid';

export function createGround(scene: Scene, gridSize: number) {
    const plane = MeshBuilder.CreateGround("ground", { width: gridSize, height: gridSize }, scene);
    const gridMaterial = new GridMaterial("grid", scene);
    gridMaterial.gridRatio = 1;
    gridMaterial.mainColor = new Color3(0.5, 0.5, 0.5);
    gridMaterial.lineColor = new Color3(0, 0, 0);
    plane.material = gridMaterial;
}
