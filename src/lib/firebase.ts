import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Inicjalizacja Firestore i Auth
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Konfiguracja parametrów Google Auth
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Logowanie użytkownika przy użyciu konta Google
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Przechowujemy dane podstawowe użytkownika w bazie Firestore w celach synchronizacyjnych
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp()
    }, { merge: true });

    return user;
  } catch (error: any) {
    console.error("Błąd logowania przez Google:", error);
    throw error;
  }
}

/**
 * Wylogowanie użytkownika
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Błąd wylogowywania:", error);
    throw error;
  }
}

/**
 * Zapisuje kompletny profil (stan aplikacji wraz ze skanami, wnioskami i załącznikami) w chmurze
 */
export async function saveProfileToCloud(userId: string, profileData: any): Promise<void> {
  try {
    const docRef = doc(db, "userProfiles", userId);
    await setDoc(docRef, {
      profile: profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error: any) {
    console.error("Błąd zapisu profilu do chmury:", error);
    throw error;
  }
}

/**
 * Pobiera profil (stan aplikacji) z chmury
 */
export async function loadProfileFromCloud(userId: string): Promise<any | null> {
  try {
    const docRef = doc(db, "userProfiles", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.profile;
    }
    return null;
  } catch (error: any) {
    console.error("Błąd odczytu profilu z chmury:", error);
    throw error;
  }
}
