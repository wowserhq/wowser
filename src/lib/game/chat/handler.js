const EventEmitter = require('events');
const Message = require('./message');

module.exports = class ChatHandler extends EventEmitter {

  // Creates a new chat handler
  constructor(session) {
    super();

    // Holds session
    this.session = session;

    // Holds messages
    this.messages = [
      new Message('system', 'Welcome to Wowser!'),
      new Message('system', 'This is a very alpha-ish build.'),

      new Message('info', 'This is an info message'),
      new Message('error', 'This is an error message'),
      new Message('area', 'Player: This is a message emitted nearby'),
      new Message('channel', '[Trade]: This is a channel message'),
      new Message('whisper outgoing', 'To Someone: This is an outgoing whisper'),
      new Message('whisper incoming', 'Someone: This is an incoming whisper'),
      new Message('guild', '[Guild] Someone: This is a guild message')
    ];

    // Listen for messages
    this.session.game.on('packet:receive:SMSG_MESSAGE_CHAT', ::this.handleMessage);
  }

  // Creates chat message
  create() {
    return new Message();
  }

  // Sends given message
  send(message) {
    throw new Error('sending chat messages is not yet implemented');
  }

  // Message handler (SMSG_MESSAGE_CHAT)
  handleMessage(gp) {
    const type = gp.readUnsignedByte();
    const lang = gp.readUnsignedInt();
    const guid1 = gp.readGUID();
    gp.readUnsignedInt();
    const guid2 = gp.readGUID();
    const len = gp.readUnsignedInt();
    const text = gp.readString(len);
    const flags = gp.readUnsignedByte();

    const message = new Message();
    message.text = text;
    message.guid = guid1;

    this.messages.push(message);

    this.emit('message', message);
  }

};
