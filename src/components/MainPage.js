import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/api';
import { auth, savePromptToDb, getUserPrompts } from '../services/firebase';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogOut } from 'lucide-react';

const MainPage = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const { userId, logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPrompts = async () => {
      if (!userId) return;
      try {
        const userPrompts = await getUserPrompts(userId);
        setPrompts(userPrompts);
      } catch (err) {
        console.error('Error loading prompts:', err);
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

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
      
      setSelectedPrompt(promptData);
      await savePromptToDb(userId, promptData);
      const updatedPrompts = await getUserPrompts(userId);
      setPrompts(updatedPrompts);
      setInput('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r overflow-auto">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Prompt History</h2>
          <p className="text-sm text-gray-500 mt-1">{auth.currentUser?.email}</p>
        </div>
        <div className="overflow-y-auto">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedPrompt?.id === prompt.id ? 'bg-blue-50' : ''
              }`}
            >
              <p className="text-sm truncate">{prompt.prompt}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(prompt.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="w-full p-4 text-left text-sm text-gray-700 hover:bg-gray-100 border-t"
        >
          <LogOut className="w-4 h-4 inline mr-2" />
          Logout
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the art you want to generate..."
              className="flex-1 p-2 border rounded"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {(selectedPrompt || imageUrl) && (
          <div className="border rounded p-4 bg-white">
            <img 
              src={selectedPrompt?.imageUrl || imageUrl} 
              alt={selectedPrompt?.prompt || 'Generated artwork'} 
              className="w-full h-auto rounded"
            />
            <p className="mt-2 text-gray-700">{selectedPrompt?.prompt || input}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center p-4">
            <Loader2 className="animate-spin h-8 w-8 mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;