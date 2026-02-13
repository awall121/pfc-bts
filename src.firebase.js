javascriptimport { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDg2gUZDsIf1jQkTtuq7cNPZnZR0duYUOQ",
  authDomain: "pfc-bts-6545c.firebaseapp.com",
  projectId: "pfc-bts-6545c",
  storageBucket: "pfc-bts-6545c.firebasestorage.app",
  messagingSenderId: "873953532643",
  appId: "1:873953532643:web:92bb9fdccdc0ee4c61c3d6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
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

export function onDataChange(callback) {
  return onSnapshot(DATA_DOC, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
}
