import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const signIn = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password);

export const signUp = (email: string, password: string) => 
  createUserWithEmailAndPassword(auth, email, password);

export const logOut = () => signOut(auth);

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => 
  onAuthStateChanged(auth, callback);

// Firestore functions
export const createDocument = (collectionName: string, docId: string, data: any) => 
  setDoc(doc(db, collectionName, docId), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const addDocument = (collectionName: string, data: any) => 
  addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const getDocument = (collectionName: string, docId: string) => 
  getDoc(doc(db, collectionName, docId));

export const updateDocument = (collectionName: string, docId: string, data: any) => 
  updateDoc(doc(db, collectionName, docId), { ...data, updatedAt: serverTimestamp() });

export const deleteDocument = (collectionName: string, docId: string) => 
  deleteDoc(doc(db, collectionName, docId));

export const getCollection = (collectionName: string) => 
  getDocs(collection(db, collectionName));

export const queryCollection = (collectionName: string, whereField: string, operator: any, value: any) => 
  getDocs(query(collection(db, collectionName), where(whereField, operator, value)));

export const subscribeToCollection = (collectionName: string, callback: (docs: any[]) => void) => 
  onSnapshot(collection(db, collectionName), (snapshot) => {
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(docs);
  });

export const subscribeToQuery = (collectionName: string, whereField: string, operator: any, value: any, callback: (docs: any[]) => void) => 
  onSnapshot(query(collection(db, collectionName), where(whereField, operator, value)), (snapshot) => {
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(docs);
  });