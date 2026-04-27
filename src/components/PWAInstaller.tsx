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
            .catch(() => { });

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
                    style={{ 
                        position: 'fixed', bottom: '1.5rem', left: '1rem', right: '1rem', 
                        zIndex: 9999, maxWidth: '500px', margin: '0 auto' 
                    }}
                >
                    <div className="card" style={{
                        padding: '1rem', background: 'var(--surface-overlay)', 
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        borderColor: 'var(--color-primary)', boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.8)'
                    }}>
                        <div className="mobile-hide" style={{
                            background: 'var(--color-primary)', color: 'white', 
                            width: '48px', height: '48px', minWidth: '48px', borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            border: '2px solid #000'
                        }}>
                            <Smartphone size={24} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{platformName} APP</h4>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7, color: 'var(--text-muted)', lineHeight: 1.2 }}>
                                Instalar acceso rápido.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setIsVisible(false)} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '10px' }}><X size={18} /></button>
                            <button onClick={handleInstall} className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.75rem' }}>
                                <Download size={16} /> INSTALAR
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
