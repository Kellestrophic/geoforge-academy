import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function TimelineGame() {

  const DATA = {
    easy: [
      {
        id: "eras",
        prompt: "Place eras from OLDEST → YOUNGEST",
        order: ["Precambrian", "Paleozoic", "Mesozoic", "Cenozoic"],
      },
    ],

    medium: [
      {
        id: "paleo",
        prompt: "Build the Paleozoic",
        order: ["Cambrian", "Ordovician", "Silurian", "Devonian", "Carboniferous", "Permian"],
      },
      {
        id: "meso",
        prompt: "Build the Mesozoic",
        order: ["Triassic", "Jurassic", "Cretaceous"],
      },
      {
        id: "ceno",
        prompt: "Build the Cenozoic",
        order: ["Paleogene", "Neogene", "Quaternary"],
      },
    ],

    hard: [
      {
        id: "mixed",
        prompt: "Order these correctly",
        order: [
          "Cambrian",
          "Jurassic",
          "Ordovician",
          "Cretaceous",
          "Silurian",
        ],
      },
    ],
  };
const TIME_POOL = [
  "Pre",
  "Cam",
  "Ord",
  "Sil",
  "Dev",
  "Carb",
  "Perm",
  "Tri",
  "Jur",
  "Cre",
  "Pal",
  "Neo",
  "Quat",
];
const NAME_MAP = {
  Pre: "Precambrian",
  Cam: "Cambrian",
  Ord: "Ordovician",
  Sil: "Silurian",
  Dev: "Devonian",
  Carb: "Carboniferous",
  Perm: "Permian",
  Tri: "Triassic",
  Jur: "Jurassic",
  Cre: "Cretaceous",
  Pal: "Paleogene",
  Neo: "Neogene",
  Quat: "Quaternary",
};
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSet = DATA[difficulty][currentIndex];


  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [cards, setCards] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<("correct" | "wrong" | null)[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
const [prompt, setPrompt] = useState("");
const correctOrder = currentOrder;

async function addXP(amount: number) {
  try {
let userId = null;

try {
  const response = await supabase.auth.getUser();
  userId = response?.data?.user?.id ?? null;
} catch (e) {
  console.log("🚨 getUser crash prevented:", e);
}

if (!userId) return;

    if (!userId) return;

    // GET CURRENT XP
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", userId)
      .single();

    const currentXP = profile?.xp || 0;

    // ADD XP
    await supabase
      .from("profiles")
      .update({
        xp: currentXP + amount,
      })
      .eq("id", userId);

  } catch (err) {
    console.log("XP ERROR:", err);
  }
}
function generateRound() {
  let size = 4;

  if (difficulty === "medium") size = 5;
  if (difficulty === "hard") size = 7;

  // pick random items
  const shuffledPool = [...TIME_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffledPool.slice(0, size);

  // correct order (oldest → youngest based on TIME_POOL order)
  const correct = TIME_POOL.filter((item) => selected.includes(item));

  // random direction
  const reversed = Math.random() > 0.5;

  const finalOrder = reversed ? [...correct].reverse() : correct;

  const prompt = reversed
    ? "Place items from YOUNGEST → OLDEST"
    : "Place items from OLDEST → YOUNGEST";

  return {
    order: finalOrder,
    prompt,
  };
}
  // INIT ROUND
  useEffect(() => {
    resetRound();
  }, [difficulty, currentIndex]);

function resetRound() {
  const round = generateRound();

  setCurrentOrder(round.order);
  setPrompt(round.prompt);

  setSlots(Array(round.order.length).fill(null));
  setCards([...round.order].sort(() => Math.random() - 0.5));

  setResults(Array(round.order.length).fill(null));
  setChecked(false);
}

  function placeCard(card: string) {
    if (checked) return;

    const emptyIndex = slots.findIndex((s) => s === null);
    if (emptyIndex === -1) return;

    const newSlots = [...slots];
    newSlots[emptyIndex] = card;
    setSlots(newSlots);

    setCards(cards.filter((c) => c !== card));
  }

  function removeCard(index: number) {
    if (checked) return;
    if (!slots[index]) return;

    const card = slots[index];

    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);

    setCards([...cards, card!]);
  }

  function checkAnswers() {
    if (slots.includes(null)) return;

    const newResults = slots.map((item, i) =>
      item === correctOrder[i] ? "correct" : "wrong"
    );

    setResults(newResults);
    setChecked(true);

    const correctCount = newResults.filter((r) => r === "correct").length;
    const allCorrect = correctCount === correctOrder.length;

   const baseXP = correctCount * 10;
const streakBonus = streak * 5;

const totalXP = baseXP + streakBonus;

setScore(score + baseXP);
setXp(xp + totalXP);
addXP(totalXP);

    if (allCorrect) {
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
  }


  return (
    <View style={styles.container}>
      
      {/* TITLE */}
      <Text style={styles.title}>Timeline Builder</Text>

      {/* SCORE + STREAK */}
      <Text style={{ color: "white", textAlign: "center" }}>
        Score: {score} | Streak: {streak} | XP: {xp}
      </Text>

      {/* DIFFICULTY */}
      <View style={styles.difficultyRow}>
        {["easy", "medium", "hard"].map((d) => (
          <Pressable
            key={d}
            style={[
              styles.diffButton,
              difficulty === d && styles.activeButton,
            ]}
            onPress={() => {
              setDifficulty(d as any);
              setCurrentIndex(0);
            }}
          >
            <Text style={styles.diffText}>
              {d.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* PROMPT */}
      <Text style={styles.prompt}>{prompt}</Text>

{checked && (
  <Text style={{
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "800",
    color: results.every(r => r === "correct") ? "#22c55e" : "#ef4444"
  }}>
    {results.every(r => r === "correct")
      ? "Perfect! 🔥"
      : "Keep going!"}
  </Text>
)}

      {/* SLOTS */}
      <View style={styles.timelineRow}>
        {slots.map((item, index) => {
          let borderColor = "#3b82f6";

          if (checked && results[index] === "correct") borderColor = "#22c55e";
          if (checked && results[index] === "wrong") borderColor = "#ef4444";

          return (
            <Pressable
              key={index}
              style={[styles.slot, { borderColor }]}
              onPress={() => removeCard(index)}
            >
              <Text style={styles.slotText}>
                {item || "?"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* CARDS */}
      <View style={styles.cardBank}>
        {cards.map((item) => (
          <Pressable
            key={item}
            style={styles.card}
            onPress={() => placeCard(item)}
          >
           <Text style={styles.cardText}>
  {NAME_MAP[item as keyof typeof NAME_MAP] || item}
</Text>
          </Pressable>
        ))}
      </View>

      {/* BUTTONS */}
<View style={styles.buttonRow}>
  {!checked ? (
    <Pressable
      style={[
        styles.button,
        slots.includes(null) && { opacity: 0.5 },
      ]}
      onPress={checkAnswers}
      disabled={slots.includes(null)}
    >
      <Text style={styles.buttonText}>Check</Text>
    </Pressable>
  ) : (
    <Pressable
      style={styles.button}
      onPress={resetRound}
    >
      <Text style={styles.buttonText}>Reset</Text>
    </Pressable>
  )}
</View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0f172a",
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },

  difficultyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  diffButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#1e293b",
    alignItems: "center",
  },

  activeButton: {
    backgroundColor: "#2563eb",
  },

  diffText: {
    color: "white",
    fontWeight: "700",
  },

  prompt: {
    color: "#cbd5f5",
    textAlign: "center",
    marginBottom: 20,
  },

  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  slot: {
    flex: 1,
    marginHorizontal: 5,
    height: 80,
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

slotText: {
  color: "#94a3b8",
  fontSize: 9,
  textAlign: "center",
  paddingHorizontal: 4,
  flexWrap: "wrap",
},

  cardBank: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 30,
  },

  card: {
    padding: 10,
    margin: 6,
    backgroundColor: "#1e293b",
    borderRadius: 8,
  },

cardText: {
  color: "white",
  fontWeight: "600",
  fontSize: 12,
  textAlign: "center",
},

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 14,
    backgroundColor: "#22c55e",
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "800",
  },
});