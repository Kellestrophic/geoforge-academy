import { trackActivity } from "@/lib/activity";
import { theme } from "@/lib/theme";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
function GameCard({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#1e293b",
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: theme.colors.border,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "600" }}>
        {title}
      </Text>

      <Text style={{ color: theme.colors.subtext, marginTop: 3 }}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

export default function MinigamesScreen() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          color: theme.colors.text,
          marginBottom: 20,
        }}
      >
        Mini Games
      </Text>

      <GameCard
        title="Geo Match"
        subtitle="Test your ability to classify rock types"
       onPress={async () => {
  await trackActivity("match");
  router.push("/match");
}}
      />

      <GameCard
        title="Formula Game"
        subtitle="Build and complete mineral chemical formulas"
       onPress={async () => {
  await trackActivity("formula");
  router.push("/formula-game");
}}
      />

      <GameCard
        title="Timeline Builder"
        subtitle="Arrange geologic time from oldest to youngest"
       onPress={async () => {
  await trackActivity("timeline");
  router.push("/timeline");
}}
      />

      <Pressable
        style={{
          padding: 20,
          backgroundColor: "#1e293b",
          borderRadius: 12,
          opacity: 0.5,
        }}
      >
        <Text style={{ color: "#94a3b8" }}>
          Image Identification (Coming Soon)
        </Text>
      </Pressable>
    </View>
  );
}