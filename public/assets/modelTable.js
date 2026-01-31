export function createScene(engine, canvas) {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.93, 0.93, 0.93);

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2.4,
        6,
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    camera.attachControl(canvas, true);

    // Light
    new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );

    // Material (single color like reference)
    const tableMat = new BABYLON.StandardMaterial("tableMat", scene);
    tableMat.diffuseColor = new BABYLON.Color3(0.89, 0.91, 0.93);

    // Root
    const table = new BABYLON.TransformNode("table", scene);

    // =========================
    // TABLE TOP
    // =========================
    const top = BABYLON.MeshBuilder.CreateCylinder(
        "top",
        {
            diameter: 3,
            height: 0.25,
            tessellation: 18
        },
        scene
    );
    top.position.y = 1.6;
    top.material = tableMat;
    top.parent = table;

    // =========================
    // STEM (NECK)
    // =========================
    const neck = BABYLON.MeshBuilder.CreateCylinder(
        "neck",
        {
            diameter: 0.5,
            height: 0.3,
            tessellation: 12
        },
        scene
    );
    neck.position.y = 1.35;
    neck.material = tableMat;
    neck.parent = table;

    // =========================
    // MAIN PEDESTAL (BALL)
    // =========================
    const pedestalBall = BABYLON.MeshBuilder.CreateSphere(
        "pedestalBall",
        {
            diameter: 1,
            segments: 10
        },
        scene
    );
    pedestalBall.position.y = 0.85;
    pedestalBall.material = tableMat;
    pedestalBall.parent = table;

    // =========================
    // LOWER PEDESTAL RINGS
    // =========================
    function ring(name, diameterTop, diameterBottom, height, y) {
        const r = BABYLON.MeshBuilder.CreateCylinder(
            name,
            {
                diameterTop,
                diameterBottom,
                height,
                tessellation: 16
            },
            scene
        );
        r.position.y = y;
        r.material = tableMat;
        r.parent = table;
    }

    ring("ring1", 1.2, 1.4, 0.2, 0.45);
    ring("ring2", 1.6, 1.8, 0.25, 0.2);

    // =========================
    // BASE
    // =========================
    const base = BABYLON.MeshBuilder.CreateCylinder(
        "base",
        {
            diameterTop: 2,
            diameterBottom: 2.2,
            height: 0.2,
            tessellation: 18
        },
        scene
    );
    base.position.y = 0.05;
    base.material = tableMat;
    base.parent = table;

    return scene;
}
