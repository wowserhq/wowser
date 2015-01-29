var Archive, BLP, DBC, DecodeStream, PNG, Pipeline, attr, express, find, flatten;

attr = require('attr-accessor');

express = require('express');

find = require('array-find');

Archive = require('./archive');

BLP = require('blizzardry/lib/blp');

DecodeStream = require('blizzardry/lib/restructure').DecodeStream;

DBC = require('blizzardry/lib/dbc/entities');

PNG = require('pngjs').PNG;

flatten = function(array) {
  return array.reduce(function(a, b) {
    return a.concat(b);
  });
};

Pipeline = (function() {
  var DATA_DIR, get;

  module.exports = Pipeline;

  get = attr.accessors(Pipeline)[0];

  DATA_DIR = 'data';

  function Pipeline() {
    this.router = express();
    this.router.param('resource', this.resource.bind(this));
    this.router.get('/:resource(*.blp).png', this.blp.bind(this));
    this.router.get('/:resource(*.dbc)/:id(*)?.json', this.dbc.bind(this));
    this.router.get('/find/:query', this.find.bind(this));
    this.router.get('/:resource', this.serve.bind(this));
  }

  get({
    archive: function() {
      return this._archive || (this._archive = Archive.build(DATA_DIR));
    }
  });

  Pipeline.prototype.resource = function(req, res, next, path) {
    var err;
    req.resourcePath = path;
    if (req.resource = this.archive.files.get(path)) {
      return next();
    } else {
      err = new Error('resource not found');
      err.status = 404;
      throw err;
    }
  };

  Pipeline.prototype.blp = function(req, res) {
    return BLP.from(req.resource.data, function(blp) {
      var mipmap, png;
      mipmap = blp.largest;
      png = new PNG({
        width: mipmap.width,
        height: mipmap.height
      });
      png.data = mipmap.rgba;
      res.set('Content-Type', 'image/png');
      return png.pack().pipe(res);
    });
  };

  Pipeline.prototype.dbc = function(req, res) {
    var dbc, definition, entity, err, id, name;
    name = req.resourcePath.match(/(\w+)\.dbc/)[1];
    if (definition = DBC[name]) {
      dbc = definition.dbc.decode(new DecodeStream(req.resource.data));
      if (id = req.params[0]) {
        if (entity = find(dbc.records, function(entity) {
          return String(entity.id) === id;
        })) {
          return res.send(entity);
        } else {
          err = new Error('entity not found');
          err.status = 404;
          throw err;
        }
      } else {
        return res.send(dbc.records);
      }
    } else {
      err = new Error('entity definition not found');
      err.status = 404;
      throw err;
    }
  };

  Pipeline.prototype.find = function(req, res) {
    return res.send(this.archive.files.find(req.params.query));
  };

  Pipeline.prototype.serve = function(req, res) {
    return res.send(req.resource.data);
  };

  return Pipeline;

})();
