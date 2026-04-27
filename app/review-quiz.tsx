import { trackActivity } from "@/lib/activity";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ReviewQuestion = {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
  type: "multiple_choice" | "input" | "input_multi";
};

export default function ReviewQuiz() {
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { data } = await supabase
        .from("wrong_questions")
        .select("*")
        .eq("user_id", user.id);

      if (!data) return;

      // 🔥 FIX: map FULL OBJECT
      const formatted: ReviewQuestion[] = data.map((q: any) => ({
        id: q.id,
        question: q.question,
        choices: Array.isArray(q.choices) ? q.choices : [],
        correctAnswer: q.correct_answer ?? 0,
        explanation: q.explanation ?? "",
        type: q.type ?? "multiple_choice",
      }));

      setQuestions(formatted);
    } catch (e) {
      console.log("❌ load review quiz", e);
    }
  }

  const question = questions[index] ?? null;

  // EMPTY STATE
  if (!question) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.background,
          }}
        >
          <Text style={{ color: theme.colors.text }}>
            No review questions yet 🎉
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  function clean(str: string) {
    return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  async function handleSubmit() {
    let correct = false;

    if (question.type === "multiple_choice") {
      if (selected === null) return;
      correct = selected === question.correctAnswer;
    }

    else if (question.type === "input") {
      if (!input.trim()) return;
      correct = clean(input) === clean(question.choices[0]);
    }

    else if (question.type === "input_multi") {
      if (!input.trim()) return;

      const userParts = input
        .split(/,|and/gi)
        .map((x) => clean(x))
        .filter(Boolean);

      const correctParts = question.choices.map((x) =>
        clean(x)
      );

      correct =
        correctParts.length === userParts.length &&
        correctParts.every((ans) =>
          userParts.includes(ans)
        );
    }

    setIsCorrect(correct);
    setShowResult(true);

    await trackActivity("review", 3);
  }

  function nextQuestion() {
    setSelected(null);
    setInput("");
    setShowResult(false);
    setIndex((prev) => (prev + 1) % questions.length);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: theme.colors.background,
        }}
      >
        {/* QUESTION */}
        <Text
          style={{
            fontSize: 18,
            marginBottom: 20,
            color: theme.colors.text,
          }}
        >
          {question.question}
        </Text>

        {/* MULTIPLE CHOICE */}
        {question.type === "multiple_choice" &&
          question.choices.map((choice, i) => {
            let bg = "transparent";

            if (showResult) {
              if (i === question.correctAnswer) bg = "#16a34a";
              else if (i === selected) bg = "#dc2626";
            } else if (selected === i) {
              bg = "#334155";
            }

            return (
              <Pressable
                key={i}
                onPress={() => !showResult && setSelected(i)}
                style={{
                  borderWidth: 2,
                  borderColor: "#444",
                  padding: 14,
                  borderRadius: 10,
                  marginBottom: 10,
                  backgroundColor: bg,
                }}
              >
                <Text style={{ color: theme.colors.text }}>
                  {choice}
                </Text>
              </Pressable>
            );
          })}

        {/* INPUT */}
        {(question.type === "input" ||
          question.type === "input_multi") && (
          <TextInput
            value={input}
            onChangeText={(text) =>
              !showResult && setInput(text)
            }
            placeholder="Type your answer"
            placeholderTextColor="#94a3b8"
            style={{
              borderWidth: 2,
              borderColor: theme.colors.border,
              padding: 14,
              borderRadius: 10,
              marginBottom: 20,
              color: theme.colors.text,
            }}
          />
        )}

        {/* RESULT */}
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

            {question.type !== "multiple_choice" && (
              <Text
                style={{
                  color: theme.colors.text,
                  marginBottom: 10,
                }}
              >
                Correct Answer: {question.choices.join(", ")}
              </Text>
            )}

            <Text style={{ color: theme.colors.subtext }}>
              {question.explanation}
            </Text>
          </View>
        )}

        {/* BUTTON */}
        <Pressable
          onPress={showResult ? nextQuestion : handleSubmit}
          disabled={
            !showResult &&
            (question.type === "multiple_choice"
              ? selected === null
              : !input.trim())
          }
          style={{
            backgroundColor: "#2563eb",
            padding: 14,
            borderRadius: 10,
            marginTop: 20,
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