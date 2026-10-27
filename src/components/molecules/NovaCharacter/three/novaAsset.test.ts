import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { disposeNovaAsset, poseNovaAsset, type NovaAssetRig } from './novaAsset';

function rig(): NovaAssetRig {
  const root = new THREE.Group();
  const [head, body, leftWing, rightWing] = Array.from({ length: 4 }, () => new THREE.Bone());
  const mesh = new THREE.SkinnedMesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial());
  mesh.morphTargetDictionary = { Beak_Open: 0, Beak_Round: 1, Beak_Wide: 2 };
  mesh.morphTargetInfluences = [0, 0, 0];
  const lid = new THREE.SkinnedMesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial());
  lid.morphTargetDictionary = {
    Blink_Quarter: 0,
    Blink_Half: 1,
    Blink_ThreeQuarter: 2,
    Blink_Closed: 3,
  };
  lid.morphTargetInfluences = [0, 0, 0, 0];
  const lash = new THREE.SkinnedMesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial());
  lash.morphTargetDictionary = { Blink_Closed: 0 };
  lash.morphTargetInfluences = [0];
  return {
    root,
    head: head!,
    body: body!,
    leftWing: leftWing!,
    rightWing: rightWing!,
    mesh,
    mouth: [mesh],
    lids: [lid],
    lashes: [lash],
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
    poseNovaAsset(model, {
      ...base,
      speechActive: true,
      mouth: { shape: 'D', open: 1, round: 0, wide: 0.3 },
    });
    expect(model.mesh.morphTargetInfluences![0]).toBeGreaterThan(0.2);
    poseNovaAsset(model, { ...base, speechActive: true, animate: false });
    expect(model.mesh.morphTargetInfluences![0]).toBe(0);
    expect(model.body.scale.y).toBe(1);
    poseNovaAsset(model, { ...base, time: 2.875 });
    expect(model.lids[0]!.morphTargetInfluences![3]).toBe(1);
    expect(model.lashes[0]!.morphTargetInfluences![0]).toBe(1);
    poseNovaAsset(model, { ...base, time: 1, mood: 'sleeping', animate: false });
    expect(model.lids[0]!.morphTargetInfluences).toEqual([0, 0, 0, 1]);
    poseNovaAsset(model, { ...base, time: 2.875, animate: false });
    expect(model.lids[0]!.morphTargetInfluences).toEqual([0, 0, 0, 0]);
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
