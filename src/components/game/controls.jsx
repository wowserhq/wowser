import React from 'react';
import THREE from 'three';
import key from 'keymaster';

class Controls extends React.Component {

  static propTypes = {
    camera: React.PropTypes.object.isRequired,
    for: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super();

    this.element = document.body;
    this.unit = props.for;
    this.camera = props.camera;

    // Based on THREE's OrbitControls
    // See: http://threejs.org/examples/js/controls/OrbitControls.js
    this.clock = new THREE.Clock();

    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();

    this.rotating = false;
    this.rotateSpeed = 1.0;

    this.offset = new THREE.Vector3(-10, 0, 10);
    this.target = new THREE.Vector3();

    this.phi = this.phiDelta = 0;
    this.theta = this.thetaDelta = 0;

    this.scale = 1;
    this.zoomSpeed = 1.0;
    this.zoomScale = Math.pow(0.95, this.zoomSpeed);

    // Zoom distance limits
    this.minDistance = 6;
    this.maxDistance = 500;

    // Vertical orbit limits
    this.minPhi = 0;
    this.maxPhi = Math.PI * 0.45;

    this.quat = new THREE.Quaternion().setFromUnitVectors(
      this.camera.up, new THREE.Vector3(0, 1, 0)
    );
    this.quatInverse = this.quat.clone().inverse();

    this.EPS = 0.000001;

    this._onMouseDown = ::this._onMouseDown;
    this._onMouseUp = ::this._onMouseUp;
    this._onMouseMove = ::this._onMouseMove;
    this._onMouseWheel = ::this._onMouseWheel;

    this.element.addEventListener('mousedown', this._onMouseDown);
    this.element.addEventListener('mouseup', this._onMouseUp);
    this.element.addEventListener('mousemove', this._onMouseMove);
    this.element.addEventListener('mousewheel', this._onMouseWheel);

    // Firefox scroll-wheel support
    this.element.addEventListener('DOMMouseScroll', this._onMouseWheel);

    this.update();
  }

  componentWillUnmount() {
    this.element.removeEventListener('mousedown', this._onMouseDown);
    this.element.removeEventListener('mouseup', this._onMouseUp);
    this.element.removeEventListener('mousemove', this._onMouseMove);
    this.element.removeEventListener('mousewheel', this._onMouseWheel);
    this.element.removeEventListener('DOMMouseScroll', this._onMouseWheel);
  }

  update() {
    const unit = this.unit;

    // TODO: Get rid of this delta retrieval call
    const delta = this.clock.getDelta();

    if (this.unit) {
      if (key.isPressed('up') || key.isPressed('w')) {
        unit.moveForward(delta);
      }

      if (key.isPressed('down') || key.isPressed('s')) {
        unit.moveBackward(delta);
      }

      if (key.isPressed('q')) {
        unit.strafeLeft(delta);
      }

      if (key.isPressed('e')) {
        unit.strafeRight(delta);
      }

      if (key.isPressed('space')) {
        unit.ascend(delta);
      }

      if (key.isPressed('x')) {
        unit.descend(delta);
      }

      if (key.isPressed('left') || key.isPressed('a')) {
        unit.rotateLeft(delta);
      }

      if (key.isPressed('right') || key.isPressed('d')) {
        unit.rotateRight(delta);
      }

      this.target = this.unit.position;
    }

    const position = this.camera.position;

    // Rotate offset to "y-axis-is-up" space
    this.offset.applyQuaternion(this.quat);

    // Angle from z-axis around y-axis
    let theta = Math.atan2(this.offset.x, this.offset.z);

    // Angle from y-axis
    let phi = Math.atan2(
      Math.sqrt(this.offset.x * this.offset.x + this.offset.z * this.offset.z),
      this.offset.y
    );

    theta += this.thetaDelta;
    phi += this.phiDelta;

    // Limit vertical orbit
    phi = Math.max(this.minPhi, Math.min(this.maxPhi, phi));
    phi = Math.max(this.EPS, Math.min(Math.PI - this.EPS, phi));

    let radius = this.offset.length() * this.scale;

    // Limit zoom distance
    radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

    this.offset.x = radius * Math.sin(phi) * Math.sin(theta);
    this.offset.y = radius * Math.cos(phi);
    this.offset.z = radius * Math.sin(phi) * Math.cos(theta);

    // Rotate offset back to 'camera-up-vector-is-up' space
    this.offset.applyQuaternion(this.quatInverse);

    position.copy(this.target).add(this.offset);

    this.camera.lookAt(this.target);

    this.thetaDelta = 0;
    this.phiDelta = 0;
    this.scale = 1;
  }

  rotateHorizontally(angle) {
    this.thetaDelta -= angle;
  }

  rotateVertically(angle) {
    this.phiDelta -= angle;
  }

  zoomOut() {
    this.scale /= this.zoomScale;
  }

  zoomIn() {
    this.scale *= this.zoomScale;
  }

  _onMouseDown(event) {
    this.rotating = true;
    this.rotateStart.set(event.clientX, event.clientY);
  }

  _onMouseUp() {
    this.rotating = false;
  }

  _onMouseMove(event) {
    if (this.rotating) {
      event.preventDefault();

      this.rotateEnd.set(event.clientX, event.clientY);
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);

      this.rotateHorizontally(
        2 * Math.PI * this.rotateDelta.x / this.element.clientWidth * this.rotateSpeed
      );

      this.rotateVertically(
        2 * Math.PI * this.rotateDelta.y / this.element.clientHeight * this.rotateSpeed
      );

      this.rotateStart.copy(this.rotateEnd);

      this.update();
    }
  }

  _onMouseWheel(event) {
    event.preventDefault();
    event.stopPropagation();

    const delta = event.wheelDelta || -event.detail;
    if (delta > 0) {
      this.zoomIn();
    } else if (delta < 0) {
      this.zoomOut();
    }

    this.update();
  }

  render() {
    return null;
  }

}

export default Controls;
