class Wowser.ui.panels.Chat

  constructor: (@$scope) ->
    @session = @$scope.session

    @session.chat.on 'message', =>
      @$scope.$apply()
