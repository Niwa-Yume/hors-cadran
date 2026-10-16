import * as THREE from 'three';
import { mouse } from '../env';
import { createBezel } from './bezel-geometry';
import { clamp, createRenderer, damp, roomEnvironment, runWhileVisible } from './shared';

const MAX_TURN = THREE.MathUtils.degToRad(38);

/** Metallic chrome bezel that turns to face the cursor. */
export function initFooterScene(container: HTMLElement, staticMode: boolean) {
  const renderer = createRenderer(true);
  const scene = new THREE.Scene();
  scene.environment = roomEnvironment(renderer);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
  camera.position.z = 5.2;

  const chrome = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, metalness: 1, roughness: 0.25, envMapIntensity: 1.2 });
  const face = new THREE.Group();
  const spin = new THREE.Group();
  spin.add(createBezel(chrome));
  face.add(spin);
  scene.add(face);

  const layout = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  layout();
  let renderOnce: () => void = () => {};
  new ResizeObserver(() => {
    layout();
    if (staticMode) renderOnce();
  }).observe(container);

  const rot = { x: 0.2, y: -0.3 };
  const render = (dt: number) => {
    if (!staticMode) {
      const r = container.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const tx = mouse.moved ? clamp((mouse.y - cy) / 500) * MAX_TURN : 0.2;
      const ty = mouse.moved ? clamp((mouse.x - cx) / 500) * MAX_TURN : -0.3;
      rot.x = damp(rot.x, tx, 5, dt);
      rot.y = damp(rot.y, ty, 5, dt);
      face.rotation.set(rot.x, rot.y, 0);
      spin.rotation.z += 0.08 * dt;
    } else {
      face.rotation.set(0.2, -0.3, 0);
    }
    renderer.render(scene, camera);
  };

  container.appendChild(renderer.domElement);
  renderOnce = runWhileVisible(container, renderer, render, staticMode);
  renderOnce();
  container.classList.add('is-ready');
}
