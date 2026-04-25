/**
 * Página: Ajustes Globales — Ares v2.7 (Diagnostic Protocol)
 */
'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings, Save, Smartphone, Globe, ShieldCheck,
    CheckCircle2, Megaphone, HelpCircle, Zap, Layout, Upload, ImageIcon, Link, XCircle, Terminal, RefreshCw, Bell, BellOff
} from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AjustesPage() {
    const [ajustes, setAjustes] = useState({
        qr_cobro_bob: '',
        qr_cobro_usd: '',
        tasa_cambio_bob: 6.96,
        tigo_money_numero: '',
        texto_legal: '',
        nombre_plataforma: 'Ares',
        logo_url: '',
        noticia_global: '',
        whatsapp_soporte: '',
        qr_cobro_url: '' // Legacy
    });

    const [qrArchivoBob, setQrArchivoBob] = useState<File | null>(null);
    const [qrArchivoUsd, setQrArchivoUsd] = useState<File | null>(null);
    const [logoArchivo, setLogoArchivo] = useState<File | null>(null);

    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [errorToast, setErrorToast] = useState<string | null>(null);

    // Push Notifications State
    const [pushEnabled, setPushEnabled] = useState<string | null>(null); // 'granted', 'denied', 'default'
    const [oneSignalReady, setOneSignalReady] = useState(false);

    const fetchAjustes = async () => {
        try {
            // Usar cache-buster para evitar ver datos viejos
            const data = await api.get(`/admin/ajustes?_t=${Date.now()}`);
            console.log("[DIAGNOSTIC] Current Ajustes from DB:", data);
            if (data) setAjustes(data);
        } catch (err) {
            console.error("[DIAGNOSTIC] Error fetching ajustes:", err);
        }
    };

    const checkPushStatus = () => {
        if (typeof window !== 'undefined' && (window as any).OneSignal) {
            const permission = (window as any).OneSignal.Notifications.permission;
            setPushEnabled(permission ? 'granted' : 'default'); // Permission returns boolean sometimes or string
            setOneSignalReady(true);
        }
    };

    useEffect(() => { 
        fetchAjustes(); 
        
        // OneSignal Status Check
        if (typeof window !== 'undefined') {
            (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
            (window as any).OneSignalDeferred.push(async (OneSignal: any) => {
                const permission = OneSignal.Notifications.permission;
                setPushEnabled(permission ? 'granted' : 'default');
                setOneSignalReady(true);
            });
        }
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setErrorToast(null);
        try {
            const data = new FormData();
            data.append('nombre_plataforma', ajustes.nombre_plataforma);
            data.append('tigo_money_numero', ajustes.tigo_money_numero);
            data.append('texto_legal', ajustes.texto_legal);
            data.append('noticia_global', ajustes.noticia_global);
            data.append('whatsapp_soporte', ajustes.whatsapp_soporte);
            data.append('tasa_cambio_bob', ajustes.tasa_cambio_bob.toString());
            
            if (!qrArchivoBob) data.append('qr_cobro_bob', ajustes.qr_cobro_bob || '');
            if (!qrArchivoUsd) data.append('qr_cobro_usd', ajustes.qr_cobro_usd || '');
            
            if (!logoArchivo) {
                data.append('logo_url', ajustes.logo_url || '');
            }

            console.log("[DIAGNOSTIC] Preparing Payload...");
            if (qrArchivoBob) {
                data.append('qr_bob', qrArchivoBob);
            }
            if (qrArchivoUsd) {
                data.append('qr_usd', qrArchivoUsd);
            }
            if (logoArchivo) {
                console.log("[DIAGNOSTIC] Attaching Logo File:", logoArchivo.name);
                data.append('logo', logoArchivo);
            }

            // IMPORTANTE: NO usamos el cliente api.put porque stringifica el body.
            // Usamos fetch manual pero construyendo la URL igual que el cliente api.
            const token = localStorage.getItem('ares_token');

            // Intentar obtener la base URL del mismo modo que el cliente api
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            const apiUrl = `${API_BASE}/admin/ajustes`;

            console.log("[DIAGNOSTIC] Target URL:", apiUrl);

            const res = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("[DIAGNOSTIC] Server Rejection:", errText);
                throw new Error(`Error ${res.status}: ${errText}`);
            }

            const result = await res.json();
            console.log("[DIAGNOSTIC] Save Success! Server Response:", result);

            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

            setQrArchivoBob(null);
            setQrArchivoUsd(null);
            setLogoArchivo(null);

            console.log("[DIAGNOSTIC] Verifying persistence...");
            await fetchAjustes();

        } catch (err: any) {
            console.error("[DIAGNOSTIC] Protocol Failure:", err);
            setErrorToast(err.message || "Error fatal en el servidor");
            setTimeout(() => setErrorToast(null), 5000);
        }
        setSaving(false);
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '6rem' }}>
            <AnimatePresence>
                {showToast && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'fixed', bottom: '40px', right: '40px', zIndex: 5000,
                            background: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '1.25rem 2.5rem',
                            borderRadius: '24px', border: '3px solid var(--color-primary)',
                            boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 900
                        }}
                    >
                        <CheckCircle2 color="var(--color-primary)" />
                        SINCRO EXITOSA: MATRIZ ACTUALIZADA
                    </motion.div>
                )}
                {errorToast && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '40px', right: '40px', zIndex: 5000,
                            background: '#EF4444', color: 'white', padding: '1.25rem 2.5rem',
                            borderRadius: '24px', border: '4px solid #000',
                            boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 900
                        }}
                    >
                        <XCircle color="white" />
                        ERROR: {errorToast.toUpperCase()}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--surface-raised)', padding: '0.8rem', borderRadius: '18px', color: 'var(--color-primary)', border: '2px solid #000', boxShadow: '4px 4px 0px 0px #000' }}>
                        <Settings size={32} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>
                            AJUSTES <span className="text-gradient-primary">SISTEMA</span>
                        </h1>
                        <p style={{ fontWeight: 700, marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '1rem' }}>CONFIGURACIÓN DEL MOTOR ARES</p>
                    </div>
                    <button 
                        onClick={fetchAjustes} 
                        className="btn-secondary" 
                        style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Refrescar Ajustes"
                    >
                        <RefreshCw size={24} className={saving ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <style>{`
                .ajustes-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 2.5rem; }
                .ajustes-main { grid-column: span 8; }
                .ajustes-side { grid-column: span 4; }
                .ajustes-inner-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                @media (max-width: 1024px) {
                    .ajustes-grid { grid-template-columns: 1fr; }
                    .ajustes-main, .ajustes-side { grid-column: span 1; }
                }
                @media (max-width: 768px) {
                    .ajustes-inner-grid { grid-template-columns: 1fr; }
                }
            `}</style>
            <div className="ajustes-grid">

                {/* Sección: Identidad */}
                <div className="card ajustes-main" style={{ padding: '3rem', background: 'var(--surface-raised)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
                        <div style={{ background: 'var(--surface-base)', padding: '0.75rem', borderRadius: '14px', color: 'var(--color-primary)', border: '2.5px solid #000' }}>
                            <Globe size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>IDENTIDAD DE MARCA</h2>
                    </div>

                    <div className="ajustes-inner-grid">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label className="input-label" style={{ fontWeight: 900, color: 'var(--color-primary)' }}>NOMBRE DE LA PLATAFORMA</label>
                                <input className="input" value={ajustes.nombre_plataforma} onChange={e => setAjustes({ ...ajustes, nombre_plataforma: e.target.value })} placeholder="Ej: ARES SAAS" style={{ height: '60px', fontSize: '1.1rem' }} />
                            </div>
                            <div>
                                <label className="input-label" style={{ fontWeight: 900, color: 'var(--color-primary)' }}>URL DEL LOGO (OPCIONAL)</label>
                                <div style={{ position: 'relative' }}>
                                    <Link size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                    <input className="input" value={ajustes.logo_url || ''} onChange={e => setAjustes({ ...ajustes, logo_url: e.target.value })} placeholder="https://..." style={{ height: '60px', paddingLeft: '3rem' }} />
                                </div>
                            </div>
                        </div>

                        <div className="upload-zone">
                            <input type="file" accept="image/*" onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) setLogoArchivo(file);
                            }} />
                            <div style={{ zIndex: 1, pointerEvents: 'none' }}>
                                {logoArchivo ? (
                                    <div style={{ color: 'var(--color-accent)', fontWeight: 900 }}>
                                        <ImageIcon size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.8 }} />
                                        <p style={{ fontSize: '0.7rem' }}>{logoArchivo.name.toUpperCase()}</p>
                                        <p style={{ fontSize: '0.6rem', opacity: 0.5 }}>PENDIENTE DE GUARDAR</p>
                                    </div>
                                ) : ajustes.logo_url ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <img src={ajustes.logo_url} style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1rem' }} />
                                        <p style={{ fontWeight: 900, fontSize: '0.7rem' }}>CLIC PARA CAMBIAR LOGO</p>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload size={40} color="var(--color-primary)" style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                        <p style={{ fontWeight: 900, fontSize: '0.8rem' }}>SUBIR LOGO LOCAL</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <label className="input-label" style={{ fontWeight: 900, color: 'var(--color-primary)' }}>MANIFIESTO LEGAL / PIE DE PÁGINA</label>
                        <textarea className="input" rows={4} value={ajustes.texto_legal} onChange={e => setAjustes({ ...ajustes, texto_legal: e.target.value })} style={{ resize: 'vertical', padding: '1.5rem' }} placeholder="Información de copyright y términos..." />
                    </div>
                </div>

                {/* Sección: Pagos */}
                <div className="card ajustes-side" style={{ padding: '3rem', background: 'var(--surface-raised)', borderColor: 'var(--color-accent)', boxShadow: '10px 10px 0px 0px var(--color-accent)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
                        <div style={{ background: 'var(--color-accent)', padding: '0.75rem', borderRadius: '14px', color: '#000', border: '2.5px solid #000' }}>
                            <Zap size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>COBROS</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label className="input-label" style={{ color: 'var(--color-accent)', opacity: 0.8 }}>TASA CAMBIO USD a BOB</label>
                            <input type="number" step="0.01" className="input" value={ajustes.tasa_cambio_bob} onChange={e => setAjustes({ ...ajustes, tasa_cambio_bob: parseFloat(e.target.value) || 6.96 })} style={{ background: 'rgba(255,255,255,0.2)', border: '2.5px solid #000', color: '#000', fontWeight: 900 }} />
                        </div>
                        
                        <div>
                            <label className="input-label" style={{ color: 'var(--color-accent)', opacity: 0.8 }}>TIGO MONEY (NÚMERO)</label>
                            <input className="input" value={ajustes.tigo_money_numero} onChange={e => setAjustes({ ...ajustes, tigo_money_numero: e.target.value })} style={{ background: 'rgba(255,255,255,0.2)', border: '2.5px solid #000', color: '#000', fontWeight: 900 }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* QR BOB */}
                            <div className="upload-zone upload-zone-dark" style={{ minHeight: '180px' }}>
                                <input type="file" accept="image/*" onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) setQrArchivoBob(file);
                                }} />
                                <div style={{ zIndex: 1, pointerEvents: 'none' }}>
                                    {qrArchivoBob ? (
                                        <div style={{ fontWeight: 900, color: '#000' }}>
                                            <ImageIcon size={24} style={{ margin: '0 auto 8px', color: 'var(--color-primary)' }} />
                                            <p style={{ fontSize: '0.6rem' }}>LISTO</p>
                                        </div>
                                    ) : ajustes.qr_cobro_bob ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <img src={ajustes.qr_cobro_bob} style={{ width: '60px', height: '60px', objectFit: 'cover', margin: '0 auto 0.5rem', border: '2px solid #000', padding: '2px', background: 'white', borderRadius: '10px' }} />
                                            <p style={{ fontWeight: 900, fontSize: '0.65rem' }}>QR Bs.</p>
                                        </div>
                                    ) : (
                                        <div style={{ opacity: 0.6, color: '#000' }}>
                                            <Upload size={28} style={{ margin: '0 auto 0.5rem' }} />
                                            <p style={{ fontWeight: 900, fontSize: '0.7rem' }}>SUBIR QR Bs.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* QR USD */}
                            <div className="upload-zone upload-zone-dark" style={{ minHeight: '180px', borderColor: 'rgba(52, 211, 153, 0.4)' }}>
                                <input type="file" accept="image/*" onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) setQrArchivoUsd(file);
                                }} />
                                <div style={{ zIndex: 1, pointerEvents: 'none' }}>
                                    {qrArchivoUsd ? (
                                        <div style={{ fontWeight: 900, color: '#000' }}>
                                            <ImageIcon size={24} style={{ margin: '0 auto 8px', color: '#10B981' }} />
                                            <p style={{ fontSize: '0.6rem' }}>LISTO</p>
                                        </div>
                                    ) : ajustes.qr_cobro_usd ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <img src={ajustes.qr_cobro_usd} style={{ width: '60px', height: '60px', objectFit: 'cover', margin: '0 auto 0.5rem', border: '2px solid #000', padding: '2px', background: 'white', borderRadius: '10px' }} />
                                            <p style={{ fontWeight: 900, fontSize: '0.65rem', color: '#10B981' }}>QR USD</p>
                                        </div>
                                    ) : (
                                        <div style={{ opacity: 0.6, color: '#000' }}>
                                            <Upload size={28} style={{ margin: '0 auto 0.5rem', color: '#10B981' }} />
                                            <p style={{ fontWeight: 900, fontSize: '0.7rem', color: '#10B981' }}>SUBIR QR USD</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección: Notificaciones Push (NUEVO) */}
                <div className="card ajustes-side" style={{ padding: '3rem', background: 'var(--surface-raised)', border: '4px solid #000' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                        <div style={{ background: pushEnabled === 'granted' ? '#22C55E' : 'var(--color-primary)', padding: '0.75rem', borderRadius: '14px', color: 'white', border: '2.5px solid #000' }}>
                            {pushEnabled === 'granted' ? <Bell size={24} /> : <BellOff size={24} />}
                        </div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)' }}>PUSH ALERTS</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ 
                            background: pushEnabled === 'granted' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            padding: '1.5rem', borderRadius: '20px', border: '2px solid rgba(0,0,0,0.1)', 
                            textAlign: 'center' 
                        }}>
                            <p style={{ fontWeight: 900, fontSize: '0.8rem', color: pushEnabled === 'granted' ? '#22C55E' : '#EF4444', marginBottom: '0.5rem' }}>
                                SISTEMA: {pushEnabled === 'granted' ? 'CONECTADO' : 'DESCONECTADO'}
                            </p>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7 }}>
                                {pushEnabled === 'granted' 
                                    ? 'Estás recibiendo alertas de pagos y pedidos en tiempo real.' 
                                    : 'Las notificaciones están bloqueadas o no activadas en este dispositivo.'}
                            </p>
                        </div>

                        {pushEnabled !== 'granted' && (
                            <button
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
                                        (window as any).OneSignalDeferred.push(async (OneSignal: any) => {
                                            await OneSignal.Notifications.requestPermission();
                                            const perm = OneSignal.Notifications.permission;
                                            setPushEnabled(perm ? 'granted' : 'default');
                                            if (perm) {
                                                await OneSignal.User.PushSubscription.optIn();
                                                alert('¡Notificaciones activadas exitosamente!');
                                            } else {
                                                alert('⚠️ Debes permitir las notificaciones en la configuración de tu navegador.');
                                            }
                                        });
                                    }
                                }}
                                className="btn-primary"
                                style={{ width: '100%', padding: '1rem', fontWeight: 900 }}
                            >
                                ACTIVAR ALERTAS 🔔
                            </button>
                        )}
                        
                        <p style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.5, textAlign: 'center' }}>
                            ID DE DISPOSITIVO: {typeof window !== 'undefined' ? 'DETECTADO' : 'NO DISPONIBLE'}
                        </p>
                    </div>
                </div>

                {/* Sección: Respaldo (Backup) */}
                <div className="card" style={{ gridColumn: 'span 12', padding: '3rem', background: 'var(--surface-raised)', border: '4px solid #000', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                        <div style={{ background: '#10B981', padding: '0.75rem', borderRadius: '14px', color: '#000', border: '2.5px solid #000' }}>
                            <Save size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>COPIAS DE SEGURIDAD (BACKUP)</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                         <div style={{ flex: 1, minWidth: '300px' }}>
                             <p style={{ fontWeight: 800, color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                 Crea un archivo JSON exportable de toda tu base de datos y config, o restaura un respaldo previo. Las restauraciones reescriben los datos.
                             </p>
                             <button className="btn-primary" 
                                onClick={async () => {
                                    try {
                                        const res = await api.post('/admin/backups/create', {});
                                        if (res.file) {
                                            alert('✅ Backup creado exitosamente: ' + res.file);
                                        }
                                    } catch (err: any) { alert('ERROR: ' + err.message); }
                                }}
                                style={{ background: '#10B981', color: 'white' }}>
                                 + GENERAR NUEVA COPIA
                             </button>
                         </div>
                         <div style={{ flex: 1, minWidth: '300px', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)' }}>
                              <h4 style={{ fontWeight: 900, marginBottom: '1rem' }}><Terminal size={18} style={{display:'inline', marginRight: 5}}/> RESTAURACIÓN PELIGROSA</h4>
                              <input id="restore-filename" type="text" className="input" placeholder="Ej: ares_backup_2026-X.json" style={{ marginBottom: '1rem', width: '100%' }} />
                              <button className="btn-primary" 
                                onClick={async () => {
                                    const filename = (document.getElementById('restore-filename') as HTMLInputElement).value;
                                    if (!filename) return alert('Debes escribir el nombre del archivo primero.');
                                    if (!confirm('⚠️ ALERTA ROJA: Esto borrará la base de datos actual y cargará el backup. ESTÁS SEGURO?')) return;
                                    try {
                                        await api.post('/admin/backups/restore', { filename });
                                        alert('✅ RESTAURACIÓN COMPLETADA. EL SISTEMA SE REINICIARÁ.');
                                        window.location.reload();
                                    } catch (err: any) { alert('ERROR FATAL: ' + err.message); }
                                }}
                                style={{ background: '#EF4444', color: 'white', width: '100%' }}>
                                 RESTAURAR ARCHIVO DE BACKUP (JSON)
                             </button>
                         </div>
                    </div>
                </div>

                {/* Sección: Avisos y Soporte */}
                <div className="card" style={{ gridColumn: 'span 12', padding: '3rem', background: 'var(--surface-overlay)', border: '4px solid #000' }}>
                    <div style={{ display: 'flex', gap: '4rem', alignItems: 'start' }}>
                        <div style={{ flex: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'var(--color-secondary)', color: 'white', padding: '0.6rem', borderRadius: '12px', border: '2px solid #000' }}>
                                    <Megaphone size={24} />
                                </div>
                                <h3 style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)' }}>NOTICIA GLOBAL (DASHBOARD VENDEDOR)</h3>
                            </div>
                            <textarea className="input" style={{ background: 'var(--surface-base)', color: 'var(--text-primary)', border: '3px solid #000', padding: '1.5rem' }} value={ajustes.noticia_global} onChange={e => setAjustes({ ...ajustes, noticia_global: e.target.value })} placeholder="Anuncio principal..." />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                                <div style={{ background: '#25D366', color: 'white', padding: '0.6rem', borderRadius: '12px', border: '2px solid #000' }}>
                                    <HelpCircle size={24} />
                                </div>
                                <h3 style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)' }}>SOPORTE WHATSAPP</h3>
                            </div>
                            <input className="input" style={{ background: 'var(--surface-base)', color: 'var(--text-primary)', border: '3px solid #000', height: '60px', fontWeight: 900 }} value={ajustes.whatsapp_soporte} onChange={e => setAjustes({ ...ajustes, whatsapp_soporte: e.target.value })} placeholder="591..." />
                        </div>
                    </div>
                </div>

                {/* Botón de Acción */}
                <div style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '1.5rem 6rem', fontSize: '1.5rem', height: '80px', boxShadow: '15px 15px 0px 0px #000', borderRadius: '24px' }}>
                        {saving ? 'SINCRONIZANDO PROTOCOLO...' : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <ShieldCheck size={32} /> APLICAR MODIFICACIONES
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
