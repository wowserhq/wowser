module.exports = class Screen {

  constructor($scope) {
    this.$scope = $scope;
    this.session = this.$scope.session;

    this.session.realms.on('refresh', () => {
      this.$scope.$apply(() => {
        this.selected = this.session.realms.list[0];
      });
    });

    this.session.game.on('authenticate', () => {
      this.$scope.$apply(() => {
        this.session.screen = 'characters';
      });
    });

    this.refresh();
  }

  refresh() {
    this.session.realms.refresh();
  }

  connect() {
    if(this.selected) {
      this.session.game.connect('localhost', this.selected.port);
    }
  }

};
