var Character;

Character = (function() {
  function Character() {}

  module.exports = Character;

  Character.prototype.toString = function() {
    return "[Character; GUID: " + this.guid + "]";
  };

  return Character;

})();
