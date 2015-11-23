const EventEmitter = require('events');

const AuthHandler = require('./auth/handler');
const CharactersHandler = require('./characters/handler');
const ChatHandler = require('./game/chat/handler');
const Config = require('./config');
const GameHandler = require('./game/handler');
const Player = require('./game/player');
const RealmsHandler = require('./realms/handler');
const WorldHandler = require('./game/world/handler');

module.exports = class Client extends EventEmitter {

  constructor(config) {
    super();

    this.config = config || new Config();
    this.auth = new AuthHandler(this);
    this.realms = new RealmsHandler(this);
    this.game = new GameHandler(this);
    this.characters = new CharactersHandler(this);
    this.chat = new ChatHandler(this);
    this.player = new Player();
    this.world = new WorldHandler(this);
  }

};
