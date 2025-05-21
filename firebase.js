// Import the functions you need from the SDKs you need
import { useRuntimeConfig } from "#app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const runtimeConfig = useRuntimeConfig();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: runtimeConfig.public.firebaseApiKey,
  authDomain: runtimeConfig.public.firebaseAuthDomain,
  projectId: runtimeConfig.public.firebaseProjectId,
  storageBucket: runtimeConfig.public.firebaseStorageBucket,
  messagingSenderId: runtimeConfig.public.firebaseMessagingSenderId,
  appId: runtimeConfig.public.firebaseAppId
};

// Remove all top-level Firebase initialization from this file.
// Instead, use the injected $db and $auth from Nuxt plugin in your composables/components.
// Example usage in a composable:
// const db = useNuxtApp().$db;
// const auth = useNuxtApp().$auth;
