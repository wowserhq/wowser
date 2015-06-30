module.exports = class Screen {

  constructor($scope) {
    this.$scope = $scope
    this.session = this.$scope.session
    this.host = window.location.hostname
    this.port = this.session.auth.constructor.PORT
    this.username = ''
    this.password = ''

    this.session.auth.on('connect', () => {
      this.authenticate()
    })

    this.session.auth.on('authenticate', () => {
      this.$scope.$apply(() => {
        this.session.screen = 'realms'
      })
    })

    this.session.auth.on('reject', () => {
      this.session.auth.disconnect()
    })
  }

  connect() {
    this.session.auth.connect(this.host, this.port)
  }

  authenticate() {
    this.session.auth.authenticate(this.username, this.password)
  }

}
