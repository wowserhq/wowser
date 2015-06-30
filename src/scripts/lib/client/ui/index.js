module.exports = class UI {

  constructor($scope) {
    this.scope = $scope
    this.session = this.scope.session = new Wowser()
    this.session.screen = 'auth'
  }

}
