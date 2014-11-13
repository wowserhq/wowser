class Screen
  module.exports = this

  constructor: (@$scope) ->
    @session = @$scope.session

    @session.characters.on 'refresh', =>
      @$scope.$apply =>
        @selected = @session.characters.list[0]

    @session.game.on 'join', =>
      @$scope.$apply =>
        @session.screen = 'game'

    @refresh()

  refresh: ->
    @session.characters.refresh()

  join: ->
    if @selected
      @session.game.join @selected
