import questionsData from "@/data/questions.json";
import { theme } from "@/lib/theme";
import type { TopicKey } from "@/lib/topics";
import { TOPIC_FILES } from "@/lib/topics";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
type Question = {
  id: string;
  question: string;
  choices?: string[];
  correctAnswer?: number;
  answer?: string;
  type?: string;
  category: string;
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function ExamScreen() {
  console.log("✅ EXAM ENGINE LOADED");

  const params = useLocalSearchParams();

  const mode = Array.isArray(params.mode)
    ? params.mode[0]
    : params.mode;



const selectedTopic = (Array.isArray(params.topic)
  ? params.topic[0]
  : params.topic) as TopicKey | undefined;

  const count = Number(params.count) || 20;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [finished, setFinished] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    let pool: Question[] = [];

    // ✅ PG MODE
    if (mode === "pg") {
      pool = questionsData as Question[];
    } else {
      let mc: Question[] = [];
      let fb: Question[] = [];

      // ✅ TOPIC MODE
      if (mode === "topic" && selectedTopic) {
      const topicData = selectedTopic
  ? TOPIC_FILES[selectedTopic]
  : undefined;

        if (topicData) {
          mc = topicData.mc;
          fb = topicData.fb;
        } else {
          console.log("❌ Unknown topic:", selectedTopic);
        }
      } else {
        // ✅ RANDOM MODE (ALL TOPICS)
        Object.values(TOPIC_FILES).forEach((t) => {
          mc.push(...t.mc);
          fb.push(...t.fb);
        });
      }

      pool = [...mc, ...fb];
    }

    console.log("MODE:", mode);
    console.log("TOPIC:", selectedTopic);
    console.log("POOL SIZE:", pool.length);

    const clean = pool.filter(
      (q) =>
        (q.choices && q.choices.length > 0) ||
        q.type === "fill_blank"
    );

    setQuestions(shuffle(clean).slice(0, count));
  }, [mode, selectedTopic]);

  if (questions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: theme.colors.text }}>Loading Exam...</Text>
      </View>
    );
  }

  const q = questions[current];

  function selectAnswer(index: number) {
    setAnswers((prev) => ({
      ...prev,
      [current]: index,
    }));
  }

  function submitInput() {
    if (!input.trim()) return;

    setAnswers((prev) => ({
      ...prev,
      [current]: input,
    }));

    setInput("");
  }

  function next() {
    if (current + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setCurrent((prev) => prev + 1);
  }

  function getScore() {
    return questions.reduce((acc, q, i) => {
      if (q.type === "fill_blank") {
        return answers[i]?.toLowerCase()?.trim() ===
          q.answer?.toLowerCase()?.trim()
          ? acc + 1
          : acc;
      } else {
        return answers[i] === q.correctAnswer ? acc + 1 : acc;
      }
    }, 0);
  }

  if (finished) {
    const score = getScore();

    return (
      <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
        <Text style={{ color: theme.colors.text, fontSize: 26 }}>
          Exam Complete
        </Text>

        <Text style={{ marginTop: 20, color: theme.colors.text }}>
          Score: {score} / {questions.length}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ color: theme.colors.text }}>
        Question {current + 1} / {questions.length}
      </Text>

      <Text style={{ marginTop: 20, color: theme.colors.text }}>
        {q.question}
      </Text>

      {/* ✅ MULTIPLE CHOICE */}
      {q.type !== "fill_blank" &&
        q.choices?.map((choice, index) => {
          const selected = answers[current] === index;

          return (
            <Pressable
              key={index}
              onPress={() => selectAnswer(index)}
              style={{
                marginTop: 10,
                padding: 15,
                borderRadius: 10,
                backgroundColor: selected ? "#4CAF50" : "#1e293b",
              }}
            >
              <Text style={{ color: "white" }}>{choice}</Text>
            </Pressable>
          );
        })}

      {/* ✅ FILL IN THE BLANK */}
      {q.type === "fill_blank" && (
        <>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your answer"
            placeholderTextColor="#94a3b8"
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
            onPress={submitInput}
            style={{
              marginTop: 10,
              backgroundColor: "#0ea5e9",
              padding: 15,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Submit Answer
            </Text>
          </Pressable>
        </>
      )}

      <Pressable
        onPress={next}
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