'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var AuthHandler = require('./auth/handler');
var CharactersHandler = require('./characters/handler');
var ChatHandler = require('./game/chat/handler');
var Config = require('./config');
var GameHandler = require('./game/handler');
var RealmsHandler = require('./realms/handler');

module.exports = function Client(config) {
  _classCallCheck(this, Client);

  this.config = config || new Config();
  this.auth = new AuthHandler(this);
  this.realms = new RealmsHandler(this);
  this.game = new GameHandler(this);
  this.characters = new CharactersHandler(this);
  this.chat = new ChatHandler(this);
};