"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = (function () {
  function Opcode() {
    _classCallCheck(this, Opcode);
  }

  _createClass(Opcode, null, [{
    key: "LOGON_CHALLENGE",
    value: 0x00,
    enumerable: true
  }, {
    key: "LOGON_PROOF",
    value: 0x01,
    enumerable: true
  }, {
    key: "RECONNECT_CHALLENGE",
    value: 0x02,
    enumerable: true
  }, {
    key: "RECONNECT_PROOF",
    value: 0x03,
    enumerable: true
  }, {
    key: "REALM_LIST",
    value: 0x10,
    enumerable: true
  }]);

  return Opcode;
})();