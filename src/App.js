import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { AuthProvider } from './context/AuthProvider';
import { useUser } from './context/UserContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import MainPage from './components/MainPage';

const ProtectedRoute = ({ children }) => {
  const { userId } = useUser();
  
  if (!userId) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  return (
    <UserProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/generate" 
              element={
                <ProtectedRoute>
                  <MainPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/generate" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </UserProvider>
  );
};

export default App;