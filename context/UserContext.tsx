
import { createContext, useContext, useEffect, useState } from "react";
let supabase: any = null;
type UserType = { xp: number; streak: number } | null;

const UserContext = createContext<{
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  addXp: (amount: number) => void;
}>({
  user: null,
  setUser: () => {},
  addXp: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: any) {
  const [user, setUser] = useState<{ xp: number; streak: number } | null>(null);

useEffect(() => {
  console.log("👤 UserContext SAFE START");

  // 🔥 IMMEDIATE SAFE STATE (PREVENT CRASH + LOADING)
  setUser({
    xp: 0,
    streak: 0,
  });

  // 🔥 LOAD SUPABASE ONLY AFTER 3 SECONDS (APP FULLY STABLE)
  const timer = setTimeout(async () => {
    try {
      console.log("🚀 Starting Supabase AFTER delay");

      if (!supabase) {
        supabase = (await import("@/lib/supabase")).supabase;
      }

      let userId: string | null = null;

      try {
        const res = await supabase.auth.getUser();
        userId = res?.data?.user?.id ?? null;
      } catch {}

      if (!userId) {
        const { data } = await supabase.auth.signInAnonymously();
        userId = data?.user?.id ?? null;
      }

      if (!userId) return;

      await supabase.from("profiles").upsert(
        {
          id: userId,
          xp: 0,
          streak: 0,
        },
        { onConflict: "id" }
      );

      const { data } = await supabase
        .from("profiles")
        .select("xp, streak")
        .eq("id", userId)
        .maybeSingle();

      setUser({
        xp: data?.xp ?? 0,
        streak: data?.streak ?? 0,
      });

      console.log("✅ Supabase loaded safely");

    } catch (e) {
      console.log("❌ Delayed Supabase failed:", e);
    }
  }, 3000); // 🔥 KEY CHANGE

  return () => clearTimeout(timer);
}, []);

async function addXp(amount: number) {
  // ✅ UPDATE UI FIRST
setUser((prev) => {
  if (!prev) return prev; // ✅ handle null safely

  const newXp = prev.xp + amount;

  return {
    xp: newXp,
    streak: prev.streak ?? 0, // ✅ force number
  };
});

  // ✅ SAVE TO SUPABASE
  try {
  // 🔥 LAZY LOAD SUPABASE
if (!supabase) {
  try {
    supabase = (await import("@/lib/supabase")).supabase;
  } catch {
    return;
  }
}

    const res = await supabase.auth.getUser();
    const userId = res?.data?.user?.id;

    if (!userId) return;

    const { data } = await supabase
      .from("profiles")
      .select("xp, streak")
      .eq("id", userId)
      .maybeSingle();

    const currentXp = data?.xp ?? 0;
    const currentStreak = data?.streak ?? 0;

    await supabase.from("profiles").upsert(
      {
        id: userId,
        xp: currentXp + amount,
        streak: currentStreak,
      },
      { onConflict: "id" }
    );
  } catch (e) {
    console.log("❌ XP SAVE FAILED:", e);
  }
}

return (
  <UserContext.Provider value={{ user, setUser, addXp }}>
      {children}
    </UserContext.Provider>
  );
}