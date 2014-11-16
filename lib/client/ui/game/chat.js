var Chat, Message;

Message = require('../../game/chat/message');

Chat = (function() {
  module.exports = Chat;

  function Chat($scope) {
    this.$scope = $scope;
    this.session = this.$scope.session;
    this.session.chat.on('message', (function(_this) {
      return function() {
        return _this.$scope.$apply();
      };
    })(this));
  }

  Chat.prototype.send = function() {
    var message;
    message = new Message();
    message.text = this.message;
    return this.session.chat.messages.push(message);
  };

  return Chat;

})();
