class Wowser.Entities.Realm

  # Creates a new realm
  constructor: ->

    # Holds host, port and address
    @_host = null
    @_port = NaN
    @_address = null

    # Holds realm attributes
    @name = null
    @id = null
    @icon = null
    @flags = null
    @timezone = null
    @population = 0.0
    @characters = 0

  # Short string representation of this realm
  toString: ->
    return "[Realm; Name: #{@name}; Address: #{@_address}; Characters: #{@characters}]"

  # Retrieves host for this realm
  @getter 'host', ->
    return @_host

  # Retrieves port for this realm
  @getter 'port', ->
    return @_port

  # Retrieves address for this realm
  @getter 'address', ->
    return @_address

  # Sets address for this realm
  @setter 'address', (address) ->
    @_address = address
    parts = @_address.split(':')
    @_host = parts[0] || null
    @_port = parts[1] || NaN
