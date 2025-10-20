import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Connect to emulators if requested
const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === '1' || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
if (useEmulators) {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:5004', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 5003)
    connectStorageEmulator(storage, '127.0.0.1', 5005)
    // eslint-disable-next-line no-console
    console.log('[firebase] Connected to local emulators')
  } catch (e) {
    // ignore repeated connections in HMR
  }
}
