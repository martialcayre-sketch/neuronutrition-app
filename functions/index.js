const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Admin SDK
try { admin.app(); } catch (e) { admin.initializeApp(); }

// Minimal HTTP function placeholder used by firebase.json rewrites
exports.webapp = functions.https.onRequest((req, res) => {
  res.status(200).send('neuronutrition-app web function placeholder. Build and serve static web from Hosting.');
});

// Secure admin utility: set or unset custom admin claim.
// Usage: POST /setUserAdmin with header x-admin-api-key: <secret> and JSON body { uid: string, admin: boolean }
exports.setUserAdmin = functions.https.onRequest(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('Content-Type', 'application/json');
  // Basic CORS for manual calls; tighten as needed
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-admin-api-key');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).send(JSON.stringify({ error: 'Method not allowed' }));

  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) return res.status(500).send(JSON.stringify({ error: 'Server not configured' }));
  const provided = req.get('x-admin-api-key');
  if (!provided || provided !== apiKey) return res.status(401).send(JSON.stringify({ error: 'Unauthorized' }));

  const { uid, admin: isAdmin } = req.body || {};
  if (!uid || typeof isAdmin !== 'boolean') return res.status(400).send(JSON.stringify({ error: 'Invalid payload' }));

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });
    return res.status(200).send(JSON.stringify({ ok: true, uid, admin: isAdmin }));
  } catch (err) {
    console.error(err);
    return res.status(500).send(JSON.stringify({ error: String(err && err.message || err) }));
  }
});

// Read claims for a user (debug). Requires same header as above.
exports.getUserClaims = functions.https.onRequest(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('Content-Type', 'application/json');
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-admin-api-key');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'GET') return res.status(405).send(JSON.stringify({ error: 'Method not allowed' }));
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) return res.status(500).send(JSON.stringify({ error: 'Server not configured' }));
  const provided = req.get('x-admin-api-key');
  if (!provided || provided !== apiKey) return res.status(401).send(JSON.stringify({ error: 'Unauthorized' }));
  const uid = req.query.uid;
  if (!uid) return res.status(400).send(JSON.stringify({ error: 'Missing uid' }));
  try {
    const user = await admin.auth().getUser(uid);
    return res.status(200).send(JSON.stringify({ uid, claims: user.customClaims || {} }));
  } catch (err) {
    console.error(err);
    return res.status(500).send(JSON.stringify({ error: String(err && err.message || err) }));
  }
});
