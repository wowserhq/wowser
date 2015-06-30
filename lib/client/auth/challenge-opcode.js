"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = (function () {
  function ChallengeOpcode() {
    _classCallCheck(this, ChallengeOpcode);
  }

  _createClass(ChallengeOpcode, null, [{
    key: "SUCCESS",
    value: 0x00,
    enumerable: true
  }, {
    key: "UNKNOWN0",
    value: 0x01,
    enumerable: true
  }, {
    key: "UNKNOWN1",
    value: 0x02,
    enumerable: true
  }, {
    key: "ACCOUNT_BANNED",
    value: 0x03,
    enumerable: true
  }, {
    key: "ACCOUNT_INVALID",
    value: 0x04,
    enumerable: true
  }, {
    key: "PASSWORD_INVALID",
    value: 0x05,
    enumerable: true
  }, {
    key: "ALREADY_ONLINE",
    value: 0x06,
    enumerable: true
  }, {
    key: "OUT_OF_CREDIT",
    value: 0x07,
    enumerable: true
  }, {
    key: "BUSY",
    value: 0x08,
    enumerable: true
  }, {
    key: "BUILD_INVALID",
    value: 0x09,
    enumerable: true
  }, {
    key: "BUILD_UPDATE",
    value: 0x0A,
    enumerable: true
  }, {
    key: "INVALID_SERVER",
    value: 0x0B,
    enumerable: true
  }, {
    key: "ACCOUNT_SUSPENDED",
    value: 0x0C,
    enumerable: true
  }, {
    key: "ACCESS_DENIED",
    value: 0x0D,
    enumerable: true
  }, {
    key: "SURVEY",
    value: 0x0E,
    enumerable: true
  }, {
    key: "PARENTAL_CONTROL",
    value: 0x0F,
    enumerable: true
  }, {
    key: "LOCK_ENFORCED",
    value: 0x10,
    enumerable: true
  }, {
    key: "TRIAL_EXPIRED",
    value: 0x11,
    enumerable: true
  }, {
    key: "BATTLE_NET",
    value: 0x12,
    enumerable: true
  }]);

  return ChallengeOpcode;
})();