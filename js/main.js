import { db } from './firebaseConfig.js'; 
import { collection, onSnapshot, query, orderBy, limit, doc } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
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
      ubicacionId: 1,
      coordenada: { "latitud": -34.603733, "longitud": -58.382033 },
      ataque: parseInt(form.ataque.value, 10),
      defensa: parseInt(form.defensa.value, 10),
  };
  console.log(data);
  try {
    const response = await fetch("http://localhost:8080/espiritu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      const msg = errBody?.message || `Error al guardar (status ${response.status})`;
      alert(msg);
      return;
    }
    const creado = await response.json();
    // Asignar el id al userSpirit y suscribirse a los cambios en tiempo real
    userSpirit = { ...creado, id: creado.id };
    mostrarDatosEspiritu(userSpirit);
    suscribirDatosEspiritu(userSpirit.id);

    dialog.close();
    form.reset();

  } catch (err) {
    console.error(err);
    alert("Falló al guardar el espíritu: " + err.message);
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
        if (espiritu.id == userSpirit?.id) {
            tr.classList.add('user-spirit'); // Clase para destacar el espíritu del usuario
        }
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


//const attackEspirituBtn = document.getElementById('open-espiritu-btn');
//try {
//    const response = await fetch("http://localhost:8080/espiritu/"+userSpirit.id+"/combatir/"+idAAtacar, {
//      method: "POST",
//      headers: { "Content-Type": "application/json" },
//    });
//    if (!response.ok) throw new Error("Error al guardar");
//    dialog.close();
//    form.reset();
//    alert("Espíritu guardado correctamente");
//    userSpirit = data;
//  } catch (err) {
//    console.error(err);
//    alert("Falló el combate. O sea no la acción de atacar, sino el fetch al servidor. Fijte que onda eso porque puede ponerse feo. Capaz esta data te sirve: " + err.message);
//  }
//
//
// Asegúrate de que este código esté presente y después de que el DOM esté cargado
const openEspirituBtn = document.getElementById('open-espiritu-btn');
const espirituDialog = document.getElementById('espiritu-dialog');

if (openEspirituBtn && espirituDialog) {
    openEspirituBtn.addEventListener('click', () => {
        espirituDialog.showModal();
    });
}

function mostrarDatosEspiritu(espiritu) {
    document.getElementById('user-spirit-name').textContent = espiritu.nombre || '';
    document.getElementById('user-spirit-type').textContent = espiritu.tipo || '';
    document.getElementById('user-spirit-attack').textContent = espiritu.ataque ?? '';
    document.getElementById('user-spirit-defense').textContent = espiritu.defensa ?? '';
    document.getElementById('user-spirit-vida').textContent = espiritu.vida || '';
}

let userSpiritUnsubscribe = null;

function suscribirDatosEspiritu(id) {
    // Si ya hay una suscripción previa, la cerramos
    if (userSpiritUnsubscribe) userSpiritUnsubscribe();
    if (!id) return;
    const ref = doc(db, "estadisticas_espiritus", String(id));
    userSpiritUnsubscribe = onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;
        mostrarDatosEspiritu(snap.data());
    });
}

// --- En el botón aleatorio ---
const randomEspirituBtn = document.getElementById('random-espiritu-btn');
if (randomEspirituBtn) {
    randomEspirituBtn.addEventListener('click', async () => {
        const nombres = [
            "Ariel", "Belial", "Uriel", "Lilith", "Gabriel", "Azazel",
            "Rafael", "Metatron", "Samael", "Raziel", "Sariel", "Remiel",
            "Cassiel", "Barachiel", "Jophiel", "Haniel", "Zadkiel", "Phanuel",
            "Abaddon", "Mammon", "Leviatán", "Asmodeo", "Balam", "Valefar",
            "Dantalion", "Foras", "Gremory", "Marchosias", "Phenex", "Vassago"
        ];
        const tipos = ["ANGELICAL", "DEMONIACO"];
        const nombre = nombres[Math.floor(Math.random() * nombres.length)];
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        const ataque = Math.floor(Math.random() * 100) + 1;
        const defensa = Math.floor(Math.random() * 100) + 1;
        const data = {
            nombre,
            tipo,
            ubicacionId: 1,
            coordenada: { latitud: -34.603733, longitud: -58.382033 },
            ataque,
            defensa
        };
        try {
            const response = await fetch("http://localhost:8080/espiritu", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errBody = await response.json().catch(() => null);
                const msg = errBody?.message || `Error al guardar (status ${response.status})`;
                alert(msg);
                return;
            }
            const creado = await response.json();
            // Asignar el id al userSpirit y suscribirse a los cambios en tiempo real
            userSpirit = { ...creado, id: creado.id };
            mostrarDatosEspiritu(userSpirit);
            suscribirDatosEspiritu(userSpirit.id);
            alert("Espíritu aleatorio creado correctamente: " + creado.nombre);
        } catch (err) {
            alert("Falló al crear el espíritu aleatorio: " + err.message);
        }
    });
}

// Delegación de eventos para el botón de combatir en la tabla de espíritus
rankingTodosTbody.addEventListener('click', async (e) => {
    if (e.target && e.target.matches('.btn-action')) {
        // id del espíritu a combatir (de la fila)
        const idEspirituACombatir = e.target.getAttribute('data-id');
        // id del espíritu del usuario
        if (!userSpirit || !userSpirit.id) {
            alert("Primero debes crear o seleccionar tu espíritu.");
            return;
        }
        const idEspiritu = userSpirit.id;
        if (idEspiritu === idEspirituACombatir) {
            alert("No puedes combatir contra tu propio espíritu.");
            return;
        }
        console.log(`Combatiendo con espíritu ID: ${idEspiritu} contra ID: ${idEspirituACombatir}`);
        const response = await fetch(`http://localhost:8080/espiritu/${idEspiritu}/combatir/${idEspirituACombatir}`, {
            method: "PUT"
        });
        const resultado = await response.json();
        alert("¡Combate realizado!\n" + JSON.stringify(resultado, null, 2));
    }
});

