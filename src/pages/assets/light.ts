import { Scene, HemisphericLight, Vector3 } from '@babylonjs/core';

export function createLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
    return light;
}
