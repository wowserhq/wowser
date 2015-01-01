attr = require('attr-accessor')
express = require('express')
find = require('array-find')
Archive = require('./archive')
BLP = require('blizzardry/lib/blp')
DecodeStream = require('blizzardry/node_modules/restructure/src/DecodeStream')
DBC = require('blizzardry/lib/dbc/entities')
M2 = require('blizzardry/lib/m2')
{PNG} = require('pngjs')
Skin = require('blizzardry/lib/m2/skin')

# TODO: Find a module for this
flatten = (array) ->
  array.reduce (a, b) -> a.concat(b)

class Pipeline
  module.exports = this

  [get] = attr.accessors(this)

  DATA_DIR = 'data'

  constructor: ->
    @router = express()
    @router.param 'resource', @resource.bind(this)
    @router.get '/:resource(*.blp).png', @blp.bind(this)
    @router.get '/:resource(*.dbc)/:id(*)?.json', @dbc.bind(this)
    @router.get '/:resource(*.m2).3geo', @m2.bind(this)
    @router.get '/find/:query', @find.bind(this)
    @router.get '/:resource', @serve.bind(this)

  get archive: ->
    @_archive ||= Archive.build(DATA_DIR)

  resource: (req, res, next, path) ->
    req.resourcePath = path
    if req.resource = @archive.files.get path
      next()
    else
      err = new Error 'resource not found'
      err.status = 404
      throw err

  blp: (req, res) ->
    BLP.from req.resource.data, (blp) ->
      mipmap = blp.largest

      png = new PNG(width: mipmap.width, height: mipmap.height)
      png.data = mipmap.data

      res.set 'Content-Type', 'image/png'
      png.pack().pipe(res)

  dbc: (req, res) ->
    name = req.resourcePath.match(/(\w+)\.dbc/)[1]
    if definition = DBC[name]
      dbc = definition.dbc.decode new DecodeStream(req.resource.data)
      if id = req.params[0]
        if entity = find(dbc.records, (entity) -> String(entity.id) == id)
          res.send entity
        else
          err = new Error 'entity not found'
          err.status = 404
          throw err
      else
        res.send dbc.records
    else
      err = new Error 'entity definition not found'
      err.status = 404
      throw err

  skinFor: (m2, req) ->
    # TODO: Quality should be verified against M2's viewCount
    quality = req.query.quality || 0
    path = req.resourcePath.replace '.m2', "0#{quality}.skin"
    if skin = @archive.files.get path
      Skin.decode new DecodeStream(skin.data)

  m2: (req, res, next) ->
    m2 = M2.decode new DecodeStream(req.resource.data)
    unless skin = @skinFor(m2, req)
      err = new Error 'skin not found for M2'
      err.status = 404
      throw err

    vertices = m2.vertices.map (vertex) -> vertex.position
    faces = []
    uvs = m2.vertices.map (vertex) -> vertex.textureCoords

    skin.triangles.forEach (vertices, index) ->
      face = [1 << 3]

      for index, i in vertices
        face[1 + i] = skin.indices[index]
        face[1 + i + 3] = skin.indices[index]

      faces.push face

    res.send {
      vertices: flatten vertices
      faces: flatten faces
      uvs: [flatten uvs]
    }

  find: (req, res) ->
    res.send @archive.files.find req.params.query

  serve: (req, res, next) ->
    res.send req.resource.data
