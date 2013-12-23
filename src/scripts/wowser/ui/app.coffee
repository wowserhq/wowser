class Wowser.ui.App

  constructor: (@$scope, @$window) ->
    @session = @$scope.session = new Wowser(Wowser.expansions.wotlk)
    @session.screen = 'authentication'
