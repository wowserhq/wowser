'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function ObjectUtil() {
    _classCallCheck(this, ObjectUtil);
  }

  _createClass(ObjectUtil, null, [{
    key: 'keyByValue',

    // Retrieves key for given value (if any) in object
    value: function keyByValue(object, target) {
      if (!'lookup' in object) {
        lookup = {};
        for (var key in object) {
          if (object.hasOwnProperty(key)) {
            lookup[value] = object[key];
          }
        }
        object.lookup = lookup;
      }

      return object.lookup[target];
    }
  }]);

  return ObjectUtil;
})();