import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import emailjs from '@emailjs/browser'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "REPLACE_WITH_YOUR_NEW_KEY",
  authDomain: "gold-orders.firebaseapp.com",
  projectId: "gold-orders",
  storageBucket: "gold-orders.firebasestorage.app",
  messagingSenderId: "889006387701",
  appId: "1:889006387701:web:c567caa1ec22f95697b0bc"
};

console.log("Initializing Firebase...");

try {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);
  
  console.log("✅ Firebase initialized");
  console.log("✅ Firestore ready");
  console.log("✅ Storage ready");
  
  emailjs.init("8KaDRKTZiJkhff6TU");
  console.log("✅ EmailJS initialized");
  
  document.getElementById('status').innerHTML = '<div class="success">✅ System Connected Successfully!</div>';
  console.log("✅✅✅ ALL SYSTEMS GO ✅✅✅");
  
  // Make db and storage globally available if needed
  window.db = db;
  window.storage = storage;
  
} catch (error) {
  console.error("Error:", error);
  document.getElementById('status').innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
}
