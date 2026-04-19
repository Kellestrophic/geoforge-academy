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

  /* ---------------- SAFE LOAD (ONCE) ---------------- */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        // ✅ delay prevents crash
        await new Promise((r) => setTimeout(r, 500));

        const { data: session } = await supabase.auth.getSession();
        const userId = session?.session?.user?.id;

        if (!userId) {
          setUser({ xp: 0, streak: 0, exams: [] });
          return;
        }

        const { data } = await supabase
          .from("exam_history")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

        const exams =
          data?.map((e: any) => ({
            score: e.score,
            type: e.type,
          })) || [];

        if (mounted) {
          setUser({
            xp: 0,
            streak: 0,
            exams,
          });
        }
      } catch (e) {
        console.log("LOAD SAFE FAIL:", e);
        setUser({ xp: 0, streak: 0, exams: [] });
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------- SAVE EXAM ---------------- */

  async function addExam(exam: Exam) {
    setUser((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        exams: [...prev.exams, exam],
      };
    });

    // 🔥 SAFE BACKGROUND SAVE (NO CRASH)
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) return;

      await supabase.from("exam_history").insert({
        user_id: userId,
        score: exam.score,
        type: exam.type,
      });
    } catch (e) {
      console.log("SAVE FAIL SAFE:", e);
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, addExam }}>
      {children}
    </UserContext.Provider>
  );
}