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

# SHA-1 implementation
class WrathNet.crypto.hash.SHA1 extends WrathNet.crypto.hash.Hash

  # Finalizes this SHA-1 hash
  finalize: ->
    @_digest = JSBN.crypto.hash.sha1.fromArray(@_data.toArray())
