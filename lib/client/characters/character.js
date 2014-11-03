Wowser.Entities.Character = (function() {
  function Character() {}

  Character.prototype.toString = function() {
    return "[Character; GUID: " + this.guid + "]";
  };

  return Character;

})();
