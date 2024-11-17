// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCXP-tqEDWa0sJp4j8nLAlExkQ1SKdcf1A",
    authDomain: "ai-art-auth.firebaseapp.com",
    projectId: "ai-art-auth",
    storageBucket: "ai-art-auth.firebasestorage.app",
    messagingSenderId: "600159720718",
    appId: "1:600159720718:web:3bec7cdaebb18c6531335f"
  };


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
