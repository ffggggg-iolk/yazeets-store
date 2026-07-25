// ============================================
// FIREBASE CONFIGURATION
// ============================================

// Firebase ya está inicializado (ver index.html)

const firebaseConfig = {
  apiKey: "AIzaSyDcUwV5xdIBYhPtWaaCTs2o5IKmW4mEsaA",
  authDomain: "yazeet-s-store.firebaseapp.com",
  projectId: "yazeet-s-store",
  storageBucket: "yazeet-s-store.firebasestorage.app",
  messagingSenderId: "420769287932",
  appId: "1:420769287932:web:1a9b42095cea32e76e9179"
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
