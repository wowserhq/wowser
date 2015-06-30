'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function Screen($scope) {
    var _this = this;

    _classCallCheck(this, Screen);

    this.$scope = $scope;
    this.session = this.$scope.session;

    this.session.characters.on('refresh', function () {
      _this.$scope.$apply(function () {
        _this.selected = _this.session.characters.list[0];
      });
    });

    this.session.game.on('join', function () {
      _this.$scope.$apply(function () {
        _this.session.screen = 'game';
      });
    });

    this.refresh();
  }

  _createClass(Screen, [{
    key: 'refresh',
    value: function refresh() {
      this.session.characters.refresh();
    }
  }, {
    key: 'join',
    value: function join() {
      if (this.selected) {
        this.session.game.join(this.selected);
      }
    }
  }]);

  return Screen;
})();