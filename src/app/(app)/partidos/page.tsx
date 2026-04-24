/**
 * Página: Cartelera Deportiva — App Vendedor Ares v2.1 (Dinamismo Total)
 */
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Trophy, Clock, Tv, Copy, Calendar as CalendarIcon, Zap, Loader2, Star, MessageCircle, RefreshCw, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toJpeg } from 'html-to-image';

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
}

export default function PartidosVendorPage() {
    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [userPlan, setUserPlan] = useState('');
    const [downloadingImg, setDownloadingImg] = useState<Set<string>>(new Set());

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

    const downloadFixture = async (id: string, equipoLocal: string, equipoVisita: string) => {
        try {
            setDownloadingImg(prev => new Set(prev).add(id));
            const node = document.getElementById(`fixture-${id}`);
            if (!node) return;
            const dataUrl = await toJpeg(node, { quality: 0.95, backgroundColor: '#000' });
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

    const copyCartelera = () => {
        if (partidos.length === 0) return;
        const fechaStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        let text = `🏆 *CARTELERA DEPORTIVA - ${fechaStr.toUpperCase()}* 🏆\n\n`;
        const porLiga: Record<string, Partido[]> = {};
        partidos.forEach(p => {
            if (!porLiga[p.liga]) porLiga[p.liga] = [];
            porLiga[p.liga].push(p);
        });
        for (const [liga, matches] of Object.entries(porLiga)) {
            text += `📍 *${liga.toUpperCase()}*\n`;
            matches.forEach(m => {
                text += `⚽ ${m.equipo_local} vs ${m.equipo_visita}\n`;
                text += `⏰ ${m.hora} | 📺 ${m.canal}\n\n`;
            });
        }
        text += `🔥 *ACTIVA TU CUENTA AHORA* 🔥\n¡No te pierdas ningún partido!`;
        navigator.clipboard.writeText(text);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const shareToWhatsApp = () => {
        if (partidos.length === 0) return;
        const fechaStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        let text = `🏆 *CARTELERA DEPORTIVA - ${fechaStr.toUpperCase()}* 🏆\n\n`;
        const porLiga: Record<string, Partido[]> = {};
        partidos.forEach(p => {
            if (!porLiga[p.liga]) porLiga[p.liga] = [];
            porLiga[p.liga].push(p);
        });
        for (const [liga, matches] of Object.entries(porLiga)) {
            text += `📍 *${liga.toUpperCase()}*\n`;
            matches.forEach(m => {
                text += `⚽ ${m.equipo_local} vs ${m.equipo_visita}\n`;
                text += `⏰ ${m.hora} | 📺 ${m.canal}\n\n`;
            });
        }
        text += `🔥 *ACTIVA TU CUENTA AHORA* 🔥\n¡No te pierdas ningún partido!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div style={{ padding: '1.5rem 1.5rem 8rem 1.5rem' }}>
            {/* Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
                            background: '#000', color: 'white', padding: '1rem 2rem', borderRadius: '24px',
                            border: '2px solid var(--color-primary)', boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.5)',
                            fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
                        }}
                    >
                        <Copy size={18} color="var(--color-primary)" /> COPIADA!
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
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

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {partidos.length > 0 && (
                        <>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {partidos.map((p, idx) => (
                        <motion.div key={p.id} id={`fixture-${p.id}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                            className="card" style={{ padding: '0', overflow: 'hidden', background: 'var(--surface-raised)' }}>
                            <div style={{
                                background: 'var(--surface-raised)', padding: '0.6rem 1.25rem', borderBottom: '2.5px solid #000',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>{p.liga}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '70px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                                        <Clock size={14} /> {p.hora}
                                    </div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.7 }}>
                                        {p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '---'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '18px', border: '2px solid #000', padding: '6px', background: 'white', boxShadow: '4px 4px 0px 0px #000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {p.logo_local && p.logo_local.startsWith('http') ? (
                                           <img src={p.logo_local} alt="Local" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                                           <img src={p.logo_visita} alt="Visita" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                            {(!p.requiere_iptv || userPlan?.toUpperCase() === 'PRO') && (
                                <button
                                    onClick={() => downloadFixture(p.id, p.equipo_local, p.equipo_visita)}
                                    disabled={downloadingImg.has(p.id)}
                                    style={{
                                        display: 'flex', width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)',
                                        border: 'none', borderTop: '2px solid #000', alignItems: 'center', justifyContent: 'center',
                                        gap: '0.5rem', color: 'white', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer'
                                    }}
                                >
                                    {downloadingImg.has(p.id) ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                                    {downloadingImg.has(p.id) ? 'GENERANDO MOCKUP FICTURE...' : 'DESCARGAR ESTA FIXTURE'}
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
        </div>
    );
}
