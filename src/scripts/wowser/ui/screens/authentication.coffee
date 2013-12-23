class Wowser.ui.screens.Authentication

  constructor: (@$scope) ->
    @session = @$scope.session
    @host = 'localhost'
    @username = ''
    @password = ''

    @session.auth.on 'connect', =>
      @authenticate()

    @session.auth.on 'authenticate', =>
      @$scope.$apply =>
        @session.screen = 'realm-selection'

    @session.auth.on 'reject', =>
      @session.auth.disconnect()

  connect: ->
    @session.auth.connect(@host)

  authenticate: ->
    @session.auth.authenticate(@username, @password)
