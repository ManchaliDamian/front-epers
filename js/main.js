
import { db } from './firebaseConfig.js'; 
import { collection, onSnapshot, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';


// --- Referencias a elementos del DOM ---
const rankingGanadasUl = document.getElementById('ranking-ganadas');
const rankingPerdidasUl = document.getElementById('ranking-perdidas');
const rankingJugadasUl = document.getElementById('ranking-jugadas');

// --- Función genérica para renderizar los rankings ---
function renderRanking(ulElement, snapshot, metricName) {
    ulElement.innerHTML = ''; 

    if (snapshot.empty) {
        const li = document.createElement('li');
        li.textContent = `No hay datos de ${metricName} disponibles.`;
        li.classList.add('lista'); 
        ulElement.appendChild(li);
        return;
    }

    snapshot.forEach(doc => {
        const espiritu = doc.data();
        const li = document.createElement('li');
        li.classList.add('lista');
        li.innerHTML = `
            Nombre: ${espiritu.nombre || 'N/A'}<br>
            Cantidad ${metricName}: ${espiritu[metricName] || 0}
        `;
        ulElement.appendChild(li);
    });
}

// --- Listener para Espíritus con más Batallas Ganadas ---
const qGanadas = query(
    collection(db, "espiritus"),
    orderBy("batallasGanadas", "desc"), // Ordenar de forma descendente
    limit(5) // Mostrar los 5 primeros
);

onSnapshot(qGanadas, (snapshot) => {
    console.log("Actualizando ranking de batallas ganadas...");
    renderRanking(rankingGanadasUl, snapshot, "batallasGanadas");
});

// --- Listener para Espíritus con más Batallas Perdidas ---
const qPerdidas = query(
    collection(db, "espiritus"),
    orderBy("batallasPerdidas", "desc"), // Ordenar de forma descendente
    limit(5) // Mostrar los 5 primeros
);

onSnapshot(qPerdidas, (snapshot) => {
    console.log("Actualizando ranking de batallas perdidas...");
    renderRanking(rankingPerdidasUl, snapshot, "batallasPerdidas");
}, (error) => {
    console.error("Error al obtener ranking de perdidas:", error);
    rankingPerdidasUl.innerHTML = '<li class="lista">Error al cargar datos.</li>';
});

// --- Listener para Espíritus con más Batallas Jugadas ---
const qJugadas = query(
    collection(db, "espiritus"),
    orderBy("batallasJugadas", "desc"), // Ordenar de forma descendente
    limit(5) // Mostrar los 5 primeros
);

onSnapshot(qJugadas, (snapshot) => {
    console.log("Actualizando ranking de batallas jugadas...");
    renderRanking(rankingJugadasUl, snapshot, "batallasJugadas");
}, (error) => {
    console.error("Error al obtener ranking de jugadas:", error);
    rankingJugadasUl.innerHTML = '<li class="lista">Error al cargar datos.</li>';
});

console.log("Aplicación de ranking inicializada. Escuchando cambios en Firestore...");