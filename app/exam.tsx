import { useUser } from "@/context/UserContext";
import mineralogyFB from "@/data/mineralogyFB.json";
import mineralogyMC from "@/data/mineralogyMC.json";
import petrologyFB from "@/data/petrologyFB.json";
import petrologyMC from "@/data/petrologyMC.json";
import questionsData from "@/data/questions.json";
import { theme } from "@/lib/theme";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

/* ---------------- HELPERS ---------------- */

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

/* ---------------- SCREEN ---------------- */

export default function ExamScreen() {
  const params = useLocalSearchParams();
  const { addExam } = useUser();

  const [saved, setSaved] = useState(false);

  const TOPIC_QUESTIONS: Record<string, { mc: any[]; fb: any[] }> = {
    Mineralogy: { mc: mineralogyMC, fb: mineralogyFB },
    Petrology: { mc: petrologyMC, fb: petrologyFB },
  };

  const count = Number(params.count) || 20;
  const timeLimit = Number(params.time) || 30;

  const mode =
    typeof params.mode === "string"
      ? params.mode
      : Array.isArray(params.mode)
      ? params.mode[0]
      : "random";

  const selectedTopic = Array.isArray(params.topic)
    ? params.topic[0]
    : params.topic;

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [finished, setFinished] = useState(false);
  const [inputAnswer, setInputAnswer] = useState("");

  /* ---------------- LOAD QUESTIONS ---------------- */

  useEffect(() => {
    let pool: any[] = [];

    if (mode === "pg") {
      pool = questionsData;
    } else if (mode === "random") {
      pool = [
        ...mineralogyMC,
        ...mineralogyFB,
        ...petrologyMC,
        ...petrologyFB,
      ];
    } else if (mode === "topic" && selectedTopic) {
      const topicData = TOPIC_QUESTIONS[selectedTopic];
      pool = topicData ? [...topicData.mc, ...topicData.fb] : [];
    }

    const shuffled = shuffleArray(pool).slice(0, count);
    setQuestions(shuffled);
  }, [mode, selectedTopic, count]);

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
        return String(userAnswer)?.toLowerCase().trim() ===
          String(q.answer).toLowerCase().trim()
          ? acc + 1
          : acc;
      }

      if (q.type === "input_multi") {
        const correct = q.answer.map((a: string) =>
          a.toLowerCase().trim()
        );

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

  /* ---------------- SAVE RESULT (SAFE) ---------------- */

  useEffect(() => {
    if (!finished || saved) return;

    const score = calculateScore();
    const percent = Math.round((score / questions.length) * 100);

    const rawMode = Array.isArray(params?.mode)
      ? params.mode[0]
      : params?.mode;

    const safeMode: "random" | "topic" | "pg" =
      rawMode === "topic" || rawMode === "pg" ? rawMode : "random";

    addExam({
      score: percent,
      type: safeMode,
    });

    setSaved(true);
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

      {/* MULTIPLE CHOICE */}
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

      {/* INPUT */}
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

      {/* MULTI INPUT */}
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

      {/* NAV */}
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