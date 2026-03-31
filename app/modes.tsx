import { isProUser } from "@/lib/pro";
import { theme } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function ModeCard({
  title,
  subtitle,
  onPress,
  locked = false,
  icon,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  locked?: boolean;
  icon: any;
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
        borderColor: locked ? "#C9A86A" : theme.colors.border,
        opacity: locked ? 0.6 : 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>

        {/* ICON */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: "#334155",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 15,
          }}
        >
          <Ionicons name={icon} size={20} color="white" />
        </View>

        {/* TEXT */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "600" }}>
            {title}
          </Text>

          <Text style={{ color: theme.colors.subtext, marginTop: 3 }}>
            {subtitle}
          </Text>
        </View>

        {/* 🔒 PRO BADGE */}
        {locked && (
          <View
            style={{
              backgroundColor: "#C9A86A",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#000", fontSize: 12, fontWeight: "bold" }}>
              PRO
            </Text>
          </View>
        )}

      </View>
    </Pressable>
  );
}

export default function ModesScreen() {
  const tapLock = useRef(false);
 const [isPro, setIsPro] = useState<boolean | null>(null);

useEffect(() => {
  let mounted = true;

  async function checkPro() {
    const value = await isProUser();
    if (mounted) setIsPro(value);
  }

  checkPro();

  return () => {
    mounted = false;
  };
}, []);
if (isPro === null) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: theme.colors.text }}>Loading...</Text>
    </View>
  );
}
  return (
<SafeAreaView
  style={{
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  }}
>
      {/* HEADER */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ color: theme.colors.subtext }}>
          GeoForge Academy
        </Text>

        <Text
          style={{
           color: theme.colors.text,
            fontSize: 28,
            fontWeight: "bold",
            marginTop: 5,
          }}
        >
          Study Modes
        </Text>
      </View>

      {/* PRACTICE */}
<ModeCard
  title="Practice Mode"
  subtitle="Quick learning with instant feedback"
  icon="flash-outline"
 onPress={() => {
  if (tapLock.current) return;
  tapLock.current = true;

  router.push("/practice" as any);

  setTimeout(() => {
    tapLock.current = false;
  }, 400);
}}
/>

      {/* TOPIC */}
<ModeCard
  title="Topic Mode"
  subtitle="Focus on specific geology subjects"
  icon="layers-outline"
  locked={!isPro}
  onPress={() => {
    if (!isPro) {
      router.push("/upgrade" as any);
      return;
    }

    if (tapLock.current) return;
    tapLock.current = true;

    router.push("/topics" as any);

    setTimeout(() => {
      tapLock.current = false;
    }, 400);
  }}
/>

<ModeCard
  title="Review Mode"
  subtitle="Practice your missed questions"
  icon="refresh-outline"
  locked={!isPro}
  onPress={() => {
    if (!isPro) {
      router.push("/upgrade" as any);
      return;
    }

    if (tapLock.current) return;
    tapLock.current = true;

    router.push("/review" as any);

    setTimeout(() => {
      tapLock.current = false;
    }, 400);
  }}
/>

      {/* EXAM */}
<ModeCard
  title="Exam Mode"
  subtitle="Full exam simulations and testing"
  icon="timer-outline"
  locked={!isPro}
  onPress={() => {
    if (!isPro) {
      router.push("/upgrade" as any);
      return;
    }
    router.push("/exam-menu" as any);
  }}
/>

   </SafeAreaView>
  );
}