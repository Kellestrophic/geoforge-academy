import questionsData from "@/data/questions.json";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { getSafeQuestions } from "@/utils/safeQuestions";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useUser } from "../context/UserContext";
async function getUserIdSafe() {
  if (!supabase) return null;

  try {
    const res = await supabase.auth.getUser();
    return res?.data?.user?.id ?? null;
  } catch {
    return null;
  }
}
console.log("SCREEN: Practice loaded");
function expandMatchQuestions(allQuestions: any[]) {
  const result: any[] = [];

  allQuestions.forEach((question) => {
    if (question.type !== "match") {
      result.push(question);
      return;
    }

    const allMatches = allQuestions
      .filter((q) => q.type === "match")
      .flatMap((q) => q.matchPairs || [])
      .map((p: any) => p.match);

    question.matchPairs?.forEach((pair: any, index: number) => {
      const correct = pair.match;

      const wrongOptions = allMatches
        .filter((m: string) => m !== correct)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const choices = [...wrongOptions, correct].sort(
        () => Math.random() - 0.5
      );
result.push({
  id: String(question.id ?? "") + "_match_" + index,
  type: "multiple_choice",
  category: String(question.category ?? ""),
  question: typeof pair.term === "string" ? pair.term : "",
  choices: Array.isArray(choices) ? choices : [],
  correctAnswer: choices.indexOf(correct),
});
    });
  });

  return result;
  
}
function generateSmartChoices(question: any, allQuestions: any[]) {
 if (
  question.type !== "multiple_choice" &&
  question.type !== "formula"
) return question;

  if (
    question.correctAnswer === undefined ||
    !question.choices ||
    !question.choices.length ||
    !question.choices[question.correctAnswer]
  ) {
    console.log("BAD QUESTION:", question);
    return question; // 🚨 DO NOT MODIFY BROKEN QUESTIONS
  }

  const correct = question.choices[question.correctAnswer];

  // 🔥 SAME CATEGORY DISTRACTORS
const pool = allQuestions
  .flatMap((q) => (Array.isArray(q.choices) ? q.choices : []))
  .filter((c) => typeof c === "string");

  const wrong = pool
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const choices = [...wrong, correct].sort(() => Math.random() - 0.5);
if (!choices.includes(correct)) {
  console.log("BROKEN SHUFFLE:", question);
}
return {
  id: String(question.id ?? ""),
  type: question.type,
  category: String(question.category ?? ""),
  question: typeof question.question === "string" ? question.question : "",
  choices: Array.isArray(choices) ? choices : [],
  correctAnswer: choices.indexOf(correct),
};
}
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}
function getTodayDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
 try {
  const iso =
    typeof local?.toISOString === "function"
      ? local.toISOString()
      : "";

  if (typeof iso !== "string") return "";

  const parts = iso.split("T");

  return Array.isArray(parts) && parts.length > 0 ? parts[0] : "";
} catch (e) {
  console.log("❌ DATE CRASH PREVENTED:", e);
  return "";
}
}
export default function PracticeScreen() {
 const { user, addXp } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
const [score, setScore] = useState(0);
const [answered, setAnswered] = useState(0);
const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
const [sessionComplete, setSessionComplete] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);
const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
const [showAnswer, setShowAnswer] = useState(false);

const scaleAnim = useRef(new Animated.Value(1)).current;
const shakeAnim = useRef(new Animated.Value(0)).current;

const [questionStartTime, setQuestionStartTime] = useState(Date.now());

const params = useLocalSearchParams();
const topic = Array.isArray(params.topic) ? params.topic[0] : params.topic;

type MatchPair = { term: string; match: string };

type Question = {
  image?: string;
  id: string;
type:
  | "multiple_choice"
  | "match"
  | "image"
  | "formula"
  | "formula_input"
  | "formula_builder";
  category: string;
  subcategory?: string[];
  question: string;
  choices?: string[];
  correctAnswer?: number;
  matchPairs?: MatchPair[];
  explanation?: string;
};

const allQuestions = questionsData as Question[];

const baseQuestions = getSafeQuestions(
  topic
    ? allQuestions.filter((q) => q.category === topic)
    : allQuestions
);
const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

useEffect(() => {
  const transformed = expandMatchQuestions(baseQuestions);
  console.log("BASE:", baseQuestions.length);
console.log("TRANSFORMED:", transformed.length);

const improved = transformed.map((q) => {
  return generateSmartChoices(q, transformed);
});

setFilteredQuestions(shuffleArray(improved));
  setCurrentIndex(0);
  setQuestionStartTime(Date.now()); // 🔥 FIX
}, [topic]);
const question = filteredQuestions[currentIndex];
useEffect(() => {
  if (
    !question?.choices ||
    !question.choices.length ||
    question.correctAnswer === undefined
  ) {
    return;
  }

  setShuffledChoices(question.choices);
  setCorrectIndex(question.correctAnswer);
}, [currentIndex, question]);
async function handleSubmit() {
  if (selected === null || showAnswer) return;

  const isCorrect =
    shuffledChoices.length
      ? selected === correctIndex
      : selected === question.correctAnswer;

  // =========================
  // ✅ CORRECT ANSWER
  // =========================
  if (isCorrect) {
    setScore((prev) => prev + 1);

    const timeTaken = (Date.now() - questionStartTime) / 1000;

    let bonus = 0;
    if (timeTaken < 5) bonus = 10;
    else if (timeTaken < 10) bonus = 5;

    const xpGained = 10 + bonus;

    try {
      addXp(xpGained);

      if (!supabase) return;

      const userId = await getUserIdSafe();
      if (!userId) return;

      await supabase.from("profiles").upsert(
        {
          id: userId,
          xp: user.xp + xpGained,
          streak: user.streak + 1,
        },
        { onConflict: "id" }
      );

      setFeedback("correct");
      setAnswered((prev) => prev + 1);
      setShowAnswer(true);
    } catch (err) {
      console.log("Practice correct save failed:", err);
    }

    return;
  }

  // =========================
  // ❌ WRONG ANSWER
  // =========================

  Animated.sequence([
    Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]).start();

  setFeedback("incorrect");
  setAnswered((prev) => prev + 1);
  setShowAnswer(true);

  setWrongQuestions((prev) => {
    if (!question) return prev;
    const exists = prev.find((q) => q.id === question.id);
    return exists ? prev : [...prev, question];
  });

  try {
    if (!supabase) return;

    const userId = await getUserIdSafe();
    if (!userId) return;

    if (!question) return;

    await supabase.from("review_questions").insert({
      user_id: userId,
      question: {
        id: String(question.id ?? ""),
        question: typeof question.question === "string" ? question.question : "",
        choices: Array.isArray(question.choices) ? question.choices : [],
        correctAnswer:
          typeof question.correctAnswer === "number"
            ? question.correctAnswer
            : 0,
      },
    });

    await supabase.from("profiles").upsert(
      {
        id: userId,
        xp: user.xp,
        streak: 0,
      },
      { onConflict: "id" }
    );
  } catch (err) {
    console.log("Practice wrong save failed:", err);
  }
}
  function handleNext() {


  if (currentIndex + 1 >= filteredQuestions.length) {
    setSessionComplete(true);
    return;
  }

  setSelected(null);
  setShowAnswer(false);
  setFeedback(null);
  setCurrentIndex((prev) => prev + 1);
setQuestionStartTime(Date.now());
}
function handleRestart() {
  setCurrentIndex(0);
  setScore(0);
  setAnswered(0);
  setSelected(null);
  setShowAnswer(false);
  setFeedback(null);
  setSessionComplete(false);
  setWrongQuestions([]);
  setQuestionStartTime(Date.now());

  const transformed = expandMatchQuestions(baseQuestions);
const improved = transformed.map((q) => {
return generateSmartChoices(q, transformed);
});

setFilteredQuestions(shuffleArray(improved));
}
 if (!question) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: theme.colors.text }}>Loading...</Text>
    </View>
  );
}

return (
  <ScrollView
  contentContainerStyle={{
    padding: 20,
    backgroundColor: theme.colors.background,
    flexGrow: 1,
  }}
>

    {sessionComplete ? (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

        <Text style={{ fontSize: 26, color: theme.colors.text, fontWeight: "bold" }}>
          Session Complete
        </Text>

        <Text style={{ marginTop: 20, color: "#cbd5f5", fontSize: 18 }}>
          Score: {score} / {filteredQuestions.length}
        </Text>

        <Text style={{ marginTop: 10, color: theme.colors.subtext }}>
          XP Earned: {user.xp}
        </Text>
{wrongQuestions.length > 0 && (
<Pressable
  onPress={() => router.push("/review-quiz" as any)}
    style={{
      marginTop: 20,
      borderWidth: 2,
borderColor: theme.colors.border,
      padding: 15,
      borderRadius: 10,
    }}
  >
    <Text style={{ color: theme.colors.text, textAlign: "center" }}>
      Review Wrong Answers
    </Text>
  </Pressable>
)}
        <Pressable
          onPress={handleRestart}
          style={{
            marginTop: 30,
            backgroundColor: theme.colors.accent,
            padding: 15,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 16 }}>
            Restart Session
          </Text>
        </Pressable>

      </View>
    ) : (

      <View style={{ flex: 1 }}>

        {/* HEADER */}
        <View style={{ marginBottom: 20 }}>
          
          <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.colors.text }}>
           Question {filteredQuestions.length === 0 ? 0 : currentIndex + 1} / {filteredQuestions.length}
          </Text>

       <Text style={{ marginTop: 5, color: "#cbd5f5" }}>
  Score: {score} / {answered}
</Text>

<Text style={{ color: theme.colors.subtext }}>
  Accuracy: {answered > 0 ? Math.round((score / answered) * 100) : 0}%
</Text>

        <Text style={{ marginTop: 5, color: theme.colors.subtext }}>
  🔥 Streak: {user?.streak ?? 0} | ⚡ XP: {user?.xp ?? 0}
</Text>

{user.streak >= 5 && (
  <Text style={{ color: "#f59e0b", marginTop: 5 }}>
    On fire! Keep it going 🔥
  </Text>
)}

          <View
            style={{
              height: 8,
borderWidth: 2,
borderColor: theme.colors.border,
              borderRadius: 10,
              marginTop: 10,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%`,
                backgroundColor: "#4CAF50",
              }}
            />
          </View>

        </View>

        {/* CATEGORY */}
        <Text style={{ marginBottom: 10, color: theme.colors.subtext }}>
          {question.category}
        </Text>

    {/* QUESTION */}
<Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
<Text style={{ fontSize: 20, marginBottom: 20, color: theme.colors.text }}>
  {(
    typeof question.question === "string" ? question.question : ""
  )
    .replace(/2/g, "₂")
    .replace(/3/g, "₃")
    .replace(/4/g, "₄")
    .replace(/6/g, "₆")}
</Text>
</Animated.View>

{/* IMAGE QUESTION */}
{question.type === "image" && question.image === "granite" && (
  <Image
    source={require("@/assets/images/granite.png")}
    style={{
      width: "100%",
      height: 200,
      borderRadius: 12,
      marginBottom: 20,
    }}
    resizeMode="cover"
  />
)}

        {/* ANSWERS */}
        {(shuffledChoices.length ? shuffledChoices : question.choices || []).map((choice: string, index: number) => {
        const isCorrect = shuffledChoices.length
  ? index === correctIndex
  : index === question.correctAnswer;
          const isSelected = selected === index;

          let backgroundColor = "#1e293b";

         if (showAnswer) {
  if (isCorrect) backgroundColor = "#22c55e";
  else if (isSelected) backgroundColor = "#ef4444";
} else if (isSelected) {
            backgroundColor = "#334155";
          }

          return (
<Animated.View
  key={index}
  style={{
    transform: [{ scale: scaleAnim }],
  }}
>
  <Pressable
    disabled={showAnswer}
    onPress={() => {
      if (showAnswer) return;

      setSelected(index);

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }}
    style={{
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      backgroundColor,
    }}
  >
<Text style={{ color: theme.colors.text }}>
  {(
    typeof choice === "string" ? choice : ""
  )
    .replace(/2/g, "₂")
    .replace(/3/g, "₃")
    .replace(/4/g, "₄")
    .replace(/6/g, "₆")}
</Text>
  </Pressable>
</Animated.View>
          );
        })}

        {/* BUTTONS */}
        {!showAnswer ? (
          <Pressable
            onPress={handleSubmit}
            style={{
              marginTop: 20,
              backgroundColor: "#222",
              padding: 15,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: theme.colors.text, textAlign: "center" }}>
              Submit
            </Text>
          </Pressable>
        ) : (
          <View>

            {feedback === "correct" && (
              <Text style={{ color: "#4CAF50", fontSize: 18, marginTop: 10 }}>
                ✅ Correct!
              </Text>
            )}

            {feedback === "incorrect" && (
              <Text style={{ color: "#f44336", fontSize: 18, marginTop: 10 }}>
                ❌ Incorrect
              </Text>
            )}

            <Text style={{ marginTop: 20, color: theme.colors.text }}>
              {question.explanation}
            </Text>

            <Pressable
              onPress={handleNext}
              style={{
                marginTop: 20,
                backgroundColor: "#222",
                padding: 15,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: theme.colors.text, textAlign: "center" }}>
                Next
              </Text>
            </Pressable>

          </View>
        )}

      </View>

    )}

  </ScrollView>
);
  }