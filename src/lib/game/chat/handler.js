import EventEmitter from 'events';

import Message from './message';
import GamePacket from '../packet';
import GameOpcode from '../opcode';

class ChatHandler extends EventEmitter {

    static CHAT_MSG_ADDON                  = 0xFFFFFFFF;
    static CHAT_MSG_SYSTEM                 = 0x00;
    static CHAT_MSG_SAY                    = 0x01;
    static CHAT_MSG_PARTY                  = 0x02;
    static CHAT_MSG_RAID                   = 0x03;
    static CHAT_MSG_GUILD                  = 0x04;
    static CHAT_MSG_OFFICER                = 0x05;
    static CHAT_MSG_YELL                   = 0x06;
    static CHAT_MSG_WHISPER                = 0x07;
    static CHAT_MSG_WHISPER_FOREIGN        = 0x08;
    static CHAT_MSG_WHISPER_INFORM         = 0x09;
    static CHAT_MSG_EMOTE                  = 0x0A;
    static CHAT_MSG_TEXT_EMOTE             = 0x0B;
    static CHAT_MSG_MONSTER_SAY            = 0x0C;
    static CHAT_MSG_MONSTER_PARTY          = 0x0D;
    static CHAT_MSG_MONSTER_YELL           = 0x0E;
    static CHAT_MSG_MONSTER_WHISPER        = 0x0F;
    static CHAT_MSG_MONSTER_EMOTE          = 0x10;
    static CHAT_MSG_CHANNEL                = 0x11;
    static CHAT_MSG_CHANNEL_JOIN           = 0x12;
    static CHAT_MSG_CHANNEL_LEAVE          = 0x13;
    static CHAT_MSG_CHANNEL_LIST           = 0x14;
    static CHAT_MSG_CHANNEL_NOTICE         = 0x15;
    static CHAT_MSG_CHANNEL_NOTICE_USER    = 0x16;
    static CHAT_MSG_AFK                    = 0x17;
    static CHAT_MSG_DND                    = 0x18;
    static CHAT_MSG_IGNORED                = 0x19;
    static CHAT_MSG_SKILL                  = 0x1A;
    static CHAT_MSG_LOOT                   = 0x1B;
    static CHAT_MSG_MONEY                  = 0x1C;
    static CHAT_MSG_OPENING                = 0x1D;
    static CHAT_MSG_TRADESKILLS            = 0x1E;
    static CHAT_MSG_PET_INFO               = 0x1F;
    static CHAT_MSG_COMBAT_MISC_INFO       = 0x20;
    static CHAT_MSG_COMBAT_XP_GAIN         = 0x21;
    static CHAT_MSG_COMBAT_HONOR_GAIN      = 0x22;
    static CHAT_MSG_COMBAT_FACTION_CHANGE  = 0x23;
    static CHAT_MSG_BG_SYSTEM_NEUTRAL      = 0x24;
    static CHAT_MSG_BG_SYSTEM_ALLIANCE     = 0x25;
    static CHAT_MSG_BG_SYSTEM_HORDE        = 0x26;
    static CHAT_MSG_RAID_LEADER            = 0x27;
    static CHAT_MSG_RAID_WARNING           = 0x28;
    static CHAT_MSG_RAID_BOSS_EMOTE        = 0x29;
    static CHAT_MSG_RAID_BOSS_WHISPER      = 0x2A;
    static CHAT_MSG_FILTERED               = 0x2B;
    static CHAT_MSG_BATTLEGROUND           = 0x2C;
    static CHAT_MSG_BATTLEGROUND_LEADER    = 0x2D;
    static CHAT_MSG_RESTRICTED             = 0x2E;
    static CHAT_MSG_BATTLENET              = 0x2F;
    static CHAT_MSG_ACHIEVEMENT            = 0x30;
    static CHAT_MSG_GUILD_ACHIEVEMENT      = 0x31;
    static CHAT_MSG_ARENA_POINTS           = 0x32;
    static CHAT_MSG_PARTY_LEADER           = 0x33;

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

    // Listen for messages
    this.session.game.on('packet:receive:SMSG_MESSAGE_CHAT', ::this.handleMessage);
    this.session.game.on('packet:receive:SMSG_NAME_QUERY_RESPONSE', ::this.handleName);
  }

  // Creates chat message
  create() {
    return new Message();
  }

  // Sends given message
  send(_message,type) {
    const app = new GamePacket(GameOpcode.CMSG_MESSAGE_CHAT, 64+_message.length);
    app.writeUnsignedInt(1); // type , 1: say [TODO: select channel ]
    app.writeUnsignedInt(0); // lang , 0: universal [TODO: use race specific ]
    app.writeString(_message);

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
    
    if (!this.playerNames[guid1.low]) {    
        this.playerNames[guid2.low]= { name: guid1.low };
        this.askName(guid1);
    }

    if (!this.playerNames[guid2.low]) {
        this.playerNames[guid2.low]= { name: guid2.low };
        this.askName(guid2);
    }

    const message = new Message("area", text, guid1.low);
    
    this.sayMessages.push(message);

    this.emit('message', message);
  }

}

export default ChatHandler;
