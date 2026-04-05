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
        const res = await supabase?.auth?.getUser?.();
        const userId = res?.data?.user?.id;

        if (!userId) return;

        const { data } = await supabase
          .from("profiles")
          .select("xp, streak")
          .eq("id", userId)
          .single();

        if (mounted && data) {
          setUser({
            xp: data.xp ?? 0,
            streak: data.streak ?? 0,
          });
        }
      } catch (e) {
        console.log("❌ User load failed:", e);
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