import axios from "axios";
import toast from "react-hot-toast";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api", // ✅ use proxy path
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ✅ Response interceptor for global error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
      toast.error(
        error.response.data?.message || `Error: ${error.response.status}`
      );
    } else if (error.request) {
      console.error("No response from server:", error.request);
      toast.error("Backend server is not running. Please start the server.");
    } else {
      console.error("Request setup error:", error.message);
      toast.error("Network error occurred");
    }
    return Promise.reject(error);
  }
);

export default API;
