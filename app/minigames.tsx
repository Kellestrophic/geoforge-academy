
import { isProUser, requirePro } from "@/lib/pro";
import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
function GameCard({
  title,
  subtitle,
  onPress,
  locked = false,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  locked?: boolean;
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
        
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "600" }}>
            {title}
          </Text>

          <Text style={{ color: theme.colors.subtext, marginTop: 3 }}>
            {subtitle}
          </Text>
        </View>

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
export default function MiniGamesScreen() {
  const tapLock = useRef(false);
const [isPro, setIsPro] = useState(false);

useEffect(() => {
  const check = async () => {
    try {
      const result = await isProUser();
      console.log("🧠 MiniGames Pro:", result);
      setIsPro(!!result);
    } catch (e) {
      console.log("❌ isProUser crash:", e);
      setIsPro(false);
    }
  };

  check();
}, []);
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
  title="Match Game"
  subtitle="Match geology terms with their definitions"
  locked={!isPro}
  onPress={async () => {
 const ok = await requirePro();

if (!ok) {
  router.push("/upgrade");
  return;
}

router.push("/match");
  }}
/>

<GameCard
  title="Formula Game"
  subtitle="Build and complete mineral chemical formulas"
  locked={!isPro}
  onPress={async () => {
const ok = await requirePro();

if (!ok) {
  router.push("/upgrade");
  return;
}

router.push("/formula-game");
  }}
/>

<GameCard
  title="Timeline Builder"
  subtitle="Arrange geologic time from oldest to youngest"
  locked={!isPro}
  onPress={async () => {
const ok = await requirePro();

if (!ok) {
  router.push("/upgrade");
  return;
}
    router.push("/timeline"); // 🔥 FIXED PATH
  }}
/>
      {/* FUTURE GAME SLOT */}
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