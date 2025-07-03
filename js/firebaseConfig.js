import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Configuración de Firebase Firestore.
const firebaseConfig = {
    apiKey: "AIzaSyDck0vFcBJZSCua3fyX5P0ODRlFdx4eajs",
    authDomain: "epersproyect.firebaseapp.com",
    databaseURL: "https://epersproyect-default-rtdb.firebaseio.com",
    projectId: "epersproyect",
    storageBucket: "epersproyect.appspot.com",
    messagingSenderId: "540144396874",
    appId: "1:540144396874:web:65a5e11ebd431db1abd4b3",
    measurementId: "G-NKTDPXFTH6"
};

const app = initializeApp(firebaseConfig);

// Se obtiene la instancia de Firestore
const db = getFirestore(app);

export { app, db };
