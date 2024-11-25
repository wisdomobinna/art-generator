import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { generateImage } from '../services/api';

const MainPage = () => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateImage(input);
      setImages(prev => [{
        url: imageUrl,
        prompt: input,
        timestamp: new Date().toISOString()
      }, ...prev]);
      setInput('');
    } catch (error) {
      console.error('Generation error:', error);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold">AI Art Generator</h1>
        </div>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {/* Generation Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe the art you want to generate..."
                  className="w-full p-3 pr-24 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none"
                  disabled={isGenerating}
                />
                <button
                  type="submit"
                  disabled={isGenerating || !input.trim()}
                  className="absolute right-2 top-2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700 text-center">{error}</p>
            </div>
          )}

          {/* Generated Images */}
          <div className="grid grid-cols-1 gap-6">
            {images.map((image, index) => (
              <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.prompt}
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-600">{image.prompt}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(image.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Loading State */}
          {isGenerating && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Generating your artwork...</p>
            </div>
          )}

          {/* Empty State */}
          {!isGenerating && images.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Your generated images will appear here
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MainPage;