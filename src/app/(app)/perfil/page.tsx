/**
 * Página: Mi Perfil — App Vendedor Ares v2 (Cartoon-Futurista)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Save, LogOut, User, Bell, BellOff, Loader2, ChevronRight, Star, ShieldCheck, Smartphone, CheckCircle2, QrCode, Globe, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function PerfilPage() {
    const { vendor, logout, refreshVendor } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        whatsapp: vendor?.whatsapp || '',
        alias: vendor?.alias || '',
        nombre: vendor?.nombre || '',
        whatsapp_api_enabled: (vendor as any)?.whatsapp_api_enabled || false,
        whatsapp_api_token: (vendor as any)?.whatsapp_api_token || ''
    });

    useEffect(() => {
        if (vendor) {
            setForm({
                whatsapp: vendor.whatsapp || '',
                alias: vendor.alias || '',
                nombre: vendor.nombre || '',
                whatsapp_api_enabled: (vendor as any).whatsapp_api_enabled || false,
                whatsapp_api_token: (vendor as any).whatsapp_api_token || ''
            });
        }
    }, [vendor]);
    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            window.OneSignalDeferred.push((OneSignal: any) => {
                setNotificationsEnabled(OneSignal.Notifications.permission);
            });
        }
    }, []);

    const [toastMessage, setToastMessage] = useState('');

    const triggerToast = (msg: string = 'Copiado ✅') => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleToggleNotifications = async () => {
        if (typeof window === 'undefined') return;

        const isOneSignalReady = !!(window as any).OneSignal;
        const deferred = (window as any).OneSignalDeferred;

        if (!deferred && !isOneSignalReady) {
            alert('Aviso: OneSignal no está inicializado. Asegúrate de configurar NEXT_PUBLIC_ONESIGNAL_APP_ID en tu archivo .env');
            // Toggle local para que el usuario al menos vea que el botón "reacciona"
            setNotificationsEnabled(!notificationsEnabled);
            return;
        }

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal: any) => {
            try {
                if (!notificationsEnabled) {
                    await OneSignal.Notifications.requestPermission();
                    if (OneSignal.Notifications.permission) {
                        await OneSignal.User.PushSubscription.optIn();
                    }
                } else {
                    await OneSignal.User.PushSubscription.optOut();
                }
                setNotificationsEnabled(OneSignal.Notifications.permission);
            } catch (err) {
                console.error('OneSignal Error:', err);
                alert('No se pudo cambiar el estado de las notificaciones. Verifica tu conexión.');
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/perfil', form);
            triggerToast('Perfil actualizado correctamente ✅');
            if (refreshVendor) await refreshVendor();
        } catch (err) {
            console.error(err);
            alert('Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            maxWidth: '90%', margin: '0 auto', paddingBottom: '6rem',

        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                        MI <span className="text-gradient-primary">PERFIL</span>
                    </h1>
                    <button 
                        onClick={refreshVendor} 
                        className="btn-secondary" 
                        style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Refrescar Perfil"
                    >
                        <RefreshCw size={24} />
                    </button>
                </div>
            </div>
            {/* Toast Ares v2 */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        style={{
                            position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
                            zIndex: 1000, background: 'var(--color-primary)', color: 'white',
                            padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 900,
                            border: '2px solid #000', boxShadow: '5px 5px 0px 0px rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', gap: '1rem'
                        }}
                    >
                        <CheckCircle2 color="white" />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    ID <span className="text-gradient-primary">VENDEDOR</span>
                </h1>
                <div style={{ background: '#000', padding: '0.5rem', borderRadius: '12px', border: '2px solid var(--color-primary)' }}>
                    <QrCode size={20} color="var(--color-primary)" />
                </div>
            </div>

            {/* Hero Profile Card - REDESIGNED */}
            <div className="card" style={{
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                marginBottom: '2.5rem',
                background: 'linear-gradient(80deg, var(--ambient-2) 10%, var(--ambient-1) 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Badge */}
                {vendor?.plan === 'Pro' && (
                    <div style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'var(--color-accent)', padding: '0.4rem 0.8rem',
                        borderRadius: '12px', border: '2px solid #000', fontWeight: 900, fontSize: '0.7rem',
                        transform: 'rotate(5deg)', boxShadow: '4px 4px 0px 0px #000'
                    }}>
                        <Star size={12} fill="currentColor" /> NIVEL PRO
                    </div>
                )}

                <div style={{
                    width: '120px', height: '120px', borderRadius: '40px',
                    background: 'white', border: '3px solid #000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '10px 10px 0px 0px var(--color-primary)',
                    position: 'relative'
                }}>
                    {vendor?.logo_url ? (
                        <img src={vendor.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '36px' }} alt="Avatar" />
                    ) : (
                        <div style={{ background: 'var(--color-primary)', width: '100%', height: '100%', borderRadius: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={60} color="#000" />
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{vendor?.nombre}</h2>
                    <div className="chip chip-primary" style={{ marginTop: '0.8rem', display: 'inline-flex' }}>@{vendor?.alias}</div>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', marginTop: '1.5rem',
                    borderTop: '2.5px dashed rgba(0,0,0,0.1)', paddingTop: '1.5rem'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5, marginBottom: '0.25rem' }}>ESTADO CUENTA</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 800, color: '#22C55E' }}>
                            <ShieldCheck size={16} /> ACTIVO
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5, marginBottom: '0.25rem' }}>PLAN ACTUAL</p>
                        <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{vendor?.plan || 'Básico'}</div>
                    </div>
                </div>

                {vendor?.texto_limite && (
                    <div style={{ width: '100%', marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '2px dashed var(--color-danger)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-danger)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        ⚠ LÍMITE: {vendor.texto_limite}
                    </div>
                )}
            </div>

            {/* Public Link Section (Only for PRO users) */}
            {['pro', 'proveedor'].includes(vendor?.plan?.toLowerCase() || '') && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card"
                    style={{
                        marginBottom: '2.5rem', padding: '2rem', background: '#000', color: 'white', border: '3px solid var(--color-primary)',
                        boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <Globe size={20} color="var(--color-primary)" />
                        <h3 style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '0.05em' }}>MI ENLACE PÚBLICO ARES</h3>
                    </div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7, marginBottom: '1.5rem', lineHeight: 1.4 }}>
                        Comparte este link con tus clientes para que vean tu catálogo actualizado sin necesidad de cuenta.
                    </p>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)', padding: '1rem 1.25rem', borderRadius: '16px', border: '1.5px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
                    }}>
                        <code style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {typeof window !== 'undefined' ? `${window.location.origin}/u/${vendor?.alias || ''}` : `.../u/${vendor?.alias || ''}`}
                        </code>
                        <button
                            onClick={() => {
                                const url = `${window.location.origin}/u/${vendor?.alias || ''}`;
                                navigator.clipboard.writeText(url);
                                triggerToast();
                            }}
                            style={{ background: 'var(--color-primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 900, fontSize: '0.7rem', border: 'none', cursor: 'pointer' }}
                        >
                            COPIAR
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Settings Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Basic Info */}
                <div className="card-static" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: '#000', color: 'white', padding: '0.6rem', borderRadius: '12px' }}><Smartphone size={20} /></div>
                        <h3 style={{ fontWeight: 900, fontSize: '1.2rem' }}>CONFIGURACIÓN COMERCIAL</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        <div>
                            <label className="input-label">Nombre de Marca</label>
                            <input className="input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">ID de Canal (Alias)</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '1.2rem', fontWeight: 900, opacity: 0.3 }}>@</span>
                                <input
                                    className="input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={form.alias}
                                    onChange={e => setForm({ ...form, alias: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">WhatsApp de Atención</label>
                            <input className="input" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="591XXXXXXXX" />
                        </div>
                    </div>

                    <button
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '2.5rem', padding: '1.25rem', fontSize: '1rem' }}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <Loader2 size={24} className="animate-spin" /> : <><Save size={20} /> ACTUALIZAR MI PERFIL</>}
                    </button>
                </div>

                {/* Preferences & Notification Channels */}
                <div className="card-static" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: '#000', color: 'white', padding: '0.6rem', borderRadius: '12px' }}><Bell size={20} /></div>
                        <h3 style={{ fontWeight: 900, fontSize: '1.2rem' }}>CANALES DE NOTIFICACIÓN</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* OneSignal Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-raised)', borderRadius: '16px', border: '2px solid #000' }}>
                            <div>
                                <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>NOTIFICACIONES PUSH</p>
                                <p style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700 }}>Alertas de stock y partidos</p>
                            </div>
                            <button
                                onClick={handleToggleNotifications}
                                style={{
                                    width: '50px', height: '28px', borderRadius: '14px', border: '2px solid #000',
                                    background: notificationsEnabled ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)',
                                    position: 'relative', cursor: 'pointer', transition: '0.2s'
                                }}
                            >
                                <motion.div
                                    animate={{ x: notificationsEnabled ? 24 : 2 }}
                                    style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', border: '2px solid #000', position: 'absolute', top: '2px' }}
                                />
                            </button>
                        </div>

                        {/* WhatsApp API Placeholder */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'var(--surface-raised)', borderRadius: '16px', border: '2px solid #000', opacity: ['pro', 'proveedor'].includes(vendor?.plan?.toLowerCase() || '') ? 1 : 0.5 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>WHATSAPP BUSINESS API</p>
                                        <span style={{ background: 'var(--color-primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900 }}>BETA</span>
                                    </div>
                                    <p style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700 }}>Envío automático de cuentas post-pago</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (['pro', 'proveedor'].includes(vendor?.plan?.toLowerCase() || '')) {
                                            setForm({ ...form, whatsapp_api_enabled: !form.whatsapp_api_enabled });
                                        }
                                    }}
                                    style={{
                                        width: '50px', height: '28px', borderRadius: '14px', border: '2px solid #000',
                                        background: form.whatsapp_api_enabled ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)',
                                        position: 'relative', cursor: ['pro', 'proveedor'].includes(vendor?.plan?.toLowerCase() || '') ? 'pointer' : 'default', transition: '0.2s'
                                    }}
                                >
                                    <motion.div
                                        animate={{ x: form.whatsapp_api_enabled ? 24 : 2 }}
                                        style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', border: '2px solid #000', position: 'absolute', top: '2px' }}
                                    />
                                </button>
                            </div>
                            {['pro', 'proveedor'].includes(vendor?.plan?.toLowerCase() || '') ? (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5, marginBottom: '0.4rem', display: 'block' }}>API KEY / TOKEN DE ACCESO</label>
                                    <input 
                                        className="input" 
                                        type="password" 
                                        placeholder="Tu Token de WhatsApp Business" 
                                        value={form.whatsapp_api_token || ''}
                                        onChange={e => setForm({ ...form, whatsapp_api_token: e.target.value })}
                                        style={{ fontSize: '0.8rem', height: '45px' }} 
                                    />
                                    <p style={{ fontSize: '0.6rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--color-primary)' }}>* Configura tu API para automatizar tus ventas.</p>
                                </div>
                            ) : (
                                <div style={{ border: '2px dashed var(--color-danger)', padding: '0.5rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-danger)' }}>REQUIERE PLAN PRO</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Logout Section */}
                <button
                    onClick={() => { logout(); router.push('/login'); }}
                    style={{
                        background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left', cursor: 'pointer'
                    }}
                >
                    <div className="card" style={{
                        padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)',
                        borderColor: 'var(--color-danger)', borderStyle: 'dashed',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'var(--color-danger)', color: 'white', padding: '0.6rem', borderRadius: '12px' }}>
                                <LogOut size={18} />
                            </div>
                            <span style={{ fontWeight: 900, color: 'var(--color-danger)', fontSize: '1rem' }}>CERRAR SESIÓN</span>
                        </div>
                        <ChevronRight size={20} color="var(--color-danger)" />
                    </div>
                </button>

            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.2, letterSpacing: '0.3em' }}>ARES v2.1.2 — OLYMPUS ENGINE</p>
            </div>
        </div>
    );
}
