export default function handler(request, response) {
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  try {
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY || '',
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.VITE_FIREBASE_APP_ID || ''
    };

    response.status(200).json(firebaseConfig);
  } catch (error) {
    response.status(500).json({ error: 'Failed to load config' });
  }
}
