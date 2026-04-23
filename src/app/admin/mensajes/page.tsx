/**
 * Gestión de Mensajes Rápidos — Ares Admin
 */

'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { MessageSquare, Plus, Trash2, Edit2, Loader2, Save, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MensajeRapido {
    id: string;
    titulo: string;
    template: string;
    orden: number;
    activo: boolean;
}

export default function AdminMensajesPage() {
    const [mensajes, setMensajes] = useState<MensajeRapido[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        titulo: '',
        template: '',
        orden: 0,
        activo: true
    });

    useEffect(() => { fetchMensajes(); }, []);

    const fetchMensajes = async () => {
        try {
            const data = await api.get('/admin/mensajes');
            setMensajes(data);
        } catch (error) {
            console.error('Error fetching mensajes:', error);
        } finally {
            setLoading(false);
        }
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
            await fetchMensajes();
            closeModal();
        } catch (error) {
            console.error('Error saving mensaje:', error);
            alert('Error guardando el mensaje');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este mensaje rápido?')) return;
        try {
            await api.delete(`/admin/mensajes/${id}`);
            await fetchMensajes();
        } catch (error) {
            console.error('Error eliminando mensaje:', error);
            alert('Error eliminando el mensaje');
        }
    };

    const openModal = (msg?: MensajeRapido) => {
        if (msg) {
            setEditingId(msg.id);
            setFormData({ titulo: msg.titulo, template: msg.template, orden: msg.orden, activo: msg.activo });
        } else {
            setEditingId(null);
            setFormData({ titulo: '', template: '', orden: mensajes.length + 1, activo: true });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <MessageSquare size={36} color="var(--color-primary)" />
                        MENSAJES <span className="text-gradient-primary">RÁPIDOS</span>
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
                <button onClick={() => openModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> NUEVO MENSAJE
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {mensajes.map((msg) => (
                    <div key={msg.id} className="card-static" style={{ 
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
                            <div className="chip chip-primary" style={{ fontSize: '0.7rem' }}>ORDEN: {msg.orden}</div>
                        </div>
                        
                        <div style={{ 
                            background: 'var(--surface-base)', 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            border: '2px solid rgba(0,0,0,0.1)',
                            fontSize: '0.9rem',
                            color: 'var(--text-muted)',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {msg.template}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: msg.activo ? '#22c55e' : 'var(--color-danger)' }}>
                                {msg.activo ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => openModal(msg)} className="icon-btn" style={{ background: 'var(--color-primary)', color: 'white' }}>
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(msg.id)} className="icon-btn" style={{ background: 'var(--color-danger)', color: 'white' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content card"
                            style={{ background: 'var(--surface-raised)', maxWidth: '500px', width: '90%' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                                    {editingId ? 'EDITAR' : 'NUEVO'} MENSAJE
                                </h3>
                                <button onClick={closeModal} className="icon-btn"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label>Título / Intención (Ej. Hola Mío, Caída)</label>
                                    <input 
                                        type="text" 
                                        className="input-base" 
                                        required 
                                        value={formData.titulo}
                                        onChange={e => setFormData({...formData, titulo: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label>Plantilla del Mensaje</label>
                                    <p style={{fontSize:'0.7rem', opacity:0.6, marginBottom:'0.5rem'}}>Variables disponibles (si aplican en app): {'{nombre_cliente}'}, {'{servicio}'}. Puedes escribir cualquier texto.</p>
                                    <textarea 
                                        className="input-base" 
                                        required 
                                        rows={4}
                                        value={formData.template}
                                        onChange={e => setFormData({...formData, template: e.target.value})}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label>Orden (para ordenar en la app)</label>
                                        <input 
                                            type="number" 
                                            className="input-base" 
                                            required 
                                            min="0"
                                            value={formData.orden}
                                            onChange={e => setFormData({...formData, orden: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Estado</label>
                                        <select 
                                            className="input-base"
                                            value={formData.activo.toString()}
                                            onChange={e => setFormData({...formData, activo: e.target.value === 'true'})}
                                        >
                                            <option value="true">Activo</option>
                                            <option value="false">Inactivo</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    {saving ? 'GUARDANDO...' : 'GUARDAR MENSAJE'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
