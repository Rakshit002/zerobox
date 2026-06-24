import axios from "axios";

const DEBUG = import.meta.env.DEV;
const apiLog = (stage, message, data = null) => {
  if (DEBUG) {
    console.log(`[API] ${stage}: ${message}`, data || "");
  }
};

const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? "https://zerobox.onrender.com" : "http://localhost:3000");

const BASE_URL = `${backendUrl}/api`;

apiLog("INIT", "Creating axios instance", { BASE_URL });

const api = axios.create({
  baseURL: BASE_URL
});

// ============================================================
// REQUEST INTERCEPTOR: Add token to every request
// ============================================================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    apiLog("REQUEST", `${config.method.toUpperCase()} ${config.url}`, {
      hasAuth: true,
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + "..."
    });
  } else {
    apiLog("REQUEST", `${config.method.toUpperCase()} ${config.url}`, {
      hasAuth: false
    });
  }
  
  return config;
});

// ============================================================
// RESPONSE INTERCEPTOR: Handle auth errors
// ============================================================
api.interceptors.response.use(
  (response) => {
    apiLog("RESPONSE_SUCCESS", `${response.status}`, {
      url: response.config.url
    });
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    apiLog("RESPONSE_ERROR", `${status} from ${url}`, {
      message: error.message,
      statusCode: status
    });

    // If token is invalid or expired (401 Unauthorized)
    if (status === 401) {
      apiLog("AUTH_TOKEN_INVALID", "Token rejected by server", {
        url: url,
        message: error.response?.data?.message || "Unauthorized"
      });
      
      // Clear invalid token
      localStorage.removeItem("token");
      
      // Wait a brief moment to ensure localStorage is cleared,
      // then redirect to login (avoid redirect loops)
      setTimeout(() => {
        if (window.location.pathname !== "/login") {
          apiLog("REDIRECT", "Redirecting to login due to 401", {
            from: window.location.pathname
          });
          window.location.href = "/login";
        }
      }, 100);
    }
    
    // If other auth errors
    if (status === 403) {
      apiLog("AUTH_FORBIDDEN", "Access forbidden", {
        url: url,
        message: error.response?.data?.message || "Forbidden"
      });
    }

    return Promise.reject(error);
  }
);

export default api;

