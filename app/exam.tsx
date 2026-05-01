import questionsData from "@/data/questions.json";
import { theme } from "@/lib/theme";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const mineralogyFB = require("../data/mineralogyFB.json");
const mineralogyMC = require("../data/mineralogyMC.json");
const petrologyFB = require("../data/petrologyFB.json");
const petrologyMC = require("../data/petrologyMC.json");
const sedimentologyMC = require("../data/sedimentologyMC.json");
const sedimentologyFB = require("../data/sedimentologyFB.json");
const mineralFormulas = require("../data/mineralFormulas.json");

function unwrap(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.default)) return data.default;
  if (Array.isArray(data?.questions)) return data.questions;
  if (Array.isArray(data?.default?.questions)) return data.default.questions;
  return [];
}

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function clean(str: any) {
  return String(str ?? "").toLowerCase().trim();
}

function normalizeQuestion(q: any) {
  if (!q || typeof q.question !== "string") return null;

  if (
    (q.type === "multiple_choice" || q.type === "formula") &&
    Array.isArray(q.choices)
  ) {
    return {
      question: q.question,
      type: "multiple_choice",
      choices: q.choices.map(String),
      correctAnswer:
        typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
      explanation: q.explanation ?? "",
    };
  }

  if (q.answer !== undefined && q.answer !== null) {
    return {
      question: q.question,
      type: q.type === "input_multi" ? "input_multi" : "input",
      answer: q.answer,
      explanation: q.explanation ?? "",
    };
  }

  return null;
}

export default function ExamScreen() {
  const params = useLocalSearchParams();

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

  useEffect(() => {
    try {
      const topicMap: Record<string, any[]> = {
        Mineralogy: [...unwrap(mineralogyMC), ...unwrap(mineralogyFB)],
        Petrology: [...unwrap(petrologyMC), ...unwrap(petrologyFB)],
        Sedimentology: [...unwrap(sedimentologyMC), ...unwrap(sedimentologyFB)],
        "Mineral Formulas": [...unwrap(mineralFormulas)],
        MineralFormulas: [...unwrap(mineralFormulas)],
      };

      let pool: any[] = [];

      if (mode === "pg") {
        pool = unwrap(questionsData);
      } else if (mode === "topic" && selectedTopic) {
        pool = topicMap[String(selectedTopic)] ?? [];
      } else {
        pool = Object.values(topicMap).flat();
      }

      const safeQuestions = pool
        .map(normalizeQuestion)
        .filter(Boolean);

      setQuestions(shuffleArray(safeQuestions).slice(0, count));
      setCurrentIndex(0);
      setAnswers({});
      setFinished(false);
    } catch (e) {
      console.log("LOAD EXAM ERROR:", e);
      setQuestions([]);
    }
  }, [mode, selectedTopic, count]);

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

  function calculateScore() {
    return questions.reduce((acc, q, i) => {
      const userAnswer = answers[i];

      if (q.type === "multiple_choice") {
        return userAnswer === q.correctAnswer ? acc + 1 : acc;
      }

      if (q.type === "input") {
        return clean(userAnswer) === clean(q.answer) ? acc + 1 : acc;
      }

      if (q.type === "input_multi") {
        const correct = Array.isArray(q.answer)
          ? q.answer.map(clean)
          : [clean(q.answer)];

        const user = Array.isArray(userAnswer)
          ? userAnswer.map(clean)
          : [];

        const isCorrect =
          correct.length === user.length &&
          correct.every((c: string) => user.includes(c));

        return isCorrect ? acc + 1 : acc;
      }

      return acc;
    }, 0);
  }

  function goNext() {
    setInputAnswer("");
    setCurrentIndex((prev) => {
      if (prev + 1 >= questions.length) return prev;
      return prev + 1;
    });
  }

  if (questions.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.colors.text }}>Loading Exam...</Text>
      </View>
    );
  }

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

  const question = questions[currentIndex];

  if (!question) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.colors.text }}>Loading question...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ color: theme.colors.subtext }}>
        Time Left: {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, "0")}
      </Text>

      <Text style={{ color: theme.colors.text, marginTop: 10 }}>
        Question {currentIndex + 1} / {questions.length}
      </Text>

      <Text style={{ marginTop: 20, color: theme.colors.text, fontSize: 18 }}>
        {question.question}
      </Text>

      {question.type === "multiple_choice" &&
        question.choices.map((choice: string, index: number) => {
          const isSelected = answers[currentIndex] === index;

          return (
            <Pressable
              key={`${choice}-${index}`}
              onPress={() =>
                setAnswers((prev) => ({
                  ...prev,
                  [currentIndex]: index,
                }))
              }
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

      {(question.type === "input" || question.type === "input_multi") && (
        <View style={{ marginTop: 20 }}>
          <TextInput
            value={inputAnswer}
            onChangeText={setInputAnswer}
            placeholder={
              question.type === "input_multi"
                ? "Comma separated answers"
                : "Type your answer..."
            }
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
              const finalAnswer =
                question.type === "input_multi"
                  ? inputAnswer.split(",").map((s) => s.trim()).filter(Boolean)
                  : inputAnswer;

              setAnswers((prev) => ({
                ...prev,
                [currentIndex]: finalAnswer,
              }));

              goNext();
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

      <Pressable
        onPress={goNext}
        style={{
          marginTop: 20,
          backgroundColor: "#1e293b",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Next</Text>
      </Pressable>

      <Pressable
        onPress={() => setFinished(true)}
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