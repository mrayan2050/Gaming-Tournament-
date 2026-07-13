import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIRE_BASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services needed by authService.js
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Without this, Google silently reuses the browser's existing signed-in
// session instead of showing the account picker — this forces the chooser
// to appear every time so users can pick which Google account to use.
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;