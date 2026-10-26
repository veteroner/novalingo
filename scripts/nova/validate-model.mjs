import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const path = resolve(process.argv[2] ?? 'public/nova/model-v4/nova.gltf');
const model = JSON.parse(readFileSync(path, 'utf8'));
const directory = dirname(path);
const binary = readFileSync(resolve(directory, model.buffers[0].uri));
assert.equal(binary.length, model.buffers[0].byteLength);
assert.equal(model.meshes.length, 1);
assert.equal(model.meshes[0].primitives.length, 1);
const primitive = model.meshes[0].primitives[0];
const triangles = model.accessors[primitive.indices].count / 3;
assert(triangles <= 80000 && triangles > 0);
assert.equal(model.skins.length, 1);
assert.equal(model.skins[0].joints.length, 5);
for (const name of ['Head', 'Body', 'Wing_L', 'Wing_R']) {
  assert(model.nodes.some((node) => node.name === name));
}
assert.deepEqual(model.meshes[0].extras.targetNames, ['Beak_Open']);
assert(model.meshes[0].weights.every((weight) => weight === 0));
for (const name of ['Idle', 'Listen', 'Think', 'Encourage', 'Celebrate']) {
  assert(model.animations.some((clip) => clip.name === name));
}
const sizes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const readers = {
  5121: ['getUint8', 1],
  5123: ['getUint16', 2],
  5125: ['getUint32', 4],
  5126: ['getFloat32', 4],
};
function values(index) {
  const accessor = model.accessors[index];
  const view = model.bufferViews[accessor.bufferView];
  const [method, bytes] = readers[accessor.componentType];
  const components = sizes[accessor.type];
  const stride = view.byteStride ?? components * bytes;
  const offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const data = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
  return Array.from({ length: accessor.count }, (_, row) =>
    Array.from({ length: components }, (_, column) =>
      data[method](offset + row * stride + column * bytes, true),
    ),
  );
}
const positions = values(primitive.attributes.POSITION);
assert(positions.every((point) => point.every(Number.isFinite)));
const weights = values(primitive.attributes.WEIGHTS_0);
assert(weights.every((row) => Math.abs(row.reduce((sum, value) => sum + value, 0) - 1) < 0.0001));
assert(
  values(primitive.attributes.JOINTS_0).every((row) =>
    row.every((joint) => joint >= 0 && joint < 5),
  ),
);
assert(values(primitive.indices).every(([index]) => index < positions.length));
let bytes = statSync(path).size + binary.length;
for (const image of model.images) {
  assert(image.uri && !image.uri.startsWith('http'));
  bytes += statSync(resolve(directory, image.uri)).size;
}
assert(bytes < 6 * 1024 * 1024);
assert(model.asset.copyright.includes('MakerWorld-Image-to-3D'));
console.log(
  JSON.stringify(
    {
      triangles,
      vertices: positions.length,
      joints: 5,
      morphs: 1,
      clips: model.animations.map((clip) => clip.name),
      bytes,
      weightNormalization: 'pass',
      indexBounds: 'pass',
      localTextures: 'pass',
    },
    null,
    2,
  ),
);
