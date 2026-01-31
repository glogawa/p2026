import { Scene, MeshBuilder, Color3, StandardMaterial, Vector3 } from '@babylonjs/core';

export interface FenceConfig {
  staggerDuration: number; // milliseconds
  bounceDistance: number; // world units
}

export const defaultFenceConfig: FenceConfig = {
  staggerDuration: 500, // 500ms
  bounceDistance: 0.2, // 0.2 units
};

export function createFence(scene: Scene, position: Vector3, config: FenceConfig = defaultFenceConfig): any {
  // Create a box as the fence
  const fence = MeshBuilder.CreateBox('fence', { size: 1 }, scene);
  fence.position = position;

  const material = new StandardMaterial('fenceMaterial', scene);
  material.diffuseColor = new Color3(0.3, 0.3, 0.3); // Dark gray
  material.specularColor = new Color3(0.2, 0.2, 0.2);
  fence.material = material;

  // Store config on the fence for later use
  (fence as any).fenceConfig = config;

  return fence;
}
