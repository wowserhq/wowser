'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function Screen($scope) {
    var _this = this;

    _classCallCheck(this, Screen);

    this.$scope = $scope;
    this.session = this.$scope.session;
    this.host = window.location.hostname;
    this.port = this.session.auth.constructor.PORT;
    this.username = '';
    this.password = '';

    this.session.auth.on('connect', function () {
      _this.authenticate();
    });

    this.session.auth.on('authenticate', function () {
      _this.$scope.$apply(function () {
        _this.session.screen = 'realms';
      });
    });

    this.session.auth.on('reject', function () {
      _this.session.auth.disconnect();
    });
  }

  _createClass(Screen, [{
    key: 'connect',
    value: function connect() {
      this.session.auth.connect(this.host, this.port);
    }
  }, {
    key: 'authenticate',
    value: function authenticate() {
      this.session.auth.authenticate(this.username, this.password);
    }
  }]);

  return Screen;
})();