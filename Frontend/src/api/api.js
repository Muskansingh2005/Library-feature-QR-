// [file name]: api.js - UPDATED
import axios from "axios";
import toast from "react-hot-toast";

// Create API instance with better configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: false,
});
// ✅ Request interceptor for logging
API.interceptors.request.use(
  (config) => {
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Enhanced response interceptor for global error handling
API.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const { response, request, message } = error;

    if (response) {
      // Server responded with error status
      const errorMessage =
        response.data?.message ||
        `Error: ${response.status} ${response.statusText}`;

      console.error("API Error:", response.status, response.data);

      // Don't show toast for 401 errors (handled by auth system)
      if (response.status !== 401) {
        toast.error(errorMessage);
      }
    } else if (request) {
      // Request made but no response received
      console.error("No response from server:", request);
      toast.error("Backend server is not running. Please start the server.");
    } else {
      // Something happened in setting up the request
      console.error("Request setup error:", message);
      toast.error("Network error occurred. Check your connection.");
    }

    return Promise.reject(error);
  }
);

// ✅ API methods for better organization
export const bookAPI = {
  getAll: () => API.get("/books"),
  getById: (id) => API.get(`/books/${id}`),
  create: (data) => API.post("/books", data),
};

export const studentAPI = {
  getAll: () => API.get("/students"),
  create: (data) => API.post("/students", data),
};

export const transactionAPI = {
  getAll: (params) => API.get("/transactions", { params }),
  issue: (data) => API.post("/transactions/issue", data),
  return: (data) => API.post("/transactions/return", data),
};

export default API;
