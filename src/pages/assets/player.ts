import { Scene, Vector3, MeshBuilder, Color3, StandardMaterial, TransformNode, Mesh } from '@babylonjs/core';

export function createPlayer(scene: Scene, position: Vector3, scale: number = 1, groundOffset: number = 0): any {
    // Unlit material helper (visible even without lights)
    function unlit(hex: string) {
        const m = new StandardMaterial("m_" + hex, scene);
        m.disableLighting = true;
        m.emissiveColor = Color3.FromHexString(hex);
        m.diffuseColor = Color3.Black();
        m.specularColor = Color3.Black();
        return m;
    }

    const MAT_SUIT = unlit("#141418");
    const MAT_SHIRT = unlit("#f2f2f2");
    const MAT_SKIN = unlit("#d8b39a");
    const MAT_BOWTIE = unlit("#22222a");
    const MAT_BTN = unlit("#cfcfd6");
    const MAT_HAIR = unlit("#2b241e");

    const rig = new TransformNode("tuxMan_Tpose_realistic_lowpoly", scene);

    // ===== Helpers =====
    function box(name: string, w: number, h: number, d: number, x: number, y: number, z: number) {
        const b = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
        b.position.set(x, y, z);
        b.parent = rig;
        return b;
    }

    function cyl(name: string, h: number, dTop: number, dBot: number, tess: number, x: number, y: number, z: number, scaleZ?: number) {
        const c = MeshBuilder.CreateCylinder(
            name,
            { height: h, diameterTop: dTop, diameterBottom: dBot, tessellation: tess },
            scene
        );
        c.position.set(x, y, z);
        if (scaleZ !== undefined) c.scaling.z = scaleZ;
        c.parent = rig;
        return c;
    }

    function sph(name: string, dia: number, seg: number, x: number, y: number, z: number, scaleY?: number, scaleZ?: number) {
        const s = MeshBuilder.CreateSphere(name, { diameter: dia, segments: seg }, scene);
        s.position.set(x, y, z);
        if (scaleY !== undefined) s.scaling.y = scaleY;
        if (scaleZ !== undefined) s.scaling.z = scaleZ;
        s.parent = rig;
        return s;
    }

    function torus(name: string, diameter: number, thickness: number, tess: number, x: number, y: number, z: number, scaleZ?: number) {
        const t = MeshBuilder.CreateTorus(
            name,
            { diameter, thickness, tessellation: tess },
            scene
        );
        t.position.set(x, y, z);
        if (scaleZ !== undefined) t.scaling.z = scaleZ;
        t.parent = rig;
        return t;
    }

    // ===== Proportions =====
    const TESS = 8;
    const SEG = 7;

    const shoeH = 0.10 * scale;
    const legH = 0.98 * scale;
    const pelvisH = 0.14 * scale;
    const torsoH = 0.64 * scale;
    const neckH = 0.12 * scale;

    const yShoe = shoeH * 0.5;
    const yLeg = shoeH + legH * 0.5;
    const yPelvis = shoeH + legH + pelvisH * 0.5;
    const yTorso = shoeH + legH + pelvisH + torsoH * 0.5;

    const shoulderY = shoeH + legH + pelvisH + torsoH * 0.86;
    const neckY = shoeH + legH + pelvisH + torsoH + neckH * 0.5;

    const headDia = 0.34 * scale;
    const headY = shoeH + legH + pelvisH + torsoH + neckH + headDia * 0.48;

    const shoulderHalf = 0.25 * scale;
    const hipHalf = 0.18 * scale;

    // Collections by material (for merging)
    const suitMeshes: any[] = [];
    const shirtMeshes: any[] = [];
    const skinMeshes: any[] = [];
    const hairMeshes: any[] = [];
    const btnMeshes: any[] = [];
    const bowMeshes: any[] = [];

    // ===== Lower body =====
    suitMeshes.push(cyl("thighShin_L", legH, 0.28 * scale, 0.20 * scale, TESS, -hipHalf, yLeg, 0.00, 0.85));
    suitMeshes.push(cyl("thighShin_R", legH, 0.28 * scale, 0.20 * scale, TESS, hipHalf, yLeg, 0.00, 0.85));
    suitMeshes.push(cyl("pelvis", pelvisH, 0.52 * scale, 0.48 * scale, TESS, 0.00, yPelvis, 0.00, 0.85));

    const shoeL = box("shoe_L", 0.30 * scale, shoeH, 0.42 * scale, -hipHalf, yShoe, 0.10 * scale);
    shoeL.rotation.x = 0.06;
    suitMeshes.push(shoeL);

    const shoeR = box("shoe_R", 0.30 * scale, shoeH, 0.42 * scale, hipHalf, yShoe, 0.10 * scale);
    shoeR.rotation.x = 0.06;
    suitMeshes.push(shoeR);

    // ===== Torso (shirt more visible) =====
    const shirtCore = cyl("shirt_core", torsoH, 0.56 * scale, 0.48 * scale, TESS, 0.00, yTorso, 0.00, 0.70);
    shirtMeshes.push(shirtCore);

    const bib = box("shirt_bib", 0.34 * scale, torsoH - 0.06 * scale, 0.04 * scale, 0.00, yTorso + 0.02 * scale, 0.15 * scale);
    shirtMeshes.push(bib);

    shirtMeshes.push(box("shirt_peek_L", 0.06 * scale, torsoH - 0.10 * scale, 0.05 * scale, -0.17 * scale, yTorso + 0.02 * scale, 0.12 * scale));
    shirtMeshes.push(box("shirt_peek_R", 0.06 * scale, torsoH - 0.10 * scale, 0.05 * scale, 0.17 * scale, yTorso + 0.02 * scale, 0.12 * scale));

    const jacketShell = cyl("jacket_shell", torsoH + 0.06 * scale, 0.60 * scale, 0.52 * scale, TESS, 0.00, yTorso + 0.01 * scale, 0.00, 0.78);
    suitMeshes.push(jacketShell);

    suitMeshes.push(box("jacket_front_L", 0.20 * scale, torsoH + 0.04 * scale, 0.14 * scale, -0.24 * scale, yTorso + 0.02 * scale, 0.12 * scale));
    suitMeshes.push(box("jacket_front_R", 0.20 * scale, torsoH + 0.04 * scale, 0.14 * scale, 0.24 * scale, yTorso + 0.02 * scale, 0.12 * scale));

    const lapelL = box("lapel_L", 0.11 * scale, 0.42 * scale, 0.06 * scale, -0.14 * scale, yTorso + 0.18 * scale, 0.18 * scale);
    lapelL.rotation.z = 0.22;
    suitMeshes.push(lapelL);

    const lapelR = box("lapel_R", 0.11 * scale, 0.42 * scale, 0.06 * scale, 0.14 * scale, yTorso + 0.18 * scale, 0.18 * scale);
    lapelR.rotation.z = -0.22;
    suitMeshes.push(lapelR);

    const collarY = shoeH + legH + pelvisH + torsoH - 0.01 * scale;
    const collarL = box("collar_L", 0.14 * scale, 0.08 * scale, 0.06 * scale, -0.07 * scale, collarY, 0.16 * scale);
    collarL.rotation.z = 0.25;
    shirtMeshes.push(collarL);

    const collarR = box("collar_R", 0.14 * scale, 0.08 * scale, 0.06 * scale, 0.07 * scale, collarY, 0.16 * scale);
    collarR.rotation.z = -0.25;
    shirtMeshes.push(collarR);

    btnMeshes.push(box("btn1", 0.03 * scale, 0.03 * scale, 0.01 * scale, 0.00, yTorso + 0.12 * scale, 0.17 * scale));
    btnMeshes.push(box("btn2", 0.03 * scale, 0.03 * scale, 0.01 * scale, 0.00, yTorso + 0.02 * scale, 0.17 * scale));
    btnMeshes.push(box("btn3", 0.03 * scale, 0.03 * scale, 0.01 * scale, 0.00, yTorso - 0.08 * scale, 0.17 * scale));

    const bowY = collarY - 0.03 * scale;
    bowMeshes.push(box("bow_L", 0.12 * scale, 0.06 * scale, 0.02 * scale, -0.07 * scale, bowY, 0.19 * scale));
    bowMeshes.push(box("bow_R", 0.12 * scale, 0.06 * scale, 0.02 * scale, 0.07 * scale, bowY, 0.19 * scale));
    bowMeshes.push(box("bow_knot", 0.04 * scale, 0.04 * scale, 0.02 * scale, 0.00, bowY, 0.19 * scale));

    // ===== Head / neck =====
    skinMeshes.push(cyl("neck", neckH, 0.16 * scale, 0.18 * scale, TESS, 0.00, neckY, 0.03 * scale, 0.85));
    skinMeshes.push(sph("head", headDia, SEG, 0.00, headY, 0.02 * scale, 1.05, 0.92));
    skinMeshes.push(cyl("jaw", 0.12 * scale, 0.26 * scale, 0.20 * scale, TESS, 0.00, headY - 0.14 * scale, 0.05 * scale, 0.95));

    // ======================================================
    // HAIR (QUIFF): cylindrical top + thin rounded band (side/back connected) + quiff wedge
    // ======================================================
    const faceZ = 0.02 * scale;

    // Cylindrical cap on top (NOT a dome)
    const cap = cyl(
        "hair_cap_cyl",
        0.18 * scale,
        headDia + 0.04 * scale,
        headDia + 0.04 * scale,
        8,
        0.00,
        headY + 0.09 * scale,
        faceZ,
        0.90
    );
    hairMeshes.push(cap);

    // Quiff wedge
    const quiff = box("hair_quiff", 0.24 * scale, 0.10 * scale, 0.18 * scale, 0.04 * scale, headY + 0.14 * scale, faceZ + 0.10 * scale);
    quiff.rotation.x = -0.38;
    quiff.rotation.y = 0.10;
    hairMeshes.push(quiff);

    // ===== Arms (T-pose) =====
    const sleeveMeshes: any[] = [];
    const cuffMeshes: any[] = [];
    const handMeshes: any[] = [];
    const jointMeshes: any[] = [];

    const upperLen = 0.32 * scale;
    const foreLen = 0.30 * scale;
    const cuffLen = 0.05 * scale;

    function makeArm(side: number) {
        const s = side;
        const baseX = s * shoulderHalf;
        const y = shoulderY;
        const z = 0.00;

        const shoulderJoint = sph("shoulder_" + (s < 0 ? "L" : "R"), 0.14 * scale, SEG, baseX, y, z, 1.0, 1.0);
        jointMeshes.push(shoulderJoint);

        const upper = cyl(
            "upperSleeve_" + (s < 0 ? "L" : "R"),
            upperLen,
            0.18 * scale,
            0.16 * scale,
            TESS,
            baseX + s * (upperLen * 0.5 + 0.02 * scale),
            y,
            z,
            0.90
        );
        upper.rotation.z = Math.PI / 2;
        sleeveMeshes.push(upper);

        const elbowX = baseX + s * (upperLen + 0.05 * scale);
        const elbow = sph("elbow_" + (s < 0 ? "L" : "R"), 0.11 * scale, SEG, elbowX, y, z, 1.0, 1.0);
        jointMeshes.push(elbow);

        const fore = cyl(
            "foreSleeve_" + (s < 0 ? "L" : "R"),
            foreLen,
            0.16 * scale,
            0.14 * scale,
            TESS,
            baseX + s * (upperLen + foreLen * 0.5 + 0.06 * scale),
            y,
            z,
            0.90
        );
        fore.rotation.z = Math.PI / 2;
        sleeveMeshes.push(fore);

        const cuff = cyl(
            "cuff_" + (s < 0 ? "L" : "R"),
            cuffLen,
            0.15 * scale,
            0.15 * scale,
            TESS,
            baseX + s * (upperLen + foreLen + cuffLen * 0.5 + 0.08 * scale),
            y,
            z,
            0.95
        );
        cuff.rotation.z = Math.PI / 2;
        cuffMeshes.push(cuff);

        const hand = sph(
            "hand_" + (s < 0 ? "L" : "R"),
            0.13 * scale,
            SEG,
            baseX + s * (upperLen + foreLen + cuffLen + 0.13 * scale),
            y - 0.01 * scale,
            z,
            0.85,
            0.85
        );
        handMeshes.push(hand);
    }

    makeArm(-1);
    makeArm(1);

    // ===== Materials =====
    suitMeshes.forEach(m => (m.material = MAT_SUIT));
    sleeveMeshes.forEach(m => (m.material = MAT_SUIT));
    jointMeshes.forEach(m => (m.material = MAT_SUIT));

    shirtMeshes.forEach(m => (m.material = MAT_SHIRT));
    cuffMeshes.forEach(m => (m.material = MAT_SHIRT));

    skinMeshes.forEach(m => (m.material = MAT_SKIN));
    handMeshes.forEach(m => (m.material = MAT_SKIN));

    hairMeshes.forEach(m => (m.material = MAT_HAIR));
    btnMeshes.forEach(m => (m.material = MAT_BTN));
    bowMeshes.forEach(m => (m.material = MAT_BOWTIE));

    // ===== Merge by material (fewer draw calls) =====
    function mergeSameMaterial(meshes: any[], name: string, mat: StandardMaterial) {
        const merged = Mesh.MergeMeshes(meshes, true, true, undefined, false, false);
        if (merged) {
            merged.name = name;
            merged.material = mat;
            merged.parent = rig;
        }
        return merged;
    }

    mergeSameMaterial(suitMeshes.concat(sleeveMeshes, jointMeshes), "suit_merged", MAT_SUIT);
    mergeSameMaterial(shirtMeshes.concat(cuffMeshes), "shirt_merged", MAT_SHIRT);
    mergeSameMaterial(btnMeshes, "buttons_merged", MAT_BTN);
    mergeSameMaterial(bowMeshes, "bowtie_merged", MAT_BOWTIE);
    mergeSameMaterial(hairMeshes, "hair_merged", MAT_HAIR);
    mergeSameMaterial(skinMeshes.concat(handMeshes), "skin_merged", MAT_SKIN);

    // Position the rig
    rig.position.copyFrom(position);
    rig.position.y += groundOffset;

    // Store materials for later disposal
    (rig as any).playerMaterials = [MAT_SUIT, MAT_SHIRT, MAT_SKIN, MAT_BOWTIE, MAT_BTN, MAT_HAIR];

    return rig;
}
