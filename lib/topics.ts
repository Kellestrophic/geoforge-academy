export const TOPIC_FILES = {
  Mineralogy: {
    mc: require("@/data/mineralogyMC.json"),
    fb: require("@/data/mineralogyFB.json"),
  },
  Petrology: {
    mc: require("@/data/petrologyMC.json"),
    fb: require("@/data/petrologyFB.json"),
  },
  MineralFormulas: {
  mc: require("@/data/mineralFormulas.json"),
  fb: [],
},
} as const;

export type TopicKey = keyof typeof TOPIC_FILES;

export const TOPIC_LIST: TopicKey[] = Object.keys(
  TOPIC_FILES
) as TopicKey[];