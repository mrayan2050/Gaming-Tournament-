import admin from "firebase-admin";

// Credentials come from environment variables (not a JSON file) so this
// works both locally (via server/.env) and on hosting platforms like Render,
// where you can't upload a gitignored file — only set env vars in their dashboard.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Render (and most dashboards) store this as a literal string with \n
  // sequences; this turns them back into real newlines for the PEM key.
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.warn('⚠️  Firebase Admin env vars missing (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY) — auth will fail.');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firebaseAuth = admin.auth();
export default admin;