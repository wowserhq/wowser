attr = require('attr-accessor')
ArrayUtil = require('../../utils/array-util')
Decoder = require('blizzardry/lib/m2')
{DecodeStream} = require('blizzardry/lib/restructure')
Loader = require('../../net/loader')
Skin = require('./skin')
THREE = require('three')

class M2
  module.exports = self = this

  [get] = attr.accessors(this)

  constructor: (@data, @skin) ->
    @geometry = new THREE.Geometry()

    for vertex in @data.vertices
      @geometry.vertices.push new THREE.Vector3 vertex.position...

    for triangle in @skin.data.triangles
      indices = triangle.map (index) => @skin.data.indices[index]
      @geometry.faces.push new THREE.Face3 indices...

  get mesh: ->
    material = new THREE.MeshBasicMaterial wireframe: true
    new THREE.Mesh @geometry, material

  @load: (path, callback) ->
    @loader ||= new Loader()
    @loader.load path, (raw) =>
      stream = new DecodeStream(ArrayUtil.toBuffer raw)
      data = Decoder.decode stream

      # TODO: Allow configuring quality
      quality = data.viewCount - 1
      skinPath = path.replace /\.m2/i, "0#{quality}.skin"

      Skin.load skinPath, (skin) ->
        callback new self(data, skin)
