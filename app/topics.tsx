import questionsData from "@/data/questions.json";
import { router } from "expo-router";
import { useRef } from "react";
import { Pressable, ScrollView, Text } from "react-native";

const questions = questionsData as any[];


const baseTopics = [...new Set(questions.map((q: any) => q.category))];

const topics = Array.from(
  new Set(questions.map((q: any) => q.category))
);
console.log("ALL QUESTIONS:", questions);
console.log("TOPICS:", topics);export default function TopicsScreen() {
  const tapLock = useRef(false);

  return (
   <ScrollView
  style={{ backgroundColor: "#0f172a" }}
  contentContainerStyle={{
    padding: 20,
    paddingBottom: 100,
  }}
>

      <Text style={{ fontSize: 24, color: "white", marginBottom: 20 }}>
        Select Topic
      </Text>

      {topics.map((topic) => (
        <Pressable
          key={topic}
          onPress={() =>
            router.push({
              pathname: "/practice",
              params: { topic },
            } as any)
          }
          style={{
            backgroundColor: "#1e293b",
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
       <Text style={{ color: "white", fontSize: 16 }}>
  {topic}
</Text>

<Text style={{ color: "#94a3b8", marginTop: 3 }}>
  {questions.filter((q: any) => q.category === topic).length} questions
</Text>
        </Pressable>
      ))}

    </ScrollView>
  );
}