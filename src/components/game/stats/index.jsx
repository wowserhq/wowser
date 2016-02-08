import React from 'react';

import './index.styl';

class Stats extends React.Component {

  static propTypes = {
    renderer: React.PropTypes.object,
    map: React.PropTypes.object
  };

  mapStats() {
    const map = this.props.map;

    return (
      <div>
        <div className="divider"></div>

        <h2>Map Chunks</h2>
        <div className="divider"></div>
        <p>
          Loaded: { map ? map.chunks.size : 0 }
        </p>

        <div className="divider"></div>

        <h2>Map Doodads</h2>
        <div className="divider"></div>
        <p>
          Loading: { map ? map.doodadManager.entriesPendingLoad.size : 0 }
        </p>
        <p>
          Loaded: { map ? map.doodadManager.doodads.size : 0 }
        </p>
        <p>
          Animated: { map ? map.doodadManager.animatedDoodads.size : 0 }
        </p>

        <div className="divider"></div>

        <h2>WMOs</h2>
        <div className="divider"></div>
        <p>
          Loading Roots: { map ? map.wmoManager.entriesPendingLoad.size : 0 }
        </p>
        <p>
          Loaded Roots: { map ? map.wmoManager.wmos.size : 0 }
        </p>
        <p>
          Loading Groups: { map ? map.wmoManager.groupsPendingLoadCount : 0 }
        </p>
        <p>
          Loaded Groups: { map ? map.wmoManager.groupCount : 0 }
        </p>
        <p>
          Loading Doodads: { map ? map.wmoManager.doodadsPendingLoadCount : 0 }
        </p>
        <p>
          Loaded Doodads: { map ? map.wmoManager.doodadCount : 0 }
        </p>
      </div>
    );
  }

  render() {
    const renderer = this.props.renderer;
    if (!renderer) {
      return null;
    }

    const map = this.props.map;

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

        { map && this.mapStats() }
      </stats>
    );
  }

}

export default Stats;
