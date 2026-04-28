/**
 * Página: Gestión de Planes — Ares v2 (Cartoon-Futurista)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Edit2, X, ShieldCheck, Zap, Globe, ShoppingCart, CheckCircle2, Trash, AlertOctagon } from 'lucide-react';
import api from '@/lib/api';

interface Plan {
    id: string; nombre: string; precio: number; dias: number;
    limite_servicios: number | null; pedidos_automaticos: boolean;
    enlace_publico: boolean; marketplace_proveedor: boolean; watermark_enabled: boolean; activo: boolean;
}

export default function PlanesPage() {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
    const [planToDelete, setPlanToDelete] = useState<{id: string, nombre: string} | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('PLAN ACTUALIZADO EXITOSAMENTE');
    const [tasaCambio, setTasaCambio] = useState(6.96);

    const loadPlanes = () => {
        setLoading(true);
        Promise.all([api.get('/admin/planes'), api.get('/ajustes-publicos')])
            .then(([data, ajustes]) => {
                setPlanes(data);
                if (ajustes?.tasa_cambio_bob) setTasaCambio(ajustes.tasa_cambio_bob);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(loadPlanes, []);

    const triggerToast = (msg: string = 'PLAN ACTUALIZADO EXITOSAMENTE') => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSave = async () => {
        if (!editingPlan) return;
        try {
            if (editingPlan.id) {
                await api.put(`/admin/planes/${editingPlan.id}`, editingPlan);
            } else {
                await api.post('/admin/planes', editingPlan);
            }
            setShowModal(false);
            setEditingPlan(null);
            triggerToast('PLAN ACTUALIZADO EXITOSAMENTE');
            loadPlanes();
        } catch (err) { console.error(err); }
    };

    const handleDeletePlan = async () => {
        if (!planToDelete) return;
        try {
            await api.delete(`/admin/planes/${planToDelete.id}`);
            triggerToast('PLAN ELIMINADO PERMANENTEMENTE');
            setPlanToDelete(null);
            loadPlanes();
        } catch (err: any) {
            triggerToast(err?.response?.data?.error || 'Error al eliminar el plan');
            setPlanToDelete(null);
        }
    };

    const planStyles: Record<string, { color: string, icon: React.ReactNode }> = {
        'Bronce': { color: '#CD7F32', icon: <Globe size={20} /> },
        'Vendedor': { color: 'var(--color-blue)', icon: <ShoppingCart size={20} /> },
        'Pro': { color: 'var(--color-accent)', icon: <Zap size={20} /> },
        'Proveedor': { color: 'var(--color-primary)', icon: <ShieldCheck size={20} /> }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Toast Ares v2 */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '40px', right: '40px', zIndex: 10000,
                            background: '#000', color: 'white', padding: '1.25rem 2.5rem',
                            borderRadius: '24px', border: '2px solid var(--color-primary)',
                            boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
                            fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
                        }}
                    >
                        <CheckCircle2 color="var(--color-primary)" />
                        {toastMessage}

                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }} className='max-md:flex-col max-md:items-start max-md:gap-4'>
                <div>
                    <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'var(--color-primary)', padding: '0.8rem', borderRadius: '16px', color: 'white', border: '2px solid #000' }}>
                            <CreditCard size={32} />
                        </div>
                        <div className=''>
                            MEMBRESÍAS <span className="text-gradient-primary">ARES</span>
                        </div>
                    </h1>
                    <p style={{ fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                        Configura los tiers de acceso y privilegios de tu red de ventas
                    </p>
                </div>
                <button className="btn-primary" onClick={() => { setEditingPlan({ nombre: '', precio: 0, dias: 30, limite_servicios: null, pedidos_automaticos: false, enlace_publico: false, marketplace_proveedor: false, watermark_enabled: false, activo: true }); setShowModal(true); }}>
                    <Plus size={22} /> CREAR NUEVO PLAN
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
                {planes.map((plan, i) => {
                    const style = planStyles[plan.nombre] || { color: 'var(--color-primary)', icon: <CreditCard size={20} /> };
                    return (
                        <motion.div
                            key={plan.id}
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                padding: '0',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Header del Plan */}
                            <div style={{
                                background: 'var(--color-primary)',
                                padding: '1.5rem',
                                color: '#000',
                                borderBottom: '2px solid #000',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: '#000', color: 'white', padding: '0.5rem', borderRadius: '10px' }}>
                                        {style.icon}
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: "var(--text-inverse)" }}>{plan.nombre}</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => { setEditingPlan(plan); setShowModal(true); }} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }} title="Editar">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => setPlanToDelete({ id: plan.id, nombre: plan.nombre })} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-danger)' }} title="Eliminar definitivamente">
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ padding: '2rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                                        {plan.precio} <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>Bs / mes</span> <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>| ${(plan.precio / tasaCambio).toFixed(2)} USD</span>
                                    </div>
                                    <div className="chip" style={{ marginTop: '0.5rem', background: '#000', color: 'white', border: 'none', boxShadow: 'none' }}>
                                        {plan.dias} DÍAS DE VIGENCIA
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '2px dashed rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
                                        <div style={{ color: 'var(--color-primary)' }}><CheckCircle2 size={16} /></div>
                                        {plan.limite_servicios !== null ? `${plan.limite_servicios} Servicios en Catálogo` : 'Servicios Ilimitados'}
                                    </div>
                                    {plan.pedidos_automaticos && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
                                            <div style={{ color: 'var(--color-primary)' }}><Zap size={16} /></div>
                                            Pedidos de Credenciales
                                        </div>
                                    )}
                                    {plan.enlace_publico && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
                                            <div style={{ color: 'var(--color-primary)' }}><Globe size={16} /></div>
                                            Catálogo Público (E-commerce)
                                        </div>
                                    )}
                                    {plan.marketplace_proveedor && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
                                            <div style={{ color: 'var(--color-primary)' }}><ShoppingCart size={16} /></div>
                                            Acceso a Marketplace (Modo Proveedor)
                                        </div>
                                    )}
                                    {plan.watermark_enabled && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
                                            <div style={{ color: 'var(--color-primary)' }}><ShieldCheck size={16} /></div>
                                            Marca de Agua Personalizada
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Modal Rediseñado */}
            <AnimatePresence>
                {showModal && editingPlan && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { setShowModal(false); setEditingPlan(null); }}
                            style={{ position: 'absolute', inset: 0, zIndex: 0 }}
                        />
                        <motion.div
                            className="modal-container"
                            initial={{ scale: 0.85, opacity: 0, rotate: -1 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            style={{ padding: '3rem', zIndex: 1, maxWidth: '600px', borderWidth: '3px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '2rem' }}>{editingPlan.id ? 'EDITAR' : 'CREAR'} <span className="text-gradient-primary">PLAN</span></h2>
                                <button onClick={() => { setShowModal(false); setEditingPlan(null); }} className="btn-ghost" style={{ padding: '0.5rem', border: "2px solid var(--color-primary)", borderRadius: "100%" }}>
                                    <X size={32} color="var(--text-inverse)" />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="input-label">Nombre Comercial del Tier</label>
                                    <input className="input" value={editingPlan.nombre || ''} onChange={e => setEditingPlan({ ...editingPlan, nombre: e.target.value })} placeholder="Ej: Platinum Elite" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label className="input-label">Precio (Bolivianos)</label>
                                        <input className="input" type="number" value={editingPlan.precio || 0} onChange={e => setEditingPlan({ ...editingPlan, precio: parseFloat(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="input-label">Ciclo de Cobro (Días)</label>
                                        <input className="input" type="number" value={editingPlan.dias || 30} onChange={e => setEditingPlan({ ...editingPlan, dias: parseInt(e.target.value) })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Límite de Servicios Activos (0 = Ilimitado)</label>
                                    <input className="input" type="number" value={editingPlan.limite_servicios ?? ''} onChange={e => setEditingPlan({ ...editingPlan, limite_servicios: e.target.value ? parseInt(e.target.value) : null })} placeholder="Sin límite" />
                                </div>

                                <div className="card" style={{ padding: '1.5rem', background: 'var(--surface-raised)', borderWidth: '2px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 800 }}>
                                        <input type="checkbox" checked={editingPlan.pedidos_automaticos || false} onChange={e => setEditingPlan({ ...editingPlan, pedidos_automaticos: e.target.checked })} />
                                        PEDIDOS AUTOMÁTICOS DE CREDENCIALES
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 800 }}>
                                        <input type="checkbox" checked={editingPlan.enlace_publico || false} onChange={e => setEditingPlan({ ...editingPlan, enlace_publico: e.target.checked })} />
                                        CATÁLOGO PÚBLICO (E-COMMERCE)
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 800 }}>
                                        <input type="checkbox" checked={editingPlan.marketplace_proveedor || false} onChange={e => setEditingPlan({ ...editingPlan, marketplace_proveedor: e.target.checked })} />
                                        ACCESO A MARKETPLACE (MODO PROVEEDOR)
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 800 }}>
                                        <input type="checkbox" checked={editingPlan.watermark_enabled || false} onChange={e => setEditingPlan({ ...editingPlan, watermark_enabled: e.target.checked })} />
                                        MARCA DE AGUA PERSONALIZADA
                                    </label>
                                </div>

                                <button className="btn-primary" onClick={handleSave} style={{ width: '100%', padding: '1.5rem', marginTop: '1rem', fontSize: '1.1rem' }}>
                                    <CreditCard size={20} /> GUARDAR CONFIGURACIÓN DE PLAN
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Modal de Eliminación */}
            <AnimatePresence>
                {planToDelete && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-container"
                            style={{ padding: '3rem', maxWidth: '450px', border: '3px solid #000', textAlign: 'center' }}
                        >
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 2rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <AlertOctagon size={40} color="var(--color-danger)" />
                            </div>

                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
                                ¿ELIMINAR PLAN?
                            </h2>

                            <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                                Esta acción eliminará permanentemente el plan <b>{planToDelete.nombre}</b>. 
                                <br/><br/>
                                <span style={{ color: 'var(--color-danger)'}}>IMPORTANTE: Solo se puede eliminar si no hay vendedores suscritos a él, de caso contrario el sistema abortará la operación.</span>
                            </p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-secondary" style={{ flex: 1, border: 'none' }} onClick={() => setPlanToDelete(null)}>CANCELAR</button>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, background: 'var(--color-danger)', color: 'white' }}
                                    onClick={handleDeletePlan}
                                >
                                    ELIMINAR
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
