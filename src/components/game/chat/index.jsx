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
      selectedIndex : 0,
      playerNames : session.chat.playerNames,
      sayText: '',
      wispText: '',
      guildText: '',
      worldText: '',
      wispDest: null,
      sayMessages: session.chat.sayMessages,
      wispMessages: session.chat.wispMessages,
      guildMessages: session.chat.guildMessages,
      worldMessages: session.chat.worldMessages,
      logsMessages: session.chat.logsMessages
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
    this._onChangeWisp = ::this._onChangeWisp;
    this._onChangeWispDest = ::this._onChangeWispDest;
    this._onMessageWisp = ::this._onMessageWisp;
    this._onSubmitWisp = ::this._onSubmitWisp;
    this._setWispDest  = ::this._setWispDest;
    this._onMessageLogs = ::this._onMessageLogs;
    this._selTab = ::this._selTab;
    this._onMessageDispatch = ::this._onMessageDispatch;

    session.chat.on('message', this._onMessageDispatch);
  }

  componentDidUpdate() {
    if (document.getElementById("sayMessages"))
      document.getElementById("sayMessages").scrollTop   = document.getElementById("sayMessages").scrollHeight;
    else if (document.getElementById("worldMessages"))
      document.getElementById("worldMessages").scrollTop   = document.getElementById("worldMessages").scrollHeight;
    else if (document.getElementById("guildMessages"))
      document.getElementById("guildMessages").scrollTop   = document.getElementById("guildMessages").scrollHeight;
    else if (document.getElementById("wispMessages"))
      document.getElementById("wispMessages").scrollTop   = document.getElementById("wispMessages").scrollHeight;
    else if (document.getElementById("logsMessages"))
      document.getElementById("logsMessages").scrollTop   = document.getElementById("logsMessages").scrollHeight;
  }

  _selTab(e) {
    this.setState({selectedIndex : e });
    session.chat.emit("message",null); // workaround to keep chat box at bottom
  }

  _onMessageDispatch(message, type) {
      switch(type) {
        case ChatEnum.CHAT_MSG_CHANNEL:
            this._onMessageWorld();
            document.getElementById("react-tabs-0").setAttribute("aria-selected", "true");
        break;
        case ChatEnum.CHAT_MSG_GUILD:
            this._onMessageGuild();
            document.getElementById("react-tabs-2").setAttribute("aria-selected", "true");
        break;
        case ChatEnum.CHAT_MSG_WHISPER:
        case ChatEnum.CHAT_MSG_WHISPER_INFORM:
        case ChatEnum.CHAT_MSG_WHISPER_FOREIGN:
            this._onMessageWisp();
            document.getElementById("react-tabs-4").setAttribute("aria-selected", "true");
        break;
        case ChatEnum.CHAT_MSG_SAY:
        case ChatEnum.CHAT_MSG_SYSTEM:
        case ChatEnum.CHAT_MSG_EMOTE:
        case ChatEnum.CHAT_MSG_YELL:
            this._onMessageSay();
            document.getElementById("react-tabs-6").setAttribute("aria-selected", "true");
        break;
        default:
            this._onMessageLogs();
        break;
    }
  }

/*
 * SAY
 */

  sendSay(text) {
    const message = session.chat.create();
    message.text = text;
    session.chat.send(text, ChatEnum.CHAT_MSG_SAY);
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

  /**
   *  WISP
   */
  sendWisp(text) {
    const message = session.chat.create();
    message.text = text;
    session.chat.send(text, ChatEnum.CHAT_MSG_WHISPER, this.state.wispDest);
  }

  _onChangeWisp(event) {
    this.setState({ wispText: event.target.value });
  }

  _onChangeWispDest(event) {
    this.setState({ wispDest: event.target.value });
  }

  _onMessageWisp() {
    this.setState({ wispMessages: session.chat.wispMessages });
  }

  _setWispDest(e) {
    e.preventDefault();
    var guid=e.target.parentElement.classList[0];
    guid = parseInt(guid);
    
    if (guid>0) {
      var name = this.state.playerNames[guid].name;
      var nome = "Gnoma";

      var equal=name.length == nome.length;

      this.setState({
        wispDest : (' ' + name).slice(1),
        selectedIndex : 2
      });
    }
  }

  _onSubmitWisp(event) {
    event.preventDefault();
    if (this.state.wispText) {
      this.sendWisp(this.state.wispText);
      this.setState({ wispText: '' });
    }
  }

  /*
    LOGS
   */

  _onMessageLogs() {
    this.setState({ logsMessages: session.chat.logsMessages });
  }
  

  _getTime(local) {
      return local.getHours() + ":" + local.getMinutes() + ":" + local.getSeconds();
  }

  render() {
    return (
        <chat className="chat frame" ref="chat">
            <Tabs
                selectedIndex={this.state.selectedIndex}
                onSelect={this._selTab}
              >
                <TabList>
                  <Tab>World</Tab>
                  <Tab>Guild</Tab>
                  <Tab>Wisp</Tab>
                  <Tab>Say in area</Tab>
                  <Tab>Logs</Tab>
                </TabList>
                <TabPanel>
                      <ul id="worldMessages" className="chat-box">
                        <li>- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</li>
                        { this.state.worldMessages.map((message, index) => {
                          const className = classes('message', message.kind);
                          return (
                            <li className="message.guid" className={ className } key={ index }>
                              <span className="time">[{this._getTime(message.timestamp)}] </span>
                              <span className="type">[World]</span>
                              <span className="flags">{this.state.playerNames[message.guid1] && this.state.playerNames[message.guid1].isGm ? "[GM]" : ""}</span>
                              <a style={{cursor: 'pointer'}} className={ message.guid1 } onClick={ this._setWispDest }>[{this.state.playerNames[message.guid1] ? this.state.playerNames[message.guid1].name : message.guid1}] </a>
                              : { message.text }
                            </li>
                          );
                        }) }
                      </ul>

                      <form onSubmit={ this._onSubmitWorld }>
                        <input type="text" maxLength={254} onChange={ this._onChangeWorld }
                               name="text" value={ this.state.worldText } />
                      </form>
                </TabPanel>
                <TabPanel>
                      <ul id="guildMessages" className="chat-box">
                        <li>- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</li>
                        { this.state.guildMessages.map((message, index) => {
                          const className = classes('message', message.kind);
                          return (
                            <li className={ className } key={ index }>
                              <span className="time">[{this._getTime(message.timestamp)}] </span>
                              <span className="type">[Guild]</span>
                              <span className="flags">{this.state.playerNames[message.guid1] && this.state.playerNames[message.guid1].isGm ? "[GM]" : ""}</span>
                              <a style={{cursor: 'pointer'}} className={ message.guid1 } onClick={ this._setWispDest }>[{this.state.playerNames[message.guid1] ? this.state.playerNames[message.guid1].name : message.guid1}] </a>
                              : { message.text }
                            </li>
                          );
                        }) }
                      </ul>

                      <form onSubmit={ this._onSubmitGuild }>
                        <input type="text" maxLength={254} onChange={ this._onChangeGuild }
                               name="text" value={ this.state.guildText } />
                      </form>
                </TabPanel>
                <TabPanel>
                      <ul id="wispMessages" className="chat-box">
                        <li>- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</li>
                        { this.state.wispMessages.map((message, index) => {
                          const className = classes('message', message.kind);
                          return (
                            <li className={ className } key={ index }>
                              <span className="time">[{this._getTime(message.timestamp)}] </span>
                              <span className="flags">{this.state.playerNames[message.guid1] && this.state.playerNames[message.guid1].isGm ? "[GM]" : ""}</span>
                              {message.kind === "whisper incoming" ? "" : "To "}
                              <a style={{cursor: 'pointer'}} className={ message.guid1 } onClick={ this._setWispDest }>[{this.state.playerNames[message.guid1] ? this.state.playerNames[message.guid1].name : message.guid1}] </a>
                              {message.kind === "whisper incoming" ? "whispers" : ""}: { message.text }
                            </li>
                          );
                        }) }
                      </ul>

                      <form onSubmit={ this._onSubmitWisp } className="message whisper outgoing">
                        <div className="wisp-form">
                            <div className="wisp-to">
                              <span>
                                <input className="wisp-dest" maxLength={12} type="text" onChange={ this._onChangeWispDest } name="name" value={ this.state.wispDest } placeholder="To:" />
                              </span>
                            </div>
                            <div className="wisp-input">
                              <input className="wisp-input" type="text" onChange={ this._onChangeWisp }
                                name="text"  maxLength={254} value={ this.state.wispText } />
                            </div>
                            <div style={{display: 'table-cell'}}>
                              <button className="send" type='submit'>></button>
                            </div>
                        </div>
                      </form>
                </TabPanel>
                <TabPanel>
                      <ul id="sayMessages" className="chat-box">
                        <li>- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</li>
                        { this.state.sayMessages.map((message, index) => {
                          const className = classes('message', message.kind);
                          return (
                            <li className={ className } key={ index }>
                              <span className="time">[{this._getTime(message.timestamp)}] </span>
                              <span className="flags">{this.state.playerNames[message.guid1] && this.state.playerNames[message.guid1].isGm ? "[GM]" : ""}</span>
                              <a style={{cursor: 'pointer'}} className={ message.guid1 } onClick={ this._setWispDest }>[{this.state.playerNames[message.guid1] ? this.state.playerNames[message.guid1].name : message.guid1}] </a>
                              Says: { message.text }
                            </li>
                          );
                        }) }
                      </ul>

                      <form onSubmit={ this._onSubmitSay }>
                        <input type="text" maxLength={254} onChange={ this._onChangeSay }
                               name="text" value={ this.state.sayText } />
                      </form>
                </TabPanel>
                <TabPanel>
                      <ul id="logsMessages" className="chat-box">
                        <li>- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</li>
                        { this.state.logsMessages.map((message, index) => {
                          const className = classes('message', message.kind);
                          return (
                            <li className="message.guid" className={ className } key={ index }>
                              <span className="time">[{this._getTime(message.timestamp)}] </span>
                              <span className="type">[Logs]</span>
                              <span className="flags">{this.state.playerNames[message.guid1] && this.state.playerNames[message.guid1].isGm ? "[GM]" : ""}</span>
                              <a style={{cursor: 'pointer'}} className={ message.guid1 } onClick={ this._setWispDest }>[{this.state.playerNames[message.guid1] ? this.state.playerNames[message.guid1].name : message.guid1}] </a>
                              : { message.text }
                            </li>
                          );
                        }) }
                      </ul>
                </TabPanel>
            </Tabs>
        </chat>
    );
  }

}

export default ChatPanel;
