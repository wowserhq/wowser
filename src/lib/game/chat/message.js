class ChatMessage {

  // Creates a new message
  constructor(kind, text) {
    this.kind = kind;
    this.text = text;
    this.timestamp = new Date();
  }

  // Short string representation of this message
  toString() {
    return `[Message; Text: ${this.text}; GUID: ${this.guid}]`;
  }

}

export default ChatMessage;
