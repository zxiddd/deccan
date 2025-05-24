// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2BA9aJpDB5NKssH-wW-RFZlZLPiRdhFA",
  authDomain: "discountdeccan.firebaseapp.com",
  projectId: "discountdeccan",
  storageBucket: "discountdeccan.firebasestorage.app",
  messagingSenderId: "603416570550",
  appId: "1:603416570550:web:58b53e76355525d8869417",
  measurementId: "G-5K1XLLQXN2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
