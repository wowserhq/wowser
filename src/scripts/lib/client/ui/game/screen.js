const key = require('keymaster');
const ADT = require('../../pipeline/adt');
const M2 = require('../../pipeline/m2');
const Orbit = require('../orbit');
const THREE = require('three');

module.exports = class Screen {

  constructor($scope, $element) {
    this.$scope = $scope;
    this.$element = $element;

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.up.set(0, 0, 1);

    this.controls = new Orbit(this.camera, this.$element[0]);
    this.controls.noKeys = true;
    this.controls.noPan = true;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI * 0.5;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 600;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.$element[0] });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const axes = new THREE.AxisHelper(20);
    this.scene.add(axes);

    this.character = null;

    M2.load('Creature\\Rabbit\\Rabbit.m2', (m2) => {
      m2.texture = 'Creature\\Rabbit\\RabbitSkin.blp.png';
      const model = m2.mesh;
      model.position.x = 2;
      model.position.y = -1;
      this.scene.add(model);
    });

    M2.load('Creature\\Illidan\\Illidan.m2', (m2) => {
      m2.texture = 'Creature\\Illidan\\Illidan.blp.png';
      const model = m2.mesh;
      this.character = model;
      this.scene.add(model);
    });

    M2.load('Creature\\RAGNAROS\\RAGNAROS.m2', (m2) => {
      m2.texture = 'Creature\\RAGNAROS\\RAGNAROSSKIN.blp.png';
      const model = m2.mesh;
      model.position.x = -5;
      model.position.y = 5.5;
      model.scale.set(0.3, 0.3, 0.3);
      this.scene.add(model);
    });

    M2.load('Creature\\MurlocCostume\\murloccostume_whiteflag.M2', (m2) => {
      m2.texture = 'Creature\\MurlocCostume\\MURLOCCOSTUME.blp.png';
      const model = m2.mesh;
      model.position.x = 2;
      model.position.y = 1.5;
      this.scene.add(model);
    });

    ADT.load('World\\Maps\\Azeroth\\Azeroth_31_49.adt', (adt) => {
      const model = adt.mesh;
      model.position.x = -266.667;
      model.position.y = -266.667;
      model.position.z = -67;
      this.scene.add(model);
    });

    this.run();
    this.controls.update();
  }

  run() {
    this.update();
    this.animate();
    requestAnimationFrame(() => {
      this.run();
    });
  }

  update() {
    if(!this.character) {
      return;
    }

    const delta = this.clock.getDelta();
    const distance = 20 * delta;
    const angle = Math.PI / 2 * delta;

    if(key.isPressed('up') || key.isPressed('w')) {
      this.character.translateX(distance);
    }

    if(key.isPressed('down') || key.isPressed('s')) {
      this.character.translateX(-distance);
    }

    if(key.isPressed('space')) {
      this.character.translateZ(distance);
    }

    if(key.isPressed('x')) {
      this.character.translateZ(-distance);
    }

    if(key.isPressed('left') || key.isPressed('a')) {
      this.character.rotateZ(angle);
    }

    if(key.isPressed('right') || key.isPressed('d')) {
      this.character.rotateZ(-angle);
    }

    this.controls.target = this.character.position;
    this.controls.update();
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
  }

};
