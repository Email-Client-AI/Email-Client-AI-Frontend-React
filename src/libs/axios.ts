import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
// LocalStorage key for access token only
const ACCESS_TOKEN_KEY = "access_token";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  // IMPORTANT: This tells Axios to include cookies (the httpOnly refresh token)
  // in cross-site requests if your API is on a different port/domain.
  withCredentials: true, 
});

// --- Request Interceptor ---
// Attaches the valid Access Token to headers
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

// --- Response Interceptor ---
// Handles Token Refresh Logic
interface RetryQueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}

// To prevent multiple refresh calls when multiple requests fail simultaneously
let isRefreshing = false;
let failedQueue: RetryQueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 1. Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("try refreshing")
      
      // If we are already refreshing, add this request to a queue and wait
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 2. Attempt to refresh token
        // We use a separate axios instance or the global one to avoid infinite loops
        // 'withCredentials: true' ensures the browser sends the HttpOnly cookie
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`, 
          {}, 
          { withCredentials: true } 
        );

        const { accessToken } = response.data;

        // 3. Save new Access Token
        saveAccessToken(accessToken);

        // 4. Update header and retry original request
        if (originalRequest.headers) {
             originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        // Process any other requests that failed while we were refreshing
        processQueue(null, accessToken);
        
        return api(originalRequest);

      } catch (refreshError) {
        // 5. If refresh fails (cookie expired/invalid), logout user
        processQueue(refreshError, null);
        clearAccessToken();
        // window.location.href = '/login'; 
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// --- Helper Functions ---

export const saveAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export default api;