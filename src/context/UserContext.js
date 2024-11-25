import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    console.log('UserContext - userId changed:', userId);
  }, [userId]);

  const login = (id) => {
    console.log('UserContext - login called with id:', id);
    setUserId(id);
  };

  const logout = () => {
    console.log('UserContext - logout called');
    setUserId(null);
  };

  const value = {
    userId,
    login,
    logout
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};