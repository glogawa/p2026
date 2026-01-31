import { Scene, MeshBuilder, Color3, StandardMaterial, Vector3 } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials/grid';

export function createGround(scene: Scene, gridSize: number, positions: { [key: string]: 'start' | 'end' | 'objective' | null }) {
    const plane = MeshBuilder.CreateGround("ground", { width: gridSize, height: gridSize }, scene);
    const gridMaterial = new GridMaterial("grid", scene);
    gridMaterial.gridRatio = 1;
    gridMaterial.mainColor = new Color3(0.5, 0.5, 0.5);
    gridMaterial.lineColor = new Color3(0, 0, 0);
    plane.material = gridMaterial;

    // Create colored tiles for positions
    Object.entries(positions).forEach(([pos, type]) => {
        if (type) {
            const [x, y] = pos.split(',').map(Number);
            const worldX = x - gridSize / 2 + 0.5;
            const worldZ = y - gridSize / 2 + 0.5;
            const tile = MeshBuilder.CreateGround(`tile_${x}_${y}`, { width: 1, height: 1 }, scene);
            tile.position = new Vector3(worldX, 0.01, worldZ); // Slightly above ground
            const material = new StandardMaterial(`tileMat_${x}_${y}`, scene);
            switch (type) {
                case 'start':
                    material.diffuseColor = new Color3(0, 1, 0); // Green
                    break;
                case 'end':
                    material.diffuseColor = new Color3(1, 0, 0); // Red
                    break;
                case 'objective':
                    material.diffuseColor = new Color3(0, 0, 1); // Blue
                    break;
            }
            tile.material = material;
        }
    });
}
