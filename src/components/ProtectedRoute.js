import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { loginId } = useUser();
  
  if (!loginId) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;