/**
 * Packaged and modified from:
 * https://github.com/davidflanagan/BufferView/blob/master/BufferView.js
 */

/**
 * BufferView.js
 * Wrap an ArrayBuffer (using a DataView internally) and allow
 * reading and writing of values from it.  Differs from (and improves upon)
 * the DataView API in these ways:
 * 
 * - allows a default endianness to be specified
 * - keeps track of current buffer position, so you can read
 *   and write sequential values without tracking it yourself
 * - has methods for reading and writing UTF-8 strings
 */
/*global ArrayBuffer DataView Uint8Array */

var BufferView = (function() {
    "use strict";
    
    function fail(msg) { throw new Error(msg); }

    /*
     * This constructor is like the DataView constructor, but requires you to
     * specify a default byte order.  First arg is always the buffer. Last arg
     * is the order.  Optional arguments between can specify buffer offset
     * and length.  Invoke in one of these 3 ways:
     * 
     *   new BufferView(buffer, order)
     *   new BufferView(buffer, offset, order)
     *   new BufferView(buffer, offset, length, order)
     */
    function BufferView(buffer, offset, length, byteorder) {
        if (arguments.length < 2 || arguments.length > 4) 
            fail("Wrong number of argments");
        if (arguments.length === 2) {
            byteorder = offset;
            offset = 0;
            length = buffer.byteLength;
        }
        else if (arguments.length === 3) {
            byteorder = length;
            length = buffer.byteLength - offset;
        }
        
        // XXX Should I support binary strings as well as Array buffers?
        // jDataView does that
        if (!(buffer instanceof ArrayBuffer))
            fail("Bad ArrayBuffer");

        // XXX Should negative offsets be measured from the end of the buffer?
        if (offset < 0 || offset > buffer.byteLength)
            fail("Illegal offset");
        if (length < 0 || offset+length > buffer.byteLength)
            fail("Illegal length");
        if (byteorder !== BufferView.LE && byteorder !== BufferView.BE)
            fail("Bad byte order");

        // Note that most of these properties are read-only
        Object.defineProperties(this, {
            buffer: {        // ArrayBufferView defines this property
                value: buffer,
                enumerable:false, writable: false, configurable: false
            },
            byteOffset: {   // ArrayBufferView defines this property
                value: offset,
                enumerable:false, writable: false, configurable: false
            },
            byteLength: {   // ArrayBufferView defines this property
                value: length,
                enumerable:false, writable: false, configurable: false
            },
            byteOrder: {    // New public read-only property of this type
                value: byteorder,
                enumerable:true, writable: false, configurable: false
            },
            index: {        // Public getter/setter for the buffer offset
                get: function() { return this._index; },
                set: function(x) {
                    if (x < 0) fail("negative index");
                    if (x > this.byteLength) 
                        fail("buffer overflow: index too large");
                    this._index = x;
                },
                enumerable: true, configurable: false
            },
            _index: {       // non-public property holds actual offset value
                value: 0,
                enumerable: false, writable: true, configurable: true
            },
            _bytes: {       // Raw bytes, non-public
                value: new Uint8Array(buffer, offset, length),
                enumerable:false, writable: false, configurable: false
            },
            _view: {       // non-public DataView for getting/setting numbers
                value: new DataView(buffer, offset, length),
                enumerable:false, writable: false, configurable: false
            }
        });
    }

    BufferView.prototype = {
        constructor: BufferView,
        isLE: function(order) {
            switch(order) {
            case BufferView.LE: return true;
            case BufferView.BE: return false;
            case undefined: return this.byteOrder === BufferView.LE;
            default: fail("Invalid byte order");
            }
        },

        // Should I test the offset and raise my own exception if at EOF?
        // Or can I just rely on the DataView exception?
        // Or: should I return some kind of EOF indicator?  Tricky with
        // 0 being a falsy value.  Can't just test with if.
        readByte: function() {
            return this._view.getInt8(this.index++);
        },
        readUnsignedByte: function() {
            return this._view.getUint8(this.index++);
        },
        readShort: function(order) {
            var val = this._view.getInt16(this.index, this.isLE(order));
            this.index += 2;
            return val;
        },
        readUnsignedShort: function(order) {
            var val = this._view.getUint16(this.index, this.isLE(order));
            this.index += 2;
            return val;
        },
        readInt: function(order) {
            var val = this._view.getInt32(this.index, this.isLE(order));
            this.index += 4;
            return val;
        },
        readUnsignedInt: function(order) {
            var val = this._view.getUint32(this.index, this.isLE(order));
            this.index += 4;
            return val;
        },
        readFloat: function(order) {
            var val = this._view.getFloat32(this.index, this.isLE(order));
            this.index += 4;
            return val;
        },
        readDouble: function(order) {
            var val = this._view.getFloat64(this.index, this.isLE(order));
            this.index += 8;
            return val;
        },

        // Do I need to do any error checking to ensure that the argument value
        // is in the appropriate range?
        writeByte: function(val) {
            this._view.setInt8(this.index++, val);
            return this;
        },
        writeUnsignedByte: function(val) {
            this._view.setUint8(this.index++, val);
            return this;
        },
        writeShort: function(val,order) {
            var val = this._view.setInt16(this.index, val, this.isLE(order));
            this.index += 2;
            return this;
        },
        writeUnsignedShort: function(val,order) {
            var val = this._view.setUint16(this.index, val, this.isLE(order));
            this.index += 2;
            return this;
        },
        writeInt: function(val,order) {
            var val = this._view.setInt32(this.index, val, this.isLE(order));
            this.index += 4;
            return this;
        },
        writeUnsignedInt: function(val,order) {
            var val = this._view.setUint32(this.index, val, this.isLE(order));
            this.index += 4;
            return this;
        },
        writeFloat: function(val,order) {
            var val = this._view.setFloat32(this.index, val, this.isLE(order));
            this.index += 4;
            return this;
        },
        writeDouble: function(val,order) {
            var val = this._view.setFloat64(this.index, val, this.isLE(order));
            this.index += 8;
            return this;
        },

        skip: function(bytes) {
            var newidx = this.index + bytes;
            if (newidx < 0 || newidx > this.byteLength) fail("bad offset");
            this.index = newidx;
        },

        // Read n UTF-8 encoded characters and return them as a string.
        // A UTF-16 surrogate pair counts as two characters.
        readUTF8Chars: function(n) {
            var bytes = this._bytes;  // The bytes we're decoding
            var b = this.index;       // Index into bytes[]
            var codepoints = [];      // Holds decoded characters
            var c = 0;                // Index into codepoints[]
            var b1, b2, b3, b4;       // Up to 4 bytes

            while(c < n) {
                b1 = bytes[b];
                if (b1 < 128) {
                    codepoints[c++] = b1;
                    b++;
                }
                else if (b1 < 194) {
                    fail("unexpected continuation byte");
                }
                else if (b1 < 224) {
                    // 2-byte sequence
                    if (b+1 >= bytes.length) fail("unexepected end-of-buffer");
                    b2 = bytes[b+1];
                    if (b2 < 128 || b2 > 191) fail("bad continuation byte");
                    codepoints[c++] = ((b1 & 0x1f) << 6) + (b2 & 0x3f);
                    b+=2;
                }
                else if (b1 < 240) {
                    // 3-byte sequence
                    if (b+2 >= bytes.length) fail("unexepected end-of-buffer");
                    b2 = bytes[b+1];
                    if (b2 < 128 || b2 > 191) fail("bad continuation byte");
                    b3 = bytes[b+2];
                    if (b3 < 128 || b3 > 191) fail("bad continuation byte");
                    codepoints[c++] = ((b1 & 0x0f) << 12) +
                        ((b2 & 0x3f) << 6) + (b3 & 0x3f);
                    b+=3;
                }
                else if (b1 < 245) {
                    // 4-byte sequence
                    if (b+3 >= bytes.length) fail("unexepected end-of-buffer");
                    b2 = bytes[b+1];
                    if (b2 < 128 || b2 > 191) fail("bad continuation byte");
                    b3 = bytes[b+2];
                    if (b3 < 128 || b3 > 191) fail("bad continuation byte");
                    b4 = bytes[b+3];
                    if (b4 < 128 || b4 > 191) fail("bad continuation byte");
                    var cp = ((b1 & 0x07) << 18) + ((b2 & 0x3f) << 12) +
                        ((b3 & 0x3f) << 6) + (b4 & 0x3f);
                    cp -= 0x10000;

                    // If there isn't room for two UTF-16 pairs
                    if (c === n-1) fail("Unexpected surrogate pair");

                    // Now turn this code point into two surrogate pairs
                    codepoints[c++] = 0xd800 + ((cp & 0x0FFC00)>>>10);
                    codepoints[c++] = 0xdc00 + (cp & 0x0003FF);

                    b+=4;
                }
                else {
                    // Illegal byte
                    fail();
                }
            }

            this.index = b;
            return stringFromCodepoints(codepoints);
        },

        // Encode the characters of s as UTF-8 and write them.
        // Return the number of bytes written.
        // This method is named "writeUTF8Chars" instead of "writeUTF8String"
        // because it does not record the length of the string or write a
        // terminating byte to mark the end of the string, so some higher-level
        // mechanism of recording the number of characters is necessary.
        writeUTF8Chars: function(s) {
            var bytes = this._bytes;
            var b = this.index;  // byte index in bytes array
            var i=0;             // character index in the string s;
            
            for(i = 0; i < s.length; i++) {
                var c = s.charCodeAt(i);
                
                if (c <= 0x7F) {       // One byte of UTF-8
                    if (b >= bytes.length) fail("ArrayBuffer overflow");
                    bytes[b++] = c;
                }
                else if (c <= 0x7FF) { // Two bytes of UTF-8
                    if (b+1 >= bytes.length) fail("ArrayBuffer overflow");
                    bytes[b++] = 0xC0 | ((c & 0x7C0)>>>6);
                    bytes[b++] = 0x80 | (c & 0x3F);
                }
                else if (c <= 0xD7FF || (c >= 0xE000 && c <= 0xFFFF)) {
                    // Three bytes of UTF-8.  
                    // Source character is not a UTF-16 surrogate.
                    if (b+2 >= bytes.length) fail("ArrayBuffer overflow");
                    bytes[b++] = 0xE0 | ((c & 0xF000) >>> 12);
                    bytes[b++] = 0x80 | ((c & 0x0FC0) >>> 6);
                    bytes[b++] = 0x80 | (c & 0x3f);
                }
                else {
                    if (b+3 >= bytes.length) fail("ArrayBuffer overflow");
                    if (i === s.length-1) fail("Unpaired surrogate");
                    var d = s.charCodeAt(++i);
                    if (c < 0xD800 || c > 0xDBFF || d < 0xDC00 || d > 0xDFFF) {
                        console.log(i-2, c.toString(16), d.toString(16));
                        fail("Unpaired surrogate");
                    }
                    
                    var cp = ((c & 0x03FF) << 10) + (d & 0x03FF) + 0x10000;

                    bytes[b++] = 0xF0 | ((cp & 0x1C0000) >>> 18);
                    bytes[b++] = 0x80 | ((cp & 0x03F000) >>> 12);
                    bytes[b++] = 0x80 | ((cp & 0x000FC0) >>> 6);
                    bytes[b++] = 0x80 | (cp & 0x3f);
                }
            }
            var numbytes = b - this.index;  // How many bytes written
            this.index = b;
            return numbytes;
        }

        // Also methods for reading and writing binary strings?
    };

    // The following are constants for specifying endianness and can also be
    // used as factory functions or constructors.
    BufferView.LE = function(buffer, offset, length) {
        return new BufferView(buffer, offset, length, BufferView.LE);
    };

    BufferView.BE = function(buffer, offset, length) {
        return new BufferView(buffer, offset, length, BufferView.BE);
    };

    return BufferView;

    function stringFromCodepoints(codepoints) {
        // Not all browsers allow you to call Function.apply() 
        // with arbitrarily long arrays.
        if (codepoints.length < 65536) 
            return String.fromCharCode.apply(String, codepoints);
        else {
            var chunks = [];
            var start = 0, end = 65536;
            while(start < codepoints.length) {
                var slice = codepoints.slice(start, end);
                chunks.push(String.fromCharCode.apply(String, slice));
                start = end;
                end = end + 65536;
                if (end > codepoints.length) end = codepoints.length;
            }
            return chunks.join("");
        }
    }
}());
