import * as THREE from 'three';

/**
 * Watch bezel, generated in code (no model file):
 * extruded ring, outer radius 1, inner .72, depth .18, bevel .03,
 * 12 notches on the outer edge and a small triangle index at 12 o'clock.
 * The ring faces +Z and is centred on the origin.
 */
const OUTER = 1;
const INNER = 0.72;
const DEPTH = 0.18;
const BEVEL = 0.03;
const NOTCHES = 12;
const NOTCH_DEPTH = 0.05;
const NOTCH_HALF_ANGLE = (3.2 * Math.PI) / 180;

export function createBezelGeometries() {
  // Bevel grows the outline outward, so draw the shape inset by the bevel size.
  const ro = OUTER - BEVEL;
  const rn = ro - NOTCH_DEPTH;
  const ri = INNER + BEVEL;

  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / NOTCHES;
  const arcSegments = 18;
  const point = (r: number, a: number) => new THREE.Vector2(Math.sin(a) * r, Math.cos(a) * r);

  // Walk clockwise from 12 o'clock; each notch is centred on an hour.
  for (let i = 0; i < NOTCHES; i++) {
    const c = i * step;
    const a0 = c + NOTCH_HALF_ANGLE;
    const a1 = c + step - NOTCH_HALF_ANGLE;
    // notch floor (second half of notch i)
    const p0 = point(rn, c);
    if (i === 0) shape.moveTo(p0.x, p0.y);
    else shape.lineTo(p0.x, p0.y);
    const pn = point(rn, a0);
    shape.lineTo(pn.x, pn.y);
    // wall out, outer arc, wall in
    const po = point(ro, a0);
    shape.lineTo(po.x, po.y);
    for (let s = 1; s <= arcSegments; s++) {
      const p = point(ro, a0 + ((a1 - a0) * s) / arcSegments);
      shape.lineTo(p.x, p.y);
    }
    const pi = point(rn, a1);
    shape.lineTo(pi.x, pi.y);
  }
  shape.closePath();

  const hole = new THREE.Path();
  // Outer contour is clockwise, so the hole winds counter-clockwise.
  hole.absarc(0, 0, ri, 0, Math.PI * 2, false);
  shape.holes.push(hole);

  const ring = new THREE.ExtrudeGeometry(shape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 4,
    curveSegments: 96,
  });
  ring.translate(0, 0, -DEPTH / 2);
  ring.computeVertexNormals();

  // Triangle index at 12 o'clock, pointing at the centre, sitting on the front face.
  const tri = new THREE.Shape();
  const mid = (ro + ri) / 2;
  tri.moveTo(0, mid - 0.07);
  tri.lineTo(-0.055, mid + 0.06);
  tri.lineTo(0.055, mid + 0.06);
  tri.closePath();
  const index = new THREE.ExtrudeGeometry(tri, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.008,
    bevelSegments: 2,
  });
  index.translate(0, 0, DEPTH / 2 + BEVEL);

  return { ring, index };
}

/** Builds the bezel as a group (ring + index) sharing one material. */
export function createBezel(material: THREE.Material) {
  const { ring, index } = createBezelGeometries();
  const group = new THREE.Group();
  group.add(new THREE.Mesh(ring, material));
  group.add(new THREE.Mesh(index, material));
  return group;
}
