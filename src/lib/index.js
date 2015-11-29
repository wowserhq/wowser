import EventEmitter from 'events';

import AuthHandler from './auth/handler';
import CharactersHandler from './characters/handler';
import ChatHandler from './game/chat/handler';
import Config from './config';
import GameHandler from './game/handler';
import Player from './game/player';
import RealmsHandler from './realms/handler';
import WorldHandler from './game/world/handler';

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
