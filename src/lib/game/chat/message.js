class ChatMessage {

  // Creates a new message
  constructor(kind, text, guid1, guid2) {
    this.kind = kind;
    this.text = text;
    this.guid1 = guid1;
    this.guid2 = guid2;
    this.timestamp = new Date();
  }

  // Short string representation of this message
  toString() {   
    return `[Message; Text: ${this.text}; GUID: ${this.guid}]`;
  }

}

export default ChatMessage;
