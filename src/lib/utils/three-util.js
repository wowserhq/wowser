import THREE from 'three';

class THREEUtil {

  static planeContainsBox(plane, box) {
    let outside = 0;

    if (plane.distanceToPoint(box.min) < 0.0) {
      outside++;
    }

    if (plane.distanceToPoint(box.max) < 0.0) {
      outside++;
    }

    return outside < 2;
  }

}

export default THREEUtil;
