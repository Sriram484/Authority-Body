// src/firebase/config.ts
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLBjdUKqQNVcq5zLVMB5uUx1bIcUbT-80",
  authDomain: "assement-agency.firebaseapp.com",
  projectId: "assement-agency",
  storageBucket: "assement-agency.firebasestorage.app",
  messagingSenderId: "480463819642",
  appId: "1:480463819642:web:edc950cb584571b751fcc3",
  measurementId: "G-SZV9SN7M1B",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
