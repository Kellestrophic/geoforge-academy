import { supabase } from "@/lib/supabase";
import { createContext, useContext, useEffect, useState } from "react";

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
  let mounted = true;

  async function loadUser() {
    try {
      if (!supabase) return;

      const res = await supabase.auth.getUser();
      const userId = res?.data?.user?.id;

      if (!userId) {
        console.log("❌ No user found in context");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("xp, streak")
        .eq("id", userId)
        .single();

      if (mounted) {
        setUser({
          xp: data?.xp ?? 0,
          streak: data?.streak ?? 0,
        });
      }
    } catch (e) {
      console.log("❌ Context load failed:", e);
    }
  }

  // 🔥 RUN ON START
  loadUser();

  // 🔥 ALSO LISTEN FOR AUTH CHANGES (THIS FIXES YOUR BUG)
  const { data: listener } = supabase.auth.onAuthStateChange(() => {
    console.log("🔄 Auth changed → reloading user");
    loadUser();
  });

  return () => {
    mounted = false;
    listener?.subscription?.unsubscribe();
  };
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
    if (!supabase) return;

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