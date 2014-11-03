class Screen
  module.exports = @

  constructor: (@$scope) ->
    @session = @$scope.session

    @session.realms.on 'refresh', =>
      @$scope.$apply =>
        @selected = @session.realms.list[0]

    @session.world.on 'authenticate', =>
      @$scope.$apply =>
        @session.screen = 'character-selection'

    @refresh()

  refresh: ->
    @session.realms.refresh()

  connect: ->
    if @selected
      @session.world.connect 'localhost', @selected.port
