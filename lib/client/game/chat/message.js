"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = (function () {

  // Creates a new message

  function ChatMessage() {
    _classCallCheck(this, ChatMessage);

    this.timestamp = new Date();
  }

  _createClass(ChatMessage, [{
    key: "toString",

    // Short string representation of this message
    value: function toString() {
      return "[Message; Text: " + this.text + "; GUID: " + this.guid + "]";
    }
  }]);

  return ChatMessage;
})();