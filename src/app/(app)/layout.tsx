/**
 * Vendor PWA Layout — Redesign v2 (Cartoon-Futurista)
 * Soporta AppConfig: filtra módulos y aplica colores de tema por vendor.
 */

'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, ShoppingBag, Trophy, Package, User, MessageSquare, CreditCard,
    Calculator, Image as ImageIcon, Clapperboard, History, Key, Megaphone,
    Store, Layers, ShieldCheck, Menu, X, Lock
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import './app.css';

// ─── Definición completa de módulos del sidebar ───────────────────────────────
const ALL_SIDEBAR_ITEMS = [
    { key: 'home',        href: '/home',                   icon: Home,         label: 'Inicio',      providerOnly: false },
    { key: 'mensajes',    href: '/mensajes',               icon: MessageSquare, label: 'Mensajes',   providerOnly: false },
    { key: 'flyers',      href: '/flyers',                 icon: ImageIcon,    label: 'Flyers',      providerOnly: false },
    { key: 'partidos',    href: '/partidos',               icon: Trophy,       label: 'Partidos',    providerOnly: false },
    { key: 'estrenos',    href: '/estrenos',               icon: Clapperboard, label: 'Estrenos',    providerOnly: false },
    { key: 'promociones', href: '/promociones',            icon: Megaphone,    label: 'Promos',      providerOnly: false },
    { key: 'catalogo',    href: '/catalogo',               icon: ShoppingBag,  label: 'Catálogo',    providerOnly: false },
    { key: 'imagenes',    href: '/imagenes',               icon: Layers,       label: 'Servicios',   providerOnly: false },
    { key: 'marketplace', href: '/marketplace/gestion',    icon: Store,        label: 'Marketplace', providerOnly: true  },
    { key: 'marketplace', href: '/marketplace/credenciales', icon: ShieldCheck, label: 'Cuentas',   providerOnly: true  },
    { key: 'historial',   href: '/historial',              icon: History,      label: 'Historial',   providerOnly: false },
    { key: 'plan',        href: '/plan',                   icon: CreditCard,   label: 'Mi Plan',     providerOnly: false },
    { key: 'calculadora', href: '/calculadora',            icon: Calculator,   label: 'Calculadora', providerOnly: false },
    { key: 'perfil',      href: '/perfil',                 icon: User,         label: 'Perfil',      providerOnly: false },
];

const BOTTOM_NAV_KEYS = ['home', 'imagenes', 'flyers', 'catalogo', 'perfil'];

// ─── Inyección de colores CSS del AppConfig ───────────────────────────────────
function useAppTheme(colores: Record<string, string> | undefined) {
    useEffect(() => {
        if (!colores || Object.keys(colores).length === 0) return;

        const root = document.documentElement;
        const applied: string[] = [];

        Object.entries(colores).forEach(([key, value]) => {
            if (key.startsWith('--') && value) {
                root.style.setProperty(key, value);
                applied.push(key);
            }
        });

        // Cleanup: reset only the properties we set when unmounting
        return () => {
            applied.forEach(key => root.style.removeProperty(key));
        };
    }, [colores]);
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function Navigation() {
    const pathname = usePathname();
    const { vendor } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isProvider = vendor?.plan === 'Proveedor' || vendor?.role === 'SUPERADMIN';
    const activeModules: string[] | null = vendor?.app_config?.modulos_activos || null;

    // Filtra items según: proveedor, y módulos habilitados por AppConfig
    const visibleSidebarItems = ALL_SIDEBAR_ITEMS.filter(item => {
        // Items exclusivos de proveedor
        if (item.providerOnly && !isProvider) return false;
        // Si hay AppConfig, filtrar por módulos activos
        if (activeModules !== null && !activeModules.includes(item.key)) return false;
        return true;
    });

    // Bottom nav: solo los que estén en BOTTOM_NAV_KEYS Y sean visibles
    const visibleBottomItems = ALL_SIDEBAR_ITEMS.filter(item =>
        BOTTOM_NAV_KEYS.includes(item.key) &&
        (activeModules === null || activeModules.includes(item.key))
    // Deduplicar por href
    ).filter((item, idx, arr) => arr.findIndex(i => i.href === item.href) === idx);

    return (
        <>
            <button
                className="app-mobile-menu-btn mobile-only"
                onClick={() => setMobileOpen(true)}
            >
                <Menu size={24} />
            </button>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            className="app-drawer-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            className="app-drawer"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <span style={{ fontWeight: 900, letterSpacing: '0.1rem', fontSize: '1.2rem' }}>ARES APP</span>
                                    {vendor?.app_config && (
                                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: '2px', fontWeight: 700 }}>
                                            📱 {vendor.app_config.nombre}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setMobileOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white' }}>
                                    <X size={28} />
                                </button>
                            </div>

                            {visibleSidebarItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`app-drawer-link ${isActive ? 'active' : ''}`}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <item.icon size={20} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Nav */}
            <nav className="bottom-nav">
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
                    {visibleBottomItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                            >
                                <div style={{
                                    background: isActive ? 'var(--color-primary)' : 'transparent',
                                    color: isActive ? 'var(--text-inverse)' : 'rgba(255, 255, 255, 0.5)',
                                    padding: '0.5rem',
                                    borderRadius: '14px',
                                    border: isActive ? '2.5px solid #000' : 'none',
                                    boxShadow: isActive ? '4px 4px 0px 0px #000' : 'none',
                                    transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    transform: isActive ? 'scale(1.05) translateY(-8px)' : 'scale(1)'
                                }}>
                                    <item.icon size={22} />
                                </div>
                                {!isActive && <span style={{ fontSize: '0.6rem', marginTop: '2px' }}>{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Desktop Sidebar */}
            <aside className="vendor-sidebar">
                {visibleSidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="vendor-sidebar-link"
                            style={{
                                background: isActive ? 'var(--color-primary)' : 'transparent',
                                color: isActive ? 'var(--text-inverse)' : 'rgba(255, 255, 255, 0.7)',
                                border: isActive ? '2px solid #000' : 'none',
                                boxShadow: isActive ? '4px 4px 0px 0px #000' : 'none',
                                width: '70%',
                            }}
                        >
                            <item.icon size={22} />
                            <span style={{ fontSize: '0.50rem', fontWeight: 900 }}>{item.label}</span>
                        </Link>
                    );
                })}
            </aside>
        </>
    );
}

// ─── App Layout ───────────────────────────────────────────────────────────────
export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { vendor, isLoading } = useAuth();
    const router = useRouter();

    // Aplicar colores del AppConfig como CSS variables en el documento
    useAppTheme(vendor?.app_config?.colores);

    React.useEffect(() => {
        if (!isLoading) {
            if (!vendor) {
                window.location.href = '/login';
            } else if (vendor.role === 'SUPERADMIN' || vendor.role === 'ADMIN') {
                window.location.href = '/admin/dashboard';
            }
        }
    }, [vendor, isLoading]);

    if (isLoading || !vendor) {
        return (
            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '2rem',
                background: 'var(--surface-base)'
            }}>
                <motion.img
                    src="/images/icono.png"
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: '60px', height: '60px', filter: 'drop-shadow(0 0 15px var(--color-primary))' }}
                />
                <p style={{ fontWeight: 900, letterSpacing: '0.3em', color: 'var(--color-primary)', fontSize: '0.7rem', opacity: 0.8 }}>SINCRONIZANDO...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            paddingBottom: '120px',
            background: 'var(--surface-base)',
            position: 'relative',
            overflowX: 'hidden'
        }} className="layout-wrapper">
            {/* Orbe decorativo */}
            <div style={{
                position: 'fixed',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: 'var(--color-primary)',
                filter: 'blur(80px)',
                opacity: 0.2,
                zIndex: -1,
            }} />

            <main className="main-content">
                <Suspense fallback={
                    <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                        <p style={{ fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.2em', opacity: 0.6 }}>OPTIMIZANDO RECURSOS...</p>
                    </div>
                }>
                    {children}
                </Suspense>
            </main>
            <Navigation />
        </div>
    );
}
