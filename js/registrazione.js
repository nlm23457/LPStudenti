// Importa le funzioni necessarie
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  onAuthStateChanged, // Importa per rilevare lo stato di autenticazione
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

// Funzione per formattare le stringhe
function formatString(str) {
  return str.trim().charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Funzione per controllare la validità della classe
function formatClass(classe) {
  return classe.trim().replace(/\s+/g, "").toUpperCase();
}

// Funzione per mostrare i messaggi
function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  // setTimeout(function () {
  //   messageDiv.style.opacity = 0;
  // }, 5000);
}

// Registrazione utente
const signUp = document.getElementById("submitSignUp");
signUp.addEventListener("click", (event) => {
  event.preventDefault();

  // Controlla se i termini e la privacy policy sono stati accettati
  const acceptTerms = document.getElementById("acceptTerms").checked;
  const acceptPrivacy = document.getElementById("acceptPrivacy").checked;

  if (!acceptTerms || !acceptPrivacy) {
    showMessage(
      "Devi accettare i Termini di Servizio e la Privacy Policy per continuare.",
      "signUpMessage"
    );
    return;
  }

  // Prendi i dati dal form
  let nome = document.getElementById("fName").value;
  let cognome = document.getElementById("lName").value;
  let classe = document.getElementById("lGrade").value;
  const email = document.getElementById("rEmail").value;
  const password = document.getElementById("rPassword").value;

  // Verifica che i campi siano riempiti
  if (!nome || !cognome || !classe || !email || !password) {
    showMessage("Tutti i campi sono obbligatori.", "signUpMessage");
    return;
  }

  // Formatto il nome, cognome e classe
  nome = formatString(nome);
  cognome = formatString(cognome);
  classe = formatClass(classe);

  // Verifica che l'email abbia il dominio corretto
  const allowedDomain = "rmps26000v.onmicrosoft.com";
  const emailDomain = email.split("@")[1];
  if (emailDomain !== allowedDomain) {
    showMessage(
      "Registrazione consentita solo con email @" + allowedDomain,
      "signUpMessage"
    );
    return;
  }

  // Crea l'utente su Firebase Authentication
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Invia l'email di verifica
      sendEmailVerification(user)
        .then(() => {
          showMessage(
            "Email di verifica inviata. Controlla la posta!",
            "signUpMessage"
          );

          // Salva i dettagli utente su Firestore
          const userData = {
            email: email,
            nome: nome,
            cognome: cognome,
            classe: classe,
          };

          const docRef = doc(db, "users", user.uid);
          return setDoc(docRef, userData).then(() => {
            setTimeout(() => {
              window.location.href = "registrazione.html"; // Reindirizza alla pagina di login
            }, 3000);
          });
        })
        .catch((error) => {
          console.error(
            "Errore durante l'invio dell'email di verifica:",
            error
          );
          showMessage(
            "Errore durante l'invio dell'email di verifica",
            "signUpMessage"
          );
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode == "auth/email-already-in-use") {
        showMessage("L'indirizzo email è già registrato!", "signUpMessage");
      } else {
        showMessage("Errore durante la registrazione", "signUpMessage");
      }
    });
});

// Login utente
const signIn = document.getElementById("submitSignIn");
signIn.addEventListener("click", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      if (user.emailVerified) {
        showMessage("Login avvenuto con successo!", "signInMessage");
        localStorage.setItem("loggedInUserId", user.uid);
        window.location.href = "account.html"; // Reindirizza alla pagina dell'account
      } else {
        showMessage(
          "Verifica il tuo indirizzo email prima di accedere.",
          "signInMessage"
        );
        auth.signOut(); // Disconnette l'utente se non ha verificato l'email
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === "auth/invalid-credential") {
        showMessage("Email o password errati", "signInMessage");
      } else {
        showMessage("L'account non esiste", "signInMessage");
      }
    });
});

// Funzione per verificare lo stato di autenticazione
onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    // Utente è loggato e l'email è verificata
    console.log("Utente loggato:", user.uid);
    window.location.href = "account.html";
    // Mantieni l'utente su questa pagina o fai altro
  } else {
    // Utente non loggato o email non verificata, reindirizzalo
    // window.location.href = "registrazione.html";
    document.body.style.display = "block"; // Cambia il link alla pagina di login/registrazione
  }
});

//////////// DOM ///////////
const signUpButton = document.getElementById("signUpButton");
const signInButton = document.getElementById("signInButton");
const signInForm = document.getElementById("signIn");
const signUpForm = document.getElementById("signup");

signUpButton.addEventListener("click", function () {
  signInForm.style.display = "none";
  signUpForm.style.display = "flex";
});
signInButton.addEventListener("click", function () {
  signInForm.style.display = "flex";
  signUpForm.style.display = "none";
});
