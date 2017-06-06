import React from 'react';

import './index.styl';

import AuthScreen from '../auth';
import CharactersScreen from '../characters';
import GameScreen from '../game';
import RealmsScreen from '../realms';
import Kit from '../kit';
import session from './session';

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

    this._onScreenChange = ::this._onScreenChange;
    this._onScreenSelect = ::this._onScreenSelect;

    session.on('screen:change', this._onScreenChange);
  }

  get currentScreen() {
    const Screen = this.constructor.SCREENS.find((screen) => {
      return screen.id === this.state.screen;
    });
    return <Screen />;
  }

  _onScreenChange(_from, to) {
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
          <div className="slogan">{ session.config.slogan }</div>
        </div>

        <select className="screen-selector"
                value={ this.state.screen }
                onChange={ this._onScreenSelect }>
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

export default Wowser;
