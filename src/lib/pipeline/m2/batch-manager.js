class BatchManager {

  constructor() {
  }

  createDefs(data, skinData) {
    const defs = [];

    skinData.batches.forEach((batchData) => {
      const def = this.createDef(data, batchData);
      defs.push(def);
    });

    return defs;
  }

  createDef(data, batchData) {
    const def = this.stubDef();

    const { textures } = data;
    const { vertexColorAnimations, transparencyAnimations, uvAnimations } = data;

    if (!batchData.textureIndices) {
      this.resolveTextureIndices(data, batchData);
    }

    if (!batchData.uvAnimationIndices) {
      this.resolveUVAnimationIndices(data, batchData);
    }

    const { opCount } = batchData;
    const { textureMappingIndex, materialIndex } = batchData;
    const { vertexColorAnimationIndex, transparencyAnimationLookup } = batchData;
    const { textureIndices, uvAnimationIndices } = batchData;

    // Batch flags
    def.flags = batchData.flags;

    // Submesh index and batch layer
    def.submeshIndex = batchData.submeshIndex;
    def.layer = batchData.layer;

    // Op count and shader ID
    def.opCount = batchData.opCount;
    def.shaderID = batchData.shaderID;

    // Texture mapping
    // -1 => Env; 0 => T1; 1 => T2
    if (textureMappingIndex >= 0) {
      const textureMapping = data.textureMappings[textureMappingIndex];
      def.textureMapping = textureMapping;
    }

    // Material (render flags and blending mode)
    const material = data.materials[materialIndex];
    def.renderFlags = material.renderFlags;
    def.blendingMode = material.blendingMode;

    // Vertex color animation block
    if (vertexColorAnimationIndex > -1 && vertexColorAnimations[vertexColorAnimationIndex]) {
      const vertexColorAnimation = vertexColorAnimations[vertexColorAnimationIndex];
      def.vertexColorAnimation = vertexColorAnimation;
      def.vertexColorAnimationIndex = vertexColorAnimationIndex;
    }

    // Transparency animation block
    // TODO: Do we load multiple values based on opCount?
    const transparencyAnimationIndex = data.transparencyAnimationLookups[transparencyAnimationLookup];
    if (transparencyAnimationIndex > -1 && transparencyAnimations[transparencyAnimationIndex]) {
      const transparencyAnimation = transparencyAnimations[transparencyAnimationIndex];
      def.transparencyAnimation = transparencyAnimation;
      def.transparencyAnimationIndex = transparencyAnimationIndex;
    }

    for (let opIndex = 0; opIndex < def.opCount; ++opIndex) {
      // Texture
      const textureIndex = textureIndices[opIndex];
      const texture = textures[textureIndex];
      if (texture) {
        def.textures[opIndex] = texture;
        def.textureIndices[opIndex] = textureIndex;
      }

      // UV animation block
      const uvAnimationIndex = uvAnimationIndices[opIndex];
      const uvAnimation = uvAnimations[uvAnimationIndex];
      if (uvAnimation) {
        def.uvAnimations[opIndex] = uvAnimation;
        def.uvAnimationIndices[opIndex] = uvAnimationIndex;
      }
    }

    return def;
  }

  resolveTextureIndices(data, batchData) {
    batchData.textureIndices = [];

    for (let opIndex = 0; opIndex < batchData.opCount; opIndex++) {
      const textureIndex = data.textureLookups[batchData.textureLookup + opIndex];
      batchData.textureIndices.push(textureIndex);
    }
  }

  resolveUVAnimationIndices(data, batchData) {
    batchData.uvAnimationIndices = [];

    for (let opIndex = 0; opIndex < batchData.opCount; opIndex++) {
      const uvAnimationIndex = data.uvAnimationLookups[batchData.uvAnimationLookup + opIndex];
      batchData.uvAnimationIndices.push(uvAnimationIndex);
    }
  }

  stubDef() {
    const def = {
      flags: null,
      shaderID: null,
      opCount: null,
      textureMapping: null,
      renderFlags: null,
      blendingMode: null,
      textures: [],
      textureIndices: [],
      uvAnimations: [],
      uvAnimationIndices: [],
      transparencyAnimation: null,
      transparencyAnimationIndex: null,
      vertexColorAnimation: null,
      vertexColorAnimationIndex: null
    };

    return def;
  }

}

export default BatchManager;
