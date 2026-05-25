import React, { createContext, useContext, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("chat_user"));
    } catch {
      return null;
    }
  });

  const login = (u) => {
    setUser(u);
    localStorage.setItem("chat_user", JSON.stringify(u));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("chat_user");
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
