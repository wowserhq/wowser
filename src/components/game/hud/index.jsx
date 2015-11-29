import React from 'react';

import './index.styl';

import Chat from '../chat';
import Portrait from '../portrait';
import Quests from '../quests';
import session from '../../wowser/session';

class HUD extends React.Component {

  render() {
    const player = session.player;
    return (
      <hud className="hud">
        <Portrait self unit={ player } />
        { player.target && <Portrait target unit={ player.target } /> }

        <Chat />
        <Quests />
      </hud>
    );
  }

}

export default HUD;
