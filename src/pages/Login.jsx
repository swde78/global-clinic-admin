import React, { useState } from 'react';
import { 
  TextField, Button, Typography, Container, Box, Alert, CircularProgress, Paper 
} from '@mui/material';
import { 
  Security as SecurityIcon, AdminPanelSettings as AdminIcon, 
  VpnKey as KeyIcon, Email as EmailIcon 
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App'; 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_API_KEY = 'GLOBAL_CLINIC_ADMIN_2024_SECURE_KEY'; // In production, this should be from env

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

const handleSubmit = async (event) => {
  event.preventDefault();
  setError('');
  
  if (!validateEmail(email)) {
    setError('Please enter a valid email address');
    return;
  }

  if (!password || password.length < 8) {
    setError('Password must be at least 8 characters long');
    return;
  }

  if (!adminKey || adminKey !== ADMIN_API_KEY) {
    setError('Invalid admin access key. Unauthorized access attempt logged.');
    return;
  }

  setLoading(true);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
      email: email,
      password: password,
      admin_key: adminKey
    });
    
    
         // حفظ البيانات
      localStorage.setItem('admin_access_token', response.data.access_token);
      localStorage.setItem('admin_user_id', response.data.user_id.toString());
      localStorage.setItem('admin_role', response.data.role);
      localStorage.setItem('admin_api_key', adminKey);
        
        
        // ⏳ انتظر قليلاً لضمان تسجيل التغيير في localStorage
      navigate('/dashboard');
        // وجه إلى لوحة التحكم
     // navigate('/dashboard', { replace: true });
      window.location.reload(); 

  } catch (error) {
    console.error('Admin login error:', error);
    
    if (error.response) {
      const errorMessage = error.response.data.detail || 'Server error occurred';
      if (error.response.status === 401) {
        setError('Invalid admin credentials. Access denied.');
      } else if (error.response.status === 403) {
        setError('Insufficient privileges. Admin access required.');
      } else {
        setError(errorMessage);
      }
    } else if (error.request) {
      setError('Unable to connect to server. Please check your connection.');
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        py: 4,
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
      }}>
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3, border: '2px solid #ff6b35' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <AdminIcon sx={{ fontSize: 70, color: 'error.main', mb: 2 }} />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              ADMIN PORTAL
            </Typography>
            <Typography component="h2" variant="h6" sx={{ color: 'text.secondary', mt: 1 }}>
              Global Clinic - Secure Access
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
              <SecurityIcon sx={{ mr: 1, color: 'warning.dark' }} />
              <Typography variant="body2" color="warning.dark" fontWeight="bold">
                RESTRICTED ACCESS - AUTHORIZED PERSONNEL ONLY
              </Typography>
            </Box>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Admin Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              error={!!error && !loading}
              InputProps={{
                startAdornment: <EmailIcon sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Admin Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              error={!!error && !loading}
              InputProps={{
                startAdornment: <SecurityIcon sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="adminKey"
              label="Admin Access Key"
              type="password"
              id="adminKey"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              disabled={loading}
              error={!!error && !loading}
              helperText="Super-admin access key required"
              InputProps={{
                startAdornment: <KeyIcon sx={{ color: 'error.main', mr: 1 }} />
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              color="error"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading || !email.trim() || !password.trim() || !adminKey.trim()}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SecurityIcon />}
            >
              {loading ? 'Authenticating...' : 'SECURE LOGIN'}
            </Button>
            
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              All access attempts are logged and monitored
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;

