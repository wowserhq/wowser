Message = require('../../game/chat/message')

class Chat
  module.exports = this

  constructor: (@$scope) ->
    @session = @$scope.session

    @session.chat.on 'message', =>
      @$scope.$apply()

  send: ->
    message = new Message()
    message.text = @message
    @session.chat.messages.push(message)
