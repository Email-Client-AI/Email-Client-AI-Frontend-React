import axios from "axios";

// LocalStorage key for access token
const ACCESS_TOKEN_KEY = "access_token";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api", // adjust for your backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Add response interceptors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message || error.message || 'An error occurred';

      switch (status) {
        case 401: // Unauthorized
        case 403: // Forbidden
          window.location.href = '/login';
          break;
        case 404: // Not Found
          window.location.href = '/not-found';
          break;
        default:
          alert(`Error ${status}: ${message}`);
          break;
      }
    } else {
      alert(error.message || 'An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);


export const saveAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export default api;
