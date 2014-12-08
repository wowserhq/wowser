var ChatHandler, EventEmitter, Message,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('events');

Message = require('./message');

ChatHandler = (function(_super) {
  __extends(ChatHandler, _super);

  module.exports = ChatHandler;

  function ChatHandler(session) {
    this.session = session;
    this.messages = [];
    this.session.game.on('packet:receive:SMSG_MESSAGE_CHAT', this.handleMessage.bind(this));
  }

  ChatHandler.prototype.send = function(message) {
    throw new Error('sending chat messages is not yet implemented');
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
    return this.emit('message', message);
  };

  return ChatHandler;

})(EventEmitter);
