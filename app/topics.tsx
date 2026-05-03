import { theme } from "@/lib/theme";
import { TOPIC_LIST } from "@/lib/topics";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function TopicsScreen() {
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: theme.colors.background,
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
        Topics
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {TOPIC_LIST.map((topic) => (
          <Pressable
            key={topic}
            onPress={() => {
              const displayName =
                topic === "MineralFormulas"
                  ? "Mineral Formulas"
                  : topic;

              router.push({
                pathname: "/exam", // ✅ USE MAIN ENGINE
                params: {
                  mode: "practice", // ✅ PRACTICE MODE (NO TIMER)
                  topic: displayName,
                },
              });
            }}
            style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: "#1e293b",
              borderWidth: 2,
              borderColor: theme.colors.border,
              marginRight: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>
              {topic === "MineralFormulas"
                ? "Mineral Formulas"
                : topic}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}