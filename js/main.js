import { db } from './firebaseConfig.js'; 
import { collection, onSnapshot, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { app } from './firebaseConfig.js';

// Variable global para el espíritu del usuario
let userSpirit = null;

const dialog = document.getElementById("espiritu-dialog");
const form = document.getElementById("espiritu-form");
// dialog.showModal(); // Elimina o comenta esta línea

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    nombre: form.nombre.value,
    tipo: form.tipo.value,
    //-----------------------
    ubicacionId: parseInt(form.ubicacionId.value, 10), //sin esto no funciona, antes persistir una ubicación y usar su id
    coordenada: { "latitud": 2.0, "longitud": 1.0 }, // coordenada de prueba, sin esto no funciona
    //-----------------------
    ataque: parseInt(form.ataque.value, 10),
    defensa: parseInt(form.defensa.value, 10),
  };
  try {
    const response = await fetch("http://localhost:8080/espiritu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    //if (!response.ok) throw new Error("Error al guardar");
    if (!response.ok) {
      // 1) Intentamos leer un JSON con { message: "..." }
      const errBody = await response.json().catch(() => null);
      // 2) Si existe errBody.message, lo mostramos; si no, un mensaje genérico
      const msg = errBody?.message || `Error al guardar (status ${response.status})`;
      alert(msg);
      return; // salimos sin cerrar modal
    }
    const creado = await response.json();

    dialog.close();
    form.reset();
    alert("Espíritu guardado correctamente");
    // Asigna el espíritu creado al usuario
    userSpirit = creado;
    mostrarDatosEspirituUsuario();
  } catch (err) {
        // Asigna datos mockeados al espíritu del usuario
    // userSpirit = {
    //     nombre: "MockSpirit",
    //     tipo: "ANGELICAL",
    //     ubicacionId: 1,
    //     ataque: 100,
    //     defensa: 80,
    //     id: 1
    // };
    //alert('FALLO LA CREACIÓN DEL ESPÍRITU, EL SHOW DEBE CONTINUAR. ASIGNANDO DATOS MOCKEADOS AL ESPÍRITU DEL USUARIO PARA QUE PUEDA AVANZAR LA DEMOSTRACION');
    // Opcional: muestra los datos en el panel de usuario
    // mostrarDatosEspirituUsuario();
    console.error(err);
    alert("Falló al guardar el espíritu");
  }
});

// Selecciona los TBODY de las tablas
const rankingGanadasTbody = document.querySelector('#ranking-ganadas-table tbody');
const rankingPerdidasTbody = document.querySelector('#ranking-perdidas-table tbody');
const rankingJugadasTbody = document.querySelector('#ranking-jugadas-table tbody');
// Tabla de todos los espíritus con todos sus atributos
const rankingTodosTbody = document.querySelector('#ranking-todos-table tbody');

// Función para renderizar los rankings en tablas
function renderRankingTable(tbodyElement, snapshot, metricName) {
    tbodyElement.innerHTML = '';

    if (snapshot.empty) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.textContent = `No hay datos de ${metricName} disponibles.`;
        tr.appendChild(td);
        tbodyElement.appendChild(tr);
        return;
    }

    let pos = 1;
    snapshot.forEach(doc => {
        const espiritu = doc.data();
        const tr = document.createElement('tr');
        // Posición
        const tdPos = document.createElement('td');
        tdPos.textContent = pos++;
        tr.appendChild(tdPos);
        // Nombrex
        const tdNombre = document.createElement('td');
        tdNombre.textContent = espiritu.nombre || 'N/A';
        tr.appendChild(tdNombre);
        // Métrica
        const tdMetric = document.createElement('td');
        tdMetric.textContent = espiritu[metricName] || 0;
        tr.appendChild(tdMetric);

        tbodyElement.appendChild(tr);
    });
}

// Listener para Espíritus con más Batallas Ganadas 
const qGanadas = query(
    collection(db, "estadisticas_espiritus"),
    orderBy("ganadas", "desc"), 
    limit(5) 
);

onSnapshot(qGanadas, (snapshot) => {
    renderRankingTable(rankingGanadasTbody, snapshot, "ganadas");
});

// Listener para Espíritus con más Batallas Perdidas 
const qPerdidas = query(
    collection(db, "estadisticas_espiritus"),
    orderBy("perdidas", "desc"), 
    limit(5) 
);

onSnapshot(qPerdidas, (snapshot) => {
    renderRankingTable(rankingPerdidasTbody, snapshot, "perdidas");
}, (error) => {
    rankingPerdidasTbody.innerHTML = '<tr><td colspan="3">Error al cargar datos.</td></tr>';
});

// Listener para Espíritus con más Batallas Jugadas 
const qJugadas = query(
    collection(db, "estadisticas_espiritus"),
    orderBy("jugadas", "desc"), 
    limit(5) 
);

onSnapshot(qJugadas, (snapshot) => {
    renderRankingTable(rankingJugadasTbody, snapshot, "jugadas");
}, (error) => {
    rankingJugadasTbody.innerHTML = '<tr><td colspan="3">Error al cargar datos.</td></tr>';
});

function renderAllEspiritus(snapshot) {
  rankingTodosTbody.innerHTML = '';
  if (snapshot.empty) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'No hay espíritus registrados.';
    tr.appendChild(td);
    rankingTodosTbody.appendChild(tr);
    return;
  }
  snapshot.forEach(doc => {
    const e = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.nombre}</td>
      <td>${e.vida}</td>
      <td>${e.tipo}</td>
      <td>${e.ataque}</td>
      <td>${e.defensa}</td>
      <td><button class="btn-action" data-id="${doc.id}">⚔️</button></td>
    `;
    rankingTodosTbody.appendChild(tr);
  });
}

// Suscripción reactiva:
const qAll = collection(db, "estadisticas_espiritus");
onSnapshot(qAll, renderAllEspiritus, err => {
  console.error("Error recibiendo todos los espíritus:", err);
});


const attackEspirituBtn = document.getElementById('open-espiritu-btn');
try {
    const response = await fetch("http://localhost:8080/espiritu/"+userSpirit.id+"/combatir/"+idAAtacar, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al guardar");
    dialog.close();
    form.reset();
    alert("Espíritu guardado correctamente");
    userSpirit = data;
    mostrarDatosEspirituUsuario();
  } catch (err) {
    console.error(err);
    alert("Falló el combate. O sea no la acción de atacar, sino el fetch al servidor. Fijte que onda eso porque puede ponerse feo. Fijate capaz esta data te sirve: " + err.message);
  }


// Asegúrate de que este código esté presente y después de que el DOM esté cargado
const openEspirituBtn = document.getElementById('open-espiritu-btn');
const espirituDialog = document.getElementById('espiritu-dialog');

if (openEspirituBtn && espirituDialog) {
    openEspirituBtn.addEventListener('click', () => {
        espirituDialog.showModal();
    });
}


// Función para mostrar los datos del espíritu del usuario en el panel
function mostrarDatosEspirituUsuario() {
    if (!userSpirit) return;
    document.getElementById('user-spirit-name').textContent = userSpirit.nombre;
    document.getElementById('user-spirit-type').textContent = userSpirit.tipo;
    document.getElementById('user-spirit-attack').textContent = userSpirit.ataque;
    document.getElementById('user-spirit-defense').textContent = userSpirit.defensa;
    document.getElementById('user-spirit-id').textContent = userSpirit.id;
}
