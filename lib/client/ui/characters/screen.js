var Screen;

Screen = (function() {
  module.exports = Screen;

  function Screen($scope) {
    this.$scope = $scope;
    this.session = this.$scope.session;
    this.session.characters.on('refresh', (function(_this) {
      return function() {
        return _this.$scope.$apply(function() {
          return _this.selected = _this.session.characters.list[0];
        });
      };
    })(this));
    this.session.world.on('join', (function(_this) {
      return function() {
        return _this.$scope.$apply(function() {
          return _this.session.screen = 'world';
        });
      };
    })(this));
    this.refresh();
  }

  Screen.prototype.refresh = function() {
    return this.session.characters.refresh();
  };

  Screen.prototype.join = function() {
    if (this.selected) {
      return this.session.world.join(this.selected);
    }
  };

  return Screen;

})();
