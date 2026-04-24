'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

declare global {
  interface Window {
    OneSignalDeferred: any[];
    OneSignal: any;
  }
}

export default function OneSignalInit() {
  const { vendor } = useAuth();

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId) {
      console.warn('OneSignal APP ID not found in environment variables. Push notifications will not be initialized.');
      return;
    }

    if (window.OneSignalDeferred && window.OneSignalDeferred.length > 0) return; // Ya cargado o en proceso

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal: any) {
      try {
        await OneSignal.init({
          appId: appId,
          safari_web_id: "web.onesignal.auto.064f268b-5776-470a-bfa1-b50577b8e100",
          notifyButton: { enable: false },
          allowLocalhostAsSecureOrigin: window.location.hostname === 'localhost',
        });
      } catch (err) {
        console.error('Error initializing OneSignal v16:', err);
      }
    });

    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Sincronizar identidad del usuario cuando cambie el vendor
  useEffect(() => {
    if (vendor && typeof window !== 'undefined') {
       window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          if (!OneSignal) return;
          console.log('[OneSignal] Iniciando sincronización para:', vendor.alias);
          
          try {
            // 1. Vincular ID externo
            if (typeof OneSignal.login === 'function') {
              await OneSignal.login(vendor.id);
              console.log('[OneSignal] Login exitoso:', vendor.id);
            }
          } catch (err) {
            console.error('[OneSignal] Error en login:', err);
          }

          try {
            // 2. Añadir etiquetas
            if (OneSignal.User && typeof OneSignal.User.addTags === 'function') {
              await OneSignal.User.addTags({
                vendor_id: vendor.id,
                alias: vendor.alias,
                plan: vendor.plan || 'Básico',
                role: vendor.role
              });
              console.log('[OneSignal] Tags sincronizados:', { alias: vendor.alias, plan: vendor.plan, role: vendor.role });
            }
          } catch (err) {
            console.warn('[OneSignal] Error sincronizando tags (no crítico):', err);
          }
        });
    }
  }, [vendor]);

  return null;
}
