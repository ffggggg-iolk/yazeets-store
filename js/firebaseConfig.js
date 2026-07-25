// ============================================
// FIREBASE CONFIGURATION
// EDITA ESTO CON TUS CREDENCIALES DE FIREBASE
// ============================================

// Importa Firebase (ya incluido en index.html)
// const firebase = window.firebase;

const firebaseConfig = {
  // REEMPLAZA ESTO CON TUS CREDENCIALES DE FIREBASE
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "yazeets-store.firebaseapp.com",
  projectId: "yazeets-store",
  storageBucket: "yazeets-store.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Inicializa Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
}

// Obtén referencias a los servicios
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log('📦 Firebase Auth, Firestore y Storage listos');
