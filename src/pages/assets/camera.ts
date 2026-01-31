import { Scene, FollowCamera, Vector3 } from '@babylonjs/core';

const defaultHeight = 5;
const defaultDistance = 15;
export function createCamera(scene: Scene, canvas: HTMLCanvasElement) {
    const camera = new FollowCamera("camera", new Vector3(0, defaultHeight, -defaultDistance), scene);
    camera.setTarget(new Vector3(0, 0, 0));
    camera.heightOffset = 5; // Height above the target
    camera.radius = 15; // Distance from the target
    // camera.attachControl(canvas, true);
    return camera;
}
