'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var BasePacket = require('../net/packet');
var GameOpcode = require('./opcode');
var GUID = require('./guid');
var ObjectUtil = require('../utils/object-util');

module.exports = (function (_BasePacket) {
  function GamePacket() {
    _classCallCheck(this, GamePacket);

    _get(Object.getPrototypeOf(GamePacket.prototype), 'constructor', this).apply(this, arguments);
  }

  _inherits(GamePacket, _BasePacket);

  _createClass(GamePacket, [{
    key: 'readGUID',

    // Reads GUID from this packet
    value: function readGUID() {
      return new GUID(this.read(GUID.LENGTH));
    }
  }, {
    key: 'writeGUID',

    // Writes given GUID to this packet
    value: function writeGUID(guid) {
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

  }, {
    key: 'opcodeName',

    // Retrieves the name of the opcode for this packet (if available)
    get: function get() {
      return ObjectUtil.keyByValue(GameOpcode, this.opcode);
    }
  }, {
    key: 'headerSize',

    // Header size in bytes (dependent on packet origin)
    get: function get() {
      if (this.outgoing) {
        return this.constructor.HEADER_SIZE_OUTGOING;
      } else {
        return this.constructor.HEADER_SIZE_INCOMING;
      }
    }
  }], [{
    key: 'HEADER_SIZE_INCOMING',

    // Header sizes in bytes for both incoming and outgoing packets
    value: 4,
    enumerable: true
  }, {
    key: 'HEADER_SIZE_OUTGOING',
    value: 6,
    enumerable: true
  }, {
    key: 'OPCODE_SIZE_INCOMING',

    // Opcode sizes in bytes for both incoming and outgoing packets
    value: 2,
    enumerable: true
  }, {
    key: 'OPCODE_SIZE_OUTGOING',
    value: 4,
    enumerable: true
  }]);

  return GamePacket;
})(BasePacket);