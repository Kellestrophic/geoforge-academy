import data from "@/data/match.json";
import { trackActivity } from "@/lib/activity";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
type Pair = {
  id: string;
  term: string;
  match: string;
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MatchGame() {
  const [roundSize, setRoundSize] = useState(6);
  const [terms, setTerms] = useState<Pair[]>([]);
  const [matches, setMatches] = useState<Pair[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const [combo, setCombo] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<string | null>(null);
  const [lastWrong, setLastWrong] = useState<string | null>(null);

  function startNewRound(size = roundSize) {
    const shuffled = shuffle(data);
    const selectedSet = shuffled.slice(0, size);

    setTerms(shuffle(selectedSet));
    setMatches(shuffle(selectedSet));
    setCompleted([]);
    setScore(0);
    setSelected(null);
    setCombo(0);
    setLastCorrect(null);
    setLastWrong(null);
  }

  useEffect(() => {
    startNewRound();
  }, []);

  function handleMatch(termId: string, matchId: string) {
    if (termId === matchId) {
      setCompleted((prev) => [...prev, termId]);
      setScore((prev) => prev + 1);
      setCombo((prev) => prev + 1);

      setLastCorrect(termId);
      setTimeout(() => setLastCorrect(null), 300);
    } else {
      setCombo(0);

      setLastWrong(matchId);
      setTimeout(() => setLastWrong(null), 300);
    }
  }

  const allDone = completed.length === roundSize;

useEffect(() => {
  if (allDone) {
    // ✅ TRACK MATCH GAME COMPLETION
    trackActivity("match");

    setTimeout(() => {
      let newSize = roundSize;

      if (combo >= 5) newSize = Math.min(roundSize + 1, 10);
      if (combo === 0) newSize = Math.max(roundSize - 1, 4);

      setRoundSize(newSize);
      startNewRound(newSize);
    }, 800);
  }
}, [allDone]);

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 24 }}>
        Rock Matching
      </Text>

      <Text style={{ color: theme.colors.text }}>
        Score: {score} / {roundSize}
      </Text>

      <Text style={{ color: "#facc15", marginBottom: 10 }}>
        Combo: {combo} ⚡
      </Text>

      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* TERMS */}
        <View style={{ flex: 1 }}>
          {terms.map((item) => {
            const done = completed.includes(item.id);
            const isCorrect = lastCorrect === item.id;

            return (
              <Pressable
                key={item.id}
                disabled={done}
                onPress={() => setSelected(item.id)}
                style={{
                  padding: 14,
                  marginBottom: 12,
                  borderRadius: 12,
                  backgroundColor: done
                    ? "#22c55e"
                    : isCorrect
                    ? "#22c55e"
                    : selected === item.id
                    ? "#22c55e"
                    : "#0f172a",
                  borderWidth: 1,
                  borderColor: "#334155",
                  opacity: done ? 0.5 : 1,
                }}
              >
                <Text style={{ color: "#e2e8f0", fontWeight: "500" }}>
                  {item.term}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* MATCHES */}
        <View style={{ flex: 1 }}>
          {matches.map((item) => {
            const done = completed.includes(item.id);
            const isCorrect = lastCorrect === item.id;
            const isWrong = lastWrong === item.id;

            return (
              <Pressable
                key={item.id}
                disabled={!selected || done}
                onPress={() => {
                  if (selected) {
                    handleMatch(selected, item.id);
                    setSelected(null);
                  }
                }}
                style={{
                  padding: 14,
                  marginBottom: 12,
                  borderRadius: 12,
                  backgroundColor: done
                    ? "#22c55e"
                    : isCorrect
                    ? "#22c55e"
                    : isWrong
                    ? "#dc2626"
                    : "#0f172a",
                  borderWidth: 1,
                  borderColor: "#334155",
                  opacity: done ? 0.5 : 1,
                }}
              >
                <Text style={{ color: "#e2e8f0", fontWeight: "500" }}>
                  {item.match}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {allDone && (
        <Text
          style={{
            marginTop: 20,
            textAlign: "center",
            color: "#22c55e",
            fontWeight: "bold",
          }}
        >
          Next Round...
        </Text>
      )}

      <Pressable
        onPress={() => startNewRound()}
        style={{
          marginTop: 20,
          backgroundColor: "#ef4444",
          padding: 15,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          New Round
        </Text>
      </Pressable>
    </View>
  );
}