import ByteBuffer from 'byte-buffer';
import EventEmitter from 'events';

// Base-class for any socket including signals and host/port management
class Socket extends EventEmitter {

  // Maximum buffer capacity
  // TODO: Arbitrarily chosen, determine this cap properly
  static BUFFER_CAP = 2048;

  // Creates a new socket
  constructor() {
    super();

    // Holds the host, port and uri currently connected to (if any)
    this.host = null;
    this.port = NaN;
    this.uri = null;

    // Holds the actual socket
    this.socket = null;

    // Holds buffered data
    this.buffer = null;

    // Holds incoming packet's remaining size in bytes (false if no packet is being handled)
    this.remaining = false;
  }

  // Whether this socket is currently connected
  get connected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  // Connects to given host through given port (if any; default port is implementation specific)
  connect(host, port = NaN) {
    if (!this.connected) {
      var that = this;

      this.host = host;
      this.port = port;
      this.uri = 'ws://' + this.host + ':' + this.port;

      this.buffer = new ByteBuffer(0, ByteBuffer.LITTLE_ENDIAN);
      this.remaining = false;

      this.socket = new WebSocket(this.uri, 'binary');
      this.socket.binaryType = 'arraybuffer';

      this.socket.onopen = (e) => {
        this.emit('connect', e);
      };

      this.socket.onclose = (e) => {
        that.disconnect();
      };

      this.socket.onmessage = (e) => {
        const index = this.buffer.index;
        this.buffer.end().append(e.data.byteLength).write(e.data);
        this.buffer.index = index;

        this.emit('data:receive', this);

        if (this.buffer.available === 0 && this.buffer.length > this.constructor.BUFFER_CAP) {
          this.buffer.clip();
        }
      };

      this.socket.onerror = function(e) {
        console.error(e);
      };
    }

    return this;
  }

  // Attempts to reconnect to cached host and port
  reconnect() {
    if (!this.connected && this.host && this.port) {
      this.connect(this.host, this.port);
    }
    return this;
  }

  // Disconnects this socket
  disconnect() {
    if (this.connected) {
      this.socket.close();
    }

    alert("You have been disconnected");
    location.reload();

    return this;
  }

  // Finalizes and sends given packet
  send(packet) {
    if (this.connected) {

      packet.finalize();

      console.log('⟸', packet.toString());
      // console.debug packet.toHex()
      // console.debug packet.toASCII()

      this.socket.send(packet.buffer);

      this.emit('packet:send', packet);

      return true;
    }

    return false;
  }

}

export default Socket;
