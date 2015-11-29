class ObjectUtil {

  // Retrieves key for given value (if any) in object
  static keyByValue(object, target) {
    if (!('lookup' in object)) {
      const lookup = {};
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          const value = object[key];
          lookup[value] = key;
        }
      }
      object.lookup = lookup;
    }

    return object.lookup[target];
  }

}

export default ObjectUtil;
