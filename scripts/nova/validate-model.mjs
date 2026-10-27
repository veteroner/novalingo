import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const path = resolve(process.argv[2] ?? 'public/nova/model-v5/nova.gltf');
const model = JSON.parse(readFileSync(path, 'utf8'));
const directory = dirname(path);
const binary = readFileSync(resolve(directory, model.buffers[0].uri));
assert.equal(binary.length, model.buffers[0].byteLength);
assert.equal(model.meshes.length, 7);
const sizes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const readers = {
  5121: ['getUint8', 1],
  5123: ['getUint16', 2],
  5125: ['getUint32', 4],
  5126: ['getFloat32', 4],
};
function values(index) {
  const a = model.accessors[index],
    components = sizes[a.type];
  const result = Array.from({ length: a.count }, () => Array(components).fill(0));
  const [method, bytes] = readers[a.componentType];
  const data = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
  if (a.bufferView !== undefined) {
    const v = model.bufferViews[a.bufferView],
      offset = (v.byteOffset ?? 0) + (a.byteOffset ?? 0),
      stride = v.byteStride ?? components * bytes;
    for (let i = 0; i < a.count; i++)
      for (let j = 0; j < components; j++)
        result[i][j] = data[method](offset + i * stride + j * bytes, true);
  }
  if (a.sparse) {
    const sparse = a.sparse,
      iv = model.bufferViews[sparse.indices.bufferView],
      vv = model.bufferViews[sparse.values.bufferView];
    const [im, ib] = readers[sparse.indices.componentType];
    for (let i = 0; i < sparse.count; i++) {
      const row = data[im]((iv.byteOffset ?? 0) + (sparse.indices.byteOffset ?? 0) + i * ib, true);
      assert(row < a.count);
      for (let j = 0; j < components; j++)
        result[row][j] = data[method](
          (vv.byteOffset ?? 0) + (sparse.values.byteOffset ?? 0) + (i * components + j) * bytes,
          true,
        );
    }
  }
  return result;
}
let triangles = 0,
  vertices = 0,
  morphs = 0;
for (const mesh of model.meshes) {
  assert.equal(mesh.primitives.length, 1);
  const p = mesh.primitives[0],
    pos = values(p.attributes.POSITION);
  triangles += model.accessors[p.indices].count / 3;
  vertices += pos.length;
  assert(pos.every((row) => row.every(Number.isFinite)));
  assert(values(p.indices).every(([i]) => i < pos.length));
  assert(
    values(p.attributes.WEIGHTS_0).every(
      (row) => Math.abs(row.reduce((a, b) => a + b, 0) - 1) < 0.0001,
    ),
  );
  assert(values(p.attributes.JOINTS_0).every((row) => row.every((j) => j >= 0 && j < 5)));
  if (mesh.weights) assert(mesh.weights.every((w) => w === 0));
  for (const target of p.targets ?? []) {
    morphs++;
    for (const accessor of Object.values(target))
      assert(values(accessor).every((row) => row.every(Number.isFinite)));
  }
}
assert(triangles > 0 && triangles <= 90000);
assert.equal(model.skins.length, 1);
assert.equal(model.skins[0].joints.length, 5);
for (const name of [
  'Head',
  'Body',
  'Wing_L',
  'Wing_R',
  'Nova_LowerBill',
  'Nova_OralWall',
  'Lid_L',
  'Lid_R',
  'Lash_L',
  'Lash_R',
])
  assert(
    model.nodes.some((n) => n.name === name),
    name,
  );
for (const name of ['Nova_LowerBill', 'Nova_OralWall']) {
  const node = model.nodes.find((n) => n.name === name);
  assert.deepEqual(model.meshes[node.mesh].extras.targetNames, [
    'Beak_Open',
    'Beak_Round',
    'Beak_Wide',
  ]);
}
for (const name of ['Lid_L', 'Lid_R']) {
  const node = model.nodes.find((n) => n.name === name);
  assert.deepEqual(model.meshes[node.mesh].extras.targetNames, [
    'Blink_Quarter',
    'Blink_Half',
    'Blink_ThreeQuarter',
    'Blink_Closed',
  ]);
}
for (const name of ['Idle', 'Listen', 'Think', 'Encourage', 'Celebrate'])
  assert(model.animations.some((a) => a.name === name));
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
      vertices,
      joints: 5,
      morphs,
      drawCalls: 7,
      bytes,
      clips: model.animations.map((a) => a.name),
      weights: 'pass',
      indices: 'pass',
      finiteMorphs: 'pass',
      localTextures: 'pass',
    },
    null,
    2,
  ),
);
