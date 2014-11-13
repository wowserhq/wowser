var Screen;

Screen = (function() {
  module.exports = Screen;

  function Screen($scope) {
    this.$scope = $scope;
    this.session = this.$scope.session;
    this.session.realms.on('refresh', (function(_this) {
      return function() {
        return _this.$scope.$apply(function() {
          return _this.selected = _this.session.realms.list[0];
        });
      };
    })(this));
    this.session.game.on('authenticate', (function(_this) {
      return function() {
        return _this.$scope.$apply(function() {
          return _this.session.screen = 'character-selection';
        });
      };
    })(this));
    this.refresh();
  }

  Screen.prototype.refresh = function() {
    return this.session.realms.refresh();
  };

  Screen.prototype.connect = function() {
    if (this.selected) {
      return this.session.game.connect('localhost', this.selected.port);
    }
  };

  return Screen;

})();
