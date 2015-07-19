const express = require('express');
const find = require('array-find');
const Archive = require('./archive');
const ServerConfig = require('../utils/server-config');
const BLP = require('blizzardry/lib/blp');
const {DecodeStream} = require('blizzardry/lib/restructure');
const DBC = require('blizzardry/lib/dbc/entities');
const {PNG} = require('pngjs');

// TODO: Find a module for this
const flatten = function(array) {
  return array.reduce(function(a, b) {
    return a.concat(b);
  });
};

module.exports = class Pipeline {

  static get DATA_DIR() {
    return ServerConfig.db.get('clientData');
  }

  constructor() {
    this.router = express();
    this.router.param('resource', this.resource.bind(this));
    this.router.get('/:resource(*.blp).png', this.blp.bind(this));
    this.router.get('/:resource(*.dbc)/:id(*)?.json', this.dbc.bind(this));
    this.router.get('/find/:query', this.find.bind(this));
    this.router.get('/:resource', this.serve.bind(this));
  }

  get archive() {
    this._archive = this._archive || Archive.build(this.constructor.DATA_DIR);
    return this._archive;
  }

  resource(req, res, next, path) {
    req.resourcePath = path;
    if(req.resource = this.archive.files.get(path)) {
      next();
    } else {
      const err = new Error('resource not found');
      err.status = 404;
      throw err;
    }
  }

  blp(req, res) {
    BLP.from(req.resource.data, function(blp) {
      const mipmap = blp.largest;

      const png = new PNG({ width: mipmap.width, height: mipmap.height });
      png.data = mipmap.rgba;

      res.set('Content-Type', 'image/png');
      png.pack().pipe(res);
    });
  }

  dbc(req, res) {
    name = req.resourcePath.match(/(\w+)\.dbc/)[1];
    if(definition = DBC[name]) {
      dbc = definition.dbc.decode(new DecodeStream(req.resource.data));
      if(id = req.params[0]) {
        entity = find(dbc.records, function(entity) {
          return String(entity.id) == id;
        });
        if(entity) {
          res.send(entity);
        } else {
          err = new Error('entity not found');
          err.status = 404;
          throw err;
        }
      } else {
        res.send(dbc.records);
      }
    } else {
      err = new Error('entity definition not found');
      err.status = 404;
      throw err;
    }
  }

  find(req, res) {
    res.send(this.archive.files.find(req.params.query));
  }

  serve(req, res) {
    res.send(req.resource.data);
  }

};
