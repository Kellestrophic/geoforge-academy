import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function PracticeMenu() {
  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 26,
          fontWeight: "bold",
          marginBottom: 30,
        }}
      >
        Practice Mode
      </Text>

      {/* ALL */}
      <Pressable
      onPress={() =>
  router.push({
    pathname: "/practice",
    params: {
      mode: "practice",
      type: "all",
    },
  })
}
 style={{
  backgroundColor: "#243247", // 🔥 filled dark card
  borderWidth: 2,
  borderColor: "#38bdf8", // 🔥 bright blue outline
  padding: 20,
  borderRadius: 16,
  marginBottom: 18,
}}
      >
        <Text style={{ color: theme.colors.text, fontSize: 18 }}>
          🎲 Random (All)
        </Text>
        <Text style={{ color: theme.colors.subtext }}>
          All topics mixed
        </Text>
      </Pressable>

      {/* MC */}
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/practice",
            params: {
              mode: "practice",
              type: "mc",
            },
          })
        }
        style={{
  backgroundColor: "#243247", // 🔥 filled dark card
  borderWidth: 2,
  borderColor: "#38bdf8", // 🔥 bright blue outline
  padding: 20,
  borderRadius: 16,
  marginBottom: 18,
}}
      >
        <Text style={{ color: theme.colors.text, fontSize: 18 }}>
          🧠 Multiple Choice
        </Text>
        <Text style={{ color: theme.colors.subtext }}>
          MC questions only
        </Text>
      </Pressable>

      {/* FB */}
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/practice",
            params: {
              mode: "practice",
              type: "fb",
            },
          })
        }
        style={{
  backgroundColor: "#243247", // 🔥 filled dark card
  borderWidth: 2,
  borderColor: "#38bdf8", // 🔥 bright blue outline
  padding: 20,
  borderRadius: 16,
  marginBottom: 18,
}}
      >
        <Text style={{ color: theme.colors.text, fontSize: 18 }}>
          ✍️ Fill in the Blank
        </Text>
        <Text style={{ color: theme.colors.subtext }}>
          Input questions only
        </Text>
      </Pressable>
    </View>
  );
}