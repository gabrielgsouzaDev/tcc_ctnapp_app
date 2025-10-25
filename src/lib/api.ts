import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { initializeFirebase } from '@/firebase/index';

// Initialize Firebase to ensure getAuth() can work.
// This is safe to call multiple times as it checks if an app already exists.
initializeFirebase();

const api = axios.create({
  baseURL: 'https://ctnapp-api-427218.uc.r.appspot.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Axios interceptor to add the Firebase ID token to every request
api.interceptors.request.use(
  async (config) => {
    // getAuth() must be called inside the interceptor to ensure Firebase is initialized.
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Could not get Firebase ID token.', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
