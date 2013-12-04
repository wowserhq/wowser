# WrathNet is the foundation's entry point
class WrathNet

  # Denotes the foundation's version number
  @VERSION = 'v0.1'

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

  # Convenience constructor for starting a new WrathNet session for given expansion
  constructor: (expansion, userAgent) ->
    return new WrathNet.sessions.Session expansion, userAgent
