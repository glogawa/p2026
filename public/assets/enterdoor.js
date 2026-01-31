export const createScene = function (engine, canvas) {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);

    // ================= CAMERA =================
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2.2,
        6,
        new BABYLON.Vector3(0, 1.3, 0),
        scene
    );
    camera.attachControl(canvas, true);

    // ================= LIGHT =================
    const hemiLight = new BABYLON.HemisphericLight(
        "hemiLight",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    hemiLight.intensity = 1.1;

    // ================= MATERIALS =================
    const doorMat = new BABYLON.StandardMaterial("doorMat", scene);
    doorMat.diffuseColor = new BABYLON.Color3(0.79, 0.55, 0.29);

    const frameMat = new BABYLON.StandardMaterial("frameMat", scene);
    frameMat.diffuseColor = new BABYLON.Color3(0.2, 0.15, 0.05);

    const handleMat = new BABYLON.StandardMaterial("handleMat", scene);
    handleMat.diffuseColor = new BABYLON.Color3(0.75, 0.75, 0.75);
    handleMat.specularColor = new BABYLON.Color3(1, 1, 1);

    // ================= DIMENSIONS =================
    const doorHeight = 2.2;
    const doorWidth = 0.96;
    const doorDepth = 0.12;
    const doorY = doorHeight / 2;

    // ================= HINGES =================
    const leftHinge = new BABYLON.TransformNode("leftHinge", scene);
    leftHinge.position.set(-doorWidth, 0, 0);

    const rightHinge = new BABYLON.TransformNode("rightHinge", scene);
    rightHinge.position.set(doorWidth, 0, 0);

    // ================= DOORS =================
    const leftDoor = BABYLON.MeshBuilder.CreateBox(
        "leftDoor",
        { width: doorWidth, height: doorHeight, depth: doorDepth },
        scene
    );
    leftDoor.material = doorMat;
    leftDoor.parent = leftHinge;
    leftDoor.position.set(doorWidth / 2, doorY, 0);

    const rightDoor = BABYLON.MeshBuilder.CreateBox(
        "rightDoor",
        { width: doorWidth, height: doorHeight, depth: doorDepth },
        scene
    );
    rightDoor.material = doorMat;
    rightDoor.parent = rightHinge;
    rightDoor.position.set(-doorWidth / 2, doorY, 0);

    // ================= HANDLE FUNCTION =================
    function createHandle(door, side) {
        const handleY = 1.05 - doorY;
        const handleZ = doorDepth / 2 + 0.03;
        const edgeInset = doorWidth / 2 - 0.12;
        const handleX = side === "right" ? -edgeInset : edgeInset;

        const plate = BABYLON.MeshBuilder.CreateBox(
            "plate",
            { width: 0.12, height: 0.18, depth: 0.02 },
            scene
        );
        plate.material = handleMat;
        plate.parent = door;
        plate.position.set(handleX, handleY, handleZ);

        const stem = BABYLON.MeshBuilder.CreateCylinder(
            "stem",
            { height: 0.05, diameter: 0.03 },
            scene
        );
        stem.material = handleMat;
        stem.parent = door;
        stem.rotation.x = Math.PI / 2;
        stem.position.set(handleX, handleY, handleZ + 0.035);

        const grip = BABYLON.MeshBuilder.CreateCylinder(
            "grip",
            { height: 0.18, diameter: 0.035 },
            scene
        );
        grip.material = handleMat;
        grip.parent = door;
        grip.rotation.z = side === "right" ? Math.PI / 2 : -Math.PI / 2;
        grip.position.set(
            handleX + (side === "right" ? 0.09 : -0.09),
            handleY,
            handleZ + 0.035
        );
    }

    createHandle(rightDoor, "right");
    createHandle(leftDoor, "left");

    // ================= FRAME =================
    const frameHeight = 2.3;
    const frameDepth = 0.2;
    const frameWidth = 0.12;
    const totalDoorWidth = doorWidth * 2;
    const totalFrameWidth = totalDoorWidth + frameWidth * 2;

    const frameL = BABYLON.MeshBuilder.CreateBox("frameL", {
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

    const frameT = BABYLON.MeshBuilder.CreateBox("frameT", {
        width: totalFrameWidth,
        height: frameWidth,
        depth: frameDepth
    }, scene);
    frameT.material = frameMat;
    frameT.position.set(0, frameHeight + frameWidth / 2, 0);

    // ================= DOOR ALWAYS OPEN =================
    leftHinge.rotation.y = BABYLON.Tools.ToRadians(70);
    rightHinge.rotation.y = BABYLON.Tools.ToRadians(-70);

    return scene;
};
