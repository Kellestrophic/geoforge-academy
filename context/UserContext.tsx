import { createContext, useContext } from "react";

const UserContext = createContext({
  user: { xp: 0, streak: 0 },
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: any) {
  const value = {
    user: { xp: 0, streak: 0 }, // SAFE DEFAULT
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}