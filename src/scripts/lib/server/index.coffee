express = require('express')
logger = require('morgan')
Pipeline = require('./pipeline')

class Server
  module.exports = this

  constructor: (@root = __dirname) ->
    @app = express()

    @app.set 'root', @root
    @app.use logger('dev')
    @app.use express.static('./public')
    @app.use '/pipeline', new Pipeline().router

  run: ->
    @app.listen(3000)
