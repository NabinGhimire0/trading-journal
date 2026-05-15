import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ==================== Auth API ====================
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

// ==================== Upload API ====================
export const uploadAPI = {
  uploadScreenshot: async (file) => {
    const formData = new FormData();
    formData.append("screenshot", file);
    const response = await api.post("/upload/screenshot", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

// ==================== Trades API ====================
export const tradesAPI = {
  create: (data) => api.post("/trades", data),
  getAll: (params) => api.get("/trades", { params }),
  getById: (id) => api.get(`/trades/${id}`),
  update: (id, data) => api.put(`/trades/${id}`, data),
  delete: (id) => api.delete(`/trades/${id}`),
  createReview: (id, data) => api.post(`/trades/${id}/review`, data),
  updateReview: (id, data) => api.put(`/trades/${id}/review`, data),
};

// ==================== Analytics API ====================
export const analyticsAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getMonthlyPerformance: (year) =>
    api.get("/dashboard/monthly-performance", { params: { year } }),
};

// ==================== Forex API (public) ====================
const forexClient = axios.create({ baseURL: API_BASE_URL });

export const forexPublicAPI = {
  getRates: (base = "USD") => forexClient.get(`/forex/rates?base=${base}`),
  getPopularPairs: (base = "USD") =>
    forexClient.get(`/forex/popular?base=${base}`),
};

// Export upload URL for image display
export { UPLOAD_URL };

export default api;
