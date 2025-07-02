import { db } from './firebaseConfig.js'; 
import { collection, onSnapshot, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';

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
        // Nombre
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
        `;
        rankingTodosTbody.appendChild(tr);
    });
}

renderAllEspiritus();

console.log("Aplicación de ranking inicializada. Escuchando cambios en Firestore...");