import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  hcmutId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'tutor' | 'admin';
  university?: string;
  major?: string;
  avatar?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { hcmutId: string; password: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount (only if there's a token in localStorage)
  useEffect(() => {
    const checkAuth = async () => {
      // Check if there's a token in localStorage first
      const hasToken = localStorage.getItem('auth-token') || document.cookie.includes('auth-token');
      
      if (!hasToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.verifyToken();
        if (response.success) {
          setUser(response.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: { hcmutId: string; password: string }): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.hcmutSSOLogin(credentials);
      
      if (response.success) {
        setUser(response.user);
        // Store token in localStorage for persistence
        localStorage.setItem('auth-token', response.token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // Clear localStorage
    localStorage.removeItem('auth-token');
    // Clear cookies by making a logout request
    fetch('http://localhost:3000/api/auth/logout', { method: 'POST' });
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
