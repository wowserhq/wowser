var Archive, BLP, DBC, DecodeStream, M2, PNG, Pipeline, Skin, attr, express, find, flatten;

attr = require('attr-accessor');

express = require('express');

find = require('array-find');

Archive = require('./archive');

BLP = require('blizzardry/lib/blp');

DecodeStream = require('blizzardry/node_modules/restructure/src/DecodeStream');

DBC = require('blizzardry/lib/dbc/entities');

M2 = require('blizzardry/lib/m2');

PNG = require('pngjs').PNG;

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
    this.router.get('/:resource(*.blp).png', this.blp.bind(this));
    this.router.get('/:resource(*.dbc)/:id(*)?.json', this.dbc.bind(this));
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
      png.data = mipmap.data;
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
      err = new Error('skin not found for M2');
      err.status = 404;
      throw err;
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
