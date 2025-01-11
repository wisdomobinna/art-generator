import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Loader2, Plus, X } from 'lucide-react';

const AdminPage = () => {
  const [newLoginId, setNewLoginId] = useState('');
  const [prefix, setPrefix] = useState('CAC25'); // Default prefix
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [existingIds, setExistingIds] = useState([]);

  useEffect(() => {
    const fetchLoginIds = async () => {
      try {
        const loginIdsRef = collection(db, 'loginIDs');
        const snapshot = await getDocs(loginIdsRef);
        const ids = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExistingIds(ids.sort((a, b) => a.id.localeCompare(b.id)));
      } catch (err) {
        console.error('Error fetching login IDs:', err);
        setError('Failed to fetch existing login IDs');
      }
    };

    fetchLoginIds();
  }, []);

  const formatLoginId = (id, selectedPrefix) => {
    if (!id) return '';
    id = id.trim().replace(/\D/g, ''); // Remove non-digits
    if (id.match(/^\d{1,3}$/)) {
      return `${selectedPrefix}-${id.padStart(3, '0')}`;
    }
    return '';
  };

// Update the handleSubmit function in AdminPage.js:
const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      const formattedId = formatLoginId(newLoginId, prefix);
      
      // Validate format
      if (!formattedId.match(/^(CAC25|CAI25)-\d{3}$/)) {
        throw new Error('Invalid ID format. Use numbers 1-999');
      }
  
      // Check if ID already exists
      const loginDocRef = doc(db, 'loginIDs', formattedId);
      const docSnapshot = await getDoc(loginDocRef);
      
      if (docSnapshot.exists()) {
        throw new Error('This login ID already exists');
      }
  
      // Add new login ID using setDoc with the formatted ID
      await setDoc(loginDocRef, {
        isActive: true,
        createdAt: serverTimestamp(),
        type: prefix === 'CAC25' ? 'AI-involved' : 'AI-only'
      });
  
      setSuccess(`Successfully created login ID: ${formattedId}`);
      setNewLoginId('');
      
      // Refresh the list
      const loginIdsRef = collection(db, 'loginIDs');
      const snapshot = await getDocs(loginIdsRef);
      const ids = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExistingIds(ids.sort((a, b) => a.id.localeCompare(b.id)));
  
    } catch (err) {
      console.error('Error creating login ID:', err);
      setError(err.message || 'Failed to create login ID');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin - Create Login IDs</h1>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4">
              {/* Prefix Selection */}
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="CAC25">CAC25 (AI-involved)</option>
                <option value="CAI25">CAI25 (AI-only)</option>
              </select>

              <input
                type="text"
                value={newLoginId}
                onChange={(e) => setNewLoginId(e.target.value)}
                placeholder="Enter number (1-999)"
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !newLoginId.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create ID
              </button>
            </div>
          </form>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700">
              <X className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Existing IDs */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Login IDs</h2>
            <div className="border rounded divide-y">
              {existingIds.map((login) => (
                <div key={login.id} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{login.id}</p>
                    <p className="text-sm text-gray-500">
                      Created: {login.createdAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      login.type === 'AI-involved' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {login.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      login.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {login.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;