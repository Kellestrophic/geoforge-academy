import mineralogyFB from "@/data/mineralogyFB.json";
import mineralogyMC from "@/data/mineralogyMC.json";
import petrologyFB from "@/data/petrologyFB.json";
import petrologyMC from "@/data/petrologyMC.json";
import { addReviewQuestion } from "@/lib/reviewStore";
import { theme } from "@/lib/theme";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ MASTER QUESTION POOL
const ALL_QUESTIONS: Question[] = [
  ...normalizeQuestions(mineralogyMC as any[]),
  ...normalizeQuestions(mineralogyFB as any[]),
  ...normalizeQuestions(petrologyMC as any[]),
  ...normalizeQuestions(petrologyFB as any[]),
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
  if (q.type !== "multiple_choice") return q;

  const correct = q.choices[q.correctAnswer];

  const shuffled = shuffleArray([...q.choices]);

  return {
    ...q,
    choices: shuffled,
    correctAnswer: shuffled.indexOf(correct),
  };
}
function normalizeQuestions(data: any[]): Question[] {
  return data.map((q) => {
    if (q.type === "multiple_choice") {
      return {
        id: q.id,
        category: q.category,
        question: q.question,
        choices: q.choices,
        explanation: q.explanation,
        type: "multiple_choice",
        correctAnswer: q.correctAnswer,
      } as MCQuestion;
    }

    return {
      id: q.id,
      category: q.category,
      question: q.question,
      choices: q.choices,
      explanation: q.explanation,
      type: q.type === "input_multi" ? "input_multi" : "input",
    } as InputQuestion;
  });
}
function clean(str: string) {
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function PracticeScreen() {
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
    let pool = ALL_QUESTIONS;

    // 🔥 FILTER BY TOPIC
    if (topic) {
      pool = pool.filter((q: any) => q.category === topic);
    }

    // 🔥 FILTER BY MODE
    if (mode === "mc") {
      pool = pool.filter((q: any) => q.type === "multiple_choice");
    } else if (mode === "fb") {
      pool = pool.filter(
        (q: any) =>
          q.type === "input" || q.type === "input_multi"
      );
    }
    // mode === "all" or undefined → no filter

    // 🔥 RANDOMIZE ONCE
  return [...pool]
  .map(shuffleQuestion) // 🔥 FIX
  .sort(() => Math.random() - 0.5);
  }, [topic, mode]);

 const question = questions[index] as Question;

  if (!question) {
    return (
      <View style={{ padding: 20 }}>
        <Text>No questions found.</Text>
      </View>
    );
  }

 function handleSubmit() {
  let result = false;

  // ✅ MULTIPLE CHOICE
  if (question.type === "multiple_choice") {
    if (selected === null) return;
    result = selected === question.correctAnswer;
  }

  // ✅ SINGLE INPUT
  else if (question.type === "input") {
    if (!input.trim()) return;
    result = clean(input) === clean(question.choices[0]);
  }

  // ✅ MULTI INPUT
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

setIsCorrect(result);
setShowResult(true);

// 🔥 SAVE WRONG QUESTIONS
if (!result) {
  addReviewQuestion(question);
}
}
function nextQuestion() {
  if (index + 1 >= questions.length) {
    alert("Done!");
    return;
  }

  setIndex((prev) => prev + 1);
  setSelected(null);
  setInput("");
  setShowResult(false);
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
  question.choices.map((choice: string, i: number) => {
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
  onPress={showResult ? nextQuestion : handleSubmit}
  disabled={!showResult && (
    question.type === "multiple_choice"
      ? selected === null
      : !input.trim()
  )}
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