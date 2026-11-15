'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage and cookies on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('alka_token');
      const savedUser = localStorage.getItem('alka_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Keep cookie synced for server actions / middleware
        document.cookie = `alka_token=${savedToken}; path=/; max-age=604800; SameSite=Lax`;
      }
    } catch (e) {
      console.error('Failed to load stored auth session:', e);
      localStorage.removeItem('alka_token');
      localStorage.removeItem('alka_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Google authentication failed.');
      }

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem('alka_token', data.token);
      localStorage.setItem('alka_user', JSON.stringify(data.user));
      document.cookie = `alka_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('alka_token');
    localStorage.removeItem('alka_user');
    document.cookie = 'alka_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/';
  }, []);

  const updateUserProfile = useCallback(async ({ mobile, location }) => {
    if (!token) return { success: false, message: 'Not logged in' };

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mobile, location }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setUser((prev) => {
        const updated = { ...prev, ...data.user };
        localStorage.setItem('alka_user', JSON.stringify(updated));
        return updated;
      });

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [token]);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (adminEmail && user.email && user.email.toLowerCase() === adminEmail.toLowerCase()) {
      return true;
    }
    return false;
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAdmin,
      loginWithGoogle,
      logout,
      updateUserProfile,
      setUser,
    }),
    [user, token, isLoading, isAdmin, loginWithGoogle, logout, updateUserProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
