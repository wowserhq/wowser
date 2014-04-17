class Wowser.ui.App

  constructor: (@$scope) ->
    @session = @$scope.session = new Wowser(Wowser.expansions.wotlk)
    @session.screen = 'authentication'
