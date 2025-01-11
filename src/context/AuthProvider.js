// AuthProvider.js
import { useEffect } from 'react';
import { useUser } from './UserContext';
import { validateLoginId } from '../services/firebase';

export const AuthProvider = ({ children }) => {
  const { login } = useUser();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const savedLoginId = sessionStorage.getItem('loginId');
      if (savedLoginId) {
        try {
          // Validate the stored login ID
          await validateLoginId(savedLoginId);
          await login(savedLoginId);
        } catch (error) {
          // If validation fails, clear the session
          sessionStorage.removeItem('loginId');
          console.error('Session restoration failed:', error);
        }
      }
    };

    checkSession();
  }, [login]);

  return children;
};

export default AuthProvider;