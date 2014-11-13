var AuthHandler, CharactersHandler, ChatHandler, Client, Config, GameHandler, RealmsHandler;

AuthHandler = require('./auth/handler');

CharactersHandler = require('./characters/handler');

ChatHandler = require('./game/chat/handler');

Config = require('./config');

GameHandler = require('./game/handler');

RealmsHandler = require('./realms/handler');

Client = (function() {
  module.exports = Client;

  function Client(config) {
    this.config = config || new Config();
    this.auth = new AuthHandler(this);
    this.realms = new RealmsHandler(this);
    this.game = new GameHandler(this);
    this.characters = new CharactersHandler(this);
    this.chat = new ChatHandler(this);
  }

  return Client;

})();
