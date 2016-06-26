class WMORootDefinition {

  constructor(path, data) {
    this.path = path;

    this.rootID = data.MOHD.rootID;

    this.header = {
      flags: data.MOHD.flags,
      ambientColor: data.MOHD.ambientColor
    };

    this.materials = data.MOMT.materials;
    this.texturePaths = data.MOTX.filenames;

    this.doodadSets = data.MODS.sets;
    this.doodadEntries = data.MODD.doodads;

    this.summarizeGroups(data);
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

}

export default WMORootDefinition;
