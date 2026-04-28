import mineralFormulas from "@/data/mineralFormulas.json";
import mineralogyFB from "@/data/mineralogyFB.json";
import mineralogyMC from "@/data/mineralogyMC.json";
import petrologyFB from "@/data/petrologyFB.json";
import petrologyMC from "@/data/petrologyMC.json";
import sedimentologyFB from "@/data/sedimentologyFB.json";
import sedimentologyMC from "@/data/sedimentologyMC.json";
import { trackActivity } from "@/lib/activity";
import { saveWrongQuestion } from "@/lib/review";
import { theme } from "@/lib/theme";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Question = {
  question: string;
  choices: string[];
  correctAnswer?: number;
  type?: "multiple_choice" | "input" | "input_multi";
  explanation?: string; // ✅ ADD THIS
};

function clean(str: string) {
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function PracticeScreen() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
const params = useLocalSearchParams();

const mode = Array.isArray(params.mode)
  ? params.mode[0]
  : params.mode;
const questions: Question[] = useMemo(() => {
  try {
    const all = [
      ...(mineralogyMC as any[]),
      ...(mineralogyFB as any[]),
      ...(petrologyMC as any[]),
      ...(petrologyFB as any[]),
      ...(mineralFormulas as any[]),
      ...(sedimentologyMC as any[]),
      ...(sedimentologyFB as any[]),
    ];

    return shuffleArray(
      all
        .map((q) => {
          // ✅ MULTIPLE CHOICE (unchanged logic)
          if (
            q.type === "multiple_choice" &&
            Array.isArray(q.choices)
          ) {
            const choices = shuffleArray([...q.choices]);

            const correctText = q.choices[q.correctAnswer ?? 0];
            const newIndex = choices.indexOf(correctText);

            return {
              ...q,
              type: "multiple_choice",
              choices,
              correctAnswer: newIndex >= 0 ? newIndex : 0,
            };
          }

          // ✅ FIX: convert answer → choices
          if (q.answer) {
            const answers = Array.isArray(q.answer)
              ? q.answer
              : [q.answer];

            return {
              ...q,
              type:
                q.type === "input_multi"
                  ? "input_multi"
                  : "input",
              choices: answers.map(String),
            };
          }

          return null;
        })
        .filter(
          (q): q is Question =>
            !!q &&
            q.question &&
            Array.isArray(q.choices) &&
            q.choices.length > 0
        )
    );
  } catch (e) {
    console.log("❌ build crash", e);
    return [];
  }
}, []);

  const question = questions[index];

  if (!question) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={{ color: "white" }}>Loading...</Text>
      </SafeAreaView>
    );
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
        <Text style={{ color: theme.colors.text, fontSize: 20 }}>
          {question.question}
        </Text>

        {/* INPUT */}
        {(question.type === "input" ||
          question.type === "input_multi") && (
          <TextInput
            value={input}
            onChangeText={(t) => !showResult && setInput(t)}
            placeholder={
              question.type === "input_multi"
                ? "Comma separated answers"
                : "Type your answer"
            }
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

        {/* MULTIPLE CHOICE */}
        {question.type === "multiple_choice" &&
          question.choices.map((c, i) => {
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
                  padding: 14,
                  marginTop: 10,
                  borderWidth: 1,
                  borderColor: "#444",
                  backgroundColor: bg,
                }}
              >
                <Text style={{ color: theme.colors.text }}>{c}</Text>
              </Pressable>
            );
          })}

        {/* RESULT */}
        {showResult && (
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                color: isCorrect ? "#22c55e" : "#ef4444",
                fontSize: 18,
              }}
            >
              {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
            </Text>

            {question.type !== "multiple_choice" && (
              <Text style={{ color: theme.colors.text, marginTop: 10 }}>
                Correct Answer: {question.choices.join(", ")}
              </Text>
            )}
          </View>
        )}
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

    {/* ✅ SHOW CORRECT FOR INPUT */}
    {question.type !== "multiple_choice" && (
      <Text style={{ color: theme.colors.text, marginBottom: 10 }}>
        Correct Answer: {question.choices.join(", ")}
      </Text>
    )}

    {/* ✅ EXPLANATION (SAFE) */}
    {!!question.explanation && (
      <Text style={{ color: theme.colors.subtext }}>
        {question.explanation}
      </Text>
    )}
  </View>
)}
        {/* BUTTON */}
        <Pressable
          onPress={async () => {
            if (!showResult) {
              let correct = false;

              if (question.type === "multiple_choice") {
                if (selected === null) return;
                correct = selected === question.correctAnswer;
              }

              else if (question.type === "input") {
                const answer = question.choices[0];
                correct = clean(input) === clean(answer);
              }

              else if (question.type === "input_multi") {
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
try {
  if (!correct) {
    await saveWrongQuestion(question);
  }
} catch (e) {
  console.log("❌ saveWrongQuestion crash prevented", e);
}

try {
  await trackActivity("practice");
} catch (e) {
  console.log("❌ trackActivity crash prevented", e);
}
            } else {
              setSelected(null);
              setInput("");
              setShowResult(false);

              setIndex((prev) =>
                prev + 1 >= questions.length ? 0 : prev + 1
              );
            }
          }}
          style={{
            marginTop: 20,
            backgroundColor: "#2563eb",
            padding: 14,
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