class UI
  module.exports = this

  constructor: (@$scope) ->
    @session = @$scope.session = new Wowser()
    @session.screen = 'auth'
