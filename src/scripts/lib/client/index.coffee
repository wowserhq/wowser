AuthHandler   = require('./auth/handler')
Config        = require('./config')
RealmsHandler = require('./realms/handler')

# Denotes a single game client/session
class Client
  module.exports = @

  constructor: (config) ->
    @config = config || new Config()
    @auth = new AuthHandler(@)
    @realms = new RealmsHandler(@)
    # @game = new GameHandler(@)
    # @characters = new CharactersHandler(@)
    # @chat = new ChatHandler(@)
