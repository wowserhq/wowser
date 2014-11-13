AuthHandler = require('./auth/handler')
CharactersHandler = require('./characters/handler')
ChatHandler = require('./game/chat/handler')
Config = require('./config')
GameHandler = require('./game/handler')
RealmsHandler = require('./realms/handler')

class Client
  module.exports = this

  constructor: (config) ->
    @config = config || new Config()
    @auth = new AuthHandler(this)
    @realms = new RealmsHandler(this)
    @game = new GameHandler(this)
    @characters = new CharactersHandler(this)
    @chat = new ChatHandler(this)
