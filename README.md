# Wowser

[![Version](https://img.shields.io/npm/v/wowser.svg?style=flat)](https://www.npmjs.org/package/wowser)
[![Join chat](https://img.shields.io/badge/gitter-join_chat-blue.svg?style=flat)](https://gitter.im/wowserhq/wowser)
[![Build Status](https://img.shields.io/travis/wowserhq/wowser.svg?style=flat)](https://travis-ci.org/wowserhq/wowser)
[![Dependency Status](https://img.shields.io/gemnasium/wowserhq/wowser.svg?style=flat)](https://gemnasium.com/wowserhq/wowser)
[![Code Climate](https://img.shields.io/codeclimate/github/wowserhq/wowser.svg?style=flat)](https://codeclimate.com/github/wowserhq/wowser)
[![Coverage](https://img.shields.io/codeclimate/coverage/github/wowserhq/wowser.svg?style=flat)](https://codeclimate.com/github/wowserhq/wowser)

World of Warcraft in the browser using JavaScript and WebGL.

Licensed under the **MIT** license, see LICENSE for more information.

[![See Wowser tech demo](https://user-images.githubusercontent.com/378235/27762818-800fd91c-5e79-11e7-8301-733d736dd065.jpg)](https://www.youtube.com/watch?v=BrnbANSwC4I)

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
- Chat in game on following channels: Guild, Say, Wispers, World (hardcoded custom channel)
- Logging game world packets, such as when a creature moves in the vicinity.

In addition, there's good progress on getting terrain and models rendered.

## Browser Support

Wowser is presumed to be working on any browser supporting [JavaScript's typed
arrays] and at the very least a binary version of the WebSocket protocol.

## Development

Wowser is written in [ES2015], developed with [webpack] and [Gulp], compiled by
[Babel] and [soon™] to be tested through [Mocha].

1. Clone the repository:

   ```shell
   git clone git://github.com/wowserhq/wowser.git
   ```

2. Download and install [Node.js] – including `npm` – for your platform.

3. Install dependencies:

   ```shell
   npm install
   ```

4. Install [StormLib] and [BLPConverter], which are used to handle Blizzard's
   game files.

### Client

Create a copy of /conf/conf.js.dist file and name it /conf/conf.js (don't delete the .dist file)
then configure it.

[Webpack]'s development server monitors source files and builds:

```shell
npm run web-dev
```

Wowser will be served on `http://localhost:8080`.

### Pipeline server

To deliver game resources to its client, Wowser ships with a pipeline.

Build the pipeline:

```shell
npm run gulp
```

Keep this process running to monitor source files and automatically rebuild.

After building, serve the pipeline as follows in a separate process:

```shell
npm run serve
```

On first run you will be prompted to specify the following:

- Path to client data folder (e.g. `C:/Program Files (x86)/World of Warcraft/Data`)
- Server port (default is `3000`)
- Number of cluster workers (default depends on amount of CPUs)

Clear these settings by running `npm run reset`

**Disclaimer:** Wowser serves up resources to the browser over HTTP. Depending
on your network configuration these may be available to others. Respect laws and
do not distribute game data you do not own.

### Socket proxies

To utilize raw TCP connections a WebSocket proxy is required for JavaScript
clients.

[Websockify] can - among other things - act as a proxy for raw TCP sockets.

For now, you will want to proxy both port 3724 (auth) and 8129 (world). Use a
different set of ports if the game server is on the same machine as your client.

```shell
npm run proxy 3724 host:3724
npm run proxy 8129 host:8129
```

## Contribution

When contributing, please:

- Fork the repository
- Open a pull request (preferably on a separate branch)

[Babel]: https://babeljs.io/
[BLPConverter]: https://github.com/wowserhq/blizzardry#blp
[ES2015]: https://babeljs.io/docs/learn-es2015/
[Gulp]: http://gulpjs.com/
[JavaScript's typed arrays]: http://caniuse.com/#search=typed%20arrays
[Mocha]: http://mochajs.org/
[Node.js]: http://nodejs.org/#download
[StormLib]: https://github.com/wowserhq/blizzardry#mpq
[Websockify]: https://github.com/kanaka/websockify/
[soon™]: http://www.wowwiki.com/Soon
[webpack]: http://webpack.github.io/
