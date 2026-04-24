'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

declare global {
  interface Window {
    OneSignalDeferred: any[];
    OneSignal: any;
  }
}

/**
 * OneSignalInit — Ares v2.6 (Unified Sync Flow)
 * 
 * Centraliza la inicialización y sincronización de identidad para evitar 
 * errores de tipo "ye is undefined" (condiciones de carrera en el SDK v16).
 */
export default function OneSignalInit() {
  const { vendor } = useAuth();

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId) {
      console.warn('[OneSignal] APP ID missing');
      return;
    }

    // Cargar SDK v16
    if (!document.getElementById('onesignal-sdk')) {
      const script = document.createElement('script');
      script.id = 'onesignal-sdk';
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Inicialización y Sincronización en un solo flujo secuencial
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        // 1. Inicializar (Esperar a que termine)
        if (!OneSignal.initialized) {
          await OneSignal.init({
            appId: appId,
            safari_web_id: "web.onesignal.auto.064f268b-5776-470a-bfa1-b50577b8e100",
            notifyButton: { enable: false },
            allowLocalhostAsSecureOrigin: window.location.hostname === 'localhost',
          });
        }

        // 2. Si hay vendor, sincronizar identidad inmediatamente después del init
        if (vendor) {
          console.log('[OneSignal] Sincronizando vendor:', vendor.alias);
          
          if (typeof OneSignal.login === 'function') {
            await OneSignal.login(vendor.id);
          }

          if (OneSignal.User && typeof OneSignal.User.addTags === 'function') {
            await OneSignal.User.addTags({
              vendor_id: vendor.id,
              alias: vendor.alias,
              plan: vendor.plan || 'Básico',
              role: vendor.role
            });
          }
        }
      } catch (err) {
        console.error('[OneSignal] Error en flujo unificado:', err);
      }
    });

  }, [vendor]); // Se vuelve a ejecutar si el vendor cambia, pero el SDK maneja la cola secuencialmente

  return null;
}
