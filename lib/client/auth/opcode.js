var Opcode;

Opcode = (function() {
  function Opcode() {}

  module.exports = Opcode;

  Opcode.LOGON_CHALLENGE = 0x00;

  Opcode.LOGON_PROOF = 0x01;

  Opcode.RECONNECT_CHALLENGE = 0x02;

  Opcode.RECONNECT_PROOF = 0x03;

  Opcode.REALM_LIST = 0x10;

  return Opcode;

})();
