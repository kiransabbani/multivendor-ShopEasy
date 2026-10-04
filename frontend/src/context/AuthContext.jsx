import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.me();
          const rawUser = res.data?.data || res.data?.user;
          if (rawUser) {
            const enrichedUser = {
              ...rawUser,
              vendor: res.data?.vendor || rawUser.vendor || null,
              vendorId: res.data?.vendor?._id || res.data?.vendorId || rawUser.vendorId || null,
            };
            setUser(enrichedUser);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Auth init failed", error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: rawUser, vendorId, vendor } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const enrichedUser = rawUser ? {
      ...rawUser,
      vendor: vendor || null,
      vendorId: vendorId || vendor?._id || null,
    } : null;
    setUser(enrichedUser);
    return enrichedUser;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token: newToken, user: rawUser, vendorId, vendor } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const enrichedUser = rawUser ? {
      ...rawUser,
      vendor: vendor || (data.role === 'vendor' ? {
        storeName: data.storeName,
        storeDescription: data.storeDescription,
        contactPhone: data.contactPhone
      } : null),
      vendorId: vendorId || vendor?._id || null,
    } : null;
    setUser(enrichedUser);
    return enrichedUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
