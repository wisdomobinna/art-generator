import React, { useState, useRef, useEffect } from 'react';
import { User, Bot, Download, ImagePlus, LogOut, Loader2 } from 'lucide-react';
import { generateImage } from '../services/api';  // Make sure this matches the export
import { savePrompt, logoutUser } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import "../App.css";

const MainPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [referenceImage, setReferenceImage] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { userId, logout } = useUser();

  // Check if user is authenticated
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !referenceImage) return;
    
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    // Add user message to chat
    setMessages([...messages, { 
      role: 'user', 
      content: input,
      referenceImage: referenceImage 
    }]);
    
    setIsGenerating(true);
    
    try {
      const imageUrl = await generateImage(input);
      
      // Save prompt with userId from context
      await savePrompt(userId, {
        prompt: input,
        generatedImageUrl: imageUrl,
        referenceImageUrl: referenceImage,
        status: 'completed',
        timestamp: new Date().toISOString()
      });

      // Add AI response with generated image
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Here's your generated artwork.",
        image: imageUrl
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, there was an error generating your image.",
        error: true
      }]);
    } finally {
      setIsGenerating(false);
      setInput('');
      setReferenceImage(null);
      scrollToBottom();
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser(); // Firebase logout
      logout(); // Context logout
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-art-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <h1 className="font-semibold">AI Art Generator</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </header>

      <main className={`flex-1 overflow-y-auto ${!hasInteracted ? 'flex items-center justify-center' : ''}`}>
        <div className={`${hasInteracted ? 'max-w-4xl mx-auto px-4 py-6 space-y-8' : 'text-center px-4'}`}>
          {!hasInteracted ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Welcome to AI Art Generator</h2>
              <p className="text-gray-600">Describe what you'd like to create and I'll generate it for you.</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md bg-blue-600 text-white">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}
                  
                  <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {message.referenceImage && (
                      <div className="mb-2 rounded-lg overflow-hidden">
                        <img 
                          src={message.referenceImage} 
                          alt="Reference" 
                          className="max-w-xs rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className={`px-4 py-2 rounded-lg ${
                      message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>

                    {message.image && (
                      <div className="mt-2 relative group">
                        <img 
                          src={message.image} 
                          alt="Generated art" 
                          className="rounded-lg border border-gray-200 max-w-full"
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button 
                            onClick={() => handleDownload(message.image)}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md bg-gray-700 text-white">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-center items-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-500">Generating your artwork...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      <div className={`sticky bottom-0 border-t bg-white/80 backdrop-blur-sm ${!hasInteracted ? 'shadow-lg' : ''}`}>
        <form onSubmit={handleSubmit} className={`max-w-4xl mx-auto p-4 ${!hasInteracted ? 'max-w-2xl' : ''}`}>
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the art you want to generate..."
              className="w-full p-3 pl-12 pr-12 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:outline-none"
            />
            
            <div className="absolute left-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setReferenceImage(URL.createObjectURL(file));
                  }
                }}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <ImagePlus className="w-5 h-5" />
              </button>
            </div>

            <button
              type="submit"
              className="absolute right-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
              disabled={(!input.trim() && !referenceImage) || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Generate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MainPage;