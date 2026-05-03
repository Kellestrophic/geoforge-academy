import { trackActivity } from "@/lib/activity";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReviewList() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { getSupabase } = await import("@/lib/supabase");
const supabase = getSupabase();

      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) return;

      const { data: rows } = await supabase
        .from("wrong_questions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setQuestions(rows || []);
    } catch (e) {
      console.log("❌ LOAD REVIEW FAIL", e);
    }
  }

  async function removeQuestion(row: any) {
    try {
      const { getSupabase } = await import("@/lib/supabase");
const supabase = getSupabase();

      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) return;

      await supabase
        .from("wrong_questions")
        .delete()
        .eq("user_id", user.id)
        .eq("question_id", row.question_id);

      setQuestions((prev) =>
        prev.filter((q) => q.question_id !== row.question_id)
      );

      setSelectedId(null);
    } catch (e) {
      console.log("❌ DELETE FAIL", e);
    }
  }

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
        contentContainerStyle={{ padding: 20 }}
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

        {questions.map((row, i) => {
          const q = row.question;
          const isOpen = selectedId === row.id;

          return (
            <View
              key={row.id}
              style={{
                borderWidth: 2,
                borderColor: theme.colors.border,
                borderRadius: 12,
                padding: 15,
                marginBottom: 12,
              }}
            >
              <Pressable
                onPress={async () => {
                  setSelectedId(isOpen ? null : row.id);
                  if (!isOpen) await trackActivity("review", 2);
                }}
              >
                <Text style={{ color: theme.colors.text }}>
                  {q.question}
                </Text>
              </Pressable>

              {isOpen && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ color: "#22c55e" }}>
                    Correct Answer:
                  </Text>

                  <Text style={{ color: "white", marginBottom: 10 }}>
                    {q.type === "multiple_choice"
                      ? q.choices[q.correctAnswer]
                      : q.answer?.join(", ")}
                  </Text>

                  {q.explanation && (
                    <Text style={{ color: "#94a3b8", marginBottom: 10 }}>
                      {q.explanation}
                    </Text>
                  )}

                  <Pressable
                    onPress={() => removeQuestion(row)}
                    style={{
                      backgroundColor: "#ef4444",
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
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