class Wowser

  # Denotes the version number
  @VERSION = '0.0.1'

  # World of Warcraft game identifier
  @IDENT = 'Wow '

  # Package structure
  @crypto = {
    hash: {}
  }
  @datastructures = {}
  @entities = {}
  @expansions = {}
  @net = {}
  @sessions = {}
  @utils = {}

  # Convenience constructor for starting a new Wowser session for given expansion
  constructor: (expansion, userAgent) ->
    return new Wowser.sessions.Session expansion, userAgent
