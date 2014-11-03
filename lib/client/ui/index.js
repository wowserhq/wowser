var UI;

UI = (function() {
  module.exports = UI;

  function UI($scope) {
    this.$scope = $scope;
    this.session = this.$scope.session = new Wowser();
    this.session.screen = 'authentication';
  }

  return UI;

})();
