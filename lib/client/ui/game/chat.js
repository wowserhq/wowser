'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Message = require('../../game/chat/message');

module.exports = (function () {
  function Chat($scope) {
    var _this = this;

    _classCallCheck(this, Chat);

    this.$scope = $scope;
    this.session = this.$scope.session;

    this.session.chat.on('message', function () {
      _this.$scope.$apply();
    });
  }

  _createClass(Chat, [{
    key: 'send',
    value: function send() {
      message = new Message();
      message.text = this.message;
      this.session.chat.messages.push(message);
    }
  }]);

  return Chat;
})();