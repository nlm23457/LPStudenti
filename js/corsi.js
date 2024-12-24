import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

//****************************************************** */

const L1_corsiElenco = [
  {
    id: "L1_1_TATONE",
    nome: "Gli Scacchi per Tutti",
    relatore: "Emanuele Tatone",
    aula: "1-II",
    limite: "25",
  },
  {
    id: "L1_3_CERAFOGLI",
    nome: "Analisi 1 e Problemi da 1MLN$",
    relatore: "Andrea Cerafogli",
    aula: "3-II",
    limite: "25",
  },
  {
    id: "L1_4_CERASE",
    nome: "Regolamento Calcistico e Arbitraggio",
    relatore: "Francesco Cerase",
    aula: "4-II",
    limite: "25",
  },
  {
    id: "L1_8_DEVACA",
    nome: "Origami",
    relatore: "Giulio Cabeza de Vaca",
    aula: "8-II",
    limite: "25",
  },
  {
    id: "L1_11_MASCOLI",
    nome: "L'Onda di Hokusay",
    relatore: "Alice Mascoli",
    aula: "11-II",
    limite: "25",
  },
  {
    id: "L1_12_SEVERINI",
    nome: "Introduzione alla Subacquea",
    relatore: "Matteo Severini",
    aula: "12-II",
    limite: "25",
  },
  {
    id: "L1_14_BUFALINO",
    nome: "Reazione a Catena",
    relatore: "Emma Bufalino",
    aula: "14-II",
    limite: "25",
  },
  {
    id: "L1_17_IADELUCA",
    nome: "Corso sul fumetto",
    relatore: "Alice Iadeluca",
    aula: "17-II",
    limite: "25",
  },
  {
    id: "L1_20_NERI",
    nome: "Pausa Arte & Artigianato",
    relatore: "Giorgia Neri",
    aula: "20-II",
    limite: "25",
  },
  {
    id: "L1_22_CHITTARO",
    nome: "Indovina la Canzone",
    relatore: "Camilla Chittaro",
    aula: "22-III",
    limite: "25",
  },
  {
    id: "L1_25_ASCANIO",
    nome: "Chi vuole essere milionario",
    relatore: "Marco Ascanio",
    aula: "25-III",
    limite: "25",
  },
  {
    id: "L1_31_BULJBASIC",
    nome: "Pop Culture",
    relatore: "Alisa Buljbasic",
    aula: "31-IV",
    limite: "25",
  },
  {
    id: "L1_32_DELLEVILLE",
    nome: "Il cubo di Rubik",
    relatore: "Marco delle Ville",
    aula: "32-IV",
    limite: "25",
  },
  {
    id: "L1_34_ZARRATTI",
    nome: "Balli di Gruppo 2",
    relatore: "M. Zarratti",
    aula: "34-IV",
    limite: "25",
  },
  {
    id: "L1_35_GALIETI",
    nome: "Armocromia e Skincare",
    relatore: "Giada Galieti",
    aula: "35-IV",
    limite: "25",
  },
  {
    id: "L1_38_FEDERICI",
    nome: "Chitarra",
    relatore: "E. Federici",
    aula: "38-IV",
    limite: "25",
  },
  {
    id: "L1_45_COTA",
    nome: "Ascoltiamo e non Giudichiamo",
    relatore: "Arianna Cota",
    aula: "45-IV",
    limite: "25",
  },
];

// COLORA IL CORSO SELEZIONATO E NASCONDE GLI ALTRI CORSI
// ***************************************************** */
async function coloraCorsoEIsolalo(corsoId) {
  const corsoSelezionato = document.getElementById(corsoId);

  // DOM MANIPULATION
  if (corsoSelezionato) {
    corsoSelezionato.style.display = "block";
    corsoSelezionato.style.backgroundColor = "green";
    corsoSelezionato.style.border = "green";
    corsoSelezionato.style.color = "white";
    document.querySelector(".courses-container").style.gridTemplateColumns =
      "1fr";
  }

  // Nascondi gli altri corsi
  const altriCorsi = document.querySelectorAll(
    `.course-container:not(#${corsoId})`
  );
  altriCorsi.forEach((corso) => {
    corso.style.display = "none"; // Nascondi tutti gli altri corsi
  });
}

// SE UN CORSO RAGGIUNGE IL NUMERO MAX DI PARTECIPANTI, SI CHIUDE
// ***************************************************** */
async function aggiornaColoreCorsi() {
  const corsi = document.querySelectorAll(".course-container");

  for (const corso of corsi) {
    const corsoId = corso.id;
    const corsoRef = doc(db, "L1_CORSI", corsoId);
    const corsoSnap = await getDoc(corsoRef);

    if (corsoSnap.exists()) {
      const corsoData = corsoSnap.data();
      const partecipanti = corsoData.partecipanti || [];

      // Cambia il colore di sfondo se i partecipanti superano 20
      if (partecipanti.length > 24) {
        corso.style.backgroundColor = "red";
        corso.style.borderColor = "red";
        corso.style.color = "white";
      } else {
        corso.style.backgroundColor = ""; // Resetta al colore originale
      }
    }
  }
}

// ISCRIVE L'UTENTE AL CORSO (O LO CREA SE NON ESISTE)
// ***************************************************** */
async function iscriviAlCorso(corsoId, userData) {
  const corsoRef = doc(db, "L1_CORSI", corsoId);
  const corsoSnap = await getDoc(corsoRef);

  // Recupero delle informazioni dal DOM
  const corsoContainer = document.getElementById(corsoId);
  const titolo = corsoContainer.querySelector("h3").textContent.trim();
  const relatore = corsoContainer
    .querySelector("p:nth-of-type(2)")
    .textContent.split(": ")[1];
  const classe = corsoContainer
    .querySelector("p:nth-of-type(1)")
    .textContent.trim();

  // Aggiunta dell'utente come primo partecipante e dettagli del corso
  if (!corsoSnap.exists()) {
    await setDoc(corsoRef, {
      titolo: titolo,
      relatore: relatore,
      classe: classe,
      partecipanti: [userData],
    });
    await coloraCorsoEIsolalo(corsoId);
    alert(`${userData.nome}, ti sei iscritto con successo!`);
    return;
  }

  const corsoData = corsoSnap.data();
  const partecipanti = corsoData.partecipanti || [];

  if (partecipanti.length >= 24) {
    alert("Il corso è già pieno (max 20 partecipanti).");
    return;
  }

  if (partecipanti.some((p) => p.email === userData.email)) {
    alert("Sei già iscritto a questo corso.");
    return;
  }

  await updateDoc(corsoRef, {
    partecipanti: arrayUnion(userData),
  });

  await coloraCorsoEIsolalo(corsoId);
  alert(`Ti sei iscritto con successo!`);
  window.location.reload(); // Aggiorna la pagina dopo l'iscrizione
}

// Gestione dei pulsanti "Iscriviti"
const buttons = document.querySelectorAll(".iscriviti-btn");
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const corsoId = button.closest(".course-container").id;

    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const email = user.email;

      // Recupera i dettagli dell'utente dal documento Firestore
      const userRef = doc(db, "users", userId);
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            iscriviAlCorso(corsoId, {
              UID: user.uid,
              nome: userData.nome,
              cognome: userData.cognome,
              classe: userData.classe,
              email: email,
            });
          } else {
            alert("Impossibile recuperare i dati utente.");
          }
        })
        .catch((error) => {
          console.error("Errore nel recupero dei dati utente:", error);
        });
    } else {
      alert("Devi essere loggato per iscriverti a un corso.");
      window.location.href = "../registrazione.html"; // Reindirizza alla pagina di login se non loggato
    }
  });
});

async function cancellaDalCorso(corsoId, userEmail) {
  const corsoRef = doc(db, "L1_CORSI", corsoId);
  const corsoSnap = await getDoc(corsoRef);

  if (!corsoSnap.exists()) {
    alert("Il corso non esiste.");
    return;
  }

  const corsoData = corsoSnap.data();
  let partecipanti = corsoData.partecipanti || [];

  // Verifica se l'utente è iscritto al corso
  if (!partecipanti.some((p) => p.email === userEmail)) {
    alert("Non sei iscritto a questo corso.");
    return;
  }

  // Rimuovi l'utente dalla lista dei partecipanti
  partecipanti = partecipanti.filter((p) => p.email !== userEmail);

  // Aggiorna il documento nel database con la nuova lista dei partecipanti
  await updateDoc(corsoRef, {
    partecipanti: partecipanti,
  });

  alert("Cancellazione avvenuta con successo!");
  window.location.reload(); // Aggiorna la pagina dopo la cancellazione
}

const cancellatiButtons = document.querySelectorAll(".cancellati-btn");
cancellatiButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const corsoId = button.closest(".course-container").id;
    const user = auth.currentUser;

    if (user) {
      cancellaDalCorso(corsoId, user.email);
    } else {
      alert("Devi essere loggato per cancellarti da un corso.");
    }
  });
});

// Gestione dei pulsanti "Visualizza Utente"
const visualizzaUtenteButtons = document.querySelectorAll(".visualizza-btn");
visualizzaUtenteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Recupera l'ID del corso associato al pulsante cliccato
    const corsoId = button.closest(".course-container").id;

    // Reindirizza a utenti.html con l'ID del corso nella query string
    window.location.href = `utenti.html?corsoId=${corsoId}`;
  });
});

onAuthStateChanged(auth, async (user) => {
  const corsi = document.querySelectorAll(".course-container");

  if (!user || !user.emailVerified) {
    console.log("Utente loggato:", user.uid);
    window.location.href = "../account.html";
  } else {
    document.body.style.display = "block";
  }

  await aggiornaColoreCorsi();

  if (user) {
    let isIscritto = false; // Per tracciare l'iscrizione

    // Controlla per ogni corso se l'utente è iscritto
    for (const corso of L1_corsiElenco) {
      const corsoID = corso.id;
      console.log(corsoID);
      const corsoRef = doc(db, "L1_CORSI", corsoID);
      const corsoSnap = await getDoc(corsoRef);
      const corsoData = corsoSnap.data();
      const partecipanti = corsoData.partecipanti || [];

      // Se l'utente è iscritto a questo corso
      if (partecipanti.some((p) => p.email === user.email)) {
        isIscritto = true; // L'utente è iscritto

        await coloraCorsoEIsolalo(corsoID);

        const corsoID2 = document.getElementById(corsoID);

        // Fai comparire/scomparire i btn cancellati/iscriviti
        corsoID2.querySelector(".iscriviti-btn").style.display = "none";
        corsoID2.querySelector(".cancellati-btn").style.display =
          "inline-block";
        corsoID2.querySelector(".visualizza-btn").style.display =
          "inline-block";

        // Trovato il corso, interrompi la ricerca (ottimizzazione)
        return;
      }
    }

    // Se non è iscritto a nessun corso, mostra tutti i corsi
    if (!isIscritto) {
      corsi.forEach((corso) => {
        corso.style.display = "block"; // Mostra tutti i corsi
      });
    }
  }
});
