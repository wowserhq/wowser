import React from 'react';
import classes from 'classnames';

import './index.styl';

import session from '../../wowser/session';

class ChatPanel extends React.Component {

  constructor() {
    super();

    this.state = {
      text: '',
      messages: session.chat.messages
    };

    this._onChange = ::this._onChange;
    this._onMessage = ::this._onMessage;
    this._onSubmit = ::this._onSubmit;

    session.chat.on('message', this._onMessage);
  }

  componentDidUpdate() {
    this.refs.messages.scrollTop = this.refs.messages.scrollHeight;
  }

  send(text) {
    const message = session.chat.create();
    message.text = text;
    session.chat.messages.push(message);
  }

  _onChange(event) {
    this.setState({ text: event.target.value });
  }

  _onMessage() {
    this.setState({ messages: session.chat.messages });
  }

  _onSubmit(event) {
    event.preventDefault();
    if (this.state.text) {
      this.send(this.state.text);
      this.setState({ text: '' });
    }
  }

  render() {
    return (
      <chat className="chat frame">
        <ul ref="messages">
          { this.state.messages.map((message, index) => {
            const className = classes('message', message.kind);
            return (
              <li className={ className } key={ index }>
                { message.text }
              </li>
            );
          }) }
        </ul>

        <form onSubmit={ this._onSubmit }>
          <input type="text" onChange={ this._onChange }
                 name="text" value={ this.state.text } />
        </form>
      </chat>
    );
  }

}

export default ChatPanel;
