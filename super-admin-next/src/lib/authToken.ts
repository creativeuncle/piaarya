import axios from 'axios';

// Every super-admin-next API call goes through the shared global axios
// instance, so the token is attached here once, read straight from
// localStorage — same pattern as admin-next's lib/authToken.ts.
const STORAGE_KEY = 'piaarya_platform_auth';

axios.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const token = raw ? JSON.parse(raw)?.token : null;
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  } catch {
    // localStorage unavailable (SSR, private mode) — send the request unauthenticated.
  }
  return config;
});

export { STORAGE_KEY };
