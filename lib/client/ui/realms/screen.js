'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function Screen($scope) {
    var _this = this;

    _classCallCheck(this, Screen);

    this.$scope = $scope;
    this.session = this.$scope.session;

    this.session.realms.on('refresh', function () {
      _this.$scope.$apply(function () {
        _this.selected = _this.session.realms.list[0];
      });
    });

    this.session.game.on('authenticate', function () {
      _this.$scope.$apply(function () {
        _this.session.screen = 'characters';
      });
    });

    this.refresh();
  }

  _createClass(Screen, [{
    key: 'refresh',
    value: function refresh() {
      this.session.realms.refresh();
    }
  }, {
    key: 'connect',
    value: function connect() {
      if (this.selected) {
        this.session.game.connect('localhost', this.selected.port);
      }
    }
  }]);

  return Screen;
})();