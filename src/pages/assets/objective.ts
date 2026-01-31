import { Scene, MeshBuilder, Color3, StandardMaterial, Vector3 } from '@babylonjs/core';

export function createObjective(scene: Scene, position: Vector3): any {
    // Create a sphere as the objective marker
    const objective = MeshBuilder.CreateSphere('objective', { diameter: 0.6, segments: 16 }, scene);
    objective.position = position;
    
    const material = new StandardMaterial('objectiveMaterial', scene);
    material.diffuseColor = new Color3(0, 0, 1); // Blue
    material.specularColor = new Color3(0.2, 0.2, 0.2);
    objective.material = material;
    (objective as any).objectiveMaterial = material; // Store for later disposal
    
    return objective;
}
