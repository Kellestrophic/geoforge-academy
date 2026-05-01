import mineralFormulasRaw from "@/data/mineralFormulas.json";
import mineralogyFBRaw from "@/data/mineralogyFB.json";
import mineralogyMCRaw from "@/data/mineralogyMC.json";
import petrologyFBRaw from "@/data/petrologyFB.json";
import petrologyMCRaw from "@/data/petrologyMC.json";
import sedimentologyFBRaw from "@/data/sedimentologyFB.json";
import sedimentologyMCRaw from "@/data/sedimentologyMC.json";

const mineralFormulas = mineralFormulasRaw as any[];
const mineralogyFB = mineralogyFBRaw as any[];
const mineralogyMC = mineralogyMCRaw as any[];
const petrologyFB = petrologyFBRaw as any[];
const petrologyMC = petrologyMCRaw as any[];
const sedimentologyFB = sedimentologyFBRaw as any[];
const sedimentologyMC = sedimentologyMCRaw as any[];

import { theme } from "@/lib/theme";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function clean(str: string) {
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function shuffle(arr: any[]) {
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

 const questions = useMemo(() => {
  try {
    const topicMap: Record<string, any[]> = {
      Mineralogy: [...mineralogyMC, ...mineralogyFB],
      Petrology: [...petrologyMC, ...petrologyFB],
      Sedimentology: [...sedimentologyMC, ...sedimentologyFB],
      Formulas: [...mineralFormulas],
    };

    const processed: any[] = [];

    // 🔥 LOOP BY TOPIC
    for (const topic in topicMap) {
      const list = topicMap[topic];

      for (const q of list) {
        if (!q || typeof q.question !== "string") continue;

        // MULTIPLE CHOICE
        if (q.type === "multiple_choice" && Array.isArray(q.choices)) {
          const choices = q.choices.map((c: any) => String(c));
          if (choices.length === 0) continue;

          const correctIndex =
            typeof q.correctAnswer === "number" ? q.correctAnswer : 0;

          const correctText = choices[correctIndex] || choices[0];
          const shuffled = shuffle(choices);
          const newIndex = shuffled.indexOf(correctText);

          processed.push({
            question: q.question,
            type: "multiple_choice",
            choices: shuffled,
            correctAnswer: newIndex >= 0 ? newIndex : 0,
            topic, // ✅ ADD THIS
          });

          continue;
        }

        // INPUT
        if (q.answer !== undefined && q.answer !== null) {
          const answers = Array.isArray(q.answer)
            ? q.answer
            : [q.answer];

          const safe = answers.map((x: any) => String(x));
          if (safe.length === 0) continue;

          processed.push({
            question: q.question,
            type: "input",
            choices: safe,
            topic, // ✅ ADD THIS
          });
        }
      }
    }

    return shuffle(processed);
  } catch (e) {
    console.log("❌ build crash", e);
    return [];
  }
}, []);
  const question = questions[index];

  if (!question) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: theme.colors.text }}>
            No questions loaded
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text, fontSize: 20 }}>
          {question.question}
        </Text>

        {/* INPUT */}
        {question.type === "input" && (
          <TextInput
            value={input}
            onChangeText={(t) => !showResult && setInput(t)}
            placeholder="Type answer"
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

        {/* MC */}
        {question.type === "multiple_choice" &&
          question.choices.map((c: string, i: number) => {
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

        {/* BUTTON */}
        <Pressable
          onPress={() => {
            if (!showResult) {
              let correct = false;

              if (question.type === "multiple_choice") {
                if (selected === null) return;
                correct = selected === question.correctAnswer;
              } else {
                correct =
                  clean(input) === clean(question.choices[0] || "");
              }

              setIsCorrect(correct);
              setShowResult(true);
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