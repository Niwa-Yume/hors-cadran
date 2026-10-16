import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export const MAX_DPR = 1.75;

export function createRenderer(alpha: boolean) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  if (alpha) renderer.setClearColor(0x000000, 0);
  return renderer;
}

/** Generated studio environment (PMREM of RoomEnvironment): no HDR download. */
export function roomEnvironment(renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return env;
}

/**
 * Runs `frame` only while the element is on screen and the tab is visible.
 * Returns a function that forces a single render (for static mode).
 */
export function runWhileVisible(el: Element, renderer: THREE.WebGLRenderer, frame: (dt: number) => void, staticMode = false) {
  const clock = new THREE.Timer();
  let onScreen = false;
  const update = () => {
    const run = onScreen && !document.hidden && !staticMode;
    if (run) {
      clock.update();
      renderer.setAnimationLoop((t) => {
        clock.update(t);
        frame(Math.min(clock.getDelta(), 0.05));
      });
    } else {
      renderer.setAnimationLoop(null);
    }
  };
  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    update();
  }).observe(el);
  document.addEventListener('visibilitychange', update);
  return () => frame(0);
}

export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

export const clamp = (v: number, min = -1, max = 1) => Math.min(max, Math.max(min, v));
