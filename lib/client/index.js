var AuthHandler, Client, Config, RealmsHandler;

AuthHandler = require('./auth/handler');

Config = require('./config');

RealmsHandler = require('./realms/handler');

Client = (function() {
  module.exports = Client;

  function Client(config) {
    this.config = config || new Config();
    this.auth = new AuthHandler(this);
    this.realms = new RealmsHandler(this);
  }

  return Client;

})();
