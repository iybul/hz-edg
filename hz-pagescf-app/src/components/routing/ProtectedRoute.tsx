import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * ProtectedRoute component - wraps routes that require authentication
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render the child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;