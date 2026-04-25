'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Megaphone, Loader2, RefreshCw, Zap, Plus, Trash2, Edit, X, Upload } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Imagen { id: string; titulo: string; url_base: string; categoria: string; etiquetas: string; }

export default function PromocionesPage() {
    const { isAdmin, isColaborador } = useAuth();
    const canManage = isAdmin || isColaborador;

    const [promos, setPromos] = useState<Imagen[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<Set<string>>(new Set());
    const [downloadingAll, setDownloadingAll] = useState(false);
    const [toast, setToast] = useState('');

    // Management State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImg, setEditingImg] = useState<Imagen | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ titulo: '', etiquetas: '', archivo: null as File | null });
    const [toDelete, setToDelete] = useState<Imagen | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const all = await api.get('/imagenes');
            setPromos(all.filter((img: Imagen) => img.categoria === 'PROMO'));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const downloadImage = async (url: string, name: string, id?: string) => {
        try {
            if (id) setDownloading(prev => new Set(prev).add(id));
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${name.replace(/\s+/g, '_')}.jpg`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch { } finally { if (id) { setDownloading(prev => { const n = new Set(prev); n.delete(id!); return n; }); } }
    };

    const downloadAll = async () => {
        setDownloadingAll(true);
        for (const p of promos) { await downloadImage(p.url_base, p.titulo); await new Promise(r => setTimeout(r, 300)); }
        setDownloadingAll(false);
        showToast(`${promos.length} promociones descargadas ✅`);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('titulo', form.titulo);
            formData.append('etiquetas', form.etiquetas);
            formData.append('categoria', 'PROMO');
            if (form.archivo) formData.append('imagen', form.archivo);

            const token = localStorage.getItem('ares_token');
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/imagenes`;

            const res = await fetch(editingImg ? `${apiUrl}/${editingImg.id}` : apiUrl, {
                method: editingImg ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error('Failed');
            showToast(editingImg ? 'Actualizada ✅' : 'Publicada 🚀');
            setIsModalOpen(false);
            load();
        } catch { showToast('Error al guardar ❌'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        try {
            await api.delete(`/admin/imagenes/${toDelete.id}`);
            showToast('Eliminada 🗑️');
            setToDelete(null);
            load();
        } catch { showToast('Error al eliminar ❌'); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '8rem' }}>
            <AnimatePresence>{toast && (
                <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
                    style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: 'var(--surface-raised)', padding: '1rem 2rem', borderRadius: 'var(--radius-full)', border: '2px solid var(--color-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontWeight: 800 }}>
                    {toast}
                </motion.div>
            )}</AnimatePresence>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', lineHeight: 1, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="text-gradient-primary">PROMOCIONES</span>
                        <button onClick={load} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}><RefreshCw size={20} /></button>
                    </h1>
                    <p style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Imágenes de ofertas y promociones</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {canManage && (
                        <button className="btn-primary" onClick={() => { setEditingImg(null); setForm({ titulo: '', etiquetas: '', archivo: null }); setIsModalOpen(true); }}
                            style={{ padding: '0.7rem 1.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--ambient-1)', color: 'white' }}>
                            <Plus size={16} /> SUBIR NUEVA
                        </button>
                    )}
                    {promos.length > 0 && (
                        <button className="btn-primary" onClick={downloadAll} disabled={downloadingAll}
                            style={{ padding: '0.7rem 1.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {downloadingAll ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                            DESCARGAR TODAS ({promos.length})
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '5rem 0', textAlign: 'center' }}><Zap className="animate-pulse" size={40} color="var(--color-primary)" style={{ margin: '0 auto' }} /></div>
            ) : promos.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Megaphone size={50} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontWeight: 900, color: 'var(--text-primary)' }}>SIN PROMOCIONES</h3>
                    <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.5rem' }}>Aún no hay material de promociones disponible</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {promos.map((promo, idx) => (
                        <motion.div key={promo.id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            style={{ padding: 0, overflow: 'hidden', background: 'var(--surface-raised)' }}>
                            <div style={{ width: '100%', aspectRatio: '1/1', background: '#000', position: 'relative' }}>
                                <img src={promo.url_base} alt={promo.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {canManage && (
                                    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => { setEditingImg(promo); setForm({ titulo: promo.titulo, etiquetas: promo.etiquetas, archivo: null }); setIsModalOpen(true); }}
                                            style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => setToDelete(promo)}
                                            style={{ background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 900, fontSize: '0.85rem' }}>{promo.titulo}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                        {(() => { try { return JSON.parse(promo.etiquetas).join(', '); } catch { return ''; } })()}
                                    </div>
                                </div>
                                <button className="btn-primary" onClick={() => downloadImage(promo.url_base, promo.titulo, promo.id)}
                                    disabled={downloading.has(promo.id)} style={{ width: '42px', height: '42px', padding: 0, borderRadius: '14px' }}>
                                    {downloading.has(promo.id) ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal Carga/Edición */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-container" style={{ maxWidth: '400px', padding: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2 style={{ fontWeight: 900 }}>{editingImg ? 'EDITAR' : 'NUEVA'} <span className="text-gradient-primary">PROMO</span></h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="input-label">TÍTULO</label>
                                    <input className="input" required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Promo Combo" />
                                </div>
                                <div>
                                    <label className="input-label">ETIQUETAS (COMAS)</label>
                                    <input className="input" value={form.etiquetas} onChange={e => setForm({ ...form, etiquetas: e.target.value })} placeholder="netflix, etc" />
                                </div>
                                <div style={{ border: '2px dashed var(--color-primary)', padding: '2rem', borderRadius: '16px', textAlign: 'center', position: 'relative' }}>
                                    <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                        onChange={e => { const f = e.target.files?.[0]; if (f) setForm({ ...form, archivo: f }); }} />
                                    {form.archivo ? (
                                        <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{form.archivo.name}</div>
                                    ) : (
                                        <div style={{ opacity: 0.5 }}><Upload style={{ margin: '0 auto' }} /><p style={{ fontSize: '0.7rem', fontWeight: 900 }}>SELECCIONAR IMAGEN</p></div>
                                    )}
                                </div>
                                <button type="submit" disabled={saving || (!editingImg && !form.archivo)} className="btn-primary" style={{ height: '54px' }}>
                                    {saving ? <Loader2 className="animate-spin" /> : (editingImg ? 'GUARDAR CAMBIOS' : 'PUBLICAR PROMO')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Eliminar */}
            <AnimatePresence>
                {toDelete && (
                    <div className="modal-overlay">
                        <div className="modal-container" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem' }}>
                            <Trash2 size={48} color="var(--color-danger)" style={{ margin: '0 auto 1.5rem' }} />
                            <h3 style={{ fontWeight: 900 }}>¿ELIMINAR ESTA PROMO?</h3>
                            <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem', marginBottom: '2rem' }}>Esta acción no se puede deshacer.</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setToDelete(null)}>CANCELAR</button>
                                <button className="btn-primary" style={{ flex: 1, background: 'var(--color-danger)' }} onClick={handleDelete}>ELIMINAR</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
