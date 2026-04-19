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

  // ✅ SAFE INIT (NO SUPABASE AT ALL)
  useEffect(() => {
    console.log("✅ SAFE USER INIT");

    setUser({
      xp: 0,
      streak: 0,
      exams: [],
    });
  }, []);

  function addExam(exam: Exam) {
    setUser((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        exams: [...prev.exams, exam],
      };
    });
  }

  return (
    <UserContext.Provider value={{ user, setUser, addExam }}>
      {children}
    </UserContext.Provider>
  );
}