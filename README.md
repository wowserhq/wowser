# Wowser

[![Version](https://img.shields.io/npm/v/wowser.svg?style=flat)](https://www.npmjs.org/package/wowser)
[![Join chat](https://img.shields.io/badge/gitter-join_chat-blue.svg?style=flat)](https://gitter.im/timkurvers/wowser)
[![Build Status](https://img.shields.io/travis/timkurvers/wowser.svg?style=flat)](https://travis-ci.org/timkurvers/wowser)
[![Dependency Status](https://img.shields.io/gemnasium/timkurvers/wowser.svg?style=flat)](https://gemnasium.com/timkurvers/wowser)
[![Code Climate](https://img.shields.io/codeclimate/github/timkurvers/wowser.svg?style=flat)](https://codeclimate.com/github/timkurvers/wowser)
[![Coverage](https://img.shields.io/codeclimate/coverage/github/timkurvers/wowser.svg?style=flat)](https://codeclimate.com/github/timkurvers/wowser)

World of Warcraft in the browser using JavaScript and WebGL.

Licensed under the **MIT** license, see LICENSE for more information.


## Features

 * Lightweight in-browser client without reliance on external plugins.
 * Currently targeting Wrath of the Lich King.
 * A low-level interface for developing bots/tools and debugging servers.


## Usage & API

Wowser is both a client as well as a low-level API, allowing one to interact with a World of Warcraft server, behaving exactly as an official client would.

The project is very much a work in progress, but is already capable of successfully authenticating, logging into a realm and listing chat messages.


## Development & Contribution

Wowser is written in [CoffeeScript](http://coffeescript.org/) and developed with [Gulp](http://gulpjs.com/).

Getting this toolchain up and running, is easy and straight-forward:

1. Get the code:

   ```shell
   git clone git://github.com/timkurvers/wowser.git
   ```

2. Download and install [Node.js](http://nodejs.org/#download) (includes npm) for your platform.

3. Install dependencies:

   ```shell
   npm install
   ```

4. Install [StormLib](https://github.com/timkurvers/blizzardry#mpq) and [BLPConverter](https://github.com/timkurvers/blizzardry#blp), which are used to handle Blizzard's game files.

5. Run `gulp` which will automatically build the project when source files change.

   When not available, run `./node_modules/.bin/gulp` instead.

6. To utilize raw TCP connections a WebSocket proxy is required for JavaScript clients.

   [Websockify](https://github.com/kanaka/websockify/) can - among other things - act
   as a proxy for raw TCP sockets.

   For now, you will want to proxy both port 3724 (auth) and 8129 (world). If your server is on the same machine as your client, use a different set of ports.

   ```shell
   websockify 3724 host:3724
   websockify 8129 host:8129
   ```

6. Use `npm run serve` to serve Wowser on `localhost:3000`.


When contributing, please:

* Fork the repository
* Open a pull request (preferably on a separate branch)
* Do *not* include any distribution files (such as wowser.js or wowser.min.js)


## Browser Support

Wowser is presumed to be working on any browser supporting [JavaScript's typed arrays](http://caniuse.com/#search=typed%20arrays) and at the very least a binary version of the WebSocket protocol.
