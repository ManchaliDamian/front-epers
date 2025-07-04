import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Configuración de Firebase Firestore.
const firebaseConfig = {
    apiKey: "AIzaSyCuJ1XYZQLyIE8MgGeBeWQb0boAPQqH_iM",
    authDomain: "epers-86648.firebaseapp.com",
    projectId: "epers-86648",
    storageBucket: "epers-86648.firebasestorage.app",
    messagingSenderId: "855932523812",
    appId: "1:855932523812:web:5e6b37133918d5af134fb1",
    measurementId: "G-SS3DJPEVKX",
};

const app = initializeApp(firebaseConfig);

// Se obtiene la instancia de Firestore
const db = getFirestore(app);

export { app, db };
