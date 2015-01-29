class Screen
  module.exports = this

  constructor: (@$scope) ->
    @session = @$scope.session

    @session.realms.on 'refresh', =>
      @$scope.$apply =>
        @selected = @session.realms.list[0]

    @session.game.on 'authenticate', =>
      @$scope.$apply =>
        @session.screen = 'characters'

    @refresh()

  refresh: ->
    @session.realms.refresh()

  connect: ->
    if @selected
      @session.game.connect 'localhost', @selected.port
