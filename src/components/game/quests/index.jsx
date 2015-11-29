import React from 'react';

import './index.styl';

class QuestsPanel extends React.Component {

  render() {
    return (
      <quests className="quests panel headless">
        <div className="icon portrait"></div>

        <h1>Quest Log</h1>

        <div className="divider thick"></div>

        <p>
          Soon™
        </p>
      </quests>
    );
  }

}

export default QuestsPanel;
