import questionsData from "@/data/questions.json";

import archaeologyFBRaw from "@/data/archaeologyFB.json";
import archaeologyMCRaw from "@/data/archaeologyMC.json";
import mineralFormulasRaw from "@/data/mineralFormulas.json";
import mineralogyFBRaw from "@/data/mineralogyFB.json";
import mineralogyMCRaw from "@/data/mineralogyMC.json";
import petrologyFBRaw from "@/data/petrologyFB.json";
import petrologyMCRaw from "@/data/petrologyMC.json";
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
const rawType = Array.isArray(params.type) ? params.type[0] : params.type;
  const rawMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
const isPractice = rawMode === "practice";
  const selectedTopic = Array.isArray(params.topic)
    ? params.topic[0]
    : params.topic;

  const mode: "random" | "topic" | "pg" =
    rawMode === "topic" || rawMode === "pg" ? rawMode : "random";

 const count = isPractice ? 9999 : Number(params.count) || 20;
const timeLimit = isPractice ? 0 : Number(params.time) || 30;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [finished, setFinished] = useState(false);
const [timeLeft, setTimeLeft] = useState(0);

const [selected, setSelected] = useState<number | null>(null);
const [input, setInput] = useState("");
const [showResult, setShowResult] = useState(false);
const [isCorrect, setIsCorrect] = useState(false);
  /* ---------------- TIMER ---------------- */

useEffect(() => {
  if (isPractice) return; // 🔥 HARD BLOCK

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

      // ✅ PG MODE
      if (mode === "pg") {
        return shuffle(
          (Array.isArray(questionsData) ? questionsData : [])
            .map((q: any) => {
              if (
                (q.type === "multiple_choice" || q.type === "formula") &&
                Array.isArray(q.choices)
              ) {
                return {
                  question: q.question,
                  type: "multiple_choice",
                  choices: q.choices.map((c: any) => String(c)),
                  correctAnswer: q.correctAnswer ?? 0,
                };
              }

              if (q.answer) {
                return {
                  question: q.question,
                  type: "input",
                  answer: [String(q.answer)],
                };
              }

              return null;
            })
            .filter(Boolean)
        ).slice(0, count);
      }

      const processed: any[] = [];

      for (const topic in topicMap) {
        // ✅ TOPIC FILTER
        if (mode === "topic") {
          if (!selectedTopic || topic !== selectedTopic) continue;
        }

        const list = topicMap[topic];

        for (const q of list) {
          if (!q || typeof q.question !== "string") continue;

          // MC + FORMULA
          if (
            (q.type === "multiple_choice" || q.type === "formula") &&
            Array.isArray(q.choices)
          ) {
            const choices = q.choices.map((c: any) => String(c));

            processed.push({
              question: q.question,
              type: "multiple_choice",
              choices,
              correctAnswer: q.correctAnswer ?? 0,
            });

            continue;
          }

          // INPUT
          if (q.answer !== undefined && q.answer !== null) {
            const answers = Array.isArray(q.answer)
              ? q.answer
              : [q.answer];

            processed.push({
              question: q.question,
              type: "input",
              answer: answers.map((x: any) => String(x)),
            });
          }
        }
      }

if (isPractice) {
  let filtered = processed;

  if (rawType === "mc") {
    filtered = processed.filter((q) => q.type === "multiple_choice");
  }

  if (rawType === "fb") {
    filtered = processed.filter((q) => q.type === "input");
  }

  return shuffle(filtered);
}

return shuffle(processed).slice(0, count);    } catch (e) {
      console.log("❌ BUILD CRASH", e);
      return [];
    }
  }, [mode, selectedTopic, count]);

  const question = questions[index];

  /* ---------------- SCORE ---------------- */

  function calculateScore() {
    let correct = 0;

    questions.forEach((q, i) => {
      const user = answers[i];

      if (q.type === "multiple_choice") {
        const correctText = q.choices[q.correctAnswer];
        if (user === correctText) correct++;
      } else {
        const correctAnswer = q.answer?.[0] ?? "";
        if (clean(user) === clean(correctAnswer)) correct++;
      }
    });

    return correct;
  }

  /* ---------------- RESULT ---------------- */

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
       onPress={() => {
  if (!isPractice) {
    setAnswers((prev: any) => ({
      ...prev,
      [index]: c,
    }));
    return;
  }

  if (showResult) return;

  setSelected(i);

  const correct = i === question.correctAnswer;
  setIsCorrect(correct);
  setShowResult(true);
}}
     style={{
  marginTop: 10,
  padding: 14,
  borderWidth: 1,
  borderColor: "#444",
  backgroundColor: (() => {
    // ✅ PRACTICE MODE COLORS
    if (isPractice) {
      if (showResult) {
        if (i === question.correctAnswer) return "#16a34a"; // green
        if (i === selected) return "#dc2626"; // red
      }

      if (selected === i) return "#334155";
      return "#1e293b";
    }

    // ✅ EXAM MODE (unchanged)
    return answers[index] === c ? "#334155" : "#1e293b";
  })(),
}}
            >
              <Text style={{ color: "white" }}>{c}</Text>
            </Pressable>
          ))}
{isPractice && showResult && (
  <View style={{ marginTop: 20 }}>
    <Text
      style={{
        color: isCorrect ? "#22c55e" : "#ef4444",
        fontSize: 18,
      }}
    >
      {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
    </Text>

    {!isCorrect && (
      <Text style={{ color: "#94a3b8", marginTop: 5 }}>
        Correct Answer:{" "}
        {question.type === "multiple_choice"
          ? question.choices[question.correctAnswer]
          : question.answer?.[0]}
      </Text>
    )}
  </View>
)}
        {/* INPUT */}
        {question.type === "input" && (
          <TextInput
          
            value={isPractice ? input : answers[index] || ""}
    onChangeText={(t) => {
  if (!isPractice) {
    setAnswers((prev: any) => ({
      ...prev,
      [index]: t,
    }));
    return;
  }

  if (showResult) return;
  setInput(t);
}}
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
  {isPractice && question.type === "input" && !showResult && (
  <Pressable
    onPress={() => {
      const correct =
        clean(input) === clean(question.answer?.[0] || "");

      setIsCorrect(correct);
      setShowResult(true);
    }}
    style={{
      marginTop: 10,
      backgroundColor: "#2563eb",
      padding: 12,
    }}
  >
    <Text style={{ color: "white", textAlign: "center" }}>
      Check Answer
    </Text>
  </Pressable>
)}

        {/* NEXT */}
        <Pressable
     onPress={() => {
  if (isPractice) {
    if (!showResult) return;

    setSelected(null);
    setInput("");
    setShowResult(false);

    setIndex((prev) =>
      prev + 1 >= questions.length ? 0 : prev + 1
    );

    return;
  }

  setIndex((prev) =>
    prev + 1 >= questions.length ? prev : prev + 1
  );
}}
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
{!isPractice && (
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
)}
      </ScrollView>
    </SafeAreaView>
  );
}