import { requirePro } from "@/lib/pro";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
export default function ReviewQuiz() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const tapLock = useRef(false);

 useEffect(() => {
  async function loadQuestions() {
let userId = null;

try {
  const response = await supabase.auth.getUser();
  userId = response?.data?.user?.id ?? null;
} catch (e) {
  console.log("🚨 getUser crash prevented:", e);
}

if (!userId) return;

    if (!userId) return;

    const { data } = await supabase
      .from("review_questions")
      .select("*")
      .eq("user_id", userId);

    if (data) {
      setQuestions(data.map((q) => q.question));
    }
  }

  loadQuestions();
}, []);
  if (questions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" }}>
        <Text style={{ color: "white" }}>Nothing to review 🎉</Text>
      </View>
    );
  }
useEffect(() => {
  requirePro();
}, []);
  const question = questions[currentIndex];

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#0f172a" }}>

      <Text style={{ color: "#94a3b8" }}>
        Review Quiz
      </Text>

      <Text style={{ color: "white", fontSize: 20, marginTop: 10 }}>
        {question.question}
      </Text>

      {question.choices.map((choice: string, index: number) => {
        const isCorrect = index === question.correctAnswer;
        const isSelected = selected === index;

        let bg = "#1e293b";

        if (showAnswer) {
          if (isCorrect) bg = "#22c55e";
          else if (isSelected) bg = "#ef4444";
        }

        return (
         <Pressable
  key={index}
  disabled={showAnswer}
          onPress={() => {
  if (showAnswer) return;
  setSelected(index);
}}
            style={{
              backgroundColor: bg,
              padding: 15,
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <Text style={{ color: "white" }}>{choice}</Text>
          </Pressable>
        );
      })}

      {!showAnswer ? (
        <Pressable
          onPress={() => setShowAnswer(true)}
          style={{
            marginTop: 20,
            backgroundColor: "#222",
            padding: 15,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Submit
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => {
            setSelected(null);
            setShowAnswer(false);
            setCurrentIndex((prev) =>
              prev + 1 >= questions.length ? 0 : prev + 1
            );
          }}
          style={{
            marginTop: 20,
            backgroundColor: "#4CAF50",
            padding: 15,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Next
          </Text>
        </Pressable>
      )}

    </View>
  );
}