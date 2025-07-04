import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Configuración de Firebase Firestore.
const firebaseConfig = {
  apiKey: "AIzaSyDlrZ-ChyT0kWgnPFw0YIpp98jXrLIovYk",
  authDomain: "epers-ejemplo.firebaseapp.com",
  projectId: "epers-ejemplo",
  storageBucket: "epers-ejemplo.firebasestorage.app",
  messagingSenderId: "990135446957",
  appId: "1:990135446957:web:3db72349a21a21577d4524",
  measurementId: "G-CMZPTMWD1X"
};

const app = initializeApp(firebaseConfig);

// Se obtiene la instancia de Firestore
const db = getFirestore(app);

export { app, db };
