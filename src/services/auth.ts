import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import type { User, UserRole } from '../types';

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signOut() {
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
