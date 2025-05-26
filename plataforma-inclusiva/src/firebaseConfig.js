import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZuF2lwReWCxtdCybCEiOYg5vohSYxQ58",
  authDomain: "taller-de-proyectos-fa7ee.firebaseapp.com",
  projectId: "taller-de-proyectos-fa7ee",
  storageBucket: "taller-de-proyectos-fa7ee.firebasestorage.app",
  messagingSenderId: "60065838895",
  appId: "1:60065838895:web:103af1ee1bab18564213da"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Auth y Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);    