import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User, JwtPayload, LoginCredentials } from '../types/auth';

interface AuthContextProps extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('hazardZeroToken'));
  const [user, setUser] = useState<User | null>(null);
  const [orgId, setOrgId] = useState<number | null>(
    localStorage.getItem('hazardZeroOrgId') 
      ? parseInt(localStorage.getItem('hazardZeroOrgId')!, 10) 
      : null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const validateInitialAuth = async () => {
      try {
        console.log('Initial auth check...');
        if (token) {
          console.log('Token exists, verifying...');
          await verifyToken();
          
          // After token verification, check if we can use it for API requests
          try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://api.hazard-zero.com:8080/api';
            console.log('Testing API access with token');
            
            const testHeaders: Record<string, string> = {
              'Content-Type': 'application/json',
              'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
            };
            
            // Use //orgs/get_organization instead of /orgs to check auth
            // const testResponse = await fetch(`${API_URL}//orgs/get_organization`, {
            //   headers: testHeaders
            // });
            
            // console.log('Auth test response:', testResponse.status);
            
            // if (testResponse.status === 401) {
            //   console.error('Token verification succeeded but API test failed with 401');
            //   throw new Error('API authentication failed');
            // }
          } catch (testError) {
            console.error('API access test failed:', testError);
            // Don't logout here, just log the error
          }
        } else {
          console.log('No token found, setting as not authenticated');
          setLoading(false);
        }
      } catch (error) {
        console.error('Initial auth validation failed:', error);
        setLoading(false);
      }
    };
    
    validateInitialAuth();
  }, []);
  
  // Save token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      console.log('Saving token to localStorage:', token.substring(0, 15) + '...');
      localStorage.setItem('hazardZeroToken', token);
      
      // Verify the token was saved correctly
      const savedToken = localStorage.getItem('hazardZeroToken');
      console.log('Token saved in localStorage:', 
        savedToken ? savedToken.substring(0, 15) + '...' : 'missing');
      
      if (savedToken !== token) {
        console.error('Token was not saved correctly to localStorage!');
      }
    } else {
      console.log('Removing token from localStorage');
      localStorage.removeItem('hazardZeroToken');
    }
  }, [token]);
  
  // Save orgId to localStorage whenever it changes
  useEffect(() => {
    if (orgId !== null && orgId !== undefined) {
      localStorage.setItem('hazardZeroOrgId', orgId.toString());
    } else {
      localStorage.removeItem('hazardZeroOrgId');
    }
  }, [orgId]);
  
  const verifyToken = async (): Promise<void> => {
    try {
      console.log('Verifying token:', token);
      
      if (!token || token.trim() === '') {
        console.error('No token to verify');
        throw new Error('No token available');
      }
      
      // Extract user info and org_id from the token payload
      const tokenPayload = parseJwt(token!);
      console.log('Token payload extracted:', tokenPayload);
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (tokenPayload.exp && tokenPayload.exp < currentTime) {
        console.warn('Token expired:', tokenPayload.exp, 'Current time:', currentTime);
        throw new Error('Token expired');
      }
      
      // Create user object with defaults for missing fields
      const userData = {
        userId: tokenPayload.user_id || 0,
        email: tokenPayload.email || '',
        name: tokenPayload.name || 'User'
      };
      
      console.log('Setting user data from token:', userData);
      setUser(userData);
      
      // Set org ID with fallback to 1 if missing
      const organizationId = tokenPayload.org_id || 1;
      console.log('Setting org ID from token:', organizationId);
      setOrgId(organizationId);
      
      // Also ensure the values are in localStorage
      localStorage.setItem('hazardZeroToken', token);
      if (organizationId) {
        localStorage.setItem('hazardZeroOrgId', organizationId.toString());
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Invalid token:', error);
      // Clear invalid token
      logout();
      setLoading(false);
    }
  };
  
  const clearError = (): void => {
    setError(null);
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting login with:', credentials);
      
      // First, try logging in with the new API
      try {
        // Use the same base URL as the API service
      const API_URL = process.env.REACT_APP_API_URL || 'http://api.hazard-zero.com:8080/api';
      console.log(`Making login request to: ${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
        
        console.log('Login response status:', response.status);
        
        // Read the response as text first to debug
        const responseText = await response.text();
        console.log('Login response text:', responseText);
        
        // If it's valid JSON, parse it
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed login response:', data);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          throw new Error('Invalid response from server');
        }
        
        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }
        
        console.log('Login response data structure:', Object.keys(data));
        
        // Check possible token locations in the response
        let token = data.token || data.access_token || 
                   (data.user && data.user.token) || 
                   (data.auth && data.auth.token);
                   
        // If we find a token with the name jwt, use that
        if (data.jwt) {
          console.log('Found JWT token in response');
          token = data.jwt;
        }
        
        // Deep search for a token in the response
        if (!token) {
          console.log('Searching deeply for token in response...');
          // Function to recursively search for token in object
          const findToken = (obj: any, maxDepth = 3, currentDepth = 0): string | null => {
            if (!obj || currentDepth > maxDepth) return null;
            
            // Check common token key names
            const tokenKeys = ['token', 'access_token', 'jwt', 'auth_token', 'id_token'];
            for (const key of tokenKeys) {
              if (obj[key] && typeof obj[key] === 'string') {
                console.log(`Found token at key: ${key}`);
                return obj[key];
              }
            }
            
            // Recursively check child objects
            for (const key of Object.keys(obj)) {
              if (obj[key] && typeof obj[key] === 'object') {
                const found = findToken(obj[key], maxDepth, currentDepth + 1);
                if (found) return found;
              }
            }
            
            return null;
          };
          
          token = findToken(data) || token;
        }
        
        if (!token) {
          console.error('No token found in response:', data);
          throw new Error('No authentication token received');
        }
        
        console.log('Found token in response, type:', typeof token);
        console.log('Token preview:', token.substring(0, 15) + '...');
        console.log('Token character count:', token.length);
        
        // Check if token looks like a JWT (contains two periods)
        const hasJwtFormat = (token.match(/\./g) || []).length === 2;
        console.log('Token has JWT format:', hasJwtFormat);
        
        // Save the token to both state and localStorage immediately
        setToken(token);
        localStorage.setItem('hazardZeroToken', token);
        console.log('Token saved directly to localStorage');
        
        // Extract user data from response
        // Log the data structure for debugging
        console.log('Login response structure for user data extraction:', {
          hasUserObj: !!data.user,
          hasOrgObj: !!data.organization,
          topLevelProps: Object.keys(data)
        });
        
        // We received: {"token":"...", "organization":{"id":9,"name":"RandomOrganization","email":"...@gmail.com"}}
        // This shows the user identity is contained within the organization object in this API
        const userData = {
          // First try direct user properties, then organization (which contains user data in this API)
          userId: data.user_id || 
                 (data.user && data.user.id) || 
                 (data.sub) || 
                 (data.organization && data.organization.id) || 
                 0,
          email: data.email || 
                (data.user && data.user.email) || 
                (data.organization && data.organization.email) || 
                credentials.email,
          name: data.name || 
               (data.user && data.user.name) || 
               (data.organization && data.organization.name) || 
               'User'
        };
        console.log('Setting user data:', userData);
        setUser(userData);
        
        // Get org_id from response
        const organizationId = data.org_id || (data.organization && data.organization.id) || 1;
        console.log('Setting org ID:', organizationId);
        
        // Save org ID to both state and localStorage immediately
        setOrgId(organizationId);
        if (organizationId !== null && organizationId !== undefined) {
          localStorage.setItem('hazardZeroOrgId', organizationId.toString());
          console.log('Org ID saved directly to localStorage:', organizationId);
        }
        
        return true;
      } catch (loginError) {
        console.error('Modern login approach failed:', loginError);
        throw loginError;
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting registration with:', { name, email, password: '***' });
      
      try {
        // Use the same base URL as the API service
      const API_URL = process.env.REACT_APP_API_URL || 'http://api.hazard-zero.com:8080/api';
      console.log(`Making register request to: ${API_URL}/auth/register`);
      
      const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });
        
        console.log('Register response status:', response.status);
        
        // Read the response as text first to debug
        const responseText = await response.text();
        console.log('Register response text:', responseText);
        
        // If it's valid JSON, parse it
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed register response:', data);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          throw new Error('Invalid response from server');
        }
        
        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }
        
        console.log('Login response data structure:', Object.keys(data));
        
        // Check possible token locations in the response
        let token = data.token || data.access_token || 
                   (data.user && data.user.token) || 
                   (data.auth && data.auth.token);
                   
        // If we find a token with the name jwt, use that
        if (data.jwt) {
          console.log('Found JWT token in response');
          token = data.jwt;
        }
        
        // Deep search for a token in the response
        if (!token) {
          console.log('Searching deeply for token in response...');
          // Function to recursively search for token in object
          const findToken = (obj: any, maxDepth = 3, currentDepth = 0): string | null => {
            if (!obj || currentDepth > maxDepth) return null;
            
            // Check common token key names
            const tokenKeys = ['token', 'access_token', 'jwt', 'auth_token', 'id_token'];
            for (const key of tokenKeys) {
              if (obj[key] && typeof obj[key] === 'string') {
                console.log(`Found token at key: ${key}`);
                return obj[key];
              }
            }
            
            // Recursively check child objects
            for (const key of Object.keys(obj)) {
              if (obj[key] && typeof obj[key] === 'object') {
                const found = findToken(obj[key], maxDepth, currentDepth + 1);
                if (found) return found;
              }
            }
            
            return null;
          };
          
          token = findToken(data) || token;
        }
        
        if (!token) {
          console.error('No token found in response:', data);
          throw new Error('No authentication token received');
        }
        
        console.log('Found token in response, type:', typeof token);
        console.log('Token preview:', token.substring(0, 15) + '...');
        console.log('Token character count:', token.length);
        
        // Check if token looks like a JWT (contains two periods)
        const hasJwtFormat = (token.match(/\./g) || []).length === 2;
        console.log('Token has JWT format:', hasJwtFormat);
        
        // Save the token to both state and localStorage immediately
        setToken(token);
        localStorage.setItem('hazardZeroToken', token);
        console.log('Token saved directly to localStorage');
        
        // Extract user data from token or response
        const userData = {
          userId: data.user_id || (data.user && data.user.id) || 0,
          email: data.email || (data.user && data.user.email) || email,
          name: data.name || (data.user && data.user.name) || name
        };
        console.log('Setting user data:', userData);
        setUser(userData);
        
        // Get org_id from response
        const organizationId = data.org_id || (data.organization && data.organization.id) || 1;
        console.log('Setting org ID:', organizationId);
        
        // Save org ID to both state and localStorage immediately
        setOrgId(organizationId);
        if (organizationId !== null && organizationId !== undefined) {
          localStorage.setItem('hazardZeroOrgId', organizationId.toString());
          console.log('Org ID saved directly to localStorage:', organizationId);
        }
        
        return true;
      } catch (registerError) {
        console.error('Registration failed:', registerError);
        throw registerError;
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = (): void => {
    setToken(null);
    setUser(null);
    setOrgId(null);
    localStorage.removeItem('hazardZeroToken');
    localStorage.removeItem('hazardZeroOrgId');
  };
  
  // Helper function to parse JWT without external libraries
  const parseJwt = (token: string): JwtPayload => {
    try {
      // Strip 'Bearer ' prefix if present
      const actualToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      console.log('Parsing JWT, token length:', actualToken.length);
      
      const parts = actualToken.split('.');
      if (parts.length !== 3) {
        console.error('Token does not have three parts:', parts.length);
        throw new Error('Invalid token structure - not a valid JWT format');
      }
      
      const base64Url = parts[1];
      if (!base64Url) {
        throw new Error('Invalid token structure - missing payload');
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Add padding if needed
      const padding = '='.repeat((4 - base64.length % 4) % 4);
      const paddedBase64 = base64 + padding;
      
      let jsonPayload;
      try {
        // First try the standard approach
        jsonPayload = decodeURIComponent(
          atob(paddedBase64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      } catch (decodeError) {
        console.error('Error decoding token payload:', decodeError);
        // Fallback approach
        jsonPayload = atob(paddedBase64);
      }
      
      console.log('Decoded JWT payload:', jsonPayload.substring(0, 100) + '...');
      
      const parsed = JSON.parse(jsonPayload);
      console.log('Parsed JWT payload:', parsed);
      
      // Ensure the payload has all required fields with flexible field mappings
      // Different JWT implementations use different field names
      return {
        // Try common variations of user ID field names
        user_id: parsed.user_id || parsed.sub || parsed.id || parsed.userId || 0,
        
        // Try common variations of email field names  
        email: parsed.email || parsed.mail || parsed.emailAddress || '',
        
        // Try common variations of name field names
        name: parsed.name || parsed.username || parsed.displayName || '',
        
        // Try common variations of organization ID field names
        org_id: parsed.org_id || parsed.orgId || parsed.organization_id || parsed.organizationId || 0,
        
        // Standard JWT fields
        exp: parsed.exp || 0,
        iat: parsed.iat || 0
      };
    } catch (e) {
      console.error('Error parsing JWT', e);
      throw new Error('Invalid token format');
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      orgId, 
      loading, 
      error,
      login, 
      register,
      logout,
      clearError,
      isAuthenticated: !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy context usage
export const useAuth = (): AuthContextProps => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};