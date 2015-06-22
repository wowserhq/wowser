var ADT, M2, Orbit, Screen, THREE, key;

key = require('keymaster');

ADT = require('../../pipeline/adt');

M2 = require('../../pipeline/m2');

Orbit = require('../orbit');

THREE = require('three');

Screen = (function() {
  module.exports = Screen;

  function Screen($scope, $element) {
    var axes;
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
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.$element[0]
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    axes = new THREE.AxisHelper(20);
    this.scene.add(axes);
    this.character = null;
    M2.load('Creature\\Rabbit\\Rabbit.m2', (function(_this) {
      return function(m2) {
        var model;
        m2.texture = 'Creature\\Rabbit\\RabbitSkin.blp.png';
        model = m2.mesh;
        model.position.x = 2;
        model.position.y = -1;
        return _this.scene.add(model);
      };
    })(this));
    M2.load('Creature\\Illidan\\Illidan.m2', (function(_this) {
      return function(m2) {
        var model;
        m2.texture = 'Creature\\Illidan\\Illidan.blp.png';
        model = m2.mesh;
        _this.character = model;
        return _this.scene.add(model);
      };
    })(this));
    M2.load('Creature\\RAGNAROS\\RAGNAROS.m2', (function(_this) {
      return function(m2) {
        var model;
        m2.texture = 'Creature\\RAGNAROS\\RAGNAROSSKIN.blp.png';
        model = m2.mesh;
        model.position.x = -5;
        model.position.y = 5.5;
        model.scale.set(0.3, 0.3, 0.3);
        return _this.scene.add(model);
      };
    })(this));
    M2.load('Creature\\MurlocCostume\\murloccostume_whiteflag.M2', (function(_this) {
      return function(m2) {
        var model;
        m2.texture = 'Creature\\MurlocCostume\\MURLOCCOSTUME.blp.png';
        model = m2.mesh;
        model.position.x = 2;
        model.position.y = 1.5;
        return _this.scene.add(model);
      };
    })(this));
    ADT.load('World\\Maps\\Azeroth\\Azeroth_31_49.adt', (function(_this) {
      return function(adt) {
        var model;
        model = adt.mesh;
        model.position.x = -266.667;
        model.position.y = -266.667;
        model.position.z = -67;
        return _this.scene.add(model);
      };
    })(this));
    this.run();
    this.controls.update();
  }

  Screen.prototype.run = function() {
    this.update();
    this.animate();
    return requestAnimationFrame((function(_this) {
      return function() {
        return _this.run();
      };
    })(this));
  };

  Screen.prototype.update = function() {
    var angle, delta, distance;
    if (this.character) {
      delta = this.clock.getDelta();
      distance = 20 * delta;
      angle = Math.PI / 2 * delta;
      if (key.isPressed('up') || key.isPressed('w')) {
        this.character.translateX(distance);
      }
      if (key.isPressed('down') || key.isPressed('s')) {
        this.character.translateX(-distance);
      }
      if (key.isPressed('space')) {
        this.character.translateZ(distance);
      }
      if (key.isPressed('x')) {
        this.character.translateZ(-distance);
      }
      if (key.isPressed('left') || key.isPressed('a')) {
        this.character.rotateZ(angle);
      }
      if (key.isPressed('right') || key.isPressed('d')) {
        this.character.rotateZ(-angle);
      }
      this.controls.target = this.character.position;
      return this.controls.update();
    }
  };

  Screen.prototype.animate = function() {
    return this.renderer.render(this.scene, this.camera);
  };

  return Screen;

})();
