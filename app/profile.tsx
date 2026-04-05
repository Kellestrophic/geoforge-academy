import { useUser } from "@/context/UserContext";
import { Text, View } from "react-native";

export default function ProfileScreen() {
  let user = { xp: 0, streak: 0 };

  try {
    const userContext = useUser();
    if (userContext && userContext.user) {
      user = userContext.user;
    }
  } catch (e) {
    console.log("❌ useUser crash prevented:", e);
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "white" }}>XP: {user.xp}</Text>
      <Text style={{ color: "white" }}>Streak: {user.streak}</Text>
    </View>
  );
}