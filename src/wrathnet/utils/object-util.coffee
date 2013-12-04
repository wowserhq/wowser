# Object utility
class WrathNet.utils.ObjectUtil

  # Retrieves key for given value (if any) in object
  @keyByValue = (object, target) ->
    for own key, value of object
      if target is value
        return key

    return null
