import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { useRef } from "react";
import { Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function ModeCard({
  title,
  subtitle,
  onPress,
  disabled = false, // ✅ ADDED
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean; // ✅ ADDED
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress} // ✅ BLOCK CLICK
      style={{
        backgroundColor: "#1e293b",
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: theme.colors.border,
        opacity: disabled ? 0.5 : 1, // ✅ GREY OUT
      }}
    >
      <Text
        style={{
          color: disabled ? "#64748b" : theme.colors.text, // ✅ DIM TEXT
          fontSize: 18,
          fontWeight: "600",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: disabled ? "#475569" : theme.colors.subtext, // ✅ DIM SUBTEXT
          marginTop: 3,
        }}
      >
        {subtitle}
      </Text>
    </Pressable>
  );
}

export default function ModesScreen() {
  const tapLock = useRef(false);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 28, marginBottom: 20 }}>
        Study Modes
      </Text>

      <ModeCard
        title="Practice Mode"
        subtitle="Quick learning with instant feedback"
        onPress={() => {
          if (tapLock.current) return;
          tapLock.current = true;
          router.push("/practice-menu");
          setTimeout(() => (tapLock.current = false), 400);
        }}
      />

      <ModeCard
        title="Topic Mode"
        subtitle="Focus on specific geology subjects"
        onPress={() => {
          if (tapLock.current) return;
          tapLock.current = true;
          router.push("/topics");
          setTimeout(() => (tapLock.current = false), 400);
        }}
      />

      {/* 🔒 LOCKED REVIEW MODE */}
     <ModeCard
  title="Review Mode"
  subtitle="Practice your missed questions"
  onPress={() => {
    if (tapLock.current) return;
    tapLock.current = true;
    router.push("/review");
    setTimeout(() => (tapLock.current = false), 400);
  }}
/>

      <ModeCard
        title="Exam Mode"
        subtitle="Full exam simulations and testing"
        onPress={() => {
          if (tapLock.current) return;
          tapLock.current = true;
          router.push("/exam-menu");
          setTimeout(() => (tapLock.current = false), 400);
        }}
      />
    </SafeAreaView>
  );
}