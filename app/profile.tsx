import { useUser } from "@/context/UserContext";
import { Text, View } from "react-native";

export default function ProfileScreen() {
  const { user } = useUser();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "white" }}>XP: {user.xp}</Text>
      <Text style={{ color: "white" }}>Streak: {user.streak}</Text>
    </View>
  );
}