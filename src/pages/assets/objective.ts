import { Scene, MeshBuilder, Color3, StandardMaterial, Vector3, TransformNode } from '@babylonjs/core';

export function createObjective(scene: Scene, position: Vector3, scale: number = 1, groundOffset: number = 0): any {
    // Material for table (shiny grey)
    const tableMat = new StandardMaterial("tableMat", scene);
    tableMat.diffuseColor = new Color3(0.6, 0.6, 0.6); // Grey
    tableMat.specularColor = new Color3(1, 1, 1); // Bright white specular
    tableMat.specularPower = 64; // High specularity for glossy appearance
    tableMat.ambientColor = new Color3(0.2, 0.2, 0.2); // Grey ambient

    // Material for blue circle on top (shiny blue)
    const blueMat = new StandardMaterial("blueMat", scene);
    blueMat.diffuseColor = new Color3(0, 0.5, 1); // Blue
    blueMat.specularColor = new Color3(1, 1, 1); // Bright white specular
    blueMat.specularPower = 64; // High specularity for glossy appearance
    blueMat.ambientColor = new Color3(0, 0.15, 0.3); // Blue ambient

    // Root
    const table = new TransformNode("table", scene);

    // =========================
    // TABLE TOP
    // =========================
    const top = MeshBuilder.CreateCylinder(
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
    const neck = MeshBuilder.CreateCylinder(
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
    const pedestalBall = MeshBuilder.CreateSphere(
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
    function ring(name: string, diameterTop: number, diameterBottom: number, height: number, y: number) {
        const r = MeshBuilder.CreateCylinder(
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
    const base = MeshBuilder.CreateCylinder(
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

    // =========================
    // BLUE CIRCLE ON TOP
    // =========================
    const blueCircle = MeshBuilder.CreateSphere(
        "blueCircle",
        {
            diameter: 0.8,
            segments: 16
        },
        scene
    );
    blueCircle.position.y = 1.85; // On top of the table
    blueCircle.material = blueMat;
    blueCircle.parent = table;

    table.scaling = new Vector3(scale, scale, scale);
    table.position = position;
    table.position.y += groundOffset;
    (table as any).objectiveMaterial = tableMat; // Store for later disposal
    (table as any).blueMaterial = blueMat; // Store blue material for later disposal
    (table as any).allMeshes = [top, neck, pedestalBall, blueCircle]; // Store all child meshes for disposal

    return table;
}
