const AuthOpcode = require('./opcode')
const BasePacket = require('../net/packet')
const ObjectUtil = require('../utils/object-util')

module.exports = class Packet extends BasePacket {

  // Header size in bytes for both incoming and outgoing packets
  static HEADER_SIZE = 1

  // Retrieves the name of the opcode for this packet (if available)
  get opcodeName() {
    return ObjectUtil.keyByValue(AuthOpcode, this.opcode)
  }

  // Finalizes this packet
  finalize() {
    this.index = 0
    this.writeByte(this.opcode)
  }

}
