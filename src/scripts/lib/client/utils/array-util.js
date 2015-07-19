module.exports = class ArrayUtil {

  // Generates array from given hex string
  static fromHex(hex) {
    const array = [];
    for(var i = 0; i < hex.length; i += 2) {
      array.push(parseInt(hex.slice(i, i + 2), 16));
    }
    return array;
  }

  // Converts given data to buffer
  static toBuffer(data) {
    const buffer = new Buffer(data.byteLength || data.length);
    const view = new Uint8Array(data);
    for(var i in view) {

      // byte, i in view
      buffer[i] = view[i];
    }
    return buffer;
  }

};
