import React from 'react';

class KitScreen extends React.Component {

  static id = 'kit';
  static title = 'UI Kit';

  render() {
    return (
      <kit className="screen">
        <div className="frame thin">
          <h2>Thin frame</h2>
          <div className="divider"></div>
          <p>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.
          </p>
          <div className="divider thick"></div>
          <button>Regular button</button>
          <button disabled>Disabled button</button>
          <input type="submit" value="Regular submit" />
          <input type="submit" value="Disabled submit" disabled />
        </div>

        <div className="frame thick">
          <h2>Thick frame</h2>
          <div className="divider"></div>
          <p>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.
          </p>
        </div>

        <div className="panel">
          <div className="icon portrait"></div>
          <h1>Regular panel</h1>
          <div className="divider"></div>
          <p>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.
          </p>
        </div>

        <div className="panel headless">
          <div className="icon portrait"></div>
          <h1>Headless panel</h1>
          <div className="divider thick"></div>
          <p>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.
          </p>
        </div>
      </kit>
    );
  }

}

export default KitScreen;
