'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var key = require('keymaster');
var ADT = require('../../pipeline/adt');
var M2 = require('../../pipeline/m2');
var Orbit = require('../orbit');
var THREE = require('three');

module.exports = (function () {
  function Screen($scope, $element) {
    var _this = this;

    _classCallCheck(this, Screen);

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

    var axes = new THREE.AxisHelper(20);
    this.scene.add(axes);

    this.character = null;

    M2.load('Creature\\Rabbit\\Rabbit.m2', function (m2) {
      m2.texture = 'Creature\\Rabbit\\RabbitSkin.blp.png';
      var model = m2.mesh;
      model.position.x = 2;
      model.position.y = -1;
      _this.scene.add(model);
    });

    M2.load('Creature\\Illidan\\Illidan.m2', function (m2) {
      m2.texture = 'Creature\\Illidan\\Illidan.blp.png';
      var model = m2.mesh;
      _this.character = model;
      _this.scene.add(model);
    });

    M2.load('Creature\\RAGNAROS\\RAGNAROS.m2', function (m2) {
      m2.texture = 'Creature\\RAGNAROS\\RAGNAROSSKIN.blp.png';
      var model = m2.mesh;
      model.position.x = -5;
      model.position.y = 5.5;
      model.scale.set(0.3, 0.3, 0.3);
      _this.scene.add(model);
    });

    M2.load('Creature\\MurlocCostume\\murloccostume_whiteflag.M2', function (m2) {
      m2.texture = 'Creature\\MurlocCostume\\MURLOCCOSTUME.blp.png';
      var model = m2.mesh;
      model.position.x = 2;
      model.position.y = 1.5;
      _this.scene.add(model);
    });

    ADT.load('World\\Maps\\Azeroth\\Azeroth_31_49.adt', function (adt) {
      var model = adt.mesh;
      model.position.x = -266.667;
      model.position.y = -266.667;
      model.position.z = -67;
      _this.scene.add(model);
    });

    this.run();
    this.controls.update();
  }

  _createClass(Screen, [{
    key: 'run',
    value: function run() {
      var _this2 = this;

      this.update();
      this.animate();
      requestAnimationFrame(function () {
        _this2.run();
      });
    }
  }, {
    key: 'update',
    value: function update() {
      if (!this.character) {
        return;
      }

      var delta = this.clock.getDelta();
      var distance = 20 * delta;
      var angle = Math.PI / 2 * delta;

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
      this.controls.update();
    }
  }, {
    key: 'animate',
    value: function animate() {
      this.renderer.render(this.scene, this.camera);
    }
  }]);

  return Screen;
})();