
import { db } from './firebaseConfig.js'; 
import { collection, onSnapshot, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';


const rankingGanadasUl = document.getElementById('ranking-ganadas-ul');
const rankingPerdidasUl = document.getElementById('ranking-perdidas-ul');
const rankingJugadasUl = document.getElementById('ranking-jugadas-ul');


// Función para renderizar los rankings 
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
            Vida: ${espiritu.vida}<br>
            Cantidad ${metricName}: ${espiritu[metricName] || 0}
        `;
        ulElement.appendChild(li);
    });
}

//  Listener para Espíritus con más Batallas Ganadas 
const qGanadas = query(
    collection(db, "estadisticas_espiritus"),
    orderBy("ganadas", "desc"), 
    limit(5) 
);

onSnapshot(qGanadas, (snapshot) => {
    console.log("Actualizando ranking de batallas ganadas...");
    renderRanking(rankingGanadasUl, snapshot, "ganadas");
});

//  Listener para Espíritus con más Batallas Perdidas 
const qPerdidas = query(
    collection(db, "estadisticas_espiritus"),
    orderBy("perdidas", "desc"), 
    limit(5) 
);

onSnapshot(qPerdidas, (snapshot) => {
    console.log("Actualizando ranking de batallas perdidas...");
    renderRanking(rankingPerdidasUl, snapshot, "perdidas");
}, (error) => {
    console.error("Error al obtener ranking de perdidas:", error);
    rankingPerdidasUl.innerHTML = '<li class="lista">Error al cargar datos.</li>';
});

//  Listener para Espíritus con más Batallas Jugadas 
const qJugadas = query(
    collection(db, "estadisticas_espiritus"),
    orderBy("jugadas", "desc"), 
    limit(5) 
);

onSnapshot(qJugadas, (snapshot) => {
    console.log("Actualizando ranking de batallas jugadas...");
    renderRanking(rankingJugadasUl, snapshot, "jugadas");
}, (error) => {
    console.error("Error al obtener ranking de jugadas:", error);
    rankingJugadasUl.innerHTML = '<li class="lista">Error al cargar datos.</li>';
});

console.log("Aplicación de ranking inicializada. Escuchando cambios en Firestore...");