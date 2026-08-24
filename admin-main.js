import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "REPLACE_WITH_YOUR_NEW_KEY",
  authDomain: "gold-orders.firebaseapp.com",
  projectId: "gold-orders",
  storageBucket: "gold-orders.firebasestorage.app",
  messagingSenderId: "889006387701",
  appId: "1:889006387701:web:c567caa1ec22f95697b0bc"
};

console.log("Admin: Initializing Firebase...");

try {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log("✅ Firebase initialized");
  console.log("✅ Firestore ready");
  
  document.getElementById('firebaseStatus').innerHTML = '✅ Firebase Connected';
  document.getElementById('firebaseStatus').classList.add('success-msg');
  console.log("✅ Admin panel ready!");
  
  // Make db globally available
  window.db = db;
  
} catch (error) {
  console.error("Error:", error);
  document.getElementById('firebaseStatus').innerHTML = '❌ Error: ' + error.message;
}

// Login function
function adminLogin() {
  const password = document.getElementById('adminPassword').value;
  if (password === 'admin123') {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    console.log("✅ Admin logged in");
  } else {
    alert("❌ Wrong password!");
    document.getElementById('adminPassword').value = '';
  }
}

// Logout function
function logout() {
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('adminPassword').value = '';
  console.log("👋 Admin logged out");
}

// Make functions global
window.adminLogin = adminLogin;
window.logout = logout;
