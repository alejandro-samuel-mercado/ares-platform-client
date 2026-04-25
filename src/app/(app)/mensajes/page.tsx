/**
 * Página: Mensajes Rápidos — App Vendedor Ares v3.0 (Decentralized)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, MessageCircle, Zap, ShieldAlert, CheckCircle2, RefreshCw, Plus, Trash2, Edit2, X, Save, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Mensaje { id: string; titulo: string; template: string; orden: number; activo: boolean; }
interface MiServicio { servicio_id: string; precio_venta: number; activo: boolean; servicio: { nombre: string }; }

function resolveVariables(template: string, vendor: any, servicios: MiServicio[]): string {
    const firstService = servicios[0];
    return template
        .replace(/\[PRECIO\]/g, firstService?.precio_venta?.toString() ?? '—')
        .replace(/\[WHATSAPP\]/g, vendor?.role === 'GUEST' ? '[DEMO]' : (vendor?.whatsapp || vendor?.telefono || ''))
        .replace(/\[NOMBRE_VENDEDOR\]/g, vendor?.alias || vendor?.nombre || '')
        .replace(/\[SERVICIO\]/g, firstService?.servicio?.nombre || '')
        .replace(/\[PARTIDO_HOY\]/g, '(ver partidos)');
}

export default function MensajesPage() {
    const { vendor, isAdmin, isColaborador } = useAuth();
    const canManage = isAdmin || isColaborador;

    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [misServicios, setMisServicios] = useState<MiServicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);

    // Management State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<Mensaje | null>(null);
    const [form, setForm] = useState({ titulo: '', template: '', orden: 0, activo: true });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [msgs, svcs] = await Promise.all([api.get('/mensajes'), api.get('/mis_servicios')]);
            setMensajes(msgs);
            setMisServicios(svcs.filter((s: MiServicio) => s.activo));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const triggerToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const handleCopy = async (msg: Mensaje) => {
        const resolved = resolveVariables(msg.template, vendor, misServicios);
        try {
            await navigator.clipboard.writeText(resolved);
            triggerToast();
        } catch { /* fallback */ }
    };

    const openModal = (m?: Mensaje) => {
        if (m) {
            setEditingId(m.id);
            setForm({ titulo: m.titulo, template: m.template, orden: m.orden, activo: m.activo });
        } else {
            setEditingId(null);
            setForm({ titulo: '', template: '', orden: mensajes.length + 1, activo: true });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingId ? `/admin/mensajes/${editingId}` : '/admin/mensajes';
            if (editingId) await api.put(url, form);
            else await api.post(url, form);
            await fetchData();
            setIsModalOpen(false);
        } catch (err) {
            alert('Error al guardar mensaje');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/admin/mensajes/${confirmDelete.id}`);
            setConfirmDelete(null);
            fetchData();
        } catch {
            alert('Error al eliminar mensaje');
        }
    };

    return (
        <div style={{ paddingBottom: '8rem', margin: '0 auto' }}>

            <AnimatePresence>
                {showToast && (
                    <motion.div initial={{ opacity: 0, y: 50, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
                            background: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '1rem 2rem', width: 'max-content',
                            borderRadius: '24px', border: '2px solid var(--color-primary)', boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
                            fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
                        }}
                    >
                        <CheckCircle2 color="var(--color-primary)" /> TEXTO COPIADO
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--surface-raised)', color: 'var(--color-primary)', padding: '0.6rem', borderRadius: '12px', border: '2px solid #000' }}>
                        <MessageCircle size={24} />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>SCRIPTS <span className="text-gradient-primary">RÁPIDOS</span></h1>
                    <button
                        onClick={fetchData}
                        className="btn-secondary"
                        style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Refrescar Scripts"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
                {canManage && (
                    <button className="btn-primary" onClick={() => openModal()} style={{ background: 'var(--color-secondary)', color: 'white', padding: '0.7rem 1.2rem', fontSize: '0.75rem' }}>
                        <Plus size={16} /> NUEVO SCRIPT
                    </button>
                )}
            </div>

            {vendor?.role === 'GUEST' && (
                <div style={{ marginBottom: '2rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--color-danger)', border: '2px dashed var(--color-danger)', padding: '1.25rem', borderRadius: '20px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <ShieldAlert size={20} color="var(--color-danger)" />
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-danger)' }}>MODO DEMO ACTIVA: SE USARÁ [DEMO].</p>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Zap className="animate-pulse" size={40} color="var(--color-primary)" /></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {mensajes.map((msg, i) => {
                        const hasPriceVar = msg.template.includes('[PRECIO]');
                        const hasServiceVar = msg.template.includes('[SERVICIO]');

                        // Si tiene variables de servicio/precio, mostramos una versión por cada servicio activo
                        if (hasPriceVar || hasServiceVar) {
                            return misServicios.map((svc) => (
                                <motion.div key={`${msg.id}-${svc.servicio_id}`} className="card"
                                    style={{ padding: '0', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-raised)', overflow: 'hidden' }}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                >
                                    <button onClick={() => {
                                        const resolved = resolveVariables(msg.template, vendor, [svc]);
                                        navigator.clipboard.writeText(resolved);
                                        triggerToast();
                                    }} style={{ padding: '1.5rem', background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <span style={{ fontSize: '0.6rem', background: 'var(--color-primary)', color: 'white', padding: '2px 6px', borderRadius: '6px', fontWeight: 900 }}>
                                                    {svc.servicio.nombre}
                                                </span>
                                                <h3 style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{msg.titulo}</h3>
                                            </div>
                                            <div style={{ background: 'var(--surface-base)', padding: '0.4rem', borderRadius: '10px', border: '1px solid #000' }}><Copy size={14} color="var(--text-primary)" /></div>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, opacity: 0.9 }}>
                                            {resolveVariables(msg.template, vendor, [svc])}
                                        </p>
                                    </button>

                                    {canManage && (
                                        <div style={{ display: 'flex', borderTop: '2px solid rgba(0,0,0,0.1)', padding: '0.75rem 1.5rem', gap: '1rem', background: 'rgba(0,0,0,0.02)' }}>
                                            <button onClick={() => openModal(msg)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Edit2 size={12} /> EDITAR
                                            </button>
                                            <button onClick={() => setConfirmDelete(msg)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Trash2 size={12} /> ELIMINAR
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ));
                        }

                        // Mensajes genéricos (una sola vez)
                        return (
                            <motion.div key={msg.id} className="card"
                                style={{ padding: '0', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-raised)', overflow: 'hidden' }}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            >
                                <button onClick={() => handleCopy(msg)} style={{ padding: '1.5rem', background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>{msg.titulo}</h3>
                                        <div style={{ background: 'var(--surface_base)', padding: '0.4rem', borderRadius: '10px', border: '1px solid #000' }}><Copy size={16} color="var(--text-primary)" /></div>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, opacity: 0.9 }}>
                                        {resolveVariables(msg.template, vendor, misServicios)}
                                    </p>
                                </button>

                                {canManage && (
                                    <div style={{ display: 'flex', borderTop: '2px solid rgba(0,0,0,0.1)', padding: '0.75rem 1.5rem', gap: '1rem', background: 'rgba(0,0,0,0.02)' }}>
                                        <button onClick={() => openModal(msg)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <Edit2 size={12} /> EDITAR
                                        </button>
                                        <button onClick={() => setConfirmDelete(msg)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={12} /> ELIMINAR
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}

                    {mensajes.length === 0 && (
                        <div style={{ textAlign: 'center', opacity: 0.4, padding: '4rem' }}>
                            <ShieldAlert size={48} style={{ margin: '0 auto 1rem auto' }} />
                            <p style={{ fontWeight: 900 }}>AÚN NO HAY SCRIPTS DISPONIBLES</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal CRUD */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-container" style={{ maxWidth: '500px', padding: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{editingId ? 'EDITAR' : 'NUEVO'} <span className="text-gradient-primary">SCRIPT</span></h3>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label className="input-label">TÍTULO / PROPÓSITO</label>
                                    <input className="input" required placeholder="Ej: Bienvenida Clientes" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
                                </div>
                                <div>
                                    <label className="input-label">CONTENIDO DEL SCRIPT</label>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.6, marginBottom: '0.5rem' }}>VARIABLES: [SERVICIO], [PRECIO], [WHATSAPP], [NOMBRE_VENDEDOR]</p>
                                    <textarea className="input" required rows={5} placeholder="Escribe el mensaje aquí..." value={form.template} onChange={e => setForm({ ...form, template: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="input-label">ORDEN</label>
                                        <input className="input" type="number" value={form.orden} onChange={e => setForm({ ...form, orden: parseInt(e.target.value) })} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label className="input-label">ESTADO</label>
                                        <select className="input" value={form.activo.toString()} onChange={e => setForm({ ...form, activo: e.target.value === 'true' })}>
                                            <option value="true">ACTIVO</option>
                                            <option value="false">INACTIVO</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '1.25rem', marginTop: '1rem' }}>
                                    {saving ? <Loader2 className="animate-spin" size={24} /> : (editingId ? 'GUARDAR CAMBIOS' : 'CREAR SCRIPT')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Eliminar */}
            <AnimatePresence>
                {confirmDelete && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-container" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Trash2 size={40} color="var(--color-danger)" />
                            </div>
                            <h3 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.5rem' }}>¿ELIMINAR SCRIPT?</h3>
                            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.5rem', marginBottom: '2rem', fontWeight: 600 }}>
                                Se eliminará "{confirmDelete.titulo}". Esta acción no se puede deshacer.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>CANCELAR</button>
                                <button className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--color-danger)' }} onClick={handleDelete}>BORRAR</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
