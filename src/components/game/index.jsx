import React from 'react';
import THREE from 'three';

import './index.styl';

import Controls from './controls';
import HUD from './hud';
import session from '../wowser/session';

class GameScreen extends React.Component {

  static id = 'game';
  static title = 'Game';

  constructor() {
    super();

    this.animate = ::this.animate;
    this.resize = ::this.resize;

    this.camera = new THREE.PerspectiveCamera(60, this.aspectRatio, 1, 1000);
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(15, 0, 7);

    this.renderer = null;
    this.requestID = null;
  }

  componentDidMount() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: this.refs.canvas
    });

    this.resize();
    this.animate();

    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount() {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    if (this.requestID) {
      this.requestID = null;
      cancelAnimationFrame(this.requestID);
    }

    window.removeEventListener('resize', this.resize);
  }

  get aspectRatio() {
    return window.innerWidth / window.innerHeight;
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = this.aspectRatio;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (!this.renderer) {
      return;
    }

    this.refs.controls.update();

    session.world.animate(this.camera);

    this.renderer.render(session.world.scene, this.camera);
    this.requestID = requestAnimationFrame(this.animate);
  }

  render() {
    return (
      <game className="game screen">
        <canvas ref="canvas"></canvas>
        <HUD />
        <Controls ref="controls" for={ session.player } camera={ this.camera }/>
      </game>
    );
  }

}

export default GameScreen;
