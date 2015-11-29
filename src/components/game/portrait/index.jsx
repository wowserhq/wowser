import React from 'react';
import classes from 'classnames';

import './index.styl';

class Portrait extends React.Component {

  static propTypes = {
    self: React.PropTypes.bool,
    unit: React.PropTypes.object.isRequired,
    target: React.PropTypes.bool
  };

  render() {
    const unit = this.props.unit;
    const className = classes('portrait', {
      self: this.props.self,
      target: this.props.target
    });
    return (
      <portrait className={ className }>
        <div className="icon portrait"></div>

        <header className="name">{ unit.name }</header>
        <aside className="level">{ unit.level }</aside>

        <div className="divider"></div>

        <div className="health">{ unit.hp } / { unit.maxHp }</div>
        <div className="mana">{ unit.mp } / { unit.maxMp }</div>
      </portrait>
    );
  }

}

export default Portrait;
