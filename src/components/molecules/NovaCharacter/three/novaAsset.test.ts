import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { disposeNovaAsset, poseNovaAsset, type NovaAssetRig } from './novaAsset';

function rig(): NovaAssetRig {
  const root = new THREE.Group();
  const [head, body, leftWing, rightWing] = Array.from({ length: 4 }, () => new THREE.Bone());
  const mesh = new THREE.SkinnedMesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial());
  mesh.morphTargetDictionary = { Beak_Open: 0 };
  mesh.morphTargetInfluences = [0];
  return {
    root,
    head: head!,
    body: body!,
    leftWing: leftWing!,
    rightWing: rightWing!,
    mesh,
    beakIndex: 0,
    rest: new Map(
      [head!, body!, leftWing!, rightWing!].map((bone) => [bone, bone.quaternion.clone()]),
    ),
  };
}

describe('detailed Nova controls', () => {
  it('gates the beak on real speech playback and respects reduced motion', () => {
    const model = rig();
    const base = { mood: 'speaking' as const, time: 1, animate: true };
    poseNovaAsset(model, base);
    expect(model.mesh.morphTargetInfluences![0]).toBe(0);
    poseNovaAsset(model, { ...base, speechActive: true });
    expect(model.mesh.morphTargetInfluences![0]).toBeGreaterThan(0.2);
    poseNovaAsset(model, { ...base, speechActive: true, animate: false });
    expect(model.mesh.morphTargetInfluences![0]).toBe(0);
    expect(model.body.scale.y).toBe(1);
  });
  it('evaluates poses absolutely, keeps feet grounded and preserves the rest orientation', () => {
    const model = rig();
    model.rest.set(
      model.rightWing,
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI),
    );
    const input = { mood: 'celebrating' as const, time: 0.5, animate: true };
    poseNovaAsset(model, input);
    const first = model.rightWing.quaternion.clone();
    poseNovaAsset(model, input);
    expect(model.rightWing.quaternion.equals(first)).toBe(true);
    expect(model.root.position.y).toBe(0);
    expect(model.rightWing.quaternion.angleTo(model.rest.get(model.rightWing)!)).toBeLessThan(0.3);
    poseNovaAsset(model, { ...input, mood: 'idle', animate: false });
    expect(model.rightWing.quaternion.angleTo(model.rest.get(model.rightWing)!)).toBeLessThan(
      0.00001,
    );
  });
  it('releases shared geometry, material and texture resources only once', () => {
    const root = new THREE.Group();
    const geometry = new THREE.BoxGeometry();
    const texture = new THREE.Texture();
    const material = new THREE.MeshStandardMaterial({ map: texture });
    root.add(new THREE.Mesh(geometry, material), new THREE.Mesh(geometry, material));
    const g = vi.spyOn(geometry, 'dispose'),
      m = vi.spyOn(material, 'dispose'),
      t = vi.spyOn(texture, 'dispose');
    disposeNovaAsset(root);
    expect(g).toHaveBeenCalledOnce();
    expect(m).toHaveBeenCalledOnce();
    expect(t).toHaveBeenCalledOnce();
  });
});
