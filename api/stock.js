// api/stock.js
//
// Vercel serverless function — computes remaining daily stock using
// the Firebase ADMIN SDK (server-side, bypasses Firestore security
// rules entirely, which is fine here because this code runs on
// Vercel's server, never in the customer's browser).
//
// Why this exists: the customer page needs to know "how much stock
// is left today", which requires looking at every order placed today.
// Doing that from the browser would mean either (a) giving the public
// read/list access to the whole orders collection — exposing every
// customer's name, phone, email and payment-proof screenshot — or
// (b) this: compute it once, server-side, and hand back a single
// number. See firestore.rules for the corresponding "list: admin only"
// rule this makes possible.
//
// Required Vercel environment variables (Project Settings > Environment
// Variables — see SECURITY_SETUP_GUIDE.md for how to get these):
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY   (paste with literal \n sequences; this file
//                           converts them back to real newlines below)

const admin = require('firebase-admin');

// Keep this in sync with the MAX_STOCK_AVAILABLE business rule.
// (Previously lived only in index.html; now the source of truth is
// here since this is the code path that actually enforces it.)
const MAX_STOCK_AVAILABLE_GRAMS = 9000;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  // Never cache this response — stock changes with every order.
  res.setHeader('Cache-Control', 'no-store');

  try {
    const snapshot = await db.collection('orders').get();
    const today = new Date().toLocaleDateString('en-IN');
    const paidStatuses = ['Pending', 'Completed', 'Paid'];

    let totalGramsOrdered = 0;

    snapshot.forEach((doc) => {
      const order = doc.data();
      const orderDateStr = order.timestamp || order.createdAt;
      let orderDate = '';

      if (orderDateStr) {
        if (orderDateStr.includes(',')) {
          orderDate = orderDateStr.split(',')[0].trim();
        } else if (orderDateStr.includes('T')) {
          orderDate = new Date(orderDateStr).toLocaleDateString('en-IN');
        }
      }

      if (orderDate === today && paidStatuses.includes(order.status)) {
        const weightKg = parseFloat(order.totalWeight || order.totalKg || 0);
        totalGramsOrdered += weightKg * 1000;
      }
    });

    let stockAvailable = MAX_STOCK_AVAILABLE_GRAMS - totalGramsOrdered;
    if (stockAvailable < 0) stockAvailable = 0;

    res.status(200).json({
      available: Math.round(stockAvailable),
      max: MAX_STOCK_AVAILABLE_GRAMS,
    });
  } catch (error) {
    console.error('Stock API error:', error);
    res.status(500).json({ error: 'Unable to compute stock' });
  }
};
