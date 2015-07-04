const ArrayUtil = require('../../utils/array-util')
const Decoder = require('blizzardry/lib/m2')
const {DecodeStream} = require('blizzardry/lib/restructure')
const Loader = require('../../net/loader')
const Skin = require('./skin')
const THREE = require('three')

module.exports = class M2 {

  constructor(data, skin) {
    this.data = data
    this.skin = skin
    const geometry = this.geometry = new THREE.Geometry()

    data.vertices.forEach(function(vertex) {
      geometry.vertices.push(new THREE.Vector3(...vertex.position))
    })

    const uvs = []

    skin.data.triangles.forEach(function(triangle, faceIndex) {
      var indices = triangle.map(function(index) {
        return skin.data.indices[index]
      })
      geometry.faces.push(new THREE.Face3(...indices))

      uvs[faceIndex] = []
      indices.forEach(function(index) {
        var vertex = data.vertices[index]
        uvs[faceIndex].push(new THREE.Vector2(...(vertex.textureCoords)))
      })
    })

    geometry.faceVertexUvs = [uvs]
  }

  set texture(path) {
    this._texture = THREE.ImageUtils.loadTexture(`pipeline/${path}`)
    this._texture.flipY = false
  }

  get mesh() {
    var material
    if(this._texture) {
      material = new THREE.MeshBasicMaterial({ map: this._texture })
    } else {
      material = new THREE.MeshBasicMaterial({ wireframe: true })
    }
    return new THREE.Mesh(this.geometry, material)
  }

  static load(path, callback) {
    this.loader = this.loader || new Loader()
    this.loader.load(path, (raw) => {
      const stream = new DecodeStream(ArrayUtil.toBuffer(raw))
      const data = Decoder.decode(stream)

      // TODO: Allow configuring quality
      const quality = data.viewCount - 1
      const skinPath = path.replace(/\.m2/i, `0${quality}.skin`)

      Skin.load(skinPath, (skin) => {
        callback(new this(data, skin))
      })
    })
  }

}
