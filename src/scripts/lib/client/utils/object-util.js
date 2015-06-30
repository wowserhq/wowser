module.exports = class ObjectUtil {

  // Retrieves key for given value (if any) in object
  static keyByValue(object, target) {
    if(!'lookup' in object) {
      lookup = {}
      for(var key in object) {
        if(object.hasOwnProperty(key)) {
          lookup[value] = object[key]
        }
      }
      object.lookup = lookup
    }

    return object.lookup[target]
  }

}
