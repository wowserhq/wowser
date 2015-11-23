const React = require('react');

class GameScreen extends React.Component {

  static id = 'game';
  static title = 'Game';

  constructor() {
    super();
  }

  render() {
    return <game></game>;
  }

}

module.exports = GameScreen;
