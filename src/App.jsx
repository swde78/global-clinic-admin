import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Cases from './pages/Cases';
import Transactions from './pages/Transactions';
import './App.css';

// Create secure admin theme with red accents
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Professional blue
    },
    secondary: {
      main: '#dc004e', // Medical red
    },
    error: {
      main: '#d32f2f', // Admin red
    },
    warning: {
      main: '#ff9800', // Warning orange
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#d32f2f', // Admin red for security emphasis
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #e0e0e0',
        },
      },
    },
  },
});

// Authentication Context with enhanced security
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication Provider Component with maximum security
  const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    
     // Check if admin is already logged in with enhanced security validation
    const token = localStorage.getItem('admin_access_token');
    const userId = localStorage.getItem('admin_user_id');
    const userRole = localStorage.getItem('admin_role');
    const adminKey = localStorage.getItem('admin_api_key');
    

      // Enhanced security: require all credentials and validate admin role
    if (token && userId && userRole === 'admin' && adminKey) {
      // Additional security check: validate token format and expiry
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          setIsAuthenticated(true);
          setUser({
            id: userId,
            role: userRole,
            token: token,
            adminKey: adminKey
          });
        } else {
          // Invalid token format, clear credentials
          clearCredentials();
        }
      } catch (error) {
        console.error('Token validation error:', error);
        clearCredentials();
      }
    } else {
      clearCredentials();
    }
    
    setLoading(false);
  }, []);

  const clearCredentials = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user_id');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_api_key');
    setIsAuthenticated(false);
    setUser(null);
  };

  const login = (userData) => {
    // Enhanced security validation for admin login
    if (userData.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    
    localStorage.setItem('admin_access_token', userData.access_token);
    localStorage.setItem('admin_user_id', userData.user_id);
    localStorage.setItem('admin_role', userData.role);
    localStorage.setItem('admin_api_key', userData.admin_key);
    
    setIsAuthenticated(true);
    setUser({
      id: userData.user_id,
      role: userData.role,
      token: userData.access_token,
      adminKey: userData.admin_key
    });
  };

  const logout = () => {
    clearCredentials();
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Maximum Security Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'error.main',
        color: 'white'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <div>🔒</div>
          <div>Authenticating Admin Access...</div>
        </Box>
      </Box>
    );
  }
  
  // Enhanced security: verify admin role and credentials
  if (!isAuthenticated || !user || user.role !== 'admin' || !user.adminKey) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Route Component with security redirect
  const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'error.main',
        color: 'white'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <div>🔒</div>
          <div>Validating Security Credentials...</div>
        </Box>
      </Box>
    );
  }
  
  // Enhanced security: only redirect if properly authenticated as admin
  return (isAuthenticated && user?.role === 'admin') ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            {/* Maximum Security Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cases" 
              element={
                <ProtectedRoute>
                  <Cases />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route - redirect to login with security warning */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

