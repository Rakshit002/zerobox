import { createContext, useContext, useState, useEffect,useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext();

// Debug helper
const DEBUG = import.meta.env.DEV;
const log = (stage, message, data = null) => {
  if (DEBUG) {
    console.log(`[AUTH] ${stage}: ${message}`, data || "");
  }
};

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
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial auth check - runs ONLY once on mount
    const checkAuth = async () => {
      try {
        log("INIT", "Starting authentication initialization");

        // ============================================================
        // STEP 1: Extract token from URL (OAuth callback)
        // ============================================================
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get("token");

        if (tokenFromUrl) {
          log("OAUTH_CALLBACK", "Token found in URL", { 
            tokenLength: tokenFromUrl.length,
            url: window.location.href 
          });

          // Store token IMMEDIATELY before any async operations
          localStorage.setItem("token", tokenFromUrl);
          log("TOKEN_STORAGE", "Token stored to localStorage");

          // Clean URL to prevent re-processing and token exposure in history
          // Use replaceState to ensure token isn't in browser history
          const cleanUrl = window.location.pathname;
          window.history.replaceState(
            { tokenProcessed: true },
            document.title,
            cleanUrl
          );
          log("URL_CLEANUP", "URL cleaned and replaceState applied", { cleanUrl });
        } else {
          log("OAUTH_CALLBACK", "No token in URL params");
        }

        // ============================================================
        // STEP 2: Check for stored token
        // ============================================================
        const token = localStorage.getItem("token");
        
        if (!token) {
          log("TOKEN_CHECK", "No token in localStorage - user not authenticated");
          setLoading(false);
          return;
        }

        log("TOKEN_CHECK", "Token found in localStorage", { 
          tokenLength: token.length,
          tokenPrefix: token.substring(0, 20) + "..." 
        });

        // ============================================================
        // STEP 3: Verify token with backend
        // ============================================================
        log("API_CALL", "Calling /auth/me to verify token");
        
        const res = await api.get("/auth/me");
        
        log("API_RESPONSE", "Response received from /auth/me", {
          loggedIn: res.data.loggedIn,
          hasUser: !!res.data.user
        });

        if (res.data.loggedIn && res.data.user) {
          log("AUTH_SUCCESS", "User authenticated", {
            userId: res.data.user._id,
            userName: res.data.user.name,
            email: res.data.user.email
          });
          setUser(res.data.user);
        } else {
          log("AUTH_FAILED", "Token validation failed - loggedIn=false");
          localStorage.removeItem("token");
          setError("Token validation failed");
        }
      } catch (error) {
        console.error("[AUTH] Critical error during initialization:", error);
        
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            "Authentication initialization failed";
        
        log("ERROR", "Exception during auth check", {
          status: error.response?.status,
          message: errorMessage,
          code: error.code
        });

        // Clear invalid token
        localStorage.removeItem("token");
        setError(errorMessage);
      } finally {
        log("INIT_COMPLETE", "Authentication initialization complete", {
          isAuthenticated: !!user,
          hasError: !!error
        });
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      log("REFRESH", "No token available for refresh");
      setUser(null);
      return;
    }

    try {
      log("REFRESH", "Refreshing authentication");
      const res = await api.get("/auth/me");
      
      if (res.data.loggedIn && res.data.user) {
        log("REFRESH_SUCCESS", "Authentication refreshed", { 
          userId: res.data.user._id 
        });
        setUser(res.data.user);
      } else {
        log("REFRESH_FAILED", "Token no longer valid");
        localStorage.removeItem("token");
        setUser(null);
        setError("Token expired");
      }
    } catch (error) {
      console.error("[AUTH] Refresh failed:", error);
      log("REFRESH_ERROR", "Failed to refresh authentication", {
        status: error.response?.status
      });
      localStorage.removeItem("token");
      setUser(null);
      setError("Failed to refresh authentication");
    }
  }, []);

  const login = (userData) => {
    log("LOGIN", "Manual login triggered", { userId: userData._id });
    setUser(userData);
    setError(null);
  };

  const logout = () => {
    log("LOGOUT", "User logout initiated");
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      loading, 
      refreshAuth,
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
