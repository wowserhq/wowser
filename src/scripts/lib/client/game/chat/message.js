module.exports = class ChatMessage {

  // Creates a new message
  constructor() {
    this.timestamp = new Date()
  }

  // Short string representation of this message
  toString() {
    return `[Message; Text: ${this.text}; GUID: ${this.guid}]`
  }

}
