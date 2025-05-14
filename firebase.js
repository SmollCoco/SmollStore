// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgm0DGuC1X8L0j1Z7LElHgfLynlgQaAE4",
  authDomain: "smollstore.firebaseapp.com",
  projectId: "smollstore",
  storageBucket: "smollstore.firebasestorage.app",
  messagingSenderId: "656049445204",
  appId: "1:656049445204:web:85595f1966f77246e3d0c1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
