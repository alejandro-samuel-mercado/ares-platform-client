/**
 * Gestión de Mensajes Rápidos — Ares Admin
 */

'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { MessageSquare, Plus, Trash2, Edit2, Loader2, Save, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Combobox from '@/components/Combobox';

interface MensajeRapido {
    id: string;
    titulo: string;
    template: string;
    orden: number;
    activo: boolean;
}

const emptyForm = {
    titulo: '',
    template: '',
    orden: 0,
    activo: true
};

export default function AdminMensajesPage() {
    const [mensajes, setMensajes] = useState<MensajeRapido[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [toDelete, setToDelete] = useState<MensajeRapido | null>(null);
    const [toast, setToast] = useState('');

    const [formData, setFormData] = useState(emptyForm);

    const fetchMensajes = async () => {
        setLoading(true);
        try {
            const data = await api.get('/admin/mensajes');
            setMensajes(data);
        } catch (error) {
            console.error('Error fetching mensajes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMensajes(); }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const endpoint = editingId ? `/admin/mensajes/${editingId}` : '/admin/mensajes';
            if (editingId) {
                await api.put(endpoint, formData);
            } else {
                await api.post(endpoint, formData);
            }
            showToast(editingId ? 'Script actualizado ✅' : 'Script creado ✅');
            await fetchMensajes();
            setIsModalOpen(false);
        } catch (error) {
            showToast('Error al guardar ❌');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        try {
            await api.delete(`/admin/mensajes/${toDelete.id}`);
            showToast('SCRIPT ELIMINADO 🗑️');
            setToDelete(null);
            await fetchMensajes();
        } catch (error) {
            showToast('Error al eliminar ❌');
        }
    };

    const openModal = (msg?: MensajeRapido) => {
        if (msg) {
            setEditingId(msg.id);
            setFormData({ titulo: msg.titulo, template: msg.template, orden: msg.orden, activo: msg.activo });
        } else {
            setEditingId(null);
            setFormData({ ...emptyForm, orden: mensajes.length + 1 });
        }
        setIsModalOpen(true);
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: '5rem' }}>
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 10000, background: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '1rem 2rem', borderRadius: 24, border: '3px solid var(--color-primary)', boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <CheckCircle2 color="var(--color-primary)" /> {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }} className='max-sm:flex-col max-sm:items-start max-sm:gap-4'>
                <div>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <MessageSquare size={40} color="var(--color-primary)" />
                        SCRIPTS <span className="text-gradient-primary"></span>
                        <button
                            onClick={fetchMensajes}
                            className="btn-secondary"
                            style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Refrescar Mensajes"
                        >
                            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </h1>
                    <p style={{ opacity: 0.7, fontWeight: 700 }}>Gestiona las plantillas de mensajes para los vendedores</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem' }}>
                    <Plus size={20} /> NUEVO MENSAJE
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '8rem' }}><Loader2 className="animate-spin" size={48} color="var(--color-primary)" /></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {mensajes.map((msg, i) => (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="card-static" style={{
                                background: 'var(--surface-raised)',
                                border: '3px solid #000',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                boxShadow: '4px 4px 0px 0px #000'
                            }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{msg.titulo.toUpperCase()}</h3>
                                <div className="chip chip-primary" style={{ fontSize: '0.7rem', background: 'var(--color-primary)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontWeight: 900 }}>ORDEN: {msg.orden}</div>
                            </div>

                            <div style={{
                                background: 'var(--surface-base)',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '2px solid rgba(0,0,0,0.1)',
                                fontSize: '0.9rem',
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                whiteSpace: 'pre-wrap',
                                flex: 1
                            }}>
                                {msg.template}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: msg.activo ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                                    {msg.activo ? '● ACTIVO' : '○ INACTIVO'}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => openModal(msg)} style={{ background: '#000', color: 'white', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => setToDelete(msg)} style={{ background: 'var(--color-danger)', color: 'white', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal CRUD */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-container"
                            style={{ background: 'var(--surface-overlay)', maxWidth: '600px', width: '90%', padding: '3.5rem', border: '4px solid #000', borderRadius: '32px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '2rem', fontWeight: 900 }}>
                                    {editingId ? 'EDITAR' : 'NUEVO'} <span className="text-gradient-primary">SCRIPT</span>
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={32} /></button>
                            </div>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="input-label">TÍTULO DEL MENSAJE</label>
                                    <input
                                        type="text"
                                        className="input"
                                        required
                                        value={formData.titulo}
                                        onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                        placeholder="Ej: Bienvenida Clientes"
                                    />
                                </div>
                                <div>
                                    <label className="input-label">CONTENIDO (TEXTO)</label>
                                    <p style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.4, marginBottom: '0.5rem' }}>VARIABLES: [SERVICIO], [PRECIO], [WHATSAPP], [NOMBRE_VENDEDOR]</p>
                                    <textarea
                                        className="input"
                                        required
                                        rows={6}
                                        value={formData.template}
                                        onChange={e => setFormData({ ...formData, template: e.target.value })}
                                        placeholder="Escribe el mensaje..."
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="input-label">ORDEN DE APARICIÓN</label>
                                        <input
                                            type="number"
                                            className="input"
                                            required
                                            min="0"
                                            value={formData.orden}
                                            onChange={e => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Combobox
                                            label="ESTADO DEL SCRIPT"
                                            placeholder="Seleccionar estado..."
                                            options={[
                                                { id: 'true', nombre: 'SISTEMA ACTIVO' },
                                                { id: 'false', nombre: 'SISTEMA INACTIVO' }
                                            ]}
                                            value={formData.activo.toString()}
                                            onChange={(val: any) => setFormData({ ...formData, activo: val === 'true' })}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" disabled={saving} style={{ height: 64, fontSize: '1.1rem', marginTop: '1rem' }}>
                                    {saving ? 'GUARDANDO...' : (editingId ? 'ACTUALIZAR SCRIPT' : 'LANZAR NUEVO SCRIPT')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirm Delete Modal */}
            <AnimatePresence>
                {toDelete && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-container" style={{ maxWidth: 450, textAlign: 'center', padding: '3.5rem', border: '5px solid var(--color-danger)', borderRadius: 32, background: 'var(--surface-overlay)', boxShadow: '15px 15px 0px 0px rgba(0,0,0,0.5)' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: 100, height: 100, borderRadius: '50%', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--color-danger)' }}>
                                <Trash2 size={48} color="var(--color-danger)" />
                            </div>
                            <h2 style={{ fontWeight: 900, marginBottom: '1rem', fontSize: '1.8rem' }}>¿ELIMINAR SCRIPT?</h2>
                            <p style={{ opacity: 0.6, fontWeight: 700, marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                                El mensaje <span style={{ color: 'var(--color-danger)' }}>"{toDelete.titulo}"</span> desaparecerá de la biblioteca de todos los vendedores.
                            </p>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <button className="btn-secondary" style={{ flex: 1, border: 'none' }} onClick={() => setToDelete(null)}>CANCELAR</button>
                                <button className="btn-primary" style={{ flex: 1, background: 'var(--color-danger)', boxShadow: '8px 8px 0px 0px #000' }} onClick={handleDelete}>BORRAR</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
