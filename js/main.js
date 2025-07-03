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
    coordenada: { latitud: -34.9, longitud: -57.9 }, // coordenada de prueba, sin esto no funciona
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
    if (!response.ok) throw new Error("Error al guardar");
    dialog.close();
    form.reset();
    alert("Espíritu guardado correctamente");
    // Asigna el espíritu creado al usuario
    userSpirit = data;
    mostrarDatosEspirituUsuario();
  } catch (err) {
        // Asigna datos mockeados al espíritu del usuario
    userSpirit = {
        nombre: "MockSpirit",
        tipo: "ANGELICAL",
        ubicacionId: 1,
        ataque: 100,
        defensa: 80,
        id: 1
    };
    alert('FALLO LA CREACIÓN DEL ESPÍRITU, EL SHOW DEBE CONTINUAR. ASIGNANDO DATOS MOCKEADOS AL ESPÍRITU DEL USUARIO PARA QUE PUEDA AVANZAR LA DEMOSTRACION');
    // Opcional: muestra los datos en el panel de usuario
    mostrarDatosEspirituUsuario();
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
const ubicacionesTbody = document.querySelector('#ubicaciones-todas-table tbody');

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

async function renderAllEspiritus() {
    rankingTodosTbody.innerHTML = '';
    const snapshot = await getDocs(collection(db, "estadisticas_espiritus"));
    if (snapshot.empty) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.textContent = 'No hay espíritus registrados.';
        tr.appendChild(td);
        rankingTodosTbody.appendChild(tr);
        return;
    }
    snapshot.forEach(doc => {
        const espiritu = doc.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${espiritu.nombre || 'N/A'}</td>
            <td>${espiritu.ganadas ?? 0}</td>
            <td>${espiritu.perdidas ?? 0}</td>
            <td>${espiritu.jugadas ?? 0}</td>
            <td><button class="btn-action">⚔️</button> </td>
        `;
        rankingTodosTbody.appendChild(tr);
    });
}

renderAllEspiritus();

// Asegúrate de que este código esté presente y después de que el DOM esté cargado
const openEspirituBtn = document.getElementById('open-espiritu-btn');
const espirituDialog = document.getElementById('espiritu-dialog');

if (openEspirituBtn && espirituDialog) {
    openEspirituBtn.addEventListener('click', () => {
        espirituDialog.showModal();
    });
}

async function renderUbicaciones() {
    ubicacionesTbody.innerHTML = '';
    const snapshot = await getDocs(collection(db, "ubicaciones"));
    if (snapshot.empty) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.textContent = 'No hay ubicaciones registradas.';
        tr.appendChild(td);
        ubicacionesTbody.appendChild(tr);
        return;
    }
    snapshot.forEach(doc => {
        const ubicacion = doc.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${doc.id}</td>
            <td>${ubicacion.nombre || 'N/A'}</td>
            <td>${ubicacion.latitud ?? ''}</td>
            <td>${ubicacion.longitud ?? ''}</td>
        `;
        ubicacionesTbody.appendChild(tr);
    });
}

// Asignar un espíritu mockeado al iniciar sesión
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            alert('Error al iniciar sesión: ' + error.message);
        }
    });
}

// Función para mostrar los datos del espíritu del usuario en el panel
function mostrarDatosEspirituUsuario() {
    if (!userSpirit) return;
    document.getElementById('user-spirit-name').textContent = userSpirit.nombre;
    document.getElementById('user-spirit-type').textContent = userSpirit.tipo;
    document.getElementById('user-spirit-location').textContent = userSpirit.ubicacionId;
    document.getElementById('user-spirit-attack').textContent = userSpirit.ataque;
    document.getElementById('user-spirit-defense').textContent = userSpirit.defensa;
    document.getElementById('user-spirit-id').textContent = userSpirit.id;
}

renderUbicaciones();