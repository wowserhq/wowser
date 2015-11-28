const React = require('react');

require('./index.styl');

const Chat = require('../chat');
const Portrait = require('../portrait');
const Quests = require('../quests');
const session = require('../../wowser/session');

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

module.exports = HUD;
