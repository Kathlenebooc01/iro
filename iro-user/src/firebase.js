import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Same config as iro-admin — both apps share the same Firebase project
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
export const auth = getAuth(app);
