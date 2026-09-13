import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

/**
 * Helper untuk decode payload JWT secara aman tanpa dependency luar
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse JWT:', err);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [role, setRole] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser).role || null;
      } catch {
        return null;
      }
    }
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const decoded = parseJwt(savedToken);
      return decoded?.role || null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Inisialisasi autentikasi saat aplikasi dimuat
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      const decoded = parseJwt(savedToken);
      if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
        // Token kadaluarsa
        logout();
        setIsLoading(false);
        return;
      }

      const userRole = decoded.role;
      setRole(userRole);

      try {
        const profile = await authService.getMe();
        const fullUser = { ...profile, role: userRole };
        setUser(fullUser);
        localStorage.setItem('user', JSON.stringify(fullUser));
      } catch (error) {
        console.error('Error fetching /api/auth/me:', error);
        // Fallback jika getMe gagal tapi token valid
        const fallbackUser = { id: decoded.id, role: userRole };
        setUser(fallbackUser);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      const authToken = response.token;
      localStorage.setItem('token', authToken);
      setToken(authToken);

      const decoded = parseJwt(authToken);
      const userRole = decoded?.role;
      setRole(userRole);

      let currentUser = { id: decoded?.id, email, role: userRole };

      try {
        const profile = await authService.getMe();
        currentUser = { ...profile, role: userRole };
      } catch (meError) {
        console.warn('Could not fetch /api/auth/me immediately:', meError);
      }

      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
      return { success: true, role: userRole };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (!token) return null;
    try {
      const profile = await authService.getMe();
      const updatedUser = { ...profile, role: role || profile.role };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      return null;
    }
  };

  const updateProfileAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await authService.updateAvatar(formData);
    if (res.avatar) {
      const updatedUser = { ...user, avatar: res.avatar };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return res;
  };

  const value = {
    user,
    role,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    refreshProfile,
    updateProfileAvatar,
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
