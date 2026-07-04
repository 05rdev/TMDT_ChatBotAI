import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',
});

let refreshPromise: Promise<string> | null = null;

const isBrowser = () => typeof window !== 'undefined';

const clearAuthSession = () => {
  if (!isBrowser()) return;

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth-storage');
  window.dispatchEvent(new Event('auth:session-expired'));
};

const getRequestPath = (url?: string) => {
  if (!url) return '';

  try {
    return new URL(url, api.defaults.baseURL).pathname.replace(/^\/api/, '') || '/';
  } catch {
    return url.split('?')[0] || '';
  }
};

const isAuthRequiredRequest = (url?: string) => {
  const path = getRequestPath(url);

  return [
    '/admin',
    '/ai',
    '/auth/profile',
    '/auth/change-password',
    '/cart',
    '/notifications',
    '/orders',
    '/support',
    '/users',
    '/vouchers/check',
  ].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
};

const isProtectedPage = () => {
  if (!isBrowser()) return false;

  const path = window.location.pathname;
  return ['/admin', '/cart', '/checkout', '/profile', '/chatbot'].some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
};

const redirectToLogin = () => {
  if (!isBrowser()) return;

  const path = window.location.pathname;
  if (isProtectedPage() && path !== '/login' && path !== '/register') {
    window.location.replace('/login');
  }
};

api.interceptors.request.use((config) => {
  if (!isBrowser()) return config;

  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 503 && isBrowser()) {
      const path = window.location.pathname;
      if (!path.startsWith('/admin') && path !== '/maintenance') {
        window.location.replace('/maintenance');
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const authRequired = isAuthRequiredRequest(originalRequest.url);

      const refreshToken = isBrowser() ? localStorage.getItem('refreshToken') : null;
      if (!refreshToken) {
        clearAuthSession();
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${api.defaults.baseURL}/auth/refresh-token`, { refreshToken })
            .then((response) => {
              const { accessToken } = response.data.data || response.data;
              localStorage.setItem('accessToken', accessToken);
              return accessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const accessToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        if (axios.isAxiosError(refreshError) && refreshError.response) {
          clearAuthSession();
          redirectToLogin();

          if (!authRequired && !originalRequest._publicRetry) {
            originalRequest._publicRetry = true;
            delete originalRequest.headers?.Authorization;
            return api(originalRequest);
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
