var ChatMessage;

ChatMessage = (function() {
  module.exports = ChatMessage;

  function ChatMessage() {
    this.timestamp = new Date();
  }

  ChatMessage.prototype.toString = function() {
    return "[Message; Text: " + this.text + "; GUID: " + this.guid + "]";
  };

  return ChatMessage;

})();
