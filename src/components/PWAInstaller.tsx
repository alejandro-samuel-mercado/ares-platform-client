/**
 * Componente: PWAInstaller — Ares v2.2 (Dinamización Total)
 * 
 * Ahora consume el nombre de la plataforma desde los ajustes globales.
 */
'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function PWAInstaller() {
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [platformName, setPlatformName] = useState('ARES');

  useEffect(() => {
    // Cargar nombre de plataforma para personalización
    api.get('/ajustes-publicos', true)
      .then(res => setPlatformName(res.nombre_plataforma?.toUpperCase() || 'ARES'))
      .catch(() => {});

    const handler = (e: any) => {
      e.preventDefault();
      setPromptInstall(e);
      setTimeout(() => setIsVisible(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!promptInstall) return;
    promptInstall.prompt();
    const { outcome } = await promptInstall.userChoice;
    if (outcome === 'accepted') setIsVisible(false);
    setPromptInstall(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: 'calc(100% - 2rem)', maxWidth: '500px' }}
        >
          <div className="card" style={{ 
            padding: '1.25rem', background: 'var(--surface-overlay)', display: 'flex', alignItems: 'center', gap: '1.25rem',
            borderColor: 'var(--color-primary)', boxShadow: '15px 15px 0px 0px rgba(0,0,0,0.8)'
          }}>
            <div style={{ 
              background: 'var(--color-primary)', color: 'white', width: '60px', height: '60px', borderRadius: '16px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #000'
            }}>
              <Smartphone size={32} />
            </div>
            
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>{platformName} EN TU MÓVIL</h4>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.7, color: 'var(--text-muted)' }}>
                Instala la plataforma para acceso rápido y notificaciones push.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setIsVisible(false)} className="btn-secondary" style={{ padding: '0.6rem', borderRadius: '12px' }}><X size={20} /></button>
              <button onClick={handleInstall} className="btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                <Download size={18} /> INSTALAR
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
