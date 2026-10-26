import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { NovaMood } from '../NovaCharacter';
import type { NovaStage } from '@/types/user';
import {
  getSpeechMouthFrame,
  isSpeakingNow,
  onSpeakingStateChange,
} from '@services/speech/speechService';
import { loadNovaAsset, disposeNovaAsset, poseNovaAsset, type NovaAssetRig } from './novaAsset';

interface Props {
  mood: NovaMood;
  stage: NovaStage;
  canAnimate: boolean;
  isActive: boolean;
  onReady: (ready: boolean) => void;
  onUnavailable: () => void;
}

/** One bounded WebGL canvas for prominent Nova instances. Lists keep raster art. */
export default function Nova3D(props: Props) {
  const host = useRef<HTMLSpanElement>(null);
  const state = useRef(props);
  const update = useRef<(() => void) | undefined>(undefined);
  useEffect(() => {
    state.current = props;
  }, [props]);
  // Parent counters and callback identities must not restart the animation clock.
  useEffect(() => {
    update.current?.();
  }, [props.mood, props.stage, props.canAnimate, props.isActive]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let stopped = false;
    let cleaned = false;
    let visible = true;
    let frame = 0;
    let last = 0;
    let time = 0;
    let interactionUntil = 0;
    let speechActive = isSpeakingNow();
    let lookX = 0,
      lookY = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    let rig: NovaAssetRig | undefined;
    let loadTimer: ReturnType<typeof setTimeout> | undefined;
    let resize: ResizeObserver | undefined;
    let observer: IntersectionObserver | undefined;
    let unsubscribe: (() => void) | undefined;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none';
    const lost = (event: Event) => {
      event.preventDefault();
      stopped = true;
      cancelAnimationFrame(frame);
      state.current.onUnavailable();
    };
    const clean = () => {
      if (cleaned) return;
      cleaned = true;
      stopped = true;
      cancelAnimationFrame(frame);
      resize?.disconnect();
      observer?.disconnect();
      unsubscribe?.();
      element.removeEventListener('pointermove', pointer);
      element.removeEventListener('pointerleave', leave);
      element.removeEventListener('pointerdown', greet);
      canvas.removeEventListener('webglcontextlost', lost);
      clearTimeout(loadTimer);
      if (rig) disposeNovaAsset(rig.root);
      renderer?.dispose();
      renderer?.forceContextLoss();
      canvas.remove();
      update.current = undefined;
      state.current.onReady(false);
    };
    function pointer(event: PointerEvent) {
      if (event.pointerType === 'touch') return;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      lookX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      lookY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    }
    function greet() {
      if (!state.current.canAnimate) return;
      interactionUntil = time + 1.1;
      update.current?.();
    }
    function leave() {
      lookX = 0;
      lookY = 0;
    }
    try {
      const context = canvas.getContext('webgl2', {
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
      if (!context) throw new Error('WebGL2 unavailable');
      renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.setClearColor(0x000000, 0);
      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight('#fff8e8', '#63638f', 1.6));
      const key = new THREE.DirectionalLight('#fff1db', 2.4);
      key.position.set(-3, 5, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight('#b9dcff', 1.5);
      rim.position.set(3, 3, -3);
      scene.add(rim);
      const fill = new THREE.DirectionalLight('#d1dbff', 0.7);
      fill.position.set(3, 1, 4);
      scene.add(fill);
      const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 30);
      camera.position.set(0, 1.95, 7.4);
      camera.lookAt(0, 1.53, 0);
      function draw() {
        if (stopped || !rig || !renderer) return;
        const current = state.current;
        rig.root.scale.setScalar(current.stage === 'baby' ? 0.88 : 1);
        poseNovaAsset(rig, {
          mood:
            interactionUntil > time && (current.mood === 'idle' || current.mood === 'listening')
              ? 'encouraging'
              : current.mood,
          time,
          animate: current.canAnimate,
          speechActive,
          mouth: getSpeechMouthFrame(),
          lookX,
          lookY,
        });
        if (import.meta.env.DEV) {
          const mouth = getSpeechMouthFrame();
          canvas.dataset.viseme = mouth.shape;
          canvas.dataset.mouthOpen = String(mouth.open);
        }
        renderer.render(scene, camera);
        canvas.dataset.triangles = String(renderer.info.render.triangles);
        canvas.dataset.drawCalls = String(renderer.info.render.calls);
      }
      function loop(now: number) {
        frame = 0;
        if (stopped || !visible || !state.current.canAnimate || !state.current.isActive) {
          last = 0;
          return;
        }
        if (!last || now - last >= 1000 / 30) {
          if (last) time += Math.min((now - last) / 1000, 0.1);
          last = now;
          draw();
        }
        frame = requestAnimationFrame(loop);
      }
      const refresh = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
        if (stopped || !rig || !state.current.isActive || !visible) return;
        draw();
        if (state.current.canAnimate) frame = requestAnimationFrame(loop);
      };
      const fit = () => {
        if (!renderer || stopped) return;
        const bounds = element.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        renderer.setSize(bounds.width, bounds.height, false);
        camera.aspect = bounds.width / bounds.height;
        // Fit the complete silhouette in both tall and wide slots.
        const distance = Math.max(
          6.6,
          3.1 / (2 * Math.tan(THREE.MathUtils.degToRad(15.5)) * camera.aspect),
        );
        camera.position.z = distance;
        camera.lookAt(0, 1.53, 0);
        camera.updateProjectionMatrix();
        refresh();
      };
      update.current = refresh;
      unsubscribe = onSpeakingStateChange((value) => {
        speechActive = value;
        refresh();
      });
      canvas.addEventListener('webglcontextlost', lost);
      element.addEventListener('pointermove', pointer);
      element.addEventListener('pointerleave', leave);
      element.addEventListener('pointerdown', greet);
      element.append(canvas);
      resize = new ResizeObserver(fit);
      resize.observe(element);
      if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver(([entry]) => {
          visible = entry?.isIntersecting ?? false;
          refresh();
        });
        observer.observe(element);
      }
      fit();
      if (import.meta.env.DEV) element.dataset.load = 'loading';
      loadTimer = setTimeout(() => {
        if (stopped || rig) return;
        if (import.meta.env.DEV) element.dataset.load = 'timeout';
        clean();
        state.current.onUnavailable();
      }, 15000);
      void loadNovaAsset()
        .then((loaded) => {
          clearTimeout(loadTimer);
          if (stopped) {
            disposeNovaAsset(loaded.root);
            return;
          }
          if (import.meta.env.DEV) element.dataset.load = 'ready';
          rig = loaded;
          scene.add(rig.root);
          fit();
          state.current.onReady(true);
        })
        .catch((error: unknown) => {
          if (stopped) return;
          if (import.meta.env.DEV) element.dataset.load = String(error);
          clean();
          state.current.onUnavailable();
        });
    } catch {
      clean();
      state.current.onUnavailable();
    }
    return clean;
  }, []);
  return <span ref={host} className="nova-webgl absolute inset-0 z-10" aria-hidden="true" />;
}
