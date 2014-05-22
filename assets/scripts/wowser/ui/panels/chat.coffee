class Wowser.UI.Panels.Chat

  Message = Wowser.Entities.Message

  constructor: (@$scope) ->
    @session = @$scope.session

    @session.chat.on 'message', =>
      @$scope.$apply()

  send: ->
    message = new Message()
    message.text = @message
    @session.chat.messages.push(message)
