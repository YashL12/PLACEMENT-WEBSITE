import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('placement_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      const storedToken = localStorage.getItem('placement_admin_token');
      if (storedToken) {
        try {
          const res = await api.getAdminProfile();
          if (res.success && res.data) {
            setAdmin(res.data);
          } else {
            logout();
          }
        } catch (error) {
          console.warn('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };

    verifyAdmin();
  }, []);

  const login = async (email, password) => {
    const res = await api.adminLogin(email, password);
    if (res.success && res.data?.token) {
      localStorage.setItem('placement_admin_token', res.data.token);
      setToken(res.data.token);
      setAdmin(res.data);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('placement_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
