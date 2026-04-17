import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type TimeItem = {
  id: string;
  name: string;
  order: number;
};

const FULL_TIMELINE: TimeItem[] = [
  { id: "1", name: "Cambrian", order: 1 },
  { id: "2", name: "Ordovician", order: 2 },
  { id: "3", name: "Silurian", order: 3 },
  { id: "4", name: "Devonian", order: 4 },
  { id: "5", name: "Carboniferous", order: 5 },
  { id: "6", name: "Permian", order: 6 },
  { id: "7", name: "Triassic", order: 7 },
  { id: "8", name: "Jurassic", order: 8 },
  { id: "9", name: "Cretaceous", order: 9 },
];

const GROUPS: Record<string, string[]> = {
  Paleozoic: ["Cambrian","Ordovician","Silurian","Devonian","Carboniferous","Permian"],
  Mesozoic: ["Triassic","Jurassic","Cretaceous"],
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function TimelineGame() {
  const [mode, setMode] = useState<"easy" | "medium" | "hard">("easy");
  const [questionType, setQuestionType] = useState<
    "timeline" | "group" | "pair" | "not" | "before" | "oldest"
  >("timeline");

  const [items, setItems] = useState<TimeItem[]>([]);
  const [placed, setPlaced] = useState<(TimeItem | null)[]>([]);
  const [selected, setSelected] = useState<TimeItem | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string[]>([]);

  const [checked, setChecked] = useState(false);
  const [targetGroup, setTargetGroup] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [lastResultCorrect, setLastResultCorrect] = useState(false);

  // 🔥 HARD MODE
  const [hardOrder, setHardOrder] = useState<{ [id: string]: number }>({});
  const [currentOrder, setCurrentOrder] = useState(1);

  useEffect(() => {
    startRound();
  }, [mode]);

  function startRound() {
    setChecked(false);
    setSelected(null);
    setSelectedGroup([]);
    setShowModal(false);

    if (mode === "hard") {
      setQuestionType("timeline");
      setItems(shuffle(FULL_TIMELINE));
      setHardOrder({});
      setCurrentOrder(1);
      return;
    }

    const rand = Math.random();
    const keys = Object.keys(GROUPS);
    const group = keys[Math.floor(Math.random() * keys.length)];
    setTargetGroup(group);

    if (rand < 0.4) {
      setQuestionType("timeline");

      const size = mode === "easy" ? 4 : 6;
      const selectedSet = shuffle(FULL_TIMELINE).slice(0, size);
      const ordered = [...selectedSet].sort((a, b) => a.order - b.order);

      setItems(shuffle(ordered));
      setPlaced(new Array(ordered.length).fill(null));
    } else {
      setItems(shuffle(FULL_TIMELINE).slice(0, 6));

      if (rand < 0.55) setQuestionType("group");
      else if (rand < 0.7) setQuestionType("pair");
      else if (rand < 0.85) setQuestionType("not");
      else if (rand < 0.95) setQuestionType("before");
      else setQuestionType("oldest");
    }
  }

  function placeItem(index: number) {
    const newPlaced = [...placed];

    if (newPlaced[index]) {
      const removed = newPlaced[index];
      newPlaced[index] = null;
      setPlaced(newPlaced);
      setItems([...items, removed!]);
      return;
    }

    if (selected) {
      newPlaced[index] = selected;
      setPlaced(newPlaced);
      setItems(items.filter(i => i.id !== selected.id));
      setSelected(null);
    }
  }

  function toggle(name: string) {
    if (selectedGroup.includes(name)) {
      setSelectedGroup(selectedGroup.filter(n => n !== name));
    } else {
      setSelectedGroup([...selectedGroup, name]);
    }
  }

  function handleHardClick(item: TimeItem) {
    if (hardOrder[item.id]) {
      const copy = { ...hardOrder };
      delete copy[item.id];
      setHardOrder(copy);
      return;
    }

    setHardOrder(prev => ({
      ...prev,
      [item.id]: currentOrder,
    }));

    setCurrentOrder(prev => prev + 1);
  }

  function isCorrectAnswer(name: string) {
    if (questionType === "group" || questionType === "pair") {
      return GROUPS[targetGroup].includes(name);
    }
    if (questionType === "not") {
      return !GROUPS[targetGroup].includes(name);
    }
    if (questionType === "before") {
      const j = FULL_TIMELINE.find(i => i.name === "Jurassic");
      const i = FULL_TIMELINE.find(i => i.name === name);
      return i!.order < j!.order;
    }
    if (questionType === "oldest") {
      const min = Math.min(...items.map(i => i.order));
      return FULL_TIMELINE.find(i => i.name === name)!.order === min;
    }
    return false;
  }

  function handleCheck() {
    setChecked(true);

    if (mode === "hard") {
      const allCorrect = items.every(
        item => hardOrder[item.id] === item.order
      );
      setLastResultCorrect(allCorrect);
      setShowModal(true);
      return;
    }

    const correctAnswers = items
      .filter(i => isCorrectAnswer(i.name))
      .map(i => i.name);

    const gotAll =
      correctAnswers.length ===
        selectedGroup.filter(n => correctAnswers.includes(n)).length &&
      selectedGroup.every(n => correctAnswers.includes(n));

    setLastResultCorrect(gotAll);
    setShowModal(true);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
      
      <Text style={{ color: "white", fontSize: 24 }}>Timeline Game</Text>

      {/* MODE SELECT */}
      <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
        {["easy", "medium", "hard"].map(m => (
          <Pressable
            key={m}
            onPress={() => setMode(m as any)}
            style={{
              padding: 10,
              borderRadius: 8,
              backgroundColor: mode === m ? "#22c55e" : "#1e293b"
            }}
          >
            <Text style={{ color: "white" }}>{m}</Text>
          </Pressable>
        ))}
      </View>

      {/* TIMELINE BUILDER */}
      {questionType === "timeline" && mode !== "hard" && (
        <>
          {placed.map((slot, index) => (
            <Pressable
              key={index}
              onPress={() => placeItem(index)}
              style={{ padding: 16, marginBottom: 10, borderRadius: 12, backgroundColor: "#0f172a" }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                {slot ? slot.name : "Tap to place"}
              </Text>
            </Pressable>
          ))}

          {items.map(item => (
            <Pressable
              key={item.id}
              onPress={() => setSelected(item)}
              style={{
                padding: 14,
                marginBottom: 10,
                borderRadius: 12,
                backgroundColor: selected?.id === item.id ? "#22c55e" : "#1e293b"
              }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                {item.name}
              </Text>
            </Pressable>
          ))}
        </>
      )}

      {/* HARD MODE */}
      {mode === "hard" && (
        <>
          <Text style={{ color: "#94a3b8", marginBottom: 10 }}>
            Tap to assign order (1 = oldest)
          </Text>

          {items.map(item => {
            const num = hardOrder[item.id];
            const correct = num === item.order;

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
                      : "#1e293b"
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
          borderRadius: 12
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          {checked ? "New Round" : "Check"}
        </Text>
      </Pressable>

      {/* POPUP */}
      {showModal && (
        <View style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20
        }}>
          <View style={{
            width: "100%",
            backgroundColor: "#0f172a",
            borderRadius: 16,
            padding: 20
          }}>
            <Text style={{
              fontSize: 22,
              textAlign: "center",
              color: lastResultCorrect ? "#22c55e" : "#dc2626",
              marginBottom: 15
            }}>
              {lastResultCorrect ? "✅ Correct!" : "❌ Incorrect"}
            </Text>

            <Pressable
              onPress={startRound}
              style={{
                backgroundColor: "#0ea5e9",
                padding: 14,
                borderRadius: 10
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