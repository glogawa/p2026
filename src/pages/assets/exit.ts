import { Scene, MeshBuilder, Color3, StandardMaterial, Vector3 } from '@babylonjs/core';

export function createExit(scene: Scene, position: Vector3): any {
    // Create a cylinder as the exit marker
    const exit = MeshBuilder.CreateCylinder('exit', { height: 0.7, diameter: 0.6 }, scene);
    exit.position = position;
    
    const material = new StandardMaterial('exitMaterial', scene);
    material.diffuseColor = new Color3(1, 0, 0); // Red
    material.specularColor = new Color3(0.2, 0.2, 0.2);
    exit.material = material;
    
    return exit;
}
