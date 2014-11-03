var Server, express, logger;

express = require('express');

logger = require('morgan');

Server = (function() {
  module.exports = Server;

  function Server(root) {
    this.root = root != null ? root : __dirname;
    this.app = express();
    this.app.set('root', this.root);
    this.app.use(logger('dev'));
    this.app.use(express["static"]('./public'));
  }

  Server.prototype.run = function() {
    return this.app.listen(3000);
  };

  return Server;

})();
