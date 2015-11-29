import Client from '../../lib';

class Session extends Client {

  constructor() {
    super();

    this._screen = 'auth';
  }

  get screen() {
    return this._screen;
  }

  set screen(screen) {
    if (this._screen !== screen) {
      this.emit('screen:change', this._screen, screen);
      this._screen = screen;
    }
  }

}

export default new Session();
