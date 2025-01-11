import AdminPage from './components/AdminPage';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';
import InstructionsPage from './components/InstructionsPage';

const App = () => {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/instructions" element={<InstructionsPage />} />
          <Route path="/admin" element={<AdminPage />} /> 
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </UserProvider>
    </Router>
  );
};

export default App;