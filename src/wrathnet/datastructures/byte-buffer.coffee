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

# Denotes a byte-buffer
class WrathNet.datastructures.ByteBuffer extends BufferView
  
  # Constructs a buffer from given source or of given length in bytes
  constructor: (source, endian=BufferView.LE) ->
    
    # Use source as-is if given, otherwise assume it's the number of bytes
    buffer = if source.byteLength then source.buffer || source else new ArrayBuffer(source)
    
    # Default to little endian
    super buffer, endian
  
  # Reads a string of given length from the buffer 
  readString: @::readUTF8Chars
  
  # Writes a string to the buffer
  writeString: @::writeUTF8Chars

  # Reads a C-string (NULL-terminated) from the buffer (excluding the actual NULL-byte)
  readCString: ->
    # TODO: Implement C-string reading

  # Writes a C-string (NULL-terminated) to the buffer
  writeCString: ->
    # TODO: Implement C-string writing

  # Dumps this buffer in human-readable format
  dump: ->
    console.log @toHex()
    console.log @toASCII()
  
  # Generates hex representation of this buffer
  toHex: ->
    bytes = new Uint8Array(@buffer)
    Array::map.call(bytes, (byte) ->
      ('  ' + byte.toString(16).toUpperCase()).slice(-2)
    ).join(' ')

  # Generates ASCII representation of this buffer
  toASCII: ->
    bytes = new Uint8Array(@buffer)
    Array::map.call(bytes, (byte) ->
      if (byte < 0x20 || byte > 0x7E) then '  ' else ' ' + String.fromCharCode(byte)
    ).join(' ')

  # Joins together two arrays resulting in a new byte-buffer
  @join: (a, b) ->
    tmp = new Uint8Array(a.byteLength + b.byteLength)
    tmp.set(new Uint8Array(a.buffer || a), 0)
    tmp.set(new Uint8Array(b.buffer || b), a.byteLength)
    return new @(tmp.buffer)

  # Slices given array resulting in a new byte-buffer
  @slice: (array, begin, length) ->
    tmp = array.buffer || array
    return new @(tmp.slice(begin, length))
