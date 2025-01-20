import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const LoginPage = () => {
  const [loginId, setLoginId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isLoading } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const success = await login(loginId);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      setError(error.message || 'Invalid login ID or inactive account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Login Section */}
        <div className="lg:w-1/3 flex items-center justify-center p-8 bg-white/80 backdrop-blur-sm">
          <div className="max-w-md w-full space-y-8">
            <div>
              <img
                className="mx-auto h-16 w-auto"
                src="/logo_main.png"
                alt="Logo"
              />
              <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                AI Art Studio
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Enter your Login ID to start creating
              </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                  placeholder="Your Login ID"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 text-red-400">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white shadow-sm transition-all duration-200 ease-in-out ${
                  isLoading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Start Creating'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="lg:w-2/3 p-8 flex items-center justify-center">
          <div className="max-w-2xl">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              <h1 className="mb-4 text-center">
                <span className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient tracking-wide">
                  Welcome!
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Welcome to the online Art studio for the AI Art Competition. 
                Whether you're creating purely AI-generated Art or blending it with your own 
                artwork, this is your canvas, so explore!
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-lg text-blue-900 mb-3">Top Prizes(Total)</h3>
                  <div className="space-y-2 text-blue-800">
                    <p className="flex items-center">
                      <span className="text-2xl font-bold mr-2">$265</span>
                      <span className="text-sm">Category Winners</span>
                    </p>
                    <p className="flex items-center">
                      <span className="text-xl font-bold mr-2">$115</span>
                      <span className="text-sm">Top 12 Artworks</span>
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-lg text-purple-900 mb-3">Key Date</h3>
                  <div className="space-y-2 text-purple-800">
                    <p className="text-sm">Submit by</p>
                    <p className="text-2xl font-bold">Feb 25, 2025</p>
                  </div>
                </div>
              </div>

              {/* Instructions and Guide Links */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/instructions"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-md"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Competition Guidelines
                </Link>

                <Link
                  to="/guide"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:shadow-md"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Tutorial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;