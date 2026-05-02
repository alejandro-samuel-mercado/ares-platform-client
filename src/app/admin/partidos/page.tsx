/**
 * Gestión de Partidos — Ares Redesign v2.4 (Premium Hybrid Media)
 */

'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Trophy, Plus, Trash2, Edit2, Loader2, Clock, Tv, Search, X, Calendar, Upload, ImageIcon, Link, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Partido {
    id: string;
    equipo_local: string;
    equipo_visita: string;
    logo_local: string;
    logo_visita: string;
    liga: string;
    fecha: string;
    hora: string;
    canal: string;
    requiere_iptv: boolean;
    activo: boolean;
    imagen_personalizada?: string;
}

export default function PartidosAdminPage() {
    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [errorToast, setErrorToast] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        equipo_local: '',
        equipo_visita: '',
        logo_local: '',
        logo_visita: '',
        logo_local_archivo: null as File | null,
        logo_visita_archivo: null as File | null,
        liga: '',
        fecha: '',
        hora: '',
        canal: '',
        requiere_iptv: false,
        imagen_personalizada: '',
        imagen_personalizada_archivo: null as File | null
    });

    useEffect(() => { fetchPartidos(); }, []);

    const fetchPartidos = async () => {
        try {
            const data = await api.get('/admin/partidos');
            setPartidos(data);
        }
        catch (error) { console.error('Error fetching matches:', error); }
        finally { setLoading(false); }
    };

    const getTodayStr = () => new Date().toISOString().split('T')[0];

    const triggerToast = (msg: string) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorToast(null);
        try {
            const data = new FormData();
            data.append('equipo_local', formData.equipo_local);
            data.append('equipo_visita', formData.equipo_visita);
            data.append('liga', formData.liga);
            data.append('fecha', new Date(`${formData.fecha}T12:00:00Z`).toISOString());
            data.append('hora', formData.hora);
            data.append('canal', formData.canal);
            data.append('requiere_iptv', formData.requiere_iptv.toString());
            data.append('activo', 'true');
            data.append('logo_local', formData.logo_local || '');
            data.append('logo_visita', formData.logo_visita || '');

            if (formData.logo_local_archivo) {
                data.append('logo_local', formData.logo_local_archivo);
            }

            if (formData.logo_visita_archivo) {
                data.append('logo_visita', formData.logo_visita_archivo);
            }

            data.append('imagen_personalizada', formData.imagen_personalizada || '');
            if (formData.imagen_personalizada_archivo) {
                data.append('imagen_personalizada', formData.imagen_personalizada_archivo);
            }

            const token = localStorage.getItem('ares_token');
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/partidos`;

            const response = await fetch(editingId ? `${apiUrl}/${editingId}` : apiUrl, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Error al procesar encuentro');
            }

            triggerToast(editingId ? 'CAMBIOS GUARDADOS' : 'PARTIDO PUBLICADO EXITOSAMENTE');
            await fetchPartidos();
            closeModal();
        } catch (err: any) {
            setErrorToast(err.message || 'Error de conexión con el núcleo');
        } finally {
            setSaving(false);
        }
    };

    const openModal = (partido?: Partido) => {
        if (partido) {
            setEditingId(partido.id);
            setFormData({
                equipo_local: partido.equipo_local,
                equipo_visita: partido.equipo_visita,
                logo_local: partido.logo_local,
                logo_visita: partido.logo_visita,
                logo_local_archivo: null,
                logo_visita_archivo: null,
                liga: partido.liga || '',
                fecha: partido.fecha ? new Date(partido.fecha).toISOString().split('T')[0] : getTodayStr(),
                hora: partido.hora,
                canal: partido.canal,
                requiere_iptv: partido.requiere_iptv || false,
                imagen_personalizada: partido.imagen_personalizada || '',
                imagen_personalizada_archivo: null
            });
        } else {
            setEditingId(null);
            setFormData({
                equipo_local: '', equipo_visita: '', logo_local: '', logo_visita: '',
                logo_local_archivo: null, logo_visita_archivo: null,
                liga: '', fecha: getTodayStr(), hora: '', canal: '', requiere_iptv: false,
                imagen_personalizada: '', imagen_personalizada_archivo: null
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            equipo_local: '', equipo_visita: '', logo_local: '', logo_visita: '',
            logo_local_archivo: null, logo_visita_archivo: null,
            liga: '', fecha: '', hora: '', canal: '', requiere_iptv: false,
            imagen_personalizada: '', imagen_personalizada_archivo: null
        });
        setErrorToast(null);
    };

    const [confirmDelete, setConfirmDelete] = useState<{ id: string, equipo: string } | null>(null);

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/admin/partidos/${confirmDelete.id}`);
            triggerToast('ENCUENTRO ELIMINADO');
            setConfirmDelete(null);
            fetchPartidos();
        }
        catch {
            triggerToast('ERROR AL ELIMINAR');
        }
    };

    const filtered = partidos.filter(p => !!p.activo && String(p.activo) !== '0' && String(p.activo) !== 'false').filter(p =>
        p.equipo_local.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.equipo_visita.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.liga.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '40px', right: '40px', zIndex: 10000,
                            background: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '1.25rem 2rem', borderRadius: '24px',
                            border: '2px solid var(--color-primary)', boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
                            fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
                        }}
                    >
                        <Trophy size={20} color="var(--color-primary)" /> {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }} className='max-sm:flex-col max-sm:items-start max-sm:gap-4'>
                <div>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        PARTIDOS
                        <button
                            onClick={fetchPartidos}
                            className="btn-secondary"
                            style={{ padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Refrescar Encuentros"
                        >
                            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </h1>
                    <p style={{ fontWeight: 800, opacity: 0.5, color: 'var(--text-muted)' }}>CONTROL DE CARTELERA EN TIEMPO REAL</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary" style={{ padding: '1.25rem 2.5rem' }}>
                    <Plus size={22} /> NUEVO ENCUENTRO
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem' }} className='max-sm:flex-col max-sm:items-start max-sm:gap-4'>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input" placeholder="Buscar por equipo o liga..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '4rem', height: '64px' }} />
                </div>
                <div className="card-static max-sm:mx-auto" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 2rem', background: 'var(--surface-raised)' }}>
                    <Calendar size={20} color="var(--color-primary)" />
                    <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>{filtered.length} PLANIFICADOS</span>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--color-primary)" /></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))', gap: '2.5rem' }} className="max-md:px-4">
                    {filtered.map((p, j) => (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: j * 0.05 }}
                            className="card" style={{ padding: '0', overflow: 'hidden', background: 'var(--surface-card)' }}>
                            <div style={{ background: 'var(--color-primary)', color: 'var(--text-inverse)', padding: '0.75rem 1.5rem', borderBottom: '2.5px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase' }}>{p.liga}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    {p.requiere_iptv && <div className="chip" style={{ background: 'gold', color: '#000', fontSize: '0.6rem', padding: '0.2rem 0.6rem', border: '1px solid #000' }}>👑 PRO</div>}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '60px' }}>
                                        <span style={{ fontWeight: 900, fontSize: '0.7rem', opacity: 0.9, color: 'var(--text-inverse)' }}>
                                            {p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '---'}
                                        </span>
                                        <span style={{ fontWeight: 900, fontSize: '0.8rem' }}>{p.hora}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: p.imagen_personalizada ? '0' : '2rem', position: 'relative' }}>
                                {p.imagen_personalizada ? (
                                    <div style={{ position: 'relative', width: '100%', height: '200px', background: '#000', overflow: 'hidden' }}>
                                        <img
                                            src={p.imagen_personalizada}
                                            alt="Flyer"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div style={{ position: 'absolute', bottom: '10px', left: '10px', padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                                            <Tv size={14} /> {p.canal}
                                        </div>
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => openModal(p)} style={{ background: 'rgba(255,255,255,0.9)', color: '#000', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => setConfirmDelete({ id: p.id, equipo: `${p.equipo_local} vs ${p.equipo_visita}` })} style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} title="Eliminar">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                            <div style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{ width: '70px', height: '70px', margin: '0 auto 0.5rem', background: 'white', borderRadius: '16px', padding: '0.5rem', border: '3px solid #000', filter: 'drop-shadow(5px 5px 0px #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {p.logo_local ? (
                                                        <img src={p.logo_local} alt="Local" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                    ) : (
                                                        <Trophy size={28} style={{ opacity: 0.1, color: '#000' }} />
                                                    )}
                                                </div>
                                                <p style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.equipo_local}</p>
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, opacity: 0.2, color: 'var(--text-primary)' }}>VS</div>
                                            <div style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{ width: '70px', height: '70px', margin: '0 auto 0.5rem', background: 'white', borderRadius: '16px', padding: '0.5rem', border: '3px solid #000', filter: 'drop-shadow(5px 5px 0px #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {p.logo_visita ? (
                                                        <img src={p.logo_visita} alt="Visita" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                    ) : (
                                                        <Trophy size={28} style={{ opacity: 0.1, color: '#000' }} />
                                                    )}
                                                </div>
                                                <p style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.equipo_visita}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                <Tv size={16} color="var(--color-primary)" /> {p.canal}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => openModal(p)} className="btn-secondary" style={{ padding: '0.5rem', border: 'none', background: 'transparent', boxShadow: 'none' }} title="Editar">
                                                    <Edit2 size={20} color="var(--color-primary)" />
                                                </button>
                                                <button onClick={() => setConfirmDelete({ id: p.id, equipo: `${p.equipo_local} vs ${p.equipo_visita}` })} className="btn-secondary" style={{ padding: '0.5rem', color: 'var(--color-danger)', border: 'none', background: 'transparent', boxShadow: 'none' }} title="Eliminar">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal Alta */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-container" style={{ maxWidth: '850px', padding: '3rem', background: 'var(--surface-overlay)', border: '4px solid #000', borderRadius: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', fontWeight: 900 }}>{editingId ? 'EDITAR' : 'AGREGAR'} <span className="text-gradient-primary">ENCUENTRO</span></h2>
                                <button onClick={closeModal} className="btn-ghost" style={{ padding: 0, background: 'transparent', border: 'none' }}><X size={32} color="var(--text-primary)" /></button>
                            </div>

                            {errorToast && (
                                <div style={{ background: '#EF4444', color: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 900, border: '3px solid #000', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertCircle size={20} /> {errorToast.toUpperCase()}
                                </div>
                            )}

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <style>{`
                    .partido-form-row { display: grid; grid-template-columns: 1.1fr 0.9fr 1fr; gap: 1rem; }
                    .partido-teams-row { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
                    @media (max-width: 768px) {
                        .partido-form-row, .partido-teams-row { grid-template-columns: 1fr; gap: 1rem; }
                    }
                `}</style>
                                <div className="partido-form-row">
                                    <div>
                                        <label className="input-label">Liga / Torneo</label>
                                        <input className="input" placeholder="Liga" value={formData.liga} onChange={e => setFormData({ ...formData, liga: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="input-label">Fecha</label>
                                        <input className="input" type="date" value={formData.fecha} onChange={e => setFormData({ ...formData, fecha: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="input-label">Hora (Local)</label>
                                        <input className="input" placeholder="ej: 20:00" value={formData.hora} onChange={e => setFormData({ ...formData, hora: e.target.value })} required />
                                    </div>
                                </div>

                                <div className="partido-teams-row">
                                    {/* LOCAL */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label className="input-label">Equipo Local</label>
                                            <input className="input" placeholder="Nombre" value={formData.equipo_local} onChange={e => setFormData({ ...formData, equipo_local: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="input-label">URL Logo Local</label>
                                            <div style={{ position: 'relative' }}>
                                                <Link size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                                <input className="input" placeholder="https://..." value={formData.logo_local} onChange={e => setFormData({ ...formData, logo_local: e.target.value })} style={{ paddingLeft: '3rem' }} />
                                            </div>
                                        </div>
                                        <div className="upload-zone">
                                            <input type="file" accept="image/*" onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) setFormData({ ...formData, logo_local_archivo: file });
                                            }} />
                                            {formData.logo_local_archivo ? (
                                                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)', zIndex: 1 }}>
                                                    <ImageIcon size={20} style={{ margin: '0 auto 4px' }} />
                                                    {formData.logo_local_archivo.name.toUpperCase()}
                                                    <p style={{ opacity: 0.5, fontSize: '0.6rem' }}>LISTO PARA SUBIR</p>
                                                </div>
                                            ) : formData.logo_local ? (
                                                <div style={{ textAlign: 'center', zIndex: 1 }}>
                                                    <img src={formData.logo_local} style={{ width: '40px', height: '40px', objectFit: 'contain', margin: '0 auto' }} />
                                                    <p style={{ fontSize: '0.6rem', fontWeight: 900, marginTop: '4px' }}>REEMPLAZAR ARCHIVO</p>
                                                </div>
                                            ) : (
                                                <div style={{ opacity: 0.5, zIndex: 1 }}>
                                                    <Upload size={20} style={{ margin: '0 auto 4px' }} />
                                                    <p style={{ fontSize: '0.7rem', fontWeight: 900 }}>SUBIR LOGO LOCAL</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* VISITA */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label className="input-label">Equipo Visita</label>
                                            <input className="input" placeholder="Nombre" value={formData.equipo_visita} onChange={e => setFormData({ ...formData, equipo_visita: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="input-label">URL Logo Visita</label>
                                            <div style={{ position: 'relative' }}>
                                                <Link size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                                <input className="input" placeholder="https://..." value={formData.logo_visita} onChange={e => setFormData({ ...formData, logo_visita: e.target.value })} style={{ paddingLeft: '3rem' }} />
                                            </div>
                                        </div>
                                        <div className="upload-zone">
                                            <input type="file" accept="image/*" onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) setFormData({ ...formData, logo_visita_archivo: file });
                                            }} />
                                            {formData.logo_visita_archivo ? (
                                                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)', zIndex: 1 }}>
                                                    <ImageIcon size={20} style={{ margin: '0 auto 4px' }} />
                                                    {formData.logo_visita_archivo.name.toUpperCase()}
                                                    <p style={{ opacity: 0.5, fontSize: '0.6rem' }}>LISTO PARA SUBIR</p>
                                                </div>
                                            ) : formData.logo_visita ? (
                                                <div style={{ textAlign: 'center', zIndex: 1 }}>
                                                    <img src={formData.logo_visita} style={{ width: '40px', height: '40px', objectFit: 'contain', margin: '0 auto' }} />
                                                    <p style={{ fontSize: '0.6rem', fontWeight: 900, marginTop: '4px' }}>REEMPLAZAR ARCHIVO</p>
                                                </div>
                                            ) : (
                                                <div style={{ opacity: 0.5, zIndex: 1 }}>
                                                    <Upload size={20} style={{ margin: '0 auto 4px' }} />
                                                    <p style={{ fontSize: '0.7rem', fontWeight: 900 }}>SUBIR LOGO VISITA</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="card" style={{ padding: '1.25rem', background: 'var(--surface-raised)', borderWidth: '2px', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                    <div>
                                        <span style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--color-primary)' }}>FLYER DEL PARTIDO (OPCIONAL)</span>
                                        <p style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700 }}>Si subes una foto publicitaria, los vendedores podrán descargar esta foto en lugar de ver la tarjeta autogenerada.</p>
                                    </div>
                                    <div className="upload-zone" style={{ borderStyle: 'solid', borderColor: 'rgba(0,0,0,0.1)' }}>
                                        <input type="file" accept="image/*" onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) setFormData({ ...formData, imagen_personalizada_archivo: file });
                                        }} />
                                        {formData.imagen_personalizada_archivo ? (
                                            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-primary)', zIndex: 1, padding: '1rem' }}>
                                                <ImageIcon size={24} style={{ margin: '0 auto 8px' }} />
                                                {formData.imagen_personalizada_archivo.name.toUpperCase()}
                                            </div>
                                        ) : formData.imagen_personalizada ? (
                                            <div style={{ textAlign: 'center', zIndex: 1, padding: '0.5rem' }}>
                                                <img src={formData.imagen_personalizada} style={{ width: '80px', height: '60px', objectFit: 'cover', margin: '0 auto', borderRadius: '8px', border: '2px solid #000' }} />
                                                <p style={{ fontSize: '0.7rem', fontWeight: 900, marginTop: '8px' }}>CLIC PARA REEMPLAZAR</p>
                                            </div>
                                        ) : (
                                            <div style={{ opacity: 0.5, zIndex: 1, padding: '1rem' }}>
                                                <Upload size={24} style={{ margin: '0 auto 8px' }} />
                                                <p style={{ fontSize: '0.8rem', fontWeight: 900 }}>SUBIR FLYER .JPG/PNG</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Canal de Transmisión</label>
                                    <input className="input" placeholder="ej: ESPN, Star+, etc." value={formData.canal} onChange={e => setFormData({ ...formData, canal: e.target.value })} required />
                                </div>

                                <div className="card" style={{ padding: '1.25rem', background: 'var(--surface-raised)', borderWidth: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>EXCLUSIVO PLAN PRO</span>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700 }}>Marcar si este partido impulsa la venta del Plan Pro.</span>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={formData.requiere_iptv} onChange={e => setFormData({ ...formData, requiere_iptv: e.target.checked })} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <button type="submit" disabled={saving} className="btn-primary" style={{ width: '100%', padding: '1.5rem', fontSize: '1.1rem' }}>
                                    {saving ? <Loader2 size={24} className="animate-spin" /> : editingId ? 'GUARDAR CAMBIOS' : 'PUBLICAR PARTIDO'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Delete */}
            <AnimatePresence>
                {confirmDelete && (
                    <div className="modal-overlay">
                        <div className="modal-container" style={{ maxWidth: '400px', textAlign: 'center', padding: '3rem', border: '4px solid var(--color-danger)', background: 'var(--surface-overlay)', borderRadius: '24px' }}>
                            <Trash2 size={48} color="var(--color-danger)" style={{ margin: '0 auto 1.5rem' }} />
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 900 }}>¿BORRAR PARTIDO?</h3>
                            <p style={{ fontWeight: 800, opacity: 0.6, marginBottom: '2.5rem', color: 'var(--text-primary)' }}>{confirmDelete.equipo}</p>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <button className="btn-secondary" style={{ flex: 1, border: 'none' }} onClick={() => setConfirmDelete(null)}>NO</button>
                                <button className="btn-primary" style={{ flex: 1, background: 'var(--color-danger)' }} onClick={handleDelete}>SI, BORRAR</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
