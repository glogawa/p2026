import { Scene, ArcRotateCamera, Vector3 } from '@babylonjs/core';

const defaultTilt = Math.PI / 3;
const defaultDistance = 15;
export function createCamera(scene: Scene, canvas: HTMLCanvasElement) {
    const camera = new ArcRotateCamera("camera", -Math.PI / 2, defaultTilt, defaultDistance, new Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    return camera;
}
