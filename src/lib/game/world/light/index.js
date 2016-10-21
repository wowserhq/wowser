import * as THREE from 'three';

import DBC from '../../../pipeline/dbc';
import Default from './default';
import Tables from './tables';

/*

  -- Time of Day Chart --

  HH:mm - hh:mm   - hmin - progress

  00:00 - 12:00am -    0 - 0.0
  03:00 -  3:00am -  360 - 0.125
  06:00 -  6:00am -  720 - 0.25
  09:00 -  9:00am - 1080 - 0.375
  12:00 - 12:00pm - 1440 - 0.5
  15:00 -  3:00pm - 1800 - 0.625
  18:00 -  6:00pm - 2160 - 0.75
  21:00 -  9:00pm - 2520 - 0.875
  24:00 - 12:00am - 2880 - 1.0

*/

class WorldLight {

  static tables = Tables;

  static overrideTime = null;

  static dayNightProgression = 0.0;

  static sunDirection = {
    phi: 0.0,
    theta: 0.0,
    vector: {
      raw: new THREE.Vector3(),
      transformed: new THREE.Vector3()
    }
  };

  static selfIlluminatedScalar = 0.0;

  static active = {
    sources: [],
    blend: null
  };

  static uniforms = {
    // [dir.x, dir.y, dir.z, unused]
    sunParams:          new THREE.Uniform(new Float32Array(Default.sunParams)),

    // [r, g, b, a]
    sunAmbientColor:    new THREE.Uniform(new Float32Array(Default.sunAmbientColor)),

    // [r, g, b, a]
    sunDiffuseColor:    new THREE.Uniform(new Float32Array(Default.sunDiffuseColor)),

    // [start, end, unused, unused]
    fogParams:          new THREE.Uniform(new Float32Array(Default.fogParams)),

    // [r, g, b, a]
    fogColor:           new THREE.Uniform(new Float32Array(Default.fogColor))
  };

  static update(frame, mapID, time = null) {
    const { x, y, z } = frame.camera.position;

    let queryTime;

    if (this.overrideTime !== null) {
      queryTime = this.overrideTime;
    } else if (time !== null) {
      queryTime = time;
    } else {
      queryTime = this.currentLightTime();
    }

    this.dayNightProgression = queryTime / 2880.0;

    this.updateSunDirection(frame.camera);

    this.updateSelfIlluminatedScalar();

    this.query(mapID, x, y, z, queryTime).then((results) => {
      this.sortLights(results);

      const blend = this.blendLights(results);

      this.updateUniforms(blend);

      this.active.sources = results;
      this.active.blend = blend;
    });
  }

  /**
   * Update the sun direction for the given camera and the current day night progression value.
   *
   * Note that the actual client seems to transform the sun direction using the view matrix of
   * the camera.
   *
   * In Wowser, we apply lighting in model space, and thus do not make use of the transformed
   * direction vector.
   *
   */
  static updateSunDirection(camera) {
    const viewMatrix = camera.matrixWorldInverse;

    const phiTable = this.tables.directionPhiTable;
    const thetaTable = this.tables.directionThetaTable;

    const phi = this.interpolateDayNightTable(phiTable, 4, this.dayNightProgression);
    const theta = this.interpolateDayNightTable(thetaTable, 4, this.dayNightProgression);

    this.sunDirection.phi = phi;
    this.sunDirection.theta = theta;

    const vector = this.getVanillaSunDirection(phi, theta);
    const transformedVector = vector.clone().transformDirection(viewMatrix).normalize();

    this.sunDirection.vector.raw.copy(vector);
    this.sunDirection.vector.transformed.copy(transformedVector);

    // Update uniform
    this.uniforms.sunParams.value.set([
      vector.x,
      vector.y,
      vector.z,
    ], 0);
  }

  static updateSelfIlluminatedScalar() {
    const sidnTable = this.tables.sidnTable;
    const factor = this.dayNightProgression;

    this.selfIlluminatedScalar = this.interpolateDayNightTable(sidnTable, 4, factor);
  }

  static revertUniforms() {
    this.uniforms.sunParams.value.set(Default.sunParams, 0);
    this.uniforms.sunDiffuseColor.value.set(Default.sunDiffuseColor, 0);
    this.uniforms.sunAmbientColor.value.set(Default.sunAmbientColor, 0);
    this.uniforms.fogParams.value.set(Default.fogParams, 0);
    this.uniforms.fogColor.value.set(Default.fogColor, 0);
  }

  static updateUniforms(result) {
    this.updateLightUniforms(result);
    this.updateFogUniforms(result);
  }

  static updateLightUniforms(result) {
    // Diffuse Color

    const diffuseColor = result.colors[0];

    this.uniforms.sunDiffuseColor.value.set([
      diffuseColor[0] / 255.0,
      diffuseColor[1] / 255.0,
      diffuseColor[2] / 255.0,
      diffuseColor[3] / 255.0
    ], 0);

    // Ambient Color

    const ambientColor = result.colors[1];

    this.uniforms.sunAmbientColor.value.set([
      ambientColor[0] / 255.0,
      ambientColor[1] / 255.0,
      ambientColor[2] / 255.0,
      ambientColor[3] / 255.0
    ], 0);
  }

  static updateFogUniforms(result) {
    // Fog Params

    const fogEnd = Math.min(result.floats[0] / 36.0, 350.0);
    const fogScalar = result.floats[1];
    const fogStart = fogEnd * fogScalar;
    const fogRange = fogEnd - fogStart;

    this.uniforms.fogParams.value[0] = -(1.0 / fogRange);
    this.uniforms.fogParams.value[1] = (1.0 / fogRange) * fogEnd;
    this.uniforms.fogParams.value[2] = 1.0;
    this.uniforms.fogParams.value[3] = 0.0;

    // Fog Color

    const fogColor = result.colors[7];

    this.uniforms.fogColor.value.set([
      fogColor[0] / 255.0,
      fogColor[1] / 255.0,
      fogColor[2] / 255.0,
      fogColor[3] / 255.0
    ], 0);
  }

  static blendLights(results) {
    return results[0];
  }

  /**
   * Returns number of half minutes since midnight.
   */
  static currentLightTime() {
    const d = new Date();

    const msSinceMidnight = d.getTime() - d.setHours(0,0,0,0);

    return Math.round(msSinceMidnight / 1000.0 / 30.0);
  }

  static query(mapID, x, y, z, time) {
    const queryPosition = new THREE.Vector3(x, y, z);

    return DBC.load('Light').then((dbc) => {
      const results = [];

      for (const record of dbc.records) {
        if (record.mapID !== mapID) {
          continue;
        }

        const { position, fallOffStart, fallOffEnd } = record;

        const worldPosition = new THREE.Vector3(
          17066.666 - (position.z / 36.0),
          17066.666 - (position.x / 36.0),
          position.y / 36.0
        );

        const distance = worldPosition.distanceTo(queryPosition) * 36.0;

        if (distance > fallOffEnd) {
          continue;
        }

        let falloff = 0.0;

        if (distance > fallOffStart) {
          falloff = (distance - fallOffStart) / (fallOffEnd - fallOffStart);
        }

        results.push({
          distance: distance / 36.0,
          falloff: falloff,
          light: record,
          params: null,
          colors: [],
          floats: []
        });
      }

      if (results.length === 0) {
        results.push({
          distance: 0,
          falloff: 0,
          light: dbc[1],
          params: null,
          colors: [],
          floats: []
        });
      }

      return results;
    }).then((results) => {
      return DBC.load('LightParams').then((dbc) => {
        for (const result of results) {
          result.params = dbc[result.light.skyFogID];
        }

        return results;
      });
    }).then((results) => {
      return DBC.load('LightIntBand').then((dbc) => {
        for (const result of results) {
          const offset = (result.light.skyFogID * 18) - 17;
          const max = offset + 18;

          for (let i = offset; i < max; ++i) {
            result.colors.push(this.colorForTime(dbc[i], time));
          }
        }

        return results;
      });
    }).then((results) => {
      return DBC.load('LightFloatBand').then((dbc) => {
        for (const result of results) {
          const offset = (result.light.skyFogID * 6) - 5;
          const max = offset + 6;

          for (let i = offset; i < max; ++i) {
            result.floats.push(this.floatForTime(dbc[i], time));
          }
        }

        return results;
      });
    });
  }

  static colorForTime(table, time) {
    return this.interpolateLightTable(table, time, this.lerpVectors, this.bgraIntegerToRGBAVector);
  }

  static floatForTime(table, time) {
    return this.interpolateLightTable(table, time, this.lerpFloats);
  }

  static interpolateLightTable(table, time, lerp, transform = null) {
    const { entryCount, times, values } = table;

    if (entryCount === 0) {
      return transform ? transform(0) : 0;
    } else if (entryCount === 1) {
      return transform ? transform(values[0]) : 0;
    }

    let v1;
    let v2;
    let t1;
    let t2;

    for (let i = 0; i < entryCount; ++i) {
      // Wrap at end
      if (i + 1 >= entryCount) {
        v1 = values[i];
        v2 = values[0];
        t1 = times[i];
        t2 = times[0] + 2880;

        break;
      }

      // Found matching stops
      if (times[i] <= time && times[i + 1] >= time) {
        v1 = values[i];
        v2 = values[i + 1];
        t1 = times[i];
        t2 = times[i + 1];

        break;
      }
    }

    const tdiff = t2 - t1;

    if (tdiff < 0.001) {
      return transform ? transform(v1) : v1;
    }

    const factor = (time - t1) / tdiff;

    if (transform) {
      v1 = transform(v1);
      v2 = transform(v2);
    }

    return lerp(v1, v2, factor);
  }

  static lerpVectors(v1, v2, factor) {
    const result = [];

    for (let i = 0, c = v1.length; i < c; ++i) {
      result[i] = Math.round(((1.0 - factor) * v1[i]) + (factor * v2[i]));
    }

    return result;
  }

  static lerpFloats(v1, v2, factor) {
    return ((1.0 - factor) * v1) + (factor * v2);
  }

  static bgraIntegerToRGBAVector(value) {
    const v = [];

    v[0] = (value >> 16) & 0xFF;
    v[1] = (value >>  8) & 0xFF;
    v[2] = (value >>  0) & 0xFF;
    v[3] = (value >> 24) & 0xFF;

    return v;
  }

  static sortLights(results) {
    results.sort((a, b) => {
      if (a.light.fallOffEnd > b.light.fallOffEnd) {
        return 1;
      } else if (b.light.fallOffEnd > a.light.fallOffEnd) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  static interpolateDayNightTable(table, size, distance) {
    // Clamp
    distance = Math.min(Math.max(distance, 0.0), 1.0);

    let d1;
    let d2;
    let v1;
    let v2;

    for (let i = 0; i < size; ++i) {
      // Wrap at end
      if (i + 1 >= size) {
        d1 = table[i * 2];
        d2 = table[0] + 1.0;

        v1 = table[i * 2 + 1];
        v2 = table[0 + 1];

        break;
      }

      // Found matching stops
      if (table[i * 2] <= distance && table[(i + 1) * 2] >= distance) {
        d1 = table[i * 2];
        d2 = table[(i + 1) * 2];

        v1 = table[i * 2 + 1];
        v2 = table[(i + 1) * 2 + 1];

        break;
      }
    }

    const diff = d2 - d1;

    if (diff < 0.001) {
      return v1;
    }

    const factor = (distance - d1) / diff;

    return this.lerpFloats(v1, v2, factor);
  }

  /**
   * Best guess at how the 1.12 client calculated light direction for the sun.
   *
   * Spherical to cartesian conversion
   *
   * This function makes use of spherical coordinates, but rendering involves cartesian
   * coordinates. The client converts the spherical coordinates represented in the phi and
   * theta tables into cartesian coordinates using the approach outlined here:
   *
   * - https://en.wikipedia.org/wiki/Spherical_coordinate_system#Cartesian_coordinates
   *
   */
  static getVanillaSunDirection(phi, theta) {
    const cartX = Math.sin(theta) * Math.cos(phi);
    const cartY = Math.sin(theta) * Math.sin(phi);
    const cartZ = Math.cos(theta);

    const dir = new THREE.Vector3(-cartX, cartY, cartZ);

    return dir;
  }

  /**
   * Light direction for the sun as calculated in the Wrath of the Lich King client. Output
   * values have been compared against the actual client for several arbitrary points of time.
   *
   * This function can be found at offset 7EEA90 in the 3.3.5a client.
   *
   */
  static getWrathSunDirection(phi, theta) {
    const v14 = phi * (1 / Math.PI);
    const v4 = v14 - 0.5;

    const v17 = 1.0 - v4 * ((6.0 - 4.0 * v4) * v4);
    const v15 = 1.0 - v14 * ((6.0 - 4.0 * v14) * v14);

    const v7 = theta * (1 / Math.PI)
    const v8 = v7 - 0.5;

    const v16 = 1.0 - v8 * ((6.0 - 4.0 * v8) * v8);
    const v11 = 1.0 - v8 * ((6.0 - 4.0 * v8) * v8);

    const dir = new THREE.Vector3(v11 * v17, v16 * v17, v15);

    return dir;
  }

}

export default WorldLight;
