// Babylon.js Playground-ready (copy/paste)
// Low-poly WOMAN in a DRESS, realistic-ish proportions, T-pose
// Unlit: no lights, no shadows. Procedural-only (PWA-friendly).
// White shoes + flush seams.

export var createScene = function () {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.10, 0.10, 0.12, 1.0);
  scene.shadowsEnabled = false;

  const camera = new BABYLON.ArcRotateCamera(
    "cam",
    -Math.PI / 2,
    Math.PI / 2.15,
    6.0,
    new BABYLON.Vector3(0, 1.15, 0),
    scene
  );
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 3.0;
  camera.upperRadiusLimit = 13.0;
  camera.wheelDeltaPercentage = 0.01;

  function unlit(name, hex) {
    const m = new BABYLON.StandardMaterial(name, scene);
    m.disableLighting = true;
    m.emissiveColor = BABYLON.Color3.FromHexString(hex);
    m.diffuseColor = BABYLON.Color3.Black();
    m.specularColor = BABYLON.Color3.Black();
    return m;
  }

  // ===== Dress color variants (make 4 separate files by changing VARIANT) =====
  const VARIANT = "purple"; // "red" | "yellow" | "purple" | "white"

  const DRESS_VARIANTS = {
    red:    { main: "#c64545", accent: "#8f2b2b" },
    yellow: { main: "#e0b93a", accent: "#b8841f" },
    purple: { main: "#7a4cc6", accent: "#55358e" },
    white:  { main: "#f1f2f5", accent: "#cfd3da" },
  };

  const palette = DRESS_VARIANTS[VARIANT] || DRESS_VARIANTS.red;

  // Palette
  const MAT_SKIN    = unlit("skin",          "#d6b09a");
  const MAT_HAIR    = unlit("hair",          "#2a201a");
  const MAT_DRESS   = unlit("dress_" + VARIANT,  palette.main);
  const MAT_DRESS2  = unlit("dress2_" + VARIANT, palette.accent);
  const MAT_SHOES   = unlit("shoes",         "#f1f6ff"); // WHITE shoes

  const rig = new BABYLON.TransformNode("woman_" + VARIANT + "_dress_Tpose", scene);

  // Helpers
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

  // Low-poly knobs
  const TESS = 9;
  const SEG  = 7;

  // Proportions
  const shoeH = 0.095;
  const legH  = 1.05;
  const pelH  = 0.12;
  const neckH = 0.11;
  const headDia = 0.30;

  // Style proportions
  const hipHalf = 0.15;
  const shoulderHalf = 0.25;

  const yShoe = shoeH * 0.5;

  // Anchors
  const hipY   = shoeH + legH; // top of legs
  const waistY = hipY + pelH;  // waistline/top of pelvis band

  // Groups for merges
  const skinMeshes   = [];
  const hairMeshes   = [];
  const dressMeshes  = [];
  const dress2Meshes = [];
  const shoeMeshes   = [];

  // =========================
  // LEGS (skin)
  // =========================
  const thighH = 0.52;
  const calfH  = legH - thighH;

  const calfCenterY  = shoeH + calfH * 0.5;
  const thighCenterY = shoeH + calfH + thighH * 0.5;

  skinMeshes.push(cyl("thigh_L", thighH, 0.22, 0.19, TESS, -hipHalf, thighCenterY, 0.00, 0.85));
  skinMeshes.push(cyl("thigh_R", thighH, 0.22, 0.19, TESS,  hipHalf, thighCenterY, 0.00, 0.85));

  skinMeshes.push(cyl("calf_L", calfH, 0.18, 0.14, TESS, -hipHalf, calfCenterY, 0.00, 0.85));
  skinMeshes.push(cyl("calf_R", calfH, 0.18, 0.14, TESS,  hipHalf, calfCenterY, 0.00, 0.85));

  // =========================
  // SHOES (WHITE)
  // =========================
  const shoeL = box("shoe_L", 0.22, shoeH, 0.34, -hipHalf, yShoe, 0.08);
  shoeL.rotation.x = 0.05;
  shoeMeshes.push(shoeL);

  const shoeR = box("shoe_R", 0.22, shoeH, 0.34,  hipHalf, yShoe, 0.08);
  shoeR.rotation.x = 0.05;
  shoeMeshes.push(shoeR);

  shoeMeshes.push(box("heel_L", 0.06, 0.05, 0.08, -hipHalf, 0.025, -0.06));
  shoeMeshes.push(box("heel_R", 0.06, 0.05, 0.08,  hipHalf, 0.025, -0.06));

  // =========================
  // DRESS (anchored correctly)
  // =========================
  const pelvisCenterY = hipY + pelH * 0.5;
  dress2Meshes.push(cyl("waist_band", pelH, 0.44, 0.40, TESS, 0.00, pelvisCenterY, 0.00, 0.82));

  // Bodice
  const bodH = 0.34;
  const bodiceCenterY = waistY + bodH * 0.5 + 0.01;
  const bodiceTopY = bodiceCenterY + bodH * 0.5;

  dressMeshes.push(cyl("bodice", bodH, 0.46, 0.38, TESS, 0.00, bodiceCenterY, 0.00, 0.76));

  // V-neck inset
  const vneck = box("vneck_inset", 0.18, 0.14, 0.03, 0.00, bodiceCenterY + 0.12, 0.14);
  vneck.rotation.x = 0.15;
  dress2Meshes.push(vneck);

  // Straps
  const strapH = 0.18;
  const strapY = bodiceTopY + strapH * 0.5 - 0.02;
  dress2Meshes.push(box("strap_L", 0.05, strapH, 0.04, -0.12, strapY, 0.10));
  dress2Meshes.push(box("strap_R", 0.05, strapH, 0.04,  0.12, strapY, 0.10));

  // Skirt
  const skirtH = 0.56;
  const skirtCenterY = waistY - skirtH * 0.5 + 0.02;
  dressMeshes.push(cyl("skirt", skirtH, 0.40, 0.78, TESS, 0.00, skirtCenterY, 0.00, 0.86));

  // Hem + pleats
  const hemCenterY = (skirtCenterY - skirtH * 0.5) + 0.03;
  dress2Meshes.push(cyl("hem_ring", 0.06, 0.76, 0.80, TESS, 0.00, hemCenterY, 0.00, 0.86));

  const pleatH = skirtH * 0.55;
  dress2Meshes.push(box("pleat_L", 0.10, pleatH, 0.05, -0.10, skirtCenterY, 0.20));
  dress2Meshes.push(box("pleat_R", 0.10, pleatH, 0.05,  0.10, skirtCenterY, 0.20));

  // =========================
  // SKIN UPPER CHEST + SHOULDERS + COLLARBONE (FLUSH seam)
  // =========================
  const upperChestH = 0.18;

  const upperChestCenterY = bodiceTopY + upperChestH * 0.5;
  const upperChestTopY = upperChestCenterY + upperChestH * 0.5;

  skinMeshes.push(cyl("upper_chest", upperChestH, 0.44, 0.42, TESS, 0.00, upperChestCenterY, 0.00, 0.78));

  const shoulderY = upperChestCenterY + 0.05;
  skinMeshes.push(sph("shoulder_skin_L", 0.13, SEG, -shoulderHalf, shoulderY, 0.00, 1.0, 1.0));
  skinMeshes.push(sph("shoulder_skin_R", 0.13, SEG,  shoulderHalf, shoulderY, 0.00, 1.0, 1.0));

  const clavY = upperChestCenterY + 0.03;
  const clavL = box("clav_L", 0.18, 0.04, 0.04, -0.10, clavY, 0.12);
  clavL.rotation.z = 0.18;
  skinMeshes.push(clavL);

  const clavR = box("clav_R", 0.18, 0.04, 0.04,  0.10, clavY, 0.12);
  clavR.rotation.z = -0.18;
  skinMeshes.push(clavR);

  // =========================
  // NECK + HEAD (FLUSH seam)
  // =========================
  const neckCenterY = upperChestTopY + neckH * 0.5;
  const headCenterY = (neckCenterY + neckH * 0.5) + headDia * 0.48;

  skinMeshes.push(cyl("neck", neckH, 0.13, 0.15, TESS, 0.00, neckCenterY, 0.03, 0.85));
  skinMeshes.push(sph("head", headDia, SEG, 0.00, headCenterY, 0.02, 1.06, 0.92));
  skinMeshes.push(box("nose", 0.040, 0.045, 0.045, 0.00, headCenterY + 0.00, 0.145));

  // =========================
  // HAIR
  // =========================
  hairMeshes.push(cyl("hair_top", 0.13, headDia + 0.02, headDia + 0.02, TESS, 0.00, headCenterY + 0.095, 0.02, 0.92));
  hairMeshes.push(box("hair_side_L", 0.07, 0.19, 0.15, -(headDia * 0.5 + 0.015), headCenterY - 0.01, 0.03));
  hairMeshes.push(box("hair_side_R", 0.07, 0.19, 0.15,  (headDia * 0.5 + 0.015), headCenterY - 0.01, 0.03));
  hairMeshes.push(box("hair_back", 0.26, 0.18, 0.12, 0.00, headCenterY - 0.02, -0.10));
  hairMeshes.push(sph("hair_bun", 0.14, SEG, 0.00, headCenterY - 0.04, -0.20, 0.95, 0.95));

  // =========================
  // ARMS (T-pose) anchored to skin shoulders
  // =========================
  const armSkin = [];
  const upperLen = 0.32;
  const foreLen  = 0.30;

  function makeArm(side) {
    const s = side;
    const baseX = s * shoulderHalf;
    const y = shoulderY;
    const z = 0.00;

    const upper = cyl("upperArm_" + (s < 0 ? "L" : "R"), upperLen, 0.11, 0.10, TESS,
      baseX + s * (upperLen * 0.5 + 0.02), y, z, 0.90);
    upper.rotation.z = Math.PI / 2;
    armSkin.push(upper);

    const fore = cyl("foreArm_" + (s < 0 ? "L" : "R"), foreLen, 0.10, 0.09, TESS,
      baseX + s * (upperLen + foreLen * 0.5 + 0.06), y, z, 0.90);
    fore.rotation.z = Math.PI / 2;
    armSkin.push(fore);

    const palm = box("palm_" + (s < 0 ? "L" : "R"), 0.10, 0.06, 0.10,
      baseX + s * (upperLen + foreLen + 0.13), y - 0.01, z);
    armSkin.push(palm);

    const f1 = box("finger1_" + (s < 0 ? "L" : "R"), 0.08, 0.025, 0.045,
      baseX + s * (upperLen + foreLen + 0.19), y + 0.015, z + 0.03);
    f1.rotation.y = s * 0.22;
    armSkin.push(f1);

    const f2 = box("finger2_" + (s < 0 ? "L" : "R"), 0.08, 0.025, 0.045,
      baseX + s * (upperLen + foreLen + 0.19), y - 0.005, z - 0.03);
    f2.rotation.y = -s * 0.16;
    armSkin.push(f2);
  }

  makeArm(-1);
  makeArm(1);

  // =========================
  // MATERIALS
  // =========================
  skinMeshes.forEach(m => (m.material = MAT_SKIN));
  armSkin.forEach(m => (m.material = MAT_SKIN));
  hairMeshes.forEach(m => (m.material = MAT_HAIR));

  dressMeshes.forEach(m => (m.material = MAT_DRESS));
  dress2Meshes.forEach(m => (m.material = MAT_DRESS2));
  shoeMeshes.forEach(m => (m.material = MAT_SHOES));

  // =========================
  // MERGE BY MATERIAL
  // =========================
  function merge(meshes, name, mat) {
    const merged = BABYLON.Mesh.MergeMeshes(meshes, true, true, undefined, false, false);
    if (merged) {
      merged.name = name;
      merged.material = mat;
      merged.parent = rig;
      merged.freezeWorldMatrix();
    }
    return merged;
  }

  merge(skinMeshes.concat(armSkin), "skin_merged", MAT_SKIN);
  merge(hairMeshes, "hair_merged", MAT_HAIR);
  merge(dressMeshes, "dress_merged", MAT_DRESS);
  merge(dress2Meshes, "dressAccents_merged", MAT_DRESS2);
  merge(shoeMeshes, "shoes_merged", MAT_SHOES);

  rig.position.y = 0.0;
  return scene;
};
