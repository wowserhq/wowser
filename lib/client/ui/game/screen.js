var Orbit, Screen, THREE;

Orbit = require('../orbit');

THREE = require('three');

Screen = (function() {
  module.exports = Screen;

  function Screen($scope, $element) {
    var axes, grid;
    this.$scope = $scope;
    this.$element = $element;
    this.scene = new THREE.Scene();
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
    this.load('Creature\\Rabbit\\Rabbit.m2.3js', 'Creature\\Rabbit\\RabbitSkin.blp.png', (function(_this) {
      return function(model) {
        return _this.scene.add(model);
      };
    })(this));
    this.load('Creature\\RAGNAROS\\RAGNAROS.m2.3js', 'Creature\\RAGNAROS\\RAGNAROSSKIN.blp.png', (function(_this) {
      return function(model) {
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

  Screen.prototype.update = function() {};

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
