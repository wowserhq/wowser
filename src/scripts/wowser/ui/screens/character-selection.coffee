class Wowser.ui.screens.CharacterSelection

  constructor: (@$scope) ->
    @session = @$scope.session

    @session.characters.on 'refresh', =>
      @$scope.$apply =>
        @selected = @session.characters.list[0]

    @session.world.on 'join', =>
      @$scope.$apply =>
        @session.screen = 'world'

    @refresh()

  refresh: ->
    @session.characters.refresh()

  join: ->
    if @selected
      @session.world.join @selected
