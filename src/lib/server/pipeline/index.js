import BLP from 'blizzardry/lib/blp';
import * as DBC from 'blizzardry/lib/dbc/entities';
import { DecodeStream } from 'blizzardry/lib/restructure';
import { PNG } from 'pngjs';
import express from 'express';
import find from 'array-find';

import Archive from './archive';
import ServerConfig from '../utils/server-config';

class Pipeline {

  static get DATA_DIR() {
    return ServerConfig.db.get('clientData');
  }

  constructor() {
    this.router = express();
    this.router.param('resource', ::this.resource);
    this.router.get('/:resource(*.blp).png', ::this.blp);
    this.router.get('/:resource(*.dbc)/:id(*)?.json', ::this.dbc);
    this.router.get('/find/:query', ::this.find);
    this.router.get('/:resource', ::this.serve);
  }

  get archive() {
    this._archive = this._archive || Archive.build(this.constructor.DATA_DIR);
    return this._archive;
  }

  resource(req, _res, next, path) {
    req.resourcePath = path;
    req.resource = this.archive.files.get(path);
    if (req.resource) {
      next();

      // Ensure file is closed in StormLib.
      req.resource.close();
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
    const name = req.resourcePath.match(/(\w+)\.dbc/)[1];
    const definition = DBC[name];
    if (definition) {
      const dbc = definition.dbc.decode(new DecodeStream(req.resource.data));
      const id = req.params.id;
      if (id) {
        const match = find(dbc.records, function(entity) {
          return String(entity.id) === id;
        });
        if (match) {
          res.send(match);
        } else {
          const err = new Error('entity not found');
          err.status = 404;
          throw err;
        }
      } else {
        res.send(dbc.records);
      }
    } else {
      const err = new Error('entity definition not found');
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

}

export default Pipeline;
