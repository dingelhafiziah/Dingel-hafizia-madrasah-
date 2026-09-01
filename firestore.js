import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function getCollection(name) {
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getDocument(name, id) {
  const snapshot = await getDoc(doc(db, name, id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function addDocument(name, data) {
  const ref = await addDoc(collection(db, name), { ...data, createdAt: new Date().toISOString() });
  return ref.id;
}

export async function setDocument(name, id, data) {
  await setDoc(doc(db, name, id), data, { merge: true });
}

export async function updateDocument(name, id, data) {
  await updateDoc(doc(db, name, id), data);
}

export async function deleteDocument(name, id) {
  await deleteDoc(doc(db, name, id));
}

export { db, collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy };