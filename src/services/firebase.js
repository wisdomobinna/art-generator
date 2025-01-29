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
  onSnapshot,
  limit,
  writeBatch
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

// Add conversation context functions
export const saveConversationContext = async (loginId, prompt, enhancedPrompt, imageUrl) => {
  return handleFirebaseOperation(async () => {
    const contextRef = collection(db, 'conversationContext');
    
    // Add new context
    await addDoc(contextRef, {
      loginId,
      originalPrompt: prompt,
      enhancedPrompt,
      imageUrl,
      timestamp: serverTimestamp(),
      isLatest: true
    });

    // Update previous entries
    const q = query(contextRef, where('loginId', '==', loginId), where('isLatest', '==', true));
    const snapshot = await getDocs(q);
    
    const updatePromises = snapshot.docs.map(doc => updateDoc(doc.ref, { isLatest: false }));
    await Promise.all(updatePromises);
  }, 'Failed to save conversation context');
};


export const getConversationContext = async (loginId, limitCount = 3) => {
  return handleFirebaseOperation(async () => {
    const contextRef = collection(db, 'conversationContext');
    const q = query(
      contextRef,
      where('loginId', '==', loginId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)  // Now this will work
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({
        originalPrompt: doc.data().originalPrompt,
        enhancedPrompt: doc.data().enhancedPrompt,
        timestamp: doc.data().timestamp
      }))
      .reverse(); // Reverse to get chronological order
  }, 'Failed to retrieve conversation context');
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
    if (!imageBlob || !(imageBlob instanceof Blob)) {
      throw new Error('Invalid image data: Blob not provided');
    }

    if (imageBlob.size === 0) {
      throw new Error('Invalid image data: Empty blob');
    }

    const isCAI = loginId.startsWith('CAI25');
    if (isCAI && promptData.originalImageUrl) {
      throw new Error('AI-only users cannot upload images');
    }

    const category = promptData.originalImageUrl ? 'AI-involved' : 'AI-only';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const basePath = `${category === 'AI-involved' ? 'ai-involved-images' : 'ai-only-images'}/${loginId}`;
    const filename = `${basePath}/${timestamp}-${randomString}.png`;

    const storageRef = ref(storage, filename);
    const metadata = {
      contentType: 'image/png',
      customMetadata: {
        loginId,
        prompt: promptData.prompt || '',
        enhancedPrompt: promptData.enhancedPrompt || '',
        timestamp: String(timestamp),
        category,
        filename
      }
    };

    const uploadResult = await uploadBytes(storageRef, imageBlob, metadata);
    const downloadURL = await getDownloadURL(uploadResult.ref);

    const promptsRef = collection(db, 'prompts');
    const docRef = await addDoc(promptsRef, {
      loginId,
      prompt: promptData.prompt || '',
      enhancedPrompt: promptData.enhancedPrompt || promptData.prompt,
      imageUrl: downloadURL,
      storagePath: filename,
      timestamp: serverTimestamp(),
      category,
      originalImageUrl: promptData.originalImageUrl || null,
      isLatest: true
    });

    // Update previous entries
    const q = query(
      promptsRef,
      where('loginId', '==', loginId),
      where('isLatest', '==', true)
    );
    const snapshot = await getDocs(q);
    
    // Update individual documents instead of using batch
    const updatePromises = snapshot.docs.map(doc => {
      if (doc.id !== docRef.id) {
        return updateDoc(doc.ref, { isLatest: false });
      }
      return Promise.resolve();
    });
    
    await Promise.all(updatePromises);

    // Save to conversation context
    await saveConversationContext(
      loginId,
      promptData.prompt,
      promptData.enhancedPrompt || promptData.prompt,
      downloadURL
    );

    return { id: docRef.id, imageUrl: downloadURL };
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