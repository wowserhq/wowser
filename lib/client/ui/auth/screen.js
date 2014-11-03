var Screen;

Screen = (function() {
  module.exports = Screen;

  function Screen($scope) {
    this.$scope = $scope;
    this.session = this.$scope.session;
    this.host = window.location.hostname;
    this.port = this.session.auth.constructor.PORT;
    this.username = '';
    this.password = '';
    this.session.auth.on('connect', (function(_this) {
      return function() {
        return _this.authenticate();
      };
    })(this));
    this.session.auth.on('authenticate', (function(_this) {
      return function() {
        return _this.$scope.$apply(function() {
          return _this.session.screen = 'realm-selection';
        });
      };
    })(this));
    this.session.auth.on('reject', (function(_this) {
      return function() {
        return _this.session.auth.disconnect();
      };
    })(this));
  }

  Screen.prototype.connect = function() {
    return this.session.auth.connect(this.host, this.port);
  };

  Screen.prototype.authenticate = function() {
    return this.session.auth.authenticate(this.username, this.password);
  };

  return Screen;

})();
