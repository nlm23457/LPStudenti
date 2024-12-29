// Inizializza Firebase e Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Configura Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDLhjU-P1R3g-VR3Awv-4nhXgw6tpdjqTc",
  authDomain: "liceo-pasteur-studenti-f0a8f.firebaseapp.com",
  projectId: "liceo-pasteur-studenti-f0a8f",
  storageBucket: "liceo-pasteur-studenti-f0a8f.appspot.com",
  messagingSenderId: "542827887858",
  appId: "1:542827887858:web:ff6f348d92d91c4d13a46b",
  measurementId: "G-Q526B56MBC",
};

// Inizializza l'app Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const infoSection = document.getElementById("infos-container");

// Funzione per leggere la query string e ottenere il corsoId
function getQueryStringParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Recupera il corsoId dalla query string
const corsoId = getQueryStringParam("corsoId");

// Variabili per le informazioni del corso
let nomeCorso = ""; // Di default usa il corsoId come titolo
let relatore = "";
let classe = "";

// Funzione per sanitizzare l'input
function sanitizeInput(input) {
  const tempDiv = document.createElement("div");
  tempDiv.textContent = input; // Converte tutto in testo, eliminando potenziali script
  return tempDiv.innerHTML;
}

// Funzione per mostrare i partecipanti in una tabella HTML
async function mostraPartecipanti(corsoId) {
  const prefisso = corsoId.split("_")[0];
  const corsoRef = doc(db, `${prefisso}_CORSI`, corsoId);
  const corsoSnap = await getDoc(corsoRef);

  if (corsoSnap.exists()) {
    const corsoData = corsoSnap.data();
    console.log(corsoData);
    const partecipanti = corsoData.partecipanti || [];
    console.log(partecipanti);

    // Recupera il nome del corso, il relatore e la classe
    // nomeCorso = corsoData.titolo.toLowerCase() || corsoId;
    // relatore = corsoData.relatore || "Relatore sconosciuto";
    // classe = corsoData.classe || "Classe non specificata";

    // Aggiorna il titolo del documento HTML
    document.title = `Elenco partecipanti ${nomeCorso}`;

    infoSection.insertAdjacentHTML(
      "beforeend",
      `<h1 class = "titolo-partecipanti">Elenco partecipanti per <span class = "green-color">${nomeCorso}</span></h1>`
    );

    infoSection.insertAdjacentHTML(
      "beforeend",
      `<h2 class = "sottotitolo-partecipanti"><span class = "bold">Relatore:</span> ${relatore}</h2>`
    );

    infoSection.insertAdjacentHTML(
      "beforeend",
      `<h2 class = "sottotitolo-partecipanti"><span class = "bold">Classe:</span> ${classe}</h2>`
    );

    // Mostra i partecipanti in una tabella
    const listaPartecipanti = document.getElementById("lista-partecipanti");

    // Crea la tabella
    const table = document.createElement("table");
    table.classList.add("partecipanti-table");

    // Crea l'intestazione della tabella
    const header = table.createTHead();
    const headerRow = header.insertRow(0);
    const nomeHeader = headerRow.insertCell(0);
    const cognomeHeader = headerRow.insertCell(1);
    const classeHeader = headerRow.insertCell(2);
    nomeHeader.innerText = "Nome";
    cognomeHeader.innerText = "Cognome";
    classeHeader.innerText = "Classe";

    // Crea il corpo della tabella
    const tbody = document.createElement("tbody");

    partecipanti.forEach((partecipante) => {
      const row = tbody.insertRow();
      const nomeCell = row.insertCell(0);
      const cognomeCell = row.insertCell(1);
      const classeCell = row.insertCell(2);

      nomeCell.innerText = sanitizeInput(partecipante.nome);
      cognomeCell.innerText = sanitizeInput(partecipante.cognome);
      classeCell.innerText = sanitizeInput(partecipante.classe);
    });

    table.appendChild(tbody);
    listaPartecipanti.appendChild(table);

    // Aggiungi l'evento per la generazione del PDF
    document.getElementById("genera-pdf-btn").addEventListener("click", () => {
      generaPDF(partecipanti, nomeCorso, relatore, classe);
    });
  } else {
    alert("Nessun corso trovato.");
  }
}

function generaPDF(partecipanti, nomeCorso, relatore, classe) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Definisci il titolo e il sottotitolo su righe separate
  const titolo = `Corso: ${nomeCorso}`;
  const sottotitolo = `Relatore: ${relatore}\nClasse: ${classe}`;

  // Imposta una dimensione del font maggiore per il titolo
  doc.setFontSize(20); // Font più grande per il titolo

  // Ottieni la larghezza della pagina
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- CENTRA IL TITOLO ---
  const titleWidth = doc.getTextWidth(titolo); // Calcola la larghezza del titolo
  const titleX = (pageWidth - titleWidth) / 2; // Posiziona il titolo orizzontalmente al centro
  doc.text(titolo, titleX, 20); // Scrivi il titolo centrato a Y = 20

  // --- CENTRA IL SOTTOTITOLO ---
  doc.setFontSize(14); // Font più piccolo per il sottotitolo

  // Sottotitolo suddiviso in due righe (Relatore e Classe)
  const subtitoloRighe = sottotitolo.split("\n");
  let y = 30; // Posizione Y dopo il titolo (con spaziatura)

  subtitoloRighe.forEach((riga) => {
    const subtitoloWidth = doc.getTextWidth(riga); // Calcola la larghezza del sottotitolo
    const subtitoloX = (pageWidth - subtitoloWidth) / 2; // Centra ogni riga del sottotitolo
    doc.text(riga, subtitoloX, y); // Scrivi la riga centrata
    y += 8; // Aggiorna la posizione Y per la prossima riga
  });

  // Reimposta la dimensione del font a 12 per il resto del contenuto (come la tabella)
  doc.setFontSize(12); // Font normale per la tabella

  // Crea un array di righe per la tabella PDF, aggiungendo la colonna "Presente" con quadratini
  const rows = partecipanti.map((p) => [
    sanitizeInput(p.nome),
    sanitizeInput(p.cognome),
    sanitizeInput(p.classe),
    "___", // Quadrato vuoto per la presenza
  ]);

  // Sposta la tabella più in basso dopo il sottotitolo
  doc.autoTable({
    head: [["Nome", "Cognome", "Classe", "Presente"]],
    body: rows,
    startY: y + 10, // Fa partire la tabella più in basso rispetto al sottotitolo
    styles: {
      textColor: [0, 0, 0], // Testo della tabella in verde
      lineColor: [0, 128, 0], // Bordo delle celle in verde
      lineWidth: 0.5, // Spessore del bordo
    },
    headStyles: {
      fillColor: [0, 128, 0], // Sfondo dell'intestazione in verde
      textColor: [255, 255, 255], // Testo dell'intestazione in bianco
    },
    columnStyles: {
      3: { cellWidth: 20 }, // Riduce la larghezza della colonna "Presente"
    },
  });

  // Salva il file PDF
  doc.save(`${nomeCorso}-prima-ora-lunedì.pdf`);
}

// Esegui la funzione per mostrare i partecipanti
mostraPartecipanti(corsoId);
