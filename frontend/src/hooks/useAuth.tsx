import { useState, useEffect, useContext, createContext } from 'react';
import { apiFetch } from '../utils/api';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  register: (userData: any) => Promise<{ success: boolean; token?: string; user?: any }>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Verify token on app load
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await apiFetch('/api/auth', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          const data = await response.json();
          setUser(data.merchant);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth verification failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      // Store token and user
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.merchant);

      return { success: true };
    } catch (error) {
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      // Store token and user
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.merchant);

      return { success: true, token: data.token, user: data.merchant };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default useAuth;
