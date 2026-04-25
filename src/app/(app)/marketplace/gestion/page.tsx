/**
 * Gestión de Marketplace para Proveedores — Ares Redesign v2
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Store, Plus, Package, Clock, CheckCircle, 
    X, AlertCircle, RefreshCw, Send, Key, 
    User, ShoppingCart, Info, LayoutGrid, Layers
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface MarketplaceOrder {
    id: string;
    creado_en: string;
    status: string;
    cantidad: number;
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
    _count: {
        credenciales: number;
        clicks: number;
    };
}

export default function MarketplaceGestionPage() {
    const { vendor } = useAuth();
    const [myServices, setMyServices] = useState<MyService[]>([]);
    const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showProposeModal, setShowProposeModal] = useState(false);
    const [proposeForm, setProposeForm] = useState({
        nombre: '', descripcion: '', precio_costo: '', icono_url: '', categoria: 'STREAMING'
    });
    const [proposing, setProposing] = useState(false);
    
    const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(null);
    const [credForm, setCredForm] = useState({ email: '', password: '', perfil: '', notas: '' });
    const [submittingCred, setSubmittingCred] = useState(false);
    
    const [activeTab, setActiveTab] = useState<'SERVICIOS' | 'PEDIDOS'>('SERVICIOS');
    const [toast, setToast] = useState('');

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handlePropose = async () => {
        setProposing(true);
        try {
            await api.post('/marketplace/propose', proposeForm);
            showToast('SERVICIO PUBLICADO EXITOSAMENTE ✅');
            setShowProposeModal(false);
            setProposeForm({ nombre: '', descripcion: '', precio_costo: '', icono_url: '', categoria: 'STREAMING' });
            loadData();
        } catch (err: any) {
            showToast(err?.message || 'ERROR AL PUBLICAR ❌');
        } finally {
            setProposing(false);
        }
    };

    const handleFullfill = async () => {
        if (!selectedOrder) return;
        setSubmittingCred(true);
        try {
            await api.post('/marketplace/credenciales', {
                ...credForm,
                servicio_id: selectedOrder.servicio.id,
                pedido_id: selectedOrder.id
            });
            showToast('CREDENCIALES ENVIADAS ✅');
            setSelectedOrder(null);
            setCredForm({ email: '', password: '', perfil: '', notas: '' });
            loadData();
        } catch (err: any) {
            showToast(err?.message || 'ERROR AL ENVIAR ❌');
        } finally {
            setSubmittingCred(false);
        }
    };

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Header Animado */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', lineHeight: 1 }}>
                        <Store color="var(--color-primary)" size={28} />
                        MI <span className="text-gradient-primary">MARKETPLACE</span>
                    </h1>
                    <p style={{ fontWeight: 800, fontSize: '0.8rem', opacity: 0.6, marginTop: '0.4rem' }}>
                        GESTIÓN DE TUS SERVICIOS Y PEDIDOS COMO PROVEEDOR
                    </p>
                </div>
                <button onClick={() => setShowProposeModal(true)} className="btn-primary" style={{ height: '50px' }}>
                    <Plus size={20} /> PROPONER
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', background: 'var(--surface-raised)', padding: '0.5rem', borderRadius: '20px', gap: '0.5rem', border: '2.5px solid #000', boxShadow: '6px 6px 0px 0px #000' }}>
                <button 
                    onClick={() => setActiveTab('SERVICIOS')}
                    style={{
                        flex: 1, padding: '1rem', borderRadius: '14px', fontWeight: 900,
                        background: activeTab === 'SERVICIOS' ? 'var(--color-primary)' : 'transparent',
                        color: activeTab === 'SERVICIOS' ? '#000' : 'var(--text-muted)',
                        border: activeTab === 'SERVICIOS' ? '2.5px solid #000' : 'none',
                        transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                >
                    <Layers size={18} /> MIS SERVICIOS ({myServices.length})
                </button>
                <button 
                    onClick={() => setActiveTab('PEDIDOS')}
                    style={{
                        flex: 1, padding: '1rem', borderRadius: '14px', fontWeight: 900,
                        background: activeTab === 'PEDIDOS' ? 'var(--color-primary)' : 'transparent',
                        color: activeTab === 'PEDIDOS' ? '#000' : 'var(--text-muted)',
                        border: activeTab === 'PEDIDOS' ? '2.5px solid #000' : 'none',
                        transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                >
                    <ShoppingCart size={18} /> PEDIDOS ({orders.filter(o => o.status === 'PENDIENTE').length})
                </button>
            </div>

            {/* Grid de Contenido */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem' }}>
                        <RefreshCw className="animate-spin" size={48} color="var(--color-primary)" style={{ margin: '0 auto' }} />
                        <p style={{ fontWeight: 900, marginTop: '1rem' }}>SINCRONIZANDO MARKETPLACE...</p>
                    </div>
                ) : activeTab === 'SERVICIOS' ? (
                    myServices.map((s, i) => (
                        <motion.div 
                            key={s.id} 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.1 }}
                            className="card card-hover"
                            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '60px', height: '60px', borderRadius: '16px', background: '#fff', 
                                    border: '2px solid #000', padding: '0.5rem', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                }}>
                                    {s.logo_url ? <img src={s.logo_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <Package />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontWeight: 900, fontSize: '1.1rem' }}>{s.nombre}</h3>
                                    <div className="chip chip-blue" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>{s.categoria}</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: 'rgba(0,0,0,0.05)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5 }}>COSTO VENTA</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>Bs {s.precio_admin}</p>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.05)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5 }}>INTERESADOS</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 900 }}>{s._count.clicks}</p>
                                </div>
                            </div>

                            <button className="btn-secondary" style={{ width: '100%', fontSize: '0.75rem' }}>
                                <Info size={16} /> VER DETALLES
                            </button>
                        </motion.div>
                    ))
                ) : (
                    orders.map((o, i) => (
                        <motion.div 
                            key={o.id} 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: i * 0.1 }}
                            className="card"
                            style={{ 
                                padding: '1.5rem', borderLeft: `8px solid ${o.status === 'PENDIENTE' ? 'var(--color-warning)' : 'var(--color-primary)'}`,
                                display: 'flex', flexDirection: 'column', gap: '1rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>PEDIDO #{o.id.slice(-6).toUpperCase()}</p>
                                    <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>{new Date(o.creado_en).toLocaleDateString()}</p>
                                </div>
                                <div className={`chip ${o.status === 'PENDIENTE' ? 'chip-warning' : 'chip-active'}`}>{o.status}</div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--surface-raised)', padding: '0.75rem', borderRadius: '14px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff', border: '1px solid #000', padding: '4px' }}>
                                    <img src={o.servicio.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>{o.servicio.nombre}</p>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700 }}>CANTIDAD: {o.cantidad}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
                                <User size={14} />
                                <p style={{ fontSize: '0.75rem', fontWeight: 800 }}>Comprador: @{o.vendor.alias}</p>
                            </div>

                            {o.status === 'PENDIENTE' && (
                                <button onClick={() => setSelectedOrder(o)} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                                    <Send size={18} /> ENVIAR CUENTAS
                                </button>
                            )}
                        </motion.div>
                    ))
                )}
                
                {activeTab === 'SERVICIOS' && myServices.length === 0 && !loading && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', border: '3px dashed rgba(0,0,0,0.1)', borderRadius: '32px' }}>
                        <p style={{ fontWeight: 900, opacity: 0.4 }}>AÚN NO HAS PROPUESTO NINGÚN SERVICIO</p>
                        <button onClick={() => setShowProposeModal(true)} className="btn-primary" style={{ margin: '1.5rem auto' }}>¡PROPONER AHORA!</button>
                    </div>
                )}
                
                {activeTab === 'PEDIDOS' && orders.length === 0 && !loading && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', border: '3px dashed rgba(0,0,0,0.1)', borderRadius: '32px' }}>
                        <p style={{ fontWeight: 900, opacity: 0.4 }}>AÚN NO TIENES PEDIDOS PARA TUS SERVICIOS</p>
                    </div>
                )}
            </div>

            {/* Modal Proponer Servicio */}
            <AnimatePresence>
                {showProposeModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-container" style={{ maxWidth: '500px', width: '90%', padding: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontWeight: 900 }}>PROPONER <span className="text-gradient-primary">SERVICIO</span></h2>
                                <button onClick={() => setShowProposeModal(false)} className="btn-ghost"><X size={32} /></button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label className="input-label">NOMBRE DEL SERVICIO</label>
                                    <input className="input" placeholder="Ej: Netflix Original Ultra" value={proposeForm.nombre} onChange={e => setProposeForm({...proposeForm, nombre: e.target.value})} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="input-label">PRECIO VENTA (Bs)</label>
                                        <input className="input" type="number" placeholder="0.00" value={proposeForm.precio_costo} onChange={e => setProposeForm({...proposeForm, precio_costo: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="input-label">CATEGORÍA</label>
                                        <select className="input" value={proposeForm.categoria} onChange={e => setProposeForm({...proposeForm, categoria: e.target.value})}>
                                            <option value="STREAMING">STREAMING</option>
                                            <option value="IPTV">IPTV</option>
                                            <option value="CURSOS">CURSOS</option>
                                            <option value="OTROS">OTROS</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">URL LOGO / ÍCONO</label>
                                    <input className="input" placeholder="https://..." value={proposeForm.icono_url} onChange={e => setProposeForm({...proposeForm, icono_url: e.target.value})} />
                                </div>
                                <div>
                                    <label className="input-label">DESCRIPCIÓN BREVE</label>
                                    <textarea className="input" rows={3} placeholder="Detalles del servicio..." value={proposeForm.descripcion} onChange={e => setProposeForm({...proposeForm, descripcion: e.target.value})} style={{ resize: 'none', padding: '1rem' }} />
                                </div>
                            </div>

                            <button className="btn-primary" style={{ width: '100%', marginTop: '2rem', height: '60px' }} onClick={handlePropose} disabled={proposing || !proposeForm.nombre || !proposeForm.precio_costo}>
                                {proposing ? <RefreshCw className="animate-spin" /> : 'PUBLICAR EN MARKETPLACE'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Enviar Cuentas */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="modal-overlay">
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="modal-container" style={{ maxWidth: '500px', width: '90%', padding: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontWeight: 900 }}>ENVIAR <span className="text-gradient-primary">CUENTAS</span></h2>
                                <button onClick={() => setSelectedOrder(null)} className="btn-ghost"><X size={32} /></button>
                            </div>

                            <div style={{ background: 'var(--surface-raised)', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', border: '2px solid #000' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>PEDIDO: {selectedOrder.servicio.nombre}</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>CANTIDAD: {selectedOrder.cantidad}</p>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="input-label">EMAIL / USUARIO</label>
                                    <input className="input" value={credForm.email} onChange={e => setCredForm({...credForm, email: e.target.value})} />
                                </div>
                                <div>
                                    <label className="input-label">CONTRASEÑA</label>
                                    <input className="input" value={credForm.password} onChange={e => setCredForm({...credForm, password: e.target.value})} />
                                </div>
                                <div>
                                    <label className="input-label">PERFIL / PANTALLA (OPCIONAL)</label>
                                    <input className="input" placeholder="Ej: Perfil 1" value={credForm.perfil} onChange={e => setCredForm({...credForm, perfil: e.target.value})} />
                                </div>
                                <div>
                                    <label className="input-label">NOTAS ADICIONALES</label>
                                    <input className="input" placeholder="Ej: No cambiar contraseña..." value={credForm.notas} onChange={e => setCredForm({...credForm, notas: e.target.value})} />
                                </div>
                            </div>

                            <button className="btn-primary" style={{ width: '100%', marginTop: '2rem', height: '60px' }} onClick={handleFullfill} disabled={submittingCred || !credForm.email || !credForm.password}>
                                {submittingCred ? <RefreshCw className="animate-spin" /> : 'ENVIAR AL VENDEDOR'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast Global */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ position: 'fixed', bottom: '120px', left: '50%', transform: 'translateX(-50%)', zIndex: 5000, background: '#000', color: '#fff', padding: '1rem 2rem', borderRadius: '20px', border: '2.5px solid var(--color-primary)', fontWeight: 900, boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckCircle size={20} color="var(--color-primary)" />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
