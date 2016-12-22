import BasePacket from '../net/packet';
import GameOpcode from './opcode';
import GUID from './guid';
import ObjectUtil from '../utils/object-util';

class GamePacket extends BasePacket {

  // Header sizes in bytes for both incoming and outgoing packets
  static HEADER_LARGE_SIZE_INCOMING = 5;
  static HEADER_SIZE_INCOMING = 4;
  static HEADER_SIZE_OUTGOING = 6;

  // Opcode sizes in bytes for both incoming and outgoing packets
  static OPCODE_SIZE_INCOMING = 2;
  static OPCODE_SIZE_OUTGOING = 4;

  static LARGE_PACKET_FLAG = 0x80;

  constructor(opcode, source, outgoing = true, isLarge = false) {
    if (!source) {
      if (outgoing === true) {
        source = GamePacket.HEADER_SIZE_OUTGOING
      } else {
        source = (isLarge === true ? GamePacket.HEADER_LARGE_SIZE_INCOMING : GamePacket.HEADER_SIZE_INCOMING);
      }
    }

    super(opcode, source, outgoing);

    // is it a large package ?
    this.isLarge = isLarge;
  }

  // Retrieves the name of the opcode for this packet (if available)
  get opcodeName() {
    return ObjectUtil.keyByValue(GameOpcode, this.opcode);
  }

  // Header size in bytes (dependent on packet origin)
  get headerSize() {
    if (this.outgoing) {
      return this.constructor.HEADER_SIZE_OUTGOING;
    }

    return this.isLarge === true ? GamePacket.HEADER_LARGE_SIZE_INCOMING : GamePacket.HEADER_SIZE_INCOMING;
  }

  // Reads GUID from this packet
  readGUID() {
    return new GUID(this.read(GUID.LENGTH));
  }

  // Writes given GUID to this packet
  writeGUID(guid) {
    this.write(guid.raw);
    return this;
  }

  // // Reads packed GUID from this packet
  // // TODO: Implementation
  // readPackedGUID: ->
  //   return null

  // // Writes given GUID to this packet in packed form
  // // TODO: Implementation
  // writePackedGUID: (guid) ->
  //   return this

}

export default GamePacket;
