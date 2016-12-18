import EventEmitter from 'events';

import Message from './message';
import GamePacket from '../packet';
import GameOpcode from '../opcode';

class ChatHandler extends EventEmitter {

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
  send(_message) {
    const app = new GamePacket(GameOpcode.CMSG_MESSAGE_CHAT, 64+_message.length);
    app.writeUnsignedInt(1); // type , 1: say [TODO: select channel ]
    app.writeUnsignedInt(1); // lang , 0: universal [TODO: use race specific ]
    app.writeString(_message);

    this.session.game.send(app);
    return true;
  }

  // Message handler (SMSG_MESSAGE_CHAT)
  handleMessage(gp) {
    const type = gp.readUnsignedByte(); // type
    const lang = gp.readUnsignedInt(); // language
    const guid1 = gp.readGUID();
    const unk1 = gp.readUnsignedInt();
    const guid2 = gp.readGUID(); // guid2
    const len = gp.readUnsignedInt();
    const text = gp.readString(len);
    const flags = gp.readUnsignedByte(); // flags

    const message = new Message();
    message.text = text;
    message.guid = guid1;

    this.messages.push(message);

    this.emit('message', message);
  }

}

export default ChatHandler;
