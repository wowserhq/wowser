import React from 'react';

import session from '../wowser/session';

class AuthScreen extends React.Component {

  static id = 'auth';
  static title = 'Authentication';

  constructor() {
    super();

    this.state = {
      host: session.auth.defhost,
      port: session.auth.defport,
      username: '',
      password: ''
    };

    this._onAuthenticate = ::this._onAuthenticate;
    this._onChange = ::this._onChange;
    this._onSubmit = ::this._onSubmit;
    this._onConnect = ::this._onConnect;

    session.auth.on('connect', this._onConnect);
    session.auth.on('reject', session.auth.disconnect);
    session.auth.on('authenticate', this._onAuthenticate);
  }

  componentWillUnmount() {
    session.auth.removeListener('connect', this._onConnect);
    session.auth.removeListener('reject', session.auth.disconnect);
    session.auth.removeListener('authenticate', this._onAuthenticate);
  }

  connect(host, port) {
    session.auth.connect(host, port);
  }

  authenticate(username, password) {
    session.auth.authenticate(username, password);
  }

  _onAuthenticate() {
    session.screen = 'realms';
  }

  _onChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  _onConnect() {
    this.authenticate(this.state.username, this.state.password);
  }

  _onSubmit(event) {
    event.preventDefault();
    this.connect(this.state.host, this.state.port);
  }

  render() {
    return (
      <auth className="auth screen">
        <div className="panel">
          <h1>Authentication</h1>

          <div className="divider"></div>

          <p>
            <strong>Note:</strong> Wowser requires a WebSocket proxy, see the README on GitHub.
          </p>

          <form onSubmit={ this._onSubmit }>
            <fieldset>
              <label>Host</label>
              <input type="text" onChange={ this._onChange }
                     name="host" value={ this.state.host } />

              <label>Port</label>
              <input type="text" onChange={ this._onChange }
                     name="port" value={ this.state.port } />
            </fieldset>

            <fieldset>
              <label>Username</label>
              <input type="text" onChange={ this._onChange }
                     name="username" value={ this.state.username } autoFocus />

              <label>Password</label>
              <input type="password" onChange={ this._onChange }
                     name="password" value={ this.state.password } />
            </fieldset>

            <div className="divider"></div>

            <input type="submit" defaultValue="Connect" />
          </form>
        </div>
      </auth>
    );
  }

}

export default AuthScreen;
