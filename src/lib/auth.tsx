/**
 * Auth Context — Plataforma Ares
 *
 * Provee estado de autenticación global con:
 * - Login/Logout/Register
 * - Persistencia en localStorage
 * - Datos del vendor autenticado
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';

interface Vendor {
  id: string;
  nombre: string;
  alias: string;
  telefono: string;
  whatsapp?: string;
  logo_url?: string;
  plan: string;
  texto_limite?: string;
  plan_id: string;
  role: string;
  es_colaborador?: boolean;
  status: string;
  fecha_vencimiento: string;
}

interface AuthContextType {
  vendor: Vendor | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isColaborador: boolean;
  login: (alias: string, password: string) => Promise<Vendor>;
  register: (data: { nombre: string; alias: string; telefono: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshVendor: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión desde localStorage al iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem('ares_token');
    const savedVendor = localStorage.getItem('ares_vendor');

    if (savedToken && savedVendor) {
      setToken(savedToken);
      setVendor(JSON.parse(savedVendor));
    }
    setIsLoading(false);
  }, []);



  const login = useCallback(async (alias: string, password: string) => {
    const data = await api.post('/auth/login', { alias, password }, true);
    setToken(data.token);
    setVendor(data.vendor);
    localStorage.setItem('ares_token', data.token);
    localStorage.setItem('ares_vendor', JSON.stringify(data.vendor));
    return data.vendor;
  }, []);

  const register = useCallback(async (regData: { nombre: string; alias: string; telefono: string; password: string }) => {
    const data = await api.post('/auth/register', regData, true);
    setToken(data.token);
    setVendor(data.vendor);
    localStorage.setItem('ares_token', data.token);
    localStorage.setItem('ares_vendor', JSON.stringify(data.vendor));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setVendor(null);
    localStorage.removeItem('ares_token');
    localStorage.removeItem('ares_vendor');
    localStorage.removeItem('ares_block_reason');
    if (typeof window !== 'undefined' && (window as any).OneSignal) {
      const OneSignal = (window as any).OneSignal;
      if (OneSignal.logout) {
         OneSignal.logout();
      }
    }
  }, []);

  const refreshVendor = useCallback(async () => {
    try {
      const data = await api.get('/perfil');
      setVendor(data);
      localStorage.setItem('ares_vendor', JSON.stringify(data));
    } catch {
      // Si falla, ignorar silenciosamente
    }
  }, []);

  const isAdmin = vendor?.role === 'SUPERADMIN' || vendor?.es_colaborador === true;
  const isColaborador = vendor?.role !== 'SUPERADMIN' && vendor?.es_colaborador === true;

  return (
    <AuthContext.Provider value={{ vendor, token, isLoading, isAdmin, isColaborador, login, register, logout, refreshVendor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
