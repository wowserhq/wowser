import THREE from 'three';

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
   * Project a partial frustum comprised of planes matching the camera and this portal view's
   * vertices (in world space). Resulting frustum skips near and far planes, as these are not
   * necessary for portal culling.
   *
   * @param camera - Camera object to use when producing the planes
   * @param side - Optional side of the portal (-1 or 1), defaulting to 1
   *
   * @returns - Partial frustum matching portal vertices and camera position
   *
   */
  createFrustum(camera, side = 1) {
    const planes = [];

    const flip = side < 0;

    const vertices = this.geometry.vertices;

    for (let vindex = 0, vcount = vertices.length; vindex < vcount; ++vindex) {
      const vertex1 = this.localToWorld(vertices[vindex].clone());
      const vertex2 = this.localToWorld(vertices[(vindex + 1) % vcount].clone());

      const plane = new THREE.Plane();
      plane.setFromCoplanarPoints(camera.position, vertex1, vertex2);

      if (flip) {
        plane.negate();
      }

      planes.push(plane);
    }

    const frustum = {
      planes: planes
    };

    return frustum;
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
