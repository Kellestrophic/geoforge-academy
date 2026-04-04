import questionsData from "@/data/questions.json";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
function getAnalytics(questions: any[], answers: any) {
  const stats: Record<string, { correct: number; total: number }> = {};

  questions.forEach((q, i) => {
    const topic = q.subcategory?.[0] || q.category || "Other";

    if (!stats[topic]) {
      stats[topic] = { correct: 0, total: 0 };
    }

    stats[topic].total++;

    if (answers[i] === q.correctAnswer) {
      stats[topic].correct++;
    }
  });

  return Object.entries(stats).map(([topic, data]) => ({
    topic,
    percent: Math.round((data.correct / data.total) * 100),
    correct: data.correct,
    total: data.total,
  }));
}
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function transformMatchToMC(question: any, allQuestions: any[]) {
  if (question.type !== "match") return question;

  const pair = question.matchPairs?.[0];
  if (!pair) return question;

  const correct = pair.match;

  const wrongOptions = allQuestions
    .filter((q) => q.type === "match")
    .flatMap((q) => q.matchPairs || [])
    .map((p: any) => p.match)
    .filter((m: string) => m !== correct)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const choices = [...wrongOptions, correct].sort(
    () => Math.random() - 0.5
  );

return {
  id: String(question.id ?? ""),
  type: "multiple_choice",
  category: String(question.category ?? ""),
  question: typeof pair.term === "string" ? pair.term : "",
  choices: Array.isArray(choices) ? choices : [],
  correctAnswer: choices.indexOf(correct),
};
}

export default function ExamScreen() {
  const params = useLocalSearchParams();

  const count = Number(params.count) || 20;
  const timeLimit = Number(params.time) || 30;
  const mode = params.mode;
  const selectedTopic = Array.isArray(params.topic)
    ? params.topic[0]
    : params.topic;

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [finished, setFinished] = useState(false);
function fixShuffledQuestion(q: any) {
  if (!q.choices || q.correctAnswer == null) return q;

  const correctValue = q.choices[q.correctAnswer];

  const shuffledChoices = [...q.choices].sort(() => Math.random() - 0.5);

  const newCorrectIndex = shuffledChoices.indexOf(correctValue);

return {
  id: String(q.id ?? ""),
  type: q.type,
  category: String(q.category ?? ""),
  question: typeof q.question === "string" ? q.question : "",
  choices: Array.isArray(shuffledChoices) ? shuffledChoices : [],
  correctAnswer: newCorrectIndex,
};
}
  // ✅ LOAD QUESTIONS (FIXED)
  useEffect(() => {
    let pool = questionsData;

    if (mode === "topic" && selectedTopic) {
      pool = questionsData.filter(
        (q: any) =>
          q.category === selectedTopic ||
          (q.subcategory && q.subcategory.includes(selectedTopic))
      );
    }

    if (!pool || pool.length === 0) {
      pool = questionsData; // fallback 🔥
    }

const transformed = pool.map((q) =>
  fixShuffledQuestion(transformMatchToMC(q, pool))
);

    const shuffled = shuffleArray(transformed).slice(0, count);

    setQuestions(shuffled);
  }, [mode, selectedTopic, count]);

  // ✅ TIMER
  useEffect(() => {
    if (finished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [finished]);

  // ✅ SAVE RESULT (FIXED)
  useEffect(() => {
    if (!finished || questions.length === 0) return;

    async function saveResult() {
      const score = questions.reduce((acc, q, i) => {
        return answers[i] === q.correctAnswer ? acc + 1 : acc;
      }, 0);

      const percent = Math.round((score / questions.length) * 100);
      const now = new Date();
const iso = typeof now?.toISOString === "function"
  ? now.toISOString()
  : "";

let dayKey = "";

try {
  const safeIso =
    typeof iso === "string" ? iso : "";

  const parts = safeIso.split("T");

  dayKey =
    Array.isArray(parts) && parts.length > 0
      ? parts[0]
      : "";
} catch (e) {
  console.log("❌ split crash prevented:", e);
  dayKey = "";
}


      const existing = await AsyncStorage.getItem("examHistory");
      let history = existing ? JSON.parse(existing) : [];

      history.push({ date: now, score: percent });
      history = history.slice(-10);

      await AsyncStorage.setItem("examHistory", JSON.stringify(history));

let userId = null;

try {
let userId = null;

try {
  const response = await supabase?.auth?.getUser?.();

  if (
    response &&
    response.data &&
    response.data.user &&
    typeof response.data.user.id === "string"
  ) {
    userId = response.data.user.id;
  }
} catch (e) {
  console.log("❌ SAFE getUser crash prevented:", e);
}
} catch (e) {
  console.log("🚨 getUser crash prevented:", e);
}

if (!userId) return;

     

  await supabase.from("exam_history").insert({
  user_id: userId,
  score: percent,
  date: now,
  type: mode, // 🔥 THIS FIXES YOUR FILTER
  topics: mode === "topic" ? getAnalytics(questions, answers) : null, // 🔥 THIS STORES BREAKDOWN
});

      // 🔥 ENSURE PROFILE EXISTS
await supabase.from("profiles").upsert({
  id: userId,
  xp: 0,
});

console.log("Saving exam XP:", userId, percent);

// 🔥 UPDATE XP
const { data: profile } = await supabase
  .from("profiles")
  .select("xp")
  .eq("id", userId)
  .single();

const currentXP = profile?.xp || 0;

await supabase
  .from("profiles")
  .update({
    xp: currentXP + percent,
  })
  .eq("id", userId);
    }

    saveResult();
  }, [finished]);

  if (questions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: theme.colors.text }}>
          Loading Exam...
        </Text>
      </View>
    );
  }

  const question = questions[currentIndex];

  function selectAnswer(index: number) {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: index,
    }));
  }

  function finishExam() {
    setFinished(true);
  }

  function calculateScore() {
    return questions.reduce((acc, q, i) => {
      return answers[i] === q.correctAnswer ? acc + 1 : acc;
    }, 0);
  }

if (finished) {
  const score = calculateScore();
  const percent = Math.round((score / questions.length) * 100);

  const analytics = getAnalytics(questions, answers);
  const sorted = [...analytics].sort((a, b) => a.percent - b.percent);

  const weakest = sorted.slice(0, 3);
  const strongest = [...sorted].reverse().slice(0, 3);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 28 }}>
        Exam Complete
      </Text>

      <Text style={{ marginTop: 20, color: theme.colors.text }}>
        Score: {score} / {questions.length}
      </Text>

      <Text style={{ marginTop: 10, color: theme.colors.subtext }}>
        {percent}%
      </Text>

      {/* WEAK AREAS */}
      <Text style={{ marginTop: 30, color: "#ef4444" }}>
        Weak Areas
      </Text>

      {weakest.map((item) => (
        <Text key={item.topic} style={{ color: "white", marginTop: 5 }}>
          {item.topic} — {item.percent}%
        </Text>
      ))}

      {/* STRONG AREAS */}
      <Text style={{ marginTop: 20, color: "#22c55e" }}>
        Strong Areas
      </Text>

      {strongest.map((item) => (
        <Text key={item.topic} style={{ color: "white", marginTop: 5 }}>
          {item.topic} — {item.percent}%
        </Text>
      ))}
    </ScrollView>
  );
}

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ color: theme.colors.text }}>
        Question {currentIndex + 1} / {questions.length}
      </Text>

      <Text style={{ marginTop: 20, color: theme.colors.text }}>
        {question.question}
      </Text>

      {question.choices?.map((choice: string, index: number) => {
        const isSelected = answers[currentIndex] === index;

        return (
          <Pressable
            key={index}
            onPress={() => selectAnswer(index)}
            style={{
              marginTop: 10,
              padding: 15,
              borderRadius: 10,
              backgroundColor: isSelected ? "#4CAF50" : "#1e293b",
            }}
          >
            <Text style={{ color: "white" }}>{choice}</Text>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() =>
          setCurrentIndex((prev) =>
            prev + 1 >= questions.length ? prev : prev + 1
          )
        }
        style={{
          marginTop: 20,
          backgroundColor: "#1e293b",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Next
        </Text>
      </Pressable>

      <Pressable
        onPress={finishExam}
        style={{
          marginTop: 10,
          backgroundColor: "#ef4444",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Submit Exam
        </Text>
      </Pressable>
    </ScrollView>
  );
}