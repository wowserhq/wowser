#= require_self
#= require_tree ./enums
#= require_tree ./net
#= require_tree ./handlers

# Wrath of the Lich King (3.x)
class Wowser.expansions.wotlk extends Wowser.expansions.Expansion

  @NAME    = 'Wrath of the Lich King'
  @VERSION = '3.3.5a'
  @MMP     = [3, 3, 5]
  @BUILD   = 12340

  # Expansion package structure
  @enums = {}
  @handlers = {}
  @net = {}
