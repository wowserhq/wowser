Wowser.Entities.Realm = (function() {
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

  Realm.getter('host', function() {
    return this._host;
  });

  Realm.getter('port', function() {
    return this._port;
  });

  Realm.getter('address', function() {
    return this._address;
  });

  Realm.setter('address', function(address) {
    var parts;
    this._address = address;
    parts = this._address.split(':');
    this._host = parts[0] || null;
    return this._port = parts[1] || NaN;
  });

  return Realm;

})();
