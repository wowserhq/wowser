attr = require('attr-accessor')
ArrayUtil = require('../../utils/array-util')
Decoder = require('blizzardry/lib/adt')
{DecodeStream} = require('blizzardry/lib/restructure')
Loader = require('../../net/loader')
THREE = require('three')

class ADT
  module.exports = self = this

  [get] = attr.accessors(this)

  constructor: (@data) ->
    @geometry = new THREE.Geometry()
    @geometry.faces = faces = []
    @geometry.vertices = vertices = []

    size = 33.333333
    step = size / 8

    # See: http://www.pxr.dk/wowdev/wiki/index.php?title=ADT#MCVT_sub-chunk
    for cy in [0...16]
      for cx in [0...16]
        cindex = cy * 16 + cx
        chunk = @data.MCNKs[cindex]

        chunk.MCVT.heights.forEach (height, index) ->
          y = index // 17
          x = index % 17
          if x > 8
            y += 0.5
            x -= 8.5
          vertex = new THREE.Vector3 cx * size + x * step, cy * size + y * step, chunk.position.z + height
          vertices.push vertex

        coffset = cindex * 145
        index = coffset + 9
        for y in [0...8]
          for x in [0...8]
            faces.push new THREE.Face3 index, index - 9, index - 8
            faces.push new THREE.Face3 index, index - 8, index + 9
            faces.push new THREE.Face3 index, index + 9, index + 8
            faces.push new THREE.Face3 index, index + 8, index - 9
            index++
          index += 9

  get mesh: ->
    material = new THREE.MeshBasicMaterial wireframe: true
    new THREE.Mesh @geometry, material

  @load: (path, callback) ->
    @loader ||= new Loader()
    @loader.load path, (raw) =>
      stream = new DecodeStream(ArrayUtil.toBuffer raw)
      data = Decoder.decode stream
      callback new self(data)
