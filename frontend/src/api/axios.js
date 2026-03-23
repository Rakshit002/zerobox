import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Add token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle failed auth responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid or expired
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Force reload to trigger new auth check
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

