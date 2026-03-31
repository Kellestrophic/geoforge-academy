
import { requirePro } from "@/lib/pro";
import { theme } from "@/lib/theme";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
export default function MiniGamesScreen() {
  const tapLock = useRef(false);


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

      {/* MATCH GAME */}
      <Pressable
onPress={async () => {
  if (tapLock.current) return;
  tapLock.current = true;

  await requirePro("/match");

  setTimeout(() => {
    tapLock.current = false;
  }, 400);
}}
style={{
  padding: 20,
  borderWidth: 2,
  borderColor: "#C9A86A",
  borderRadius: 12,
  marginBottom: 15,
  opacity: 0.6,
}}
>
<View>
  <Text style={{ color: theme.colors.text, fontSize: 16 }}>
    Match Game 🔒
  </Text>
  <Text style={{ color: theme.colors.subtext, marginTop: 4 }}>
    Match geology terms with their definitions
  </Text>
</View>
      </Pressable>
{/* FORMULA GAME */}
<Pressable
onPress={async () => {
  if (tapLock.current) return;
  tapLock.current = true;

  await requirePro("/formula-game");

  setTimeout(() => {
    tapLock.current = false;
  }, 400);
}}
style={{
  padding: 20,
  borderWidth: 2,
  borderColor: "#C9A86A",
  borderRadius: 12,
  marginBottom: 15,
  opacity: 0.6,
}}
>
<View>
  <Text style={{ color: theme.colors.text, fontSize: 16 }}>
    Formula Game 🔒
  </Text>
  <Text style={{ color: theme.colors.subtext, marginTop: 4 }}>
    Build and complete mineral chemical formulas
  </Text>
</View>
</Pressable>
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