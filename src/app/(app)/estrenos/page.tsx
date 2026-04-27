'use client';
/**
 * Vendor: Feed de Estrenos — Novedades de plataformas de streaming
 */
import React, { useState, useEffect } from 'react';
import { Clapperboard, Search, Loader2, CalendarDays, RefreshCw, Download, Plus, Trash2, Edit2, X, Upload, ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useWatermark } from '@/hooks/useWatermark';
import { WatermarkedImage } from '@/components/WatermarkedImage';
import { downloadMedia } from '@/lib/mediaUtils';

interface Estreno {
    id: string;
    titulo: string;
    descripcion?: string;
    plataforma: string;
    fecha_estreno?: string;
    imagen_url?: string;
}

interface Plataforma {
    id: string;
    nombre: string;
    color: string;
    emoji?: string;
}

export default function EstrenosVendorPage() {
    const { isAdmin, isColaborador, vendor } = useAuth();
    const { settings, getUrl } = useWatermark();
    const canManage = isAdmin || isColaborador;

    const [estrenos, setEstrenos] = useState<Estreno[]>([]);
    const [dbPlataformas, setDbPlataformas] = useState<Plataforma[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterPlataforma, setFilterPlataforma] = useState('TODOS');
    const [downloading, setDownloading] = useState<Set<string>>(new Set());
    const [downloadingAll, setDownloadingAll] = useState(false);
    const [toast, setToast] = useState('');

    // Management State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [errorToast, setErrorToast] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Estreno | null>(null);
    const [form, setForm] = useState({
        titulo: '', descripcion: '', plataforma: 'NETFLIX',
        fecha_estreno: '', imagen_url: '', imagen_archivo: null as File | null
    });

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const downloadImage = async (url: string, name: string, id?: string) => {
        await downloadMedia(
            url,
            name,
            vendor,
            settings || undefined,
            () => id && setDownloading(prev => new Set(prev).add(id)),
            () => id && setDownloading(prev => { const n = new Set(prev); n.delete(id!); return n; })
        );
    };

    const downloadAll = async () => {
        const withImages = filtered.filter(e => e.imagen_url);
        setDownloadingAll(true);
        for (const e of withImages) { await downloadImage(e.imagen_url!, e.titulo); await new Promise(r => setTimeout(r, 300)); }
        setDownloadingAll(false);
        showToast(`${withImages.length} imágenes descargadas ✅`);
    };

    const fetchEstrenos = async () => {
        setLoading(true);
        try {
            const [estrenosData, plataformasData] = await Promise.all([
                api.get('/estrenos'),
                api.get('/plataformas')
            ]);
            setEstrenos(estrenosData);
            setDbPlataformas(plataformasData);
            if (plataformasData.length > 0 && !form.plataforma) {
                setForm(prev => ({ ...prev, plataforma: plataformasData[0].nombre }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEstrenos();
    }, []);

    const openModal = (e?: Estreno) => {
        if (e) {
            setEditingId(e.id);
            setForm({
                titulo: e.titulo, descripcion: e.descripcion || '', plataforma: e.plataforma,
                fecha_estreno: e.fecha_estreno ? e.fecha_estreno.slice(0, 10) : '',
                imagen_url: e.imagen_url || '', imagen_archivo: null
            });
        } else {
            setEditingId(null);
            setForm({
                titulo: '', descripcion: '', plataforma: dbPlataformas[0]?.nombre || 'NETFLIX',
                fecha_estreno: new Date().toISOString().slice(0, 10),
                imagen_url: '', imagen_archivo: null
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (ev: React.FormEvent) => {
        ev.preventDefault();
        setSaving(true);
        setErrorToast(null);
        try {
            const data = new FormData();
            data.append('titulo', form.titulo);
            data.append('descripcion', form.descripcion);
            data.append('plataforma', form.plataforma);
            data.append('fecha_estreno', form.fecha_estreno);
            data.append('imagen_url', form.imagen_url);
            if (form.imagen_archivo) data.append('imagen', form.imagen_archivo);

            const token = localStorage.getItem('ares_token');
            const baseHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            const url = editingId ? `${baseHost}/admin/estrenos/${editingId}` : `${baseHost}/admin/estrenos`;

            const res = await window.fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: data
            });

            if (!res.ok) throw new Error('Error al guardar');
            showToast(editingId ? 'Estreno actualizado' : 'Estreno creado');
            setIsModalOpen(false);
            fetchEstrenos();
        } catch { setErrorToast('Error al guardar estreno'); } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/admin/estrenos/${confirmDelete.id}`);
            setConfirmDelete(null);
            fetchEstrenos();
            showToast('ESTRENO ELIMINADO');
        } catch { showToast('ERROR AL ELIMINAR'); }
    };

    const filterTabs = ['TODOS', ...dbPlataformas.map(p => p.nombre)];

    const filtered = estrenos.filter(e => {
        const matchSearch = e.titulo.toLowerCase().includes(search.toLowerCase());
        const matchPlat = filterPlataforma === 'TODOS' || e.plataforma === filterPlataforma;
        return matchSearch && matchPlat;
    });

    return (
        <div style={{ paddingBottom: '8rem' }}>
            {/* Toast */}
            <AnimatePresence>{toast && (
                <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
                    style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: 'var(--surface-raised)', padding: '1rem 2rem', borderRadius: 'var(--radius-full)', border: '2px solid var(--color-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontWeight: 800 }}>
                    {toast}
                </motion.div>
            )}</AnimatePresence>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Clapperboard color="var(--color-primary)" />
                        <div className='flex max-sm:flex-col'>
                            ESTRENOS &<span className="text-gradient-primary"> NOVEDADES</span>
                        </div>
                        <button
                            onClick={fetchEstrenos}
                            className="btn-secondary"
                            style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Refrescar Estrenos"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </h1>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.5 }}>LAS ÚLTIMAS NOTICIAS DE STREAMING PARA TUS CLIENTES</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {canManage && (
                        <button className="btn-primary" onClick={() => openModal()} style={{ padding: '0.7rem 1.2rem', fontSize: '0.75rem', background: 'var(--ambient-1)', color: 'white' }}>
                            <Plus size={16} /> NUEVO ESTRENO
                        </button>
                    )}
                    {filtered.filter(e => e.imagen_url).length > 0 && (
                        <button className="btn-secondary" onClick={downloadAll} disabled={downloadingAll}
                            style={{ padding: '0.7rem 1.2rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '2px solid #000' }}>
                            {downloadingAll ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                            DESCARGAR TODOS
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                <input className="input" placeholder="Buscar estreno..." style={{ paddingLeft: '3.5rem' }} value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Platform Filter */}
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', scrollbarWidth: 'none', }}>
                {filterTabs.map(p => {
                    const platInfo = dbPlataformas.find(x => x.nombre === p);
                    const color = platInfo?.color || 'var(--color-primary)';
                    return (
                        <button key={p} onClick={() => setFilterPlataforma(p)}
                            style={{
                                whiteSpace: 'nowrap', padding: '0.5rem 1.25rem', borderRadius: 20, border: '2px solid',
                                borderColor: filterPlataforma === p ? color : '#00000020',
                                background: filterPlataforma === p ? color : 'transparent',
                                color: filterPlataforma === p ? 'white' : 'inherit', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer'
                            }}>
                            {platInfo?.emoji || '🎬'} {p}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={48} color="var(--color-primary)" /></div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '5rem', borderStyle: 'dashed', opacity: 0.4 }}>
                    <Clapperboard size={64} style={{ margin: '0 auto 1.5rem' }} />
                    <p style={{ fontWeight: 900 }}>SIN ESTRENOS DISPONIBLES</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }} className='px-[10vw] max-sm:px-2'>
                    {filtered.map((e, i) => (
                        <motion.div key={e.id} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Image */}
                            <div style={{ height: '360px', position: 'relative', overflow: 'hidden' }}>
                                {e.imagen_url
                                    ? <WatermarkedImage
                                        src={e.imagen_url}
                                        settings={settings || undefined}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        alt={e.titulo}
                                    />
                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Clapperboard size={64} color="white" style={{ opacity: 0.1 }} />
                                    </div>}
                                <div style={{
                                    position: 'absolute', top: 12, left: 12,
                                    background: dbPlataformas.find(p => p.nombre === e.plataforma)?.color || '#000',
                                    color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 900
                                }}>
                                    {dbPlataformas.find(p => p.nombre === e.plataforma)?.emoji} {e.plataforma}
                                </div>
                                {canManage && (
                                    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => openModal(e)} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => setConfirmDelete(e)} style={{ background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {/* Info */}
                            <div style={{ padding: '1.25rem' }}>
                                <h3 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.4rem' }}>{e.titulo}</h3>
                                {e.descripcion && <p style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 600, marginBottom: '0.75rem' }}>{e.descripcion}</p>}
                                {e.fecha_estreno && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 900, fontSize: '0.7rem' }}>
                                        <CalendarDays size={14} />
                                        {new Date(e.fecha_estreno).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </div>
                                )}
                            </div>
                            {/* Download button */}
                            {e.imagen_url && (
                                <div style={{ padding: '0 1.25rem 1.25rem' }}>
                                    <button className="btn-primary" onClick={() => downloadImage(e.imagen_url!, e.titulo, e.id)} disabled={downloading.has(e.id)}
                                        style={{ width: '100%', height: '40px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        {downloading.has(e.id) ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />} DESCARGAR
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal Alta/Edición */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-container" style={{ maxWidth: '600px', padding: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>{editingId ? 'EDITAR' : 'NUEVO'} <span className="text-gradient-primary">ESTRENO</span></h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            {errorToast && (
                                <div style={{ background: 'var(--color-danger)', color: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                    <AlertCircle size={18} /> {errorToast.toUpperCase()}
                                </div>
                            )}

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="input-label">TÍTULO DE LA OBRA</label>
                                    <input className="input" placeholder="Ej: Deadpool & Wolverine" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="input-label">PLATAFORMA</label>
                                        <select className="input" value={form.plataforma} onChange={e => setForm({ ...form, plataforma: e.target.value })}>
                                            {dbPlataformas.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="input-label">FECHA DE SALIDA</label>
                                        <input className="input" type="date" value={form.fecha_estreno} onChange={e => setForm({ ...form, fecha_estreno: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">RESUMEN / DESCRIPCIÓN (OPCIONAL)</label>
                                    <textarea className="input" rows={3} placeholder="Breve sinopsis..." value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                                </div>

                                <div>
                                    <label className="input-label">URL DE POSTER (OPCIONAL)</label>
                                    <input className="input" placeholder="https://..." value={form.imagen_url} onChange={e => setForm({ ...form, imagen_url: e.target.value })} />
                                </div>

                                <div className="upload-zone">
                                    <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setForm({ ...form, imagen_archivo: f }); }} />
                                    {form.imagen_archivo ? (
                                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-primary)' }}>{form.imagen_archivo.name}</div>
                                    ) : form.imagen_url ? (
                                        <img src={form.imagen_url} style={{ height: '40px', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ opacity: 0.5 }}>
                                            <Upload size={24} style={{ margin: '0 auto 0.5rem' }} />
                                            <p style={{ fontSize: '0.7rem', fontWeight: 900 }}>SUBIR POSTER LOCAL</p>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '1.25rem', fontSize: '1rem' }}>
                                    {saving ? <Loader2 className="animate-spin" size={24} /> : (editingId ? 'GUARDAR CAMBIOS' : 'PUBLICAR ESTRENO')}
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
                            <h3 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.5rem' }}>¿ELIMINAR ESTRENO?</h3>
                            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '2rem', fontWeight: 600 }}>
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

            {/* Toast Global */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '110px', left: '50%', transform: 'translateX(-50%)',
                            background: '#000', color: '#fff', padding: '1rem 2rem', borderRadius: '20px',
                            border: '2.5px solid var(--color-primary)', fontWeight: 900, zIndex: 10000,
                            boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.75rem'
                        }}
                    >
                        <CheckCircle2 color="var(--color-primary)" size={20} />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
