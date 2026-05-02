'use client';
/**
 * Admin: Gestión de Estrenos — Feed de novedades de plataformas streaming
 */
import React, { useState, useEffect } from 'react';
import { Clapperboard, Plus, Trash2, Edit2, CheckCircle2, X, Upload, ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import Combobox from '@/components/Combobox';

interface Plataforma {
    id: string;
    nombre: string;
    color: string;
}

interface Estreno {
    id: string;
    titulo: string;
    descripcion?: string;
    plataforma: string;
    fecha_estreno?: string;
    imagen_url?: string;
    activo: boolean;
    creado_en: string;
}

const emptyForm = { titulo: '', descripcion: '', plataforma: 'NETFLIX', fecha_estreno: '', imagen_url: '', imagen_archivo: null as File | null };

export default function EstRenosAdminPage() {
    const [estrenos, setEstrenos] = useState<Estreno[]>([]);
    const [dbPlataformas, setDbPlataformas] = useState<Plataforma[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [toDelete, setToDelete] = useState<Estreno | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [toast, setToast] = useState('');

    const fetch = async () => {
        setLoading(true);
        try {
            const [estrenosData, plataformasData] = await Promise.all([
                api.get('/admin/estrenos'),
                api.get('/plataformas')
            ]);
            setEstrenos(estrenosData);
            setDbPlataformas(plataformasData);
            if (plataformasData.length > 0 && !form.plataforma) {
                setForm(prev => ({ ...prev, plataforma: plataformasData[0].nombre }));
            }
        } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const openModal = (e?: Estreno) => {
        if (e) {
            setEditingId(e.id);
            setForm({ titulo: e.titulo, descripcion: e.descripcion || '', plataforma: e.plataforma, fecha_estreno: e.fecha_estreno ? e.fecha_estreno.slice(0, 10) : '', imagen_url: e.imagen_url || '', imagen_archivo: null });
        } else {
            setEditingId(null);
            setForm(emptyForm);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (ev: React.FormEvent) => {
        ev.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            data.append('titulo', form.titulo);
            data.append('descripcion', form.descripcion);
            data.append('plataforma', form.plataforma);
            data.append('fecha_estreno', form.fecha_estreno);
            data.append('imagen_url', form.imagen_url);
            if (form.imagen_archivo) data.append('imagen', form.imagen_archivo);

            const token = localStorage.getItem('ares_token');
            const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            const url = editingId ? `${base}/admin/estrenos/${editingId}` : `${base}/admin/estrenos`;
            const res = await window.fetch(url, { method: editingId ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
            if (!res.ok) throw new Error('Error');
            setToast(editingId ? 'Estreno actualizado' : 'Estreno creado');
            setTimeout(() => setToast(''), 3000);
            setIsModalOpen(false);
            fetch();
        } catch { setToast('Error guardando'); } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        await api.delete(`/admin/estrenos/${toDelete.id}`);
        setToDelete(null);
        fetch();
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 5000, background: 'var(--surface-raised)', padding: '1rem 2rem', borderRadius: 20, border: '3px solid var(--color-primary)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <CheckCircle2 color="var(--color-primary)" /> {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }} className='max-sm:flex-col max-sm:items-start max-sm:gap-4'>
                <div>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: "50px" }}>
                        <Clapperboard size={40} color="var(--color-primary)" />
                        <div>
                            FEED DE <span className="text-gradient-primary">ESTRENOS</span>
                        </div>
                        <button
                            onClick={fetch}
                            className="btn-secondary max-md:mr-10 max-sm:mr-15"
                            style={{ padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Refrescar Novedades"
                        >
                            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </h1>
                    <p style={{ fontWeight: 700, opacity: 0.5 }} className='max-sm:hidden'>Novedades que los vendedores ven en su app.</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()} style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Plus size={20} /> NUEVO ESTRENO
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '8rem' }}><Loader2 className="animate-spin" size={48} color="var(--color-primary)" /></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {estrenos.filter(e => !!e.activo && String(e.activo) !== '0' && String(e.activo) !== 'false').map((e, i) => (
                        <motion.div key={e.id} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ height: 180, background: '#000', position: 'relative', overflow: 'hidden' }}>
                                {e.imagen_url
                                    ? <img src={e.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Clapperboard size={64} color="white" style={{ opacity: 0.1 }} />
                                    </div>}
                                <div style={{
                                    position: 'absolute', top: 12, left: 12,
                                    background: dbPlataformas.find(p => p.nombre === e.plataforma)?.color || '#000',
                                    color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 900
                                }}>
                                    {e.plataforma}
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <h3 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.4rem' }}>{e.titulo}</h3>
                                {e.descripcion && <p style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 600, marginBottom: '0.75rem' }}>{e.descripcion}</p>}
                                {e.fecha_estreno && <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)' }}>📅 {new Date(e.fecha_estreno).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>}
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                    <button onClick={() => openModal(e)} className="btn-secondary" style={{ flex: 1, height: 44, border: '2px solid #000', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Edit2 size={16} /> EDITAR
                                    </button>
                                    <button onClick={() => setToDelete(e)} style={{ width: 44, height: 44, background: 'transparent', border: '2px solid var(--color-danger)', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Trash2 size={16} color="var(--color-danger)" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-container"
                            style={{ maxWidth: 600, width: '90%', padding: '3rem', border: '4px solid #000', borderRadius: 32, background: 'var(--surface-overlay)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontWeight: 900, fontSize: '1.8rem' }}>{editingId ? 'EDITAR' : 'NUEVO'} <span className="text-gradient-primary">ESTRENO</span></h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={32} /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="input-label">TÍTULO</label>
                                    <input className="input" required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Stranger Things T5" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <Combobox
                                            label="PLATAFORMA"
                                            placeholder="Seleccionar plataforma..."
                                            options={dbPlataformas.map(p => ({ id: p.nombre, nombre: p.nombre }))}
                                            value={form.plataforma}
                                            onChange={(val: any) => setForm({ ...form, plataforma: val })}
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">FECHA DE ESTRENO</label>
                                        <input className="input" type="date" value={form.fecha_estreno} onChange={e => setForm({ ...form, fecha_estreno: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">DESCRIPCIÓN (OPCIONAL)</label>
                                    <textarea className="input" rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Detalles del estreno..." />
                                </div>
                                <div>
                                    <label className="input-label">URL DE IMAGEN (OPCIONAL)</label>
                                    <input className="input" value={form.imagen_url} onChange={e => setForm({ ...form, imagen_url: e.target.value })} placeholder="https://..." />
                                </div>
                                <div className="upload-zone">
                                    <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setForm({ ...form, imagen_archivo: f }); }} />
                                    <div style={{ pointerEvents: 'none' }}>
                                        {form.imagen_archivo
                                            ? <div style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--color-primary)' }}><ImageIcon size={28} style={{ margin: '0 auto 0.5rem' }} />{form.imagen_archivo.name}</div>
                                            : <div style={{ opacity: 0.4 }}><Upload size={32} style={{ margin: '0 auto 0.5rem' }} /><p style={{ fontWeight: 900, fontSize: '0.8rem' }}>SUBIR IMAGEN LOCAL</p></div>}
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" disabled={saving} style={{ height: 64, fontSize: '1.1rem' }}>
                                    {saving ? 'GUARDANDO...' : (editingId ? 'ACTUALIZAR ESTRENO' : 'PUBLICAR ESTRENO')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirm Delete */}
            <AnimatePresence>
                {toDelete && (
                    <div className="modal-overlay">
                        <div className="modal-container" style={{ maxWidth: 400, textAlign: 'center', padding: '3rem', border: '4px solid var(--color-danger)', borderRadius: 32 }}>
                            <Trash2 size={48} color="var(--color-danger)" style={{ margin: '0 auto 1.5rem' }} />
                            <h2 style={{ fontWeight: 900, marginBottom: '1rem' }}>¿ELIMINAR ESTRENO?</h2>
                            <p style={{ opacity: 0.6, fontWeight: 700, marginBottom: '2rem' }}>{toDelete.titulo}</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setToDelete(null)}>CANCELAR</button>
                                <button className="btn-primary" style={{ flex: 1, background: 'var(--color-danger)' }} onClick={handleDelete}>BORRAR</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
