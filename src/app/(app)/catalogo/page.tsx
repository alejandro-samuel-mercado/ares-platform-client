/**
 * Mi Catálogo — Ares v3 (Solo selección de servicios)
 *
 * El vendedor solo activa/desactiva servicios.
 * Los precios los define el admin desde el panel (precio_admin).
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Minus, CheckCircle2, Zap, RefreshCw, ArrowUpCircle, X } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface ServicioBase { id: string; nombre: string; descripcion_base: string; precio_admin: number; precio_sugerido: number; categoria: string; estado_actual: string; es_iptv_propio: boolean; logo_url?: string; }
interface MiServicio { id: string; servicio_id: string; activo: boolean; servicio: ServicioBase; }

export default function CatalogoPage() {
    const { vendor } = useAuth();
    const [serviciosBase, setServiciosBase] = useState<ServicioBase[]>([]);
    const [misServicios, setMisServicios] = useState<MiServicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [toast, setToast] = useState('');
    const [tasaCambio, setTasaCambio] = useState(6.96);

    const load = async () => {
        try {
            const [base, mine, ajustes] = await Promise.all([api.get('/servicios_base'), api.get('/mis_servicios'), api.get('/ajustes-publicos')]);
            setServiciosBase(base);
            setMisServicios(mine);
            if (ajustes?.tasa_cambio_bob) setTasaCambio(ajustes.tasa_cambio_bob);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const isActive = (svcId: string) => misServicios.some(ms => ms.servicio_id === svcId && ms.activo);
    const getMyService = (svcId: string) => misServicios.find(ms => ms.servicio_id === svcId);
    const activeCount = misServicios.filter(ms => ms.activo).length;

    const handleActivate = async (svc: ServicioBase) => {
        try {
            await api.post('/mis_servicios', { servicio_id: svc.id });
            showToast(`${svc.nombre} activado ✅`);
            load();
        } catch (err: any) {
            if (err.data?.reason === 'plan_limit_reached') {
                setShowUpgrade(true);
            } else {
                showToast(err.message || 'Error');
            }
        }
    };

    const handleDeactivate = async (svcId: string) => {
        const ms = getMyService(svcId);
        if (!ms) return;
        await api.delete(`/mis_servicios/${ms.id}`);
        showToast('Servicio desactivado');
        load();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '8rem' }}>
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 20, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
                            zIndex: 3000, background: 'var(--surface-raised)', color: 'var(--text-primary)',
                            padding: '1rem 2rem', borderRadius: 'var(--radius-full)',
                            border: '2px solid var(--color-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            fontWeight: 800, fontSize: '0.9rem'
                        }}
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', lineHeight: 1, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        MI <span className="text-gradient-primary">CATÁLOGO</span>
                        <button
                            onClick={load}
                            className="btn-secondary"
                            style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Refrescar Catálogo"
                        >
                            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div className="chip chip-primary">
                            {activeCount} {vendor?.plan_features?.limite_servicios ? `/ ${vendor.plan_features.limite_servicios}` : ''} ACTIVOS
                        </div>
                        <p style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {vendor?.plan_features?.limite_servicios
                                ? `Límite de tu plan: ${vendor.plan_features.limite_servicios} servicios`
                                : 'Servicios ilimitados en tu catálogo'}
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '5rem 0', textAlign: 'center' }}>
                    <Zap className="animate-pulse" size={40} color="var(--color-primary)" style={{ margin: '0 auto' }} />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {serviciosBase.map((svc, index) => {
                        const active = isActive(svc.id);
                        return (
                            <motion.div
                                key={svc.id}
                                className="card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{
                                    opacity: active ? 1 : 0.6,
                                    filter: active ? 'none' : 'grayscale(1)',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    background: 'var(--surface-raised)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '45px', height: '45px', borderRadius: '12px',
                                            background: 'var(--surface-base)', border: '2px solid #000',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            position: 'relative', overflow: 'hidden'
                                        }}>
                                            {svc.logo_url ? (
                                                <img src={svc.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={svc.nombre} />
                                            ) : (
                                                <Zap size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 900, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', lineHeight: 1.2 }}>
                                                {svc.nombre.toUpperCase()}
                                                {active && <CheckCircle2 size={16} color="var(--color-primary)" />}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>{svc.categoria}</div>
                                                <div style={{ 
                                                    fontSize: '0.65rem', fontWeight: 900, padding: '0.1rem 0.5rem', borderRadius: '6px', border: '1.5px solid #000',
                                                    background: (svc as any).stock > 10 ? '#10B981' : (svc as any).stock > 0 ? '#F59E0B' : '#EF4444', 
                                                    color: '#000' 
                                                }}>
                                                    STOCK: {(svc as any).stock || 0}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Precio del Admin (solo lectura) */}
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '14px',
                                    border: '1.5px solid rgba(255,255,255,0.05)', marginTop: 'auto'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5, marginBottom: '0.2rem' }}>PRECIO POR CUENTA</div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>Bs {svc.precio_admin || svc.precio_sugerido}</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.5 }}>| ${((svc.precio_admin || svc.precio_sugerido) / tasaCambio).toFixed(2)} USD</span>
                                        </div>
                                    </div>
                                    {active ? (
                                        <button onClick={() => handleDeactivate(svc.id)} className="btn-secondary" style={{ width: '45px', height: '45px', padding: 0, borderRadius: '14px', borderColor: 'var(--color-danger)', color: 'var(--color-danger)', boxShadow: 'none' }}>
                                            <Minus size={22} strokeWidth={3} />
                                        </button>
                                    ) : (
                                        <button onClick={() => handleActivate(svc)} className="btn-primary" style={{ width: '45px', height: '45px', padding: 0, borderRadius: '14px', boxShadow: 'none' }}>
                                            <Plus size={22} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Upgrade Modal */}
            <AnimatePresence>
                {showUpgrade && (
                    <div className="modal-overlay">
                        <motion.div className="modal-container" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', background: 'var(--surface-raised)', border: '4px solid #000', borderRadius: '32px' }}>
                            <div style={{ background: 'var(--color-accent)', width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #000', boxShadow: '8px 8px 0px 0px #000' }}>
                                <ArrowUpCircle size={40} color="#000" />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--text-primary)' }}>SUBE DE NIVEL 🚀</h2>
                            <p style={{ fontWeight: 800, color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
                                Has alcanzado el límite de tu plan. Desbloquea el <span className="text-gradient-primary">Plan PRO</span> para disfrutar de servicios ilimitados.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <a href="/plan" className="btn-primary" style={{ width: '100%', textDecoration: 'none', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ACTUALIZAR AHORA</a>
                                <button className="btn-secondary" onClick={() => setShowUpgrade(false)} style={{ border: 'none', color: 'var(--text-muted)', fontWeight: 800 }}>MÁS TARDE</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
