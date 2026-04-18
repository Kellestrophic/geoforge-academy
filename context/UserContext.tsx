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
} | null;

/* ---------------- CONTEXT ---------------- */

const UserContext = createContext<{
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  addXp: (amount: number) => void;
  addExam: (exam: Exam) => void;
}>({
  user: null,
  setUser: () => {},
  addXp: () => {},
  addExam: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

/* ---------------- PROVIDER ---------------- */

export function UserProvider({ children }: any) {
  const [user, setUser] = useState<UserType>(null);

  useEffect(() => {
    console.log("👤 UserContext SAFE MODE");

    setUser({
      xp: 0,
      streak: 0,
      exams: [],
    });
  }, []);

  /* ---------------- ADD XP ---------------- */

  function addXp(amount: number) {
    setUser((prev) => {
      if (!prev) {
        return {
          xp: amount,
          streak: 0,
          exams: [], // ✅ FIXED
        };
      }

      return {
        ...prev, // ✅ keeps exams
        xp: prev.xp + amount,
      };
    });
  }

  /* ---------------- ADD EXAM ---------------- */

  function addExam(exam: Exam) {
    setUser((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        exams: [...prev.exams, exam],
      };
    });
  }

  return (
    <UserContext.Provider value={{ user, setUser, addXp, addExam }}>
      {children}
    </UserContext.Provider>
  );
}