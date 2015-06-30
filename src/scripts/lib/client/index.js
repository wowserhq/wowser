const AuthHandler = require('./auth/handler')
const CharactersHandler = require('./characters/handler')
const ChatHandler = require('./game/chat/handler')
const Config = require('./config')
const GameHandler = require('./game/handler')
const RealmsHandler = require('./realms/handler')

module.exports = class Client {

  constructor(config) {
    this.config = config || new Config()
    this.auth = new AuthHandler(this)
    this.realms = new RealmsHandler(this)
    this.game = new GameHandler(this)
    this.characters = new CharactersHandler(this)
    this.chat = new ChatHandler(this)
  }

}
