import questionsData from "@/data/questions.json";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

/* ---------------- HELPERS ---------------- */

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

/* ---------------- SCREEN ---------------- */

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

  /* ---------------- LOAD QUESTIONS ---------------- */

  useEffect(() => {
    let pool = questionsData;

    if (mode === "topic" && selectedTopic) {
      pool = questionsData.filter(
        (q: any) =>
          q.category === selectedTopic ||
          (q.subcategory && q.subcategory.includes(selectedTopic))
      );
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

  /* ---------------- SAVE RESULT (FIXED) ---------------- */

  useEffect(() => {
    if (!finished || questions.length === 0) return;

    async function saveResult() {
      const score = questions.reduce((acc, q, i) => {
        return answers[i] === q.correctAnswer ? acc + 1 : acc;
      }, 0);

      const percent = Math.round((score / questions.length) * 100);
      const now = new Date();

      /* GET USER */

      let userId: string | null = null;

      try {
        const response = await supabase.auth.getUser();
        if (response?.data?.user?.id) {
          userId = response.data.user.id;
        }
      } catch (e) {
        console.log("getUser crash prevented:", e);
      }

      if (!userId) {
        console.log("NO USER — EXAM NOT SAVED");
        return;
      }

      /* SAVE EXAM */

      const { error } = await supabase.from("exam_history").insert({
        user_id: userId,
        score: percent,
        date: now.toISOString(),
        type: mode || "random",
      });

      if (error) {
        console.log("SAVE FAILED:", error);
      } else {
        console.log("EXAM SAVED:", {
          score: percent,
          type: mode,
        });
      }
    }

    saveResult();
  }, [finished]);

  /* ---------------- UI ---------------- */

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

  function calculateScore() {
    return questions.reduce((acc, q, i) => {
      return answers[i] === q.correctAnswer ? acc + 1 : acc;
    }, 0);
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