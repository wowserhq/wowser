const EventEmitter = require('events')
const Message = require('./message')

module.exports = class ChatHandler extends EventEmitter {

  // Creates a new chat handler
  constructor(session) {
    super()

    // Holds session
    this.session = session

    // Holds messages
    this.messages = []

    // Listen for messages
    this.session.game.on('packet:receive:SMSG_MESSAGE_CHAT', this.handleMessage.bind(this))
  }

  // Sends given message
  send(message) {
    throw new Error('sending chat messages is not yet implemented')
  }

  // Message handler (SMSG_MESSAGE_CHAT)
  handleMessage(gp) {
    type = gp.readUnsignedByte()
    lang = gp.readUnsignedInt()
    guid1 = gp.readGUID()
    gp.readUnsignedInt()
    guid2 = gp.readGUID()
    len = gp.readUnsignedInt()
    text = gp.readString(len)
    flags = gp.readUnsignedByte()

    message = new Message()
    message.text = text
    message.guid = guid1

    this.messages.push(message)

    this.emit('message', message)
  }

}
