export default function handler(request, response) {
    // This serverless function sends your Firebase config from Vercel to the frontend
    // The API key is NEVER visible - it stays secret in Vercel environment variables!
    
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Access-Control-Allow-Origin', '*');
    
    response.json({
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID
    });
}
