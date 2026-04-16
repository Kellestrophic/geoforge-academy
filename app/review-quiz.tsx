import { getReviewQuestions } from "@/lib/reviewStore";
import { theme } from "@/lib/theme";
import { useState } from "react";
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
  const [questions] = useState<ReviewQuestion[]>(
    getReviewQuestions()
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const question = questions[index];

  // 🔥 EMPTY STATE
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

  function handleSubmit() {
    let correct = false;

    // ✅ MULTIPLE CHOICE
    if (question.type === "multiple_choice") {
      if (selected === null) return;
      correct = selected === question.correctAnswer;
    }

    // ✅ SINGLE INPUT
    else if (question.type === "input") {
      if (!input.trim()) return;
      correct = clean(input) === clean(question.choices[0]);
    }

    // ✅ MULTI INPUT
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
          question.choices.map((choice: string, i: number) => {
            let borderColor = theme.colors.border;
            let bg = "transparent";

            if (showResult) {
              if (i === question.correctAnswer) {
                bg = "#16a34a";
                borderColor = "#16a34a";
              } else if (i === selected) {
                bg = "#dc2626";
                borderColor = "#dc2626";
              }
            } else if (selected === i) {
              bg = "#334155";
            }

            return (
              <Pressable
                key={i}
                onPress={() => !showResult && setSelected(i)}
                style={{
                  borderWidth: 2,
                  borderColor:
                    showResult && i === question.correctAnswer
                      ? "#16a34a"
                      : showResult && i === selected
                      ? "#dc2626"
                      : selected === i
                      ? "#334155"
                      : borderColor,
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
            placeholder={
              question.type === "input_multi"
                ? "Type answers (comma separated)"
                : "Type your answer"
            }
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

            {/* SHOW CORRECT FOR INPUT */}
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