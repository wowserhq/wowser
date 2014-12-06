var Archive, DecodeStream, M2, Pipeline, Skin, attr, express, flatten;

attr = require('attr-accessor');

express = require('express');

Archive = require('./archive');

DecodeStream = require('blizzardry/node_modules/restructure/src/DecodeStream');

M2 = require('blizzardry/lib/m2');

Skin = require('blizzardry/lib/m2/skin');

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
    this.router.get('/:resource(*.m2).3geo', this.m2.bind(this));
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
      err = new Error('Resource not found');
      err.status = 404;
      return next(err);
    }
  };

  Pipeline.prototype.skinFor = function(m2, req) {
    var path, quality, skin;
    quality = req.query.quality || 0;
    path = req.resourcePath.replace('.m2', "0" + quality + ".skin");
    if (skin = this.archive.files.get(path)) {
      return Skin.decode(new DecodeStream(skin.data));
    }
  };

  Pipeline.prototype.m2 = function(req, res, next) {
    var err, m2, skin;
    m2 = M2.decode(new DecodeStream(req.resource.data));
    if (!(skin = this.skinFor(m2, req))) {
      err = new Error('Skin not found for M2');
      err.status = 404;
      return next(err);
    }
    return res.send({
      metadata: {
        formatVersion: 3
      },
      vertices: flatten(m2.vertices.map(function(vertex) {
        return vertex.position;
      })),
      faces: flatten(skin.triangles.map(function(triangle) {
        return [0].concat(triangle.map(function(vi) {
          return skin.indices[vi];
        }));
      }))
    });
  };

  Pipeline.prototype.find = function(req, res) {
    return res.send(this.archive.files.find(req.params.query));
  };

  Pipeline.prototype.serve = function(req, res, next) {
    return res.send(req.resource.data);
  };

  return Pipeline;

})();
