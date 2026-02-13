import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, fetchProfile } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('tb_token'));
  const [loading, setLoading] = useState(true);

  // On mount — validate stored token
  useEffect(() => {
    if (token) {
      fetchProfile(token)
        .then(({ data }) => setUser(data.user))
        .catch(() => { localStorage.removeItem('tb_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await loginUser({ email, password });
    localStorage.setItem('tb_token', data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await registerUser({ name, email, password });
    localStorage.setItem('tb_token', data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success('Account created successfully!');
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tb_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
