import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB1jOfSnwiSLdQLcs63vFzt7NJi58i0p3Q",
  authDomain: "ear-training-8f082.firebaseapp.com",
  projectId: "ear-training-8f082",
  storageBucket: "ear-training-8f082.firebasestorage.app",
  messagingSenderId: "669866371235",
  appId: "1:669866371235:web:2cf1681d853fef43327716",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// if we use backend API
export const backend = "http://localhost:8000";

/**
 * Uploads an image to Firebase Storage
 * I think there is the possibility of 
 * @param url url of the image to upload
 */
export async function uploadImage(url: string) {
  const image = await fetch(url)
  const imageAsBlob = await image.blob()
  const storage = getStorage()
  const uniqueFilePath = crypto.randomUUID() + Date.now().toString();
  const storageRef = ref(storage, uniqueFilePath)

  const snapshot = await uploadBytes(storageRef, imageAsBlob)
  const path = snapshot.ref.fullPath
  console.log(path)
  console.log('Uploaded a blob or file!');
  
  return path
}