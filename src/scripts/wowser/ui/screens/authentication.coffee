class Wowser.ui.screens.Authentication

  constructor: (@$scope, @$rootScope) ->
    @session = new Wowser(Wowser.expansions.wotlk)
    @host = 'localhost'
    @username = ''
    @password = ''

    @session.auth.on 'connect', =>
      @authenticate()

    @session.auth.on 'authenticate', =>
      @$rootScope.state = 'realm-selection'
      @$rootScope.$apply()

    @session.auth.on 'reject', =>
      @session.auth.disconnect()

  connect: ->
    @session.auth.connect(@host)

  authenticate: ->
    @session.auth.authenticate(@username, @password)
