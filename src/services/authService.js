import {
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import api from './api';
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return exchangeFirebaseToken(idToken);
}
export async function sendMobileOTP(phoneNumber, recaptchaContainerId = 'recaptcha-container') {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
    });
  }
  const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
  return signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
}
export async function verifyMobileOTP(confirmationResult, otp) {
  const result = await confirmationResult.confirm(otp);
  const idToken = await result.user.getIdToken();
  return exchangeFirebaseToken(idToken);
}
async function exchangeFirebaseToken(idToken) {
  const { data } = await api.post('/auth/firebase-login', { idToken });
  // data = { token, user, wallet }
  localStorage.setItem('battlearena_token', data.token);
  return data;
}
export function logoutLocal() {
  localStorage.removeItem('battlearena_token');
  return auth.signOut();
}
