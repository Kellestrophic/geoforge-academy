import { supabase } from "@/lib/supabase";
import { createContext, useContext, useEffect, useState } from "react";

type UserType = { xp: number; streak: number } | null;

const UserContext = createContext<{
  user: UserType;
  addXp: (amount: number) => void;
}>({
  user: null,
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

      // 🔥 WAIT FOR SESSION (THIS IS THE FIX)
      let session = null;

      try {
        const res = await supabase.auth.getSession();
        session = res?.data?.session;
      } catch (e) {
        console.log("❌ getSession failed:", e);
      }

      if (!session?.user?.id) {
        console.log("⏳ No session yet, retrying...");
        
        // 🔥 retry after delay
        setTimeout(loadUser, 1000);
        return;
      }

      const userId = session.user.id;

      let data: any = null;

      try {
        const result = await supabase
          .from("profiles")
          .select("xp, streak")
          .eq("id", userId)
          .maybeSingle();

        data = result?.data;
      } catch (e) {
        console.log("❌ profile fetch failed:", e);
      }

      if (mounted) {
        setUser({
          xp: typeof data?.xp === "number" ? data.xp : 0,
          streak: typeof data?.streak === "number" ? data.streak : 0,
        });
      }
    } catch (e) {
      console.log("❌ User load total failure:", e);
    }
  }

  loadUser();

  return () => {
    mounted = false;
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
  <UserContext.Provider value={{ user, addXp }}>
      {children}
    </UserContext.Provider>
  );
}