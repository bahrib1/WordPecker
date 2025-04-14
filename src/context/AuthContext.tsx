import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../api/apiService';
import { User, AuthState } from '../types';

// Define the shape of the context
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  forgotPassword: async () => ({ success: false, message: '' }),
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check if user is already logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await apiService.getCurrentUser();
        
        setState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to load user',
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });
      
      const { user } = await apiService.login(email, password);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: 'Invalid email or password',
      });
      throw error;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });
      
      const { user } = await apiService.register(name, email, password);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: 'Registration failed',
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setState({ ...state, isLoading: true, error: null });
      
      await apiService.logout();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: 'Logout failed',
      });
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });
      
      const result = await apiService.forgotPassword(email);
      
      setState({
        ...state,
        isLoading: false,
        error: null,
      });
      
      return result;
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: 'Password reset failed',
      });
      throw error;
    }
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
