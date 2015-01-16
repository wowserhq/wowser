var Orbit, Screen, THREE, key;

key = require('keymaster');

Orbit = require('../orbit');

THREE = require('three');

Screen = (function() {
  module.exports = Screen;

  function Screen($scope, $element) {
    var axes, grid;
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
    grid = new THREE.GridHelper(300, 10);
    grid.setColors(new THREE.Color(0x666666), new THREE.Color(0x222222));
    this.scene.add(grid);
    axes = new THREE.AxisHelper(20);
    this.scene.add(axes);
    this.character = null;
    this.load('Creature\\Rabbit\\Rabbit.m2.3js', 'Creature\\Rabbit\\RabbitSkin.blp.png', (function(_this) {
      return function(model) {
        model.position.x = 2;
        model.position.y = -1;
        return _this.scene.add(model);
      };
    })(this));
    this.load('Creature\\Illidan\\Illidan.m2.3js', 'Creature\\Illidan\\Illidan.blp.png', (function(_this) {
      return function(model) {
        _this.character = model;
        return _this.scene.add(model);
      };
    })(this));
    this.load('Creature\\RAGNAROS\\RAGNAROS.m2.3js', 'Creature\\RAGNAROS\\RAGNAROSSKIN.blp.png', (function(_this) {
      return function(model) {
        model.position.x = -5;
        model.position.y = 5.5;
        model.scale.set(0.3, 0.3, 0.3);
        return _this.scene.add(model);
      };
    })(this));
    this.load('Creature\\MurlocCostume\\murloccostume_whiteflag.M2.3js', 'Creature\\MurlocCostume\\MURLOCCOSTUME.blp.png', (function(_this) {
      return function(model) {
        model.position.x = 2;
        model.position.y = 1.5;
        return _this.scene.add(model);
      };
    })(this));
    this.load('World\\Maps\\Azeroth\\Azeroth_31_49.adt.3js', null, (function(_this) {
      return function(model) {
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
        this.character.rotation.z += angle;
      }
      if (key.isPressed('right') || key.isPressed('d')) {
        this.character.rotation.z -= angle;
      }
      this.controls.target = this.character.position;
      return this.controls.update();
    }
  };

  Screen.prototype.animate = function() {
    return this.renderer.render(this.scene, this.camera);
  };

  Screen.prototype.load = function(path, texturePath, callback) {
    this.loader || (this.loader = new THREE.JSONLoader());
    return this.loader.load("pipeline/" + path, (function(_this) {
      return function(geometry) {
        var material, mesh, texture;
        material = texturePath ? (texture = THREE.ImageUtils.loadTexture("pipeline/" + texturePath), texture.flipY = false, new THREE.MeshBasicMaterial({
          map: texture
        })) : new THREE.MeshBasicMaterial({
          wireframe: true
        });
        mesh = new THREE.Mesh(geometry, material);
        return callback(mesh);
      };
    })(this));
  };

  return Screen;

})();
