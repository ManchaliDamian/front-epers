import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

//escucha cambios en tiempo real y ejecuta un callback
export function escucharUsuarios(callback) {
  const estadisticas_espiritus_ref = collection(db, "estadisticas_espiritus");

  onSnapshot(estadisticas_espiritus_ref, (snapshot) => {
    const espiritus = [];
    snapshot.forEach(doc => {
      espiritus.push({ id: doc.id, ...doc.data() });
    });
    callback(espiritus); 
  });
}
