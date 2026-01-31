import { Scene, MeshBuilder, Color3, StandardMaterial, Vector3 } from '@babylonjs/core';

export function createStart(scene: Scene, position: Vector3): any {
    // Create a box as the start marker
    const start = MeshBuilder.CreateBox('start', { size: 0.7 }, scene);
    start.position = position;
    
    const material = new StandardMaterial('startMaterial', scene);
    material.diffuseColor = new Color3(0, 1, 0); // Green
    material.specularColor = new Color3(0.2, 0.2, 0.2);
    start.material = material;
    
    return start;
}
