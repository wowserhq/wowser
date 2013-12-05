# Wowser

World of Warcraft in the browser using JavaScript and WebGL.

Licensed under the **MIT** license, see LICENSE for more information.


## Usage & API

Wowser is both a client as well as a low-level API, allowing one to interact with a World of Warcraft server, behaving exactly as the official client would. Its structure facilitates for any expansion to be supported, however only Wrath of the Lich King actually is - for now.

The project is very much a work in progress, but is already capable of successfully authenticating, logging into a realm and listing chat messages.


## Demo

To utilize raw TCP connections a WebSocket proxy is required for JavaScript clients. The steps below will outline on how to get a demo up and running.

1. Make sure you have [Python](http://python.org/) and [pip](http://www.pip-installer.org/) installed on your system.

2. Install [WebSockify](https://github.com/kanaka/websockify/) as follows:

  ```shell
  sudo pip install websockify
  ```

3. WebSockify can - among other things - act as a proxy for raw TCP sockets.

   For now, you will want to proxy both port 3724 (auth) and 8129 (world). If your server is on the same machine as your client, use a different set of ports.

   ```shell
   websockify 3724 host:3724
   websockify 8129 host:8129
   ```

4. Clone this project:

   ```shell
   git clone git://github.com/timkurvers/wowser.git
   ```

5. Configure `index.html` with the correct host, username and password.

6. Open `index.html` in your favourite modern browser (Chrome 20+, Firefox 15+, Safari 5+) and see the console for activity.


## Development & Contribution

Wowser is written in [CoffeeScript](http://coffeescript.org/) and developed with [Grunt](http://gruntjs.com/).

Getting this toolchain up and running, is easy and straight-forward:

1. Get the code:

   ```shell
   git clone git://github.com/timkurvers/wowser.git
   ```

2. Download and install [NodeJS](http://nodejs.org/#download) (includes NPM) for your platform.

3. Install dependencies:

   ```shell
   npm install
   ```

4. Make sure you have installed `grunt-cli` globally:

   ```shell
   npm install -g grunt-cli
   ```

5. Run `grunt watch` which will automatically build the project when source files change.

6. For now, please use the demo setup above for development.


When contributing, please:

* Fork the repository
* Open a pull request (preferably on a separate branch)
* Do *not* include any distribution files (such as wowser.js or wowser.min.js)


## Dependencies

All of Wowser's dependencies are bundled in its distributed release and do not have to be downloaded/included separately.

* [Backbone](http://backbonejs.org/)
* [Underscore](http://underscorejs.org/)
* [ByteBuffer](https://github.com/timkurvers/byte-buffer)
* [JSBN](https://github.com/timkurvers/jsbn)


## Browser Support

Wowser is presumed to be working on any browser supporting [JavaScript's typed arrays](http://caniuse.com/#search=typed%20arrays) and at the very least a binary version of the WebSocket protocol.
