export const TOPIC_FILES = {
  Mineralogy: {
    mc: require("@/data/mineralogyMC.json"),
    fb: require("@/data/mineralogyFB.json"),
  },
  Petrology: {
    mc: require("@/data/petrologyMC.json"),
    fb: require("@/data/petrologyFB.json"),
  },
  Sedimentology: {
    mc: require("@/data/sedimentologyMC.json"),
    fb: require("@/data/sedimentologyFB.json"),
  },
  MineralFormulas: {
    mc: require("@/data/mineralFormulas.json"),
    fb: [],
  },

  Archaeology: {
    mc: require("@/data/archaeologyMC.json"),
    fb: require("@/data/archaeologyFB.json"),
  },
  "Economic Geology": {
    mc: require("@/data/economicGeoMC.json"),
    fb: require("@/data/economicGeoFB.json"),
  },
  "Engineering Geology": {
    mc: require("@/data/engineeringGeoMC.json"),
    fb: require("@/data/engineeringGeoFB.json"),
  },
  Geomorphology: {
    mc: require("@/data/geomorphologyMC.json"),
    fb: require("@/data/geomorphologyFB.json"),
  },
  Hydrogeology: {
    mc: require("@/data/hydrogeologyMC.json"),
    fb: require("@/data/hydrogeologyFB.json"),
  },
  Paleontology: {
    mc: require("@/data/paleontologyMC.json"),
    fb: require("@/data/paleontologyFB.json"),
  },
  Structural: {
    mc: require("@/data/structuralMC.json"),
    fb: require("@/data/structuralFB.json"),
  },
} as const;

export type TopicKey = keyof typeof TOPIC_FILES;

export const TOPIC_LIST: TopicKey[] = Object.keys(
  TOPIC_FILES
) as TopicKey[];