import { trackActivity } from "@/lib/activity";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------- TYPES ---------------- */

type WrongRow = {
  id: string;
  question_id: string;
  question: any;
};

/* ---------------- SCREEN ---------------- */

export default function ReviewQuiz() {
  const [questions, setQuestions] = useState<any[]>([]);
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
     const { getSupabase } = await import("@/lib/supabase");
const supabase = getSupabase();

      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        console.log("❌ NO USER");
        return;
      }

      const { data: rows, error } = await supabase
        .from("wrong_questions")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.log("❌ LOAD ERROR", error);
        return;
      }

      const safe = (rows as WrongRow[]) || [];

      setQuestions(safe.map((r) => r.question));
    } catch (e) {
      console.log("❌ LOAD QUIZ FAIL", e);
    }
  }

  const question = questions[index];

  /* ---------------- EMPTY ---------------- */

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

  /* ---------------- HELPERS ---------------- */

  function clean(str: string) {
    return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  /* ---------------- SUBMIT ---------------- */

  async function handleSubmit() {
    let correct = false;

    // MULTIPLE CHOICE
    if (question.type === "multiple_choice") {
      if (selected === null) return;
      correct = selected === question.correctAnswer;
    }

    // INPUT
    else {
      if (!input.trim()) return;
      correct =
        clean(input) === clean(question.answer?.[0] || "");
    }

    setIsCorrect(correct);
    setShowResult(true);

    await trackActivity("review", 3);
  }

  /* ---------------- NEXT ---------------- */

  function next() {
    setSelected(null);
    setInput("");
    setShowResult(false);

    setIndex((prev) =>
      prev + 1 >= questions.length ? 0 : prev + 1
    );
  }

  /* ---------------- UI ---------------- */

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
            color: theme.colors.text,
            fontSize: 18,
            marginBottom: 20,
          }}
        >
          {question.question}
        </Text>

        {/* MULTIPLE CHOICE */}
        {question.type === "multiple_choice" &&
          question.choices.map((c: string, i: number) => (
            <Pressable
              key={i}
              onPress={() => !showResult && setSelected(i)}
              style={{
                padding: 14,
                borderWidth: 2,
                borderRadius: 10,
                marginBottom: 10,
                borderColor:
                  showResult && i === question.correctAnswer
                    ? "#16a34a"
                    : showResult && i === selected
                    ? "#dc2626"
                    : "#444",
                backgroundColor:
                  selected === i ? "#334155" : "transparent",
              }}
            >
              <Text style={{ color: "white" }}>{c}</Text>
            </Pressable>
          ))}

        {/* INPUT */}
        {question.type !== "multiple_choice" && (
          <TextInput
            value={input}
            onChangeText={(t) => !showResult && setInput(t)}
            placeholder="Type answer"
            placeholderTextColor="#94a3b8"
            style={{
              borderWidth: 2,
              borderColor: "#444",
              padding: 14,
              borderRadius: 10,
              marginBottom: 20,
              color: theme.colors.text,
            }}
          />
        )}

        {/* RESULT */}
        {showResult && (
          <View style={{ marginTop: 10 }}>
            <Text
              style={{
                color: isCorrect ? "#22c55e" : "#ef4444",
                fontSize: 18,
                marginBottom: 10,
              }}
            >
              {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
            </Text>

            {/* SHOW CORRECT FOR INPUT */}
            {question.type !== "multiple_choice" && (
              <Text style={{ color: "white", marginBottom: 10 }}>
                Correct Answer: {question.answer?.join(", ")}
              </Text>
            )}
          </View>
        )}

        {/* BUTTON */}
        <Pressable
          onPress={showResult ? next : handleSubmit}
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