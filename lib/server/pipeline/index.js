var Archive, Pipeline, attr, express;

attr = require('attr-accessor');

express = require('express');

Archive = require('./archive');

Pipeline = (function() {
  var DATA_DIR, get;

  module.exports = Pipeline;

  get = attr.accessors(Pipeline)[0];

  DATA_DIR = 'data';

  function Pipeline() {
    this.router = express();
    this.router.get('/find/:query', this.find.bind(this));
    this.router.get('/:resource', this.serve.bind(this));
  }

  get({
    archive: function() {
      return this._archive || (this._archive = Archive.build(DATA_DIR));
    }
  });

  Pipeline.prototype.find = function(req, res) {
    return res.send(this.archive.files.find(req.params.query));
  };

  Pipeline.prototype.serve = function(req, res, next) {
    var file;
    if (file = this.archive.files.get(req.params.resource)) {
      return res.send(file.data);
    } else {
      return next();
    }
  };

  return Pipeline;

})();
