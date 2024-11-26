import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/api';
import { auth, savePromptToDb, getUserPrompts, getCurrentUser } from '../services/firebase';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogOut, Paperclip, X, Home, Image as ImageIcon, ChevronRight } from 'lucide-react';

const MainPage = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const { userId, logout } = useUser();
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    const initializeUserData = async () => {
      try {
        setIsLoadingPrompts(true);
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          const userPrompts = await getUserPrompts(currentUser.uid);
          setPrompts(userPrompts);
        }
      } catch (err) {
        console.error('Error initializing user data:', err);
        setError('Failed to load your previous generations');
      } finally {
        setIsLoadingPrompts(false);
      }
    };

    initializeUserData();
  }, []);

  useEffect(() => {
    const loadPrompts = async () => {
      if (!userId) return;
      
      try {
        setIsLoadingPrompts(true);
        const userPrompts = await getUserPrompts(userId);
        setPrompts(userPrompts);
      } catch (err) {
        console.error('Error loading prompts:', err);
      } finally {
        setIsLoadingPrompts(false);
      }
    };

    loadPrompts();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    }
  };

  const handleReset = () => {
    setInput('');
    setImageUrl(null);
    setUploadedImage(null);
    setError(null);
    setSelectedPrompt(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError('Image size should be less than 4MB');
        return;
      }

      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        setError('Only PNG and JPEG images are allowed');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearUploadedImage = (e) => {
    e.stopPropagation();
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
      const url = await generateImage(input);
      setImageUrl(url);
      
      const promptData = {
        prompt: input,
        imageUrl: url,
        timestamp: new Date().toISOString(),
      };
      
      if (userId) {
        await savePromptToDb(userId, promptData);
        const updatedPrompts = await getUserPrompts(userId);
        setPrompts(updatedPrompts);
      }
      
      setInput('');
      setUploadedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon className="w-6 h-6 text-blue-500" />
            <h1 className="font-semibold text-lg">AI Art Studio</h1>
          </div>
          <button
            onClick={handleReset}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">New Generation</span>
          </button>
        </div>
        
        <div className="px-4 py-3 border-b">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Generation History</h2>
        </div>

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
                      {new Date(prompt.timestamp).toLocaleString()}
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
                {auth.currentUser?.email?.[0].toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-600">{auth.currentUser?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Centered Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Welcome Message */}
            {!selectedPrompt && !imageUrl && (
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  AI Art Image Generator
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Transform your ideas into stunning artwork using artificial intelligence. 
                  Start by describing what you'd like to create or upload an image to modify.
                </p>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex flex-col gap-4">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe the art you want to generate..."
                    className="w-full p-4 pl-5 pr-36 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    disabled={isLoading}
                  />
                  <div className="absolute right-2 flex items-center gap-2">
                    <label 
                      className="cursor-pointer p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Upload image"
                    >
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
                      className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                    >
                      {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </div>

                {uploadedImage && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <img 
                      src={uploadedImage} 
                      alt="Upload preview" 
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Image uploaded</p>
                      <p className="text-xs text-gray-500">Ready for modification</p>
                    </div>
                    <button
                      type="button"
                      onClick={clearUploadedImage}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            </form>

            {error && (
              <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <p>{error}</p>
              </div>
            )}

            {(selectedPrompt || imageUrl) && (
              <div className="border rounded-xl p-6 bg-white shadow-sm">
                <div className="aspect-square w-full max-w-2xl mx-auto overflow-hidden rounded-lg bg-gray-50">
                  <img 
                    src={selectedPrompt?.imageUrl || imageUrl} 
                    alt={selectedPrompt?.prompt || 'Generated artwork'} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="mt-4 text-gray-700 text-center">
                  {selectedPrompt?.prompt || input}
                </p>
              </div>
            )}

            {isLoading && (
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
                <p className="text-lg font-medium text-gray-900">Creating your masterpiece...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;