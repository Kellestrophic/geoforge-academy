import mineralFormulas from "@/data/mineralFormulas.json";
import mineralogyFB from "@/data/mineralogyFB.json";
import mineralogyMC from "@/data/mineralogyMC.json";
import petrologyFB from "@/data/petrologyFB.json";
import petrologyMC from "@/data/petrologyMC.json";
import sedimentologyFB from "@/data/sedimentologyFB.json";
import sedimentologyMC from "@/data/sedimentologyMC.json";
import { trackActivity } from "@/lib/activity";
import { saveWrongQuestion } from "@/lib/review";
import { theme } from "@/lib/theme";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ MASTER QUESTION POOL
const ALL_QUESTIONS: Question[] = [
  ...normalizeQuestions(mineralogyMC as any[]),
  ...normalizeQuestions(mineralogyFB as any[]),
  ...normalizeQuestions(petrologyMC as any[]),
  ...normalizeQuestions(petrologyFB as any[]),
  ...normalizeQuestions(mineralFormulas as any[]), // 🔥 ADD THIS
  ...normalizeQuestions(sedimentologyMC as any[]), // 🔥 ADD THIS
  ...normalizeQuestions(sedimentologyFB as any[]), // 🔥 ADD THIS
];
type BaseQuestion = {
  id: string;
  category: string;
  question: string;
  choices: string[];
  explanation: string;
};

type MCQuestion = BaseQuestion & {
  type: "multiple_choice";
  correctAnswer: number;
};

type InputQuestion = BaseQuestion & {
  type: "input" | "input_multi";
};

type Question = MCQuestion | InputQuestion;
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function shuffleQuestion(q: any) {
  if (
    q.type !== "multiple_choice" ||
    !Array.isArray(q.choices) ||
    typeof q.correctAnswer !== "number" ||
    q.correctAnswer < 0 ||
    q.correctAnswer >= q.choices.length
  ) {
    console.log("❌ BAD QUESTION:", q);
    return q; // don't crash
  }

  const correct = q.choices[q.correctAnswer];

  const shuffled = shuffleArray([...q.choices]);

  const newIndex = shuffled.indexOf(correct);

  if (newIndex === -1) {
    console.log("❌ SHUFFLE FAILED:", q);
    return q; // fallback instead of crash
  }

  return {
    ...q,
    choices: shuffled,
    correctAnswer: newIndex,
  };
}
function normalizeQuestions(data: any[]): Question[] {
  if (!Array.isArray(data)) {
    console.log("❌ NOT ARRAY:", data);
    return [];
  }

  return data
    .map((q, i) => {
      try {
        if (!q || typeof q !== "object") {
          console.log("❌ INVALID OBJECT:", i, q);
          return null;
        }

        if (!q.question) {
          console.log("❌ MISSING QUESTION TEXT:", i, q);
          return null;
        }

        // ✅ MULTIPLE CHOICE
        if (q.type === "multiple_choice" || q.type === "formula") {
          if (!Array.isArray(q.choices) || q.choices.length === 0) {
            console.log("❌ BAD CHOICES:", i, q);
            return null;
          }

          if (typeof q.correctAnswer !== "number") {
            console.log("❌ BAD CORRECT INDEX:", i, q);
            return null;
          }

          return {
            id: String(q.id ?? i),
            category: q.category ?? "unknown",
            question: String(q.question),
            choices: q.choices.map(String),
            explanation: q.explanation ?? "",
            type: "multiple_choice",
            correctAnswer: q.correctAnswer,
          } as MCQuestion;
        }

        // ✅ INPUT
        const answers =
          Array.isArray(q.answer)
            ? q.answer
            : q.answer
            ? [q.answer]
            : [];

        if (answers.length === 0) {
          console.log("❌ BAD INPUT ANSWER:", i, q);
          return null;
        }

        return {
          id: String(q.id ?? i),
          category: q.category ?? "unknown",
          question: String(q.question),
          choices: answers.map(String),
          explanation: q.explanation ?? "",
          type: q.type === "input_multi" ? "input_multi" : "input",
        } as InputQuestion;
      } catch (e) {
        console.log("❌ NORMALIZE CRASH:", i, e);
        return null;
      }
    })
    .filter((q): q is Question => q !== null);
}
function clean(str: string) {
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function PracticeScreen() {
  const submitLock = useRef(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState("");
const [showResult, setShowResult] = useState(false);
const [isCorrect, setIsCorrect] = useState(false);
  const params = useLocalSearchParams();

  const topic = Array.isArray(params.topic)
    ? params.topic[0]
    : params.topic;

  const mode = Array.isArray(params.mode)
    ? params.mode[0]
    : params.mode;

  // ✅ BUILD QUESTION SET
const questions = useMemo(() => {
  try {
    let pool: Question[] = [
      ...normalizeQuestions(mineralogyMC as any[]),
      ...normalizeQuestions(mineralogyFB as any[]),
      ...normalizeQuestions(petrologyMC as any[]),
      ...normalizeQuestions(petrologyFB as any[]),
      ...normalizeQuestions(mineralFormulas as any[]),
      ...normalizeQuestions(sedimentologyMC as any[]),
      ...normalizeQuestions(sedimentologyFB as any[]),
    ];

    console.log("✅ POOL SIZE BEFORE FILTER:", pool.length);

    if (topic) {
      pool = pool.filter((q) => q.category === topic);
    }

    if (mode === "mc") {
      pool = pool.filter((q) => q.type === "multiple_choice");
    } else if (mode === "fb") {
      pool = pool.filter(
        (q) => q.type === "input" || q.type === "input_multi"
      );
    }

const safe = pool.filter(
  (q) =>
    q &&
    typeof q.question === "string" &&
    Array.isArray(q.choices) &&
    q.choices.length > 0 &&
    (
      q.type !== "multiple_choice" ||
      (typeof q.correctAnswer === "number" &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < q.choices.length)
    )
);
    console.log("✅ SAFE QUESTIONS:", safe.length);

    return safe
      .map(shuffleQuestion)
      .sort(() => Math.random() - 0.5);
  } catch (e) {
    console.log("❌ BUILD QUESTIONS CRASH:", e);
    return [];
  }
}, [topic, mode]);

const question = questions[index] ?? null;

if (!question || !Array.isArray(question.choices)) {
  console.log("❌ INVALID QUESTION:", index, questions.length, question);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: theme.colors.text }}>
        Question failed to load safely.
      </Text>
    </View>
  );
}

async function handleSubmit() {
  // 🔥 PREVENT DOUBLE TAP
  if (submitLock.current) return;
  submitLock.current = true;

  let result = false;

  if (question.type === "multiple_choice") {
    if (selected === null) return;
    result = selected === question.correctAnswer;
  }

  else if (question.type === "input") {
    if (!input.trim()) return;

    const correct = question.choices?.[0];
    if (!correct) return;

    result = clean(input) === clean(correct);
  }

  else if (question.type === "input_multi") {
    if (!input.trim()) return;

    const userParts = input
      .split(/,|and/gi)
      .map((x) => clean(x))
      .filter(Boolean);

    const correctParts = question.choices.map((x: string) =>
      clean(x)
    );

    result =
      correctParts.length === userParts.length &&
      correctParts.every((ans: string) =>
        userParts.includes(ans)
      );
  }

  // ✅ TRACK PRACTICE
  await trackActivity("practice");

  setIsCorrect(result);
  setShowResult(true);

  // ✅ SAVE WRONG (ONLY ONCE NOW)
  if (!result) {
    await saveWrongQuestion(question);
  }
}
function nextQuestion() {
  submitLock.current = false; // 🔥 RESET LOCK

  setSelected(null);
  setInput("");
  setShowResult(false);

  setIndex((prev) =>
  prev + 1 >= questions.length ? 0 : prev + 1
);
}
 return (
  <SafeAreaView style={{ flex: 1 }}>
    <View style={{
  flex: 1,
  padding: 20,
  backgroundColor: theme.colors.background
}}>
   <Text style={{ fontSize: 18, marginBottom: 20, color: theme.colors.text }}>
  {question.question}
</Text>

      {/* MULTIPLE CHOICE */}
{question.type === "multiple_choice" &&
 (Array.isArray(question.choices) ? question.choices : []).map((choice: string, i: number) => {
    let borderColor = theme.colors.border;
let bg = "transparent";

    if (showResult) {
      if (i === question.correctAnswer) {
        bg = "#16a34a"; // green
      } else if (i === selected) {
        bg = "#dc2626"; // red
      }
    } else if (selected === i) {
      bg = "#334155";
    }

    return (
      <Pressable
        key={i}
        onPress={() => !showResult && setSelected(i)}
style={{
  borderWidth: 2,
  borderColor:
    showResult && i === question.correctAnswer
      ? "#16a34a"
      : showResult && i === selected
      ? "#dc2626"
      : selected === i
      ? "#334155"
      : borderColor,
  padding: 14,
  borderRadius: 10,
  marginBottom: 10,
  backgroundColor: bg,
}}
      >
        <Text style={{ color: theme.colors.text }}>{choice}</Text>
      </Pressable>
    );
  })}
      {/* INPUT */}
      {(question.type === "input" ||
        question.type === "input_multi") && (
 <TextInput
  value={input}
  onChangeText={(text) => !showResult && setInput(text)}
          placeholder={
            question.type === "input_multi"
              ? "Type answers (comma separated)"
              : "Type your answer"
          }
          placeholderTextColor="#94a3b8"
          style={{
          backgroundColor: "transparent",
color: theme.colors.text,
borderWidth: 2,
borderColor: theme.colors.border,
            padding: 14,
            borderRadius: 10,
            marginBottom: 20,
          }}
        />
      )}
{showResult && (
  <View style={{ marginTop: 20 }}>
    <Text
      style={{
        color: isCorrect ? "#22c55e" : "#ef4444",
        fontSize: 18,
        marginBottom: 10,
      }}
    >
      {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
    </Text>

    {/* 🔥 SHOW CORRECT ANSWER FOR INPUT */}
    {question.type !== "multiple_choice" && (
     <Text style={{ color: theme.colors.text, marginBottom: 10 }}>
        Correct Answer: {question.choices.join(", ")}
      </Text>
    )}

    <Text style={{ color: theme.colors.subtext }}>
      {question.explanation}
    </Text>
  </View>
)}
      {/* SUBMIT */}
<Pressable
  onPress={() => {
    if (showResult) {
      nextQuestion();
    } else {
      handleSubmit();
    }
  }}
  disabled={
    !showResult &&
    (question.type === "multiple_choice"
      ? selected === null
      : !input.trim())
  }
  style={{
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
  }}
>
  <Text style={{ color: "white", textAlign: "center" }}>
    {showResult ? "Next" : "Submit"}
  </Text>
</Pressable>
      </View>
  </SafeAreaView>
  );
}