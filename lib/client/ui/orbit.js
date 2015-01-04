var THREE;

THREE = require('three');

module.exports = THREE.OrbitControls = function(object, domElement) {
  var EPS, STATE, changeEvent, dollyDelta, dollyEnd, dollyStart, endEvent, getAutoRotationAngle, getZoomScale, lastPosition, offset, onKeyDown, onMouseDown, onMouseMove, onMouseUp, onMouseWheel, pan, panDelta, panEnd, panOffset, panStart, phiDelta, quat, quatInverse, rotateDelta, rotateEnd, rotateStart, scale, scope, startEvent, state, thetaDelta, touchend, touchmove, touchstart;
  this.object = object;
  this.domElement = domElement != null ? domElement : document;
  this.enabled = true;
  this.target = new THREE.Vector3();
  this.center = this.target;
  this.noZoom = false;
  this.zoomSpeed = 1.0;
  this.minDistance = 0;
  this.maxDistance = Infinity;
  this.noRotate = false;
  this.rotateSpeed = 1.0;
  this.noPan = false;
  this.keyPanSpeed = 7.0;
  this.autoRotate = false;
  this.autoRotateSpeed = 2.0;
  this.minPolarAngle = 0;
  this.maxPolarAngle = Math.PI;
  this.noKeys = false;
  this.keys = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    BOTTOM: 40
  };
  scope = this;
  EPS = 0.000001;
  rotateStart = new THREE.Vector2();
  rotateEnd = new THREE.Vector2();
  rotateDelta = new THREE.Vector2();
  panStart = new THREE.Vector2();
  panEnd = new THREE.Vector2();
  panDelta = new THREE.Vector2();
  panOffset = new THREE.Vector3();
  offset = new THREE.Vector3();
  dollyStart = new THREE.Vector2();
  dollyEnd = new THREE.Vector2();
  dollyDelta = new THREE.Vector2();
  phiDelta = 0;
  thetaDelta = 0;
  scale = 1;
  pan = new THREE.Vector3();
  lastPosition = new THREE.Vector3();
  STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_DOLLY: 4,
    TOUCH_PAN: 5
  };
  state = STATE.NONE;
  this.target0 = this.target.clone();
  this.position0 = this.object.position.clone();
  quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
  quatInverse = quat.clone().inverse();
  changeEvent = {
    type: 'change'
  };
  startEvent = {
    type: 'start'
  };
  endEvent = {
    type: 'end'
  };
  this.rotateLeft = function(angle) {
    if (angle == null) {
      angle = getAutoRotationAngle();
    }
    return thetaDelta -= angle;
  };
  this.rotateUp = function(angle) {
    if (angle == null) {
      angle = getAutoRotationAngle();
    }
    return phiDelta -= angle;
  };
  this.panLeft = function(distance) {
    var te;
    te = this.object.matrix.elements;
    panOffset.set(te[0], te[1], te[2]);
    panOffset.multiplyScalar(-distance);
    return pan.add(panOffset);
  };
  this.panUp = function(distance) {
    var te;
    te = this.object.matrix.elements;
    panOffset.set(te[4], te[5], te[6]);
    panOffset.multiplyScalar(distance);
    return pan.add(panOffset);
  };
  this.pan = function(deltaX, deltaY) {
    var element, position, targetDistance;
    element = scope.domElement === document ? scope.domElement.body : scope.domElement;
    if (scope.object.fov != null) {
      position = scope.object.position;
      offset = position.clone().sub(scope.target);
      targetDistance = offset.length();
      targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);
      scope.panLeft(2 * deltaX * targetDistance / element.clientHeight);
      return scope.panUp(2 * deltaY * targetDistance / element.clientHeight);
    } else if (scope.object.top != null) {
      scope.panLeft(deltaX * (scope.object.right - scope.object.left) / element.clientWidth);
      return scope.panUp(deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight);
    } else {
      return console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
    }
  };
  this.dollyIn = function(dollyScale) {
    if (dollyScale == null) {
      dollyScale = getZoomScale();
    }
    return scale /= dollyScale;
  };
  this.dollyOut = function(dollyScale) {
    if (dollyScale == null) {
      dollyScale = getZoomScale();
    }
    return scale *= dollyScale;
  };
  this.update = function() {
    var phi, position, radius, theta;
    position = this.object.position;
    offset.copy(position).sub(this.target);
    offset.applyQuaternion(quat);
    theta = Math.atan2(offset.x, offset.z);
    phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);
    if (this.autoRotate) {
      this.rotateLeft(getAutoRotationAngle());
    }
    theta += thetaDelta;
    phi += phiDelta;
    phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));
    phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));
    radius = offset.length() * scale;
    radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));
    this.target.add(pan);
    offset.x = radius * Math.sin(phi) * Math.sin(theta);
    offset.y = radius * Math.cos(phi);
    offset.z = radius * Math.sin(phi) * Math.cos(theta);
    offset.applyQuaternion(quatInverse);
    position.copy(this.target).add(offset);
    this.object.lookAt(this.target);
    thetaDelta = 0;
    phiDelta = 0;
    scale = 1;
    pan.set(0, 0, 0);
    if (lastPosition.distanceToSquared(this.object.position) > EPS) {
      this.dispatchEvent(changeEvent);
      return lastPosition.copy(this.object.position);
    }
  };
  this.reset = function() {
    state = STATE.NONE;
    this.target.copy(this.target0);
    this.object.position.copy(this.position0);
    return this.update();
  };
  getAutoRotationAngle = function() {
    return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
  };
  getZoomScale = function() {
    return Math.pow(0.95, scope.zoomSpeed);
  };
  onMouseDown = function(event) {
    if (scope.enabled === false) {
      return;
    }
    event.preventDefault();
    if (event.button === 0) {
      if (scope.noRotate === true) {
        return;
      }
      state = STATE.ROTATE;
      rotateStart.set(event.clientX, event.clientY);
    } else if (event.button === 1) {
      if (scope.noZoom === true) {
        return;
      }
      state = STATE.DOLLY;
      dollyStart.set(event.clientX, event.clientY);
    } else if (event.button === 2) {
      if (scope.noPan === true) {
        return;
      }
      state = STATE.PAN;
      panStart.set(event.clientX, event.clientY);
    }
    scope.domElement.addEventListener('mousemove', onMouseMove, false);
    scope.domElement.addEventListener('mouseup', onMouseUp, false);
    return scope.dispatchEvent(startEvent);
  };
  onMouseMove = function(event) {
    var element;
    if (scope.enabled === false) {
      return;
    }
    event.preventDefault();
    element = scope.domElement === document ? scope.domElement.body : scope.domElement;
    if (state === STATE.ROTATE) {
      if (scope.noRotate === true) {
        return;
      }
      rotateEnd.set(event.clientX, event.clientY);
      rotateDelta.subVectors(rotateEnd, rotateStart);
      scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
      scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
      rotateStart.copy(rotateEnd);
    } else if (state === STATE.DOLLY) {
      if (scope.noZoom === true) {
        return;
      }
      dollyEnd.set(event.clientX, event.clientY);
      dollyDelta.subVectors(dollyEnd, dollyStart);
      if (dollyDelta.y > 0) {
        scope.dollyIn();
      } else {
        scope.dollyOut();
      }
      dollyStart.copy(dollyEnd);
    } else if (state === STATE.PAN) {
      if (scope.noPan === true) {
        return;
      }
      panEnd.set(event.clientX, event.clientY);
      panDelta.subVectors(panEnd, panStart);
      scope.pan(panDelta.x, panDelta.y);
      panStart.copy(panEnd);
    }
    return scope.update();
  };
  onMouseUp = function() {
    if (scope.enabled === false) {
      return;
    }
    scope.domElement.removeEventListener('mousemove', onMouseMove, false);
    scope.domElement.removeEventListener('mouseup', onMouseUp, false);
    scope.dispatchEvent(endEvent);
    return state = STATE.NONE;
  };
  onMouseWheel = function(event) {
    var delta;
    if (scope.enabled === false || scope.noZoom === true) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    delta = 0;
    if (event.wheelDelta != null) {
      delta = event.wheelDelta;
    } else if (event.detail != null) {
      delta = -event.detail;
    }
    if (delta > 0) {
      scope.dollyOut();
    } else {
      scope.dollyIn();
    }
    scope.update();
    scope.dispatchEvent(startEvent);
    return scope.dispatchEvent(endEvent);
  };
  onKeyDown = function(event) {
    if (scope.enabled === false || scope.noKeys === true || scope.noPan === true) {
      return;
    }
    switch (event.keyCode) {
      case scope.keys.UP:
        scope.pan(0, scope.keyPanSpeed);
        return scope.update();
      case scope.keys.BOTTOM:
        scope.pan(0, -scope.keyPanSpeed);
        return scope.update();
      case scope.keys.LEFT:
        scope.pan(scope.keyPanSpeed, 0);
        return scope.update();
      case scope.keys.RIGHT:
        scope.pan(-scope.keyPanSpeed, 0);
        return scope.update();
    }
  };
  touchstart = function(event) {
    var distance, dx, dy;
    if (scope.enabled === false) {
      return;
    }
    switch (event.touches.length) {
      case 1:
        if (scope.noRotate === true) {
          return;
        }
        state = STATE.TOUCH_ROTATE;
        rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
        break;
      case 2:
        if (scope.noZoom === true) {
          return;
        }
        state = STATE.TOUCH_DOLLY;
        dx = event.touches[0].pageX - event.touches[1].pageX;
        dy = event.touches[0].pageY - event.touches[1].pageY;
        distance = Math.sqrt(dx * dx + dy * dy);
        dollyStart.set(0, distance);
        break;
      case 3:
        if (scope.noPan === true) {
          return;
        }
        state = STATE.TOUCH_PAN;
        panStart.set(event.touches[0].pageX, event.touches[0].pageY);
        break;
      default:
        state = STATE.NONE;
    }
    return scope.dispatchEvent(startEvent);
  };
  touchmove = function(event) {
    var distance, dx, dy, element;
    if (scope.enabled === false) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    element = scope.domElement === document ? scope.domElement.body : scope.domElement;
    switch (event.touches.length) {
      case 1:
        if (scope.noRotate === true) {
          return;
        }
        if (state !== STATE.TOUCH_ROTATE) {
          return;
        }
        rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        rotateDelta.subVectors(rotateEnd, rotateStart);
        scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
        scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
        rotateStart.copy(rotateEnd);
        return scope.update();
      case 2:
        if (scope.noZoom === true) {
          return;
        }
        if (state !== STATE.TOUCH_DOLLY) {
          return;
        }
        dx = event.touches[0].pageX - event.touches[1].pageX;
        dy = event.touches[0].pageY - event.touches[1].pageY;
        distance = Math.sqrt(dx * dx + dy * dy);
        dollyEnd.set(0, distance);
        dollyDelta.subVectors(dollyEnd, dollyStart);
        if (dollyDelta.y > 0) {
          scope.dollyOut();
        } else {
          scope.dollyIn();
        }
        dollyStart.copy(dollyEnd);
        return scope.update();
      case 3:
        if (scope.noPan === true) {
          return;
        }
        if (state !== STATE.TOUCH_PAN) {
          return;
        }
        panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        panDelta.subVectors(panEnd, panStart);
        scope.pan(panDelta.x, panDelta.y);
        panStart.copy(panEnd);
        return scope.update();
      default:
        return state = STATE.NONE;
    }
  };
  touchend = function() {
    if (scope.enabled === false) {
      return;
    }
    scope.dispatchEvent(endEvent);
    return state = STATE.NONE;
  };
  this.domElement.addEventListener('contextmenu', (function(event) {
    return event.preventDefault();
  }), false);
  this.domElement.addEventListener('mousedown', onMouseDown, false);
  this.domElement.addEventListener('mousewheel', onMouseWheel, false);
  this.domElement.addEventListener('DOMMouseScroll', onMouseWheel, false);
  this.domElement.addEventListener('touchstart', touchstart, false);
  this.domElement.addEventListener('touchend', touchend, false);
  this.domElement.addEventListener('touchmove', touchmove, false);
  window.addEventListener('keydown', onKeyDown, false);
  return this.update();
};

THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
