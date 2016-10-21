import * as THREE from 'three';

import THREEUtil from './three-util';

class BSPTree {

  constructor(nodes, planeIndices, faceIndices, vertices) {
    this.nodes = nodes;

    this.indices = {
      plane: planeIndices,
      face: faceIndices
    };

    this.vertices = vertices;
  }

  query(subject, startingNodeIndex) {
    const leafIndices = [];

    this.queryBox(subject, startingNodeIndex, leafIndices);

    return leafIndices;
  }

  queryBox(box, nodeIndex, leafIndices) {
    if (nodeIndex === -1) {
      return;
    }

    const node = this.nodes[nodeIndex];

    if (node.planeType === 4) {
      leafIndices.push(nodeIndex);
      return;
    }

    const leftPlane = new THREE.Plane;
    const rightPlane = new THREE.Plane;

    if (node.planeType === 0) {
      leftPlane.setComponents(-1.0, 0.0, 0.0, node.distance);
      rightPlane.setComponents(1.0, 0.0, 0.0, -node.distance);
    } else if (node.planeType === 1) {
      leftPlane.setComponents(0.0, -1.0, 0.0, node.distance);
      rightPlane.setComponents(0.0, 1.0, 0.0, -node.distance);
    } else if (node.planeType === 2) {
      leftPlane.setComponents(0.0, 0.0, -1.0, node.distance);
      rightPlane.setComponents(0.0, 0.0, 1.0, -node.distance);
    }

    const includeLeft = THREEUtil.planeContainsBox(leftPlane, box);
    const includeRight = THREEUtil.planeContainsBox(rightPlane, box);

    if (includeLeft) {
      this.queryBox(box, node.children[0], leafIndices);
    }

    if (includeRight) {
      this.queryBox(box, node.children[1], leafIndices);
    }
  }

  calculateZRange(point, leafIndices) {
    let rangeMin = null;
    let rangeMax = null;

    for (let lindex = 0, lcount = leafIndices.length; lindex < lcount; ++lindex) {
      const node = this.nodes[leafIndices[lindex]];

      const pbegin = node.firstFace;
      const pend = node.firstFace + node.faceCount;

      for (let pindex = pbegin; pindex < pend; ++pindex) {
        const vindex1 = this.indices.face[3 * this.indices.plane[pindex] + 0];
        const vindex2 = this.indices.face[3 * this.indices.plane[pindex] + 1];
        const vindex3 = this.indices.face[3 * this.indices.plane[pindex] + 2];

        const vertex1 = new THREE.Vector3(
          this.vertices[3 * vindex1 + 0],
          this.vertices[3 * vindex1 + 1],
          this.vertices[3 * vindex1 + 2]
        );

        const vertex2 = new THREE.Vector3(
          this.vertices[3 * vindex2 + 0],
          this.vertices[3 * vindex2 + 1],
          this.vertices[3 * vindex2 + 2]
        );

        const vertex3 = new THREE.Vector3(
          this.vertices[3 * vindex3 + 0],
          this.vertices[3 * vindex3 + 1],
          this.vertices[3 * vindex3 + 2]
        );

        const minX = Math.min(vertex1.x, vertex2.x, vertex3.x);
        const maxX = Math.max(vertex1.x, vertex2.x, vertex3.x);

        const minY = Math.min(vertex1.y, vertex2.y, vertex3.y);
        const maxY = Math.max(vertex1.y, vertex2.y, vertex3.y);

        const pointInBoundsXY =
          point.x >= minX && point.x <= maxX &&
          point.y >= minY && point.y <= maxY;

        if (!pointInBoundsXY) {
          continue;
        }

        const triangle = new THREE.Triangle(vertex1, vertex2, vertex3);

        const z = this.calculateZFromTriangleAndXY(triangle, point.x, point.y);

        const bary = triangle.barycoordFromPoint(new THREE.Vector3(point.x, point.y, z));

        const baryInBounds = bary.x >= 0 && bary.y >= 0 && bary.z >= 0;

        if (!baryInBounds) {
          continue;
        }

        if (z < point.z && (rangeMin === null || z < rangeMin)) {
          rangeMin = z;
        }

        if (z > point.z && (rangeMax === null || z > rangeMax)) {
          rangeMax = z;
        }
      }
    }

    if (rangeMax - rangeMin < 0.001) {
      rangeMax = null;
    }

    return [rangeMin, rangeMax];
  }

  calculateZFromTriangleAndXY(triangle, x, y) {
    const p1 = triangle.a;
    const p2 = triangle.b;
    const p3 = triangle.c;

    const det = (p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y);

    if (det > -0.001 && det < 0.001) {
      return Math.min(p1.x, p2.x, p3.x);
    }

    const l1 = ((p2.y - p3.y) * (x - p3.x) + (p3.x - p2.x) * (y - p3.y)) / det;
    const l2 = ((p3.y - p1.y) * (x - p3.x) + (p1.x - p3.x) * (y - p3.y)) / det;
    const l3 = 1.0 - l1 - l2;

    return l1 * p1.z + l2 * p2.z + l3 * p3.z;
  }

  queryBoundedPoint(point, bounding) {
    const epsilon = 0.2;

    // Define a small bounding box for point
    const box = new THREE.Box3();
    box.min.set(point.x - epsilon, point.y - epsilon, bounding.min.z);
    box.max.set(point.x + epsilon, point.y + epsilon, bounding.max.z);

    // Query BSP tree
    const leafIndices = this.query(box, 0);

    // If no leaves were found, there is no valid result
    if (leafIndices.length === 0) {
      return null;
    }

    // Determine upper and lower Z bounds of leaves
    const zRange = this.calculateZRange(point, leafIndices);
    const minZ = zRange[0];
    const maxZ = zRange[1];

    return {
      z: {
        min: minZ,
        max: maxZ
      }
    };
  }

}

export default BSPTree;
