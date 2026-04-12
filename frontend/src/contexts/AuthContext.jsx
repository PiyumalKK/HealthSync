import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('healthsync_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem('healthsync_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authAPI.verify();
        if (data.valid && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          clearAuth();
        }
      } catch {
        // Try refresh
        try {
          const { data } = await authAPI.refresh();
          if (data.token && data.user) {
            localStorage.setItem('healthsync_token', data.token);
            setToken(data.token);
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            clearAuth();
          }
        } catch {
          clearAuth();
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Listen for forced logout from API interceptor
  useEffect(() => {
    const handleLogout = () => {
      clearAuth();
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('healthsync_token');
    localStorage.removeItem('healthsync_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('healthsync_token', data.token);
    localStorage.setItem('healthsync_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await authAPI.register(userData);
    localStorage.setItem('healthsync_token', data.token);
    localStorage.setItem('healthsync_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const googleLogin = useCallback(async (credential) => {
    const { data } = await authAPI.googleLogin(credential);
    localStorage.setItem('healthsync_token', data.token);
    localStorage.setItem('healthsync_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Logout even if API call fails
    }
    clearAuth();
  }, [clearAuth]);

  const updateUser = useCallback(async (updates) => {
    const { data } = await authAPI.updateProfile(updates);
    setUser(data.user);
    localStorage.setItem('healthsync_user', JSON.stringify(data.user));
    return data;
  }, []);

  const setUserData = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('healthsync_user', JSON.stringify(userData));
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    setUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
