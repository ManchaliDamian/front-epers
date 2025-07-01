// js/firebaseConfig.js

// Importa solo lo necesario para la inicialización
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js'; // Para Firestore

// Tu configuración de Firebase (reemplaza con tus propios datos)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializa Firebase una sola vez
const app = initializeApp(firebaseConfig);

// Obtiene la instancia de Firestore
const db = getFirestore(app);

// Exporta lo que necesites usar en otras partes de tu aplicación
export { db, app };
// Si solo usas Firestore, solo necesitas exportar db
// export { db };