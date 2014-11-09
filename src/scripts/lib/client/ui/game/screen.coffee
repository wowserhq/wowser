THREE = require('three')

class Screen
  module.exports = this

  constructor: (@$scope, @$element) ->
    @scene = new THREE.Scene()

    @camera = new THREE.PerspectiveCamera 60, window.innerWidth / window.innerHeight, 1, 1000
    @camera.position.z = 500
    @camera.position.y = 500
    @camera.position.x = 500

    # @controls = new THREE.OrbitControls @camera, @$element[0]
    # @controls.noKeys = true
    # @controls.minPolarAngle = Math.PI * 0.05
    # @controls.maxPolarAngle = Math.PI * 0.45
    # @controls.minDistance = 200
    # @controls.maxDistance = 600

    @renderer = new THREE.WebGLRenderer canvas: @$element[0]
    @renderer.setSize window.innerWidth, window.innerHeight

    axes = new THREE.AxisHelper 150
    axes.position.set 0, 0, 0
    @scene.add axes

    grid = new THREE.GridHelper 300, 10
    grid.setColors new THREE.Color(0x666666), new THREE.Color(0x222222)
    @scene.add grid

    @loader = new THREE.JSONLoader()
    @loader.load 'wotlk/Creature/Illidan/Illidan.m2.3geo', (geometry, materials) =>
      # geometry.applyMatrix(matrix);
      mesh = new THREE.Mesh geometry, new THREE.MeshBasicMaterial(
        color: 0x0099FF,
        wireframe: true
      )
      # mesh.scale.set(scale, scale, scale);
      @scene.add(mesh)

    @run()

  run: ->
    @update()
    @animate()
    requestAnimationFrame =>
      @run()

  update: ->
    # @controls.update()

  animate: ->
    @renderer.render @scene, @camera
