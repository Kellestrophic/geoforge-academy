import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function TopicsScreen() {
  // ✅ ONLY YOUR CURRENT TOPICS
  const topics = [
    "Mineralogy",
    "Petrology",
  ];

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
        {topics.map((topic) => (
          <Pressable
            key={topic}
            onPress={() =>
              router.push({
                pathname: "/practice",
                params: { topic },
              })
            }
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
              {topic}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}