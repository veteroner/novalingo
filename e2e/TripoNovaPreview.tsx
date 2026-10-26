// DEV-ONLY viewer. Tripo free-plan trial art is intentionally outside public/ and Git.
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useMotionPolicy } from '../src/hooks/useMotionPolicy';

export function TripoNovaPreview() {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Model yükleniyor…');
  const [view, setView] = useState(0);
  const [original, setOriginal] = useState(false);
  const { isActive } = useMotionPolicy();
  const active = useRef(isActive);
  const update = useRef<(() => void) | undefined>();
  const turn = useRef<((angle: number) => void) | undefined>();
  useEffect(() => {
    active.current = isActive;
    if (isActive) update.current?.();
  }, [isActive]);
  useEffect(() => {
    turn.current?.(view);
  }, [view]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setStatus('Bu cihazda 3D desteklenmiyor.');
      return;
    }
    let disposed = false;
    let model: THREE.Object3D | undefined;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight('#fff8ed', '#626a95', 1.8));
    const key = new THREE.DirectionalLight('#fff0dc', 2.4);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#c7dfff', 2.1);
    rim.position.set(3, 2, -3);
    scene.add(rim);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 30);
    camera.position.set(0, 0.6, 2.3);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = false;
    controls.minDistance = 1.4;
    controls.maxDistance = 4;
    controls.maxPolarAngle = Math.PI * 0.65;
    renderer.domElement.setAttribute('aria-label', 'Tripo Nova 3D denemesi');
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y';
    element.append(renderer.domElement);
    const draw = () => {
      if (disposed || !active.current) return;
      renderer.render(scene, camera);
      renderer.domElement.dataset.triangles = String(renderer.info.render.triangles);
      renderer.domElement.dataset.drawCalls = String(renderer.info.render.calls);
    };
    const fit = () => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      draw();
    };
    controls.addEventListener('change', draw);
    const resize = new ResizeObserver(fit);
    resize.observe(element);
    update.current = draw;
    turn.current = (angle) => {
      if (model) model.rotation.y = angle;
      draw();
    };
    fit();
    new GLTFLoader().load(
      '/e2e/.local-assets/nova-tripo-preview.gltf',
      (gltf) => {
        const disposeModel = (object: THREE.Object3D) =>
          object.traverse((node) => {
            if (!(node instanceof THREE.Mesh)) return;
            node.geometry.dispose();
            const materials: THREE.Material[] = Array.isArray(node.material)
              ? node.material
              : [node.material];
            for (const material of materials) {
              for (const value of Object.values(material))
                if (value instanceof THREE.Texture) value.dispose();
              material.dispose();
            }
          });
        model = gltf.scene;
        model.userData.dispose = () => disposeModel(gltf.scene);
        if (disposed) {
          disposeModel(model);
          return;
        }
        scene.add(model);
        setStatus('Tripo H2.5 · 29.644 üçgen · 1,59 MiB · yerel deneme');
        draw();
      },
      (event) => {
        if (!disposed && event.loaded)
          setStatus('Geometri indiriliyor · ' + Math.round(event.loaded / 1024) + ' KB');
      },
      () => {
        if (!disposed) setStatus('Yerel deneme dosyası bulunamadı. İndirilmiş model gerekiyor.');
      },
    );
    return () => {
      disposed = true;
      resize.disconnect();
      controls.dispose();
      model?.userData.dispose?.();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      update.current = undefined;
      turn.current = undefined;
    };
  }, []);
  return (
    <section className="mx-auto max-w-lg p-4 text-center">
      <p className="text-text-secondary text-xs font-bold">TRIPO · YEREL 3D DENEME</p>
      <h1 className="font-heading mt-2 text-3xl font-extrabold">Nova üç boyutlu</h1>
      <p className="text-text-secondary mt-2 text-sm">Sürükleyerek her açıdan inceleyebilirsin.</p>
      <div
        className="border-border bg-surface relative my-4 overflow-hidden rounded-3xl border"
        style={{ height: 380 }}
      >
        <div
          ref={host}
          className="absolute inset-0"
          style={{ visibility: original ? 'hidden' : 'visible' }}
        />
        {original && (
          <img
            src="/nova/poses-v3/idle.webp"
            alt="Nova çizim referansı"
            className="h-full w-full object-contain p-8"
          />
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {(
          [
            ['Ön', 0],
            ['Yan', Math.PI / 2],
            ['Arka', Math.PI],
            ['Üç çeyrek', -Math.PI / 5],
          ] as const
        ).map(([label, angle]) => (
          <button
            key={label}
            className="border-border bg-surface min-h-11 rounded-xl border px-4 font-bold"
            aria-pressed={!original && view === angle}
            onClick={() => {
              setOriginal(false);
              setView(angle);
            }}
          >
            {label}
          </button>
        ))}
        <button
          className="border-border bg-surface min-h-11 rounded-xl border px-4 font-bold"
          aria-pressed={original}
          onClick={() => setOriginal((v) => !v)}
        >
          Referans çizim
        </button>
      </div>
      <p role="status" className="text-text-secondary mt-4 text-sm">
        {status}
      </p>
      <p className="text-text-secondary mt-2 text-xs">
        Ücretsiz plan örneği. Henüz eklem/animasyon yok; ticari kullanım onayı yok. Mağaza paketine
        dahil edilmez.
      </p>
    </section>
  );
}
