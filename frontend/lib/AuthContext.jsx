import React, { createContext, useContext, useEffect, useState } from "react";
import { appClient, AUTH_STORAGE_KEY } from "@/api/localDataClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: "seller-app",
    public_settings: { mode: "api" },
  });

  useEffect(() => {
    const bootstrapAuth = async () => {
      setIsLoadingAuth(true);

      try {
        const stored = typeof window !== "undefined"
          ? window.localStorage.getItem(AUTH_STORAGE_KEY)
          : null;

        if (stored) {
          const session = JSON.parse(stored);
          const currentUser = await appClient.auth.me();
          setUser({
            ...currentUser,
            token: session.token,
          });
          setIsAuthenticated(true);
          setAuthError(null);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth bootstrap failed:", error);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(AUTH_STORAGE_KEY);
        }
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({
          type: "unknown",
          message: error.message || "Failed to initialize auth",
        });
      } finally {
        setIsLoadingAuth(false);
      }
    };

    void bootstrapAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const result = await appClient.auth.login({ username, password });
      const session = {
        token: result.token,
        user: result.user,
      };

      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setUser({
        ...result.user,
        token: result.token,
      });
      setIsAuthenticated(true);
      setAuthError(null);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Login failed" };
    }
  };

  const logout = () => {
    appClient.auth.logout();
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
