attr = require('attr-accessor')
express = require('express')
Archive = require('./archive')
DecodeStream = require('blizzardry/node_modules/restructure/src/DecodeStream')
DBC = require('blizzardry/lib/dbc/entities')
M2 = require('blizzardry/lib/m2')
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
    @router.get '/:resource(*.dbc).json', @dbc.bind(this)
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

  dbc: (req, res) ->
    name = req.resourcePath.match(/(\w+)\.dbc/)[1]
    if entity = DBC[name]
      dbc = entity.dbc.decode new DecodeStream(req.resource.data)
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

    res.send {
      metadata: {
        formatVersion: 3
      }
      vertices: flatten m2.vertices.map (vertex) -> vertex.position
      faces: flatten skin.triangles.map (triangle) ->
        [0].concat triangle.map (vi) ->
          skin.indices[vi]
    }

  find: (req, res) ->
    res.send @archive.files.find req.params.query

  serve: (req, res, next) ->
    res.send req.resource.data
