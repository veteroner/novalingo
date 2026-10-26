import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { NovaPoseInput } from './novaPose';
import { novaBlinkAt, lidWeights } from './novaFace';
import { REST_MOUTH } from '@services/speech/lipSync';

export interface NovaAssetRig {
  root: THREE.Group;
  head: THREE.Bone;
  body: THREE.Bone;
  leftWing: THREE.Bone;
  rightWing: THREE.Bone;
  mesh: THREE.SkinnedMesh;
  mouth: THREE.SkinnedMesh[];
  lids: THREE.SkinnedMesh[];
  lashes: THREE.SkinnedMesh[];
  rest: Map<THREE.Bone, THREE.Quaternion>;
}

/** Bundled, credited MakerLab mesh, with a locally authored deform rig.
 * External JPEG avoids embedded GLB image decoding stalls in WKWebView.
 */
export async function loadNovaAsset(): Promise<NovaAssetRig> {
  const gltf = await new GLTFLoader().loadAsync('/nova/model-v5/nova.gltf');
  const root = gltf.scene;
  const joint = (name: string) => {
    const value = root.getObjectByName(name);
    if (!(value instanceof THREE.Bone)) throw new Error(`Missing Nova joint: ${name}`);
    return value as THREE.Bone;
  };
  try {
    const head = joint('Head');
    const body = joint('Body');
    const leftWing = joint('Wing_L');
    const rightWing = joint('Wing_R');
    const candidate = root.getObjectByName('Nova_Feathers');
    if (!(candidate instanceof THREE.SkinnedMesh)) throw new Error('Missing Nova skin');
    const mesh = candidate as THREE.SkinnedMesh;
    function facial(name: string, keys: string[]): THREE.SkinnedMesh {
      const part = root.getObjectByName(name);
      if (!(part instanceof THREE.SkinnedMesh)) throw new Error(`Missing Nova face part: ${name}`);
      const skin = part as THREE.SkinnedMesh;
      if (
        !skin.morphTargetInfluences ||
        keys.some((key) => skin.morphTargetDictionary?.[key] === undefined)
      )
        throw new Error(`Incomplete Nova face controls: ${name}`);
      return skin;
    }
    const mouth = ['Nova_LowerBill', 'Nova_OralWall'].map((name) =>
      facial(name, ['Beak_Open', 'Beak_Round', 'Beak_Wide']),
    );
    const lids = ['Lid_L', 'Lid_R'].map((name) =>
      facial(name, ['Blink_Quarter', 'Blink_Half', 'Blink_ThreeQuarter', 'Blink_Closed']),
    );
    const lashes = ['Lash_L', 'Lash_R'].map((name) => facial(name, ['Blink_Closed']));
    return {
      root,
      head,
      body,
      leftWing,
      rightWing,
      mesh,
      mouth,
      lids,
      lashes,
      rest: new Map(
        [head, body, leftWing, rightWing].map((bone) => [bone, bone.quaternion.clone()]),
      ),
    };
  } catch (error) {
    disposeNovaAsset(root);
    throw error;
  }
}

const rotation = new THREE.Quaternion();
const euler = new THREE.Euler();
function turn(rig: NovaAssetRig, bone: THREE.Bone, x: number, y: number, z: number) {
  rotation.setFromEuler(euler.set(x, y, z));
  const rest = rig.rest.get(bone);
  if (!rest) throw new Error('Missing rest pose');
  bone.quaternion.copy(rest).multiply(rotation);
}

function setMorph(mesh: THREE.SkinnedMesh, name: string, amount: number) {
  const index = mesh.morphTargetDictionary?.[name];
  if (index !== undefined && mesh.morphTargetInfluences) mesh.morphTargetInfluences[index] = amount;
}

/** Restrained deformation preserves feather volumes and keeps feet grounded.
 * The bill uses audio-clock visemes; eyelids use portable, conformed GLTF morphs.
 */
export function poseNovaAsset(rig: NovaAssetRig, input: NovaPoseInput) {
  const t = input.animate ? input.time : 0;
  const lookX = input.animate ? (input.lookX ?? 0) : 0;
  const lookY = input.animate ? (input.lookY ?? 0) : 0;
  const happy = ['happy', 'excited', 'celebrating'].includes(input.mood);
  const encouraging = input.mood === 'encouraging';
  const thinking = input.mood === 'thinking';
  const listening = input.mood === 'listening';
  const sad = input.mood === 'sad';
  const sleeping = input.mood === 'sleeping';
  rig.root.rotation.set(0, 0.12, 0);
  turn(
    rig,
    rig.head,
    lookY * 0.045 + (sleeping ? 0.1 : sad ? 0.08 : 0),
    lookX * 0.1 + (thinking ? 0.075 : 0),
    (thinking ? -0.065 : listening ? 0.06 : encouraging ? 0.045 : 0) +
      (input.animate ? Math.sin(t * 0.85) * 0.012 : 0),
  );
  const wave = happy
    ? 0.18 + (input.animate ? Math.sin(t * 5) * 0.055 : 0)
    : encouraging
      ? 0.16
      : 0;
  turn(rig, rig.leftWing, 0, 0, happy ? -0.12 : 0);
  turn(rig, rig.rightWing, 0, 0, wave);
  rig.body.scale.set(1, 1 + (input.animate ? Math.sin(t * 1.5) * 0.004 : 0), 1);
  const mouth =
    input.animate && input.speechActive && !sleeping ? (input.mouth ?? REST_MOUTH) : REST_MOUTH;
  for (const mesh of rig.mouth) {
    setMorph(mesh, 'Beak_Open', mouth.open);
    setMorph(mesh, 'Beak_Round', mouth.round);
    setMorph(mesh, 'Beak_Wide', mouth.wide);
  }
  const closed = sleeping ? 1 : input.animate ? novaBlinkAt(t) : 0;
  const weights = lidWeights(closed);
  const keys = ['Blink_Quarter', 'Blink_Half', 'Blink_ThreeQuarter', 'Blink_Closed'];
  for (const mesh of rig.lids)
    keys.forEach((key, i) => {
      setMorph(mesh, key, weights[i] ?? 0);
    });
  for (const mesh of rig.lashes)
    setMorph(mesh, 'Blink_Closed', Math.max(0, (closed - 0.88) / 0.12));
}

/** Each canvas owns its decoded resources; dispose once, including skeleton textures. */
export function disposeNovaAsset(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const skeletons = new Set<THREE.Skeleton>();
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const mesh = node as THREE.Mesh;
    geometries.add(mesh.geometry);
    if (node instanceof THREE.SkinnedMesh) skeletons.add((node as THREE.SkinnedMesh).skeleton);
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      materials.add(material);
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) textures.add(value as THREE.Texture);
    }
  });
  skeletons.forEach((value) => {
    value.dispose();
  });
  textures.forEach((value) => {
    value.dispose();
  });
  materials.forEach((value) => {
    value.dispose();
  });
  geometries.forEach((value) => {
    value.dispose();
  });
}
