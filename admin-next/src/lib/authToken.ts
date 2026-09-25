import axios from 'axios';

// Every admin-next API call goes through the shared global axios instance
// (there's no client wrapper like storefront-next has), so the token is
// attached here once, read straight from localStorage — simplest way to
// cover every existing axios.get/post/put/delete call site without editing
// each of the ~20 lib/api/*.ts files.
const STORAGE_KEY = 'piaarya_admin_auth';

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
