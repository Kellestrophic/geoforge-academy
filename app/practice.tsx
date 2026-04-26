import mineralFormulas from "@/data/mineralFormulas.json";
import mineralogyFB from "@/data/mineralogyFB.json";
import mineralogyMC from "@/data/mineralogyMC.json";
import petrologyFB from "@/data/petrologyFB.json";
import petrologyMC from "@/data/petrologyMC.json";
import sedimentologyFB from "@/data/sedimentologyFB.json";
import sedimentologyMC from "@/data/sedimentologyMC.json";
import { theme } from "@/lib/theme";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Question = {
  question: string;
  choices: string[];
  correctAnswer: number;
};

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

  // 🔥 NEW
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const questions: Question[] = useMemo(() => {
    try {
      const all = [
        ...(mineralogyMC as Question[]),
        ...(mineralogyFB as any[]),
        ...(petrologyMC as any[]),
        ...(petrologyFB as any[]),
        ...(mineralFormulas as any[]),
        ...(sedimentologyMC as any[]),
        ...(sedimentologyFB as any[]),
      ];

    return shuffleArray(
  all
    .filter(
      (q) =>
        q &&
        q.question &&
        Array.isArray(q.choices) &&
        q.choices.length > 0
    )
    .map((q) => {
      // 🔥 shuffle choices safely
      const choices = shuffleArray([...q.choices]);

      const correctText = q.choices[q.correctAnswer];
      const newIndex = choices.indexOf(correctText);

      return {
        ...q,
        choices,
        correctAnswer: newIndex,
      };
    })
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

        {/* 🔥 UPDATED CHOICES */}
        {question.choices.map((c, i) => {
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

        {/* 🔥 RESULT TEXT */}
        {showResult && (
          <Text
            style={{
              marginTop: 20,
              color: isCorrect ? "#22c55e" : "#ef4444",
              fontSize: 18,
            }}
          >
            {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
          </Text>
        )}

        {/* 🔥 UPDATED BUTTON */}
        <Pressable
          onPress={() => {
            if (!showResult) {
              if (selected === null) return;

              const correct = selected === question.correctAnswer;
              setIsCorrect(correct);
              setShowResult(true);
            } else {
              setSelected(null);
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