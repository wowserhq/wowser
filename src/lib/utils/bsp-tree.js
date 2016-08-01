import THREE from 'three';

import THREEUtil from './three-util';

class BSPTree {

  constructor(nodes, planeIndices, faceIndices, vertices, normals) {
    this.nodes = nodes;

    this.indices = {
      plane: planeIndices,
      face: faceIndices
    };

    this.vertices = vertices;
    this.normals = normals;
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
      // Signs inverted for Wowser's axes
      leftPlane.setComponents(1.0, 0.0, 0.0, node.distance);
      rightPlane.setComponents(-1.0, 0.0, 0.0, -node.distance);
    } else if (node.planeType === 1) {
      // Signes inverted for Wowser's axes
      leftPlane.setComponents(0.0, 1.0, 0.0, node.distance);
      rightPlane.setComponents(0.0, -1.0, 0.0, -node.distance);
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
    let minZ = null;
    let maxZ = null;

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

        const triangle = new THREE.Triangle(vertex1, vertex2, vertex3);

        const minX = Math.min(triangle.a.x, triangle.b.x, triangle.c.x);
        const minY = Math.min(triangle.a.y, triangle.b.y, triangle.c.y);

        const maxX = Math.max(triangle.a.x, triangle.b.x, triangle.c.x);
        const maxY = Math.max(triangle.a.y, triangle.b.y, triangle.c.y);

        const pointInBoundsXY =
          point.x > minX && point.x < maxX &&
          point.y > minY && point.y < maxY;

        if (!pointInBoundsXY) {
          continue;
        }

        const z = this.calculateZFromTriangleAndXY(triangle, point.x, point.y);

        const bary = triangle.barycoordFromPoint(new THREE.Vector3(point.x, point.y, z));

        const baryInBounds = bary.x >= 0 && bary.y >= 0 && bary.z >= 0;

        if (!baryInBounds) {
          continue;
        }

        const normal1z = this.normals[3 * vindex1 + 2];
        const normal2z = this.normals[3 * vindex2 + 2];
        const normal3z = this.normals[3 * vindex3 + 2];

        const normalAverage =
          bary.x * normal1z +
          bary.y * normal2z +
          bary.z * normal3z;

        if (normalAverage > 0) {
          if (!minZ || z < minZ) {
            minZ = z;
          }
        } else {
          if (!maxZ || z > maxZ) {
            maxZ = z;
          }
        }
      }
    }

    return [minZ, maxZ];
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

  containsBoundedPoint(point, bounding) {
    // Define a small bounding box for point
    const box = new THREE.Box3();
    box.min.set(point.x - 0.2, point.y - 0.2, bounding.min.z);
    box.max.set(point.x + 0.2, point.y + 0.2, bounding.max.z);

    // Query BSP tree
    const leafIndices = this.query(box, 0);

    if (leafIndices.length === 0) {
      return false;
    }

    let [minZ, maxZ] = this.calculateZRange(point, leafIndices);

    if (!minZ) {
      minZ = box.min.z;
    }

    if (!maxZ) {
      maxZ = box.max.z;
    }

    const pointInBoundsZ =
      point.z >= minZ &&
      point.z <= maxZ;

    if (!pointInBoundsZ) {
      return false;
    }

    return true;
  }

}

export default BSPTree;
