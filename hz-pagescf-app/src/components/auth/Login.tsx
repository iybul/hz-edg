import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  CircularProgress,
  Link
} from '@mui/material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isAuthenticated, loading, error, login, clearError } = useAuth();
  const navigate = useNavigate();
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    const success = await login({ email, password });
    console.log('Login attempt result:', success ? 'success' : 'failed');
    
    // If login was successful, test the auth immediately to verify it works
    // if (success) {
    //   try {
    //     // Make a test API request to check auth
    //     const API_URL = process.env.REACT_APP_API_URL || 'http://api.hazard-zero.com:8080/api';
    //     const token = localStorage.getItem('hazardZeroToken');
    //     console.log('Testing API auth with token length:', token?.length || 0);
        
    //     const testHeaders: Record<string, string> = {
    //       'Content-Type': 'application/json'
    //     };
        
    //     if (token) {
    //       testHeaders['Authorization'] = token.startsWith('Bearer ') 
    //         ? token 
    //         : `Bearer ${token}`;
    //     }
        
    //     // Test with auth-specific endpoint
    //     const testResponse = await fetch(`${API_URL}/auth/user`, {
    //       headers: testHeaders
    //     });
        
    //     console.log('Auth test response status:', testResponse.status);
        
    //     if (testResponse.status === 401) {
    //       console.error('Auth test failed with 401 Unauthorized');
    //     } else {
    //       console.log('Auth test successful');
    //     }
    //   } catch (error) {
    //     console.error('Auth test error:', error);
    //   }
    // }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Organization Login
          </Typography>
          
          {error && (
            <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" variant="body2">
                  Register
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;