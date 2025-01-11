import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { validateLoginId } from '../services/firebase';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [loginId, setLoginId] = useState(() => localStorage.getItem('loginId') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [isLoading, setIsLoading] = useState(false);

  // Validate stored loginId on initial load
  useEffect(() => {
    const validateStoredLogin = async () => {
      const storedLoginId = localStorage.getItem('loginId');
      if (storedLoginId) {
        setIsLoading(true);
        try {
          const response = await validateLoginId(storedLoginId);
          if (response) {
            setLoginId(response.loginId);
            setIsAuthenticated(true);
          } else {
            // Clear invalid stored credentials
            setLoginId(null);
            setIsAuthenticated(false);
            localStorage.removeItem('loginId');
            localStorage.setItem('isAuthenticated', 'false');
          }
        } catch (error) {
          console.error('Stored login validation error:', error);
          setLoginId(null);
          setIsAuthenticated(false);
          localStorage.removeItem('loginId');
          localStorage.setItem('isAuthenticated', 'false');
        } finally {
          setIsLoading(false);
        }
      }
    };

    validateStoredLogin();
  }, []);

  const login = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const response = await validateLoginId(id);
      if (response) {
        setLoginId(response.loginId);
        setIsAuthenticated(true);
        localStorage.setItem('loginId', response.loginId);
        localStorage.setItem('isAuthenticated', 'true');
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginId(null);
      setIsAuthenticated(false);
      localStorage.removeItem('loginId');
      localStorage.setItem('isAuthenticated', 'false');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setLoginId(null);
    setIsAuthenticated(false);
    localStorage.removeItem('loginId');
    localStorage.setItem('isAuthenticated', 'false');
  }, []);

  return (
    <UserContext.Provider 
      value={{ 
        loginId, 
        isAuthenticated, 
        isLoading,
        login, 
        logout 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;