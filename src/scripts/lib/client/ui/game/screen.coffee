THREE = require('three')

class Screen
  module.exports = this

  constructor: (@$scope, @$element) ->
    @scene = new THREE.Scene()

    @camera = new THREE.PerspectiveCamera 60, window.innerWidth / window.innerHeight, 1, 1000
    @camera.position.x = 0
    @camera.position.z = 40
    @camera.position.y = 10

    # @controls = new THREE.OrbitControls @camera, @$element[0]
    # @controls.noKeys = true
    # @controls.minPolarAngle = Math.PI * 0.05
    # @controls.maxPolarAngle = Math.PI * 0.45
    # @controls.minDistance = 200
    # @controls.maxDistance = 600

    @renderer = new THREE.WebGLRenderer canvas: @$element[0]
    @renderer.setSize window.innerWidth, window.innerHeight

    grid = new THREE.GridHelper 300, 10
    grid.setColors new THREE.Color(0x666666), new THREE.Color(0x222222)
    @scene.add grid

    axes = new THREE.AxisHelper 20
    @scene.add axes

    @loader = new THREE.JSONLoader()
    @loader.load 'pipeline/Creature/Illidan/Illidan.m2.3geo', (geometry, materials) =>
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
