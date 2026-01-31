import { Scene, MeshBuilder, StandardMaterial, Color3, TransformNode, Mesh } from '@babylonjs/core';

/**
 * Creates a reusable unlit material helper
 */
function createUnlitMaterial(name: string, hexColor: string, scene: Scene): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.disableLighting = true;
  material.emissiveColor = Color3.FromHexString(hexColor);
  material.diffuseColor = Color3.Black();
  material.specularColor = Color3.Black();
  return material;
}

/**
 * Creates the male character in an olive tuxedo
 */
export function createMaleOlive(scene: Scene, scale: number = 1): TransformNode {
  const MAT_SUIT = createUnlitMaterial('suit_olive', '#3f4a2c', scene);
  const MAT_SHIRT = createUnlitMaterial('shirt', '#f2f2f2', scene);
  const MAT_SKIN = createUnlitMaterial('skin', '#d8b39a', scene);
  const MAT_BOWTIE = createUnlitMaterial('bowtie', '#22222a', scene);
  const MAT_BTN = createUnlitMaterial('btn', '#cfcfd6', scene);
  const MAT_HAIR = createUnlitMaterial('hair', '#2b241e', scene);

  const rig = new TransformNode('tuxMan_olive', scene);

  function box(name: string, w: number, h: number, d: number, x: number, y: number, z: number) {
    const b = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    b.position.set(x, y, z);
    b.parent = rig;
    return b;
  }

  function cyl(name: string, h: number, dTop: number, dBot: number, tess: number, x: number, y: number, z: number, scaleZ?: number) {
    const c = MeshBuilder.CreateCylinder(name, { height: h, diameterTop: dTop, diameterBottom: dBot, tessellation: tess }, scene);
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

  const TESS = 8;
  const SEG = 7;

  const shoeH = 0.1 * scale;
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

  const suitMeshes: Mesh[] = [];
  const shirtMeshes: Mesh[] = [];
  const skinMeshes: Mesh[] = [];
  const hairMeshes: Mesh[] = [];
  const btnMeshes: Mesh[] = [];
  const bowMeshes: Mesh[] = [];

  suitMeshes.push(cyl('thighShin_L', legH, 0.28 * scale, 0.2 * scale, TESS, -hipHalf, yLeg, 0, 0.85));
  suitMeshes.push(cyl('thighShin_R', legH, 0.28 * scale, 0.2 * scale, TESS, hipHalf, yLeg, 0, 0.85));
  suitMeshes.push(cyl('pelvis', pelvisH, 0.52 * scale, 0.48 * scale, TESS, 0, yPelvis, 0, 0.85));

  const shoeL = box('shoe_L', 0.3 * scale, shoeH, 0.42 * scale, -hipHalf, yShoe, 0.1 * scale);
  shoeL.rotation.x = 0.06;
  suitMeshes.push(shoeL);

  const shoeR = box('shoe_R', 0.3 * scale, shoeH, 0.42 * scale, hipHalf, yShoe, 0.1 * scale);
  shoeR.rotation.x = 0.06;
  suitMeshes.push(shoeR);

  shirtMeshes.push(cyl('shirt_core', torsoH, 0.56 * scale, 0.48 * scale, TESS, 0, yTorso, 0, 0.7));
  shirtMeshes.push(box('shirt_bib', 0.34 * scale, torsoH - 0.06 * scale, 0.04 * scale, 0, yTorso + 0.02 * scale, 0.15 * scale));
  shirtMeshes.push(box('shirt_peek_L', 0.06 * scale, torsoH - 0.1 * scale, 0.05 * scale, -0.17 * scale, yTorso + 0.02 * scale, 0.12 * scale));
  shirtMeshes.push(box('shirt_peek_R', 0.06 * scale, torsoH - 0.1 * scale, 0.05 * scale, 0.17 * scale, yTorso + 0.02 * scale, 0.12 * scale));

  suitMeshes.push(cyl('jacket_shell', torsoH + 0.06 * scale, 0.6 * scale, 0.52 * scale, TESS, 0, yTorso + 0.01 * scale, 0, 0.78));
  suitMeshes.push(box('jacket_front_L', 0.2 * scale, torsoH + 0.04 * scale, 0.14 * scale, -0.24 * scale, yTorso + 0.02 * scale, 0.12 * scale));
  suitMeshes.push(box('jacket_front_R', 0.2 * scale, torsoH + 0.04 * scale, 0.14 * scale, 0.24 * scale, yTorso + 0.02 * scale, 0.12 * scale));

  const lapelL = box('lapel_L', 0.11 * scale, 0.42 * scale, 0.06 * scale, -0.14 * scale, yTorso + 0.18 * scale, 0.18 * scale);
  lapelL.rotation.z = 0.22;
  suitMeshes.push(lapelL);

  const lapelR = box('lapel_R', 0.11 * scale, 0.42 * scale, 0.06 * scale, 0.14 * scale, yTorso + 0.18 * scale, 0.18 * scale);
  lapelR.rotation.z = -0.22;
  suitMeshes.push(lapelR);

  const collarY = shoeH + legH + pelvisH + torsoH - 0.01 * scale;
  const collarL = box('collar_L', 0.14 * scale, 0.08 * scale, 0.06 * scale, -0.07 * scale, collarY, 0.16 * scale);
  collarL.rotation.z = 0.25;
  shirtMeshes.push(collarL);

  const collarR = box('collar_R', 0.14 * scale, 0.08 * scale, 0.06 * scale, 0.07 * scale, collarY, 0.16 * scale);
  collarR.rotation.z = -0.25;
  shirtMeshes.push(collarR);

  btnMeshes.push(box('btn1', 0.03 * scale, 0.03 * scale, 0.01 * scale, 0, yTorso + 0.12 * scale, 0.17 * scale));
  btnMeshes.push(box('btn2', 0.03 * scale, 0.03 * scale, 0.01 * scale, 0, yTorso + 0.02 * scale, 0.17 * scale));
  btnMeshes.push(box('btn3', 0.03 * scale, 0.03 * scale, 0.01 * scale, 0, yTorso - 0.08 * scale, 0.17 * scale));

  const bowY = collarY - 0.03 * scale;
  bowMeshes.push(box('bow_L', 0.12 * scale, 0.06 * scale, 0.02 * scale, -0.07 * scale, bowY, 0.19 * scale));
  bowMeshes.push(box('bow_R', 0.12 * scale, 0.06 * scale, 0.02 * scale, 0.07 * scale, bowY, 0.19 * scale));
  bowMeshes.push(box('bow_knot', 0.04 * scale, 0.04 * scale, 0.02 * scale, 0, bowY, 0.19 * scale));

  skinMeshes.push(cyl('neck', neckH, 0.16 * scale, 0.18 * scale, TESS, 0, neckY, 0.03 * scale, 0.85));
  skinMeshes.push(sph('head', headDia, SEG, 0, headY, 0.02 * scale, 1.05, 0.92));
  skinMeshes.push(cyl('jaw', 0.12 * scale, 0.26 * scale, 0.2 * scale, TESS, 0, headY - 0.14 * scale, 0.05 * scale, 0.95));

  const faceZ = 0.02 * scale;
  hairMeshes.push(cyl('hair_cap_cyl', 0.18 * scale, headDia + 0.04 * scale, headDia + 0.04 * scale, 8, 0, headY + 0.09 * scale, faceZ, 0.9));
  const quiff = box('hair_quiff', 0.24 * scale, 0.1 * scale, 0.18 * scale, 0.04 * scale, headY + 0.14 * scale, faceZ + 0.1 * scale);
  quiff.rotation.x = -0.38;
  quiff.rotation.y = 0.1;
  hairMeshes.push(quiff);

  suitMeshes.forEach(m => (m.material = MAT_SUIT));
  shirtMeshes.forEach(m => (m.material = MAT_SHIRT));
  skinMeshes.forEach(m => (m.material = MAT_SKIN));
  hairMeshes.forEach(m => (m.material = MAT_HAIR));
  btnMeshes.forEach(m => (m.material = MAT_BTN));
  bowMeshes.forEach(m => (m.material = MAT_BOWTIE));

  rig.position.y = 0.0;
  
  // Store materials for later disposal
  (rig as any).npcMaterials = [MAT_SUIT, MAT_SHIRT, MAT_SKIN, MAT_BOWTIE, MAT_BTN, MAT_HAIR];
  
  return rig;
}

/**
 * Creates the female character in a purple dress
 */
export function createFemaleWoman(scene: Scene, scale: number = 1): TransformNode {
  const MAT_SKIN = createUnlitMaterial('skin', '#d6b09a', scene);
  const MAT_HAIR = createUnlitMaterial('hair', '#2a201a', scene);
  const MAT_DRESS = createUnlitMaterial('dress_purple', '#7a4cc6', scene);
  const MAT_DRESS2 = createUnlitMaterial('dress2_purple', '#55358e', scene);
  const MAT_SHOES = createUnlitMaterial('shoes', '#f1f6ff', scene);

  const rig = new TransformNode('woman_purple_dress_Tpose', scene);

  function box(name: string, w: number, h: number, d: number, x: number, y: number, z: number) {
    const b = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    b.position.set(x, y, z);
    b.parent = rig;
    return b;
  }

  function cyl(name: string, h: number, dTop: number, dBot: number, tess: number, x: number, y: number, z: number, scaleZ?: number) {
    const c = MeshBuilder.CreateCylinder(name, { height: h, diameterTop: dTop, diameterBottom: dBot, tessellation: tess }, scene);
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

  const TESS = 9;
  const SEG = 7;

  const shoeH = 0.095 * scale;
  const legH = 1.05 * scale;
  const pelH = 0.12 * scale;
  const neckH = 0.11 * scale;
  const headDia = 0.3 * scale;

  const hipHalf = 0.15 * scale;
  const shoulderHalf = 0.25 * scale;

  const yShoe = shoeH * 0.5;
  const hipY = shoeH + legH;
  const waistY = hipY + pelH;

  const skinMeshes: Mesh[] = [];
  const hairMeshes: Mesh[] = [];
  const dressMeshes: Mesh[] = [];
  const dress2Meshes: Mesh[] = [];
  const shoeMeshes: Mesh[] = [];

  const thighH = 0.52 * scale;
  const calfH = legH - thighH;

  const calfCenterY = shoeH + calfH * 0.5;
  const thighCenterY = shoeH + calfH + thighH * 0.5;

  skinMeshes.push(cyl('thigh_L', thighH, 0.22 * scale, 0.19 * scale, TESS, -hipHalf, thighCenterY, 0, 0.85));
  skinMeshes.push(cyl('thigh_R', thighH, 0.22 * scale, 0.19 * scale, TESS, hipHalf, thighCenterY, 0, 0.85));

  skinMeshes.push(cyl('calf_L', calfH, 0.18 * scale, 0.14 * scale, TESS, -hipHalf, calfCenterY, 0, 0.85));
  skinMeshes.push(cyl('calf_R', calfH, 0.18 * scale, 0.14 * scale, TESS, hipHalf, calfCenterY, 0, 0.85));

  const shoeL = box('shoe_L', 0.22 * scale, shoeH, 0.34 * scale, -hipHalf, yShoe, 0.08 * scale);
  shoeL.rotation.x = 0.05;
  shoeMeshes.push(shoeL);

  const shoeR = box('shoe_R', 0.22 * scale, shoeH, 0.34 * scale, hipHalf, yShoe, 0.08 * scale);
  shoeR.rotation.x = 0.05;
  shoeMeshes.push(shoeR);

  shoeMeshes.push(box('heel_L', 0.06 * scale, 0.05 * scale, 0.08 * scale, -hipHalf, 0.025 * scale, -0.06 * scale));
  shoeMeshes.push(box('heel_R', 0.06 * scale, 0.05 * scale, 0.08 * scale, hipHalf, 0.025 * scale, -0.06 * scale));

  const pelvisCenterY = hipY + pelH * 0.5;
  dress2Meshes.push(cyl('waist_band', pelH, 0.44 * scale, 0.4 * scale, TESS, 0, pelvisCenterY, 0, 0.82));

  const bodH = 0.34 * scale;
  const bodiceCenterY = waistY + bodH * 0.5 + 0.01 * scale;
  const bodiceTopY = bodiceCenterY + bodH * 0.5;

  dressMeshes.push(cyl('bodice', bodH, 0.46 * scale, 0.38 * scale, TESS, 0, bodiceCenterY, 0, 0.76));

  const vneck = box('vneck_inset', 0.18 * scale, 0.14 * scale, 0.03 * scale, 0, bodiceCenterY + 0.12 * scale, 0.14 * scale);
  vneck.rotation.x = 0.15;
  dress2Meshes.push(vneck);

  const strapH = 0.18 * scale;
  const strapY = bodiceTopY + strapH * 0.5 - 0.02 * scale;
  dress2Meshes.push(box('strap_L', 0.05 * scale, strapH, 0.04 * scale, -0.12 * scale, strapY, 0.1 * scale));
  dress2Meshes.push(box('strap_R', 0.05 * scale, strapH, 0.04 * scale, 0.12 * scale, strapY, 0.1 * scale));

  const skirtH = 0.56 * scale;
  const skirtCenterY = waistY - skirtH * 0.5 + 0.02 * scale;
  dressMeshes.push(cyl('skirt', skirtH, 0.4 * scale, 0.78 * scale, TESS, 0, skirtCenterY, 0, 0.86));

  const hemCenterY = skirtCenterY - skirtH * 0.5 + 0.03 * scale;
  dress2Meshes.push(cyl('hem_ring', 0.06 * scale, 0.76 * scale, 0.8 * scale, TESS, 0, hemCenterY, 0, 0.86));

  const pleatH = skirtH * 0.55;
  dress2Meshes.push(box('pleat_L', 0.1 * scale, pleatH, 0.05 * scale, -0.1 * scale, skirtCenterY, 0.2 * scale));
  dress2Meshes.push(box('pleat_R', 0.1 * scale, pleatH, 0.05 * scale, 0.1 * scale, skirtCenterY, 0.2 * scale));

  const upperChestH = 0.18 * scale;
  const upperChestCenterY = bodiceTopY + upperChestH * 0.5;
  const upperChestTopY = upperChestCenterY + upperChestH * 0.5;

  skinMeshes.push(cyl('upper_chest', upperChestH, 0.44 * scale, 0.42 * scale, TESS, 0, upperChestCenterY, 0, 0.78));

  const shoulderY = upperChestCenterY + 0.05 * scale;
  skinMeshes.push(sph('shoulder_skin_L', 0.13 * scale, SEG, -shoulderHalf, shoulderY, 0, 1, 1));
  skinMeshes.push(sph('shoulder_skin_R', 0.13 * scale, SEG, shoulderHalf, shoulderY, 0, 1, 1));

  const clavY = upperChestCenterY + 0.03 * scale;
  const clavL = box('clav_L', 0.18 * scale, 0.04 * scale, 0.04 * scale, -0.1 * scale, clavY, 0.12 * scale);
  clavL.rotation.z = 0.18;
  skinMeshes.push(clavL);

  const clavR = box('clav_R', 0.18 * scale, 0.04 * scale, 0.04 * scale, 0.1 * scale, clavY, 0.12 * scale);
  clavR.rotation.z = -0.18;
  skinMeshes.push(clavR);

  const neckCenterY = upperChestTopY + neckH * 0.5;
  const headCenterY = neckCenterY + neckH * 0.5 + headDia * 0.48;

  skinMeshes.push(cyl('neck', neckH, 0.13 * scale, 0.15 * scale, TESS, 0, neckCenterY, 0.03 * scale, 0.85));
  skinMeshes.push(sph('head', headDia, SEG, 0, headCenterY, 0.02 * scale, 1.06, 0.92));
  skinMeshes.push(box('nose', 0.04 * scale, 0.045 * scale, 0.045 * scale, 0, headCenterY, 0.145 * scale));

  hairMeshes.push(cyl('hair_top', 0.13 * scale, headDia + 0.02 * scale, headDia + 0.02 * scale, TESS, 0, headCenterY + 0.095 * scale, 0.02 * scale, 0.92));
  hairMeshes.push(box('hair_side_L', 0.07 * scale, 0.19 * scale, 0.15 * scale, -(headDia * 0.5 + 0.015 * scale), headCenterY - 0.01 * scale, 0.03 * scale));
  hairMeshes.push(box('hair_side_R', 0.07 * scale, 0.19 * scale, 0.15 * scale, headDia * 0.5 + 0.015 * scale, headCenterY - 0.01 * scale, 0.03 * scale));
  hairMeshes.push(box('hair_back', 0.26 * scale, 0.18 * scale, 0.12 * scale, 0, headCenterY - 0.02 * scale, -0.1 * scale));
  hairMeshes.push(sph('hair_bun', 0.14 * scale, SEG, 0, headCenterY - 0.04 * scale, -0.2 * scale, 0.95, 0.95));

  const armSkin: Mesh[] = [];
  const upperLen = 0.32 * scale;
  const foreLen = 0.3 * scale;

  function makeArm(side: number) {
    const s = side;
    const baseX = s * shoulderHalf;
    const y = shoulderY;
    const z = 0;

    const upper = cyl('upperArm_' + (s < 0 ? 'L' : 'R'), upperLen, 0.11 * scale, 0.1 * scale, TESS, baseX + s * (upperLen * 0.5 + 0.02 * scale), y, z, 0.9);
    upper.rotation.z = Math.PI / 2;
    armSkin.push(upper);

    const fore = cyl('foreArm_' + (s < 0 ? 'L' : 'R'), foreLen, 0.1 * scale, 0.09 * scale, TESS, baseX + s * (upperLen + foreLen * 0.5 + 0.06 * scale), y, z, 0.9);
    fore.rotation.z = Math.PI / 2;
    armSkin.push(fore);

    const palm = box('palm_' + (s < 0 ? 'L' : 'R'), 0.1 * scale, 0.06 * scale, 0.1 * scale, baseX + s * (upperLen + foreLen + 0.13 * scale), y - 0.01 * scale, z);
    armSkin.push(palm);

    const f1 = box('finger1_' + (s < 0 ? 'L' : 'R'), 0.08 * scale, 0.025 * scale, 0.045 * scale, baseX + s * (upperLen + foreLen + 0.19 * scale), y + 0.015 * scale, z + 0.03 * scale);
    f1.rotation.y = s * 0.22;
    armSkin.push(f1);

    const f2 = box('finger2_' + (s < 0 ? 'L' : 'R'), 0.08 * scale, 0.025 * scale, 0.045 * scale, baseX + s * (upperLen + foreLen + 0.19 * scale), y - 0.005 * scale, z - 0.03 * scale);
    f2.rotation.y = -s * 0.16;
    armSkin.push(f2);
  }

  makeArm(-1);
  makeArm(1);

  skinMeshes.forEach(m => (m.material = MAT_SKIN));
  armSkin.forEach(m => (m.material = MAT_SKIN));
  hairMeshes.forEach(m => (m.material = MAT_HAIR));
  dressMeshes.forEach(m => (m.material = MAT_DRESS));
  dress2Meshes.forEach(m => (m.material = MAT_DRESS2));
  shoeMeshes.forEach(m => (m.material = MAT_SHOES));

  rig.position.y = 0.0;
  
  // Store materials for later disposal
  (rig as any).npcMaterials = [MAT_SKIN, MAT_HAIR, MAT_DRESS, MAT_DRESS2, MAT_SHOES];
  
  return rig;
}

/**
 * Randomly selects and creates one of the available NPC models
 */
export function createRandomNPCModel(scene: Scene, scale: number = 1): TransformNode {
  const models = [createMaleOlive, createFemaleWoman];
  const randomModel = models[Math.floor(Math.random() * models.length)];
  return randomModel(scene, scale);
}
