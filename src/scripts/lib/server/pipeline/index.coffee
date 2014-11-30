attr = require('attr-accessor')
express = require('express')
Archive = require('./archive')

class Pipeline
  module.exports = this

  [get] = attr.accessors(this)

  DATA_DIR = 'data'

  constructor: ->
    @router = express()
    @router.get '/find/:query', @find.bind(this)
    @router.get '/:resource', @serve.bind(this)

  get archive: ->
    @_archive ||= Archive.build(DATA_DIR)

  find: (req, res) ->
    res.send @archive.files.find req.params.query

  serve: (req, res, next) ->
    if file = @archive.files.get req.params.resource
      res.send file.data
    else
      next()
