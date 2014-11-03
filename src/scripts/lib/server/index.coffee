express = require('express')
logger  = require('morgan')

class Server
  module.exports = @

  constructor: (@root = __dirname) ->
    @app = express()

    @app.set 'root', @root
    @app.use logger('dev')
    @app.use express.static('./public')

  run: ->
    @app.listen(3000)
