import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const { token } = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', token);
      setUser({ token, username });  // Store both token and username
      navigate('/');
    } catch (error) {
      throw error.message || 'Login failed';
    }
  };

  const register = async (username, password) => {
    try {
      await api.post('/auth/register', { username, password });
      navigate('/login');
    } catch (error) {
      throw error.message || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};