import * as THREE from 'three';

import WMOPortalView from './view';

class WMOPortal {

  constructor(def) {
    this.index = def.index;

    const vertexCount = def.vertices.length / 3;

    const vertices = this.vertices = [];

    this.boundingBox = new THREE.Box3();

    for (let vindex = 0; vindex < vertexCount; ++vindex) {
      const vertex = new THREE.Vector3(
        def.vertices[vindex * 3],
        def.vertices[vindex * 3 + 1],
        def.vertices[vindex * 3 + 2]
      );

      // Stretch bounding box
      this.boundingBox.expandByPoint(vertex);

      vertices.push(vertex);
    }

    const normal = this.normal = new THREE.Vector3(def.normal[0], def.normal[1], def.normal[2]);
    const constant = this.constant = def.constant;
    this.plane = new THREE.Plane(normal, constant);

    this.createGeometry(vertices);
    this.createMaterial();
  }

  createView() {
    return new WMOPortalView(this, this.geometry, this.material);
  }

  createGeometry(vertices) {
    const geometry = this.geometry = new THREE.Geometry();

    const vertexCount = vertices.length;

    for (let vindex = 0; vindex < vertexCount; ++vindex) {
      geometry.vertices.push(vertices[vindex]);
    }

    const faceCount = vertexCount - 3 + 1;

    for (let findex = 0; findex < faceCount; ++findex) {
      geometry.faces.push(new THREE.Face3(findex + 1, findex + 2, 0));
    }
  }

  createMaterial() {
    const material = this.material = new THREE.MeshBasicMaterial;

    material.color = new THREE.Color(0xffff00);
    material.side = THREE.DoubleSide;
    material.opacity = 0.1;
    material.transparent = true;
    material.depthWrite = false;
    material.visible = false;
  }

}

export default WMOPortal;
