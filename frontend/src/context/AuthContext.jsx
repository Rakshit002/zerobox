import { createContext, useContext, useState, useEffect,useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial auth check - runs ONLY once on mount
    const checkAuth = async () => {
      // CRITICAL: Check URL first for OAuth token
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("token");

      if (tokenFromUrl) {
        // Store token from OAuth callback
        localStorage.setItem("token", tokenFromUrl);
        // Clean URL to prevent re-processing
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Now check authentication
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          if (res.data.loggedIn) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const refreshAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await api.get("/auth/me");
        if (res.data.loggedIn) {
          setUser(res.data.user);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth refresh failed:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};