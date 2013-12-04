# Denotes an expansion
class WrathNet.expansions.Expansion

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
    return @constructor.handlers.AuthHandler

  @getter 'realmHandler', ->
    return @constructor.handlers.RealmHandler

  @getter 'worldHandler', ->
    return @constructor.handlers.WorldHandler

  @getter 'characterHandler', ->
    return @constructor.handlers.CharacterHandler
