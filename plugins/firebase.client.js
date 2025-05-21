// plugins/firebase.client.js
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  // Ensure config values are present (fallback to process.env for dev/build time)
  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey || process.env.FIREBASE_API_KEY,
    authDomain: config.public.firebaseAuthDomain || process.env.FIREBASE_AUTH_DOMAIN,
    projectId: config.public.firebaseProjectId || process.env.FIREBASE_PROJECT_ID,
    storageBucket: config.public.firebaseStorageBucket || process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.public.firebaseMessagingSenderId || process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: config.public.firebaseAppId || process.env.FIREBASE_APP_ID
  };

  let app;
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  const db = getFirestore(app);
  const auth = getAuth(app);

  nuxtApp.provide('db', db);
  nuxtApp.provide('auth', auth);
});
