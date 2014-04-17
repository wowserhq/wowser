# Object utility
class Wowser.utils.ObjectUtil

  # Retrieves key for given value (if any) in object
  @keyByValue = (object, target) ->
    unless 'lookup' of object
      lookup = {}
      for own key, value of object
        lookup[value] = key
      object.lookup = lookup

    return object.lookup[target]
