'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {

  // Creates a new realm

  function Realm() {
    _classCallCheck(this, Realm);

    // Holds host, port and address
    this._host = null;
    this._port = NaN;
    this._address = null;

    // Holds realm attributes
    this.name = null;
    this.id = null;
    this.icon = null;
    this.flags = null;
    this.timezone = null;
    this.population = 0.0;
    this.characters = 0;
  }

  _createClass(Realm, [{
    key: 'toString',

    // Short string representation of this realm
    value: function toString() {
      return '[Realm; Name: ' + this.name + '; Address: ' + this._address + '; Characters: ' + this.characters + ']';
    }
  }, {
    key: 'host',

    // Retrieves host for this realm
    get: function get() {
      return this._host;
    }
  }, {
    key: 'port',

    // Retrieves port for this realm
    get: function get() {
      return this._port;
    }
  }, {
    key: 'address',

    // Retrieves address for this realm
    get: function get() {
      return this._address;
    },

    // Sets address for this realm
    set: function set(address) {
      this._address = address;
      parts = this._address.split(':');
      this._host = parts[0] || null;
      this._port = parts[1] || NaN;
    }
  }]);

  return Realm;
})();