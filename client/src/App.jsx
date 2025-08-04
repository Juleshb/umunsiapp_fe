import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import Articles from './pages/Articles';
import ArticleView from './components/ArticleView';
import socketService from './services/socketService';

function App() {
  // Connect socket on app mount
  React.useEffect(() => {
    socketService.connect();
    console.log('SocketService: connect() called from App.jsx');
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/friends" element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            } />
            <Route path="/clubs" element={
              <ProtectedRoute>
                <Clubs />
              </ProtectedRoute>
            } />
            <Route path="/clubs/:id" element={
              <ProtectedRoute>
                <ClubDetail />
              </ProtectedRoute>
            } />
            <Route path="/articles" element={
              <ProtectedRoute>
                <Articles />
              </ProtectedRoute>
            } />
            <Route path="/articles/:id" element={
              <ProtectedRoute>
                <ArticleView />
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;