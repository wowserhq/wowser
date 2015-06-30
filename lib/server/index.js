'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var express = require('express');
var logger = require('morgan');
var Pipeline = require('./pipeline');

module.exports = (function () {
  function Server() {
    var root = arguments[0] === undefined ? __dirname : arguments[0];

    _classCallCheck(this, Server);

    this.root = root;
    this.app = express();

    this.app.set('root', this.root);
    this.app.use(logger('dev'));
    this.app.use(express['static']('./public'));
    this.app.use('/pipeline', new Pipeline().router);
  }

  _createClass(Server, [{
    key: 'run',
    value: function run() {
      this.app.listen(3000);
    }
  }]);

  return Server;
})();