import { Scene, Vector3, MeshBuilder, Color3, StandardMaterial, TransformNode, DynamicTexture } from '@babylonjs/core';

export function createExit(scene: Scene, position: Vector3, scale: number = 1, groundOffset: number = 0): any {
    // ================= MATERIALS =================
    const doorMat = new StandardMaterial("doorMat", scene);
    doorMat.diffuseColor = new Color3(0.79, 0.55, 0.29);

    const frameMat = new StandardMaterial("frameMat", scene);
    frameMat.diffuseColor = new Color3(0.2, 0.15, 0.05);

    const handleMat = new StandardMaterial("handleMat", scene);
    handleMat.diffuseColor = new Color3(0.75, 0.75, 0.75);
    handleMat.specularColor = new Color3(1, 1, 1);

    // ================= DIMENSIONS =================
    const doorHeight = 2.2 * scale;
    const doorWidth = 0.96 * scale;
    const doorDepth = 0.12 * scale;
    const doorY = doorHeight / 2;

    // ================= HINGES =================
    const leftHinge = new TransformNode("leftHinge", scene);
    leftHinge.position.set(-doorWidth, 0, 0);

    const rightHinge = new TransformNode("rightHinge", scene);
    rightHinge.position.set(doorWidth, 0, 0);

    // ================= DOORS =================
    const leftDoor = MeshBuilder.CreateBox(
        "leftDoor",
        { width: doorWidth, height: doorHeight, depth: doorDepth },
        scene
    );
    leftDoor.material = doorMat;
    leftDoor.parent = leftHinge;
    leftDoor.position.set(doorWidth / 2, doorY, 0);

    const rightDoor = MeshBuilder.CreateBox(
        "rightDoor",
        { width: doorWidth, height: doorHeight, depth: doorDepth },
        scene
    );
    rightDoor.material = doorMat;
    rightDoor.parent = rightHinge;
    rightDoor.position.set(-doorWidth / 2, doorY, 0);

    // ================= HANDLE FUNCTION =================
    function createHandle(door: any, side: string) {
        const handleY = (1.05 * scale) - doorY;
        const handleZ = (doorDepth / 2) + (0.03 * scale);
        const edgeInset = (doorWidth / 2) - (0.12 * scale);
        const handleX = side === "right" ? -edgeInset : edgeInset;

        const plate = MeshBuilder.CreateBox(
            "plate",
            { width: 0.12 * scale, height: 0.18 * scale, depth: 0.02 * scale },
            scene
        );
        plate.material = handleMat;
        plate.parent = door;
        plate.position.set(handleX, handleY, handleZ);

        const stem = MeshBuilder.CreateCylinder(
            "stem",
            { height: 0.05 * scale, diameter: 0.03 * scale },
            scene
        );
        stem.material = handleMat;
        stem.parent = door;
        stem.rotation.x = Math.PI / 2;
        stem.position.set(handleX, handleY, handleZ + 0.035 * scale);

        const grip = MeshBuilder.CreateCylinder(
            "grip",
            { height: 0.18 * scale, diameter: 0.035 * scale },
            scene
        );
        grip.material = handleMat;
        grip.parent = door;
        grip.rotation.z = side === "right" ? Math.PI / 2 : -Math.PI / 2;
        grip.position.set(
            handleX + (side === "right" ? 0.09 * scale : -0.09 * scale),
            handleY,
            handleZ + 0.035 * scale
        );
    }

    createHandle(rightDoor, "right");
    createHandle(leftDoor, "left");

    // ================= FRAME =================
    const frameHeight = 2.3 * scale;
    const frameDepth = 0.2 * scale;
    const frameWidth = 0.12 * scale;
    const totalDoorWidth = doorWidth * 2;
    const totalFrameWidth = totalDoorWidth + frameWidth * 2;

    const frameL = MeshBuilder.CreateBox("frameL", {
        width: frameWidth,
        height: frameHeight,
        depth: frameDepth
    }, scene);
    frameL.material = frameMat;
    frameL.position.set(
        -totalDoorWidth / 2 - frameWidth / 2,
        frameHeight / 2,
        0
    );

    const frameR = frameL.clone("frameR");
    frameR.position.x = totalDoorWidth / 2 + frameWidth / 2;

    const frameT = MeshBuilder.CreateBox("frameT", {
        width: totalFrameWidth,
        height: frameWidth,
        depth: frameDepth
    }, scene);
    frameT.material = frameMat;
    frameT.position.set(0, frameHeight + frameWidth / 2, 0);

    // ================= EXIT SIGN =================
    const exitPlane = MeshBuilder.CreatePlane(
        "exitPlane",
        { width: 0.7 * scale, height: 0.3 * scale },
        scene
    );
    exitPlane.position.set(0, 2.1 * scale, 0.15 * scale);
    exitPlane.rotation.y = Math.PI;

    const exitTexture = new DynamicTexture(
        "exitTexture",
        { width: 1024, height: 512 },
        scene,
        true
    );
    exitTexture.hasAlpha = true;
    exitTexture.drawText(
        "EXIT",
        280,
        340,
        "bold 200px Arial",
        "white",
        "red",
        true
    );

    const exitMat = new StandardMaterial("exitMat", scene);
    exitMat.diffuseTexture = exitTexture;
    exitMat.emissiveTexture = exitTexture;
    exitMat.backFaceCulling = false;
    exitPlane.material = exitMat;

    // ================= DOOR ALWAYS OPEN =================
    leftHinge.rotation.y = Math.PI * (70 / 180); // 70 degrees
    rightHinge.rotation.y = Math.PI * (-70 / 180); // -70 degrees

    // ================= POSITION EXIT MODEL =================
    // Create a parent node to contain the entire model
    const exitModel = new TransformNode("exitModel", scene);
    leftHinge.parent = exitModel;
    rightHinge.parent = exitModel;
    frameL.parent = exitModel;
    frameR.parent = exitModel;
    frameT.parent = exitModel;
    exitPlane.parent = exitModel;

    // Position the entire model at the provided location
    exitModel.position.copyFrom(position);
    exitModel.position.y += groundOffset;

    // Store materials for later disposal
    (exitModel as any).doorMaterial = doorMat;
    (exitModel as any).frameMaterial = frameMat;
    (exitModel as any).handleMaterial = handleMat;
    (exitModel as any).exitMaterial = exitMat;

    return exitModel;
}
