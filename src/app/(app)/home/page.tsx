/**
 * Vendor PWA Home — Ares Redesign v3 (Totalmente Dinámica)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag, Trophy, Search, User,
    ArrowRight, Sparkles, Zap, ShieldCheck, Loader2,
    MessageSquare, Package, Image as ImageIcon, CreditCard, Calculator, Download,
    Clapperboard, History, RefreshCw, Megaphone, Store, Key
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function VendorHome() {
    const { vendor } = useAuth();
    const isProvider = vendor?.plan === 'Proveedor' || vendor?.role === 'SUPERADMIN';
    const [userName, setUserName] = useState('REVENDEDOR');
    const [noticia, setNoticia] = useState('Cargando avisos del sistema...');
    const [soporteWp, setSoporteWp] = useState('');
    const [nextMatches, setNextMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const router = useRouter();
    useEffect(() => {
        loadDynamicData();
    }, []);

    const loadDynamicData = async () => {
        try {
            // 1. Cargar nombre del perfil
            const profile = await api.get('/perfil');

            if (profile.nombre) setUserName(profile.nombre.split(' ')[0].toUpperCase());

            // 2. Cargar avisos y soporte
            const settings = await api.get('/ajustes-publicos');
            if (settings.noticia_global) setNoticia(settings.noticia_global);
            if (settings.whatsapp_soporte) setSoporteWp(settings.whatsapp_soporte);

            // 3. Cargar partidos (próximos 2)
            const matches = await api.get('/partidos?fecha=hoy');
            setNextMatches(matches.slice(0, 2));

        } catch (err) {
            console.error('Error cargando datos dinámicos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowInstallBanner(false);
        }
        setDeferredPrompt(null);
    };

    const cards = [
        { title: 'MENSAJES', desc: 'Soporte rápido', icon: MessageSquare, color: '#F59E0B', href: '/mensajes' },
        { title: 'FLYERS', desc: 'Banco de imágenes', icon: ImageIcon, color: '#8d09e5ff', href: '/flyers' },
        { title: 'PARTIDOS', desc: 'Cartelera de hoy', icon: Trophy, color: '#E50914', href: '/partidos' },
        { title: 'ESTRENOS', desc: 'Novedades streaming', icon: Clapperboard, color: '#E50914', href: '/estrenos' },
        { title: 'PROMOS', desc: 'Ofertas y avisos', icon: Megaphone, color: '#F59E0B', href: '/promociones' },
        { title: 'CATÁLOGO', desc: 'Precios actualizados', icon: ShoppingBag, color: 'var(--color-primary)', href: '/catalogo' },
        { title: 'SERVICIOS', desc: 'Cuentas y licencias', icon: Key, color: 'var(--color-accent)', href: '/imagenes' },

        // Módulos de Proveedor
        { title: 'MARKETPLACE', desc: 'Gestión de ventas', icon: Store, color: 'var(--color-primary)', href: '/marketplace/gestion', providerOnly: true },
        { title: 'CUENTAS', desc: 'Stock de credenciales', icon: Key, color: '#8B5CF6', href: '/marketplace/credenciales', providerOnly: true },

        { title: 'HISTORIAL', desc: 'Mis activaciones', icon: History, color: '#8B5CF6', href: '/historial' },
        { title: 'MI PLAN', desc: 'Suscripción activa', icon: CreditCard, color: '#E50914', href: '/plan' },
        { title: 'CALCULADORA', desc: 'Margen de ganancia', icon: Calculator, color: '#8B5CF6', href: '/calculadora' },
        { title: 'PERFIL', desc: 'Ajustes de cuenta', icon: User, color: '#F59E0B', href: '/perfil' },
    ].filter(card => {
        // Ocultar si es solo para proveedores y el usuario no lo es
        if ((card as any).providerOnly && !isProvider) return false;

        // Ocultar PARTIDOS si ya hay un widget Bento arriba (para no repetir)
        if (card.title === 'PARTIDOS' && nextMatches.length > 0) return false;

        return true;
    });

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
            {/* Saludo Hero Móvil */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ marginTop: '1rem', textAlign: 'center', position: 'relative' }}
            >
                <button
                    onClick={loadDynamicData}
                    style={{ position: 'absolute', top: 0, right: '1rem', background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                    title="Actualizar Datos"
                >
                    <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                </button>
                <h1 style={{ fontSize: '2.5rem', lineHeight: 1, fontWeight: 900 }}>
                    HOLA, <span className="text-gradient-primary">{userName}</span>
                </h1>
                <p style={{ fontWeight: 700, marginTop: '0.5rem', opacity: 0.6 }}>¿Qué vamos a vender hoy?</p>
            </motion.div>

            {/* Banner de Estado / Noticia Dinámica */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="card"
                style={{
                    background: 'var(--color-primary)',
                    border: '2px solid #000',
                    boxShadow: '8px 8px 0px 0px #000',
                    color: '#000',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                }}
            >
                <div style={{ background: '#000', padding: '0.8rem', borderRadius: '12px', color: 'var(--color-accent)' }}>
                    <Zap size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.7, color: 'var(--text-inverse)' }}>AVISO DEL SISTEMA</p>
                    <p style={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, color: 'var(--text-inverse)' }}>{noticia}</p>
                </div>
            </motion.div>

            {/* PWA Install Banner */}
            {showInstallBanner && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card"
                    style={{
                        background: '#000', color: 'white', border: '3px solid var(--color-primary)',
                        padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                        boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.2)'
                    }}
                >
                    <div style={{ background: 'var(--color-primary)', padding: '0.6rem', borderRadius: '12px' }}>
                        <Download size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>INSTALAR ARES APP</p>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7 }}>Acceso rápido desde tu pantalla de inicio</p>
                    </div>
                    <button
                        onClick={handleInstallClick}
                        style={{ background: 'white', color: 'black', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: 900, fontSize: '0.75rem' }}
                    >
                        INSTALAR
                    </button>
                </motion.div>
            )}

            {/* Cartelera TV Pro - Bento Box */}
            {nextMatches.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-static"
                    style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--surface-raised) 0%, var(--ambient-1) 100%)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Trophy size={18} color="var(--color-secondary)" />
                            <span style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '0.05em' }}>CARTELERA TV</span>
                        </div>
                        <Link href="/partidos" style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-primary)', textDecoration: 'none' }}>VER TODO</Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {nextMatches.map((m, idx) => (
                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: idx === 0 ? '1rem' : 0, borderBottom: idx === 0 ? '1.5px dashed rgba(0,0,0,0.1)' : 'none' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #000', padding: '3px', background: 'white' }}>
                                        <img src={m.logo_local} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{m.equipo_local}</span>
                                </div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3 }}>VS</div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{m.equipo_visita}</span>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #000', padding: '3px', background: 'white' }}>
                                        <img src={m.logo_visita} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                </div>
                                <div style={{ minWidth: '50px', textAlign: 'right', fontWeight: 900, fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                                    {m.hora}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Accesos Rápidos (Responsivo) */}
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5, letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                Explorar Módulos
            </h2>

            {/* MÓVIL: App Icon Grid */}
            <div className="mobile-only app-icon-grid">
                {cards.map((card, i) => (
                    <Link key={card.title} href={card.href} style={{ textDecoration: 'none' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            whileTap={{ scale: 0.9 }}
                            className="app-icon-item"
                        >
                            <div className="app-icon-container" style={{ borderColor: card.color }}>
                                <card.icon size={26} color={card.color} />
                                <div style={{
                                    position: 'absolute', inset: 0, borderRadius: '18px',
                                    background: `linear-gradient(135deg, ${card.color}15 0%, transparent 60%)`,
                                    pointerEvents: 'none'
                                }} />
                            </div>
                            <span className="app-icon-label">{card.title}</span>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* DESKTOP: Enormous Cards (Restored) */}
            <div className="desktop-only" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {cards.map((card, i) => (
                    <Link key={card.title} href={card.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ y: -5 }}
                            className="card"
                            style={{
                                height: '180px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: '1.25rem',
                                borderWidth: '2.5px',
                                background: 'var(--surface-raised)'
                            }}
                        >
                            <div style={{
                                background: '#000',
                                color: card.color,
                                width: '45px',
                                height: '45px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `4px 4px 0px 0px ${card.color}`
                            }}>
                                <card.icon size={22} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', fontWeight: 900 }}>{card.title}</h3>
                                <p style={{ fontSize: '0.7rem', fontWeight: 700, lineHeight: 1.2, opacity: 0.6 }}>{card.desc}</p>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Sección de Soporte Rápido Dinámico */}
            <div className="card-static" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', background: 'var(--surface-raised)' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ background: '#000', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <div className="animate-float" style={{ position: 'absolute', top: -5, right: -5 }}>
                        <Sparkles size={18} color="var(--color-accent)" />
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 900 }}>SOPORTE ARES</h4>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>¿Necesitas ayuda con una activación?</p>
                    <a
                        href={soporteWp ? `https://wa.me/${soporteWp}?text=Hola%20Soporte%20Ares,%20necesito%20ayuda.` : '#'}
                        target="_blank"
                        style={{
                            display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8rem',
                            color: 'var(--color-primary)', fontWeight: 900, textDecoration: 'none',
                            borderBottom: '2px solid var(--color-primary)'
                        }}
                    >
                        CHATEAR CON SOPORTE
                    </a>
                </div>
            </div>
        </div>
    );
}
