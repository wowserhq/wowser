import * as THREE from 'three';

import THREEUtil from '../../../utils/three-util';

class WMOPortalView extends THREE.Mesh {

  constructor(portal, geometry, material) {
    super();

    this.matrixAutoUpdate = false;

    this.portal = portal;
    this.geometry = geometry;
    this.material = material;
  }

  clone() {
    return this.portal.createView();
  }

  /**
   * Projects a new frustum from this portal using an origin point and restricting the new
   * frustum to include only the spill from the given frustum.
   *
   * @param origin - Position to use when projecting new frustum
   * @param frustum - Previous frustum (used to clip portal vertices)
   * @param flip - Optional, specify that the new frustum sides should be flipped
   *
   * @returns - Frustum clipped by this portal
   *
   */
  createFrustum(camera, frustum, flip = false) {
    const planes = [];
    const vertices = [];

    const origin = camera.position;

    // Obtain vertices in world space
    for (let vindex = 0, vcount = this.geometry.vertices.length; vindex < vcount; ++vindex) {
      const local = this.geometry.vertices[vindex].clone();
      const world = this.localToWorld(local);
      vertices.push(world);
    }

    // Check distance to portal
    const distance = this.portal.plane.distanceToPoint(this.worldToLocal(origin.clone()));
    const close = distance < 1.0 && distance > -1.0;

    // If the portal is very close, use the portal vertices unedited; otherwise, clip the portal
    // vertices by the provided frustum.
    const clipped = close ? vertices : THREEUtil.clipVerticesByFrustum(vertices, frustum);

    // If clipping the portal vertices resulted in a polygon with fewer than 3 vertices, return
    // null to indicate a new frustum couldn't be produced.
    if (clipped.length < 3) {
      return null;
    }

    // Produce side planes for new frustum
    for (let vindex = 0, vcount = clipped.length; vindex < vcount; ++vindex) {
      const vertex1 = clipped[vindex];
      const vertex2 = clipped[(vindex + 1) % vcount];

      const plane = new THREE.Plane().setFromCoplanarPoints(origin, vertex1, vertex2);
      if (flip) plane.negate();
      planes.push(plane);
    }

    // Copy the original far plane (index: last - 1)
    const farPlaneIndex = frustum.planes.length - 2;
    const farPlane = frustum.planes[farPlaneIndex];
    planes.push(farPlane);

    // Create a near plane matching the portal
    const nearPlane = new THREE.Plane().setFromCoplanarPoints(clipped[0], clipped[1], clipped[2]);
    if (flip) nearPlane.negate();
    planes.push(nearPlane);

    const newFrustum = { planes };

    return newFrustum;
  }

  /**
   * Check if a given frustum contains or intersects with this portal view.
   *
   * @param frustum - Frustum object containing planes to check for portal inclusion / intersection
   *
   * @returns {Boolean} - Boolean indicating if the given frustum contained or intersected with
   * this portal view
   *
   */
  intersectFrustum(frustum) {
    const planes = frustum.planes;
    const vertices = this.geometry.vertices;

    for (let pindex = 0, pcount = planes.length; pindex < pcount; ++pindex) {
      const plane = planes[pindex];

      if (!plane) {
        continue;
      }

      let inside = 0;

      for (let vindex = 0, vcount = vertices.length; vindex < vcount; ++vindex) {
        const vertex = this.localToWorld(vertices[vindex].clone());
        const distance = plane.distanceToPoint(vertex);

        if (distance >= 0.0) {
          inside++;
        }
      }

      if (inside === 0) {
        return false;
      }
    }

    return true;
  }

}

export default WMOPortalView;
