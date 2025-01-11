import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

const formatLoginId = (id) => {
  if (!id) return '';
  // Remove whitespace and convert to uppercase
  id = id.toUpperCase().replace(/\s/g, '');
  
  // Check if it's already in the correct format
  if (id.match(/^(CAC25|CAI25)-\d{3}$/)) return id;
  
  // If it's just a number, format it as CAC25 (default)
  if (id.match(/^\d{1,3}$/)) {
    return `CAC25-${id.padStart(3, '0')}`;
  }

  // Extract any numbers from the ID
  const numbers = id.match(/\d+/);
  if (numbers) {
    const number = numbers[0];
    // Determine prefix based on input
    if (id.includes('CAC') || id.includes('CONTROL')) {
      return `CAC25-${number.padStart(3, '0')}`;
    } else if (id.includes('CAI') || id.includes('AI')) {
      return `CAI25-${number.padStart(3, '0')}`;
    }
  }
  
  return id;
};


const handleFirebaseOperation = async (operation, errorMessage) => {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw new Error(`${errorMessage}: ${error.message}`);
  }
};

export const validateLoginId = async (loginId) => {
  return handleFirebaseOperation(async () => {
    console.log('Raw loginId received:', loginId);
    
    const formattedId = formatLoginId(loginId);
    console.log('Formatted loginId:', formattedId);
    
    if (!formattedId) {
      throw new Error('Login ID is required');
    }

    const loginDocRef = doc(db, 'loginIDs', formattedId);
    const loginDoc = await getDoc(loginDocRef);
    
    console.log('Login doc exists:', loginDoc.exists());
    
    if (!loginDoc.exists()) {
      throw new Error('Invalid login ID');
    }
    
    const loginData = loginDoc.data();
    console.log('Login data:', loginData);
    
    return {
      loginId: formattedId,
      ...loginData
    };
  }, 'Authentication failed');
};


export const initializeUserStats = async (loginId) => {
  return handleFirebaseOperation(async () => {
    const userStatsRef = doc(db, 'userStats', loginId);
    const statsDoc = await getDoc(userStatsRef);
    
    if (!statsDoc.exists()) {
      await setDoc(userStatsRef, {
        totalTimeSpent: 0,
        lastSessionStart: null,
        lastSessionEnd: null,
        loginId: loginId,
        createdAt: serverTimestamp()
      });
    }
    return true;
  }, 'Failed to initialize user stats');
};

export const startUserSession = async (loginId) => {
  return handleFirebaseOperation(async () => {
    const userStatsRef = doc(db, 'userStats', loginId);
    await updateDoc(userStatsRef, {
      lastSessionStart: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });
    return true;
  }, 'Failed to start user session');
};

export const endUserSession = async (loginId) => {
  return handleFirebaseOperation(async () => {
    const userStatsRef = doc(db, 'userStats', loginId);
    const statsDoc = await getDoc(userStatsRef);
    const stats = statsDoc.data();
    
    if (stats && stats.lastSessionStart) {
      const sessionStart = stats.lastSessionStart.toDate();
      const currentTime = new Date();
      const sessionDuration = Math.floor((currentTime - sessionStart) / 1000);
      
      await updateDoc(userStatsRef, {
        totalTimeSpent: (stats.totalTimeSpent || 0) + sessionDuration,
        lastSessionEnd: serverTimestamp(),
        lastSessionStart: null // Reset session start
      });
    }
    return true;
  }, 'Failed to end user session');
};

export const getUserStats = async (loginId) => {
  return handleFirebaseOperation(async () => {
    const userStatsRef = doc(db, 'userStats', loginId);
    const statsDoc = await getDoc(userStatsRef);
    if (!statsDoc.exists()) {
      throw new Error('User stats not found');
    }
    return statsDoc.data();
  }, 'Failed to retrieve user stats');
};

export const subscribeToUserStats = (loginId, onUpdate) => {
  const userStatsRef = doc(db, 'userStats', loginId);
  return onSnapshot(userStatsRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      onUpdate(data);
    }
  });
};

let lastUpdateTime = Date.now();
const UPDATE_INTERVAL = 30000; // 30 seconds

export const updateUserTimeSpent = async (loginId) => {
  return handleFirebaseOperation(async () => {
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime < UPDATE_INTERVAL) {
      return;
    }
    
    lastUpdateTime = currentTime;
    console.log('Updating time spent at:', new Date().toISOString());

    const userStatsRef = doc(db, 'userStats', loginId);
    const statsDoc = await getDoc(userStatsRef);
    const stats = statsDoc.data();

    if (stats && stats.lastSessionStart) {
      const sessionStart = stats.lastSessionStart.toDate();
      const currentSessionDuration = Math.floor((currentTime - sessionStart) / 1000);
      const newTotalTime = (stats.totalTimeSpent || 0) + currentSessionDuration;

      await updateDoc(userStatsRef, {
        totalTimeSpent: newTotalTime,
        lastUpdated: serverTimestamp()
      });

      return newTotalTime;
    }
    return stats?.totalTimeSpent || 0;
  }, 'Failed to update user time spent');
};

export const savePromptToDb = async (loginId, promptData, imageBlob) => {
  return handleFirebaseOperation(async () => {
    if (!imageBlob || imageBlob.size === 0) {
      throw new Error('Invalid image data');
    }

    const isCAI = loginId.startsWith('CAI25');

    // Validate that CAI users aren't uploading images
    if (isCAI && promptData.originalImageUrl) {
      throw new Error('AI-only users cannot upload images');
    }

    console.log('Starting upload process for loginId:', loginId);
    console.log('Image blob size:', imageBlob.size);
    console.log('Image blob type:', imageBlob.type);
    console.log('Original Image URL:', promptData.originalImageUrl);

    const category = promptData.originalImageUrl ? 'AI-involved' : 'AI-only';
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const basePath = category === 'AI_involved' 
      ? `ai-involved-images/${loginId}`
      : `ai-only-images/${loginId}`;
    const filename = `${basePath}/${timestamp}-${randomString}.png`;
    
    console.log('Generated filename:', filename);
    console.log('Category:', category);

    const storageRef = ref(storage, filename);

    const metadata = {
      contentType: 'image/png',
      customMetadata: {
        loginId: loginId,
        prompt: promptData.prompt || '',
        timestamp: String(timestamp),
        category: category,
        filename: filename
      }
    };

    console.log('Uploading with metadata:', metadata);

    try {
      const uploadResult = await uploadBytes(storageRef, imageBlob, metadata);
      console.log('Upload successful:', uploadResult);

      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Download URL generated:', downloadURL);

      const promptsRef = collection(db, 'prompts');
      const docRef = await addDoc(promptsRef, {
        loginId,
        prompt: promptData.prompt || '',
        imageUrl: downloadURL,
        storagePath: filename,
        timestamp: serverTimestamp(),
        category: category,
        originalImageUrl: promptData.originalImageUrl || null,
        fileSize: imageBlob.size
      });

      console.log('Successfully saved to Firestore with ID:', docRef.id);

      return { id: docRef.id, imageUrl: downloadURL };
    } catch (error) {
      console.error('Detailed upload error:', error);
      if (error.code) console.error('Error code:', error.code);
      if (error.message) console.error('Error message:', error.message);
      throw error;
    }
  }, 'Failed to save generation');
};

export const getUserPrompts = async (loginId) => {
  return handleFirebaseOperation(async () => {
    const promptsRef = collection(db, 'prompts');
    const q = query(
      promptsRef,
      where('loginId', '==', loginId),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }, 'Failed to retrieve user prompts');
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  try {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    
    if (isNaN(date.getTime())) return 'Invalid time';

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid time';
  }
};

// Helper function to format time duration
export const formatDuration = (seconds) => {
  if (!seconds) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
  
  return parts.join(' ');
};

export default app;