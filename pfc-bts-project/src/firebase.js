// ═══════════════════════════════════════════════════════════
// FIREBASE CONFIG — Replace these values with your own!
// Get them from: Firebase Console > Project Settings > Your App
// ═══════════════════════════════════════════════════════════

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Single document that holds all app data (simple for small groups)
const DATA_DOC = doc(db, 'appData', 'main');

export async function loadData() {
  try {
    const snap = await getDoc(DATA_DOC);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error("Firebase load error:", err);
    return null;
  }
}

export async function saveData(data) {
  try {
    await setDoc(DATA_DOC, data);
  } catch (err) {
    console.error("Firebase save error:", err);
  }
}

// Real-time listener — when anyone updates, everyone sees it
export function onDataChange(callback) {
  return onSnapshot(DATA_DOC, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
}
