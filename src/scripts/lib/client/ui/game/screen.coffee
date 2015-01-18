key = require('keymaster')
M2 = require('../../pipeline/m2')
Orbit = require('../orbit')
THREE = require('three')

class Screen
  module.exports = this

  constructor: (@$scope, @$element) ->
    @scene = new THREE.Scene()
    @clock = new THREE.Clock()

    @camera = new THREE.PerspectiveCamera 60, window.innerWidth / window.innerHeight, 1, 1000
    @camera.up.set 0, 0, 1

    @controls = new Orbit @camera, @$element[0]
    @controls.noKeys = true
    @controls.noPan = true
    @controls.minPolarAngle = 0
    @controls.maxPolarAngle = Math.PI * 0.5
    @controls.minDistance = 10
    @controls.maxDistance = 600

    @renderer = new THREE.WebGLRenderer canvas: @$element[0]
    @renderer.setSize window.innerWidth, window.innerHeight

    grid = new THREE.GridHelper 300, 10
    grid.setColors new THREE.Color(0x666666), new THREE.Color(0x222222)
    @scene.add grid

    axes = new THREE.AxisHelper 20
    @scene.add axes

    @character = null

    # TODO: Apply texture ('Creature\\Rabbit\\RabbitSkin.blp.png')
    M2.load 'Creature\\Rabbit\\Rabbit.m2', (m2) =>
      model = m2.mesh
      model.position.x = 2
      model.position.y = -1
      @scene.add model

    # TODO: Apply texture ('Creature\\Illidan\\Illidan.blp.png')
    M2.load 'Creature\\Illidan\\Illidan.m2', (m2) =>
      model = m2.mesh
      @character = model
      @scene.add model

    # TODO: Apply texture ('Creature\\RAGNAROS\\RAGNAROSSKIN.blp.png')
    M2.load 'Creature\\RAGNAROS\\RAGNAROS.m2', (m2) =>
      model = m2.mesh
      model.position.x = -5
      model.position.y = 5.5
      model.scale.set 0.3, 0.3, 0.3
      @scene.add model

    # TODO: Apply texture ('Creature\\MurlocCostume\\MURLOCCOSTUME.blp.png')
    M2.load 'Creature\\MurlocCostume\\murloccostume_whiteflag.M2', (m2) =>
      model = m2.mesh
      model.position.x = 2
      model.position.y = 1.5
      @scene.add model

    # ADT.load 'World\\Maps\\Azeroth\\Azeroth_31_49.adt.3js', null, (model) =>
    #   model.position.x = -266.667
    #   model.position.y = -266.667
    #   model.position.z = -67
    #   @scene.add model

    @run()
    @controls.update()

  run: ->
    @update()
    @animate()
    requestAnimationFrame =>
      @run()

  update: ->
    if @character

      delta = @clock.getDelta()
      distance = 20 * delta
      angle = Math.PI / 2 * delta

      if key.isPressed('up') || key.isPressed('w')
        @character.translateX distance

      if key.isPressed('down') || key.isPressed('s')
        @character.translateX -distance

      if key.isPressed('space')
        @character.translateZ distance

      if key.isPressed('x')
        @character.translateZ -distance

      if key.isPressed('left') || key.isPressed('a')
        @character.rotateZ angle

      if key.isPressed('right') || key.isPressed('d')
        @character.rotateZ -angle

      @controls.target = @character.position
      @controls.update()

  animate: ->
    @renderer.render @scene, @camera

  # load: (path, texturePath, callback) ->
  #   @loader ||= new THREE.JSONLoader()
  #   @loader.load "pipeline/#{path}", (geometry) =>
  #     material = if texturePath
  #       texture = THREE.ImageUtils.loadTexture "pipeline/#{texturePath}"
  #       texture.flipY = false
  #       new THREE.MeshBasicMaterial map: texture
  #     else
  #       new THREE.MeshBasicMaterial wireframe: true
  #     mesh = new THREE.Mesh geometry, material
  #     callback(mesh)
