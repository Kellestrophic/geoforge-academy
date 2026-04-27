import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExamTest() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 24 }}>
          Exam Loaded
        </Text>
      </View>
    </SafeAreaView>
  );
}