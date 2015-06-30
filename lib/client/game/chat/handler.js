'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var EventEmitter = require('events');
var Message = require('./message');

module.exports = (function (_EventEmitter) {

  // Creates a new chat handler

  function ChatHandler(session) {
    _classCallCheck(this, ChatHandler);

    _get(Object.getPrototypeOf(ChatHandler.prototype), 'constructor', this).call(this);

    // Holds session
    this.session = session;

    // Holds messages
    this.messages = [];

    // Listen for messages
    this.session.game.on('packet:receive:SMSG_MESSAGE_CHAT', this.handleMessage.bind(this));
  }

  _inherits(ChatHandler, _EventEmitter);

  _createClass(ChatHandler, [{
    key: 'send',

    // Sends given message
    value: function send(message) {
      throw new Error('sending chat messages is not yet implemented');
    }
  }, {
    key: 'handleMessage',

    // Message handler (SMSG_MESSAGE_CHAT)
    value: function handleMessage(gp) {
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

      this.emit('message', message);
    }
  }]);

  return ChatHandler;
})(EventEmitter);