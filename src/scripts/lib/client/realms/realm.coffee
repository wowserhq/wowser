attr = require('attr-accessor')

class Realm
  module.exports = this

  [get, set] = attr.accessors(this)

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
  get host: ->
    return @_host

  # Retrieves port for this realm
  get port: ->
    return @_port

  # Retrieves address for this realm
  get address: ->
    return @_address

  # Sets address for this realm
  set address: (address) ->
    @_address = address
    parts = @_address.split(':')
    @_host = parts[0] || null
    @_port = parts[1] || NaN
