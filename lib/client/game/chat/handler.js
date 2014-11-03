Wowser.Expansion.WotLK.Handlers.ChatHandler = (function() {
  var Message, WorldOpcode, WorldPacket;

  ChatHandler.include(BackboneEvents);

  Message = Wowser.Entities.Message;

  WorldOpcode = Wowser.Expansion.WotLK.Enums.WorldOpcode;

  WorldPacket = Wowser.Expansion.WotLK.Net.WorldPacket;

  function ChatHandler(session) {
    this.session = session;
    this.messages = [];
    this.session.world.on('packet:receive:SMSG_MESSAGE_CHAT', this.handleMessage, this);
  }

  ChatHandler.prototype.send = function(message) {
    throw new Error('Sending chat messages is not yet implemented');
  };

  ChatHandler.prototype.handleMessage = function(wp) {
    var flags, guid1, guid2, lang, len, message, text, type;
    type = wp.readUnsignedByte();
    lang = wp.readUnsignedInt();
    guid1 = wp.readGUID();
    wp.readUnsignedInt();
    guid2 = wp.readGUID();
    len = wp.readUnsignedInt();
    text = wp.readString(len);
    flags = wp.readUnsignedByte();
    message = new Message();
    message.text = text;
    message.guid = guid1;
    this.messages.push(message);
    return this.trigger('message', message);
  };

  return ChatHandler;

})();
