import { supabase } from "@/lib/supabase";
import { createContext, useContext, useEffect, useState } from "react";

type UserData = {
  xp: number;
  streak: number;
};

type UserContextType = {
  user: UserData;
  setUser: (data: Partial<UserData>) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: any }) {
  const [user, setUserState] = useState<UserData>({
    xp: 0,
    streak: 0,
  });

  function setUser(data: Partial<UserData>) {
    setUserState((prev) => ({ ...prev, ...data }));
  }

  async function refreshUser() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, streak")
      .eq("id", userId)
      .single();

    if (profile) {
      setUserState({
        xp: profile.xp || 0,
        streak: profile.streak || 0,
      });
    }
  }

  useEffect(() => {
    let channel: any;

async function init() {
  let retries = 0;

  async function waitForUser() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (userId) return userId;

    if (retries < 10) {
      retries++;
      await new Promise((res) => setTimeout(res, 200));
      return waitForUser();
    }

    return null;
  }

  const userId = await waitForUser();

  if (!userId) {
    console.log("User not ready");
    return;
  }

  await refreshUser();

      channel = supabase
        .channel("user-realtime")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            const updated = payload.new;
            setUserState({
              xp: updated.xp || 0,
              streak: updated.streak || 0,
            });
          }
        )
        .subscribe();
    }

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
}