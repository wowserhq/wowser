AuthHandler   = require('./auth/handler')
Config        = require('./config')
RealmsHandler = require('./realms/handler')

# Denotes a single game client/session
class Client
  module.exports = this

  constructor: (config) ->
    @config = config || new Config()
    @auth = new AuthHandler(this)
    @realms = new RealmsHandler(this)
    # @game = new GameHandler(this)
    # @characters = new CharactersHandler(this)
    # @chat = new ChatHandler(this)
