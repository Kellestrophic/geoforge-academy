import { supabase } from "@/lib/supabase";
import { createContext, useContext, useEffect, useState } from "react";

type Exam = {
  score: number;
  type: "random" | "topic" | "pg";
};

type UserType = {
  xp: number;
  streak: number;
  exams: Exam[];
} | null;

const UserContext = createContext<{
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  addExam: (exam: Exam) => void;
}>({
  user: null,
  setUser: () => {},
  addExam: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: any) {
  const [user, setUser] = useState<UserType>(null);

  /* ---------------- SAFE INIT (NO SUPABASE) ---------------- */

  useEffect(() => {
    console.log("👤 SAFE USER INIT");

    setUser({
      xp: 0,
      streak: 0,
      exams: [],
    });
  }, []);

  /* ---------------- SAVE EXAM (SAFE) ---------------- */

  async function addExam(exam: Exam) {
    // ✅ instant UI update
    setUser((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        exams: [...prev.exams, exam],
      };
    });

    // ✅ delayed background save (no crash)
    setTimeout(async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session?.session?.user?.id;

        if (!userId) return;

        await supabase.from("exam_history").insert({
          user_id: userId,
          score: exam.score,
          type: exam.type,
        });

        console.log("✅ SAVED TO SUPABASE");
      } catch (e) {
        console.log("❌ SAFE SAVE FAILED:", e);
      }
    }, 1000); // ⬅️ CRITICAL DELAY
  }

  return (
    <UserContext.Provider value={{ user, setUser, addExam }}>
      {children}
    </UserContext.Provider>
  );
}