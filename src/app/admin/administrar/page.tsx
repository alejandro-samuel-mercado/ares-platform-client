'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Edit2, Trash2, X, Zap, Loader2, Image as ImageIcon, Box, Palette, Search } from 'lucide-react';
import api from '@/lib/api';
import Combobox from '@/components/Combobox';

interface Plataforma {
    id: string;
    nombre: string;
    color: string;
    emoji?: string;
    activo: boolean;
}

interface Categoria {
    id: string;
    nombre: string;
    tipo: string;
    activo: boolean;
}

export default function AdministrarPage() {
    const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'PLATAFORMAS' | 'CATEGORIAS'>('PLATAFORMAS');

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [p, c] = await Promise.all([
                api.get('/admin/plataformas'),
                api.get('/admin/categorias')
            ]);
            setPlataformas(p);
            setCategorias(c);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const triggerToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const endpoint = activeTab === 'PLATAFORMAS' ? '/admin/plataformas' : '/admin/categorias';
            if (editing.id) {
                await api.put(`${endpoint}/${editing.id}`, editing);
            } else {
                await api.post(endpoint, editing);
            }
            triggerToast('SINCRO EXITOSA');
            setShowModal(false);
            setEditing(null);
            loadData();
        } catch {
            triggerToast('ERROR AL GUARDAR');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, tab: 'PLATAFORMAS' | 'CATEGORIAS') => {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return;
        try {
            const endpoint = tab === 'PLATAFORMAS' ? '/admin/plataformas' : '/admin/categorias';
            await api.delete(`${endpoint}/${id}`);
            triggerToast('ELIMINADO CORRECTAMENTE');
            loadData();
        } catch (err) {
            triggerToast('ERROR AL ELIMINAR');
            console.error(err);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }} className='max-sm:flex-col max-sm:items-start max-sm:gap-4'>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#000', padding: '0.8rem', borderRadius: '20px', color: 'var(--color-primary)' }}>
                            <Layers size={32} />
                        </div>
                        <div>
                            ADMINISTRAR <span className="text-gradient-primary">INSTANCIAS</span>
                        </div>
                    </h1>
                    <p style={{ fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-muted)' }}>Configuración dinámica de plataformas y categorías</p>
                </div>
                <button className="btn-primary" onClick={() => {
                    setEditing(activeTab === 'PLATAFORMAS' ? { nombre: '', color: '#6B7280', emoji: '🎬' } : { nombre: '', tipo: 'SERVICIO' });
                    setShowModal(true);
                }}>
                    <Plus size={20} /> AÑADIR {activeTab === 'PLATAFORMAS' ? 'PLATAFORMA' : 'CATEGORÍA'}
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('PLATAFORMAS')}
                    className={activeTab === 'PLATAFORMAS' ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1, padding: '1rem' }}
                >
                    PLATAFORMAS (STREAMING)
                </button>
                <button
                    onClick={() => setActiveTab('CATEGORIAS')}
                    className={activeTab === 'CATEGORIAS' ? 'btn-primary' : 'btn-secondary'}
                    style={{ flex: 1, padding: '1rem' }}
                >
                    CATEGORÍAS (PRODUCTOS/IMÁGENES)
                </button>
            </div>

            <div className="table-container max-xl:w-[115%] max-xl:-ml-15 max-md:w-[100%] max-md:ml-0">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={40} style={{ margin: '0 auto' }} /></div>
                ) : (
                    <table className="table">
                        <thead>
                            {activeTab === 'PLATAFORMAS' ? (
                                <tr>
                                    <th>Emoji</th>
                                    <th>Nombre</th>
                                    <th>Color Ref.</th>
                                    <th>Acciones</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>Nombre</th>
                                    <th>Tipo</th>
                                    <th>Acciones</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {activeTab === 'PLATAFORMAS' ? (
                                plataformas.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontSize: '1.5rem' }}>{p.emoji}</td>
                                        <td style={{ fontWeight: 900 }}>{p.nombre}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '20px', height: '20px', background: p.color, borderRadius: '4px', border: '1px solid #000' }} />
                                                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{p.color}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn-secondary" style={{ padding: '0.5rem' }} onClick={() => { setEditing(p); setShowModal(true); }}><Edit2 size={16} /></button>
                                                <button className="btn-ghost" style={{ padding: '0.5rem', color: 'red' }} onClick={() => handleDelete(p.id, 'PLATAFORMAS')}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                categorias.map(c => (
                                    <tr key={c.id}>
                                        <td style={{ fontWeight: 900 }}>{c.nombre}</td>
                                        <td><div className="chip chip-blue">{c.tipo}</div></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn-secondary" style={{ padding: '0.5rem' }} onClick={() => { setEditing(c); setShowModal(true); }}><Edit2 size={16} /></button>
                                                <button className="btn-ghost" style={{ padding: '0.5rem', color: 'red' }} onClick={() => handleDelete(c.id, 'CATEGORIAS')}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-container" style={{ maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontWeight: 900 }}>{editing.id ? 'EDITAR' : 'CREAR'} {activeTab}</h2>
                                <button onClick={() => setShowModal(false)} className="btn-ghost"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="input-label">Nombre</label>
                                    <input className="input" required value={editing.nombre} onChange={e => setEditing({ ...editing, nombre: e.target.value.toUpperCase() })} />
                                </div>

                                {activeTab === 'PLATAFORMAS' ? (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label className="input-label">Color CSS</label>
                                                <input className="input" type="color" value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} style={{ height: '50px' }} />
                                            </div>
                                            <div>
                                                <label className="input-label">Emoji / Icono</label>
                                                <input className="input" value={editing.emoji} onChange={e => setEditing({ ...editing, emoji: e.target.value })} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <Combobox
                                            label="Tipo de Categoría"
                                            placeholder="Seleccionar tipo..."
                                            options={[
                                                { id: 'SERVICIO', nombre: 'PARA SERVICIOS' },
                                                { id: 'IMAGEN', nombre: 'PARA BANCO DE IMÁGENES' },
                                                { id: 'OTRO', nombre: 'OTRO' }
                                            ]}
                                            value={editing.tipo || ''}
                                            onChange={(val: any) => setEditing({ ...editing, tipo: val })}
                                        />
                                    </div>
                                )}

                                <button type="submit" disabled={saving} className="btn-primary" style={{ width: '100%', padding: '1.25rem' }}>
                                    {saving ? <Loader2 className="animate-spin" size={24} /> : 'GUARDAR CAMBIOS'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#000', color: 'white', padding: '1rem 2rem', borderRadius: '15px', fontWeight: 900, border: '2px solid var(--color-primary)' }}>
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
