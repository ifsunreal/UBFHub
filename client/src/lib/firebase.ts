import { initializeApp, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC401hRK08DgE9mWLCBBdWt67XpLLP-6eE",
  authDomain: "ubianfoodhub.firebaseapp.com",
  projectId: "ubianfoodhub",
  storageBucket: "ubianfoodhub.firebasestorage.app",
  messagingSenderId: "727047776929",
  appId: "1:727047776929:web:2befc0088170ce5e445ee0",
};

// Initialize Firebase app with a check for existing app
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    // Use the existing app
    app = getApp();
  } else {
    throw error;
  }
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth functions
export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const logOut = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Google Sign-In functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const signInWithGoogleRedirect = () => {
  return signInWithRedirect(auth, googleProvider);
};

export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error: any) {
    console.error("Google redirect result error:", error);
    throw error;
  }
};

export const onAuthStateChange = (
  callback: (user: FirebaseUser | null) => void,
) => onAuthStateChanged(auth, callback);

// Firestore functions
export const createDocument = (
  collectionName: string,
  docId: string,
  data: any,
) =>
  setDoc(doc(db, collectionName, docId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const getDocument = (collectionName: string, docId: string) =>
  getDoc(doc(db, collectionName, docId));

export const updateDocument = (
  collectionName: string,
  docId: string,
  data: any,
) =>
  updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const deleteDocument = (collectionName: string, docId: string) =>
  deleteDoc(doc(db, collectionName, docId));

export const getCollection = (collectionName: string) =>
  getDocs(collection(db, collectionName));

export const queryCollection = (
  collectionName: string,
  whereField: string,
  operator: any,
  value: any,
) =>
  getDocs(
    query(collection(db, collectionName), where(whereField, operator, value)),
  );

export const subscribeToCollection = (
  collectionName: string,
  callback: (docs: any[]) => void,
) =>
  onSnapshot(collection(db, collectionName), (snapshot) => {
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(docs);
  });

export const subscribeToQuery = (
  collectionName: string,
  whereField: string,
  operator: any,
  value: any,
  callback: (docs: any[]) => void,
) =>
  onSnapshot(
    query(collection(db, collectionName), where(whereField, operator, value)),
    (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(docs);
    },
  );
