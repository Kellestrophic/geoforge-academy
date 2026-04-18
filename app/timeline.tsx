import { theme } from "@/lib/theme";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type TimeItem = {
  id: string;
  name: string;
  order: number;
  life?: string;
  events?: string;
};

type QuestionType =
  | "timeline"
  | "group"
  | "pair"
  | "not"
  | "before"
  | "oldest";

const FULL_TIMELINE: TimeItem[] = [
  { id: "1", name: "Cambrian", order: 1, life: "Shelled organisms", events: "Cambrian Explosion" },
  { id: "2", name: "Ordovician", order: 2, life: "Marine diversification", events: "Taconic Orogeny" },
  { id: "3", name: "Silurian", order: 3, life: "First land plants", events: "Stable continents" },
  { id: "4", name: "Devonian", order: 4, life: "Fish diversify", events: "Acadian Orogeny" },
  { id: "5", name: "Carboniferous", order: 5, life: "Coal swamps", events: "Appalachian uplift" },
  { id: "6", name: "Permian", order: 6, life: "Reptiles expand", events: "Pangaea assembled" },
  { id: "7", name: "Triassic", order: 7, life: "First dinosaurs", events: "Pangaea begins breakup" },
  { id: "8", name: "Jurassic", order: 8, life: "Dinosaurs dominate", events: "Nevadan Orogeny" },
  { id: "9", name: "Cretaceous", order: 9, life: "Flowering plants", events: "Interior Seaway" },
  { id: "10", name: "Paleocene", order: 10, life: "Mammals diversify", events: "Laramide Orogeny" },
  { id: "11", name: "Eocene", order: 11, life: "Early primates", events: "Rocky Mountain uplift" },
  { id: "12", name: "Oligocene", order: 12, life: "Grasslands spread", events: "Global cooling" },
  { id: "13", name: "Miocene", order: 13, life: "Modern mammals", events: "Basin and Range extension" },
  { id: "14", name: "Pliocene", order: 14, life: "Modern ecosystems", events: "Isthmus of Panama forms" },
  { id: "15", name: "Pleistocene", order: 15, life: "Ice age megafauna", events: "Major glaciations" },
  { id: "16", name: "Holocene", order: 16, life: "Modern humans", events: "Post-glacial time" },
];

const GROUPS: Record<string, string[]> = {
  Paleozoic: ["Cambrian", "Ordovician", "Silurian", "Devonian", "Carboniferous", "Permian"],
  Mesozoic: ["Triassic", "Jurassic", "Cretaceous"],
  Cenozoic: ["Paleocene", "Eocene", "Oligocene", "Miocene", "Pliocene", "Pleistocene", "Holocene"],
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function TimelineGame() {
  const [mode, setMode] = useState<"easy" | "medium" | "hard">("easy");
  const [questionType, setQuestionType] = useState<QuestionType>("timeline");

  const [items, setItems] = useState<TimeItem[]>([]);
  const [placed, setPlaced] = useState<(TimeItem | null)[]>([]);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimeItem | null>(null);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  const [targetGroup, setTargetGroup] = useState("");
  const [checked, setChecked] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [lastResultCorrect, setLastResultCorrect] = useState(false);

  const [hardOrder, setHardOrder] = useState<Record<string, number>>({});
  const [currentOrder, setCurrentOrder] = useState(1);

  useEffect(() => {
    startRound();
  }, [mode]);

  function startRound() {
    setChecked(false);
    setShowModal(false);
    setLastResultCorrect(false);
    setSelectedNames([]);
    setSelectedTimelineItem(null);
    setHardOrder({});
    setCurrentOrder(1);

    if (mode === "hard") {
      setQuestionType("timeline");
      setItems(shuffle(FULL_TIMELINE));
      setPlaced([]);
      return;
    }

    const rand = Math.random();
    const groupKeys = Object.keys(GROUPS);
    const group = groupKeys[Math.floor(Math.random() * groupKeys.length)];
    setTargetGroup(group);

    if (rand < 0.4) {
      setQuestionType("timeline");
      const size = mode === "easy" ? 4 : 6;
      const selectedSet = shuffle(FULL_TIMELINE).slice(0, size);
      const ordered = [...selectedSet].sort((a, b) => a.order - b.order);

      setItems(shuffle(ordered));
      setPlaced(new Array(ordered.length).fill(null));
      return;
    }

    const basePoolSize = mode === "easy" ? 5 : 7;

    if (rand < 0.58) {
      setQuestionType("group");
      const correctPool = FULL_TIMELINE.filter((i) => GROUPS[group].includes(i.name));
      const wrongPool = FULL_TIMELINE.filter((i) => !GROUPS[group].includes(i.name));
      const mixed = shuffle([
        ...shuffle(correctPool).slice(0, Math.min(3, correctPool.length)),
        ...shuffle(wrongPool).slice(0, basePoolSize - Math.min(3, correctPool.length)),
      ]);
      setItems(mixed);
      setPlaced([]);
      return;
    }

    if (rand < 0.74) {
      setQuestionType("pair");
      const correctPool = FULL_TIMELINE.filter((i) => GROUPS[group].includes(i.name));
      const wrongPool = FULL_TIMELINE.filter((i) => !GROUPS[group].includes(i.name));
      const mixed = shuffle([
        ...shuffle(correctPool).slice(0, 2),
        ...shuffle(wrongPool).slice(0, Math.max(3, basePoolSize - 2)),
      ]);
      setItems(mixed);
      setPlaced([]);
      return;
    }

    if (rand < 0.86) {
      setQuestionType("not");
      const correctPool = FULL_TIMELINE.filter((i) => !GROUPS[group].includes(i.name));
      const wrongPool = FULL_TIMELINE.filter((i) => GROUPS[group].includes(i.name));
      const mixed = shuffle([
        ...shuffle(correctPool).slice(0, 1),
        ...shuffle(wrongPool).slice(0, Math.max(4, basePoolSize - 1)),
      ]);
      setItems(mixed);
      setPlaced([]);
      return;
    }

    if (rand < 0.94) {
      setQuestionType("before");
      const anchor = FULL_TIMELINE.find((i) => i.name === "Jurassic");
      const beforePool = FULL_TIMELINE.filter((i) => anchor && i.order < anchor.order);
      const afterPool = FULL_TIMELINE.filter((i) => anchor && i.order >= anchor.order);
      const mixed = shuffle([
        ...shuffle(beforePool).slice(0, 2),
        ...shuffle(afterPool).slice(0, Math.max(4, basePoolSize - 2)),
      ]);
      setItems(mixed);
      setPlaced([]);
      return;
    }

    setQuestionType("oldest");
    setItems(shuffle(FULL_TIMELINE).slice(0, basePoolSize));
    setPlaced([]);
  }

  function toggleSelection(name: string) {
    if (checked) return;

    if (questionType === "pair") {
      if (selectedNames.includes(name)) {
        setSelectedNames(selectedNames.filter((n) => n !== name));
        return;
      }
      if (selectedNames.length >= 2) return;
      setSelectedNames([...selectedNames, name]);
      return;
    }

    if (questionType === "oldest" || questionType === "not" || questionType === "before") {
      setSelectedNames(selectedNames.includes(name) ? [] : [name]);
      return;
    }

    if (selectedNames.includes(name)) {
      setSelectedNames(selectedNames.filter((n) => n !== name));
    } else {
      setSelectedNames([...selectedNames, name]);
    }
  }

  function placeItem(index: number) {
    if (checked) return;

    const newPlaced = [...placed];

    if (newPlaced[index]) {
      const removed = newPlaced[index];
      newPlaced[index] = null;
      setPlaced(newPlaced);
      setItems(shuffle([...items, removed!]));
      return;
    }

    if (!selectedTimelineItem) return;

    newPlaced[index] = selectedTimelineItem;
    setPlaced(newPlaced);
    setItems(items.filter((i) => i.id !== selectedTimelineItem.id));
    setSelectedTimelineItem(null);
  }

  function handleHardClick(item: TimeItem) {
    if (checked) return;

    if (hardOrder[item.id]) {
      const copy = { ...hardOrder };
      delete copy[item.id];
      setHardOrder(copy);
      return;
    }

    setHardOrder((prev) => ({
      ...prev,
      [item.id]: currentOrder,
    }));
    setCurrentOrder((prev) => prev + 1);
  }

  function isCorrectAnswer(name: string) {
    if (questionType === "group") return GROUPS[targetGroup]?.includes(name) ?? false;
    if (questionType === "pair") return GROUPS[targetGroup]?.includes(name) ?? false;
    if (questionType === "not") return !(GROUPS[targetGroup]?.includes(name) ?? false);

    if (questionType === "before") {
      const jurassic = FULL_TIMELINE.find((i) => i.name === "Jurassic");
      const item = FULL_TIMELINE.find((i) => i.name === name);
      return !!jurassic && !!item && item.order < jurassic.order;
    }

    if (questionType === "oldest") {
      const min = Math.min(...items.map((i) => i.order));
      const item = items.find((i) => i.name === name);
      return !!item && item.order === min;
    }

    return false;
  }

  const correctNames = useMemo(
    () => items.filter((i) => isCorrectAnswer(i.name)).map((i) => i.name),
    [items, questionType, targetGroup]
  );

  function handleCheck() {
    if (questionType === "timeline" && mode !== "hard") {
      if (placed.some((p) => p === null)) return;

      setChecked(true);
      const allCorrect = placed.every((item, index) => item && item.order === index + 1);
      setLastResultCorrect(allCorrect);
      setShowModal(true);
      return;
    }

    if (mode === "hard") {
      if (Object.keys(hardOrder).length !== items.length) return;

      setChecked(true);
      const allCorrect = items.every((item) => hardOrder[item.id] === item.order);
      setLastResultCorrect(allCorrect);
      setShowModal(true);
      return;
    }

    if (selectedNames.length === 0) return;

    setChecked(true);

    const gotAll =
      correctNames.length === selectedNames.filter((n) => correctNames.includes(n)).length &&
      selectedNames.every((n) => correctNames.includes(n));

    setLastResultCorrect(gotAll);
    setShowModal(true);
  }

  const prompt =
    questionType === "timeline" && mode !== "hard"
      ? "↓ Oldest → Newest"
      : mode === "hard"
      ? "Tap to assign order (1 = oldest)"
      : questionType === "group"
      ? `Which belong to ${targetGroup}?`
      : questionType === "pair"
      ? `Select TWO from ${targetGroup}`
      : questionType === "not"
      ? `Which does NOT belong to ${targetGroup}?`
      : questionType === "before"
      ? "Which came BEFORE Jurassic?"
      : "Which is OLDEST?";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <Text style={{ color: "white", fontSize: 24 }}>Timeline Game</Text>

      <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
        {["easy", "medium", "hard"].map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m as "easy" | "medium" | "hard")}
            style={{
              padding: 10,
              borderRadius: 8,
              backgroundColor: mode === m ? "#22c55e" : "#1e293b",
            }}
          >
            <Text style={{ color: "white", textTransform: "capitalize" }}>{m}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ color: "#94a3b8", marginBottom: 12 }}>{prompt}</Text>

      {questionType === "timeline" && mode !== "hard" && (
        <>
          <View style={{ marginBottom: 16 }}>
            {placed.map((slot, index) => {
              const correct = !!slot && slot.order === index + 1;

              return (
                <Pressable
                  key={index}
                  onPress={() => placeItem(index)}
                  style={{
                    padding: 16,
                    marginBottom: 10,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      checked && slot
                        ? correct
                          ? "#22c55e"
                          : "#dc2626"
                        : "#334155",
                    backgroundColor: "#0f172a",
                  }}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    {slot ? slot.name : "Tap to place"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setSelectedTimelineItem(item)}
              style={{
                padding: 14,
                marginBottom: 10,
                borderRadius: 12,
                backgroundColor:
                  selectedTimelineItem?.id === item.id ? "#22c55e" : "#1e293b",
              }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>{item.name}</Text>
            </Pressable>
          ))}
        </>
      )}

      {questionType !== "timeline" && mode !== "hard" && (
        <>
          {items.map((item) => {
            const isSelected = selectedNames.includes(item.name);
            const correct = isCorrectAnswer(item.name);

            return (
              <Pressable
                key={item.id}
                onPress={() => toggleSelection(item.name)}
                style={{
                  padding: 14,
                  marginBottom: 10,
                  borderRadius: 12,
                  backgroundColor: (() => {
                    if (!checked) return isSelected ? "#22c55e" : "#1e293b";
                    if (correct && isSelected) return "#22c55e";
                    if (!correct && isSelected) return "#dc2626";
                    if (correct && !isSelected) return "#dc2626";
                    return "#1e293b";
                  })(),
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>{item.name}</Text>
              </Pressable>
            );
          })}
        </>
      )}

      {mode === "hard" && (
        <>
          {items.map((item) => {
            const num = hardOrder[item.id];
            const correct = !!num && num === item.order;

            return (
              <Pressable
                key={item.id}
                onPress={() => handleHardClick(item)}
                style={{
                  padding: 14,
                  marginBottom: 10,
                  borderRadius: 12,
                  backgroundColor:
                    checked && num
                      ? correct
                        ? "#22c55e"
                        : "#dc2626"
                      : "#1e293b",
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  {item.name} {num ? `(${num})` : ""}
                </Text>
              </Pressable>
            );
          })}
        </>
      )}

      <Pressable
        onPress={checked ? startRound : handleCheck}
        style={{
          marginTop: 20,
          backgroundColor: "#0ea5e9",
          padding: 15,
          borderRadius: 12,
          opacity:
            !checked &&
            ((questionType === "timeline" && mode !== "hard" && placed.some((p) => p === null)) ||
              (mode === "hard" && Object.keys(hardOrder).length !== items.length) ||
              (questionType !== "timeline" && mode !== "hard" && selectedNames.length === 0))
              ? 0.5
              : 1,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          {checked ? "New Round" : "Check"}
        </Text>
      </Pressable>

      {showModal && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: "#0f172a",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                textAlign: "center",
                color: lastResultCorrect ? "#22c55e" : "#dc2626",
                marginBottom: 15,
              }}
            >
              {lastResultCorrect ? "✅ Correct!" : "❌ Incorrect"}
            </Text>

            {!lastResultCorrect && mode !== "hard" && (
              <Text
                style={{
                  color: "#94a3b8",
                  textAlign: "center",
                  marginBottom: 15,
                }}
              >
                Correct answers:
                {"\n"}
                {questionType === "timeline"
                  ? placed
                      .slice()
                      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
                      .map((i) => i?.name)
                      .join(", ")
                  : correctNames.join(", ")}
              </Text>
            )}

            {!lastResultCorrect && mode === "hard" && (
              <Text
                style={{
                  color: "#94a3b8",
                  textAlign: "center",
                  marginBottom: 15,
                }}
              >
                Correct order:
                {"\n"}
                {FULL_TIMELINE.map((i) => i.name).join(", ")}
              </Text>
            )}

            <Pressable
              onPress={startRound}
              style={{
                backgroundColor: "#0ea5e9",
                padding: 14,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Next</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}