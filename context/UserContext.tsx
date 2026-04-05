import { supabase } from "@/lib/supabase";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext({
  user: { xp: 0, streak: 0 },
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: any) {
  const [user, setUser] = useState({ xp: 0, streak: 0 });

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        // ✅ SAFE GET USER
        let userId: string | null = null;
if (!supabase) {
  console.log("🚫 Supabase unavailable");
  return;
}
        try {
          const res = await supabase?.auth?.getUser?.();
          if (res?.data?.user?.id) {
            userId = res.data.user.id;
          }
        } catch (e) {
          console.log("❌ getUser failed:", e);
        }

        if (!userId) return;

        // ✅ SAFE QUERY (THIS WAS CRASHING)
        let data: any = null;

        try {
          const result = await supabase
            .from("profiles")
            .select("xp, streak")
            .eq("id", userId)
            .maybeSingle(); // 🔥 IMPORTANT CHANGE

          data = result?.data;
        } catch (e) {
          console.log("❌ profile fetch failed:", e);
        }

        if (mounted && data) {
          setUser({
            xp: typeof data.xp === "number" ? data.xp : 0,
            streak: typeof data.streak === "number" ? data.streak : 0,
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

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}