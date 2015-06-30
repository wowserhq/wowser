module.exports = class Screen {

  constructor($scope) {
    this.$scope = $scope
    this.session = this.$scope.session

    this.session.characters.on('refresh', () => {
      this.$scope.$apply(() => {
        this.selected = this.session.characters.list[0]
      })
    })

    this.session.game.on('join', () => {
      this.$scope.$apply(() => {
        this.session.screen = 'game'
      })
    })

    this.refresh()
  }

  refresh() {
    this.session.characters.refresh()
  }

  join() {
    if(this.selected) {
      this.session.game.join(this.selected)
    }
  }

}
