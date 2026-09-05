import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    business_name?: string;
    category?: string;
  }) => Promise<void>;
  quickDemoLogin: (merchantId: string, merchantName: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'mitraos_auth_token';
const USER_KEY = 'mitraos_user_profile';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Restore session from localStorage if available
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved session:', err);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoadingAuth(false);
  }, []);

  const login = async (email: string, password: string) => {
    const resp: AuthResponse = await api.login(email, password);
    const profile: UserProfile = {
      user_id: resp.user_id,
      merchant_id: resp.merchant_id,
      email: resp.email,
      role: resp.role,
      merchant_name: resp.merchant_name
    };
    setToken(resp.access_token);
    setUser(profile);
    localStorage.setItem(TOKEN_KEY, resp.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    localStorage.setItem('mitraos_active_merchant_id', resp.merchant_id);
  };

  const register = async (payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    business_name?: string;
    category?: string;
  }) => {
    const resp: AuthResponse = await api.register(payload);
    const profile: UserProfile = {
      user_id: resp.user_id,
      merchant_id: resp.merchant_id,
      email: resp.email,
      role: resp.role,
      merchant_name: resp.merchant_name,
      full_name: payload.full_name
    };
    setToken(resp.access_token);
    setUser(profile);
    localStorage.setItem(TOKEN_KEY, resp.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    localStorage.setItem('mitraos_active_merchant_id', resp.merchant_id);
  };

  const quickDemoLogin = (merchantId: string, merchantName: string, email: string) => {
    const mockToken = `demo_token_${merchantId}_${Date.now()}`;
    const profile: UserProfile = {
      user_id: `user_demo_${merchantId.slice(0, 8)}`,
      merchant_id: merchantId,
      email: email,
      role: 'owner',
      merchant_name: merchantName
    };
    setToken(mockToken);
    setUser(profile);
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    localStorage.setItem('mitraos_active_merchant_id', merchantId);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoadingAuth,
        login,
        register,
        quickDemoLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
