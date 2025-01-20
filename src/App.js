import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';
import InstructionsPage from './components/InstructionsPage';
import GuidelinePage from './components/GuidelinePage'; // Add this import
import AdminPage from './components/AdminPage';

const App = () => {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/instructions" element={<InstructionsPage />} />
          <Route path="/guide" element={<GuidelinePage />} /> {/* Add this route */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </UserProvider>
    </Router>
  );
};

export default App;