// Dingel Hafizia Madrasa — Firebase Web Configuration
// Firebase Console project: dingel-hafizia-web-app

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMQ_BroxckOFgMyxafSIoSEQKDLgs-Gxo",
  authDomain: "dingel-hafizia-web-app.firebaseapp.com",
  projectId: "dingel-hafizia-web-app",
  storageBucket: "dingel-hafizia-web-app.firebasestorage.app",
  messagingSenderId: "628673453299",
  appId: "1:628673453299:web:41a55fb9d2d374ccd036b86",
  measurementId: "G-C0HLEQ6R3G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, firebaseConfig };
