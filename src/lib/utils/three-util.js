import * as THREE from 'three';

class THREEUtil {

  static planeContainsBox(plane, box) {
    const p1 = new THREE.Vector3();
    const p2 = new THREE.Vector3();

    p1.x = plane.normal.x > 0 ? box.min.x : box.max.x;
    p2.x = plane.normal.x > 0 ? box.max.x : box.min.x;
    p1.y = plane.normal.y > 0 ? box.min.y : box.max.y;
    p2.y = plane.normal.y > 0 ? box.max.y : box.min.y;
    p1.z = plane.normal.z > 0 ? box.min.z : box.max.z;
    p2.z = plane.normal.z > 0 ? box.max.z : box.min.z;

    const d1 = plane.distanceToPoint(p1);
    const d2 = plane.distanceToPoint(p2);

    if (d1 < 0 && d2 < 0) {
      return false;
    }

    return true;
  }

  static frustumContainsBox(frustum, box) {
    for (let pindex = 0, pcount = frustum.planes.length; pindex < pcount; ++pindex) {
      const plane = frustum.planes[pindex];

      if (!this.planeContainsBox(plane, box)) {
        return false;
      }
    }

    return true;
  }

  static clipVerticesByPlane(vertices, plane) {
    const clipped = [];

    for (let vindex = 0, vcount = vertices.length; vindex < vcount; ++vindex) {
      const v1 = vertices[vindex];
      const v2 = vertices[(vindex + 1) % vcount];

      const d1 = plane.distanceToPoint(v1);
      const d2 = plane.distanceToPoint(v2);

      const line = new THREE.Line3(v1, v2);
      const intersection = d1 / (d1 - d2);

      if (d1 < 0 && d2 < 0) {
        continue;
      } else if (d1 > 0 && d2 > 0) {
        clipped.push(v1);
      } else if (d1 > 0) {
        clipped.push(v1);
        clipped.push(line.at(intersection));
      } else {
        clipped.push(line.at(intersection));
      }
    }

    return clipped;
  }

  static clipVerticesByFrustum(vertices, frustum) {
    const planes = frustum.planes;

    let clipped = vertices;

    for (let pindex = 0, pcount = planes.length; pindex < pcount; ++pindex) {
      const plane = planes[pindex];

      if (!plane) {
        continue;
      }

      clipped = this.clipVerticesByPlane(clipped, plane);
    }

    return clipped;
  }

}

export default THREEUtil;
