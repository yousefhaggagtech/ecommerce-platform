import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/application/store/authStore";

// ─── Create Axios Instance ────────────────────────────────────────────────────

const axiosInstance: AxiosInstance = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // automatically send cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// On 401 — silently call /auth/refresh (cookie is sent automatically)
// then retry the original request

let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject:  (reason?: unknown) => void;
}[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(null);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Queue requests while refresh is in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => axiosInstance(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing           = true;

    try {
      // Cookie is sent automatically — no token needed in body
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      processQueue(null);

      // Retry the original request — new access token cookie is set
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError);

      // Refresh failed — clear local auth state and redirect to login
      try {
        useAuthStore.getState().clearAuth();
      } catch {}

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;