Wowser.Entities.Message = (function() {
  function Message() {
    this.timestamp = new Date();
  }

  Message.prototype.toString = function() {
    return "[Message; Text: " + this.text + "; GUID: " + this.guid + "]";
  };

  return Message;

})();
