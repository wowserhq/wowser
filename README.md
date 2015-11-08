# Wowser

[![Version](https://img.shields.io/npm/v/wowser.svg?style=flat)](https://www.npmjs.org/package/wowser)
[![Join chat](https://img.shields.io/badge/gitter-join_chat-blue.svg?style=flat)](https://gitter.im/timkurvers/wowser)
[![Build Status](https://img.shields.io/travis/timkurvers/wowser.svg?style=flat)](https://travis-ci.org/timkurvers/wowser)
[![Dependency Status](https://img.shields.io/gemnasium/timkurvers/wowser.svg?style=flat)](https://gemnasium.com/timkurvers/wowser)
[![Code Climate](https://img.shields.io/codeclimate/github/timkurvers/wowser.svg?style=flat)](https://codeclimate.com/github/timkurvers/wowser)
[![Coverage](https://img.shields.io/codeclimate/coverage/github/timkurvers/wowser.svg?style=flat)](https://codeclimate.com/github/timkurvers/wowser)

World of Warcraft in the browser using JavaScript and WebGL.

Licensed under the **MIT** license, see LICENSE for more information.

[![See Wowser tech demo](http://office.moonsphere.net/wowser-tech-demo.jpg)](https://www.youtube.com/watch?v=8QFY_3uM1iw)

## Background

Wowser is a proof-of-concept of getting a triple-A game to run in a webbrowser,
attempting to tackle a wide variety of challenges: data retrieval, socket
connections, cryptography, 3d graphics, binary data handling, background workers
and audio, to name a few.

## Features

Wowser is aiming to be both a low-level API as well as a graphical client,
interacting with a World of Warcraft server like an official client would.

**Note:** Only Wrath of the Lich King (3.3.5a) is currently supported. A copy of
the official client is required.

**Warning:** Do not attempt to use this client on official/retail servers as
your account may get banned.

At present, Wowser is capable of:

- Authenticating by username / password.
- Listing available realms.
- Connecting to a realm.
- Listing characters available on a realm.
- Joining the game world with a character.
- Logging game world packets, such as when a creature moves in the vicinity.

In addition, there's good progress on getting terrain and models rendered.

## Browser Support

Wowser is presumed to be working on any browser supporting [JavaScript's typed
arrays] and at the very least a binary version of the WebSocket protocol.

## Development & Contribution

Wowser is written in [ES2015], compiled by [Babel], developed with [Gulp] and
tested through [Mocha].

Getting this toolchain up and running, is easy and straight-forward:

1. Get the code:

   ```shell
   git clone git://github.com/timkurvers/wowser.git
   ```

2. Download and install [Node.js] – including `npm` – for your platform.

3. Install dependencies:

   ```shell
   npm install
   ```

4. Install [StormLib] and [BLPConverter], which are used to handle Blizzard's
   game files.

5. Run `npm run gulp` which will automatically build the project when source
   files change.

6. To utilize raw TCP connections a WebSocket proxy is required for JavaScript
   clients.

   [Websockify] can - among other things - act as a proxy for raw TCP sockets.

   For now, you will want to proxy both port 3724 (auth) and 8129 (world). Use a
   different set of ports if your server is on the same machine as your client.

   ```shell
   node_modules/.bin/websockify 3724 host:3724
   node_modules/.bin/websockify 8129 host:8129
   ```

7. Use `npm run serve` to start Wowser.

   - On first run you will be prompted to specify the following:
     1. Path to client data folder (e.g. `C:/Program Files (x86)/World of Warcraft/Data`)
     2. Server port (default is `3000`)

   - You can clear these settings by running `npm run reset`

   **Disclaimer:** Wowser serves up resources to the browser over HTTP. Depending
   on your network configuration these may be available to others. Respect laws
   and do not distribute game data you do not own.

When contributing, please:

- Fork the repository
- Open a pull request (preferably on a separate branch)

[Babel]: https://babeljs.io/
[BLPConverter]: https://github.com/timkurvers/blizzardry#blp
[ES2015]: https://babeljs.io/docs/learn-es2015/
[Gulp]: http://gulpjs.com/
[JavaScript's typed arrays]: http://caniuse.com/#search=typed%20arrays
[Mocha]: http://mochajs.org/
[Node.js]: http://nodejs.org/#download
[StormLib]: https://github.com/timkurvers/blizzardry#mpq
[Websockify]: https://github.com/kanaka/websockify/
