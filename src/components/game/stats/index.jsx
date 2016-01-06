import React from 'react';

import './index.styl';

class Stats extends React.Component {

  static propTypes = {
    renderer: React.PropTypes.object
  };

  render() {
    const renderer = this.props.renderer;
    if (!renderer) {
      return null;
    }

    const { memory, programs, render } = renderer.info;
    return (
      <stats className="stats frame thin">
        <h2>Memory</h2>
        <div className="divider"></div>
        <p>
          Geometries: { memory.geometries }
        </p>
        <p>
          Textures: { memory.textures }
        </p>
        <p>
          Programs: { programs.length }
        </p>

        <div className="divider"></div>

        <h2>Render</h2>
        <div className="divider"></div>
        <p>
          Calls: { render.calls }
        </p>
        <p>
          Faces: { render.faces }
        </p>
        <p>
          Points: { render.points }
        </p>
        <p>
          Vertices: { render.vertices }
        </p>
      </stats>
    );
  }

}

export default Stats;
