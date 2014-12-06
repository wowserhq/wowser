var Screen, THREE;

THREE = require('three');

Screen = (function() {
  module.exports = Screen;

  function Screen($scope, $element) {
    var axes, grid;
    this.$scope = $scope;
    this.$element = $element;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.x = 0;
    this.camera.position.z = 40;
    this.camera.position.y = 10;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.$element[0]
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    grid = new THREE.GridHelper(300, 10);
    grid.setColors(new THREE.Color(0x666666), new THREE.Color(0x222222));
    this.scene.add(grid);
    axes = new THREE.AxisHelper(20);
    this.scene.add(axes);
    this.loader = new THREE.JSONLoader();
    this.loader.load('pipeline/Creature%5CIllidan%5CIllidan.m2.3geo', (function(_this) {
      return function(geometry, materials) {
        var mesh;
        mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
          color: 0x0099FF,
          wireframe: true
        }));
        return _this.scene.add(mesh);
      };
    })(this));
    this.run();
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

  return Screen;

})();
