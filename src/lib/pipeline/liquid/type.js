import DBC from '../dbc';
import LiquidMaterial from './material';

class LiquidType {

  static cache = new Map();
  static materials = new Set();

  constructor(data) {
    this.data = data;
    this.material = new LiquidMaterial(this);
    this.constructor.materials.add(this.material);
    this.textures = [];
  }

  get texturePattern() {
    return this.data.textures[0];
  }

  get texturePaths() {
    const pattern = this.texturePattern;
    return Array.from(Array(this.textureCount).keys()).map((index) => {
      return pattern.replace('%d', index + 1);
    });
  }

  get textureCount() {
    return 30;
  }

  static load(id) {
    if (!this.cache.has(id)) {
      this.cache.set(id, DBC.load('LiquidType', id).then((data) => {
        return new this(data);
      }));
    }

    return this.cache.get(id);
  }

}

export default LiquidType;
