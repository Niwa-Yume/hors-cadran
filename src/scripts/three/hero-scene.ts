import * as THREE from 'three';
import { gsap } from '../gsap';
import { mouse } from '../env';
import { on } from '../events';
import { createBezel } from './bezel-geometry';
import { clamp, createRenderer, damp, roomEnvironment, runWhileVisible } from './shared';

interface HeroSceneOptions {
  container: HTMLElement;
  frame: HTMLElement;
  images: string[];
  accents: string[];
  initial: number;
  staticMode: boolean;
}

const FOV = 35;
const CAMERA_Z = 6;
const PLANE_Z = -1.6;
const SPIN = 0.15; // rad/s
const MAX_TILT = THREE.MathUtils.degToRad(15);
/* three's `dispersion` (0 = none, ~1 = strong); .04 per the art direction. */
const DISPERSION = 0.04;
const IMAGE_SIZE = new THREE.Vector2(1600, 1000);

/* The hero image lives inside the scene (opaque plane) so the glass can refract it. */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmentShader = /* glsl */ `
  uniform sampler2D tA;
  uniform sampler2D tB;
  uniform float uMix;
  uniform vec2 uPlane;
  uniform vec2 uImage;
  uniform vec2 uOffset;
  varying vec2 vUv;
  vec2 cover(vec2 uv) {
    float rp = uPlane.x / uPlane.y;
    float ri = uImage.x / uImage.y;
    vec2 s = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
    return (uv - 0.5) * s * 0.96 + 0.5 + uOffset;
  }
  void main() {
    vec2 uv = cover(vUv);
    gl_FragColor = mix(texture2D(tA, uv), texture2D(tB, uv), uMix);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function loadTexture(src: string, maxAnisotropy: number): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      // Rasterise (SVG placeholders or photos) at a fixed size for a predictable texture.
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1280;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(4, maxAnisotropy);
      resolve(tex);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export async function initHeroScene(opts: HeroSceneOptions) {
  const { container, frame, images, accents, initial, staticMode } = opts;

  const renderer = createRenderer(false);
  const scene = new THREE.Scene();
  scene.environment = roomEnvironment(renderer);
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.z = CAMERA_Z;

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const textures = await Promise.all(images.map((src) => loadTexture(src, maxAniso)));

  /* Background plane */
  const uniforms = {
    tA: { value: textures[initial] },
    tB: { value: textures[initial] },
    uMix: { value: 0 },
    uPlane: { value: new THREE.Vector2(1, 1) },
    uImage: { value: IMAGE_SIZE },
    uOffset: { value: new THREE.Vector2() },
  };
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, toneMapped: false }),
  );
  plane.position.z = PLANE_Z;
  scene.add(plane);

  /* Glass bezel */
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.08,
    transmission: 1,
    thickness: 0.6,
    ior: 1.45,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    dispersion: DISPERSION,
    attenuationColor: new THREE.Color(accents[initial]),
    attenuationDistance: 2.4,
    specularIntensity: 1,
    envMapIntensity: 1.15,
  });
  const anchor = new THREE.Group();
  const tilt = new THREE.Group();
  const spin = new THREE.Group();
  spin.add(createBezel(glass));
  tilt.add(spin);
  anchor.add(tilt);
  scene.add(anchor);

  /* Layout: plane fills the frustum, bezel floats centre-right. */
  const layout = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const fovRad = THREE.MathUtils.degToRad(FOV);
    const ph = 2 * Math.tan(fovRad / 2) * (CAMERA_Z - PLANE_Z);
    plane.scale.set(ph * camera.aspect, ph, 1);
    uniforms.uPlane.value.set(ph * camera.aspect, ph);
    const vh = 2 * Math.tan(fovRad / 2) * CAMERA_Z;
    const vw = vh * camera.aspect;
    const radius = Math.min(vh * 0.3, vw * 0.17);
    anchor.scale.setScalar(radius);
    anchor.position.set(vw * 0.16, vh * 0.02, 0);
  };
  layout();
  let renderOnce: () => void = () => {};
  new ResizeObserver(() => {
    layout();
    if (staticMode) renderOnce();
  }).observe(container);

  /* Motion */
  const rot = { x: 0, y: 0 };
  const render = (dt: number) => {
    if (!staticMode) {
      spin.rotation.z += SPIN * dt;
      const r = frame.getBoundingClientRect();
      let nx = 0;
      let ny = 0;
      if (mouse.moved) {
        nx = clamp((mouse.x - (r.left + r.width / 2)) / (r.width / 2));
        ny = clamp((mouse.y - (r.top + r.height / 2)) / (r.height / 2));
      }
      rot.x = damp(rot.x, ny * MAX_TILT, 4, dt);
      rot.y = damp(rot.y, nx * MAX_TILT, 4, dt);
      tilt.rotation.set(rot.x, rot.y, 0);
      uniforms.uOffset.value.set(-rot.y * 0.03, rot.x * 0.03);
    } else {
      spin.rotation.z = 0.35;
      tilt.rotation.set(0.12, -0.22, 0);
    }
    renderer.render(scene, camera);
  };

  container.appendChild(renderer.domElement);
  renderOnce = runWhileVisible(frame, renderer, render, staticMode);
  renderOnce();
  frame.classList.add('is-gl');

  /* Drop change: cross-fade textures inside the scene + retint the glass. */
  let shown = initial;
  on('hc:drop', (d) => {
    if (!d || d.index === shown) return;
    if (uniforms.uMix.value > 0.5) uniforms.tA.value = uniforms.tB.value;
    uniforms.tB.value = textures[d.index];
    uniforms.uMix.value = 0;
    shown = d.index;
    const c = new THREE.Color(d.accent);
    const duration = staticMode ? 0 : 0.8;
    gsap.to(glass.attenuationColor, { r: c.r, g: c.g, b: c.b, duration, overwrite: true });
    gsap.to(uniforms.uMix, {
      value: 1,
      duration,
      ease: 'hc-cubic',
      overwrite: true,
      onUpdate: () => staticMode && renderOnce(),
      onComplete: () => {
        uniforms.tA.value = uniforms.tB.value;
        uniforms.uMix.value = 0;
        if (staticMode) renderOnce();
      },
    });
  });
}
