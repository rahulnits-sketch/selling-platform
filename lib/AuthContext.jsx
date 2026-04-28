import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "seller-auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;

    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!window.localStorage.getItem(AUTH_STORAGE_KEY);
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: "local-seller-app",
    public_settings: { mode: "local" },
  });

  useEffect(() => {
    const bootstrapAuth = () => {
      setIsLoadingAuth(true);
      try {
        const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);

        if (stored) {
          setUser(JSON.parse(stored));
          setIsAuthenticated(true);
          setAuthError(null);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Local auth bootstrap failed:", error);
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({
          type: "unknown",
          message: error.message || "Failed to initialize local mode",
        });
      } finally {
        setIsLoadingAuth(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (username, password) => {
    if (username === "rahul#123" && password === "12345") {
      const newUser = { username: "admin" };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      setAuthError(null);
      return { success: true };
    }

    return { success: false, message: "Invalid credentials" };
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
