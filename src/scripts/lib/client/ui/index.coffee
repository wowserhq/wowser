class UI
  module.exports = @

  constructor: (@$scope) ->
    @session = @$scope.session = new Wowser()
    @session.screen = 'authentication'
