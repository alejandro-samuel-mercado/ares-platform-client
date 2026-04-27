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
    ShoppingBag, Hash, UploadCloud, AlertTriangle,
    Plus, Minus,
    Trash2,
    Edit3, QrCode
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
                <div className="grid grid-cols-1 max-md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
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
                                    border: '2px solid rgba(var(--ambient-1-rgb, 120, 72, 18), 0.5)',
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.05)',
                                                borderRadius: '12px', padding: '0.2rem 0.4rem', border: '1px solid rgba(0,0,0,0.05)'
                                            }}>
                                                <button
                                                    onClick={() => {
                                                        const current = parseFloat(editingPrice[ms.id] || ms.precio_venta.toString());
                                                        setEditingPrice({ ...editingPrice, [ms.id]: Math.max(0, current - 1).toString() });
                                                    }}
                                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <Minus size={14} />
                                                </button>

                                                <input
                                                    type="number"
                                                    value={editingPrice[ms.id] !== undefined ? editingPrice[ms.id] : ms.precio_venta}
                                                    onChange={(e) => setEditingPrice({ ...editingPrice, [ms.id]: e.target.value })}
                                                    style={{
                                                        width: '30px', border: 'none', textAlign: 'center',
                                                        color: 'var(--color-primary)', fontWeight: 950, fontSize: '1.1rem', outline: 'none',
                                                        background: 'transparent', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'textfield'
                                                    }}
                                                    placeholder="0.00"
                                                />

                                                <button
                                                    onClick={() => {
                                                        const current = parseFloat(editingPrice[ms.id] || ms.precio_venta.toString());
                                                        setEditingPrice({ ...editingPrice, [ms.id]: (current + 1).toString() });
                                                    }}
                                                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
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

            {/* Details Modal - EDGE TO EDGE */}
            <AnimatePresence>
                {showDetailsModal && (() => {
                    const svc = misServicios.find(ms => ms.servicio.id === showDetailsModal)?.servicio;
                    if (!svc) return null;
                    const svcCreds = getServiceCredentials(svc.id);
                    const svcPedidos = getServicePedidos(svc.id);
                    const entregaMaestra = svcPedidos.filter(p => p.status === 'COMPLETADO' && p.respuesta_admin);

                    return (
                        <div className="modal-overlay" style={{ zIndex: 1000, background: 'var(--surface-overlay)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDetailsModal(null)}>
                            <motion.div className="modal-container" onClick={e => e.stopPropagation()} initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
                                style={{ maxWidth: '520px', width: '95%', background: 'var(--surface-raised)', borderRadius: '24px', border: 'var(--border-thick)', boxShadow: 'var(--shadow-heavy)', overflow: 'hidden', padding: 0 }}>

                                {/* Header - Edge to Edge */}
                                <div style={{ padding: '0.75rem 1rem', borderBottom: 'var(--border-thick)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '3px', background: '#fff', borderRadius: '6px', border: '2px solid #000' }}>
                                            <img src={svc.logo_url} style={{ width: '28px', height: '28px', objectFit: 'cover' }} />
                                        </div>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>{svc.nombre.toUpperCase()}</h2>
                                    </div>
                                    <button onClick={() => setShowDetailsModal(null)} style={{ background: 'var(--surface-base)', border: 'var(--border-thick)', borderRadius: '8px', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><X size={18} /></button>
                                </div>

                                {/* Tabs - Integrated */}
                                <div style={{ padding: '0 1rem', background: 'var(--surface-base)', display: 'flex', gap: '1.25rem', borderBottom: 'var(--border-thick)' }}>
                                    {['credenciales', 'pedidos'].map(tab => (
                                        <button key={tab} onClick={() => setDetailsTab(tab as any)} style={{
                                            background: 'none', border: 'none', cursor: 'pointer', padding: '0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            color: detailsTab === tab ? 'var(--color-primary)' : 'var(--text-muted)', fontWeight: 950, fontSize: '0.85rem', position: 'relative'
                                        }}>
                                            {tab === 'credenciales' ? <Key size={18} /> : <Clock size={18} />}
                                            {tab === 'credenciales' ? 'CUENTAS ACTIVAS' : 'HISTORIAL'}
                                            {detailsTab === tab && <motion.div layoutId="tab-underline" style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: '4px', background: 'var(--color-primary)', borderRadius: '2px 2px 0 0' }} />}
                                        </button>
                                    ))}
                                </div>

                                {/* Scroll Content - Optimized Padding */}
                                <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.75rem' }} className="custom-scroll">
                                    {detailsTab === 'credenciales' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {entregaMaestra.length > 0 ? (
                                                entregaMaestra.map(p => (
                                                    <div key={p.id} style={{ background: 'var(--surface-base)', borderRadius: '16px', padding: '0.75rem', border: 'var(--border-thick)', position: 'relative', overflow: 'hidden' }}>
                                                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.2rem 0.6rem', background: 'var(--color-primary)', color: '#fff', fontSize: '0.6rem', fontWeight: 950, borderBottomLeftRadius: '10px' }}>AUTO-ENTREGA</div>
                                                        <div style={{ marginBottom: '0.6rem' }}>
                                                            <span style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-primary)' }}>ID #{p.id.slice(-6)}</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: 1.3, background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            {p.respuesta_admin}
                                                        </div>
                                                        <button onClick={() => handleCopy(p.respuesta_admin!)} style={{ marginTop: '0.5rem', width: '100%', height: '32px', background: 'var(--surface-raised)', border: 'var(--border-thin)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 950 }}>
                                                            <Copy size={14} /> COPIAR CREDENCIALES
                                                        </button>
                                                    </div>
                                                ))
                                            ) : svcCreds.map(cred => (
                                                <div key={cred.id} style={{ background: 'var(--surface-base)', borderRadius: '14px', padding: '0.6rem', border: 'var(--border-thick)', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                                                    <div style={{ overflow: 'hidden' }}>
                                                        <p style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--text-muted)', marginBottom: '0.1rem' }}>USUARIO</p>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 950, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{cred.usuario}</div>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--text-muted)', marginBottom: '0.1rem' }}>CONTRASEÑA</p>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 950, fontFamily: 'monospace' }}>{revealedPasswords.has(cred.id) ? cred.password : '••••••••'}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                        <button onClick={() => togglePassword(cred.id)} style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>{revealedPasswords.has(cred.id) ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                                        <button onClick={() => handleCopy(cred.usuario)} style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}><Copy size={16} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {entregaMaestra.length === 0 && svcCreds.length === 0 && (
                                                <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.3 }}>
                                                    <Key size={48} style={{ margin: '0 auto 1rem' }} />
                                                    <p style={{ fontWeight: 950, fontSize: '0.9rem' }}>SIN CUENTAS ASIGNADAS</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {svcPedidos.map(p => (
                                                <div key={p.id} style={{ background: 'var(--surface-base)', borderRadius: '12px', padding: '0.5rem 0.75rem', border: 'var(--border-thin)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ textAlign: 'center', background: 'rgba(var(--color-primary-rgb), 0.1)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--color-primary)' }}>
                                                            <span style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--color-primary)' }}>{p.cantidad}</span>
                                                            <span style={{ fontSize: '0.5rem', fontWeight: 950, color: 'var(--color-primary)', display: 'block', marginTop: '-2px' }}>UNITS</span>
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '0.8rem', fontWeight: 950, margin: 0 }}>ID #{p.id.slice(-6)}</p>
                                                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', margin: 0 }}>{new Date(p.creado_en).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                        {getStatusBadge(p.status)}
                                                        {p.comprobante_url && <a href={p.comprobante_url} target="_blank" style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><Eye size={16} /></a>}
                                                    </div>
                                                </div>
                                            ))}
                                            {svcPedidos.length === 0 && (
                                                <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.3 }}>
                                                    <Clock size={48} style={{ margin: '0 auto 1rem' }} />
                                                    <p style={{ fontWeight: 950, fontSize: '0.9rem' }}>HISTORIAL VACÍO</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer - Edge to Edge */}
                                <div style={{ padding: '0.75rem', borderTop: 'var(--border-thick)', display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.1)' }}>
                                    <button onClick={() => setShowDetailsModal(null)} className="btn-secondary" style={{ flex: 1, height: '44px', fontSize: '0.85rem', fontWeight: 950, borderRadius: '12px', margin: "0 auto" }}>CERRAR</button>
                                    <button onClick={() => { setShowDetailsModal(null); setSelectedService(svc.id); setShowOrderModal(true); }} className="btn-primary" style={{ flex: 1.5, height: '44px', fontSize: '0.9rem', fontWeight: 950, borderRadius: '12px', boxShadow: 'var(--shadow-glow)', margin: "0 auto" }}>NUEVO PEDIDO</button>
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>

            {/* Nuevo Pedido Modal - EDGE TO EDGE */}
            <AnimatePresence>
                {showOrderModal && (
                    <div className="modal-overlay" onClick={() => setShowOrderModal(false)} style={{ zIndex: 1000, background: 'var(--surface-overlay)', backdropFilter: 'blur(12px)' }}>
                        <motion.div className="modal-container" onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            style={{ maxWidth: '440px', width: '95%', background: 'var(--surface-raised)', borderRadius: '28px', border: 'var(--border-thick)', boxShadow: 'var(--shadow-heavy)', overflow: 'hidden', padding: 0 }}>

                            <div style={{ padding: '0.75rem 1rem', borderBottom: 'var(--border-thick)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                                <h3 style={{ fontWeight: 950, fontSize: '1.1rem', margin: 0, letterSpacing: '-0.03em' }}>PROCESAR PEDIDO</h3>
                                <button onClick={() => setShowOrderModal(false)} style={{ background: 'var(--surface-base)', border: 'var(--border-thick)', borderRadius: '8px', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><X size={20} /></button>
                            </div>

                            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                {(() => {
                                    const svcData = misServicios.find(ms => ms.servicio_id === selectedService)?.servicio;
                                    const total = orderQuantity * (svcData?.precio_admin || 0);

                                    return (
                                        <>
                                            <div style={{ background: 'var(--surface-base)', borderRadius: '16px', padding: '0.75rem', border: 'var(--border-thick)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                <div style={{ padding: '4px', background: '#fff', borderRadius: '8px', border: '2px solid #000' }}>
                                                    <img src={svcData?.logo_url} style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-primary)', margin: 0, letterSpacing: '0.05em' }}>PRODUCTO</p>
                                                    <div style={{ fontWeight: 950, fontSize: '1rem' }}>{svcData?.nombre.toUpperCase()}</div>
                                                </div>
                                                <button onClick={() => setSelectedService(null)} className="btn-secondary" style={{ width: '36px', height: '36px', borderRadius: '10px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit3 size={18} /></button>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                                                <div style={{ background: 'var(--surface-base)', borderRadius: '18px', border: 'var(--border-thick)', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} style={{ width: '38px', height: '38px', background: 'var(--surface-raised)', border: '2px solid #000', borderRadius: '10px', fontWeight: 950, fontSize: '1.4rem' }}>-</button>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ fontWeight: 950, fontSize: '1.4rem', lineHeight: 1, color: 'var(--color-primary)' }}>{orderQuantity}</div>
                                                        <div style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.5 }}>CANTIDAD</div>
                                                    </div>
                                                    <button onClick={() => setOrderQuantity(orderQuantity + 1)} style={{ width: '38px', height: '38px', background: 'var(--surface-raised)', border: '2px solid #000', borderRadius: '10px', fontWeight: 950, fontSize: '1.4rem' }}>+</button>
                                                </div>
                                                <div style={{ background: 'var(--color-primary)', borderRadius: '18px', border: 'var(--border-thick)', padding: '0.5rem', textAlign: 'center', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)' }}>
                                                    <div style={{ fontSize: '0.55rem', fontWeight: 950, opacity: 0.9, letterSpacing: '0.05em' }}>TOTAL NETO</div>
                                                    <div style={{ fontWeight: 950, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>Bs {total.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            <button onClick={async () => {
                                                const provId = svcData?.proveedor_id || (svcData as any)?.proveedorId;
                                                const currentAjustes = ajustesPlat || await api.get('/ajustes-publicos').catch(() => null);
                                                if (provId && provId !== 'null' && String(provId).length > 5) {
                                                    try {
                                                        const res = await api.get(`/marketplace/proveedor/${provId}/pagos`);
                                                        setProviderInfo({ alias: res.alias || res.nombre || 'PROVEEDOR', qr_bob: res.qr_bob || '', qr_usd: res.qr_usd || '', tigo_money: res.tigo_money || '', isAdmin: false });
                                                        setShowQRSubmodal(true);
                                                    } catch (err) { showToast('Error al obtener datos'); }
                                                } else {
                                                    setProviderInfo({ alias: currentAjustes?.nombre_plataforma || 'ADMIN', qr_bob: currentAjustes?.qr_cobro_bob || '', qr_usd: currentAjustes?.qr_cobro_usd || '', tigo_money: currentAjustes?.tigo_money_numero || '', isAdmin: true });
                                                    setShowQRSubmodal(true);
                                                }
                                            }} style={{ height: '42px', background: 'rgba(var(--color-primary-rgb), 0.08)', border: '2px dashed var(--color-primary)', borderRadius: '12px', color: 'var(--color-primary)', fontWeight: 950, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                <QrCode size={18} /> VER MÉTODOS DE PAGO / QR
                                            </button>

                                            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.75rem' }}>
                                                <button onClick={() => fileInputRef.current?.click()} style={{ background: 'var(--surface-base)', border: 'var(--border-thick)', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', cursor: 'pointer', height: '64px', transition: '0.2s' }}>
                                                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => { if (e.target.files?.[0]) setOrderComprobanteFile(e.target.files[0]); }} style={{ display: 'none' }} />
                                                    {orderComprobanteFile ? <CheckCircle2 size={24} color="var(--color-success)" /> : <UploadCloud size={24} color="var(--color-primary)" />}
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 950 }}>{orderComprobanteFile ? 'LISTO' : 'SUBIR QR'}</span>
                                                </button>
                                                <textarea className="input" placeholder="Referencia, correos o notas adicionales..." value={orderNotes} onChange={e => setOrderNotes(e.target.value)} style={{ fontSize: '0.9rem', height: '64px', border: 'var(--border-thick)', borderRadius: '18px', padding: '0.6rem 0.8rem', background: 'var(--surface-base)', margin: 0, boxShadow: 'none' }} />
                                            </div>

                                            <button className="btn-primary" onClick={handleOrder} disabled={submitting} style={{ width: '100%', height: '56px', fontSize: '1.1rem', fontWeight: 950, borderRadius: '20px', boxShadow: 'var(--shadow-glow)', marginTop: '0.4rem', border: '2px solid #000' }}>
                                                {submitting ? <Loader2 className="animate-spin" /> : 'CONFIRMAR Y ENVIAR'}
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QR Payment Sub-Modal - EDGE TO EDGE */}
            <AnimatePresence>
                {showQRSubmodal && providerInfo && (
                    <div className="modal-overlay" onClick={() => setShowQRSubmodal(false)} style={{ zIndex: 10000, background: 'var(--surface-overlay)', backdropFilter: 'blur(12px)' }}>
                        <motion.div className="modal-container" onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            style={{ padding: 0, maxWidth: '380px', width: '95%', textAlign: 'center', background: 'var(--surface-raised)', borderRadius: '28px', border: 'var(--border-thick)', boxShadow: 'var(--shadow-heavy)', overflow: 'hidden' }}>

                            <div style={{ padding: '0.75rem 1rem', borderBottom: 'var(--border-thick)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <h4 style={{ fontWeight: 950, fontSize: '1rem', margin: 0, color: '#fff' }}>MÉTODOS DE PAGO</h4>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)' }}>{providerInfo.alias.toUpperCase()}</span>
                                </div>
                                <button onClick={() => setShowQRSubmodal(false)} style={{ background: 'var(--surface-base)', border: 'var(--border-thick)', borderRadius: '50%', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                            </div>

                            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {(providerInfo.qr_bob || providerInfo.qr_pago_bob) && (
                                    <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '20px', border: 'var(--border-thick)' }}>
                                        <p style={{ color: '#000', fontSize: '0.75rem', fontWeight: 950, marginBottom: '0.4rem', background: '#f0f0f0', display: 'inline-block', padding: '2px 10px', borderRadius: '6px' }}>QR PARA BOLIVIA (BOB)</p>
                                        <img src={providerInfo.qr_bob || providerInfo.qr_pago_bob} style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }} />
                                    </div>
                                )}
                                {(providerInfo.tigo_money || providerInfo.tigo_money_numero) && (
                                    <div style={{ background: 'var(--surface-base)', padding: '1rem', borderRadius: '20px', border: '2px dashed var(--color-primary)' }}>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>TIGO MONEY</p>
                                        <p style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>{providerInfo.tigo_money || providerInfo.tigo_money_numero}</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '1rem', borderTop: 'var(--border-thick)', background: 'rgba(0,0,0,0.05)' }}>
                                <button onClick={() => setShowQRSubmodal(false)} className="btn-primary" style={{ width: '100%', height: '48px', borderRadius: '16px', fontSize: '1rem', fontWeight: 950 }}>
                                    ENTENDIDO
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

