import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { createNovaModel, disposeNovaModel } from './novaModel';
import { poseNova } from './novaPose';

describe('original Nova 3D rig', () => {
  it('has finite bounded geometry, a complete owl silhouette and separate animation pivots', () => {
    const rig = createNovaModel();
    const bounds = new THREE.Box3().setFromObject(rig.root);
    expect(bounds.min.y).toBeGreaterThanOrEqual(-0.01);
    expect(bounds.max.y).toBeLessThan(3.5);
    const names = new Set<string>();
    let triangles = 0,
      meshes = 0;
    rig.root.traverse((node) => {
      if (node.name) {
        expect(names.has(node.name)).toBe(false);
        names.add(node.name);
      }
      if (node instanceof THREE.Mesh) {
        meshes++;
        const geometry = node.geometry as THREE.BufferGeometry;
        const position = geometry.getAttribute('position');
        expect(Array.from(position.array).every(Number.isFinite)).toBe(true);
        const index = geometry.getIndex();
        expect(index).not.toBeNull();
        expect(Math.max(...Array.from(index!.array))).toBeLessThan(position.count);
        triangles += index!.count / 3;
      }
    });
    for (const name of ['Head', 'Wing_L', 'Wing_R', 'Beak_Lower', 'Lid_L', 'Lid_R'])
      expect(names.has(name)).toBe(true);
    expect(triangles).toBeGreaterThan(10000);
    expect(triangles).toBeLessThan(24000);
    expect(meshes).toBeLessThan(40);
    disposeNovaModel(rig);
  });
  it('keeps feet grounded through breathing, listening and wing gestures', () => {
    const rig = createNovaModel();
    poseNova(rig, { mood: 'idle', time: 0, animate: false });
    const foot = rig.root.getObjectByName('Foot_L')!;
    const before = foot.getWorldPosition(new THREE.Vector3());
    for (const mood of ['idle', 'celebrating', 'listening', 'thinking'] as const) {
      poseNova(rig, { mood, time: 1.7, animate: true });
      expect(foot.getWorldPosition(new THREE.Vector3()).distanceTo(before)).toBeLessThan(0.001);
    }
    poseNova(rig, { mood: 'idle', time: 0, animate: false });
    expect(rig.rightWing.rotation.z).toBe(0.04);
    disposeNovaModel(rig);
  });
  it('only moves the jaw during actual playback and settles under reduced motion', () => {
    const rig = createNovaModel();
    poseNova(rig, { mood: 'speaking', time: 1, animate: true, speechActive: false });
    expect(rig.lowerBeak.rotation.x).toBe(0);
    poseNova(rig, { mood: 'speaking', time: 1, animate: true, speechActive: true });
    expect(rig.lowerBeak.rotation.x).toBeGreaterThan(0.3);
    poseNova(rig, { mood: 'speaking', time: 20, animate: false, speechActive: true });
    expect(rig.lowerBeak.rotation.x).toBe(0);
    const position = rig.torso.scale.clone();
    poseNova(rig, { mood: 'speaking', time: 100, animate: false, speechActive: true });
    expect(rig.torso.scale.equals(position)).toBe(true);
    disposeNovaModel(rig);
  });
  it('blinks and sleeps with eyelids then restores the open-eyed pose', () => {
    const rig = createNovaModel();
    poseNova(rig, { mood: 'idle', time: 4.565, animate: true });
    expect(rig.eyeL.scale.y).toBe(0.001);
    expect(rig.lids[0]!.scale.y).toBe(1);
    poseNova(rig, { mood: 'sleeping', time: 0, animate: false });
    expect(rig.eyeR.scale.y).toBe(0.001);
    poseNova(rig, { mood: 'idle', time: 0, animate: false });
    expect(rig.eyeR.scale.y).toBe(1);
    expect(rig.lids[0]!.scale.y).toBe(0.001);
    disposeNovaModel(rig);
  });
  it('releases merged and source geometry/materials exactly once', () => {
    const rig = createNovaModel();
    const geometry = vi.spyOn(rig.sourceGeometries[0]!, 'dispose');
    const mesh = rig.head.children.find((node) => node instanceof THREE.Mesh) as THREE.Mesh;
    const material = mesh.material as THREE.Material;
    const disposed = vi.spyOn(material, 'dispose');
    disposeNovaModel(rig);
    expect(geometry).toHaveBeenCalledOnce();
    expect(disposed).toHaveBeenCalledOnce();
  });
});
