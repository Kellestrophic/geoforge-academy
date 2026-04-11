
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
  console.log("👤 UserContext SAFE MODE");

  // 🔥 STATIC USER (NO SUPABASE ON STARTUP)
  setUser({
    xp: 0,
    streak: 0,
  });

}, []);

function addXp(amount: number) {
  setUser((prev) => {
    if (!prev) {
      return {
        xp: amount,
        streak: 0,
      };
    }

    return {
      xp: prev.xp + amount,
      streak: prev.streak ?? 0,
    };
  });
}

return (
  <UserContext.Provider value={{ user, setUser, addXp }}>
      {children}
    </UserContext.Provider>
  );
}