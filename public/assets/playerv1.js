// Babylon.js Playground-ready (copy/paste)
// Realistic-ish low-poly tux man, unlit, T-pose.
// Hair updated to a QUiff: cylindrical (not dome) top + thin rounded side/back band (connected) + quiff wedge.

export var createScene = function () {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.10, 0.10, 0.12, 1.0);
  scene.shadowsEnabled = false;

  // Camera only (no lights)
  const camera = new BABYLON.ArcRotateCamera(
    "cam",
    -Math.PI / 2,
    Math.PI / 2.15,
    5.4,
    new BABYLON.Vector3(0, 1.15, 0),
    scene
  );
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 3.0;
  camera.upperRadiusLimit = 12.0;
  camera.wheelDeltaPercentage = 0.01;

  // Unlit material helper (visible even without lights)
  function unlit(hex) {
    const m = new BABYLON.StandardMaterial("m_" + hex, scene);
    m.disableLighting = true;
    m.emissiveColor = BABYLON.Color3.FromHexString(hex);
    m.diffuseColor = BABYLON.Color3.Black();
    m.specularColor = BABYLON.Color3.Black();
    return m;
  }

  const MAT_SUIT   = unlit("#141418");
  const MAT_SHIRT  = unlit("#f2f2f2");
  const MAT_SKIN   = unlit("#d8b39a");
  const MAT_BOWTIE = unlit("#22222a");
  const MAT_BTN    = unlit("#cfcfd6");
  const MAT_HAIR   = unlit("#2b241e");

  const rig = new BABYLON.TransformNode("tuxMan_Tpose_realistic_lowpoly", scene);

  // ===== Helpers =====
  function box(name, w, h, d, x, y, z) {
    const b = BABYLON.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    b.position.set(x, y, z);
    b.parent = rig;
    return b;
  }

  function cyl(name, h, dTop, dBot, tess, x, y, z, scaleZ) {
    const c = BABYLON.MeshBuilder.CreateCylinder(
      name,
      { height: h, diameterTop: dTop, diameterBottom: dBot, tessellation: tess },
      scene
    );
    c.position.set(x, y, z);
    if (scaleZ !== undefined) c.scaling.z = scaleZ;
    c.parent = rig;
    return c;
  }

  function sph(name, dia, seg, x, y, z, scaleY, scaleZ) {
    const s = BABYLON.MeshBuilder.CreateSphere(name, { diameter: dia, segments: seg }, scene);
    s.position.set(x, y, z);
    if (scaleY !== undefined) s.scaling.y = scaleY;
    if (scaleZ !== undefined) s.scaling.z = scaleZ;
    s.parent = rig;
    return s;
  }

  function torus(name, diameter, thickness, tess, x, y, z, scaleZ) {
    const t = BABYLON.MeshBuilder.CreateTorus(
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
  const SEG  = 7;

  const shoeH   = 0.10;
  const legH    = 0.98;
  const pelvisH = 0.14;
  const torsoH  = 0.64;
  const neckH   = 0.12;

  const yShoe   = shoeH * 0.5;
  const yLeg    = shoeH + legH * 0.5;
  const yPelvis = shoeH + legH + pelvisH * 0.5;
  const yTorso  = shoeH + legH + pelvisH + torsoH * 0.5;

  const shoulderY = shoeH + legH + pelvisH + torsoH * 0.86;
  const neckY     = shoeH + legH + pelvisH + torsoH + neckH * 0.5;

  const headDia   = 0.34;
  const headY     = shoeH + legH + pelvisH + torsoH + neckH + headDia * 0.48;

  const shoulderHalf = 0.25;
  const hipHalf      = 0.18;

  // Collections by material (for merging)
  const suitMeshes  = [];
  const shirtMeshes = [];
  const skinMeshes  = [];
  const hairMeshes  = [];
  const btnMeshes   = [];
  const bowMeshes   = [];

  // ===== Lower body =====
  suitMeshes.push(cyl("thighShin_L", legH, 0.28, 0.20, TESS, -hipHalf, yLeg, 0.00, 0.85));
  suitMeshes.push(cyl("thighShin_R", legH, 0.28, 0.20, TESS,  hipHalf, yLeg, 0.00, 0.85));
  suitMeshes.push(cyl("pelvis", pelvisH, 0.52, 0.48, TESS, 0.00, yPelvis, 0.00, 0.85));

  const shoeL = box("shoe_L", 0.30, shoeH, 0.42, -hipHalf, yShoe, 0.10);
  shoeL.rotation.x = 0.06;
  suitMeshes.push(shoeL);

  const shoeR = box("shoe_R", 0.30, shoeH, 0.42,  hipHalf, yShoe, 0.10);
  shoeR.rotation.x = 0.06;
  suitMeshes.push(shoeR);

  // ===== Torso (shirt more visible) =====
  const shirtCore = cyl("shirt_core", torsoH, 0.56, 0.48, TESS, 0.00, yTorso, 0.00, 0.70);
  shirtMeshes.push(shirtCore);

  const bib = box("shirt_bib", 0.34, torsoH - 0.06, 0.04, 0.00, yTorso + 0.02, 0.15);
  shirtMeshes.push(bib);

  shirtMeshes.push(box("shirt_peek_L", 0.06, torsoH - 0.10, 0.05, -0.17, yTorso + 0.02, 0.12));
  shirtMeshes.push(box("shirt_peek_R", 0.06, torsoH - 0.10, 0.05,  0.17, yTorso + 0.02, 0.12));

  const jacketShell = cyl("jacket_shell", torsoH + 0.06, 0.60, 0.52, TESS, 0.00, yTorso + 0.01, 0.00, 0.78);
  suitMeshes.push(jacketShell);

  suitMeshes.push(box("jacket_front_L", 0.20, torsoH + 0.04, 0.14, -0.24, yTorso + 0.02, 0.12));
  suitMeshes.push(box("jacket_front_R", 0.20, torsoH + 0.04, 0.14,  0.24, yTorso + 0.02, 0.12));

  const lapelL = box("lapel_L", 0.11, 0.42, 0.06, -0.14, yTorso + 0.18, 0.18);
  lapelL.rotation.z = 0.22;
  suitMeshes.push(lapelL);

  const lapelR = box("lapel_R", 0.11, 0.42, 0.06,  0.14, yTorso + 0.18, 0.18);
  lapelR.rotation.z = -0.22;
  suitMeshes.push(lapelR);

  const collarY = shoeH + legH + pelvisH + torsoH - 0.01;
  const collarL = box("collar_L", 0.14, 0.08, 0.06, -0.07, collarY, 0.16);
  collarL.rotation.z = 0.25;
  shirtMeshes.push(collarL);

  const collarR = box("collar_R", 0.14, 0.08, 0.06,  0.07, collarY, 0.16);
  collarR.rotation.z = -0.25;
  shirtMeshes.push(collarR);

  btnMeshes.push(box("btn1", 0.03, 0.03, 0.01, 0.00, yTorso + 0.12, 0.17));
  btnMeshes.push(box("btn2", 0.03, 0.03, 0.01, 0.00, yTorso + 0.02, 0.17));
  btnMeshes.push(box("btn3", 0.03, 0.03, 0.01, 0.00, yTorso - 0.08, 0.17));

  const bowY = collarY - 0.03;
  bowMeshes.push(box("bow_L",    0.12, 0.06, 0.02, -0.07, bowY, 0.19));
  bowMeshes.push(box("bow_R",    0.12, 0.06, 0.02,  0.07, bowY, 0.19));
  bowMeshes.push(box("bow_knot", 0.04, 0.04, 0.02,  0.00, bowY, 0.19));

  // ===== Head / neck =====
  skinMeshes.push(cyl("neck", neckH, 0.16, 0.18, TESS, 0.00, neckY, 0.03, 0.85));
  skinMeshes.push(sph("head", headDia, SEG, 0.00, headY, 0.02, 1.05, 0.92));
  skinMeshes.push(cyl("jaw", 0.12, 0.26, 0.20, TESS, 0.00, headY - 0.14, 0.05, 0.95));

  // ======================================================
  // HAIR (QUIFF): cylindrical top + thin rounded band (side/back connected) + quiff wedge
  // - Removed the old front strip/hairline block.
  // - Cap is a CYLINDER (not dome).
  // - Side/back are THIN, and connected via a rounded band (torus).
  // ======================================================
  const faceZ = 0.02;

  // Thin rounded band around head (reads as connected sides/back with rounded edges)
  // Keep it thin so it doesn't look bulky.
  //const band = torus(
    //"hair_band",
    //headDia + 0.06, // slightly bigger than head
    //0.045,          // thin band
    //14,             // low-ish poly but still round edges
    //0.00,
    //headY - 0.03,
    //faceZ,
    //0.90            // oval-ish head
  //);
  //hairMeshes.push(band);

  // Cylindrical cap on top (NOT a dome)
  // Height tuned to match the previous overall hair height once combined with the quiff wedge.
  const cap = cyl(
    "hair_cap_cyl",
    0.18,                 // cap height
    headDia + 0.04,       // top diameter
    headDia + 0.04,       // bottom diameter (same -> cylinder)
    8,                    // low poly
    0.00,
    headY + 0.09,
    faceZ,
    0.90
  );
  hairMeshes.push(cap);

  // Quiff wedge (adds the hairstyle character without a separate "front strip")
  // Positioned to overlap the cap and band so everything reads connected.
  const quiff = box("hair_quiff", 0.24, 0.10, 0.18, 0.04, headY + 0.14, faceZ + 0.10);
  quiff.rotation.x = -0.38;
  quiff.rotation.y = 0.10;
  hairMeshes.push(quiff);

  // Optional subtle side taper blocks (very thin) to emphasize an undercut look.
  // They overlap the band slightly, improving the "connected" feel.
  //const sideX = headDia * 0.5 + 0.02;
  //const taperL = box("hair_taper_L", 0.045, 0.12, 0.18, -sideX, headY - 0.04, faceZ + 0.02);
  //const taperR = box("hair_taper_R", 0.045, 0.12, 0.18,  sideX, headY - 0.04, faceZ + 0.02);
  //hairMeshes.push(taperL, taperR);

  // ===== Arms (T-pose) =====
  const sleeveMeshes = [];
  const cuffMeshes   = [];
  const handMeshes   = [];
  const jointMeshes  = [];

  const upperLen = 0.32;
  const foreLen  = 0.30;
  const cuffLen  = 0.05;

  function makeArm(side) {
    const s = side;
    const baseX = s * shoulderHalf;
    const y = shoulderY;
    const z = 0.00;

    const shoulderJoint = sph("shoulder_" + (s < 0 ? "L" : "R"), 0.14, SEG, baseX, y, z, 1.0, 1.0);
    jointMeshes.push(shoulderJoint);

    const upper = cyl(
      "upperSleeve_" + (s < 0 ? "L" : "R"),
      upperLen,
      0.18,
      0.16,
      TESS,
      baseX + s * (upperLen * 0.5 + 0.02),
      y,
      z,
      0.90
    );
    upper.rotation.z = Math.PI / 2;
    sleeveMeshes.push(upper);

    const elbowX = baseX + s * (upperLen + 0.05);
    const elbow = sph("elbow_" + (s < 0 ? "L" : "R"), 0.11, SEG, elbowX, y, z, 1.0, 1.0);
    jointMeshes.push(elbow);

    const fore = cyl(
      "foreSleeve_" + (s < 0 ? "L" : "R"),
      foreLen,
      0.16,
      0.14,
      TESS,
      baseX + s * (upperLen + foreLen * 0.5 + 0.06),
      y,
      z,
      0.90
    );
    fore.rotation.z = Math.PI / 2;
    sleeveMeshes.push(fore);

    const cuff = cyl(
      "cuff_" + (s < 0 ? "L" : "R"),
      cuffLen,
      0.15,
      0.15,
      TESS,
      baseX + s * (upperLen + foreLen + cuffLen * 0.5 + 0.08),
      y,
      z,
      0.95
    );
    cuff.rotation.z = Math.PI / 2;
    cuffMeshes.push(cuff);

    const hand = sph(
      "hand_" + (s < 0 ? "L" : "R"),
      0.13,
      SEG,
      baseX + s * (upperLen + foreLen + cuffLen + 0.13),
      y - 0.01,
      z,
      0.85,
      0.85
    );
    handMeshes.push(hand);
  }

  makeArm(-1);
  makeArm( 1);

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
  function mergeSameMaterial(meshes, name, mat) {
    const merged = BABYLON.Mesh.MergeMeshes(meshes, true, true, undefined, false, false);
    if (merged) {
      merged.name = name;
      merged.material = mat;
      merged.parent = rig;
      merged.freezeWorldMatrix();
    }
    return merged;
  }

  mergeSameMaterial(suitMeshes.concat(sleeveMeshes, jointMeshes), "suit_merged", MAT_SUIT);
  mergeSameMaterial(shirtMeshes.concat(cuffMeshes), "shirt_merged", MAT_SHIRT);
  mergeSameMaterial(btnMeshes, "buttons_merged", MAT_BTN);
  mergeSameMaterial(bowMeshes, "bowtie_merged", MAT_BOWTIE);
  mergeSameMaterial(hairMeshes, "hair_merged", MAT_HAIR);
  mergeSameMaterial(skinMeshes.concat(handMeshes), "skin_merged", MAT_SKIN);

  rig.position.y = 0.0;
  return scene;
};
