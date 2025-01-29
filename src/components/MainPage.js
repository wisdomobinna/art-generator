import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateImage } from '../services/api';
import UploadRestrictionAlert from '../components/UploadRestrictionAlert';
import {
  db,
  savePromptToDb,
  getUserPrompts,
  initializeUserStats,
  startUserSession,
  endUserSession,
  formatTimestamp,
  storage,
  subscribeToUserStats
} from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowUp, Download, LogOut, Paperclip, X, Info as InfoIcon, ChevronRight } from 'lucide-react';

const MainPage = () => {
  const [input, setInput] = useState('');
  const [showUploadAlert, setShowUploadAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const { loginId, logout, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !localStorage.getItem('loginId')) {
        navigate('/login');
      }
    };
  
    checkAuth();
  }, [isAuthenticated, navigate]);

  // Load prompts for the login ID
  useEffect(() => {
    const loadPrompts = async () => {
      if (!loginId) return;
      
      try {
        setIsLoadingPrompts(true);
        const promptsRef = collection(db, 'prompts');
        const q = query(
          promptsRef,
          where('loginId', '==', loginId),
          orderBy('timestamp', 'desc')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const promptsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setPrompts(promptsData);
          setIsLoadingPrompts(false);
        });
        
        return () => unsubscribe();
      } catch (err) {
        console.error('Error loading prompts:', err);
        setIsLoadingPrompts(false);
      }
    };
    
    loadPrompts();
  }, [loginId]);

  // Initialize session and track time
  useEffect(() => {
    if (!loginId) return;

    const initSession = async () => {
      try {
        await initializeUserStats(loginId);
        await startUserSession(loginId);
      } catch (err) {
        console.error('Error initializing session:', err);
      }
    };

    const unsubscribe = subscribeToUserStats(loginId, (stats) => {
      if (stats) {
        setTotalTimeSpent(stats.totalTimeSpent || 0);
      }
    });

    initSession();

    // Cleanup on unmount or when loginId changes
    return () => {
      unsubscribe();
      if (loginId) {
        endUserSession(loginId).catch(err => 
          console.error('Error ending session:', err)
        );
      }
    };
  }, [loginId]);

  const handleLogout = async () => {
    try {
      if (loginId) {
        await endUserSession(loginId);
      }
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      // Check if user has CAI25 login ID
      const isCAI25User = loginId?.startsWith('CAI25');
      
      if (isCAI25User) {
        setShowUploadAlert(true);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
  
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }
  
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        setError('Only PNG and JPEG images are allowed');
        return;
      }
      
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage({
        file: file,
        previewUrl: previewUrl
      });
    }
  };

  const uploadOriginalImage = async (file, loginId) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `original-uploads/${loginId}/${timestamp}-${randomString}.${file.name.split('.').pop()}`;
    
    const storageRef = ref(storage, filename);
    const metadata = {
      contentType: file.type,
      customMetadata: {
        loginId: loginId,
        timestamp: String(timestamp),
        originalFilename: file.name
      }
    };
    
    const uploadResult = await uploadBytes(storageRef, file, metadata);
    return await getDownloadURL(uploadResult.ref);
  };
    
  const clearUploadedImage = () => {
    if (uploadedImage?.previewUrl) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !uploadedImage) return;
  
    setIsLoading(true);
    setError(null);
    
    try {
      let originalImageUrl = null;
      
      if (uploadedImage && uploadedImage.file) {
        originalImageUrl = await uploadOriginalImage(uploadedImage.file, loginId);
      }
  
      // Pass uploadedImage.file to generateImage
      const generationResult = await generateImage(input, loginId, uploadedImage?.file);
      console.log('Generation result:', generationResult);
      setImageUrl(generationResult.url);
      
      if (loginId) {
        try {
          const proxyUrl = `${process.env.REACT_APP_API_URL}/proxy-image?url=${encodeURIComponent(generationResult.url)}`;
          const imageResponse = await fetch(proxyUrl);
          if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.status}`);
          
          const imageBlob = await imageResponse.blob();
          if (!imageBlob || imageBlob.size === 0) throw new Error('Received empty image data from proxy');
  
          const processedBlob = new Blob([imageBlob], { type: 'image/png' });
          
          const promptData = {
            prompt: input,
            enhancedPrompt: generationResult.enhancedPrompt,
            originalImageUrl: originalImageUrl,
            timestamp: new Date().toISOString(),
          };
          
          const result = await savePromptToDb(loginId, promptData, processedBlob);
          const updatedPrompts = await getUserPrompts(loginId);
          setPrompts(updatedPrompts);
        } catch (saveError) {
          throw new Error(`Failed to save image: ${saveError.message}`);
        }
      }
      
      setInput('');
      setUploadedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Detailed error in handleSubmit:', err);
      setError(err.message || 'Failed to generate or save image');
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleDownload = async (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return '0s';
    }
  
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
  
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
  
    return parts.join(' ');
  };






  return (
    <div className="flex h-screen bg-gray-50">
    {showUploadAlert && (
      <UploadRestrictionAlert 
        onClose={() => setShowUploadAlert(false)} 
      />
    )}
      {/* Sidebar */}
      <div className="w-72 bg-white border-r overflow-hidden flex flex-col">
        {/* Logo Section */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <img src="/logo_main.png" alt="AI Art Studio" className="h-8 w-8 object-contain"/>
            <h1 className="font-semibold text-lg">AI Art Studio</h1>
          </div>
        </div>
        
        {/* Instructions Link */}
        <div className="p-4 border-b">
          <Link
            to="/instructions"
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
            <InfoIcon className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Experiment Instructions</span>
          </Link>
        </div>
  
        {/* Generation History Title */}  
        <div className="px-4 py-3 border-b">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Generation History</h2>
        </div>
        
        {/* History List */}
        <div className="overflow-y-auto flex-1">
          {isLoadingPrompts ? (
            <div className="p-4 text-center">
              <Loader2 className="animate-spin h-5 w-5 mx-auto text-gray-400" />
            </div>
          ) : prompts.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <p>No generations yet</p>
              <p className="text-xs mt-1">Your history will appear here</p>
            </div>
          ) : (
            prompts.map((prompt) => (
              <div
                key={prompt.id}
                onClick={() => setSelectedPrompt(prompt)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedPrompt?.id === prompt.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={prompt.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{prompt.prompt}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatTimestamp(prompt.timestamp)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
  
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {loginId?.slice(-3)}
              </span>
            </div>
            <span className="text-xs text-gray-500"></span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
          {/* <Link to="/analyze" className="text-blue-500 hover:underline">Image Analyzer</Link> */}
        </div>
  
        {/* Main Chat Area with Scrolling */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4">
            {/* Welcome Message */}
            {!selectedPrompt && !imageUrl && (
              <div className="text-center py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  AI Art Image Generator
                </h1>
              </div>
            )}
            
            {/* Messages Container */}
            <div className="flex flex-col mb-24">
              <div className="flex flex-col-reverse">
                {prompts.filter(prompt => prompt.id !== selectedPrompt?.id).map((prompt) => (
                  <div key={prompt.id} className="flex gap-6 mb-8">
                    <div className="flex-shrink-0 w-[512px] relative group">
                      <div className="bg-white rounded-lg shadow-sm">
                        <img
                          src={prompt.imageUrl}
                          alt={prompt.prompt}
                          className="w-full h-[512px] object-contain rounded-lg"/>
                        <button
                          onClick={() => handleDownload(prompt.imageUrl)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Download image">
                          <Download className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex items-start">
                      <div className="bg-white rounded-2xl shadow-sm p-4 max-w-md">
                        <p className="text-sm text-gray-700">{prompt.prompt}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTimestamp(prompt.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {imageUrl && !selectedPrompt && (
                  <div className="flex gap-6 mb-8">
                    <div className="flex-shrink-0 w-[512px] relative group">
                      <div className="bg-white rounded-lg shadow-sm">
                        <img
                          src={imageUrl}
                          alt="Latest generation"
                          className="w-full h-[512px] object-contain rounded-lg"
                        />
                        <button
                          onClick={() => handleDownload(imageUrl)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Download image">
                          <Download className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex items-start">
                      <div className="bg-white rounded-2xl shadow-sm p-4 max-w-md">
                        <p className="text-sm text-gray-700">{input}</p>
                        <p className="text-xs text-gray-500 mt-2">Just now</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
  
        {/* Loading, Error States, and Input Area Container */}
        <div className="border-t bg-white">
          {/* Loading and Error States */}
          {(isLoading || error) && (
            <div className="max-w-3xl mx-auto px-4">
              <div className="flex gap-6 py-4">
                <div className="flex-shrink-0 w-[512px]"></div>
                <div className="flex-1 flex items-start">
                  <div className="bg-blue-600 rounded-2xl p-4 max-w-md">
                    {isLoading && (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                        <span className="text-sm text-white">Generating your artwork...</span>
                      </div>
                    )}
                    {error && (
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
  
          {/* Input Area */}
          <div className="max-w-3xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="relative">
              {uploadedImage && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-lg border p-2 flex items-center gap-2">
                  <img
                    src={uploadedImage.previewUrl}
                    alt="Upload preview"
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span className="text-sm text-gray-600 flex-1">Image uploaded</span>
                  <button
                    type="button"
                    onClick={clearUploadedImage}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
             
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe the art you want to generate..."
                  className="w-full p-3 pr-24 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
                <div className="absolute right-2 flex items-center gap-2">
                  <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full">
                    <Paperclip className="w-5 h-5 text-gray-500" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      disabled={isLoading}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isLoading || (!input.trim() && !uploadedImage)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full disabled:opacity-50 transition-all duration-200"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ArrowUp className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
  };
  
  export default MainPage;