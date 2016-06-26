class WMOMaterialDefinition {

  constructor(index, flags, blendingMode, shaderID, textures) {
    this.index = index;
    this.flags = flags;
    this.blendingMode = blendingMode;
    this.shaderID = shaderID;
    this.textures = textures;

    // Comes from reference
    this.batchType = null;
    this.interior = null;
  }

  forRef(ref) {
    const clone = this.clone();

    clone.batchType = ref.batchType;
    clone.interior = ref.interior;

    return clone;
  }

  get key() {
    const key = [];

    key.push(this.index);

    if (this.batchType !== null) {
      key.push(this.batchType);
    }

    if (this.interior !== null) {
      key.push(this.interior ? 'i' : 'e');
    }

    return key.join(';');
  }

  clone() {
    const { index, flags, blendingMode, shaderID, textures } = this;
    return new WMOMaterialDefinition(index, flags, blendingMode, shaderID, textures);
  }

}

export default WMOMaterialDefinition;
