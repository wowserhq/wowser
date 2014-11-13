var Realm, attr;

attr = require('attr-accessor');

Realm = (function() {
  var get, set, _ref;

  module.exports = Realm;

  _ref = attr.accessors(Realm), get = _ref[0], set = _ref[1];

  function Realm() {
    this._host = null;
    this._port = NaN;
    this._address = null;
    this.name = null;
    this.id = null;
    this.icon = null;
    this.flags = null;
    this.timezone = null;
    this.population = 0.0;
    this.characters = 0;
  }

  Realm.prototype.toString = function() {
    return "[Realm; Name: " + this.name + "; Address: " + this._address + "; Characters: " + this.characters + "]";
  };

  get({
    host: function() {
      return this._host;
    }
  });

  get({
    port: function() {
      return this._port;
    }
  });

  get({
    address: function() {
      return this._address;
    }
  });

  set({
    address: function(address) {
      var parts;
      this._address = address;
      parts = this._address.split(':');
      this._host = parts[0] || null;
      return this._port = parts[1] || NaN;
    }
  });

  return Realm;

})();
