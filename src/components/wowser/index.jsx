const React = require('react');

const AuthScreen = require('../auth');
const CharactersScreen = require('../characters');
const GameScreen = require('../game');
const RealmsScreen = require('../realms');
const Kit = require('../kit');
const session = require('./session');

require('./index.styl');

class Wowser extends React.Component {

  static SCREENS = [
    AuthScreen,
    RealmsScreen,
    CharactersScreen,
    GameScreen,
    Kit
  ];

  constructor() {
    super();

    this.state = {
      screen: session.screen
    };

    this._onScreenChange = this._onScreenChange.bind(this);

    session.on('screen:change', this._onScreenChange);
  }

  get currentScreen() {
    const Screen = this.constructor.SCREENS.find((screen) => {
      return screen.id === this.state.screen;
    });
    return <Screen />;
  }

  _onScreenChange(from, to) {
    this.setState({ screen: to });
  }

  _onScreenSelect(event) {
    session.screen = event.target.value;
  }

  render() {
    const screens = this.constructor.SCREENS;
    return (
      <wowser>
        <div className="branding">
          <header>Wowser</header>
          <div className="divider"></div>
          <div className="slogan">World of Warcraft in the browser</div>
        </div>

        <select className="screen-selector"
                value={ this.state.screen }
                onChange={ this._onScreenSelect.bind(this) }>
          { screens.map((screen) => {
            return (
              <option key={ screen.id } value={ screen.id }>
                { screen.title }
              </option>
            );
          }) }
        </select>

        { this.currentScreen }
      </wowser>
    );
  }

}

module.exports = Wowser;
