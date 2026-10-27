import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

function isMesh(object: THREE.Object3D): object is THREE.Mesh {
  return object instanceof THREE.Mesh;
}
type Vec3 = [number, number, number];

/** Original sculpt built locally from Nova's approved palette, not a Meshy export.
 * Named pivots remain editable and export directly to glTF/GLB. Feet stay grounded. */
export function createNovaModel() {
  const root = new THREE.Group();
  root.name = 'Nova';
  const materials = {
    indigo: new THREE.MeshStandardMaterial({ color: '#34316b', roughness: 0.73 }),
    violet: new THREE.MeshStandardMaterial({ color: '#55529a', roughness: 0.66 }),
    light: new THREE.MeshStandardMaterial({ color: '#7772bc', roughness: 0.7 }),
    cream: new THREE.MeshStandardMaterial({ color: '#f4dfb6', roughness: 0.85 }),
    ivory: new THREE.MeshStandardMaterial({ color: '#fff2d6', roughness: 0.72 }),
    mint: new THREE.MeshStandardMaterial({ color: '#a8dfd5', roughness: 0.6 }),
    gold: new THREE.MeshStandardMaterial({ color: '#efb24f', roughness: 0.56 }),
    beak: new THREE.MeshStandardMaterial({ color: '#e9a13c', roughness: 0.48 }),
    white: new THREE.MeshStandardMaterial({ color: '#fffdf8', roughness: 0.32 }),
    iris: new THREE.MeshStandardMaterial({ color: '#5553a3', roughness: 0.3 }),
    pupil: new THREE.MeshStandardMaterial({ color: '#111a32', roughness: 0.2 }),
    shine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
  };
  const sphere = new THREE.SphereGeometry(1, 20, 14);
  const feather = new THREE.SphereGeometry(1, 10, 8);
  function group(name: string, parent: THREE.Group, x = 0, y = 0, z = 0) {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }
  function ellipsoid(
    parent: THREE.Group,
    mat: THREE.Material,
    p: Vec3,
    s: Vec3,
    angle = 0,
    coarse = false,
  ) {
    const mesh = new THREE.Mesh(coarse ? feather : sphere, mat);
    mesh.position.set(p[0], p[1], p[2]);
    mesh.scale.set(s[0], s[1], s[2]);
    mesh.rotation.z = angle;
    parent.add(mesh);
    return mesh;
  }
  // A curved, tapered feather with a sculpted central ridge, rather than a flat plane.
  function plume(
    parent: THREE.Group,
    mat: THREE.Material,
    p: Vec3,
    length: number,
    width: number,
    angle: number,
    bend = 0.18,
  ) {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    const rings = 8,
      sides = 6;
    for (let row = 0; row <= rings; row++) {
      const t = row / rings;
      const r = Math.max(0.005, Math.sin(Math.PI * (0.08 + t * 0.92)) ** 0.8);
      for (let side = 0; side < sides; side++) {
        const a = (side / sides) * Math.PI * 2;
        uvs.push(side / sides, t);
        positions.push(
          Math.cos(a) * width * r,
          t * length,
          Math.sin(a) * width * r * 0.37 + bend * t * t,
        );
      }
    }
    for (let row = 0; row < rings; row++)
      for (let side = 0; side < sides; side++) {
        const a = row * sides + side,
          b = row * sides + ((side + 1) % sides);
        indices.push(a, a + sides, b, b, a + sides, b + sides);
      }
    // Close both ends so the export has no open feather tubes.
    for (let side = 1; side < sides - 1; side++) {
      indices.push(0, side, side + 1);
      indices.push(rings * sides, rings * sides + side + 1, rings * sides + side);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(p[0], p[1], p[2]);
    mesh.rotation.z = angle;
    parent.add(mesh);
  }
  const torso = group('Torso', root, 0, 0.87, 0);
  ellipsoid(torso, materials.indigo, [0, 0.1, 0], [0.66, 0.7, 0.46]);
  ellipsoid(torso, materials.cream, [0, 0.03, 0.31], [0.51, 0.55, 0.24]);
  // Three rows of overlapping breast feathers leave the belly soft and legible.
  for (let row = 0; row < 3; row++)
    for (let col = -2; col <= 2; col++) {
      const x = col * (0.155 - row * 0.015);
      ellipsoid(
        torso,
        row % 2 ? materials.cream : materials.ivory,
        [x, 0.29 - row * 0.22, 0.49 - Math.abs(col) * 0.024],
        [0.105, 0.16, 0.045],
        col * -0.1,
        true,
      );
    }
  const leftWing = group('Wing_L', torso, -0.58, 0.45, 0.02);
  const rightWing = group('Wing_R', torso, 0.58, 0.45, 0.02);
  for (const [wing, side] of [
    [leftWing, -1],
    [rightWing, 1],
  ] as const) {
    ellipsoid(wing, materials.indigo, [side * 0.12, -0.35, 0], [0.24, 0.54, 0.22], side * 0.16);
    for (let i = 0; i < 4; i++) {
      plume(
        wing,
        i % 2 ? materials.violet : materials.indigo,
        [side * (-0.02 + i * 0.08), -0.1, 0.19],
        0.74 - i * 0.08,
        0.1,
        Math.PI + side * (0.12 + i * 0.13),
        -0.12,
      );
    }
    plume(wing, materials.mint, [side * 0.17, -0.29, 0.23], 0.26, 0.055, Math.PI + side * 0.22);
  }
  // Tail and talons are attached to the floor rig, not to breathing chest motion.
  for (let i = -1; i <= 1; i++)
    plume(root, materials.indigo, [i * 0.12, 0.53, -0.3], 0.42, 0.105, Math.PI + i * 0.25, -0.25);
  for (const side of [-1, 1]) {
    ellipsoid(root, materials.gold, [side * 0.26, 0.24, 0.12], [0.065, 0.15, 0.065]);
    const foot = group(side < 0 ? 'Foot_L' : 'Foot_R', root, side * 0.26, 0.11, 0.12);
    ellipsoid(foot, materials.gold, [0, 0.03, 0], [0.17, 0.1, 0.2]);
    for (let i = -1; i <= 1; i++)
      ellipsoid(
        foot,
        materials.beak,
        [i * 0.1, -0.025, 0.13],
        [0.055, 0.065, 0.18],
        i * -0.16,
        true,
      );
  }
  const head = group('Head', root, 0, 1.95, 0.03);
  ellipsoid(head, materials.indigo, [0, 0.03, 0], [0.91, 0.8, 0.59]);
  // Feathered cheek rim and swept brow tufts maintain Nova's owl silhouette in profile.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++)
      plume(
        head,
        i % 2 ? materials.violet : materials.indigo,
        [side * (0.72 + i * 0.012), -0.38 + i * 0.14, 0.08],
        0.22,
        0.12,
        side * (-1.96 + i * 0.21),
        -0.12,
      );
    for (let i = 0; i < 4; i++)
      plume(
        head,
        i === 2 ? materials.light : materials.violet,
        [side * (0.45 + i * 0.1), 0.48 - i * 0.035, 0.02],
        0.62 - i * 0.065,
        0.12 - i * 0.01,
        side * (-0.35 - i * 0.27),
        -0.15,
      );
    plume(head, materials.mint, [side * 0.69, 0.56, 0.1], 0.33, 0.065, side * -0.9, -0.11);
    ellipsoid(
      head,
      materials.cream,
      [side * 0.405, -0.025, 0.43],
      [0.46, 0.56, 0.235],
      side * -0.12,
    );
    ellipsoid(
      head,
      materials.ivory,
      [side * 0.425, 0.005, 0.535],
      [0.365, 0.43, 0.16],
      side * -0.1,
    );
  }
  // Central forehead crest draws the two facial discs into an owl's heart shape.
  for (let i = -1; i <= 1; i++)
    plume(
      head,
      i ? materials.violet : materials.indigo,
      [i * 0.1, 0.4, 0.44],
      0.3 + (i === 0 ? 0.14 : 0),
      0.1,
      i * -0.32,
      -0.1,
    );
  const eyeL = group('Eye_L', head, -0.405, 0.04, 0.67);
  const eyeR = group('Eye_R', head, 0.405, 0.04, 0.67);
  const pupils: THREE.Group[] = [];
  const lids: THREE.Group[] = [];
  for (const [eye, index] of [eyeL, eyeR].map((eye, index) => [eye, index] as const)) {
    ellipsoid(eye, materials.pupil, [0, 0, -0.02], [0.292, 0.333, 0.09]);
    ellipsoid(eye, materials.white, [0, 0, 0], [0.279, 0.32, 0.1]);
    const pupil = group(index ? 'Gaze_R' : 'Gaze_L', eye, 0.015, -0.025, 0.082);
    ellipsoid(pupil, materials.iris, [0, 0, 0], [0.225, 0.26, 0.06]);
    ellipsoid(pupil, materials.pupil, [0, 0, 0.045], [0.163, 0.199, 0.035]);
    ellipsoid(pupil, materials.shine, [-0.068, 0.09, 0.077], [0.058, 0.066, 0.016]);
    ellipsoid(pupil, materials.shine, [0.065, -0.073, 0.078], [0.025, 0.028, 0.012]);
    pupils.push(pupil);
    const lid = group(index ? 'Lid_R' : 'Lid_L', head, eye.position.x, eye.position.y, 0.79);
    ellipsoid(lid, materials.cream, [0, 0, 0], [0.31, 0.09, 0.03]);
    ellipsoid(lid, materials.indigo, [0, -0.035, 0.03], [0.245, 0.018, 0.016], 0, true);
    lid.scale.setScalar(0.001);
    lids.push(lid);
  }
  const upperBeak = group('Beak_Upper', head, 0, -0.27, 0.69);
  ellipsoid(upperBeak, materials.beak, [0, -0.02, 0], [0.133, 0.145, 0.19]);
  const beakTip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.23, 12), materials.gold);
  beakTip.rotation.x = Math.PI;
  beakTip.position.set(0, -0.12, 0.07);
  upperBeak.add(beakTip);
  const lowerBeak = group('Beak_Lower', head, 0, -0.36, 0.64);
  ellipsoid(lowerBeak, materials.gold, [0, -0.035, 0.065], [0.104, 0.07, 0.11]);

  const sourceGeometries = new Set<THREE.BufferGeometry>([sphere, feather]);
  root.traverse((object) => {
    if (isMesh(object)) sourceGeometries.add(object.geometry);
  });
  // Merge static sculpture within each pivot by material: fewer draw calls without losing rig controls.
  root.traverse((object) => {
    if (!(object instanceof THREE.Group)) return;
    const byMaterial = new Map<THREE.Material, THREE.Mesh[]>();
    for (const child of object.children)
      if (isMesh(child) && !Array.isArray(child.material)) {
        const list = byMaterial.get(child.material) ?? [];
        list.push(child);
        byMaterial.set(child.material, list);
      }
    for (const [material, meshes] of byMaterial) {
      if (meshes.length < 2) continue;
      const geometries = meshes.map((mesh) => {
        mesh.updateMatrix();
        return mesh.geometry.clone().applyMatrix4(mesh.matrix);
      });
      const merged = mergeGeometries(geometries);
      geometries.forEach((geometry) => {
        geometry.dispose();
      });
      meshes.forEach((mesh) => object.remove(mesh));
      object.add(new THREE.Mesh(merged, material));
    }
  });
  // Shared originals not referenced after merging can be safely released by the caller's disposer.
  return {
    root,
    torso,
    head,
    leftWing,
    rightWing,
    eyeL,
    eyeR,
    pupils,
    lids,
    upperBeak,
    lowerBeak,
    sourceGeometries: [...sourceGeometries],
  };
}
export type NovaRig = ReturnType<typeof createNovaModel>;

export function disposeNovaModel(rig: NovaRig) {
  const geometries = new Set<THREE.BufferGeometry>(rig.sourceGeometries);
  const materials = new Set<THREE.Material>();
  rig.root.traverse((object) => {
    if (isMesh(object)) {
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material])
        materials.add(material);
    }
  });
  geometries.forEach((geometry) => {
    geometry.dispose();
  });
  materials.forEach((material) => {
    material.dispose();
  });
}
