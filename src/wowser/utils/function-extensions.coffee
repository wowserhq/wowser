# Utility methods for creating getters/setters on the prototype
Function::getter = (name, getter) ->
  Object.defineProperty @::, name, get: getter, enumerable: true, configurable: true
  @

Function::setter = (name, setter) ->
  Object.defineProperty @::, name, set: setter, enumerable: true, configurable: true
  @

# Utility method for prototype mixins
Function::mixin = (mixins...) ->
  _.extend @::, mixins...
  @
