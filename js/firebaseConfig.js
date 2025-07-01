// js/firebaseConfig.js

// Importa solo lo necesario para la inicialización
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js'; // Para Firestore

// Tu configuración de Firebase (reemplaza con tus propios datos)
const firebaseConfig = {
    apiKey: "AIzaSyA69OOCQZivUPKkdIv98ZmetSxU2B2I2rY",
    authDomain: "epers-proyect.firebaseapp.com",
    projectId: "epers-proyect",
    storageBucket: "epers-proyect.firebasestorage.app",
    messagingSenderId: "1031867506643",
    appId: "1:1031867506643:web:2759dfdd0ba111cb52d926",
    measurementId: "G-EE1Q00HZ23"
  };

// Inicializa Firebase una sola vez
const app = initializeApp(firebaseConfig);

// Obtiene la instancia de Firestore
const db = getFirestore(app);

// Exporta lo que necesites usar en otras partes de tu aplicación
export { db };
// Si solo usas Firestore, solo necesitas exportar db
// export { db };