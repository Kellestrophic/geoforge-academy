import rawData from "@/data/mineralFormulas.json";
import { trackActivity } from "@/lib/activity";
import { theme } from "@/lib/theme";
import { useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

/* ---------------- TYPES ---------------- */

type FormulaGameQuestion =
  | {
      type: "builder";
      mineral: string;
      target: string[];
      options: string[];
    }
  | {
      type: "input";
      mineral: string;
      display: string;
      answer: string;
    };

/* ---------------- HELPERS ---------------- */

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ---------------- SAFE NORMALIZE ---------------- */

function normalize(data: any[]): any[] {
  const safe: any[] = [];

  for (const q of data) {
    if (!q || typeof q.question !== "string") continue;

    if (
      (q.type === "multiple_choice" || q.type === "formula") &&
      Array.isArray(q.choices)
    ) {
      safe.push({
        question: q.question,
        choices: q.choices.map((c: any) => String(c)),
        correctAnswer: q.correctAnswer ?? 0,
      });
    }
  }

  return safe;
}

/* ---------------- GENERATOR ---------------- */

function generateQuestions(all: any[]): FormulaGameQuestion[] {
  const normalized = normalize(all);

  return shuffle(normalized)
    .map((q) => {
      const correct = q.choices[q.correctAnswer];

      if (!correct || typeof correct !== "string") return null;

      const parts = correct.match(/[A-Z][a-z]*\d*/g);
      if (!parts || parts.length === 0) return null;

      // WRONG PARTS POOL
      const pool = normalized.flatMap((qq) =>
        qq.choices.flatMap((c: string) =>
          c.match(/[A-Z][a-z]*\d*/g) || []
        )
      );

      const wrong = shuffle(
        pool.filter((p: string) => !parts.includes(p))
      ).slice(0, 4);

      const options = shuffle([...parts, ...wrong]);

      const mineral = q.question
        .replace("What is the chemical formula of ", "")
        .replace("?", "");

      if (Math.random() > 0.5) {
        return {
          type: "builder",
          mineral,
          target: parts,
          options,
        };
      } else {
        return {
          type: "input",
          mineral,
          display: parts[0] + " _",
          answer: parts.slice(1).join(""),
        };
      }
    })
    .filter(Boolean) as FormulaGameQuestion[];
}

/* ---------------- SCREEN ---------------- */

export default function FormulaGame() {
  const questionsRef = useRef<FormulaGameQuestion[]>(
    generateQuestions(rawData as any[])
  );

  const questions = questionsRef.current;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [combo, setCombo] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const q = questions[index];

  /* ---------------- SAFETY ---------------- */

  if (!q) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: theme.colors.text }}>
          No questions loaded
        </Text>
      </View>
    );
  }

  /* ---------------- EFFECTS ---------------- */

  function triggerCorrect() {
    setCombo((prev) => prev + 1);

    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  }

  function next() {
    setResult(null);
    setSelected([]);
    setInput("");
    setIndex((prev) => (prev + 1) % questions.length);
  }

  /* ---------------- CHECKS ---------------- */

  function checkBuilder() {
    const correct =
   function checkBuilder() {
  if (q.type !== "builder") return; // ✅ TYPE GUARD

  const correct =
    selected.length === q.target.length &&
    selected.every((item) => q.target.includes(item));
}

    if (!correct) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      setCombo(0);
    } else {
      triggerCorrect();
    }

    trackActivity("formula");
    setTimeout(next, 500);
  }

function checkInput() {
  if (q.type !== "input") return; // ✅ TYPE GUARD

  const isCorrect =
    input.toLowerCase().trim() === q.answer.toLowerCase();

    if (isCorrect) {
      setResult("correct");
      triggerCorrect();
    } else {
      setResult("wrong");
      setCombo(0);
    }

    trackActivity("formula");
    setTimeout(next, 1000);
  }

  /* ---------------- UI ---------------- */

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: theme.colors.background,
          transform: [{ translateX: shakeAnim }],
        }}
      >
        <Text style={{ fontSize: 28, textAlign: "center", color: theme.colors.text }}>
          {q.mineral}
        </Text>

        <Text style={{ textAlign: "center", color: "#f59e0b" }}>
          🔥 Combo: {combo}
        </Text>

        {/* BUILDER */}
        {q.type === "builder" && (
          <>
            <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 20 }}>
              {q.target.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 60,
                    height: 60,
                    margin: 5,
                    borderWidth: 2,
                    borderColor: "#475569",
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white" }}>{selected[i]}</Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
              {q.options.map((item, i) => (
                <Pressable
                  key={i}
                  onPress={() =>
                    setSelected((prev) =>
                      prev.length < q.target.length ? [...prev, item] : prev
                    )
                  }
                >
                  <Text style={{ margin: 5, padding: 12, backgroundColor: "#1e293b", color: "white" }}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable onPress={checkBuilder} style={{ marginTop: 20, backgroundColor: "#0ea5e9", padding: 15 }}>
              <Text style={{ textAlign: "center", color: "white" }}>Check</Text>
            </Pressable>
          </>
        )}

        {/* INPUT */}
        {q.type === "input" && (
          <>
            <Text style={{ textAlign: "center", color: theme.colors.text }}>
              {q.display}
            </Text>

            <TextInput
              value={input}
              onChangeText={setInput}
              style={{
                marginTop: 20,
                padding: 15,
                borderWidth: 2,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              }}
            />

            <Pressable onPress={checkInput} style={{ marginTop: 20, backgroundColor: "#0ea5e9", padding: 15 }}>
              <Text style={{ textAlign: "center", color: "white" }}>Check</Text>
            </Pressable>
          </>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}