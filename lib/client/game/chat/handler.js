var ChatHandler;

ChatHandler = (function() {
  module.exports = ChatHandler;

  function ChatHandler(session) {
    this.session = session;
    this.messages = [];
    this.session.game.on('packet:receive:SMSG_MESSAGE_CHAT', this.handleMessage, this);
  }

  ChatHandler.prototype.send = function(message) {
    throw new Error('Sending chat messages is not yet implemented');
  };

  ChatHandler.prototype.handleMessage = function(gp) {
    var flags, guid1, guid2, lang, len, message, text, type;
    type = gp.readUnsignedByte();
    lang = gp.readUnsignedInt();
    guid1 = gp.readGUID();
    gp.readUnsignedInt();
    guid2 = gp.readGUID();
    len = gp.readUnsignedInt();
    text = gp.readString(len);
    flags = gp.readUnsignedByte();
    message = new Message();
    message.text = text;
    message.guid = guid1;
    this.messages.push(message);
    return this.trigger('message', message);
  };

  return ChatHandler;

})();
