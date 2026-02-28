import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import type { User, UserRole } from '../types';

const GOOGLE_TOKEN_KEY = 'google_access_token';

export async function signInWithGoogle(): Promise<string | null> {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken ?? null;
  if (token) {
    sessionStorage.setItem(GOOGLE_TOKEN_KEY, token);
  }
  return token;
}

export function getGoogleAccessToken(): string | null {
  return sessionStorage.getItem(GOOGLE_TOKEN_KEY);
}

export async function refreshGoogleToken(): Promise<string | null> {
  // Re-authenticate to get a fresh token
  return signInWithGoogle();
}

export async function signOut() {
  sessionStorage.removeItem(GOOGLE_TOKEN_KEY);
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserRole(uid: string): Promise<UserRole> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data().role as UserRole;
  }
  return 'employee';
}

export async function ensureUserInFirestore(
  firebaseUser: FirebaseUser
): Promise<User> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      id: firebaseUser.uid,
      name: data.name || firebaseUser.displayName || '',
      email: data.email || firebaseUser.email || '',
      role: data.role as UserRole,
    };
  }

  // First-time login: create user doc with default 'employee' role
  const newUser: Omit<User, 'id'> = {
    name: firebaseUser.displayName || '',
    email: firebaseUser.email || '',
    role: 'employee',
  };
  await setDoc(userRef, newUser);

  return { id: firebaseUser.uid, ...newUser };
}
