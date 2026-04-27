/**
 * Gestión de Marketplace para Proveedores — Ares Redesign v2.5 (Premium Master Hub)
 * PARIDAD 1:1 CON ADMIN PANEL (TABLE SYSTEM)
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store, Plus, Package, Clock, CheckCircle,
    X, AlertCircle, RefreshCw, Send, Key, Zap, Check, MessageCircle,
    User, ShoppingCart, Info, LayoutGrid, Layers, UploadCloud, CheckCircle2,
    Eye, Trash2, Search, Edit2, ShieldAlert, Link, ImageIcon, Download, Lock
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface MarketplaceOrder {
    id: string;
    creado_en: string;
    status: string;
    cantidad: number;
    notas: string | null;
    comprobante_url: string | null;
    respuesta_admin: string | null;
    vendor: {
        nombre: string;
        alias: string;
        telefono: string;
    };
    servicio: {
        id: string;
        nombre: string;
        logo_url: string;
    };
    credenciales: any[];
}

interface MyService {
    id: string;
    nombre: string;
    logo_url: string;
    precio_admin: number;
    categoria: string;
    descripcion_base: string;
    activo: boolean;
    stock: number;
    total_credenciales: number;
    leads: number;
}

interface Credential {
    id: string;
    usuario: string;
    password: string;
    perfil: string | null;
    notas: string | null;
    disponible: boolean;
    creado_en: string;
    servicio: {
        nombre: string;
        logo_url: string;
    };
}

export default function MarketplaceGestionPage() {
    const { vendor } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'SERVICIOS' | 'PEDIDOS'>('SERVICIOS');
    const [toast, setToast] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Data states
    const [myServices, setMyServices] = useState<MyService[]>([]);
    const [orders, setOrders] = useState<MarketplaceOrder[]>([]);

    // Modal/Action states
    const [showProposeModal, setShowProposeModal] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [proposeForm, setProposeForm] = useState({
        nombre: '', descripcion: '', precio_costo: '', icono_url: '', categoria: 'STREAMING', activo: true
    });
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(null);
    const [credForm, setCredForm] = useState({ respuesta_admin: '' });
    const [submittingCred, setSubmittingCred] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);
    const [filter, setFilter] = useState('ALL');

    // Credential Modal states
    const [isCredModalOpen, setIsCredModalOpen] = useState(false);
    const [editingCredId, setEditingCredId] = useState<string | null>(null);
    const [credFormData, setCredFormData] = useState({
        servicio_id: '', usuario: '', password: '', perfil: '', notas: '', disponible: true
    });
    const [credSaving, setCredSaving] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [servicesRes, ordersRes] = await Promise.all([
                api.get('/marketplace/mine'),
                api.get('/marketplace/pedidos')
            ]);
            setMyServices(servicesRes);
            setOrders(ordersRes);
        } catch (err) {
            console.error(err);
            showToast('ERROR AL SINCRONIZAR DATOS ❌');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // --- SERVICE HANDLERS ---
    const handleSaveService = async () => {
        if (!proposeForm.nombre || !proposeForm.precio_costo) return;
        setSubmittingCred(true);
        try {
            const formData = new FormData();
            formData.append('nombre', proposeForm.nombre);
            formData.append('descripcion', proposeForm.descripcion);
            formData.append('precio_costo', proposeForm.precio_costo);
            formData.append('categoria', proposeForm.categoria);
            formData.append('activo', proposeForm.activo.toString());

            if (selectedLogo) {
                formData.append('logo', selectedLogo);
            } else {
                formData.append('icono_url', proposeForm.icono_url);
            }

            if (editingServiceId) {
                await api.request(`/marketplace/service/${editingServiceId}`, {
                    method: 'PUT',
                    body: formData
                });
                showToast('SERVICIO REFORJADO ✅');
            } else {
                await api.request('/marketplace/propose', {
                    method: 'POST',
                    body: formData
                });
                showToast('SERVICIO PUBLICADO ✅');
            }

            setShowProposeModal(false);
            setEditingServiceId(null);
            setProposeForm({ nombre: '', descripcion: '', precio_costo: '', icono_url: '', categoria: 'STREAMING', activo: true });
            setSelectedLogo(null);
            loadData();
        } catch (err: any) {
            showToast(err?.message || 'ERROR EN EL PROTOCOLO ❌');
        } finally {
            setSubmittingCred(false);
        }
    };

    const openEditService = (s: MyService) => {
        setEditingServiceId(s.id);
        setProposeForm({
            nombre: s.nombre,
            descripcion: s.descripcion_base,
            precio_costo: s.precio_admin.toString(),
            icono_url: s.logo_url,
            categoria: s.categoria,
            activo: s.activo
        });
        setShowProposeModal(true);
    };

    const handleDeleteService = async (id: string, name: string) => {
        if (!confirm(`¿DESMANTELAR ${name.toUpperCase()}?`)) return;
        try {
            await api.delete(`/marketplace/service/${id}`);
            showToast('SERVICIO ELIMINADO ✅');
            loadData();
        } catch (err: any) {
            showToast(err?.message || 'ERROR AL ELIMINAR ❌');
        }
    };

    // --- ORDER HANDLERS ---
    const handleStatusUpdate = async (id: string, newStatus: string, respuesta?: string) => {
        setUpdating(id);
        try {
            const body: any = { status: newStatus };
            if (respuesta) body.respuesta_admin = respuesta;
            await api.request(`/marketplace/pedidos/${id}`, {
                method: 'PATCH',
                body
            });
            showToast(`ESTADO: ${newStatus} ✅`);
            await loadData();
        } catch (error) {
            showToast('ERROR DE SINCRONIZACIÓN ❌');
        } finally {
            setUpdating(null);
        }
    };

    const handleFullfill = async () => {
        if (!selectedOrder) return;
        setSubmittingCred(true);
        try {
            await api.post('/marketplace/credenciales', {
                respuesta_admin: credForm.respuesta_admin,
                servicio_id: selectedOrder.servicio.id,
                pedido_id: selectedOrder.id
            });
            showToast('ENTREGA COMPLETADA ✅');
            setSelectedOrder(null);
            setCredForm({ respuesta_admin: '' });
            loadData();
        } catch (err: any) {
            showToast(err?.message || 'ERROR AL ENTREGAR ❌');
        } finally {
            setSubmittingCred(false);
        }
    };

    // --- CREDENTIAL HANDLERS ---
    const handleSaveCred = async (e: React.FormEvent) => {
        e.preventDefault();
        setCredSaving(true);
        try {
            if (editingCredId) {
                await api.request(`/marketplace/credenciales/${editingCredId}`, {
                    method: 'PUT',
                    body: {
                        usuario: credFormData.usuario,
                        password: credFormData.password,
                        perfil: credFormData.perfil,
                        notas: credFormData.notas,
                        disponible: credFormData.disponible
                    }
                });
                showToast('CUENTA ACTUALIZADA ✅');
            } else {
                await api.post('/marketplace/credenciales', {
                    servicio_id: credFormData.servicio_id,
                    email: credFormData.usuario,
                    password: credFormData.password,
                    perfil: credFormData.perfil,
                    notas: credFormData.notas
                });
                showToast('CUENTA AÑADIDA AL INVENTARIO ✅');
            }
            setIsCredModalOpen(false);
            loadData();
        } catch (err: any) {
            showToast(err?.message || 'ERROR AL GUARDAR ❌');
        } finally {
            setCredSaving(false);
        }
    };

    const openCredModal = (cred?: Credential) => {
        if (cred) {
            setEditingCredId(cred.id);
            setCredFormData({
                servicio_id: (cred as any).servicio_id || '',
                usuario: cred.usuario,
                password: cred.password,
                perfil: cred.perfil || '',
                notas: cred.notas || '',
                disponible: cred.disponible
            });
        } else {
            setEditingCredId(null);
            setCredFormData({
                servicio_id: myServices[0]?.id || '',
                usuario: '',
                password: '',
                perfil: '',
                notas: '',
                disponible: true
            });
        }
        setIsCredModalOpen(true);
    };

    const handleDeleteCred = async (id: string) => {
        if (!confirm('¿ELIMINAR ESTA CUENTA DEL INVENTARIO?')) return;
        try {
            await api.delete(`/marketplace/credenciales/${id}`);
            showToast('CUENTA ELIMINADA ✅');
            loadData();
        } catch {
            showToast('ERROR AL ELIMINAR ❌');
        }
    };

    // --- FILTERS ---
    const filteredServices = myServices.filter(s => s.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    const filteredOrders = orders.filter(o =>
        (filter === 'ALL' || o.status === filter) &&
        (o.vendor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.servicio?.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }} className='max-md:px-2 max-sm:p-[0rem] p-[1.5rem]'>

            {/* Header Pro */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }} className='max-md:flex-col  max-sm:flex-col max-sm:items-center gap-8'>
                <div>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }} className=''>
                        <div className='max-md:flex-col'>
                            GESTIÓN <span className="text-gradient-primary">PROVEEDOR</span>
                        </div>
                        <button onClick={loadData} className="btn-secondary" style={{ padding: '0.75rem', borderRadius: '50%' }}>
                            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </h1>
                    <p style={{ fontWeight: 800, opacity: 0.5, color: 'var(--text-muted)' }}>PANEL DE SERVICIOS Y ENTREGAS</p>
                </div>
                <button onClick={() => { setEditingServiceId(null); setShowProposeModal(true); }} className="btn-primary" style={{ padding: '1.25rem 2.5rem' }}>
                    <Plus size={22} /> PROPONER SERVICIO
                </button>
            </div >

            {/* Navigation Tabs (Standardized Style) */}
            < div style={{ display: 'flex', background: 'var(--surface-raised)', padding: '0.5rem', borderRadius: '24px', gap: '0.5rem', border: '3px solid #000', boxShadow: '10px 10px 0px 0px #000', marginBottom: '3rem' }
            } className='max-sm:flex-col '>
                <button
                    onClick={() => setActiveTab('SERVICIOS')}
                    style={{
                        flex: 1, padding: '1.25rem', borderRadius: '18px', fontWeight: 900,
                        background: activeTab === 'SERVICIOS' ? 'var(--color-primary)' : 'transparent',
                        color: activeTab === 'SERVICIOS' ? 'var(--text-inverse)' : 'var(--text-muted)',
                        border: activeTab === 'SERVICIOS' ? '3px solid #000' : 'none',
                        transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                    }}
                >
                    <Layers size={20} /> MIS SERVICIOS ({myServices.length})
                </button>
                <button
                    onClick={() => setActiveTab('PEDIDOS')}
                    style={{
                        flex: 1, padding: '1.25rem', borderRadius: '18px', fontWeight: 900,
                        background: activeTab === 'PEDIDOS' ? 'var(--color-primary)' : 'transparent',
                        color: activeTab === 'PEDIDOS' ? 'var(--text-inverse)' : 'var(--text-muted)',
                        border: activeTab === 'PEDIDOS' ? '3px solid #000' : 'none',
                        transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                    }}
                >
                    <ShoppingCart size={20} /> PEDIDOS RECIBIDOS ({orders.filter(o => o.status === 'PENDIENTE').length})
                </button>
            </div >

            {/* Search & Internal Filters */}
            < div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', alignItems: 'center' }} className='max-sm:flex-col'>
                <div style={{ position: 'relative', flex: 1 }} >
                    <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input" placeholder="Buscar por nombre, usuario, servicio..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '4rem', height: '64px' }} />
                </div>
                {
                    activeTab === 'PEDIDOS' && (
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-raised)', padding: '0.4rem', borderRadius: '16px', border: '2px solid #000' }} className='max-sm:overflow-x-scroll max-sm:max-w-full'>
                            {['ALL', 'PENDIENTE', 'EN_PROCESO', 'COMPLETADO'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setFilter(st)}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900,
                                        background: filter === st ? 'var(--color-primary)' : 'transparent',
                                        color: filter === st ? 'var(--text-inverse)' : 'var(--text-muted)',
                                        transition: '0.2s'
                                    }}
                                >
                                    {st === 'ALL' ? 'TODO' : st}
                                </button>
                            ))}
                        </div>
                    )
                }
            </div >

            {/* Main Content Area (TABLES) */}
            {
                loading ? (
                    <div style={{ textAlign: 'center', padding: '10rem' }}><RefreshCw className="animate-spin" size={48} color="var(--color-primary)" /></div>
                ) : (
                    <div className="table-container  max-md:-ml-12 w-[113%] max-sm:w-[110%] max-sm:-ml-4 ">
                        <table className="table  max-sm:rounded-none">
                            {activeTab === 'SERVICIOS' && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Servicio / Categoría</th>
                                            <th>Costo Entrega</th>
                                            <th>Leads (Clicks)</th>
                                            <th>Stock Disp.</th>
                                            <th>Estado</th>
                                            <th style={{ textAlign: 'center' }}>Gestión</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence mode="popLayout">
                                            {filteredServices.map((s, i) => (
                                                <motion.tr key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'white', padding: '0.4rem', border: '3px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {s.logo_url ? <img src={s.logo_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <Package size={24} color="#000" style={{ opacity: 0.2 }} />}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 950, fontSize: '1rem' }}>{s.nombre}</div>
                                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>{s.categoria}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-primary)' }}>Bs {s.precio_admin}</td>
                                                    <td style={{ fontSize: '1.1rem', fontWeight: 900, textAlign: 'center' }}>{s.leads || 0}</td>
                                                    <td style={{ fontSize: '1.1rem', fontWeight: 900, textAlign: 'center', color: (s.stock || 0) > 0 ? '#10B981' : 'var(--color-danger)' }}>{s.stock || 0}</td>
                                                    <td><div className={`chip ${s.activo ? 'chip-active' : 'chip-danger'}`}>{s.activo ? 'ACTIVO' : 'PAUSADO'}</div></td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                                            <button onClick={() => openEditService(s)} className="btn-secondary" style={{ padding: '0.5rem', background: 'transparent', border: 'none', boxShadow: 'none' }}><Edit2 size={20} color="var(--color-primary)" /></button>
                                                            <button onClick={() => handleDeleteService(s.id, s.nombre)} className="btn-secondary" style={{ padding: '0.5rem', background: 'transparent', border: 'none', boxShadow: 'none', color: 'var(--color-danger)' }}><Trash2 size={20} /></button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </>
                            )}

                            {activeTab === 'PEDIDOS' && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Estado</th>
                                            <th>Comprador (Vendor)</th>
                                            <th>Solicitud</th>
                                            <th>Comprobante</th>
                                            <th>Fecha</th>
                                            <th style={{ textAlign: 'center' }}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence mode="popLayout">
                                            {filteredOrders.map((o, i) => (
                                                <motion.tr key={o.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                                    <td>
                                                        <div className={`chip ${o.status === 'PENDIENTE' ? 'chip-gold' : o.status === 'EN_PROCESO' ? 'chip-blue' : 'chip-active'}`}>
                                                            {o.status}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 900 }}>{o.vendor.nombre}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>@{o.vendor.alias}</div>
                                                    </td>
                                                    <td style={{ maxWidth: '250px' }}>
                                                        <div style={{ fontWeight: 900, fontSize: '0.85rem' }}>{o.servicio?.nombre} (x{o.cantidad})</div>
                                                        <div style={{ fontSize: '0.75rem', opacity: 0.6, fontStyle: 'italic' }}>"{o.notas || 'Sin notas'}"</div>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {o.comprobante_url ? (
                                                            <a href={o.comprobante_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', width: '50px', height: '50px', border: '2.5px solid #000', borderRadius: '8px', overflow: 'hidden' }}>
                                                                <img src={o.comprobante_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </a>
                                                        ) : <span style={{ opacity: 0.3 }}>N/A</span>}
                                                    </td>
                                                    <td style={{ fontSize: '0.75rem', opacity: 0.5 }}>{new Date(o.creado_en).toLocaleString()}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                            {updating === o.id ? <RefreshCw className="animate-spin" size={20} /> : (
                                                                <>
                                                                    {o.status === 'PENDIENTE' && (
                                                                        <button onClick={() => handleStatusUpdate(o.id, 'EN_PROCESO')} className="btn-primary" style={{ padding: '0.5rem', borderRadius: '10px', boxShadow: 'none' }} title="Procesar"><Zap size={18} /></button>
                                                                    )}
                                                                    {o.status === 'EN_PROCESO' && (
                                                                        <button onClick={() => { setSelectedOrder(o); setCredForm({ respuesta_admin: '' }); }} className="btn-primary" style={{ padding: '0.5rem', borderRadius: '10px', background: '#22C55E', boxShadow: 'none' }} title="Entregar"><Check size={20} /></button>
                                                                    )}
                                                                    {(o.status === 'PENDIENTE' || o.status === 'EN_PROCESO') && (
                                                                        <button onClick={() => handleStatusUpdate(o.id, 'CANCELADO')} className="btn-secondary" style={{ padding: '0.5rem', background: 'transparent', boxShadow: 'none', color: 'var(--color-danger)' }} title="Cancelar"><X size={20} /></button>
                                                                    )}
                                                                    {o.status === 'COMPLETADO' && <CheckCircle2 size={24} color="#22C55E" />}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </>
                            )}

                            {/* CREDENCIALES tab logic removed as per user feedback */}
                        </table>
                        {!loading && ((activeTab === 'SERVICIOS' && filteredServices.length === 0) || (activeTab === 'PEDIDOS' && filteredOrders.length === 0)) && (
                            <div style={{ padding: '5rem', textAlign: 'center', opacity: 0.4, fontWeight: 900 }}>NO SE ENCONTRARON REGISTROS EN ESTA MATRIZ</div>
                        )}
                    </div>
                )
            }

            {/* MODAL: PROPONER / EDITAR SERVICIO */}
            <AnimatePresence>
                {showProposeModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-container" style={{ maxWidth: '700px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{editingServiceId ? 'REFORJAR' : 'PUBLICAR'} <br /><span className="text-gradient-primary">SERVICIO</span></h2>
                                <button onClick={() => setShowProposeModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}><X size={40} /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label className="input-label">Nombre del Servicio</label>
                                    <input className="input" value={proposeForm.nombre} onChange={e => setProposeForm({ ...proposeForm, nombre: e.target.value })} required placeholder="Ej: Disney+ Premium" />
                                </div>
                                <div>
                                    <label className="input-label">Costo de Entrega (Bs)</label>
                                    <input className="input" type="number" value={proposeForm.precio_costo} onChange={e => setProposeForm({ ...proposeForm, precio_costo: e.target.value })} required placeholder="0.00" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label className="input-label">Categoría</label>
                                        <select className="input" value={proposeForm.categoria} onChange={e => setProposeForm({ ...proposeForm, categoria: e.target.value })}>
                                            <option value="STREAMING">STREAMING</option>
                                            <option value="APPS">APLICACIONES</option>
                                            <option value="GAMES">JUEGOS</option>
                                            <option value="OTHER">OTROS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="input-label">URL del Logo (Opcional)</label>
                                        <input className="input" placeholder="https://..." value={proposeForm.icono_url} onChange={e => setProposeForm({ ...proposeForm, icono_url: e.target.value })} />
                                    </div>
                                </div>
                                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px dashed var(--color-primary)' }} onClick={() => logoInputRef.current?.click()}>
                                    <input type="file" ref={logoInputRef} hidden onChange={e => setSelectedLogo(e.target.files?.[0] || null)} />
                                    {selectedLogo ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <ImageIcon size={32} color="var(--color-primary)" />
                                            <p style={{ fontSize: '0.65rem', fontWeight: 900, marginTop: '0.5rem' }}>{selectedLogo.name.toUpperCase()}</p>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', opacity: 0.5 }}>
                                            <UploadCloud size={32} />
                                            <p style={{ fontSize: '0.65rem', fontWeight: 900, marginTop: '0.5rem' }}>SUBIR LOGO LOCAL</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="input-label">Descripción Técnica</label>
                                <textarea className="input" rows={3} value={proposeForm.descripcion} onChange={e => setProposeForm({ ...proposeForm, descripcion: e.target.value })} placeholder="Detalles del plan, duración, etc..." />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-raised)', padding: '1.25rem', borderRadius: '18px', border: '2.5px solid #000', marginBottom: '2rem' }}>
                                <span style={{ fontWeight: 900 }}>ESTADO DISPONIBLE</span>
                                <label className="switch">
                                    <input type="checkbox" checked={proposeForm.activo} onChange={e => setProposeForm({ ...proposeForm, activo: e.target.checked })} />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <button onClick={handleSaveService} disabled={submittingCred} className="btn-primary" style={{ width: '100%', height: '70px' }}>
                                {submittingCred ? <RefreshCw className="animate-spin" /> : (editingServiceId ? 'REFORJAR SERVICIO' : 'PUBLICAR SERVICIO')}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: FULLFILL ORDER */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="modal-overlay">
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-container" style={{ maxWidth: '600px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>ENTREGAR <br /><span className="text-gradient-primary">CREDENCIALES</span></h2>
                                <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)' }}><X size={32} /></button>
                            </div>

                            <div className="card" style={{ background: 'var(--surface-raised)', marginBottom: '2rem', padding: '1.5rem' }}>
                                <div style={{ fontWeight: 900, color: 'var(--color-primary)' }}>PEDIDO: {selectedOrder.servicio?.nombre}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>COMPRADOR: {selectedOrder.vendor.nombre} (@{selectedOrder.vendor.alias})</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.5rem' }}>NOTA CLIENTE: "{selectedOrder.notas || 'Ninguna'}"</div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label className="input-label">Respuesta(Credenciales + Instrucciones)</label>
                                <textarea
                                    className="input"
                                    rows={8}
                                    placeholder={"Ej: Usuario: netflix_user@mail.com\nPassword: abc123\nPerfil: PIN 4422\nInstrucciones: No cambiar idioma."}
                                    value={credForm.respuesta_admin}
                                    onChange={e => setCredForm({ respuesta_admin: e.target.value })}
                                    style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                                />
                            </div>

                            <button onClick={handleFullfill} disabled={submittingCred} className="btn-primary" style={{ width: '100%', height: '70px', background: '#22C55E' }}>
                                {submittingCred ? <RefreshCw className="animate-spin" /> : 'COMPLETAR Y NOTIFICAR'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: INVENTORY CREDENTIALS */}
            <AnimatePresence>
                {isCredModalOpen && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-container" style={{ maxWidth: '600px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>{editingCredId ? 'EDITAR' : 'NUEVA'} <br /><span className="text-gradient-primary">CUENTA EN STOCK</span></h2>
                                <button onClick={() => setIsCredModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)' }}><X size={32} /></button>
                            </div>

                            <form onSubmit={handleSaveCred} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {!editingCredId && (
                                    <div>
                                        <label className="input-label">Servicio Vinculado</label>
                                        <select className="input" value={credFormData.servicio_id} onChange={e => setCredFormData({ ...credFormData, servicio_id: e.target.value })} required>
                                            <option value="">Selecciona un servicio...</option>
                                            {myServices.map(s => <option key={s.id} value={s.id}>{s.nombre.toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label className="input-label">Usuario / Email</label>
                                        <input className="input" value={credFormData.usuario} onChange={e => setCredFormData({ ...credFormData, usuario: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="input-label">Password</label>
                                        <input className="input" value={credFormData.password} onChange={e => setCredFormData({ ...credFormData, password: e.target.value })} required />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label className="input-label">Perfil (Opcional)</label>
                                        <input className="input" value={credFormData.perfil} onChange={e => setCredFormData({ ...credFormData, perfil: e.target.value })} placeholder="Ej: PIN 1 / Perfil 2" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-raised)', padding: '0.75rem 1.25rem', borderRadius: '18px', border: '2.5px solid #000', width: '100%' }}>
                                            <span style={{ fontWeight: 900, fontSize: '0.8rem' }}>EN STOCK</span>
                                            <label className="switch" style={{ scale: '0.8' }}>
                                                <input type="checkbox" checked={credFormData.disponible} onChange={e => setCredFormData({ ...credFormData, disponible: e.target.checked })} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">Notas Internas</label>
                                    <input className="input" value={credFormData.notas} onChange={e => setCredFormData({ ...credFormData, notas: e.target.value })} placeholder="Algún recordatorio para ti..." />
                                </div>

                                <button type="submit" disabled={credSaving} className="btn-primary" style={{ width: '100%', height: '70px', marginTop: '1rem' }}>
                                    {credSaving ? <RefreshCw className="animate-spin" /> : (editingCredId ? 'ACTUALIZAR CUENTA' : 'AÑADIR A INVENTARIO')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast System */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ position: 'fixed', bottom: '120px', left: '50%', transform: 'translateX(-50%)', zIndex: 5000, background: '#000', color: '#fff', padding: '1rem 2rem', borderRadius: '20px', border: '2.5px solid var(--color-primary)', fontWeight: 900, boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckCircle size={20} color="var(--color-primary)" />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
