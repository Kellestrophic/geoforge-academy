import { supabase } from "@/lib/supabase";
import { createContext, useContext, useEffect, useState } from "react";

/* ---------------- TYPES ---------------- */

type Exam = {
  score: number;
  type: "random" | "topic" | "pg";
};

type UserType = {
  xp: number;
  streak: number;
  exams: Exam[];
};

/* ---------------- DEFAULT USER (NO NULL) ---------------- */

const defaultUser: UserType = {
  xp: 0,
  streak: 0,
  exams: [],
};

/* ---------------- CONTEXT ---------------- */

const UserContext = createContext<{
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  addExam: (exam: Exam) => void;
}>({
  user: defaultUser,
  setUser: () => {},
  addExam: () => {},
});

/* ---------------- HOOK ---------------- */

export function useUser() {
  return useContext(UserContext);
}

/* ---------------- PROVIDER ---------------- */

export function UserProvider({ children }: any) {
  const [user, setUser] = useState<UserType>(defaultUser);

  /* ---------------- SAFE INIT ---------------- */

  useEffect(() => {
    console.log("👤 SAFE USER INIT");
  }, []);

  /* ---------------- ADD EXAM ---------------- */

  function addExam(exam: Exam) {
    // ✅ ALWAYS SAFE (no null checks needed anymore)
    setUser((prev) => ({
      ...prev,
      exams: [...prev.exams, exam],
    }));

    // 🚨 SAFE BACKGROUND SAVE (DO NOT BLOCK UI)
    setTimeout(async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session?.session?.user?.id;

        if (!userId) {
          console.log("⚠️ NO USER — SKIPPING SAVE");
          return;
        }

        await supabase.from("exam_history").insert({
          user_id: userId,
          score: exam.score,
          type: exam.type,
        });

        console.log("✅ SAVED TO SUPABASE");
      } catch (e) {
        console.log("❌ SAFE SAVE FAILED:", e);
      }
    }, 1500); // ⬅️ slightly longer delay = safer on iOS
  }

  return (
    <UserContext.Provider value={{ user, setUser, addExam }}>
      {children}
    </UserContext.Provider>
  );
}