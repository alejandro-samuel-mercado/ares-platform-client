/**
 * Página: Renovar Suscripción — Ares Redesign v2.2 (High-Impact Flow)
 * 
 * Se muestra cuando la cuenta está vencida. Diseño Bento-Box Ultra Premium.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, Upload, ShieldX, CheckCircle2, QrCode, CreditCard, ChevronRight, Zap } from 'lucide-react';
import api from '@/lib/api';

export default function RenovarPage() {
    const [ajustes, setAjustes] = useState<any>(null);
    const [reason, setReason] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/ajustes-publicos', true).then(setAjustes).catch(console.error);
        const blockReason = localStorage.getItem('ares_block_reason');
        if (blockReason) setReason(JSON.parse(blockReason));
    }, []);

    const handleSimulationSend = () => {
        setUploading(true);
        setTimeout(() => {
            setUploading(false);
            setSent(true);
        }, 2000);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--surface-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            
            {/* Background Decor */}
            <div style={{ position: 'fixed', top: '20%', left: '-10%', width: '400px', height: '400px', background: 'var(--color-primary)', filter: 'blur(150px)', opacity: 0.1, zIndex: 0 }} />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ maxWidth: '480px', width: '100%', position: 'relative', zIndex: 10 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ 
                        display: 'inline-flex', background: 'var(--color-danger)', padding: '1.25rem', 
                        borderRadius: '24px', border: '3px solid #000', boxShadow: '8px 8px 0px 0px #000',
                        marginBottom: '1.5rem', color: 'white'
                    }}>
                        <ShieldX size={44} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
                        ACCESO <span className="text-gradient-primary">RESTRINGIDO</span>
                    </h1>
                    <p style={{ fontWeight: 800, opacity: 0.6, fontSize: '0.9rem' }}>SUSCRIPCIÓN PENDIENTE DE RENOVACIÓN</p>
                </div>

                {/* Bento Block */}
                <div className="card" style={{ padding: '2.5rem', background: 'var(--surface-raised)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', padding: '1.5rem', borderRadius: '20px', border: '2px solid var(--color-danger)' }}>
                        <Clock size={32} color="var(--color-danger)" />
                        <div>
                            <p style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--color-danger)' }}>PLAN EXPIRADO</p>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7 }}>Tu tiempo de acceso ha caducado. Regulariza tu situación para continuar.</p>
                        </div>
                    </div>

                    {reason?.reason !== 'suspended' && (
                        <>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.2em', marginBottom: '1.5rem', opacity: 0.4 }}>MÉTODO DE PAGO OFICIAL</p>
                                {ajustes?.qr_cobro_url ? (
                                    <div style={{ 
                                        padding: '1.5rem', background: 'white', borderRadius: '30px', 
                                        border: '4.5px solid #000', display: 'inline-block',
                                        boxShadow: '10px 10px 0px 0px #000'
                                    }}>
                                        <img src={ajustes.qr_cobro_url} style={{ width: '220px', height: '220px', objectFit: 'contain' }} />
                                    </div>
                                ) : (
                                    <div style={{ padding: '3rem', background: 'var(--surface-base)', borderRadius: '24px', border: '2px dashed #000', fontWeight: 900, opacity: 0.3 }}>
                                        <QrCode size={48} style={{ margin: '0 auto 1rem' }} />
                                        QR NO DISPONIBLE
                                    </div>
                                )}
                            </div>

                            {ajustes?.tigo_money_numero && (
                                <div style={{ 
                                    background: 'var(--surface-base)', padding: '1.25rem', borderRadius: '20px', 
                                    border: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <CreditCard size={20} color="var(--color-primary)" />
                                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Tigo Money</span>
                                    </div>
                                    <span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)' }}>{ajustes.tigo_money_numero}</span>
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                {sent ? (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        style={{ 
                                            background: 'var(--color-primary)', color: 'white', padding: '1.5rem', 
                                            borderRadius: '24px', border: '2.5px solid #000', textAlign: 'center', fontWeight: 900,
                                            boxShadow: '6px 6px 0px 0px #000'
                                        }}>
                                        🚀 COMPROBANTE EN REVISIÓN. TE NOTIFICAREMOS PRONTO.
                                    </motion.div>
                                ) : (
                                    <button 
                                        disabled={uploading}
                                        onClick={handleSimulationSend}
                                        className="btn-primary" 
                                        style={{ width: '100%', height: '70px', fontSize: '1.1rem' }}
                                    >
                                        {uploading ? <Zap className="animate-pulse" /> : <><Upload /> ENVIAR COMPROBANTE</>}
                                    </button>
                                )}
                            </AnimatePresence>
                        </>
                    )}

                    {reason?.reason === 'suspended' && (
                        <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--surface-base)', borderRadius: '24px', border: '2px solid var(--color-danger)' }}>
                             <AlertCircle size={40} color="var(--color-danger)" style={{ margin: '0 auto 1rem' }} />
                             <p style={{ fontWeight: 900 }}>TU CUENTA ESTÁ BLOQUEADA POR EL ADMIN.</p>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                    <a href="/login" style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        ← SALIR Y VOLVER AL LOGIN
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
