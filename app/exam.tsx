import archaeologyFBRaw from "@/data/archaeologyFB.json";
import archaeologyMCRaw from "@/data/archaeologyMC.json";
import mineralFormulasRaw from "@/data/mineralFormulas.json";
import mineralogyFBRaw from "@/data/mineralogyFB.json";
import mineralogyMCRaw from "@/data/mineralogyMC.json";
import petrologyFBRaw from "@/data/petrologyFB.json";
import petrologyMCRaw from "@/data/petrologyMC.json";
import questionsData from "@/data/questions.json";
import sedimentologyFBRaw from "@/data/sedimentologyFB.json";
import sedimentologyMCRaw from "@/data/sedimentologyMC.json";

import economicGeoFBRaw from "@/data/economicGeoFB.json";
import economicGeoMCRaw from "@/data/economicGeoMC.json";

import engineeringGeoFBRaw from "@/data/engineeringGeoFB.json";
import engineeringGeoMCRaw from "@/data/engineeringGeoMC.json";

import geomorphologyFBRaw from "@/data/geomorphologyFB.json";
import geomorphologyMCRaw from "@/data/geomorphologyMC.json";

import hydrogeologyFBRaw from "@/data/hydrogeologyFB.json";
import hydrogeologyMCRaw from "@/data/hydrogeologyMC.json";

import paleontologyFBRaw from "@/data/paleontologyFB.json";
import paleontologyMCRaw from "@/data/paleontologyMC.json";

import structuralFBRaw from "@/data/structuralFB.json";
import structuralMCRaw from "@/data/structuralMC.json";
import { trackActivity } from "@/lib/activity";
import { saveExam } from "@/lib/saveExam";
import { saveWrongQuestion } from "@/lib/saveWrongQuestion";
import { theme } from "@/lib/theme";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
/* ---------------- DATA ---------------- */

const mineralFormulas = mineralFormulasRaw as any[];
const mineralogyFB = mineralogyFBRaw as any[];
const mineralogyMC = mineralogyMCRaw as any[];
const petrologyFB = petrologyFBRaw as any[];
const petrologyMC = petrologyMCRaw as any[];
const sedimentologyFB = sedimentologyFBRaw as any[];
const sedimentologyMC = sedimentologyMCRaw as any[];
const archaeologyFB = archaeologyFBRaw as any[];
const archaeologyMC = archaeologyMCRaw as any[];

const economicGeoFB = economicGeoFBRaw as any[];
const economicGeoMC = economicGeoMCRaw as any[];

const engineeringGeoFB = engineeringGeoFBRaw as any[];
const engineeringGeoMC = engineeringGeoMCRaw as any[];

const geomorphologyFB = geomorphologyFBRaw as any[];
const geomorphologyMC = geomorphologyMCRaw as any[];

const hydrogeologyFB = hydrogeologyFBRaw as any[];
const hydrogeologyMC = hydrogeologyMCRaw as any[];

const paleontologyFB = paleontologyFBRaw as any[];
const paleontologyMC = paleontologyMCRaw as any[];

const structuralFB = structuralFBRaw as any[];
const structuralMC = structuralMCRaw as any[];
/* ---------------- HELPERS ---------------- */

function clean(str: string) {
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
}
function shuffle(arr: any[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ---------------- SCREEN ---------------- */

export default function ExamScreen() {
const params = useLocalSearchParams();

const rawMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
const rawType = Array.isArray(params.type) ? params.type[0] : params.type;

const selectedTopic = Array.isArray(params.topic)
  ? params.topic[0]
  : params.topic;

// 🔥 THIS FIXES PRACTICE MODE (including topic practice)
const isPractice = rawMode === "practice";

const mode: "random" | "topic" | "pg" =
  rawMode === "topic" || rawMode === "pg" ? rawMode : "random";

const count = isPractice ? 9999 : Number(params.count) || 20;
const timeLimit = isPractice ? 0 : Number(params.time) || 30;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);

  /* ---------------- TIMER ---------------- */

useEffect(() => {
  if (isPractice) return; // 🔥 HARD STOP
  if (finished) return;

  setTimeLeft(timeLimit * 60);

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
}, [finished, isPractice]);
  /* ---------------- BUILD QUESTIONS ---------------- */

  const questions = useMemo(() => {
    try {
      const topicMap: Record<string, any[]> = {
        Mineralogy: [...mineralogyMC, ...mineralogyFB],
        Petrology: [...petrologyMC, ...petrologyFB],
        Sedimentology: [...sedimentologyMC, ...sedimentologyFB],
        "Mineral Formulas": [...mineralFormulas],
        Archaeology: [...archaeologyMC, ...archaeologyFB],
        "Economic Geology": [...economicGeoMC, ...economicGeoFB],
        "Engineering Geology": [...engineeringGeoMC, ...engineeringGeoFB],
        Geomorphology: [...geomorphologyMC, ...geomorphologyFB],
        Hydrogeology: [...hydrogeologyMC, ...hydrogeologyFB],
        Paleontology: [...paleontologyMC, ...paleontologyFB],
        Structural: [...structuralMC, ...structuralFB],
      };

  let pool: any[] = [];

// 🔥 ALWAYS USE TOPIC FIRST (THIS FIXES EVERYTHING)
if (selectedTopic && topicMap[selectedTopic]) {
  pool = topicMap[selectedTopic];
}

// PG mode
else if (mode === "pg") {
  pool = Array.isArray(questionsData) ? questionsData : [];
}

// Random mode (ALL topics)
else {
  pool = Object.values(topicMap).flat();
}

      const safe: any[] = [];

      for (const q of pool) {
        if (!q || typeof q.question !== "string") continue;

        if (
          (q.type === "multiple_choice" || q.type === "formula") &&
          Array.isArray(q.choices)
        ) {
          const choices = q.choices.map((c: any) => String(c));
          const correctIndex =
            typeof q.correctAnswer === "number" ? q.correctAnswer : 0;

          safe.push({
            question: q.question,
            type: "multiple_choice",
            choices,
            correctAnswer: correctIndex,
          });

          continue;
        }

        if (q.answer !== undefined && q.answer !== null) {
          const answers = Array.isArray(q.answer)
            ? q.answer
            : [q.answer];

          safe.push({
            question: q.question,
            type: "input",
            answer: answers.map((x: any) => String(x)),
          });
        }
      }

      return shuffle(safe).slice(0, count);
    } catch (e) {
      console.log("❌ BUILD CRASH", e);
      return [];
    }
 }, [mode, selectedTopic, count, isPractice]);

  const question = questions[index];

  /* ---------------- SCORE ---------------- */

  function calculateScore() {
    let correct = 0;

questions.forEach((q, i) => {
  const user = answers[i];

  let correct = false;

  if (q.type === "multiple_choice") {
    const correctText = q.choices[q.correctAnswer];
    correct = user === correctText;
  } else {
    const correctAnswer = q.answer?.[0] ?? "";
    correct = clean(user) === clean(correctAnswer);
  }

  if (!correct) {
    saveWrongQuestion(q); // 🔥 SAVE WRONG
  }
});

    return correct;
  }

  /* ---------------- RESULT ---------------- */

useEffect(() => {
  if (!finished) return;

  const run = async () => {
    try {
      const score = calculateScore();
     const percent =
  questions.length === 0
    ? 0
    : Math.round((score / questions.length) * 100);

      console.log("📊 Saving:", percent, mode, selectedTopic);

      await saveExam(percent, mode, selectedTopic);
      await trackActivity("exam", questions.length / 2);
    } catch (e) {
      console.log("SAVE FAIL:", e);
    }
  };

  run();
}, [finished]);
  if (finished) {
    const score = calculateScore();

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 24, color: theme.colors.text }}>
            Score: {score} / {questions.length}
          </Text>

          {questions.map((q, i) => {
            const user = answers[i];

            const correctText =
              q.type === "multiple_choice"
                ? q.choices[q.correctAnswer]
                : q.answer?.[0];

            const isCorrect =
              q.type === "multiple_choice"
                ? user === correctText
                : clean(user) === clean(correctText);

            return (
              <View key={i} style={{ marginTop: 15 }}>
                <Text style={{ color: theme.colors.text }}>
                  {q.question}
                </Text>

                <Text style={{ color: isCorrect ? "#22c55e" : "#ef4444" }}>
                  Your Answer: {String(user ?? "—")}
                </Text>

                <Text style={{ color: "#94a3b8" }}>
                  Correct Answer: {correctText}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ---------------- EMPTY ---------------- */

  if (!question) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text }}>
          No questions loaded
        </Text>
      </SafeAreaView>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* TIMER */}
        {!isPractice && (
  <Text style={{ color: theme.colors.subtext }}>
          Time Left: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
          
        </Text>
        )}

        <Text style={{ color: theme.colors.text, fontSize: 20 }}>
          {question.question}
        </Text>

        {/* MC */}
        {question.type === "multiple_choice" &&
          question.choices.map((c: string, i: number) => (
            <Pressable
              key={i}
              onPress={() =>
                setAnswers((prev: any) => ({
                  ...prev,
                  [index]: c, // ✅ STORE TEXT
                }))
              }
              style={{
                marginTop: 10,
                padding: 14,
                borderWidth: 1,
                borderColor: "#444",
                backgroundColor:
                  answers[index] === c ? "#334155" : "#1e293b",
              }}
            >
              <Text style={{ color: "white" }}>{c}</Text>
            </Pressable>
          ))}

        {/* INPUT */}
        {question.type === "input" && (
          <TextInput
            value={answers[index] || ""}
            onChangeText={(t) =>
              setAnswers((prev: any) => ({
                ...prev,
                [index]: t,
              }))
            }
            placeholder="Type answer"
            placeholderTextColor="#94a3b8"
            style={{
              borderWidth: 1,
              borderColor: "#444",
              padding: 14,
              marginTop: 12,
              color: theme.colors.text,
            }}
          />
        )}

        {/* NEXT */}
        <Pressable
          onPress={() =>
            setIndex((prev) =>
              prev + 1 >= questions.length ? prev : prev + 1
            )
          }
          style={{
            marginTop: 20,
            backgroundColor: "#2563eb",
            padding: 14,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Next
          </Text>
        </Pressable>

        {/* SUBMIT */}
        <Pressable
          onPress={() => setFinished(true)}
          style={{
            marginTop: 10,
            backgroundColor: "#ef4444",
            padding: 14,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Submit Exam
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}