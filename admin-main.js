import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import emailjs from '@emailjs/browser'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "REPLACE_WITH_YOUR_NEW_KEY",
  authDomain: "gold-orders.firebaseapp.com",
  projectId: "gold-orders",
  storageBucket: "gold-orders.firebasestorage.app",
  messagingSenderId: "889006387701",
  appId: "1:889006387701:web:c567caa1ec22f95697b0bc"
};

let db;

// Initialize Firebase
console.log("Admin: Initializing Firebase...");
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  console.log("✅ Firebase initialized");
  console.log("✅ Firestore ready");
  
  document.getElementById('firebaseStatus').innerHTML = '✅ Firebase Connected Successfully';
  document.getElementById('firebaseStatus').classList.add('success-msg');
  console.log("✅ Admin panel ready!");
  
} catch (error) {
  console.error("Error:", error);
  document.getElementById('firebaseStatus').innerHTML = '❌ Error: ' + error.message;
}

// Admin login
window.adminLogin = function() {
  const password = document.getElementById('adminPassword').value;
  
  if (!password) {
    alert("Please enter a password");
    return;
  }
  
  if (password === 'admin123') {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    console.log("✅ Admin logged in successfully");
  } else {
    alert("❌ Invalid password! Please try again.");
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
  }
};

// Fetch pending orders
window.fetchPendingOrders = async function() {
  if (!db) {
    alert('System not initialized');
    return;
  }

  try {
    const q = query(collection(db, 'orders'), where('status', '==', 'Pending Payment'));
    const querySnapshot = await getDocs(q);
    
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';
    
    if (querySnapshot.empty) {
      ordersList.innerHTML = '<p style="padding: 20px; text-align: center;">No pending orders</p>';
      return;
    }
    
    querySnapshot.forEach((docSnap) => {
      const order = docSnap.data();
      const orderId = docSnap.id;
      
      ordersList.innerHTML += `
        <div class="order-item">
          <div class="order-info">
            <p><strong>${order.customerName}</strong> - ${order.customerPhone}</p>
            <p>Order ID: <strong>${order.orderId}</strong></p>
            <p>Amount: <strong>₹${order.totalAmount}</strong> | Gold: ${order.goldType} (${order.weight}g)</p>
            <p>Status: <span class="status-badge">${order.status}</span></p>
          </div>
          <div class="order-actions">
            <button onclick="approveOrder('${orderId}', '${order.orderId}', '${order.customerName}', '${order.customerPhone}', '${order.customerEmail}')">
              ✅ Approve Payment
            </button>
            <button onclick="rejectOrder('${orderId}')" class="reject-btn">
              ❌ Reject
            </button>
          </div>
        </div>
      `;
    });
    
  } catch (error) {
    console.error("Error:", error);
    alert("Error fetching orders: " + error.message);
  }
};

// Approve order
window.approveOrder = async function(orderId, orderIdText, customerName, customerPhone, customerEmail) {
  if (!db) {
    alert('System not initialized');
    return;
  }

  const deliveryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN');

  try {
    // Update order status
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: 'Confirmed',
      deliveryDate: deliveryDate,
      approvedDate: new Date().toLocaleDateString('en-IN')
    });
    
    console.log("✅ Order approved");
    
    // Send payment verified email
    await emailjs.send('service_a0y0e2k', 'template_ab6p3vh', {
      to_name: customerName,
      to_email: customerEmail,
      order_id: orderIdText,
      delivery_date: deliveryDate,
      customer_phone: customerPhone,
      deferral_note: ''
    });
    
    console.log("✅ Confirmation email sent");
    alert("✅ Order approved and confirmation email sent!");
    
    // Refresh list
    fetchPendingOrders();
    
  } catch (error) {
    console.error("Error:", error);
    alert("Error approving order: " + error.message);
  }
};

// Reject order
window.rejectOrder = async function(orderId) {
  if (!confirm("Are you sure you want to reject this order?")) {
    return;
  }

  if (!db) {
    alert('System not initialized');
    return;
  }

  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: 'Rejected'
    });
    
    console.log("✅ Order rejected");
    alert("Order rejected successfully");
    
    // Refresh list
    fetchPendingOrders();
    
  } catch (error) {
    console.error("Error:", error);
    alert("Error rejecting order: " + error.message);
  }
};

// View all orders
window.viewAllOrders = async function() {
  if (!db) {
    alert('System not initialized');
    return;
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';
    
    if (querySnapshot.empty) {
      ordersList.innerHTML = '<p style="padding: 20px; text-align: center;">No orders found</p>';
      return;
    }
    
    querySnapshot.forEach((docSnap) => {
      const order = docSnap.data();
      
      ordersList.innerHTML += `
        <div class="order-item">
          <div class="order-info">
            <p><strong>${order.customerName}</strong> - ${order.customerPhone}</p>
            <p>Order ID: <strong>${order.orderId}</strong></p>
            <p>Amount: ₹${order.totalAmount} | Gold: ${order.goldType} (${order.weight}g)</p>
            <p>Status: <span class="status-badge">${order.status}</span></p>
            <p>Order Date: ${order.orderDate}</p>
          </div>
        </div>
      `;
    });
    
  } catch (error) {
    console.error("Error:", error);
    alert("Error fetching orders: " + error.message);
  }
};

// Logout
window.logout = function() {
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('adminPassword').value = '';
  document.getElementById('adminPassword').focus();
  console.log("👋 Admin logged out");
};

// Make functions global
window.adminLogin = adminLogin;
window.fetchPendingOrders = fetchPendingOrders;
window.approveOrder = approveOrder;
window.rejectOrder = rejectOrder;
window.viewAllOrders = viewAllOrders;
window.logout = logout;
