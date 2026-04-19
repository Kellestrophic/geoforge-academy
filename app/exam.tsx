import { useUser } from "@/context/UserContext";
import questionsData from "@/data/questions.json";
import { trackActivity } from "@/lib/activity";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
const mineralogyFBRaw = require("../data/mineralogyFB.json");
const mineralogyMCRaw = require("../data/mineralogyMC.json");
const petrologyFBRaw = require("../data/petrologyFB.json");
const petrologyMCRaw = require("../data/petrologyMC.json");
const mineralFormulasRaw = require("../data/mineralFormulas.json");

/* ---------------- SAFE UNWRAP ---------------- */

const unwrap = (data: any) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.questions)) return data.questions;
  if (Array.isArray(data?.default)) return data.default;
  if (Array.isArray(data?.default?.questions)) return data.default.questions;
  return [];
};

/* ---------------- FINAL DATA ---------------- */

const mineralogyFB = unwrap(mineralogyFBRaw);
const mineralogyMC = unwrap(mineralogyMCRaw);
const petrologyFB = unwrap(petrologyFBRaw);
const petrologyMC = unwrap(petrologyMCRaw);
const mineralFormulas = unwrap(mineralFormulasRaw);

/* ---------------- TOPIC MAP ---------------- */

const TOPIC_QUESTIONS: Record<string, any[]> = {
  Mineralogy: [...mineralogyMC, ...mineralogyFB],
  Petrology: [...petrologyMC, ...petrologyFB],
  MineralFormulas: [...mineralFormulas],
};

/* ---------------- HELPERS ---------------- */

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

/* ---------------- SCREEN ---------------- */

export default function ExamScreen() {
  const params = useLocalSearchParams();
  const { addExam } = useUser();

  const [saved, setSaved] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [inputAnswer, setInputAnswer] = useState("");

  const count = Number(params.count) || 20;
  const timeLimit = Number(params.time) || 30;
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);

  const rawMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const mode: "random" | "topic" | "pg" =
    rawMode === "topic" || rawMode === "pg" ? rawMode : "random";

  const selectedTopic = Array.isArray(params.topic)
    ? params.topic[0]
    : params.topic;

  /* ---------------- LOAD QUESTIONS ---------------- */

  useEffect(() => {
    try {
      let pool: any[] = [];

      if (mode === "pg") {
        pool = Array.isArray(questionsData) ? questionsData : [];
      } else if (mode === "random") {
        pool = [
          ...mineralogyMC,
          ...mineralogyFB,
          ...petrologyMC,
          ...petrologyFB,
          ...mineralFormulas,
        ];
      } else if (mode === "topic" && selectedTopic) {
        pool = TOPIC_QUESTIONS[selectedTopic] ?? [];
      }

      console.log("RAW MODE:", rawMode);
      console.log("FINAL MODE:", mode);
      console.log("SELECTED TOPIC:", selectedTopic);
      console.log("POOL SIZE:", pool.length);

      const shuffled = shuffleArray(pool).slice(0, count);
      setQuestions(shuffled);
    } catch (e) {
      console.log("LOAD ERROR:", e);
      setQuestions([]);
    }
  }, [mode, selectedTopic, count, rawMode]);

  /* ---------------- TIMER ---------------- */

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

  /* ---------------- SCORE ---------------- */

  function calculateScore() {
    return questions.reduce((acc, q, i) => {
      const userAnswer = answers[i];

      if (q.type === "multiple_choice") {
        return userAnswer === q.correctAnswer ? acc + 1 : acc;
      }

      if (q.type === "input") {
        return String(userAnswer).toLowerCase().trim() ===
          String(q.answer).toLowerCase().trim()
          ? acc + 1
          : acc;
      }

      if (q.type === "input_multi") {
        const correct = Array.isArray(q.answer)
          ? q.answer.map((a: string) => a.toLowerCase().trim())
          : [];

        const user = Array.isArray(userAnswer)
          ? userAnswer.map((a: string) => a.toLowerCase().trim())
          : [];

        const isCorrect =
          correct.length === user.length &&
          correct.every((c: string) => user.includes(c));

        return isCorrect ? acc + 1 : acc;
      }

      return acc;
    }, 0);
  }

  /* ---------------- SAVE RESULT ---------------- */

useEffect(() => {
  if (!finished || saved || questions.length === 0) return;

  const run = async () => {
    try {
      const score = calculateScore();
      const percent = Math.round((score / questions.length) * 100);

      // 🔐 GET USER
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        console.log("❌ NO USER FOUND");
        return;
      }

      // ---------------------------
      // ✅ SAVE EXAM HISTORY
      // ---------------------------
      await supabase.from("exam_history").insert({
        user_id: user.id,
        score: percent,
        type: mode,
      });

      // ---------------------------
      // ✅ SAVE DAILY ACTIVITY (STREAK)
      // ---------------------------
      const today = new Date().toISOString().split("T")[0];

      const { data: existing } = await supabase
        .from("daily_activity")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today);

      if (!existing || existing.length === 0) {
        await supabase.from("daily_activity").insert({
          user_id: user.id,
          date: today,
        });
      }

      // ---------------------------
      // ✅ SAVE WRONG QUESTIONS
      // ---------------------------
      const wrong = questions.filter((q, i) => {
        const userAnswer = answers[i];

        if (q.type === "multiple_choice") {
          return userAnswer !== q.correctAnswer;
        }

        if (q.type === "input") {
          return (
            String(userAnswer).toLowerCase().trim() !==
            String(q.answer).toLowerCase().trim()
          );
        }

        return false;
      });

      if (wrong.length > 0) {
        await supabase.from("wrong_questions").insert(
          wrong.map((q) => ({
            user_id: user.id,
            question: q,
          }))
        );
      }

      // ---------------------------
      // LOCAL STATE (for graph UI)
      // ---------------------------
  addExam({
  score: percent,
  type: mode,
});

// ✅ TRACK ACTIVITY (RIGHT HERE)
await trackActivity("exam", 10);

      setSaved(true);

      console.log("✅ EXAM SAVED");
    } catch (err) {
      console.log("❌ SAVE ERROR:", err);
    }
  };

  run();
}, [finished]);
  /* ---------------- LOADING ---------------- */

  if (questions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: theme.colors.text }}>Loading Exam...</Text>
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

  /* ---------------- RESULT ---------------- */

  if (finished) {
    const score = calculateScore();
    const percent = Math.round((score / questions.length) * 100);

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
      </ScrollView>
    );
  }

  /* ---------------- EXAM UI ---------------- */

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ color: theme.colors.text }}>
        Question {currentIndex + 1} / {questions.length}
      </Text>

      <Text style={{ marginTop: 20, color: theme.colors.text }}>
        {question.question}
      </Text>

      {question.type === "multiple_choice" &&
        Array.isArray(question.choices) &&
        question.choices.map((choice: string, index: number) => {
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

      {question.type === "input" && (
        <View style={{ marginTop: 20 }}>
          <TextInput
            value={inputAnswer}
            onChangeText={setInputAnswer}
            placeholder="Type your answer..."
            placeholderTextColor="#888"
            style={{
              backgroundColor: "#1e293b",
              color: "white",
              padding: 15,
              borderRadius: 10,
            }}
          />

          <Pressable
            onPress={() => {
              setAnswers((prev) => ({
                ...prev,
                [currentIndex]: inputAnswer,
              }));

              setInputAnswer("");

              setCurrentIndex((prev) =>
                prev + 1 >= questions.length ? prev : prev + 1
              );
            }}
            style={{
              marginTop: 10,
              backgroundColor: "#4CAF50",
              padding: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Submit Answer
            </Text>
          </Pressable>
        </View>
      )}

      {question.type === "input_multi" && (
        <View style={{ marginTop: 20 }}>
          <TextInput
            value={inputAnswer}
            onChangeText={setInputAnswer}
            placeholder="Comma separated answers"
            placeholderTextColor="#888"
            style={{
              backgroundColor: "#1e293b",
              color: "white",
              padding: 15,
              borderRadius: 10,
            }}
          />

          <Pressable
            onPress={() => {
              const split = inputAnswer
                .toLowerCase()
                .split(",")
                .map((s) => s.trim());

              setAnswers((prev) => ({
                ...prev,
                [currentIndex]: split,
              }));

              setInputAnswer("");

              setCurrentIndex((prev) =>
                prev + 1 >= questions.length ? prev : prev + 1
              );
            }}
            style={{
              marginTop: 10,
              backgroundColor: "#4CAF50",
              padding: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Submit Answers
            </Text>
          </Pressable>
        </View>
      )}

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