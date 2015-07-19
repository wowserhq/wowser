const Message = require('../../game/chat/message');

module.exports = class Chat {

  constructor($scope) {
    this.$scope = $scope;
    this.session = this.$scope.session;

    this.session.chat.on('message', () => {
      this.$scope.$apply();
    });
  }

  send() {
    message = new Message();
    message.text = this.message;
    this.session.chat.messages.push(message);
  }

};
