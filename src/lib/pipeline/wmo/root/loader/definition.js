class WMORootDefinition {

  constructor(path, data) {
    this.path = path;
    this.rootID = data.MOHD.rootID;

    this.header = {
      flags: data.MOHD.flags,
      ambientColor: data.MOHD.ambientColor
    };

    this.groupInfo = data.MOGI.groups;

    this.materials = data.MOMT.materials;
    this.texturePaths = data.MOTX.filenames;

    this.doodadSets = data.MODS.sets;
    this.doodadEntries = data.MODD.doodads;

    this.summarizeGroups(data);

    this.createPortals(data);
    this.createBoundingBox(data.MOHD);
  }

  createBoundingBox(mohd) {
    const boundingBox = this.boundingBox = {};

    boundingBox.min = mohd.boundingBox.min;
    boundingBox.max = mohd.boundingBox.max;
  }

  createPortals(data) {
    const portalCount = data.MOPT.portals.length;
    const portalVertexCount = data.MOPV.vertices.length;

    this.portalRefs = data.MOPR.references;

    const portals = this.portals = [];
    this.assignPortals(portalCount, data.MOPT, portals);

    const portalNormals = this.portalNormals = new Float32Array(3 * portalCount);
    this.assignPortalNormals(portalCount, data.MOPT, portalNormals);

    const portalConstants = this.portalConstants = new Float32Array(1 * portalCount);
    this.assignPortalConstants(portalCount, data.MOPT, portalConstants);

    const portalVertices = this.portalVertices = new Float32Array(3 * portalVertexCount);
    this.assignPortalVertices(portalVertexCount, data.MOPV, portalVertices);
  }

  assignPortals(portalCount, mopt, attribute) {
    for (let index = 0; index < portalCount; ++index) {
      const portal = mopt.portals[index];

      attribute.push({
        vertexOffset: portal.vertexOffset,
        vertexCount: portal.vertexCount
      });
    }
  }

  assignPortalNormals(portalCount, mopt, attribute) {
    for (let index = 0; index < portalCount; ++index) {
      const portal = mopt.portals[index];
      const normal = portal.plane.normal;

      attribute.set([normal[0], normal[1], normal[2]], index * 3);
    }
  }

  assignPortalConstants(portalCount, mopt, attribute) {
    for (let index = 0; index < portalCount; ++index) {
      const portal = mopt.portals[index];
      const constant = portal.plane.constant;

      attribute.set([constant], index);
    }
  }

  assignPortalVertices(vertexCount, mopv, attribute) {
    for (let index = 0; index < vertexCount; ++index) {
      const vertex = mopv.vertices[index];

      attribute.set([vertex[0], vertex[1], vertex[2]], index * 3);
    }
  }

  summarizeGroups(data) {
    this.groupCount = data.MOGI.groups.length;
    this.interiorGroupCount = 0;
    this.exteriorGroupCount = 0;

    this.interiorGroupIndices = [];
    this.exteriorGroupIndices = [];

    // Separate group indices by interior/exterior flag. This allows us to queue exterior groups to
    // load before interior groups.
    for (let index = 0; index < this.groupCount; ++index) {
      const group = data.MOGI.groups[index];

      if (group.interior) {
        this.interiorGroupIndices.push(index);
        this.interiorGroupCount++;
      } else {
        this.exteriorGroupIndices.push(index);
        this.exteriorGroupCount++;
      }
    }
  }

  // Returns an array of references to typed arrays that we'd like to transfer across worker
  // boundaries.
  get transferable() {
    const list = [];

    list.push(this.portalNormals.buffer);
    list.push(this.portalConstants.buffer);
    list.push(this.portalVertices.buffer);

    return list;
  }

}

export default WMORootDefinition;
