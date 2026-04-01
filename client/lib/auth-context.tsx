'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, authAPI } from '@/lib/api';

export type UserRole = 'CLIENT' | 'DEV';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  hourlyRate?: number;
  company?: string;
  skills?: string[];
  verified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeUser(raw: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    createdAt: raw.createdAt,
    verified: true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        if (mounted) setIsLoading(false);
        return;
      }

      apiClient.setToken(storedToken);
      const meResponse = await authAPI.me();

      if (!mounted) return;

      if (meResponse.success && meResponse.data?.user) {
        const normalized = normalizeUser(meResponse.data.user);
        setToken(storedToken);
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify(normalized));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        apiClient.setToken(null);
      }

      setIsLoading(false);
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const loginResponse = await authAPI.login(email, password);
      if (!loginResponse.success || !loginResponse.data?.token) {
        throw new Error(loginResponse.error?.message || 'Login failed');
      }

      const nextToken = loginResponse.data.token;
      apiClient.setToken(nextToken);

      const meResponse = await authAPI.me();

      let nextUser: User | null = null;
      if (meResponse.success && meResponse.data?.user) {
        nextUser = normalizeUser(meResponse.data.user);
      } else {
        const payload = decodeJwtPayload(nextToken);
        const role = payload?.role;
        const userId = payload?.userId;

        if (
          typeof userId === 'string' &&
          (role === 'CLIENT' || role === 'DEV') &&
          loginResponse.data.name &&
          loginResponse.data.email
        ) {
          nextUser = {
            id: userId,
            name: loginResponse.data.name,
            email: loginResponse.data.email,
            role,
            createdAt: new Date().toISOString(),
            verified: true,
          };
        }
      }

      if (!nextUser) {
        throw new Error('Unable to load user profile from backend');
      }

      setToken(nextToken);
      setUser(nextUser);
      localStorage.setItem('token', nextToken);
      localStorage.setItem('user', JSON.stringify(nextUser));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      apiClient.setToken(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    setError(null);

    try {
      if (role !== 'DEV') {
        throw new Error('Backend hiện chỉ hỗ trợ đăng ký tài khoản DEV. Cần mở rộng API để đăng ký CLIENT.');
      }

      const registerResponse = await authAPI.register(name, email, password);
      if (!registerResponse.success) {
        throw new Error(registerResponse.error?.message || 'Registration failed');
      }

      await login(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    apiClient.setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
