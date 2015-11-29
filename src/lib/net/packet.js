import ByteBuffer from 'byte-buffer';

class Packet extends ByteBuffer {

  // Creates a new packet with given opcode from given source or length
  constructor(opcode, source, outgoing = true) {
    super(source, ByteBuffer.LITTLE_ENDIAN);

    // Holds the opcode for this packet
    this.opcode = opcode;

    // Whether this packet is outgoing or incoming
    this.outgoing = outgoing;

    // Seek past opcode to reserve space for it when finalizing
    this.index = this.headerSize;
  }

  // Header size in bytes
  get headerSize() {
    return this.constructor.HEADER_SIZE;
  }

  // Body size in bytes
  get bodySize() {
    return this.length - this.headerSize;
  }

  // Retrieves the name of the opcode for this packet (if available)
  get opcodeName() {
    return null;
  }

  // Short string representation of this packet
  toString() {
    const opcode = ('0000' + this.opcode.toString(16).toUpperCase()).slice(-4);
    return `[${this.constructor.name}; Opcode: ${this.opcodeName || 'UNKNOWN'} (0x${opcode}); Length: ${this.length}; Body: ${this.bodySize}; Index: ${this._index}]`;
  }

  // Finalizes this packet
  finalize() {
    return this;
  }

}

export default Packet;
