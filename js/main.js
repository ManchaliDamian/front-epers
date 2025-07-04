import { db } from "./firebaseConfig.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  doc,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Variable global para el espíritu del usuario
let userSpirit = null;

const dialog = document.getElementById("espiritu-dialog");
const form = document.getElementById("espiritu-form");

function getUser() {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (usuarioGuardado) {
    try {
      const usuario = JSON.parse(usuarioGuardado);
      if (usuario && usuario.id) {
        userSpirit = usuario;
        
        const ref = doc(db, "estadisticas_espiritus", String(userSpirit.id));
        onSnapshot(ref, (snap) => {
          if (!snap.exists()) return;
          mostrarDatosEspiritu(snap.data());
        });
      }
    } catch (e) {
      console.error("Error al parsear el usuario guardado:", e);
      console.warn("No se pudo parsear el usuario guardado en localStorage.");
    }
  } else {
    dialog.showModal(); // Para obligar a crear un espíritu si no hay guardado
  }
}
getUser();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    nombre: form.nombre.value,
    tipo: form.tipo.value,
    ubicacionId: defaultUbicacionId,
    coordenada: { latitud: 1.0, longitud: 0.0 }, //default
    ataque: parseInt(form.ataque.value, 10),
    defensa: parseInt(form.defensa.value, 10),
  };
  try {
    const response = await fetch("http://localhost:8080/espiritu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      const msg =
        errBody?.message || `Error al guardar (status ${response.status})`;
      alert(msg);
      return;
    }
    const creado = await response.json();
    userSpirit = creado;
    localStorage.setItem("usuario", JSON.stringify(userSpirit));

    getUser(); // Actualiza el espíritu del usuario

    dialog.close();
    form.reset();
  } catch (err) {
    console.error(err);
    alert("Falló al guardar el espíritu: " + err.message);
  }
});

// Selecciona los TBODY de las tablas
const rankingGanadasTbody = document.querySelector(
  "#ranking-ganadas-table tbody"
);
const rankingPerdidasTbody = document.querySelector(
  "#ranking-perdidas-table tbody"
);
const rankingJugadasTbody = document.querySelector(
  "#ranking-jugadas-table tbody"
);
// Tabla de todos los espíritus con todos sus atributos
const rankingTodosTbody = document.querySelector("#ranking-todos-table tbody");

// Función para renderizar los rankings en tablas
function renderRankingTable(tbodyElement, snapshot, metricName) {
  tbodyElement.innerHTML = "";

  if (snapshot.empty) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 3;
    td.textContent = `No hay datos de ${metricName} disponibles.`;
    tr.appendChild(td);
    tbodyElement.appendChild(tr);
    return;
  }

  let pos = 1;
  snapshot.forEach((doc) => {
    const espiritu = doc.data();
    const tr = document.createElement("tr");
    // Posición
    const tdPos = document.createElement("td");
    tdPos.textContent = pos++;
    tr.appendChild(tdPos);
    // Nombrex
    if (espiritu.id == userSpirit?.id) {
      tr.classList.add("user-spirit"); // Clase para destacar el espíritu del usuario
    }
    const tdNombre = document.createElement("td");
    tdNombre.textContent = espiritu.nombre || "N/A";
    tr.appendChild(tdNombre);
    // Métrica
    const tdMetric = document.createElement("td");
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

onSnapshot(
  qPerdidas,
  (snapshot) => {
    renderRankingTable(rankingPerdidasTbody, snapshot, "perdidas");
  },
  (error) => {
    rankingPerdidasTbody.innerHTML =
      '<tr><td colspan="3">Error al cargar datos.</td></tr>';
  }
);

// Listener para Espíritus con más Batallas Jugadas
const qJugadas = query(
  collection(db, "estadisticas_espiritus"),
  orderBy("jugadas", "desc"),
  limit(5)
);

onSnapshot(
  qJugadas,
  (snapshot) => {
    renderRankingTable(rankingJugadasTbody, snapshot, "jugadas");
  },
  (error) => {
    rankingJugadasTbody.innerHTML =
      '<tr><td colspan="3">Error al cargar datos.</td></tr>';
  }
);

function renderAllEspiritus(snapshot) {
  rankingTodosTbody.innerHTML = "";
  if (snapshot.empty) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 6;
    td.textContent = "No hay espíritus registrados.";
    tr.appendChild(td);
    rankingTodosTbody.appendChild(tr);
    return;
  }

  snapshot.forEach((doc) => {
    const e = doc.data();
    // Para no mostrar el espíritu del usuario en la tabla de espiritus
    if (e.nombre === userSpirit?.nombre) return;
    if(e.vida === 0) return; // No mostrar espíritus con vida <= 0
    const tr = document.createElement("tr");
    // Asigna una clase según el tipo de espíritu
    if (e.tipo === "ANGELICAL") {
      tr.classList.add("espiritu-angelical");
    } else if (e.tipo === "DEMONIACO") {
      tr.classList.add("espiritu-demonio");
    }

    // Determina el color según la vida
    const vida = Math.max(0, Number(e.vida) || 0);
    let color = "#0b6b2dd6"; // verde por defecto
    if (vida <= 30) {
      color = "#6b0b0b"; // rojo
    } else if (vida <= 70) {
      color = "#ad781cb2"; // naranja
    }

    tr.innerHTML = `
      <td class='general-element-nombre'>${e.nombre}</td>
      <td class='general-element-vida' style="color:${color}">${e.vida}</td>
      <td class='general-element-tipo'>${e.tipo}</td>
      <td class='general-element-ataque'>${e.ataque}</td>
      <td class='general-element-defensa'>${e.defensa}</td>
      <td class='general-element-action'><button class="btn-action" data-id="${doc.id}">⚔️</button></td>
    `;
    rankingTodosTbody.appendChild(tr);
  });
}

// Suscripción reactiva:
const qAll = collection(db, "estadisticas_espiritus");
onSnapshot(qAll, renderAllEspiritus, (err) => {
  console.error("Error recibiendo todos los espíritus:", err);
});

function mostrarDatosEspiritu(espiritu) {
  document.getElementById("user-spirit-name").textContent =
    espiritu.nombre || "";
  document.getElementById("user-spirit-type").textContent = espiritu.tipo || "";
  // Actualiza la imagen según el tipo
  if (typeof updateSpiritImage === "function") {
    updateSpiritImage(espiritu.tipo);
  }
  // Mostrar espadas según el ataque (0-100 => 0-10 espadas)
  const ataque = Math.max(0, Number(espiritu.ataque) || 0);
  document.getElementById("user-spirit-attack").textContent = ataque;

  const defensa = Math.max(0, Number(espiritu.defensa) || 0);
  document.getElementById("user-spirit-defense").textContent = defensa;

  const vida = Math.max(0, Number(espiritu.vida) || 0);
  document.getElementById("user-spirit-vida").innerHTML = vida;
}

// --- En el botón aleatorio ---
const randomEspirituBtn = document.getElementById("random-espiritu-btn");
randomEspirituBtn.addEventListener("click", async () => {
  const tipos = ["ANGELICAL", "DEMONIACO"];
  const nombre = nombreUnico();
  const tipo = tipos[numeroAleatorioEntre(0, 1)];
  const ataque = numeroAleatorioEntre(rangoMin, rangoMax);
  const defensa = numeroAleatorioEntre(rangoMin, rangoMax);
  const data = {
    nombre,
    tipo,
    ubicacionId: defaultUbicacionId,
    coordenada: { latitud: 1.0, longitud: 0.0 },
    ataque,
    defensa,
  };
  try {
    const response = await fetch("http://localhost:8080/espiritu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      const msg =
        errBody?.message || `Error al guardar (status ${response.status})`;
      alert(msg);
      return;
    }
    const creado = await response.json();
    alert("Espíritu aleatorio creado correctamente: " + creado.nombre);
  } catch (err) {
    alert("Falló al crear el espíritu aleatorio: " + err.message);
  }
});

// Delegación de eventos para el botón de combatir en la tabla de espíritus
rankingTodosTbody.addEventListener("click", async (e) => {
  if (e.target && e.target.matches(".btn-action")) {
    // id del espíritu a combatir (de la fila)
    const idEspirituACombatir = e.target.getAttribute("data-id");
    // id del espíritu del usuario
    if (!userSpirit || !userSpirit.id) {
      alert("Primero debes crear o seleccionar tu espíritu.");
      return;
    }
    const idEspiritu = userSpirit.id;
    if (idEspiritu === Number(idEspirituACombatir)) {
      alert("No puedes combatir contra tu propio espíritu.");
      return;
    }
    console.log(
      `Combatiendo con espíritu ID: ${idEspiritu} contra ID: ${idEspirituACombatir}`
    );
    const response = await fetch(
      `http://localhost:8080/espiritu/${idEspiritu}/combatir/${idEspirituACombatir}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) {
      alert(`Error al combatir: ${response.status} ${response.statusText}`);
      return;
    }
    alert("¡Combate realizado!");
  }
});

//helper
const usados = new Set();

function nombreUnico() {
  let n;
  do {
    n = Math.random().toString(36).substring(2, 5);
  } while (usados.has(n));
  usados.add(n);
  return n;
}

const rangoMin = 1;
const rangoMax = 50;
function numeroAleatorioEntre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let defaultUbicacionId = null;

async function initDefaultUbicacion() {
  const resp = await fetch("http://localhost:8080/ubicacion");
  if (!resp.ok) throw new Error("No se pudieron cargar ubicaciones");
  const ubicaciones = await resp.json();
  if (ubicaciones.length === 0) {
    throw new Error("No hay ubicaciones definidas en el sistema");
  }
  defaultUbicacionId = ubicaciones[0].id;
}
await initDefaultUbicacion();
