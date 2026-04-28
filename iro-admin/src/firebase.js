import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔥 Paste your Firebase project config here
// Go to: Firebase Console → Project Settings → Your Apps → SDK setup
const firebaseConfig = {
  apiKey: "AIzaSyAxzlrfuPQ3FVn-5F-uehwhREIRZHhslr8",
  authDomain:"irocattery-bb26e.firebaseapp.com",
  projectId: "irocattery-bb26e",
  storageBucket: "irocattery-bb26e.firebasestorage.app",
  messagingSenderId: "417525630269",
  appId: "1:417525630269:web:713f48ded7bf8b42153154",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
