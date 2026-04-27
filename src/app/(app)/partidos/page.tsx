'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Trophy, Clock, Tv, Copy, Calendar as CalendarIcon, Zap, Loader2, Star, MessageCircle, RefreshCw, Download, Plus, Trash2, Edit2, X, Upload, ImageIcon, Link as LinkIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useAuth } from '@/lib/auth';
import { useWatermark } from '@/hooks/useWatermark';
import { WatermarkedImage } from '@/components/WatermarkedImage';
import { downloadMedia } from '@/lib/mediaUtils';
import { shouldApplyWatermark } from '@/lib/watermark';

interface Partido {
    id: string;
    equipo_local: string;
    equipo_visita: string;
    logo_local?: string;
    logo_visita?: string;
    liga: string;
    fecha: string;
    hora: string;
    canal: string;
    requiere_iptv: boolean;
    imagen_personalizada?: string;
}

export default function PartidosVendorPage() {
    const { isAdmin, isColaborador, vendor } = useAuth();
    const { settings, getUrl } = useWatermark();
    const canManage = isAdmin || isColaborador;
    const applyWM = shouldApplyWatermark(vendor?.plan_id, settings || undefined);

    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [userPlan, setUserPlan] = useState('');
    const [downloadingImg, setDownloadingImg] = useState<Set<string>>(new Set());
    const [downloadingAll, setDownloadingAll] = useState(false);

    // Management State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [errorToast, setErrorToast] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Partido | null>(null);

    const [formData, setFormData] = useState({
        equipo_local: '', equipo_visita: '', logo_local: '', logo_visita: '',
        logo_local_archivo: null as File | null,
        logo_visita_archivo: null as File | null,
        liga: '', fecha: '', hora: '', canal: '', requiere_iptv: false,
        imagen_personalizada: '', imagen_personalizada_archivo: null as File | null
    });

    useEffect(() => { fetchPartidos(); }, []);

    const fetchPartidos = async () => {
        try {
            const [partidosData, profileData] = await Promise.all([
                api.get('/partidos'),
                api.get('/perfil')
            ]);
            setPartidos(partidosData);
            setUserPlan(profileData.plan);
        } catch (error) {
            console.error('Error fetching matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const triggerToast = (msg: string) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const downloadFixture = async (id: string, equipoLocal: string, equipoVisita: string, customImage?: string) => {
        try {
            setDownloadingImg(prev => new Set(prev).add(id));
            if (customImage && customImage.startsWith('http')) {
                await downloadMedia(
                    customImage,
                    `Flyer_${equipoLocal}_vs_${equipoVisita}`,
                    vendor,
                    settings || undefined
                );
                setDownloadingImg(prev => { const n = new Set(prev); n.delete(id); return n; });
                return;
            }
            const node = document.getElementById(`fixture-export-${id}`);
            if (!node) return;
            const canvas = await html2canvas(node, { useCORS: true, allowTaint: true, backgroundColor: '#000', scale: 1, imageTimeout: 15000 });
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            const link = document.createElement('a');
            link.download = `Fixture_${equipoLocal}_vs_${equipoVisita}.jpg`.replace(/\s+/g, '_');
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error downloading fixture:', err);
        } finally {
            const next = new Set(downloadingImg);
            next.delete(id);
            setDownloadingImg(next);
        }
    };

    const downloadAllFixtures = async () => {
        setDownloadingAll(true);
        for (const p of partidos) {
            if (!p.requiere_iptv || userPlan?.toUpperCase() === 'PRO') {
                await downloadFixture(p.id, p.equipo_local, p.equipo_visita, p.imagen_personalizada);
                await new Promise(r => setTimeout(r, 400));
            }
        }
        setDownloadingAll(false);
        triggerToast('COPIADA Y DESCARGADA!');
    };

    const copyCartelera = () => {
        if (partidos.length === 0) return;
        const fechaStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        let text = `🏆 *CARTELERA DEPORTIVA - ${fechaStr.toUpperCase()}* 🏆\n\n`;
        const porLiga: Record<string, Partido[]> = {};
        partidos.forEach(p => { if (!porLiga[p.liga]) porLiga[p.liga] = []; porLiga[p.liga].push(p); });
        for (const [liga, matches] of Object.entries(porLiga)) {
            text += `📍 *${liga.toUpperCase()}*\n`;
            matches.forEach(m => { text += `⚽ ${m.equipo_local} vs ${m.equipo_visita}\n⏰ ${m.hora} | 📺 ${m.canal}\n\n`; });
        }
        text += `🔥 *ACTIVA TU CUENTA AHORA* 🔥\n¡No te pierdas ningún partido!`;
        navigator.clipboard.writeText(text);
        triggerToast('COPIADA!');
    };

    const shareToWhatsApp = () => {
        if (partidos.length === 0) return;
        const fechaStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        let text = `🏆 *CARTELERA DEPORTIVA - ${fechaStr.toUpperCase()}* 🏆\n\n`;
        const porLiga: Record<string, Partido[]> = {};
        partidos.forEach(p => { if (!porLiga[p.liga]) porLiga[p.liga] = []; porLiga[p.liga].push(p); });
        for (const [liga, matches] of Object.entries(porLiga)) {
            text += `📍 *${liga.toUpperCase()}*\n`;
            matches.forEach(m => { text += `⚽ ${m.equipo_local} vs ${m.equipo_visita}\n⏰ ${m.hora} | 📺 ${m.canal}\n\n`; });
        }
        text += `🔥 *ACTIVA TU CUENTA AHORA* 🔥\n¡No te pierdas ningún partido!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const openModal = (p?: Partido) => {
        if (p) {
            setEditingId(p.id);
            setFormData({
                equipo_local: p.equipo_local, equipo_visita: p.equipo_visita,
                logo_local: p.logo_local || '', logo_visita: p.logo_visita || '',
                logo_local_archivo: null, logo_visita_archivo: null,
                liga: p.liga, fecha: p.fecha ? new Date(p.fecha).toISOString().split('T')[0] : '',
                hora: p.hora, canal: p.canal, requiere_iptv: p.requiere_iptv,
                imagen_personalizada: p.imagen_personalizada || '', imagen_personalizada_archivo: null
            });
        } else {
            setEditingId(null);
            setFormData({
                equipo_local: '', equipo_visita: '', logo_local: '', logo_visita: '',
                logo_local_archivo: null, logo_visita_archivo: null,
                liga: '', fecha: new Date().toISOString().split('T')[0], hora: '', canal: '', requiere_iptv: false,
                imagen_personalizada: '', imagen_personalizada_archivo: null
            });
        }
        setIsModalOpen(true);
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
            if (formData.logo_local_archivo) data.append('logo_local', formData.logo_local_archivo);
            if (formData.logo_visita_archivo) data.append('logo_visita', formData.logo_visita_archivo);
            data.append('imagen_personalizada', formData.imagen_personalizada || '');
            if (formData.imagen_personalizada_archivo) data.append('imagen_personalizada', formData.imagen_personalizada_archivo);

            const token = localStorage.getItem('ares_token');
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/partidos`;
            const response = await fetch(editingId ? `${apiUrl}/${editingId}` : apiUrl, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });
            if (!response.ok) throw new Error('Error al guardar');
            triggerToast(editingId ? 'CAMBIOS GUARDADOS' : 'PARTIDO PUBLICADO');
            fetchPartidos();
            setIsModalOpen(false);
        } catch (err) { setErrorToast('Error al guardar encuentro'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/admin/partidos/${confirmDelete.id}`);
            triggerToast('PARTIDO ELIMINADO');
            setConfirmDelete(null);
            fetchPartidos();
        } catch { triggerToast('ERROR AL ELIMINAR'); }
    };

    return (
        <div style={{ padding: '1.5rem 1.5rem 8rem 1.5rem' }}>
            {/* Modal Confirmar Eliminación */}
            <AnimatePresence>
                {confirmDelete && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-container" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Trash2 size={40} color="var(--color-danger)" />
                            </div>
                            <h3 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.5rem' }}>¿ELIMINAR PARTIDO?</h3>
                            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '2rem', fontWeight: 600 }}>
                                Se eliminará "{confirmDelete.equipo_local} vs {confirmDelete.equipo_visita}". Esta acción no se puede deshacer.
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
                {showToast && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#000',
                            color: '#fff',
                            padding: '1rem 2rem',
                            borderRadius: '20px',
                            border: '1.5px solid var(--color-primary)',
                            fontWeight: 900,
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)'
                        }}
                    >
                        <CheckCircle2 color="var(--color-primary)" size={20} />
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Trophy color="var(--color-secondary)" />
                            CARTELERA <span className="text-gradient-primary">TV</span>
                        </h1>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>EVENTOS DEPORTIVOS DE HOY</p>
                    </div>
                    <button
                        onClick={fetchPartidos}
                        className="btn-secondary"
                        style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Refrescar Cartelera"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {canManage && (
                        <button className="btn-primary" onClick={() => openModal()} style={{ padding: '0.7rem 1.2rem', fontSize: '0.8rem', background: 'var(--ambient-1)', color: 'white' }}>
                            <Plus size={18} /> NUEVO PARTIDO
                        </button>
                    )}
                    {partidos.length > 0 && (
                        <>
                            {(!partidos.every(p => p.requiere_iptv) || userPlan?.toUpperCase() === 'PRO') && (
                                <motion.button whileTap={{ scale: 0.9 }} onClick={downloadAllFixtures} disabled={downloadingAll} className="btn-secondary"
                                    style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', fontSize: '0.8rem', gap: '0.5rem', color: 'var(--text-primary)', border: '2px solid #000' }}>
                                    {downloadingAll ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                    <span className="hidden md:inline">DESCARGAR TODOS</span>
                                </motion.button>
                            )}
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => shareToWhatsApp()} className="btn-secondary"
                                style={{ width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', background: '#25D366', color: 'white', border: 'none' }}>
                                <MessageCircle size={20} />
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={copyCartelera} className="btn-primary"
                                style={{ width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px' }}>
                                <Copy size={20} />
                            </motion.button>
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
                </div>
            ) : partidos.length === 0 ? (
                <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <CalendarIcon size={48} style={{ opacity: 0.1, margin: '0 auto 1.5rem auto' }} />
                    <p style={{ fontWeight: 800, fontSize: '0.9rem', opacity: 0.4 }}>SIN EVENTOS PROGRAMADOS</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 max-md:grid-cols-1 xl:grid-cols-3 gap-6 max-md:px-10">
                    {partidos.map((p, idx) => (
                        <motion.div key={p.id} id={`fixture-${p.id}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                            className="card" style={{ padding: '0', overflow: 'hidden', background: 'var(--surface-raised)', position: 'relative' }}>

                            <div style={{
                                background: 'var(--surface-raised)', padding: '0.6rem 1.25rem', borderBottom: '2.5px solid #000',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>{p.liga}</span>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '70px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                                            <Clock size={14} /> {p.hora}
                                        </div>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.7 }}>
                                            {p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '---'}
                                        </span>
                                    </div>
                                    {canManage && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => openModal(p)} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => setConfirmDelete(p)} style={{ background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {p.imagen_personalizada && p.imagen_personalizada.startsWith('http') ? (
                                <div style={{ position: 'relative', width: '100%', height: '220px', background: '#000', overflow: 'hidden' }}>
                                    <img
                                        src={getUrl(p.imagen_personalizada)}
                                        crossOrigin="anonymous"
                                        alt="Flyer"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-primary)', fontWeight: 900, fontSize: '0.7rem' }}>
                                            <Tv size={12} /> {p.canal}
                                        </div>
                                    </div>
                                    {p.requiere_iptv && userPlan?.toUpperCase() !== 'PRO' ? (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                            <Link href="/plan" style={{
                                                fontSize: '0.6rem', fontWeight: 900, color: '#fff',
                                                textDecoration: 'none', border: '1px solid gold',
                                                padding: '0.3rem 0.6rem', borderRadius: '8px',
                                                display: 'flex', alignItems: 'center', gap: '0.2rem',
                                                background: 'rgba(0,0,0,0.8)'
                                            }}>
                                                UPGRADE PRO <Zap size={10} color="gold" />
                                            </Link>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                                            <div className="chip chip-gold" style={{ fontSize: '0.55rem', border: 'none', background: '#000', color: 'white', padding: '0.1rem 0.5rem' }}>LIVE</div>
                                            {p.requiere_iptv && <div style={{ fontSize: '0.5rem', fontWeight: 900, color: 'gold', background: 'rgba(0,0,0,0.8)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>⭐ PRO</div>}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '18px', border: '2px solid #000', padding: '6px', background: 'white', boxShadow: '4px 4px 0px 0px #000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {p.logo_local && p.logo_local.startsWith('http') ? (
                                                <img src={p.logo_local} crossOrigin="anonymous" alt="Local" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <Trophy size={20} style={{ opacity: 0.1 }} />
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 900, textAlign: 'center' }}>{p.equipo_local}</span>
                                    </div>

                                    <div style={{ fontWeight: 900, opacity: 0.2, fontSize: '1.2rem' }}>VS</div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '18px', border: '2px solid #000', padding: '6px', background: 'white', boxShadow: '4px 4px 0px 0px #000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {p.logo_visita && p.logo_visita.startsWith('http') ? (
                                                <img src={p.logo_visita} crossOrigin="anonymous" alt="Visita" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <Trophy size={20} style={{ opacity: 0.1 }} />
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 900, textAlign: 'center' }}>{p.equipo_visita}</span>
                                    </div>

                                    <div style={{ flex: 1, borderLeft: '2px dashed #000', paddingLeft: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', color: 'var(--color-primary)', fontWeight: 900, fontSize: '0.8rem' }}>
                                            <Tv size={14} /> {p.canal}
                                        </div>
                                        {p.requiere_iptv && userPlan?.toUpperCase() !== 'PRO' ? (
                                            <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                                                <Link href="/plan" style={{
                                                    fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-primary)',
                                                    textDecoration: 'none', border: '1px solid var(--color-primary)',
                                                    padding: '0.3rem 0.6rem', borderRadius: '8px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem',
                                                    background: 'rgba(79, 70, 229, 0.1)'
                                                }}>
                                                    UPGRADE PRO <Zap size={10} fill="currentColor" />
                                                </Link>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                                                <div className="chip chip-gold" style={{ fontSize: '0.55rem', border: 'none', background: '#000', color: 'white', padding: '0.1rem 0.5rem' }}>LIVE</div>
                                                {p.requiere_iptv && <div style={{ fontSize: '0.5rem', fontWeight: 900, color: 'gold' }}>⭐ CONTENIDO PRO</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {(!p.requiere_iptv || userPlan?.toUpperCase() === 'PRO') && (
                                <button
                                    onClick={() => downloadFixture(p.id, p.equipo_local, p.equipo_visita, p.imagen_personalizada)}
                                    disabled={downloadingImg.has(p.id)}
                                    style={{
                                        display: 'flex', width: '100%', padding: '0.75rem', background: 'var(--color-primary)',
                                        border: 'none', borderTop: '2.5px solid #000', alignItems: 'center', justifyContent: 'center',
                                        gap: '0.5rem', color: 'white', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer'
                                    }}
                                >
                                    {downloadingImg.has(p.id) ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                    {downloadingImg.has(p.id) ? 'GENERANDO MOCKUP...' : 'DESCARGAR FIXTURE'}
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--color-primary)', borderRadius: '24px', border: '2.5px solid #000', boxShadow: '8px 8px 0px 0px #000', display: 'flex', gap: '1rem', }}>
                <Zap size={24} color="#000" />
                <p style={{ fontSize: '0.8rem', fontWeight: 900, lineHeight: 1.4, color: "var(--text-inverse)" }}>
                    ¡Vende más! Comparte esta cartelera en tus grupos de WhatsApp y redes sociales para atraer clientes amantes del deporte.
                </p>
            </motion.div>

            {/* Modal Alta/Edición */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-container" style={{ maxWidth: '800px', padding: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>{editingId ? 'EDITAR' : 'NUEVO'} <span className="text-gradient-primary">ENCUENTRO</span></h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            {errorToast && (
                                <div style={{ background: 'var(--color-danger)', color: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                    <AlertCircle size={18} /> {errorToast.toUpperCase()}
                                </div>
                            )}

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="input-label">LIGA / TORNEO</label>
                                        <input className="input" placeholder="Ej: La Liga" value={formData.liga} onChange={e => setFormData({ ...formData, liga: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="input-label">FECHA</label>
                                        <input className="input" type="date" value={formData.fecha} onChange={e => setFormData({ ...formData, fecha: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="input-label">HORA</label>
                                        <input className="input" placeholder="Ej: 20:00" value={formData.hora} onChange={e => setFormData({ ...formData, hora: e.target.value })} required />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <label className="input-label" style={{ color: 'var(--color-primary)' }}>LOCAL</label>
                                        <input className="input" placeholder="Nombre Equipo" value={formData.equipo_local} onChange={e => setFormData({ ...formData, equipo_local: e.target.value })} required />
                                        <div className="upload-zone" style={{ minHeight: '100px' }}>
                                            <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setFormData({ ...formData, logo_local_archivo: f }); }} />
                                            {formData.logo_local_archivo ? (
                                                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)' }}>{formData.logo_local_archivo.name}</div>
                                            ) : formData.logo_local ? (
                                                <img src={formData.logo_local} style={{ height: '40px', objectFit: 'contain' }} />
                                            ) : (
                                                <div style={{ opacity: 0.5 }}><Upload size={20} /><p style={{ fontSize: '0.6rem', fontWeight: 900 }}>LOGO LOCAL</p></div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <label className="input-label" style={{ color: 'var(--color-secondary)' }}>VISITA</label>
                                        <input className="input" placeholder="Nombre Equipo" value={formData.equipo_visita} onChange={e => setFormData({ ...formData, equipo_visita: e.target.value })} required />
                                        <div className="upload-zone" style={{ minHeight: '100px' }}>
                                            <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setFormData({ ...formData, logo_visita_archivo: f }); }} />
                                            {formData.logo_visita_archivo ? (
                                                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)' }}>{formData.logo_visita_archivo.name}</div>
                                            ) : formData.logo_visita ? (
                                                <img src={formData.logo_visita} style={{ height: '40px', objectFit: 'contain' }} />
                                            ) : (
                                                <div style={{ opacity: 0.5 }}><Upload size={20} /><p style={{ fontSize: '0.6rem', fontWeight: 900 }}>LOGO VISITA</p></div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                                    <div>
                                        <label className="input-label">CANAL / SEÑAL</label>
                                        <input className="input" placeholder="Ej: ESPN Premium" value={formData.canal} onChange={e => setFormData({ ...formData, canal: e.target.value })} required />
                                    </div>
                                    <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-raised)' }}>
                                        <span style={{ fontWeight: 900, fontSize: '0.75rem' }}>CONTENIDO PRO</span>
                                        <label className="switch">
                                            <input type="checkbox" checked={formData.requiere_iptv} onChange={e => setFormData({ ...formData, requiere_iptv: e.target.checked })} />
                                            <span className="slider round" style={{ backgroundColor: 'var(--color-primary)' }}></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="card" style={{ padding: '1rem', background: 'rgba(0,0,0,0.05)', borderStyle: 'dashed' }}>
                                    <span style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--color-primary)', display: 'block', marginBottom: '0.5rem' }}>FLYER PERSONALIZADO (OPCIONAL)</span>
                                    <div className="upload-zone" style={{ minHeight: '80px' }}>
                                        <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setFormData({ ...formData, imagen_personalizada_archivo: f }); }} />
                                        {formData.imagen_personalizada_archivo ? (
                                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)' }}>{formData.imagen_personalizada_archivo.name}</div>
                                        ) : formData.imagen_personalizada ? (
                                            <div style={{ height: '350px', position: 'relative', overflow: 'hidden' }}>
                                                <WatermarkedImage
                                                    src={formData.imagen_personalizada}
                                                    settings={settings || undefined}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    alt="Custom"
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ opacity: 0.5 }}><Upload size={18} /><p style={{ fontSize: '0.6rem', fontWeight: 900 }}>SUBIR FLYER .JPG</p></div>
                                        )}
                                    </div>
                                </div>

                                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '1.25rem', fontSize: '1rem' }}>
                                    {saving ? <Loader2 className="animate-spin" size={24} /> : (editingId ? 'GUARDAR CAMBIOS' : 'PUBLICAR ENCUENTRO')}
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
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-container" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem' }}>
                            <Trash2 size={48} color="var(--color-danger)" style={{ margin: '0 auto 1.5rem' }} />
                            <h3 style={{ fontWeight: 900 }}>¿BORRAR ESTE PARTIDO?</h3>
                            <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem', marginBottom: '2rem' }}>{confirmDelete.equipo_local} vs {confirmDelete.equipo_visita}</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>CANCELAR</button>
                                <button className="btn-primary" style={{ flex: 1, background: 'var(--color-danger)' }} onClick={handleDelete}>ELIMINAR</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PLATILLAS DE EXPORTACIÓN (Ocultas en la UI normal) */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -10 }}>
                {partidos.map(p => (
                    <div key={`export-${p.id}`} id={`fixture-export-${p.id}`} style={{
                        width: '1080px', height: '1080px',
                        background: 'radial-gradient(circle at center, #111 0%, #000 100%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '12px', color: 'var(--color-primary)', marginBottom: '1.5rem', zIndex: 2 }}>
                            {p.liga}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', width: '100%', padding: '0 6rem', justifyContent: 'center', marginBottom: '4rem', zIndex: 2 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '300px' }}>
                                <div style={{ width: '280px', height: '280px', background: 'white', borderRadius: '50px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '6px solid rgba(255,255,255,0.1)' }}>
                                    {p.logo_local && p.logo_local.startsWith('http') ? (
                                        <img src={p.logo_local} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <Trophy size={120} style={{ opacity: 0.1 }} color="black" />
                                    )}
                                </div>
                                <span style={{ fontSize: '2.5rem', fontWeight: 900, textAlign: 'center', textTransform: 'uppercase', textShadow: '2px 2px 0 #000' }}>{p.equipo_local}</span>
                            </div>
                            <div style={{ fontSize: '5rem', fontWeight: 900, color: 'white', textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>VS</div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '300px' }}>
                                <div style={{ width: '280px', height: '280px', background: 'white', borderRadius: '50px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '6px solid rgba(255,255,255,0.1)' }}>
                                    {p.logo_visita && p.logo_visita.startsWith('http') ? (
                                        <img src={p.logo_visita} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <Trophy size={120} style={{ opacity: 0.1 }} color="black" />
                                    )}
                                </div>
                                <span style={{ fontSize: '2.5rem', fontWeight: 900, textAlign: 'center', textTransform: 'uppercase', textShadow: '2px 2px 0 #000' }}>{p.equipo_visita}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2rem', zIndex: 2 }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem 4rem', borderRadius: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', backdropFilter: 'blur(20px)', border: '2px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ fontSize: '1rem', opacity: 0.6, fontWeight: 700, letterSpacing: '4px', marginBottom: '0.5rem' }}>FECHA</span>
                                <span style={{ fontSize: '2rem', fontWeight: 900 }}>{p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' }) : 'HOY'}</span>
                            </div>
                            <div style={{ background: 'var(--color-primary)', color: 'black', padding: '1.5rem 4rem', borderRadius: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 15px 40px rgba(79, 70, 229, 0.4)' }}>
                                <span style={{ fontSize: '1rem', opacity: 0.8, fontWeight: 900, letterSpacing: '4px', marginBottom: '0.5rem' }}>HORA</span>
                                <span style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>{p.hora}</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem 4rem', borderRadius: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', backdropFilter: 'blur(20px)', border: '2px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ fontSize: '1rem', opacity: 0.6, fontWeight: 700, letterSpacing: '4px', marginBottom: '0.5rem' }}>SEÑAL</span>
                                <span style={{ fontSize: '2rem', fontWeight: 900 }}>{p.canal}</span>
                            </div>
                        </div>
                        {applyWM && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                pointerEvents: 'none', zIndex: 10, opacity: settings?.watermark_opacity || 0.4
                            }}>
                                {settings?.watermark_type === 'IMAGE' && settings.watermark_image_url ? (
                                    <img src={settings.watermark_image_url} crossOrigin="anonymous" style={{ maxWidth: '40%', maxHeight: '40%', position: 'absolute', bottom: '60px', right: '60px' }} />
                                ) : (
                                    <div style={{ fontSize: '8rem', fontWeight: 900, transform: 'rotate(-45deg)', opacity: 0.5, border: '15px solid white', padding: '2rem 4rem', textTransform: 'uppercase', color: 'white' }}>
                                        {settings?.watermark_text || 'ARES PLATFORM'}
                                    </div>
                                )}
                            </div>
                        )}
                        <div style={{ position: 'absolute', bottom: '2rem', fontSize: '1.2rem', fontWeight: 900, opacity: 0.3, letterSpacing: '8px' }}>
                            {settings?.watermark_text || 'ARES PLATFORM'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
