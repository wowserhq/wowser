var Loader;

Loader = (function() {
  module.exports = Loader;

  function Loader() {
    if (this.prefix == null) {
      this.prefix = 'pipeline/';
    }
    if (this.responseType == null) {
      this.responseType = 'arraybuffer';
    }
  }

  Loader.prototype.load = function(path, callback) {
    var uri, xhr;
    uri = "" + this.prefix + path;
    xhr = new XMLHttpRequest();
    xhr.open('GET', encodeURI(uri), true);
    xhr.onload = function(e) {
      if (this.status === 200) {
        return callback(this.response);
      }
    };
    xhr.responseType = this.responseType;
    return xhr.send();
  };

  return Loader;

})();
