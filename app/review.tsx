import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReviewMenu() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          flex: 1,
          padding: 20,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 10,
            marginTop: 10,
          }}
        >
          Review Mode
        </Text>

        <Text
          style={{
            color: theme.colors.subtext,
            marginBottom: 30,
          }}
        >
          Review your missed questions
        </Text>

        {/* QUIZ */}
        <Pressable
          onPress={() => router.push("/review-quiz")}
          style={{
            borderWidth: 2,
            borderColor: theme.colors.border,
            padding: 20,
            borderRadius: 14,
            marginBottom: 15,
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 18 }}>
            Review Quiz
          </Text>
          <Text style={{ color: theme.colors.subtext }}>
            Quiz yourself on saved questions
          </Text>
        </Pressable>

        {/* LIST */}
        <Pressable
          onPress={() => router.push("/review-list")}
          style={{
            borderWidth: 2,
            borderColor: theme.colors.border,
            padding: 20,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 18 }}>
            Study Answers
          </Text>
          <Text style={{ color: theme.colors.subtext }}>
            Read through answers and explanations
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}