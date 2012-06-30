
// Alias convenience prototype methods to deal with getter/setters
Function.prototype.getter = Function.prototype.__defineGetter__;
Function.prototype.setter = Function.prototype.__defineSetter__;
