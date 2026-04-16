import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type TimeItem = {
  id: string;
  name: string;
  order: number;
};

const FULL_TIMELINE: TimeItem[] = [
  { id: "1", name: "Hadean", order: 1 },
  { id: "2", name: "Archean", order: 2 },
  { id: "3", name: "Proterozoic", order: 3 },
  { id: "4", name: "Cambrian", order: 4 },
  { id: "5", name: "Ordovician", order: 5 },
  { id: "6", name: "Silurian", order: 6 },
  { id: "7", name: "Devonian", order: 7 },
  { id: "8", name: "Carboniferous", order: 8 },
  { id: "9", name: "Permian", order: 9 },
  { id: "10", name: "Triassic", order: 10 },
  { id: "11", name: "Jurassic", order: 11 },
  { id: "12", name: "Cretaceous", order: 12 },
  { id: "13", name: "Paleocene", order: 13 },
  { id: "14", name: "Eocene", order: 14 },
  { id: "15", name: "Oligocene", order: 15 },
  { id: "16", name: "Miocene", order: 16 },
  { id: "17", name: "Pliocene", order: 17 },
  { id: "18", name: "Pleistocene", order: 18 },
  { id: "19", name: "Holocene", order: 19 },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function TimelineGame() {
  const [mode, setMode] = useState<"easy" | "medium" | "hard">("easy");

  const [items, setItems] = useState<TimeItem[]>([]);
  const [placed, setPlaced] = useState<(TimeItem | null)[]>([]);
  const [selected, setSelected] = useState<TimeItem | null>(null);

  const [hardOrder, setHardOrder] = useState<{ [id: string]: number }>({});
  const [currentOrder, setCurrentOrder] = useState(1);

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    startRound();
  }, [mode]);

  function startRound() {
    if (mode === "hard") {
      setItems(FULL_TIMELINE);
      setHardOrder({});
      setCurrentOrder(1);
    } else {
      let size = mode === "easy" ? 4 : 6;

      const selectedSet = shuffle(FULL_TIMELINE).slice(0, size);
      const ordered = [...selectedSet].sort((a, b) => a.order - b.order);

      setItems(shuffle(ordered));
      setPlaced(new Array(ordered.length).fill(null));
    }

    setSelected(null);
    setChecked(false);
  }

  function placeItem(index: number) {
    if (!selected) return;

    const newPlaced = [...placed];

    // REMOVE if clicking same item again
    if (newPlaced[index]?.id === selected.id) {
      newPlaced[index] = null;
      setPlaced(newPlaced);
      setItems([...items, selected]);
      setSelected(null);
      return;
    }

    // PLACE
    if (!newPlaced[index]) {
      newPlaced[index] = selected;
      setPlaced(newPlaced);
      setItems(items.filter((i) => i.id !== selected.id));
      setSelected(null);
    }
  }

  function handleHardClick(item: TimeItem) {
    // REMOVE if already placed
    if (hardOrder[item.id]) {
      const newOrder = { ...hardOrder };
      delete newOrder[item.id];
      setHardOrder(newOrder);
      return;
    }

    setHardOrder((prev) => ({
      ...prev,
      [item.id]: currentOrder,
    }));

    setCurrentOrder((prev) => prev + 1);
  }

  function checkAnswers() {
    setChecked(true);
  }

  function isCorrect(item: TimeItem | null, index: number) {
    if (!item) return false;
    return item.order === index + 1;
  }

  function isHardCorrect(item: TimeItem) {
    return hardOrder[item.id] === item.order;
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 24 }}>
        Timeline Builder
      </Text>

      {/* MODE */}
      <View style={{ flexDirection: "row", gap: 10, marginVertical: 15 }}>
        {[
          { label: "Easy", value: "easy" },
          { label: "Medium", value: "medium" },
          { label: "Hard", value: "hard" },
        ].map((d) => (
          <Pressable
            key={d.value}
            onPress={() => setMode(d.value as any)}
            style={{
              padding: 10,
              borderRadius: 8,
              backgroundColor:
                mode === d.value ? "#22c55e" : "#1e293b",
            }}
          >
            <Text style={{ color: "white" }}>{d.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* HARD MODE LABEL */}
      {mode === "hard" && (
        <Text style={{ color: "#94a3b8", marginBottom: 10 }}>
          1 = Oldest
        </Text>
      )}

      {/* EASY/MEDIUM SLOTS */}
      {mode !== "hard" && (
        <View>
          {placed.map((slot, index) => {
            const correct = isCorrect(slot, index);

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
                <Text style={{ color: "#e2e8f0", textAlign: "center" }}>
                  {slot ? slot.name : "Tap to place"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* HARD MODE LIST */}
      {mode === "hard" && (
        <View>
          {items.map((item) => {
            const orderNum = hardOrder[item.id];
            const correct = isHardCorrect(item);

            return (
              <Pressable
                key={item.id}
                onPress={() => handleHardClick(item)}
                style={{
                  padding: 14,
                  marginBottom: 10,
                  borderRadius: 12,
                  backgroundColor:
                    checked && orderNum
                      ? correct
                        ? "#22c55e"
                        : "#dc2626"
                      : "#1e293b",
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  {item.name} {orderNum ? `(${orderNum})` : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ITEMS (for easy/medium only) */}
      {mode !== "hard" && (
        <View style={{ marginTop: 20 }}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setSelected(item)}
              style={{
                padding: 14,
                marginBottom: 10,
                borderRadius: 12,
                backgroundColor:
                  selected?.id === item.id ? "#22c55e" : "#1e293b",
              }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                {item.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* BUTTON */}
      <Pressable
        onPress={checked ? startRound : checkAnswers}
        style={{
          marginTop: 20,
          backgroundColor: checked ? "#ef4444" : "#0ea5e9",
          padding: 15,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          {checked ? "New Round" : "Check"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}