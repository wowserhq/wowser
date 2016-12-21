import EventEmitter from 'events';

import Message from './message';
import GamePacket from '../packet';
import GameOpcode from '../opcode';
import ChatEnum from './chatEnum';

class ChatHandler extends EventEmitter {


  // Creates a new chat handler
  constructor(session) {
    super();

    // Holds session
    this.session = session;
    
    // [guid] = name
    this.playerNames = [];

    this.playerNames[0] = { name : "SYSTEM" };

    // Holds messages
    this.sayMessages = [
      new Message('system', 'This is a very alpha-ish build.',0),

      new Message('info', 'This is an info message',0),
      new Message('error', 'This is an error message',0),
      new Message('area', 'Player: This is a message emitted nearby',0),
      new Message('channel', '[Trade]: This is a channel message',0),
      new Message('whisper outgoing', 'To Someone: This is an outgoing whisper',0),
      new Message('whisper incoming', 'Someone: This is an incoming whisper',0),
      new Message('guild', '[Guild] Someone: This is a guild message',0)
    ];

    this.guildMessages = [];
    this.worldMessages = []

    // Listen for messages
    this.session.game.on('packet:receive:SMSG_GM_MESSAGECHAT', ::this.handleGmMessage);
    this.session.game.on('packet:receive:SMSG_MESSAGE_CHAT', ::this.handleMessage);
    this.session.game.on('packet:receive:SMSG_NAME_QUERY_RESPONSE', ::this.handleName);
  }

  // Creates chat message
  create() {
    return new Message();
  }

  // Sends given message
  send(_message,type) {
    var size=64+_message.length;

    var channel = "world\0";


    if (type==ChatEnum.CHAT_MSG_CHANNEL) {
        size += channel.length;
    }

    const app = new GamePacket(GameOpcode.CMSG_MESSAGE_CHAT, size);
    app.writeUnsignedInt(type); // type

    app.writeUnsignedInt(0); // lang , 0: universal [TODO: use race specific ]

    switch(type) {
        case ChatEnum.CHAT_MSG_SAY:
        case ChatEnum.CHAT_MSG_GUILD:
              app.writeString(_message);
        break;
        case ChatEnum.CHAT_MSG_CHANNEL:
              app.writeString(channel);
              app.writeString(_message);
        break;
    }

    this.session.game.send(app);
    return true;
  }
  
  handleName(gp) {
    //const guid = gp.readUnsignedByte();
    //const name_known = gp.readUnsignedByte();
    const unk  = gp.readUnsignedByte();
    const guid = gp.readUnsignedByte();
    const name = gp.readString();
    
    // the buffer is empty now o_O
    /*
    const realm_name = gp.readUnsignedByte(); // only for crossrealm
    const race = gp.readUnsignedByte();
    const gender = gp.readUnsignedByte(); // guid2
    const playerClass = gp.readUnsignedByte();
    const declined = gp.readUnsignedByte();
    */
    
    this.playerNames[guid] = {
        name : name
        //race : race,
        //gender : gender,
        //playerClass : playerClass
    };
    
    this.emit("message",null); // to refresh
  }
  
  askName(guid) {
    const app = new GamePacket(GameOpcode.CMSG_NAME_QUERY, 64);
    app.writeGUID(guid);

    this.session.game.send(app);
    return true;
  }

  handleGmMessage(gp) {
    this.handleMessage(gp,true);
  }

  // Message handler (SMSG_MESSAGE_CHAT)
  handleMessage(gp,isGm) {
    const type = gp.readUnsignedByte(); // type
    const lang = gp.readUnsignedInt(); // language
    const guid1 = gp.readGUID();
    const unk1 = gp.readUnsignedInt();

    if (isGm === true)
    {
        var nameLen =  gp.readUnsignedInt();
        var senderName = gp.readString(nameLen);

        this.playerNames[guid1.low] = { 
            name : senderName,
            isGm : true
        };

    } else {
        if (!this.playerNames[guid1.low]) {    
            this.playerNames[guid1.low]= { name: guid1.low };
            this.askName(guid1);
        }
    }

    var channelName="";

    const len = 0;
    const text = "";
    const flags = 0;

    if (type === ChatEnum.CHAT_MSG_CHANNEL)
    {
        // hardcoded channel
        channelName = gp.readString(5);
        if (channelName !== "world")
          return;

        len = gp.length - 26; // channel buffer min size

        text = gp.readString(len);
    } else {
      const guid2 = gp.readGUID(); // guid2

      if (!this.playerNames[guid2.low]) {
          this.playerNames[guid2.low]= { name: guid2.low };
          this.askName(guid2);
      }

      len = gp.readUnsignedInt();

      text = gp.readString(len);

      flags = gp.readUnsignedByte(); // flags
    }

    const message = null;

    switch(type) {
        case ChatEnum.CHAT_MSG_SAY:
            message = new Message("area", text, guid1.low);
            this.sayMessages.push(message);
        break;
        case ChatEnum.CHAT_MSG_EMOTE:
            message = new Message("me", text, guid1.low);
            this.sayMessages.push(message);
        break;
        case ChatEnum.CHAT_MSG_YELL:
            message = new Message("yell", text, guid1.low);
            this.sayMessages.push(message);
        break;
        case ChatEnum.CHAT_MSG_GUILD:
            message = new Message("guild", text, guid1.low);
            this.guildMessages.push(message);
        break;
        case ChatEnum.CHAT_MSG_CHANNEL:
            message = new Message("channel", text, guid1.low);
            this.worldMessages.push(message);
        break;
    }

    this.emit('message', message);
  }

}

export default ChatHandler;
