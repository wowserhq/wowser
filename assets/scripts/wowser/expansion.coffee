#= require_self
#= require_tree ./expansion

# Denotes an expansion
class Wowser.Expansion

  @getter 'name', ->
    return @constructor.NAME

  @getter 'build', ->
    return @constructor.BUILD

  @getter 'version', ->
    return @constructor.VERSION

  @getter 'majorVersion', ->
    return @constructor.MMP[0]

  @getter 'minorVersion', ->
    return @constructor.MMP[1]

  @getter 'patchVersion', ->
    return @constructor.MMP[2]

  @getter 'authHandler', ->
    return @constructor.Handlers.AuthHandler

  @getter 'realmHandler', ->
    return @constructor.Handlers.RealmHandler

  @getter 'worldHandler', ->
    return @constructor.Handlers.WorldHandler

  @getter 'characterHandler', ->
    return @constructor.Handlers.CharacterHandler

  @getter 'chatHandler', ->
    return @constructor.Handlers.ChatHandler
