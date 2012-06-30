#
# WrathNet Foundation
# Copyright (c) 2012 Tim Kurvers <http://wrathnet.org>
# 
# World of Warcraft client foundation written in JavaScript, enabling
# development of expansion-agnostic clients, bots and other useful tools.
# 
# The contents of this file are subject to the MIT License, under which 
# this library is licensed. See the LICENSE file for the full license.
#

# Denotes a session to be used as entry for the WrathNet foundation
class WrathNet.sessions.Session
  
  # Creates a new session for given expansion
  constructor: (expansion, userAgent) ->
  
    # Ensure the expansion is an instance
    unless expansion instanceof WrathNet.expansions.Expansion
      expansion = new expansion()
  
    # Holds the expansion this session uses
    @expansion = expansion
    
    # Holds user-agent information
    @userAgent = userAgent
    
    # Holds the various handlers
    @auth = new expansion.authHandler()
    @realms = new expansion.realmHandler()
    @world = new expansion.worldHandler()
