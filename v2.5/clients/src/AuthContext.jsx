import React, { createContext, useContext, useState } from "react";
import { api } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      return {
        user: JSON.parse(localStorage.getItem("chat_user")),

        token: JSON.parse(localStorage.getItem("chat_token")),
      };
    } catch {
      return {
        user: null,
        token: null,
      };
    }
  });

  const login = (data) => {
    const authData = {
      user: data.user,
      token: data.token,
    };

    setAuth(authData);

    localStorage.setItem("chat_user", JSON.stringify(data.user));

    localStorage.setItem("chat_token", JSON.stringify(data.token));
  };

  const logout = () => {
    setAuth({
      user: null,
      token: null,
    });

    localStorage.removeItem("chat_user");

    localStorage.removeItem("chat_token");
  };

  const checkAdmin = async () => {
    try {
      const { data } = await api.get("/admin/check");

      return data.isAdmin === true;
    } catch (err) {
      return false;
    }
  };

  return (
    <AuthCtx.Provider
      value={{
        user: auth.user,
        token: auth.token,
        login,
        logout,
        checkAdmin,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
