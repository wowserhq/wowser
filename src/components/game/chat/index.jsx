import React from 'react';
import classes from 'classnames';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ChatEnum from '../../../lib/game/chat/chatEnum';

import './index.styl';

import session from '../../wowser/session';

class ChatPanel extends React.Component {

  constructor() {
    super();

    this.state = {
      playerNames : session.chat.playerNames,
      sayText: '',
      guildText: '',
      worldText: '',
      sayMessages: session.chat.sayMessages,
      guildMessages: session.chat.guildMessages,
      worldMessages: session.chat.worldMessages
    };

    this._onChangeSay = ::this._onChangeSay;
    this._onMessageSay = ::this._onMessageSay;
    this._onSubmitSay = ::this._onSubmitSay;
    this._onChangeGuild = ::this._onChangeGuild;
    this._onMessageGuild = ::this._onMessageGuild;
    this._onSubmitGuild = ::this._onSubmitGuild;
    this._onChangeWorld = ::this._onChangeWorld;
    this._onMessageWorld = ::this._onMessageWorld;
    this._onSubmitWorld = ::this._onSubmitWorld;

    session.chat.on('message', this._onMessageSay);
  }

  componentDidUpdate() {
    if (document.getElementById("sayMessages"))
      document.getElementById("sayMessages").scrollTop   = document.getElementById("sayMessages").scrollHeight;
    else if (document.getElementById("worldMessages"))
      document.getElementById("worldMessages").scrollTop   = document.getElementById("worldMessages").scrollHeight;
    else if (document.getElementById("guildMessages"))
      document.getElementById("guildMessages").scrollTop   = document.getElementById("guildMessages").scrollHeight;
  }

/*
 * SAY
 */

  sendSay(text) {
    const message = session.chat.create();
    message.text = text;
    session.chat.send(text,ChatEnum.CHAT_MSG_SAY);
  }

  _onChangeSay(event) {
    this.setState({ sayText: event.target.value });
  }

  _onMessageSay() {
    this.setState({ sayMessages: session.chat.sayMessages });
  }

  _onSubmitSay(event) {
    event.preventDefault();
    if (this.state.sayText) {
      this.sendSay(this.state.sayText);
      this.setState({ sayText: '' });
    }
  }
  
  /*
   * GUILD
   */
  
  sendGuild(text) {
    const message = session.chat.create();
    message.text = text;
    session.chat.send(text,ChatEnum.CHAT_MSG_GUILD);
  }

  _onChangeGuild(event) {
    this.setState({ guildText: event.target.value });
  }

  _onMessageGuild() {
    this.setState({ guildMessages: session.chat.guildMessages });
  }

  _onSubmitGuild(event) {
    event.preventDefault();
    if (this.state.guildText) {
      this.sendGuild(this.state.guildText);
      this.setState({ guildText: '' });
    }
  }
  
  /**
   *  WORLD
   */
  sendWorld(text) {
    const message = session.chat.create();
    message.text = text;
    session.chat.send(text,ChatEnum.CHAT_MSG_CHANNEL);
  }

  _onChangeWorld(event) {
    this.setState({ worldText: event.target.value });
  }

  _onMessageWorld() {
    this.setState({ worldMessages: session.chat.worldMessages });
  }

  _onSubmitWorld(event) {
    event.preventDefault();
    if (this.state.worldText) {
      this.sendWorld(this.state.worldText);
      this.setState({ worldText: '' });
    }
  }
  
  _getTime(local) {
      return local.getHours() + ":" + local.getMinutes() + ":" + local.getSeconds();
  }

  render() {
    return (
        <chat className="chat frame" ref="chat">
            <Tabs
                onSelect={this.handleSelect}
              >
                <TabList>
                  <Tab>Say</Tab>
                  <Tab>Guild</Tab>
                  <Tab>World</Tab>
                </TabList>
                <TabPanel>
                      <ul id="sayMessages">
                        { this.state.sayMessages.map((message, index) => {
                          const className = classes('message', message.kind);
                          return (
                            <li className={ className } key={ index }>
                              <span class="time">[{this._getTime(message.timestamp)}] </span>
                              <span class="flags">{this.state.playerNames[message.guid1] && this.state.playerNames[message.guid1].isGm ? "[GM]" : ""}</span>
                              <span class="{message.guid1}">[{this.state.playerNames[message.guid1] ? this.state.playerNames[message.guid1].name : message.guid1}] </span>
                              Says: { message.text }
                            </li>
                          );
                        }) }
                      </ul>

                      <form onSubmit={ this._onSubmitSay }>
                        <input type="text" onChange={ this._onChangeSay }
                               name="text" value={ this.state.sayText } />
                      </form>
                </TabPanel>
                <TabPanel>
                      <ul ref="guildMessages">
                        { this.state.guildMessages.map((message, index) => {
                          const className = classes('message', message.kind);
                          return (
                            <li className={ className } key={ index }>
                              <span class="time">[{this._getTime(message.timestamp)}] </span>
                              <span class="type">[Guild]</span>
                              <span class="flags">{this.state.playerNames[message.guid1] && this.state.playerNames[message.guid1].isGm ? "[GM]" : ""}</span>
                              <span class="{message.guid1}">[{this.state.playerNames[message.guid1] ? this.state.playerNames[message.guid1].name : message.guid1}] </span>
                              : { message.text }
                            </li>
                          );
                        }) }
                      </ul>

                      <form onSubmit={ this._onSubmitGuild }>
                        <input type="text" onChange={ this._onChangeGuild }
                               name="text" value={ this.state.guildText } />
                      </form>
                </TabPanel>
                <TabPanel>
                      <ul id="worldMessages">
                        { this.state.worldMessages.map((message, index) => {
                          const className = classes('message', message.kind);
                          return (
                            <li class="message.guid" className={ className } key={ index }>
                              <span class="time">[{this._getTime(message.timestamp)}] </span>
                              <span class="type">[World]</span>
                              <span class="flags">{this.state.playerNames[message.guid1] && this.state.playerNames[message.guid1].isGm ? "[GM]" : ""}</span>
                              <span class="{message.guid1}">[{this.state.playerNames[message.guid1] ? this.state.playerNames[message.guid1].name : message.guid1}] </span>
                              : { message.text }
                            </li>
                          );
                        }) }
                      </ul>

                      <form onSubmit={ this._onSubmitWorld }>
                        <input type="text" onChange={ this._onChangeWorld }
                               name="text" value={ this.state.worldText } />
                      </form>
                </TabPanel>
            </Tabs>
        </chat>
    );
  }

}

export default ChatPanel;
