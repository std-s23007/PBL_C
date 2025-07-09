import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebaseの設定情報
const firebaseConfig = {
  apiKey: "AIzaSyDug6k408E81owFyQNA98YjikBAqGlE7mM",
  authDomain: "pbl-c-54088.firebaseapp.com",
  projectId: "pbl-c-54088",
  storageBucket: "pbl-c-54088.firebasestorage.app",
  messagingSenderId: "44768519903",
  appId: "1:44768519903:web:6b8a002e5981bb1300ab6a",
  measurementId: "G-D8B3QJG0G9"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
