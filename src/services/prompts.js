import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export const savePrompt = async (userId, prompt, imageUrl) => {
  return await addDoc(collection(db, 'prompts'), {
    userId,
    prompt,
    imageUrl,
    timestamp: new Date().toISOString()
  });
};

export const getUserPrompts = async (userId) => {
  const q = query(collection(db, 'prompts'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
