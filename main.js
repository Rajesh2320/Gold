import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import emailjs from '@emailjs/browser'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "REPLACE_WITH_YOUR_NEW_KEY",
  authDomain: "gold-orders.firebaseapp.com",
  projectId: "gold-orders",
  storageBucket: "gold-orders.firebasestorage.app",
  messagingSenderId: "889006387701",
  appId: "1:889006387701:web:c567caa1ec22f95697b0bc"
};

let db, storage;

// Initialize Firebase
console.log("Initializing Firebase...");
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  
  console.log("✅ Firebase initialized");
  console.log("✅ Firestore ready");
  console.log("✅ Storage ready");
  
  emailjs.init("8KaDRKTZiJkhff6TU");
  console.log("✅ EmailJS initialized");
  
  // Show order form
  document.getElementById('status').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  
  console.log("✅✅✅ ALL SYSTEMS GO ✅✅✅");
  
} catch (error) {
  console.error("Error:", error);
  document.getElementById('status').innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
}

// Gold type options
const goldOptions = {
  'gold-biscuit': { name: 'Gold Biscuit', pricePerGram: 50, minWeight: 5, maxWeight: 1000 },
  'gold-coin': { name: 'Gold Coin', pricePerGram: 52, minWeight: 1, maxWeight: 100 },
  'gold-bar': { name: 'Gold Bar', pricePerGram: 48, minWeight: 10, maxWeight: 500 }
};

// Handle gold type change
window.handleGoldTypeChange = function() {
  const goldType = document.getElementById('goldType').value;
  const option = goldOptions[goldType];
  document.getElementById('priceInfo').innerHTML = 
    `<p>Price: ₹${option.pricePerGram}/gram | Min: ${option.minWeight}g | Max: ${option.maxWeight}g</p>`;
};

// Calculate total
window.calculateTotal = function() {
  const goldType = document.getElementById('goldType').value;
  const weight = parseFloat(document.getElementById('weight').value) || 0;
  const option = goldOptions[goldType];
  const total = weight * option.pricePerGram;
  document.getElementById('totalAmount').value = total || 0;
};

// Submit order
window.submitOrder = async function(e) {
  e.preventDefault();
  
  if (!db || !storage) {
    alert('System not initialized. Please refresh the page.');
    return;
  }

  const formData = {
    customerName: document.getElementById('customerName').value,
    customerPhone: document.getElementById('customerPhone').value,
    customerEmail: document.getElementById('customerEmail').value,
    goldType: document.getElementById('goldType').value,
    weight: parseFloat(document.getElementById('weight').value),
    totalAmount: parseFloat(document.getElementById('totalAmount').value),
    deliveryAddress: document.getElementById('deliveryAddress').value,
    orderDate: new Date().toLocaleDateString('en-IN'),
    status: 'Pending Payment',
    orderId: 'ORD' + Date.now()
  };

  try {
    // Save to Firestore
    const docRef = await addDoc(collection(db, 'orders'), formData);
    console.log("✅ Order created:", docRef.id);
    
    // Send confirmation email
    await emailjs.send('service_a0y0e2k', 'template_rnj2q45', {
      to_name: formData.customerName,
      to_email: formData.customerEmail,
      order_id: formData.orderId,
      amount: formData.totalAmount,
      customer_phone: formData.customerPhone,
      deadline: new Date(Date.now() + 30 * 60000).toLocaleTimeString('en-IN'),
      upi_id: '9884908910@hdfc',
      qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=9884908910@hdfc&pn=Gold&am=' + formData.totalAmount,
      search_link: window.location.origin + '/?id=' + formData.orderId
    });
    
    console.log("✅ Confirmation email sent");
    
    // Show success message
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('successMessage').innerHTML = `✅ Order placed successfully! Order ID: <strong>${formData.orderId}</strong><br>Confirmation email sent to ${formData.customerEmail}`;
    document.getElementById('orderForm').style.display = 'none';
    
    // Reset form
    document.getElementById('orderFormElement').reset();
    
  } catch (error) {
    console.error("Error:", error);
    alert("Error placing order: " + error.message);
  }
};

// Search order
window.searchOrder = async function(e) {
  e.preventDefault();
  
  if (!db) {
    alert('System not initialized. Please refresh the page.');
    return;
  }

  const orderId = document.getElementById('searchOrderId').value.trim();
  
  if (!orderId) {
    alert('Please enter an Order ID');
    return;
  }

  try {
    const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      document.getElementById('searchResults').innerHTML = '<p>Order not found</p>';
      return;
    }
    
    const order = querySnapshot.docs[0].data();
    document.getElementById('searchResults').innerHTML = `
      <div class="order-details">
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Amount:</strong> ₹${order.totalAmount}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Gold Type:</strong> ${order.goldType}</p>
        <p><strong>Weight:</strong> ${order.weight}g</p>
      </div>
    `;
    
  } catch (error) {
    console.error("Error:", error);
    alert("Error searching order: " + error.message);
  }
};

// Handle URL parameters for auto-search
window.handleUrlParameters = function() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('id');
  
  if (orderId) {
    document.getElementById('searchOrderId').value = orderId;
    setTimeout(() => {
      document.getElementById('searchForm').dispatchEvent(new Event('submit'));
    }, 500);
  }
};

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleUrlParameters);
} else {
  handleUrlParameters();
}

// Make functions global
window.calculateTotal = calculateTotal;
window.handleGoldTypeChange = handleGoldTypeChange;
window.submitOrder = submitOrder;
window.searchOrder = searchOrder;
