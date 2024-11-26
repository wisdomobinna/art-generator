import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const savePromptToDb = async (userId, promptData) => {
  try {
    const promptsRef = collection(db, 'prompts');
    await addDoc(promptsRef, {
      userId,
      ...promptData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving prompt:', error);
    throw error;
  }
};

export const getUserPrompts = async (userId) => {
  try {
    const promptsRef = collection(db, 'prompts');
    const q = query(
      promptsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting prompts:', error);
    throw error;
  }
};

export { auth, db };