import { useUser } from "@/context/UserContext";
import questionsData from "@/data/questions.json";
import { requirePro } from "@/lib/pro";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
type MatchPair = { term: string; match: string };
function shuffleArray(array: any[]) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function MatchScreen() {
  const { user, setUser } = useUser();
const matchQuestions = (questionsData as any[]).filter(
  (q) => q.type === "match"
);

const [xp, setXp] = useState(0);
const [currentMatch, setCurrentMatch] = useState(
  matchQuestions[Math.floor(Math.random() * matchQuestions.length)]
);
useEffect(() => {
  requirePro();
}, []);
const [pairs, setPairs] = useState<MatchPair[]>(
  (currentMatch?.matchPairs || []) as MatchPair[]
);
const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
const [matches, setMatches] = useState<string[]>([]);
 const [score, setScore] = useState(0);
const [combo, setCombo] = useState(0);
const scaleAnim = useRef(new Animated.Value(1)).current;
const flashAnim = useRef(new Animated.Value(0)).current;
  const [shuffledMatches, setShuffledMatches] = useState<any[]>([]);
const difficulty = "easy"; // change later

const initialTime =
  difficulty === "easy" ? 45 :
  difficulty === "medium" ? 30 :
  20;

const [timeLeft, setTimeLeft] = useState(initialTime);
function pressIn() {
  Animated.spring(scaleAnim, {
    toValue: 0.96,
    useNativeDriver: true,
  }).start();
}

function pressOut() {
  Animated.spring(scaleAnim, {
    toValue: 1,
    useNativeDriver: true,
  }).start();
}
function handleMatch(term: string, matchText: string) {
  const correctPair = pairs.find((p: MatchPair) => p.term === term);

  if (!correctPair) return;

if (correctPair.match === matchText) {
  const newCombo = combo + 1;
  setCombo(newCombo);

  Animated.sequence([
    Animated.timing(flashAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }),
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }),
  ]).start();

  setMatches((prev) => [...prev, term]);
  setScore((prev) => prev + 1);

  // 🔥 ADD XP
const updateXp = async () => {
let userId = null;

try {
  const response = await supabase.auth.getUser();
  userId = response?.data?.user?.id ?? null;
} catch (e) {
  console.log("🚨 getUser crash prevented:", e);
}

if (!userId) return;

  if (!userId) return;

// 🔥 ENSURE PROFILE EXISTS
await supabase.from("profiles").upsert({
  id: userId,
  xp: user.xp,
});

const xpGained = 10 + newCombo * 2;

console.log("Saving to Supabase:", userId, user.xp);

// 🔥 UPDATE XP
await supabase
  .from("profiles")
  .update({
    xp: user.xp + xpGained,
  })


// 🔥 UPDATE GLOBAL STATE
setUser({ xp: user.xp + xpGained });
};

updateXp();
}
else {
  setCombo(0);

  Animated.sequence([
    Animated.timing(flashAnim, {
      toValue: -1,
      duration: 100,
      useNativeDriver: false,
    }),
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }),
  ]).start();
}
  setSelectedTerm(null);
}

useEffect(() => {
  setShuffledMatches(shuffleArray(pairs));
}, [pairs]);
  const allMatched = matches.length === pairs.length;
useEffect(() => {
  if (allMatched) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [allMatched]);
  return (
   <Animated.ScrollView
  style={{
    backgroundColor: flashAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ["#7f1d1d", theme.colors.background, "#14532d"],
    }),
  }}
  contentContainerStyle={{
    padding: 20,
  }}
>
<Text style={{ color: theme.colors.text, fontSize: 22 }}>
  Match Terms
</Text>
<Text style={{ color: theme.colors.text, marginTop: 10 }}>
  Score: {score} | Time: {timeLeft}s
</Text>

<Text style={{ color: theme.colors.subtext }}>
  ⚡ XP: {user.xp}
</Text>

<Text
  style={{
    color: "#f59e0b",
    marginTop: 5,
    fontSize: combo >= 3 ? 22 : 16,
    fontWeight: combo >= 3 ? "bold" : "normal",
  }}
>
  Combo: {combo}
</Text>

{allMatched && (
  <Text style={{ color: theme.colors.accent, marginTop: 10 }}>
    🎉 All matched!
  </Text>
)}

{timeLeft === 0 && !allMatched && (
  <Text style={{ color: theme.colors.danger, marginTop: 10 }}>
    ⏱️ Time's up!
  </Text>
)}
<Pressable
  onPress={() => {
  const newIndex = Math.floor(Math.random() * matchQuestions.length);
  const newQuestion = matchQuestions[newIndex];

setCurrentMatch(newQuestion);

const newPairs = newQuestion.matchPairs || [];

setPairs(newPairs); // 🔥 THIS IS THE FIX
setMatches([]);
setScore(0);
setSelectedTerm(null);
setTimeLeft(initialTime);
}}
  style={{
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 10,
  }}
>
  <Text style={{ color: "white", textAlign: "center" }}>
    Restart Game
  </Text>
</Pressable>
<View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
  {/* LEFT — TERMS */}
<View style={{ flex: 1 }}>
    <Text style={{ color: theme.colors.subtext, marginBottom: 10 }}>
      Terms
    </Text>

    {pairs.map((item: MatchPair) => {
      const isMatched = matches.includes(item.term);
      const isSelected = selectedTerm === item.term;

      return (
        <Pressable
          key={item.term}
          disabled={isMatched || timeLeft === 0}
          onPress={() => setSelectedTerm(item.term)}
          style={{
            backgroundColor: isMatched
              ? "#22c55e"
              : isSelected
              ? "#334155"
              : theme.colors.card,
            padding: 16,
minHeight: 60,
alignItems: "flex-start",
justifyContent: "center",
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <Text
  style={{
    color: "white",
    flexWrap: "wrap",
    flexShrink: 1,
  }}
>
  {item.term}
</Text>
        </Pressable>
      );
    })}
  </View>

  {/* RIGHT — DEFINITIONS */}
 <View style={{ flex: 1 }}>
    <Text style={{ color: theme.colors.subtext, marginBottom: 10 }}>
      Definitions
    </Text>

    {shuffledMatches.map((item: MatchPair) => {
      const isMatched = matches.includes(item.term);

      return (
        
       <Animated.View key={item.match} style={{ transform: [{ scale: scaleAnim }] }}>
<Pressable
  onPressIn={pressIn}
  onPressOut={pressOut}
          key={item.match}
          disabled={!selectedTerm || isMatched || timeLeft === 0}
          onPress={() =>
            selectedTerm && handleMatch(selectedTerm, item.match)
          }
          style={{
            backgroundColor: isMatched
              ? "#22c55e"
              : theme.colors.card,
            padding: 16,
minHeight: 60,
alignItems: "flex-start",
justifyContent: "center",
            borderRadius: 10,
            marginBottom: 10,
            opacity: !selectedTerm || isMatched ? 0.5 : 1,
          }}
        >
          <Text
  style={{
    color: "white",
    flexWrap: "wrap",
    flexShrink: 1,
  }}
>
  {item.match}
</Text>
       </Pressable>
</Animated.View>
      );
    })}
  </View>

</View>
    </Animated.ScrollView>
  );
}