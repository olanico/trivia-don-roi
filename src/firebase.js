import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, updateDoc, increment } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBVYv2fJi0zY5QB3NN38_yjgGlZTKVIj9s",
  authDomain: "trivia-don-roi.firebaseapp.com",
  projectId: "trivia-don-roi",
  storageBucket: "trivia-don-roi.firebasestorage.app",
  messagingSenderId: "51686903516",
  appId: "1:51686903516:web:3b05f228ea6f761670ee19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Funciones de autenticación
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error en logout:", error);
    throw error;
  }
};

// Funciones de Firestore
export const getUserData = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

export const saveUserData = async (userId, data) => {
  await setDoc(doc(db, 'users', userId), data, { merge: true });
};

// NUEVA FUNCIÓN: Verificar si el usuario puede jugar hoy
export const puedeJugarHoy = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      // Usuario nuevo, puede jugar
      return { puedeJugar: true, esNuevo: true };
    }
    
    const userData = userDoc.data();
    const ultimaPartida = userData.ultimaPartida;
    
    if (!ultimaPartida) {
      // No tiene partidas registradas, puede jugar
      return { puedeJugar: true, esNuevo: false };
    }
    
    // Obtener fecha de hoy en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split('T')[0];
    const fechaUltimaPartida = new Date(ultimaPartida).toISOString().split('T')[0];
    
    if (fechaUltimaPartida === hoy) {
      // Ya jugó hoy
      return { puedeJugar: false, esNuevo: false };
    }
    
    // No jugó hoy, puede jugar
    return { puedeJugar: true, esNuevo: false };
    
  } catch (error) {
    console.error("Error verificando si puede jugar:", error);
    // En caso de error, permitir jugar
    return { puedeJugar: true, esNuevo: false };
  }
};

// FUNCIÓN ACTUALIZADA: Marcar que el usuario vio la bienvenida
export const marcarBienvenidaVista = async (userId) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    bienvenidaVista: true,
    fechaRegistro: new Date().toISOString()
  }, { merge: true });
};

export const updateUserScore = async (userId, nombre, puntosGanados) => {
  const userRef = doc(db, 'users', userId);
  const leaderboardRef = doc(db, 'leaderboard', userId);
  
  const userData = await getDoc(userRef);
  const currentData = userData.exists() ? userData.data() : {
    nombre,
    puntosAcumulados: 0,
    racha: 1,
    partidasJugadas: 0,
    ultimaPartida: null
  };

  // Calcular nueva racha
  let nuevaRacha = currentData.racha || 1;
  if (currentData.ultimaPartida) {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = ayer.toISOString().split('T')[0];
    const fechaUltimaStr = new Date(currentData.ultimaPartida).toISOString().split('T')[0];
    
    if (fechaUltimaStr === ayerStr) {
      // Jugó ayer, incrementar racha
      nuevaRacha = (currentData.racha || 1) + 1;
    } else if (fechaUltimaStr !== new Date().toISOString().split('T')[0]) {
      // No jugó ayer, resetear racha
      nuevaRacha = 1;
    }
  }

  const nuevoPuntaje = (currentData.puntosAcumulados || 0) + puntosGanados;
  const nivel = nuevoPuntaje < 100 ? 'Principiante' : 
                nuevoPuntaje < 300 ? 'Ahorrador' : 
                nuevoPuntaje < 600 ? 'Ahorrador Pro' : 'Inversor';

  const dataToSave = {
    nombre,
    puntosAcumulados: nuevoPuntaje,
    nivel,
    partidasJugadas: (currentData.partidasJugadas || 0) + 1,
    ultimaPartida: new Date().toISOString(),
    racha: nuevaRacha
  };

  // Guardar en users
  await setDoc(userRef, dataToSave, { merge: true });
  
  // Guardar en leaderboard (para queries rápidas)
  await setDoc(leaderboardRef, {
    nombre,
    puntos: nuevoPuntaje,
    nivel,
    racha: dataToSave.racha,
    ultimaPartida: dataToSave.ultimaPartida
  }, { merge: true });

  return dataToSave;
};

export const getLeaderboard = async (limitCount = 10) => {
  const leaderboardQuery = query(
    collection(db, 'leaderboard'),
    orderBy('puntos', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(leaderboardQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getUserHistory = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      puntosAcumulados: data.puntosAcumulados || 0,
      partidasJugadas: data.partidasJugadas || 0,
      racha: data.racha || 1,
      nivel: data.nivel || 'Principiante',
      ultimaPartida: data.ultimaPartida || null,
      bienvenidaVista: data.bienvenidaVista || false
    };
  }
  return null;
};
