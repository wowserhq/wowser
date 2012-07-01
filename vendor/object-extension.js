
// Allows extending objects dynamically with literals
Object.prototype.extend = function() {
  var hasProp = this.hasOwnProperty;
  var object = null;
  var key = null;
  var objects = arguments.length > 1 ? [].slice.call(arguments, 0) : [];
  for(var i = 0, len = objects.length; i < len; i++) {
    object = objects[i];
    for(key in object) {
      if(!hasProp.call(object, key)) {
        continue;
      }
      this[key] = object[key];
    }
  }
  return this;
};
