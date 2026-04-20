import formulaData from "@/data/mineralFormulas.json";
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

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ---------------- QUESTION GENERATOR ---------------- */

function generateFormulaGameQuestions(
  allQuestions: any[]
): FormulaGameQuestion[] {
  const randomizedQuestions = shuffleArray(allQuestions);

  return randomizedQuestions
    .map((q) => {
      const correct = q.choices?.[q.correctAnswer];

      if (typeof correct !== "string") return null;

      let parts: string[] = [];

      try {
        const result = correct.match(/[A-Z][a-z]*\d*/g);
        parts = Array.isArray(result) ? result : [];
        if (!parts.length) return null;
      } catch {
        return null;
      }

      const pool = allQuestions
        .flatMap((qq: any) =>
          Array.isArray(qq.choices) ? qq.choices : []
        )
        .flatMap((c: any) => {
          try {
            const result = (typeof c === "string" ? c : "").match(
              /[A-Z][a-z]*\d*/g
            );
            return Array.isArray(result) ? result : [];
          } catch {
            return [];
          }
        });

      const wrongParts = pool
        .filter((p: string) => !parts.includes(p))
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

      const options = shuffleArray([...parts, ...wrongParts]);

      const isBuilder = Math.random() > 0.5;

      const mineralName = (q.question || "")
        .replace("What is the chemical formula of ", "")
        .replace("?", "");

      if (isBuilder) {
        return {
          type: "builder",
          mineral: mineralName,
          target: parts,
          options,
        };
      } else {
        return {
          type: "input",
          mineral: mineralName,
          display: parts[0] + " _",
          answer: parts.slice(1).join(""),
        };
      }
    })
    .filter((q): q is FormulaGameQuestion => q !== null);
}
export default function FormulaGame() {

const questionsRef = useRef<FormulaGameQuestion[]>(
  generateFormulaGameQuestions(formulaData)
);

const questions = questionsRef.current;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
const shakeAnim = useRef(new Animated.Value(0)).current;
const glowAnim = useRef(new Animated.Value(0)).current;

const [combo, setCombo] = useState(0);

  const q = questions[index];
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
function checkBuilder() {
  if (q.type !== "builder") return;

  const correct =
    JSON.stringify(selected) === JSON.stringify(q.target);

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

  // ✅ TRACK FORMULA GAME
  trackActivity("formula");

  setTimeout(next, 500);
}

function checkInput() {
  if (q.type !== "input") return;

  const isCorrect =
    input.toLowerCase().trim() === q.answer.toLowerCase();

  if (isCorrect) {
    setResult("correct");
    triggerCorrect();
  } else {
    setResult("wrong");

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    setCombo(0);
  }

  // ✅ TRACK FORMULA GAME
  trackActivity("formula");

  setTimeout(next, 1200);
}

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
      justifyContent: "space-between",
      transform: [{ translateX: shakeAnim }],
    }}
  >
      {/* MINERAL */}
      <Text
        style={{
          fontSize: 28,
          color: theme.colors.text,
          textAlign: "center",
        }}
      >
        {q.mineral}
      </Text>
      <Text style={{ color: "#f59e0b", textAlign: "center", marginTop: 10 }}>
  🔥 Combo: {combo}
</Text>

{/* BUILDER MODE */}
{q.type === "builder" && (
  <>
    {/* SLOTS */}
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: 20,
      }}
    >
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
            backgroundColor: "#1e293b",
          }}
        >
{selected[i] && (
  <Pressable
    onPress={() => {
      setSelected((prev) =>
        prev.filter((_, index) => index !== i)
      );
    }}
  >
    <Animated.View
      style={{
        borderRadius: 6,
        backgroundColor: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["#334155", "#22c55e"],
        }),
      }}
    >
      <Text style={{ color: "white", padding: 10 }}>
        {selected[i]}
      </Text>
    </Animated.View>
  </Pressable>
)}
        </View>
      ))}
    </View>

          {/* OPTIONS */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
          {q.options.map((item, i) => (
  <Animated.View key={i} style={{ transform: [{ scale: scaleAnim }] }}>
    <Pressable
onPress={() => {
  setSelected((prev) => {
    if (prev.includes(item)) return prev;
    if (prev.length >= q.target.length) return prev;
    return [...prev, item];
  });

  Animated.sequence([
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 80,
      useNativeDriver: true,
    }),
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 80,
      useNativeDriver: true,
    }),
  ]).start();
}}
              >
                <Text style={{ margin: 5, padding: 12, backgroundColor: "#1e293b", color: "white" }}>
                  {item}
                </Text>
              </Pressable>
              </Animated.View>
            ))}
          </View>
<Pressable
  onPress={() => {
    if (selected.length !== q.target.length) return;
    checkBuilder();
  }}
  style={{
    marginTop: 20,
    backgroundColor: "#0ea5e9",
    padding: 15,
    borderRadius: 10,
  }}
>
  <Text
    style={{
      textAlign: "center",
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    }}
  >
    Check
  </Text>
</Pressable>
        </>
      )}

      {/* INPUT MODE */}
      {q.type === "input" && (
        <>
   <Text
  style={{
    fontSize: 22,
    textAlign: "center",
    color:
      result === "correct"
        ? "#22c55e"
        : result === "wrong"
        ? "#ef4444"
        : theme.colors.text,
  }}
>
  {result
    ? q.display.replace("_", q.answer)
    : q.display}
</Text>

          <TextInput
          editable={result === null}
            value={input}
            onChangeText={setInput}
            placeholder="Enter missing piece"
            style={{
              marginTop: 20,
              padding: 15,
              borderWidth: 2,
              borderColor: theme.colors.border,
              borderRadius: 10,
              color: theme.colors.text,
            }}
          />

          <Pressable
  onPress={() => {
   if (!input.trim()) return;
    checkInput();
  }}
  style={{
    marginTop: 20,
    backgroundColor: "#0ea5e9",
    padding: 15,
    borderRadius: 10,
  }}
>
  <Text
    style={{
      textAlign: "center",
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    }}
  >
    Check
  </Text>
</Pressable>
        </>
      )}

    </Animated.View>
    </KeyboardAvoidingView>
  );
}