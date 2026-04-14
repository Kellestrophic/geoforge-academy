import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function PracticeMenu() {
  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 30 }}>
        Practice Mode
      </Text>

      {/* ALL (RANDOM) */}
      <Pressable
        onPress={() => router.push("/practice?mode=all")}
        style={{
          backgroundColor: "#1e293b",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          🎲 Random (All)
        </Text>
        <Text style={{ color: "#94a3b8" }}>
          All topics mixed
        </Text>
      </Pressable>

      {/* MULTIPLE CHOICE ONLY */}
      <Pressable
        onPress={() => router.push("/practice?mode=mc")}
        style={{
          backgroundColor: "#1e293b",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          🧠 Multiple Choice
        </Text>
        <Text style={{ color: "#94a3b8" }}>
          MC questions only
        </Text>
      </Pressable>

      {/* FILL IN THE BLANK ONLY */}
      <Pressable
        onPress={() => router.push("/practice?mode=fb")}
        style={{
          backgroundColor: "#1e293b",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          ✍️ Fill in the Blank
        </Text>
        <Text style={{ color: "#94a3b8" }}>
          Input questions only
        </Text>
      </Pressable>

      {/* TOPICS */}
      <Pressable
        onPress={() => router.push("/topics")}
        style={{
          backgroundColor: "#1e293b",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          📚 Topics
        </Text>
        <Text style={{ color: "#94a3b8" }}>
          Choose a topic
        </Text>
      </Pressable>
    </View>
  );
}