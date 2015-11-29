class ArrayUtil {

  // Generates array from given hex string
  static fromHex(hex) {
    const array = [];
    for (let i = 0; i < hex.length; i += 2) {
      array.push(parseInt(hex.slice(i, i + 2), 16));
    }
    return array;
  }

}

export default ArrayUtil;
