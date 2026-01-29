import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "ここにAPIキー",
  authDomain: "xxxx.firebaseapp.com",
  projectId: "siege-map-board",
  storageBucket: "xxxx.appspot.com",
  messagingSenderId: "xxxx",
  appId: "xxxx"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);