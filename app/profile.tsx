import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

export default function ProfileScreen() {
  const [examHistory, setExamHistory] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await supabase.auth.getUser();
        const userId = res?.data?.user?.id;

        if (!userId) return;

        const { data } = await supabase
          .from("exam_history")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: true });

        if (mounted) {
          setExamHistory(data || []);
        }
      } catch (e) {
        console.log("LOAD ERROR:", e);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const width = 300 + examHistory.length * 60;

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: "bold" }}>
        Performance
      </Text>

      <Text style={{ color: "white", marginTop: 10 }}>
        Exams Loaded: {examHistory.length}
      </Text>

      <View
        style={{
          marginTop: 20,
          borderWidth: 2,
          borderColor: theme.colors.border,
          borderRadius: 12,
          padding: 10,
        }}
      >
        <ScrollView horizontal>
          <Svg height={220} width={width}>

            {/* LINES */}
            {examHistory.map((exam, i) => {
              if (i === 0) return null;

              const prev = examHistory[i - 1];

              return (
                <Line
                  key={i}
                  x1={(i - 1) * 60 + 20}
                  y1={200 - (prev?.score || 0) * 1.5}
                  x2={i * 60 + 20}
                  y2={200 - (exam?.score || 0) * 1.5}
                  stroke="#64748b"
                  strokeWidth="2"
                />
              );
            })}

            {/* DOTS */}
            {examHistory.map((exam, i) => (
              <Circle
                key={i}
                cx={i * 60 + 20}
                cy={200 - (exam?.score || 0) * 1.5}
                r="5"
                fill="#ffffff"
              />
            ))}

          </Svg>
        </ScrollView>
      </View>
    </ScrollView>
  );
}