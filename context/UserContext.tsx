
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
  let mounted = true;

async function loadUser() {
  try {
    // 🔥 LAZY LOAD SUPABASE
    if (!supabase) {
      supabase = (await import("@/lib/supabase")).supabase;
      console.log("✅ Supabase loaded");
    }

    let userId: string | null = null;

    // 🔥 TRY GET EXISTING USER
    try {
      const res = await supabase.auth.getUser();
      userId = res?.data?.user?.id ?? null;
    } catch {}

    // 🔥 IF NO USER → CREATE ONE
    if (!userId) {
      console.log("🆕 Creating anon user...");

      try {
        const { data } = await supabase.auth.signInAnonymously();
        userId = data?.user?.id ?? null;
      } catch (e) {
        console.log("❌ Failed to create user:", e);
      }
    }

    // 🔥 IF STILL NO USER → FALLBACK (PREVENT LOADING FOREVER)
    if (!userId) {
      console.log("⚠️ No user — fallback state");

      setUser({
        xp: 0,
        streak: 0,
      });

      return;
    }

    // 🔥 ENSURE PROFILE EXISTS
    await supabase.from("profiles").upsert(
      {
        id: userId,
        xp: 0,
        streak: 0,
      },
      { onConflict: "id" }
    );

    // 🔥 LOAD PROFILE
    const { data } = await supabase
      .from("profiles")
      .select("xp, streak")
      .eq("id", userId)
      .maybeSingle();

    // 🔥 ALWAYS SET USER (NO MORE LOADING LOOP)
    setUser({
      xp: data?.xp ?? 0,
      streak: data?.streak ?? 0,
    });

  } catch (e) {
    console.log("❌ FINAL loadUser crash:", e);

    // 🔥 HARD FALLBACK (NEVER STUCK AGAIN)
    setUser({
      xp: 0,
      streak: 0,
    });
  }
}

  // 🔥 DELAY (prevents startup crash)
  setTimeout(loadUser, 300);

  // 🔥 SAFE AUTH LISTENER
  let subscription: any = null;

  try {
    const result = supabase?.auth?.onAuthStateChange(() => {
      console.log("🔄 Auth changed → reloading user");
      loadUser();
    });

    subscription = result?.data?.subscription;
  } catch (e) {
    console.log("❌ Auth listener crash prevented:", e);
  }

  return () => {
    mounted = false;
    try {
      subscription?.unsubscribe?.();
    } catch {}
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