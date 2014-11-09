class Screen
  module.exports = this

  constructor: (@$scope) ->
    @session = @$scope.session
    @host = window.location.hostname
    @port = @session.auth.constructor.PORT
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
    @session.auth.connect(@host, @port)

  authenticate: ->
    @session.auth.authenticate(@username, @password)
