'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var express = require('express');
var find = require('array-find');
var Archive = require('./archive');
var BLP = require('blizzardry/lib/blp');

var _require = require('blizzardry/lib/restructure');

var DecodeStream = _require.DecodeStream;

var DBC = require('blizzardry/lib/dbc/entities');

var _require2 = require('pngjs');

var PNG = _require2.PNG;

// TODO: Find a module for this
var flatten = function flatten(array) {
  return array.reduce(function (a, b) {
    return a.concat(b);
  });
};

module.exports = (function () {
  function Pipeline() {
    _classCallCheck(this, Pipeline);

    this.router = express();
    this.router.param('resource', this.resource.bind(this));
    this.router.get('/:resource(*.blp).png', this.blp.bind(this));
    this.router.get('/:resource(*.dbc)/:id(*)?.json', this.dbc.bind(this));
    this.router.get('/find/:query', this.find.bind(this));
    this.router.get('/:resource', this.serve.bind(this));
  }

  _createClass(Pipeline, [{
    key: 'resource',
    value: function resource(req, res, next, path) {
      req.resourcePath = path;
      if (req.resource = this.archive.files.get(path)) {
        next();
      } else {
        var _err = new Error('resource not found');
        _err.status = 404;
        throw _err;
      }
    }
  }, {
    key: 'blp',
    value: function blp(req, res) {
      BLP.from(req.resource.data, function (blp) {
        var mipmap = blp.largest;

        var png = new PNG({ width: mipmap.width, height: mipmap.height });
        png.data = mipmap.rgba;

        res.set('Content-Type', 'image/png');
        png.pack().pipe(res);
      });
    }
  }, {
    key: 'dbc',
    value: (function (_dbc) {
      function dbc(_x, _x2) {
        return _dbc.apply(this, arguments);
      }

      dbc.toString = function () {
        return _dbc.toString();
      };

      return dbc;
    })(function (req, res) {
      name = req.resourcePath.match(/(\w+)\.dbc/)[1];
      if (definition = DBC[name]) {
        dbc = definition.dbc.decode(new DecodeStream(req.resource.data));
        if (id = req.params[0]) {
          entity = find(dbc.records, function (entity) {
            return String(entity.id) == id;
          });
          if (entity) {
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
    })
  }, {
    key: 'find',
    value: function find(req, res) {
      res.send(this.archive.files.find(req.params.query));
    }
  }, {
    key: 'serve',
    value: function serve(req, res) {
      res.send(req.resource.data);
    }
  }, {
    key: 'archive',
    get: function get() {
      this._archive = this._archive || Archive.build(this.constructor.DATA_DIR);
      return this._archive;
    }
  }], [{
    key: 'DATA_DIR',
    value: 'data',
    enumerable: true
  }]);

  return Pipeline;
})();