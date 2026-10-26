/** Reproduce the original local Nova GLB, with named pivot animation clips. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// GLTFExporter uses the browser FileReader API even for a texture-free binary.
class BlobReader {
  result;
  onloadend;
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((bytes) => {
      this.result = bytes;
      this.onloadend?.();
    });
  }
}
globalThis.FileReader = BlobReader;
const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'nova-original-3d-'));
const source = 'src/components/molecules/NovaCharacter/three/';
try {
  for (const file of ['novaModel', 'novaPose']) {
    let compiled = ts.transpileModule(await fs.readFile(source + file + '.ts', 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText;
    compiled = compiled.replace(
      /from ['"](three(?:\/[^'"]+)?)['"]/g,
      (_, spec) => `from ${JSON.stringify(import.meta.resolve(spec))}`,
    );
    await fs.writeFile(path.join(dir, file + '.mjs'), compiled);
  }
  const { createNovaModel, disposeNovaModel } = await import(
    pathToFileURL(path.join(dir, 'novaModel.mjs'))
  );
  const { poseNova } = await import(pathToFileURL(path.join(dir, 'novaPose.mjs')));
  const rig = createNovaModel();
  const nodes = [
    rig.root,
    rig.torso,
    rig.head,
    rig.leftWing,
    rig.rightWing,
    rig.eyeL,
    rig.eyeR,
    ...rig.pupils,
    ...rig.lids,
    rig.upperBeak,
    rig.lowerBeak,
  ];
  const clips = [];
  for (const [name, mood, duration] of [
    ['Idle', 'idle', 4.7],
    ['Listen', 'listening', 3],
    ['Think', 'thinking', 3],
    ['Speak', 'speaking', 2],
    ['Celebrate', 'celebrating', 2],
    ['Encourage', 'encouraging', 2],
    ['Sleep', 'sleeping', 4.7],
  ]) {
    const times = [];
    const values = nodes.map(() => ({ position: [], quaternion: [], scale: [] }));
    for (let frame = 0; frame <= 60; frame++) {
      const time = (duration * frame) / 60;
      times.push(time);
      poseNova(rig, {
        mood,
        time: frame === 60 ? 0 : time,
        animate: true,
        speechActive: mood === 'speaking',
      });
      nodes.forEach((node, i) => {
        node.position.toArray(values[i].position, frame * 3);
        node.quaternion.toArray(values[i].quaternion, frame * 4);
        node.scale.toArray(values[i].scale, frame * 3);
      });
    }
    const tracks = nodes.flatMap((node, i) => [
      new THREE.VectorKeyframeTrack(node.name + '.position', times, values[i].position),
      new THREE.QuaternionKeyframeTrack(node.name + '.quaternion', times, values[i].quaternion),
      new THREE.VectorKeyframeTrack(node.name + '.scale', times, values[i].scale),
    ]);
    clips.push(new THREE.AnimationClip(name, duration, tracks));
  }
  poseNova(rig, { mood: 'idle', time: 0, animate: false });
  const binary = await new GLTFExporter().parseAsync(rig.root, {
    binary: true,
    animations: clips,
    onlyVisible: true,
  });
  const gltf = await new GLTFLoader().parseAsync(binary, '');
  if (
    gltf.animations.length !== 7 ||
    !gltf.scene.getObjectByName('Head') ||
    !gltf.scene.getObjectByName('Beak_Lower')
  )
    throw Error('Export lost rig or clips');
  const target = 'e2e/assets/nova-original-v1.glb';
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, Buffer.from(binary));
  let meshes = 0,
    triangles = 0;
  gltf.scene.traverse((node) => {
    if (node.isMesh) {
      meshes++;
      triangles += node.geometry.index
        ? node.geometry.index.count / 3
        : node.geometry.attributes.position.count / 3;
    }
  });
  console.log(
    JSON.stringify(
      {
        target,
        bytes: binary.byteLength,
        meshes,
        triangles,
        clips: gltf.animations.map((clip) => clip.name),
      },
      null,
      2,
    ),
  );
  disposeNovaModel(rig);
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}
