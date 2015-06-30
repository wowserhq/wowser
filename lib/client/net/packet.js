'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var ByteBuffer = require('byte-buffer');

module.exports = (function (_ByteBuffer) {

  // Creates a new packet with given opcode from given source or length

  function Packet(opcode, source) {
    var outgoing = arguments[2] === undefined ? true : arguments[2];

    _classCallCheck(this, Packet);

    _get(Object.getPrototypeOf(Packet.prototype), 'constructor', this).call(this, source, ByteBuffer.LITTLE_ENDIAN);

    // Holds the opcode for this packet
    this.opcode = opcode;

    // Whether this packet is outgoing or incoming
    this.outgoing = outgoing;

    // Default source to header size if not given
    if (source !== undefined) {}

    // Seek past opcode to reserve space for it when finalizing
    this.index = this.headerSize;
  }

  _inherits(Packet, _ByteBuffer);

  _createClass(Packet, [{
    key: 'toString',

    // Short string representation of this packet
    value: function toString() {
      opcode = ('0000' + this.opcode.toString(16).toUpperCase()).slice(-4);
      return '[' + this.constructor.name + '; Opcode: ' + (this.opcodeName || 'UNKNOWN') + ' (0x' + opcode + '); Length: ' + this.length + '; Body: ' + this.bodySize + '; Index: ' + this._index + ']';
    }
  }, {
    key: 'finalize',

    // Finalizes this packet
    value: function finalize() {
      return this;
    }
  }, {
    key: 'headerSize',

    // Header size in bytes
    get: function get() {
      return this.constructor.HEADER_SIZE;
    }
  }, {
    key: 'bodySize',

    // Body size in bytes
    get: function get() {
      return this.length - this.headerSize;
    }
  }, {
    key: 'opcodeName',

    // Retrieves the name of the opcode for this packet (if available)
    get: function get() {
      return null;
    }
  }]);

  return Packet;
})(ByteBuffer);

// TODO: This needs to be fixed
// source = this.headerSize