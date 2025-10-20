const functions = require('firebase-functions');

// Minimal HTTP function placeholder used by firebase.json rewrites
exports.webapp = functions.https.onRequest((req, res) => {
  res.status(200).send('neuronutrition-app web function placeholder. Build and serve static web from Hosting.');
});

