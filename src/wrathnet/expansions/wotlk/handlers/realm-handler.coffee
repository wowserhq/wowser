# Denotes a realm handler
class WrathNet.expansions.wotlk.handlers.RealmHandler

  @mixin Backbone.Events

  # Imports
  AuthOpcode = WrathNet.expansions.wotlk.enums.AuthOpcode
  AuthPacket = WrathNet.expansions.wotlk.net.AuthPacket
  ObjectUtil = WrathNet.utils.ObjectUtil
  Realm = WrathNet.entities.Realm

  # Creates a new realm handler
  constructor: (session) ->

    # Holds session
    @session = session

    # Initially empty list of realms
    @list = []

    # Listen for realm list
    @session.auth.on 'packet:receive:REALM_LIST', @handleRealmList, @

  # Requests a fresh list of realms
  refresh: ->
    console.info 'refreshing realmlist'

    ap = new AuthPacket(AuthOpcode.REALM_LIST)

    return @session.auth.send(ap)

  # Realm list refresh handler (REALM_LIST)
  handleRealmList: (ap) ->
    ap.readShort()         # packet-size
    ap.readUnsignedInt()   # (?)

    count = ap.readShort() # number of realms

    @list.length = 0

    for i in [0...count]
      realm = new Realm()

      realm.icon = ap.readUnsignedByte()
      realm.lock = ap.readUnsignedByte()
      realm.flags = ap.readUnsignedByte()
      realm.name = ap.readCString()
      realm.address = ap.readCString()
      realm.population = ap.readFloat()
      realm.characters = ap.readUnsignedByte()
      realm.timezone = ap.readUnsignedByte()
      realm.id = ap.readUnsignedByte()

      @list.push(realm)

    @trigger 'refresh'
