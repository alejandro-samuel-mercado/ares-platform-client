/**
 * Mis Servicios — Ares v3 (Centro operativo)
 *
 * Muestra servicios seleccionados del vendor con:
 * - Solicitud de credenciales (pedidos)
 * - Visualización de credenciales asignadas
 * - Historial de pedidos por servicio
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Key, Send, Loader2, CheckCircle2, AlertCircle, X, Zap, Copy,
    ExternalLink, Package, Clock, RefreshCw, Eye, EyeOff, Upload,
    ShoppingBag, Hash, UploadCloud, AlertTriangle
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface ServicioBase { id: string; nombre: string; logo_url: string; categoria: string; estado_actual: string; precio_admin: number; proveedor_id: string; }
interface MiServicio { id: string; servicio_id: string; precio_venta: number; servicio: ServicioBase; }
interface Credencial { id: string; usuario: string; password: string; perfil: string | null; servicio: { id: string; nombre: string; logo_url: string; categoria: string }; }
interface Pedido { id: string; servicio_id: string; cantidad: number; comprobante_url: string | null; status: string; respuesta_admin: string | null; creado_en: string; servicio?: { nombre: string; logo_url: string; }; }

export default function MisServiciosPage() {
    const { vendor } = useAuth();
    const [misServicios, setMisServicios] = useState<MiServicio[]>([]);
    const [credenciales, setCredenciales] = useState<Credencial[]>([]);
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [orderNotes, setOrderNotes] = useState('');
    const [orderComprobante, setOrderComprobante] = useState('');
    const [orderComprobanteFile, setOrderComprobanteFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [submitting, setSubmitting] = useState(false);
    const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
    const [editingPrice, setEditingPrice] = useState<Record<string, string>>({});
    const [savingPrice, setSavingPrice] = useState<string | null>(null);
    const [tasaCambio, setTasaCambio] = useState(6.96);
    const [providerInfo, setProviderInfo] = useState<any>(null);
    const [ajustesPlat, setAjustesPlat] = useState<any>(null);
    const [showQRSubmodal, setShowQRSubmodal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null);
    const [detailsTab, setDetailsTab] = useState<'credenciales' | 'pedidos'>('credenciales');
    const canOrder = vendor?.plan_features?.pedidos_automaticos || ['Vendedor', 'Pro', 'Proveedor'].includes(vendor?.plan || '') || vendor?.role === 'SUPERADMIN';

    const load = async () => {
        setLoading(true);
        try {
            const [svc, cred, ped, ajustes] = await Promise.all([
                api.get('/mis_servicios'),
                api.get('/mis_credenciales'),
                api.get('/pedidos'),
                api.get('/ajustes-publicos')
            ]);
            console.log("FETCHED MIS SERVICIOS: ", svc);
            const activeServices = svc.filter((s: any) => s.activo);
            setMisServicios(activeServices);
            setCredenciales(cred);
            setPedidos(ped);
            if (ajustes) setAjustesPlat(ajustes);
            if (ajustes?.tasa_cambio_bob) setTasaCambio(ajustes.tasa_cambio_bob);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Copiado ✅');
    };

    const togglePassword = (id: string) => {
        const next = new Set(revealedPasswords);
        if (next.has(id)) next.delete(id); else next.add(id);
        setRevealedPasswords(next);
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, string> = {
            'PENDIENTE': 'chip-gold',
            'EN_PROCESO': 'chip-blue',
            'COMPLETADO': 'chip-active',
            'CANCELADO': 'chip-danger'
        };
        return <span className={`chip ${config[status] || ''}`} style={{ fontWeight: 900, fontSize: '0.7rem' }}>{status}</span>;
    };

    const handleOrder = async () => {
        if (!selectedService) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('servicio_id', selectedService);
            formData.append('cantidad', orderQuantity.toString());
            if (orderComprobante) formData.append('comprobante_url', orderComprobante);
            if (orderComprobanteFile) formData.append('comprobante', orderComprobanteFile);
            if (orderNotes) formData.append('notas', orderNotes);

            await api.request('/pedidos', { method: 'POST', body: formData });

            showToast('Pedido enviado ✅');
            setShowOrderModal(false);
            setOrderQuantity(1);
            setOrderNotes('');
            setOrderComprobante('');
            setOrderComprobanteFile(null);
            load();
        } catch (err) { console.error(err); showToast('Error al crear pedido'); }
        finally { setSubmitting(false); }
    };

    const handleUpdatePrice = async (id: string) => {
        const price = editingPrice[id];
        if (!price || isNaN(parseFloat(price))) return;
        setSavingPrice(id);
        try {
            await api.patch(`/mis_servicios/${id}`, { precio_venta: parseFloat(price) });
            showToast('Precio actualizado ✅');
            load();
        } catch (err) { console.error(err); showToast('Error al actualizar precio'); }
        finally { setSavingPrice(null); }
    };

    const getServiceCredentials = (svcId: string) => credenciales.filter(c => c.servicio.id === svcId);
    const getServicePedidos = (svcId: string) => pedidos.filter(p => p.servicio_id === svcId);
    const getServicePrice = (svc: MiServicio) => svc.servicio.precio_admin || 0;

    const statusColor: Record<string, string> = {
        PENDIENTE: '#F59E0B',
        EN_PROCESO: '#3B82F6',
        COMPLETADO: '#10B981',
        CANCELADO: '#EF4444'
    };

    if (loading) {
        return (
            <div style={{ padding: '5rem 0', textAlign: 'center' }}>
                <Zap className="animate-pulse" size={40} color="var(--color-primary)" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>CARGANDO SERVICIOS...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '8rem' }}>
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 3000,
                            background: 'var(--surface-raised)', padding: '1rem 2rem', borderRadius: 'var(--radius-full)',
                            border: '2px solid var(--color-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)'
                        }}>
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', lineHeight: 1, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        MIS <span className="text-gradient-primary">SERVICIOS ACTIVOS</span>
                        <button onClick={load} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}><RefreshCw size={20} /></button>
                    </h1>
                    <p style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        {canOrder
                            ? 'Pide credenciales y gestiona tus cuentas'
                            : 'Gestión de servicios en tu catálogo'}
                    </p>
                </div>
            </div>

            {misServicios.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <Package size={50} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)' }}>SIN SERVICIOS ACTIVOS</h3>
                    <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.5rem' }}>Activa servicios desde el <a href="/catalogo" style={{ color: 'var(--color-primary)' }}>Catálogo</a></p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {misServicios.map((ms) => {
                        const svcCreds = getServiceCredentials(ms.servicio_id);
                        const svcPedidos = getServicePedidos(ms.servicio_id);
                        const activeCount = svcPedidos.filter(p => p.status === 'COMPLETADO' && p.respuesta_admin).length > 0 
                            ? svcPedidos.filter(p => p.status === 'COMPLETADO' && p.respuesta_admin).length 
                            : svcCreds.length;

                        return (
                            <motion.div 
                                key={ms.id} 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -5, boxShadow: 'var(--shadow-soft)', borderColor: 'var(--color-primary)' }}
                                style={{ 
                                    padding: '2rem', 
                                    background: 'var(--surface-card)', 
                                    backdropFilter: 'blur(15px)',
                                    borderRadius: '32px',
                                    border: '2px solid rgba(var(--color-primary-rgb, 187, 72, 18), 0.1)',
                                    display: 'flex', flexDirection: 'column', gap: '1.75rem',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Background Decorative Glow */}
                                <div style={{ 
                                    position: 'absolute', top: '-50%', right: '-50%', width: '150px', height: '150px', 
                                    background: 'radial-gradient(circle, var(--ambient-1) 0%, transparent 70%)',
                                    pointerEvents: 'none',
                                    opacity: 0.2
                                }} />

                                {/* Service Header Section */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                                    <div style={{ 
                                        width: '65px', height: '65px', borderRadius: '18px', 
                                        background: 'var(--surface-base)', 
                                        border: '1px solid var(--color-primary)', 
                                        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: 'var(--shadow-soft)'
                                    }}>
                                        {ms.servicio.logo_url ? <img src={ms.servicio.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Zap size={24} style={{ color: 'var(--color-primary)' }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h3 style={{ 
                                                fontWeight: 950, fontSize: '1.25rem', letterSpacing: '-0.02em', margin: 0,
                                                color: 'var(--text-primary)'
                                            }}>
                                                {ms.servicio.nombre.toUpperCase()}
                                            </h3>
                                            <div style={{ 
                                                padding: '0.25rem 0.6rem', borderRadius: '8px', background: 'var(--surface-base)',
                                                fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.05em',
                                                border: '1px solid rgba(0,0,0,0.1)'
                                            }}>
                                                {ms.servicio.categoria.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Management Body */}
                                <div style={{ 
                                    background: 'var(--surface-base)', padding: '1.25rem', borderRadius: '24px',
                                    border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '0.75rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PRECIO DE VENTA</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <input
                                                type="number"
                                                value={editingPrice[ms.id] !== undefined ? editingPrice[ms.id] : ms.precio_venta}
                                                onChange={(e) => setEditingPrice({ ...editingPrice, [ms.id]: e.target.value })}
                                                style={{ 
                                                    width: '80px', background: 'none', border: 'none', textAlign: 'right',
                                                    color: 'var(--color-primary)', fontWeight: 950, fontSize: '1.1rem', outline: 'none'
                                                }}
                                                placeholder="0.00"
                                            />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-primary)' }}>Bs</span>
                                            {(editingPrice[ms.id] !== undefined && editingPrice[ms.id] !== ms.precio_venta.toString()) && (
                                                <button onClick={() => handleUpdatePrice(ms.id)} disabled={savingPrice === ms.id} style={{ marginLeft: '0.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.3rem 0.6rem', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}>
                                                    {savingPrice === ms.id ? <Loader2 className="animate-spin" size={12} /> : 'GUARDAR'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)' }}>EQUIVALENCIA ESTIMADA</span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-primary)' }}>$ {(ms.precio_venta / tasaCambio).toFixed(2)} USD</span>
                                    </div>
                                </div>

                                {/* Main Actions Footer */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => { setShowDetailsModal(ms.servicio.id); setDetailsTab('credenciales'); }}
                                            className="btn-secondary"
                                            style={{ 
                                                flex: 1, padding: '1rem', borderRadius: '18px',
                                                fontSize: '0.7rem', fontWeight: 950,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem'
                                            }}
                                        >
                                            <Key size={16} /> CUENTAS ({activeCount})
                                        </button>
                                        <button
                                            onClick={() => { setShowDetailsModal(ms.servicio.id); setDetailsTab('pedidos'); }}
                                            className="btn-secondary"
                                            style={{ 
                                                flex: 1, padding: '1rem', borderRadius: '18px',
                                                fontSize: '0.7rem', fontWeight: 950,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem'
                                            }}
                                        >
                                            <Package size={16} /> PEDIDOS ({svcPedidos.length})
                                        </button>
                                    </div>

                                    {canOrder && (
                                        <button
                                            onClick={() => { setSelectedService(ms.servicio.id); setShowOrderModal(true); }}
                                            className="btn-primary"
                                            style={{ 
                                                width: '100%', padding: '1.1rem', borderRadius: '20px', 
                                                fontSize: '0.86rem', fontWeight: 950,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                                            }}
                                        >
                                            <Send size={18} /> GENERAR NUEVO PEDIDO
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Premium Service Details Modal */}
            <AnimatePresence>
                {showDetailsModal && (() => {
                    const svc = misServicios.find(ms => ms.servicio.id === showDetailsModal)?.servicio;
                    if (!svc) return null;
                    const svcCreds = getServiceCredentials(svc.id);
                    const svcPedidos = getServicePedidos(svc.id);
                    const entregaMaestra = svcPedidos.filter(p => p.status === 'COMPLETADO' && p.respuesta_admin);

                    return (
                        <div className="modal-overlay"
                            style={{
                                zIndex: 1000,
                                background: 'var(--surface-overlay)',
                                backdropFilter: 'blur(12px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={() => setShowDetailsModal(null)}
                        >
                            <motion.div
                                className="modal-container"
                                onClick={e => e.stopPropagation()}
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                style={{
                                    maxWidth: '650px', width: '95%', maxHeight: '85vh',
                                    display: 'flex', flexDirection: 'column',
                                    background: 'var(--surface-raised)',
                                    backdropFilter: 'blur(30px) saturate(200%)',
                                    borderRadius: '32px',
                                    border: 'var(--border-thick)',
                                    boxShadow: 'var(--shadow-heavy)',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                            >
                                {/* Decorative Glow */}
                                <div style={{
                                    position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
                                    width: '300px', height: '200px', background: 'var(--color-primary)',
                                    filter: 'blur(100px)', opacity: 0.15, pointerEvents: 'none'
                                }} />

                                {/* Modal Header */}
                                <div style={{
                                    padding: '2rem 2rem 1.5rem',
                                    borderBottom: '1px solid rgba(var(--color-primary-rgb, 0,0,0), 0.1)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    position: 'relative', zIndex: 2
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{
                                            width: '60px', height: '60px', borderRadius: '18px',
                                            background: 'var(--surface-base)',
                                            border: '1px solid var(--color-primary)',
                                            padding: '2px', overflow: 'hidden', boxShadow: 'var(--shadow-soft)'
                                        }}>
                                            <img src={svc.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                                        </div>
                                        <div>
                                            <h2 style={{
                                                fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.02em',
                                                color: 'var(--text-primary)', margin: 0
                                            }}>
                                                {svc.nombre.toUpperCase()}
                                            </h2>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: '0.2rem' }}>
                                                {svc.categoria.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailsModal(null)}
                                        style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            background: 'var(--surface-base)', border: '1px solid var(--color-primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-primary)'
                                        }}
                                        className="hover-bg-primary"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Premium Tabs */}
                                <div style={{ padding: '1rem 2rem', background: 'var(--surface-base)', display: 'flex', gap: '1.5rem', borderBottom: '1px solid rgba(var(--color-primary-rgb, 0,0,0), 0.1)' }}>
                                    {[
                                        { id: 'credenciales', label: 'CUENTAS ACTIVAS', icon: Key, count: entregaMaestra.length > 0 ? entregaMaestra.length : svcCreds.length },
                                        { id: 'pedidos', label: 'HISTORIAL', icon: Clock, count: svcPedidos.length }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setDetailsTab(tab.id as any)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                padding: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem',
                                                color: detailsTab === tab.id ? 'var(--color-primary)' : 'var(--text-muted)',
                                                fontWeight: 900, fontSize: '0.75rem', position: 'relative',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                filter: detailsTab === tab.id ? 'drop-shadow(0 0 8px var(--shadow-glow))' : 'none'
                                            }}
                                        >
                                            <tab.icon size={16} />
                                            {tab.label}
                                            <span style={{
                                                marginLeft: '0.2rem', padding: '0.1rem 0.4rem', borderRadius: '6px',
                                                background: detailsTab === tab.id ? 'var(--color-primary)' : 'var(--surface-raised)',
                                                color: detailsTab === tab.id ? '#fff' : 'var(--text-muted)',
                                                fontSize: '0.6rem'
                                            }}>{tab.count}</span>
                                            {detailsTab === tab.id && (
                                                <motion.div layoutId="modal-tab-underline" style={{
                                                    position: 'absolute', bottom: -1, left: 0, right: 0, height: '2px',
                                                    background: 'var(--color-primary)', boxShadow: 'var(--shadow-glow)'
                                                }} />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Content Area */}
                                <div
                                    style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}
                                    className="custom-scroll"
                                >
                                    {detailsTab === 'credenciales' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            {entregaMaestra.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                    {entregaMaestra.map(p => (
                                                        <div key={p.id} style={{
                                                            background: 'var(--surface-card)',
                                                            borderRadius: '24px', padding: '1.5rem',
                                                            border: '1px solid var(--color-primary)',
                                                            boxShadow: 'var(--shadow-soft)'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', boxShadow: 'var(--shadow-glow)' }} />
                                                                    <span style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--color-primary)', letterSpacing: '0.05em' }}>PEDIDO RELLENADO #{p.id.slice(-6).toUpperCase()}</span>
                                                                </div>
                                                                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)' }}>{new Date(p.creado_en).toLocaleDateString()}</span>
                                                            </div>
                                                            <div style={{ 
                                                                position: 'relative', background: 'var(--surface-base)', borderRadius: '16px', 
                                                                padding: '1.25rem', border: '1px solid rgba(var(--color-primary-rgb, 0,0,0), 0.1)'
                                                            }}>
                                                                <pre style={{ 
                                                                    margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', 
                                                                    fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)',
                                                                    lineHeight: 1.6
                                                                }}>
                                                                    {p.respuesta_admin}
                                                                </pre>
                                                                <button 
                                                                    onClick={() => handleCopy(p.respuesta_admin!)} 
                                                                    className="btn-secondary"
                                                                    style={{ 
                                                                        position: 'absolute', top: '10px', right: '10px',
                                                                        padding: '0.5rem', borderRadius: '8px'
                                                                    }}
                                                                >
                                                                    <Copy size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : svcCreds.length > 0 ? (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                                    {svcCreds.map((cred, i) => (
                                                        <motion.div 
                                                            key={cred.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            style={{
                                                                background: 'var(--surface-base)', borderRadius: '20px', padding: '1.25rem',
                                                                border: '1px solid var(--color-primary)', display: 'flex', flexDirection: 'column', gap: '1rem'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-primary)' }}>{cred.perfil ? `PERFIL: ${cred.perfil.toUpperCase()}` : 'ACCESO EXCLUSIVO'}</span>
                                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                                    <button onClick={() => togglePassword(cred.id)} className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '8px' }}>
                                                                        {revealedPasswords.has(cred.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                                <div className="relative group cursor-pointer" onClick={() => handleCopy(cred.usuario)}>
                                                                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>USUARIO / CORREO</div>
                                                                    <div style={{ 
                                                                        background: 'var(--surface-raised)', padding: '0.75rem', borderRadius: '12px', 
                                                                        fontSize: '0.8rem', fontWeight: 800, border: '1px solid rgba(var(--color-primary-rgb, 0,0,0), 0.1)',
                                                                        display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)'
                                                                    }}>
                                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cred.usuario}</span>
                                                                        <Copy size={12} style={{ opacity: 0.5 }} />
                                                                    </div>
                                                                </div>
                                                                <div className="relative group cursor-pointer" onClick={() => handleCopy(cred.password)}>
                                                                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>CONTRASEÑA</div>
                                                                    <div style={{ 
                                                                        background: 'var(--surface-raised)', padding: '0.75rem', borderRadius: '12px', 
                                                                        fontSize: '0.8rem', fontWeight: 800, border: '1px solid rgba(var(--color-primary-rgb, 0,0,0), 0.1)',
                                                                        display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)'
                                                                    }}>
                                                                        <span>{revealedPasswords.has(cred.id) ? cred.password : '••••••••'}</span>
                                                                        <Copy size={12} style={{ opacity: 0.5 }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                                                    <AlertCircle size={48} style={{ margin: '0 auto 1.5rem' }} />
                                                    <p style={{ fontWeight: 950, fontSize: '0.9rem' }}>SIN CUENTAS ASIGNADAS</p>
                                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.5rem' }}>Realiza un pedido para obtener tus accesos.</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {svcPedidos.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                                                    <Package size={48} style={{ margin: '0 auto 1.5rem' }} />
                                                    <p style={{ fontWeight: 950, fontSize: '0.9rem' }}>HISTORIAL VACÍO</p>
                                                </div>
                                            ) : (
                                                svcPedidos.map((p, i) => (
                                                    <motion.div
                                                        key={p.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        style={{
                                                            background: 'var(--surface-base)', borderRadius: '20px', padding: '1.25rem',
                                                            border: '1px solid rgba(var(--color-primary-rgb, 0,0,0), 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <div style={{
                                                                width: '45px', height: '45px', borderRadius: '12px', background: 'var(--surface-raised)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-primary)'
                                                            }}>
                                                                <Hash size={18} style={{ color: 'var(--color-primary)' }} />
                                                            </div>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>{p.cantidad} UNDS</span>
                                                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>ORD #{p.id.slice(-6).toUpperCase()}</span>
                                                                </div>
                                                                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.2rem' }}>{new Date(p.creado_en).toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                                                            {getStatusBadge(p.status)}
                                                            {p.comprobante_url && (
                                                                <a href={p.comprobante_url} target="_blank" style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                                                                    <Eye size={12} /> VER RECIBO
                                                                </a>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div style={{
                                    padding: '1.5rem 2rem',
                                    borderTop: '1px solid rgba(var(--color-primary-rgb, 0,0,0), 0.1)',
                                    display: 'flex', gap: '1rem', background: 'var(--surface-base)'
                                }}>
                                    <button
                                        onClick={() => setShowDetailsModal(null)}
                                        className="btn-secondary"
                                        style={{
                                            flex: 1, height: '55px', borderRadius: '18px',
                                            fontWeight: 950, fontSize: '0.9rem'
                                        }}
                                    >
                                        CERRAR
                                    </button>
                                    <button
                                        onClick={() => {
                                            const svcId = showDetailsModal;
                                            setShowDetailsModal(null);
                                            setSelectedService(svcId);
                                            setShowOrderModal(true);
                                        }}
                                        className="btn-primary"
                                        style={{
                                            flex: 2, height: '55px', borderRadius: '18px',
                                            fontWeight: 950, fontSize: '0.9rem'
                                        }}
                                    >
                                        SOLICITAR MÁS CUENTAS
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>

             {/* New Order Modal */}
            <AnimatePresence>
                {showOrderModal && (
                    <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                        <motion.div className="modal-container"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            style={{
                                background: 'var(--surface-raised)', border: '4px solid #000', borderRadius: '28px',
                                padding: '2rem', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)' }}>NUEVO PEDIDO</h2>
                                <button onClick={() => setShowOrderModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            {!selectedService ? (
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ fontWeight: 900, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>SELECCIONA EL SERVICIO</label>
                                    <select className="input" value={selectedService || ''} onChange={(e) => setSelectedService(e.target.value)} style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                                        <option value="">-- Elige un servicio --</option>
                                        {misServicios.map(ms => <option key={ms.servicio_id} value={ms.servicio_id}>{ms.servicio.nombre.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            ) : (() => {
                                const svcData = misServicios.find(ms => ms.servicio_id === selectedService)?.servicio;
                                const stock = (svcData as any)?._count?.credenciales || 0;
                                return (
                                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', marginBottom: '1rem', fontWeight: 900, fontSize: '0.9rem' }}>
                                        {svcData?.nombre.toUpperCase()}
                                        {stock === 0 && (
                                            <div style={{ background: '#EF444422', color: '#EF4444', border: '2px solid #EF4444', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900 }}>
                                                <AlertTriangle size={18} /> AGOTADO: SIN STOCK
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            <label style={{ fontWeight: 900, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>CANTIDAD</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                                <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} className="btn-secondary" style={{ width: '45px', height: '45px', padding: 0, borderRadius: '14px' }}>-</button>
                                <span style={{ fontWeight: 900, fontSize: '2rem', minWidth: '40px', textAlign: 'center' }}>{orderQuantity}</span>
                                <button onClick={() => setOrderQuantity(orderQuantity + 1)} className="btn-secondary" style={{ width: '45px', height: '45px', padding: 0, borderRadius: '14px' }}>+</button>
                            </div>

                            {selectedService && (() => {
                                const svc = misServicios.find(ms => ms.servicio_id === selectedService)?.servicio;
                                const total = orderQuantity * (svc?.precio_admin || 0);
                                return (
                                    <>
                                        <div style={{ background: 'rgba(var(--color-primary-rgb, 0,0,0),0.1)', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 900, border: '2px solid var(--color-primary)' }}>
                                            <span>MONTO TOTAL</span>
                                            <span style={{ color: 'var(--color-primary)' }}>Bs {total.toFixed(2)}</span>
                                        </div>

                                        <button
                                            onClick={async () => {
                                                const svcData = misServicios.find(ms => ms.servicio_id === selectedService)?.servicio;
                                                const provId = svcData?.proveedor_id || (svcData as any)?.proveedorId;
                                                const currentAjustes = ajustesPlat || await api.get('/ajustes-publicos').catch(() => null);

                                                if (provId && provId !== 'null' && provId !== 'undefined' && String(provId).length > 5) {
                                                    try {
                                                        const res = await api.get(`/marketplace/proveedor/${provId}/pagos`);
                                                        setProviderInfo({
                                                            alias: res.alias || res.nombre || 'PROVEEDOR MARKETPLACE',
                                                            qr_bob: res.qr_bob || res.qr_pago_bob || '',
                                                            qr_usd: res.qr_usd || res.qr_pago_usd || '',
                                                            tigo_money: res.tigo_money || res.tigo_money_numero || '',
                                                            isAdmin: false
                                                        });
                                                        setShowQRSubmodal(true);
                                                    } catch (err) { showToast('Error al obtener datos'); }
                                                } else {
                                                    setProviderInfo({
                                                        alias: currentAjustes?.nombre_plataforma || 'ADMINISTRADOR',
                                                        qr_bob: currentAjustes?.qr_cobro_bob || currentAjustes?.qr_cobro_url || '',
                                                        qr_usd: currentAjustes?.qr_cobro_usd || '',
                                                        tigo_money: currentAjustes?.tigo_money_numero || '',
                                                        isAdmin: true
                                                    });
                                                    setShowQRSubmodal(true);
                                                }
                                            }}
                                            className="btn-secondary"
                                            style={{ width: '100%', marginBottom: '1.25rem', height: '40px', fontSize: '0.75rem', gap: '0.5rem', border: '2px solid #000' }}
                                        >
                                            <ShoppingBag size={16} /> VER QR DE PAGO
                                        </button>
                                    </>
                                );
                            })()}

                            <label style={{ fontWeight: 900, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>COMPROBANTE</label>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => { if (e.target.files?.[0]) setOrderComprobanteFile(e.target.files[0]); }} style={{ display: 'none' }} />
                                    <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--color-primary)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'var(--surface-raised)', height: '100%', justifyContent: 'center' }} className="hover-bright">
                                        {orderComprobanteFile ? <><CheckCircle2 color="var(--color-success)" size={24} /><span style={{ fontSize: '0.7rem', fontWeight: 900 }}>{orderComprobanteFile.name}</span></> : <><UploadCloud size={24} color="var(--text-muted)" /><span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>Subir Imagen</span></>}
                                    </div>
                                </div>
                            </div>
                            
                            <textarea className="input" placeholder="Notas..." value={orderNotes} onChange={e => setOrderNotes(e.target.value)} style={{ fontSize: '0.85rem', minHeight: '80px', marginBottom: '1.5rem' }} />

                            <button className="btn-primary" onClick={handleOrder} disabled={submitting} style={{ width: '100%', height: '55px', fontSize: '1rem', fontWeight: 950, borderRadius: '16px' }}>
                                {submitting ? <Loader2 className="animate-spin" /> : 'ENVIAR PEDIDO'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QR Payment Sub-Modal */}
            <AnimatePresence>
                {showQRSubmodal && providerInfo && (
                    <div className="modal-overlay" onClick={() => setShowQRSubmodal(false)} style={{ zIndex: 10000, background: 'var(--surface-overlay)', backdropFilter: 'blur(10px)' }}>
                        <motion.div className="modal-container"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ 
                                padding: '2rem', maxWidth: '400px', width: '95%', textAlign: 'center',
                                background: 'var(--surface-raised)', borderRadius: '32px', border: 'var(--border-thick)',
                                boxShadow: 'var(--shadow-heavy)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <h3 style={{ fontWeight: 950, fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>DATOS DE PAGO</h3>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '0.05em' }}>{providerInfo.alias.toUpperCase()}</p>
                                </div>
                                <button onClick={() => setShowQRSubmodal(false)} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}><X size={20} /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                                {(providerInfo.qr_bob || providerInfo.qr_pago_bob) ? (
                                    <div style={{ background: '#fff', padding: '0.6rem', borderRadius: '20px', border: '2px solid var(--color-primary)', boxShadow: 'var(--shadow-soft)' }}>
                                        <p style={{ color: '#000', fontSize: '0.6rem', fontWeight: 950, marginBottom: '0.4rem' }}>BOLIVIA (BOB)</p>
                                        <img src={providerInfo.qr_bob || providerInfo.qr_pago_bob} alt="QR BOB" style={{ width: '100%', borderRadius: '12px' }} />
                                    </div>
                                ) : null}
                                {(providerInfo.qr_usd || providerInfo.qr_pago_usd) ? (
                                    <div style={{ background: '#fff', padding: '0.6rem', borderRadius: '20px', border: '2px solid var(--color-primary)', boxShadow: 'var(--shadow-soft)' }}>
                                        <p style={{ color: '#000', fontSize: '0.6rem', fontWeight: 950, marginBottom: '0.4rem' }}>DÓLARES (USD)</p>
                                        <img src={providerInfo.qr_usd || providerInfo.qr_pago_usd} alt="QR USD" style={{ width: '100%', borderRadius: '12px' }} />
                                    </div>
                                ) : null}
                                {(providerInfo.tigo_money || providerInfo.tigo_money_numero) ? (
                                    <div style={{ background: 'var(--surface-base)', padding: '1.25rem', borderRadius: '20px', border: '2px dashed var(--color-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <p style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TIGO MONEY</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-primary)' }}>{providerInfo.tigo_money || providerInfo.tigo_money_numero}</p>
                                    </div>
                                ) : null}

                                {!providerInfo.qr_bob && !providerInfo.qr_usd && !providerInfo.tigo_money && (
                                    <div style={{ gridColumn: '1/-1', padding: '2rem', background: 'rgba(0,0,0,0.05)', borderRadius: '20px', border: '2px dashed var(--color-danger)' }}>
                                        <AlertTriangle color="var(--color-danger)" style={{ margin: '0 auto 0.5rem auto' }} />
                                        <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-danger)' }}>NO SE ENCONTRARON MÉTODOS DE PAGO CONFIGURADOS</p>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setShowQRSubmodal(false)} className="btn-primary" style={{ width: '100%', marginTop: '2rem', height: '55px', borderRadius: '18px', fontWeight: 950 }}>
                                <CheckCircle2 size={18} /> ENTENDIDO, YA ESCANEÉ
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
