import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKg4WpZCVyiuC7NrMPa6_l-5IOcJGKlXg",
  authDomain: "os3org-6c6ed.firebaseapp.com",
  projectId: "os3org-6c6ed",
  storageBucket: "os3org-6c6ed.firebasestorage.app",
  messagingSenderId: "789447243809",
  appId: "1:789447243809:web:051025ee2c9d10a15f0b60",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
