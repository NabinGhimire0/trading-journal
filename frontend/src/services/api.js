import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
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

// Response interceptor for auth errors
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

export default api;
