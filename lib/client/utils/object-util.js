var ObjectUtil,
  __hasProp = {}.hasOwnProperty;

ObjectUtil = (function() {
  function ObjectUtil() {}

  module.exports = ObjectUtil;

  ObjectUtil.keyByValue = function(object, target) {
    var key, lookup, value;
    if (!('lookup' in object)) {
      lookup = {};
      for (key in object) {
        if (!__hasProp.call(object, key)) continue;
        value = object[key];
        lookup[value] = key;
      }
      object.lookup = lookup;
    }
    return object.lookup[target];
  };

  return ObjectUtil;

})();
