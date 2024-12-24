// Importa le funzioni necessarie
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Configurazione di Firebase
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
const auth = getAuth();
const db = getFirestore(app);

// Bottone di logout
const logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("loggedInUserId");
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Error Signing out:", error);
    });
});

// Controllo stato di autenticazione dell'utente
onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    // Ottieni l'ID utente dal local storage o dallo user autenticato
    let loggedInUserId = localStorage.getItem("loggedInUserId");
    if (!loggedInUserId) {
      localStorage.setItem("loggedInUserId", user.uid);
      loggedInUserId = user.uid;
    }

    // Recupera i dati dell'utente da Firestore
    const docRef = doc(db, "users", loggedInUserId);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          document.getElementById("loggedUserFName").innerText = userData.nome;
          document.getElementById("loggedUserLName").innerText =
            userData.cognome;
          document.getElementById("loggedUserGrade").innerText =
            userData.classe;
          document.getElementById("loggedUserEmail").innerText = userData.email;
        } else {
          console.log("Nessun documento trovato per l'ID utente fornito.");
          window.location.href = "registrazione.html";
        }
      })
      .catch((error) => {
        console.error("Errore durante il recupero del documento:", error);
        window.location.href = "registrazione.html";
      });
  } else {
    // Utente non autenticato o email non verificata
    console.log(
      "Utente non autenticato o email non verificata. Reindirizzamento a registrazione."
    );
    window.location.href = "registrazione.html";
  }
});
