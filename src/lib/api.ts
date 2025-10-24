import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { initializeFirebase } from '@/firebase/index';

// Initialize Firebase to ensure getAuth() can work.
// This is safe to call multiple times as it checks if an app already exists.
initializeFirebase();

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
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
