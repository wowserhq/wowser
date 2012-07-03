
// Alias convenience prototype methods to deal with getter/setters
Function.prototype.getter = function(name, getter) {
  this.prototype.__defineGetter__(name, getter);
};
Function.prototype.setter = function(name, setter) {
  this.prototype.__defineSetter__(name, setter);
};
