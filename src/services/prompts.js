import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';

// Save a new prompt and its generated image to Firestore
export const savePrompt = async ({
  userId,
  prompt,
  generatedImageUrl,
  referenceImageUrl = null,
  status = 'completed',
  timestamp
}) => {
  try {
    const promptsRef = collection(db, 'prompts');
    const promptData = {
      userId,
      prompt,
      generatedImageUrl,
      referenceImageUrl,
      status,
      timestamp
    };

    const docRef = await addDoc(promptsRef, promptData);
    return {
      id: docRef.id,
      ...promptData
    };
  } catch (error) {
    console.error('Error saving prompt:', error);
    throw error;
  }
};

// Get all prompts for a specific user
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
    console.error('Error getting user prompts:', error);
    throw error;
  }
};