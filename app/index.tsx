import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { useRef } from "react";
import { Image, Pressable, Text, View } from "react-native";

export default function HomeScreen() {
  const tapLock = useRef(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: 20,
        justifyContent: "flex-start",
      }}
    >
{/* LOGO */}
<View style={{ alignItems: "center", marginTop: -100, marginBottom: -60 }}>
<Image
  source={require("../assets/logo.png")}
  style={{
    width: 500,
    height: 500,
    resizeMode: "contain",
  }}
/>
</View>

      {/* BUTTON GRID */}
  <View style={{ gap: 20, marginTop: -60 }}>
        {/* MODES */}
        <Pressable
          onPress={() => router.push("/modes" as any)}
          style={{
            padding: 25,
            borderRadius: 16,
            backgroundColor: "#1e293b",
            borderWidth: 1,
            borderColor: "#334155",
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
            📚 Study Modes
          </Text>
          <Text style={{ color: "#94a3b8", marginTop: 5 }}>
            Practice, Review, Exams
          </Text>
        </Pressable>

        {/* MINIGAMES */}
        <Pressable
          onPress={() => router.push("/minigames" as any)}
          style={{
            padding: 25,
            borderRadius: 16,
            backgroundColor: "#1e293b",
            borderWidth: 1,
            borderColor: "#334155",
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
            🎮 Mini Games
          </Text>
          <Text style={{ color: "#94a3b8", marginTop: 5 }}>
            Learn through interaction
          </Text>
        </Pressable>

        {/* PROFILE */}
        <Pressable
          onPress={() => router.push("/profile" as any)}
          style={{
            padding: 25,
            borderRadius: 16,
            backgroundColor: "#1e293b",
            borderWidth: 1,
            borderColor: "#334155",
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
            📊 Profile
          </Text>
          <Text style={{ color: "#94a3b8", marginTop: 5 }}>
            Stats, progress, analytics
          </Text>
        </Pressable>
      </View>
    </View>
  );
}