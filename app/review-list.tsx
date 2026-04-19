import { trackActivity } from "@/lib/activity";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type ReviewQuestion = {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
  type: "multiple_choice" | "input" | "input_multi";
};

export default function ReviewList() {
const [questions, setQuestions] = useState<ReviewQuestion[]>([]);

useEffect(() => {
  load();
}, []);

async function load() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;

  const { data } = await supabase
    .from("wrong_questions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  setQuestions(data?.map((q) => q.question) || []);
}

  const [selectedId, setSelectedId] = useState<string | null>(null);

async function removeQuestion(id: string) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;

  await supabase
    .from("wrong_questions")
    .delete()
    .eq("user_id", user.id)
    .eq("question_id", id);

  // update UI
  setQuestions((prev) => prev.filter((q) => q.id !== id));
  setSelectedId(null);
}

  // ✅ EMPTY STATE
  if (questions.length === 0) {
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
            Nothing to review 🎉
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          Study Answers
        </Text>

        {questions.map((q) => {
          const isOpen = selectedId === q.id;

          return (
            <View
              key={q.id}
              style={{
                borderWidth: 2,
                borderColor: theme.colors.border,
                borderRadius: 12,
                padding: 15,
                marginBottom: 12,
              }}
            >
              {/* QUESTION HEADER */}
          <Pressable
  onPress={async () => {
    setSelectedId(isOpen ? null : q.id);

    if (!isOpen) {
      await trackActivity("review", 2);
    }
  }}
>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 16,
                  }}
                >
                  {q.question}
                </Text>
              </Pressable>

              {/* EXPANDED VIEW */}
              {isOpen && (
                <View style={{ marginTop: 10 }}>
                  {/* CORRECT ANSWER */}
                  <Text
                    style={{
                      color: "#22c55e",
                      marginBottom: 5,
                    }}
                  >
                    Correct Answer:
                  </Text>

                  <Text
                    style={{
                      color: theme.colors.text,
                      marginBottom: 10,
                    }}
                  >
                    {q.type === "multiple_choice"
                      ? q.choices[q.correctAnswer]
                      : q.choices.join(", ")}
                  </Text>

                  {/* EXPLANATION */}
                  <Text
                    style={{
                      color: theme.colors.subtext,
                      marginBottom: 12,
                    }}
                  >
                    {q.explanation}
                  </Text>

                  {/* REMOVE BUTTON */}
                  <Pressable
                    onPress={() => removeQuestion(q.id)}
                    style={{
                      backgroundColor: "#ef4444",
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      Mark as Learned
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}