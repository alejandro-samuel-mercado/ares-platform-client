/**
 * Admin Layout — ARES Redesign v3 (Full Responsive)
 */

'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/lib/auth';
import api from '@/lib/api';
import {
    LayoutDashboard, Users, Trophy, DollarSign, Settings, LogOut, Search, Bell, X, Image as ImageIcon, Store, Rocket, Package, Clapperboard, Menu, ChevronDown, Key
} from 'lucide-react';
import './admin.css';

export const ADMIN_MENU_ITEMS = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Inicio', keywords: ['inicio', 'dashboard', 'resumen', 'home'] },
    { href: '/admin/vendedores', icon: Users, label: 'Vendedores', keywords: ['vendedores', 'usuarios', 'clientes'] },
    { href: '/admin/planes', icon: Rocket, label: 'Planes', keywords: ['planes', 'suscripciones', 'precios'] },
    { href: '/admin/pedidos', icon: Package, label: 'Pedidos', keywords: ['pedidos', 'ordenes', 'compras'] },
    { href: '/admin/servicios', icon: Package, label: 'Servicios', keywords: ['servicios', 'productos'] },
    { href: '/admin/credenciales', icon: Key, label: 'Credenciales', keywords: ['credenciales', 'cuentas', 'contraseñas', 'passwords', 'keys'] },
    { href: '/admin/imagenes', icon: ImageIcon, label: 'Imágenes', keywords: ['imagenes', 'galeria', 'fotos', 'bank'] },
    { href: '/admin/estrenos', icon: Clapperboard, label: 'Estrenos', keywords: ['estrenos', 'peliculas', 'cine', 'cartelera'] },
    { href: '/admin/partidos', icon: Trophy, label: 'Partidos', keywords: ['partidos', 'deportes', 'eventos', 'futbol'] },
    { href: '/admin/marketplace', icon: Store, label: 'Marketplace', keywords: ['marketplace', 'tienda', 'compras'] },
    { href: '/admin/pagos', icon: DollarSign, label: 'Pagos', keywords: ['pagos', 'finanzas', 'facturacion', 'dinero'] },
    { href: '/admin/mensajes', icon: Bell, label: 'Mensajes', keywords: ['mensajes', 'textos', 'whatsapp', 'plantillas'] },
    { href: '/admin/ajustes', icon: Settings, label: 'Ajustes', keywords: ['ajustes', 'configuracion', 'sistema', 'settings'] },
];

function AdminSidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showScrollIndicator, setShowScrollIndicator] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            // Si hay más de 20px de scroll disponible hacia abajo, mostrar indicador
            setShowScrollIndicator(scrollHeight > clientHeight + scrollTop + 20);
        }
    };

    React.useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const renderLinks = (onClick?: () => void) => ADMIN_MENU_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
            <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClick}
            >
                <div className="sidebar-icon-container">
                    <item.icon size={22} />
                </div>
                <span style={{ fontSize: '0.65rem', textAlign: 'center', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02rem', opacity: isActive ? 1 : 0.7 }}>
                    {item.label}
                </span>
            </Link>
        );
    });

    return (
        <>
            {/* Desktop Sidebar */}

            <div className="desktop-only" style={{
                position: 'fixed',
                left: 0,
                top: 0,
                height: '85vh',
                margin: '5vh 30px',
                zIndex: 1000,
                width: '100px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <aside
                    ref={scrollRef}
                    className="admin-sidebar"
                    style={{
                        width: '100%',
                        height: '100%',
                        margin: 0,
                        position: 'relative',
                        overflowY: 'auto'
                    }}
                    onScroll={checkScroll}
                >
                    <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{
                                width: '50px', height: '50px',
                                background: 'var(--color-accent)', borderRadius: '16px',
                                border: '2px solid #000', boxShadow: '4px 4px 0px 0px #000',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 900, fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#000'
                            }}>A</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', paddingBottom: '2rem' }}>
                            {renderLinks()}
                        </div>
                    </div>
                </aside>

                {/* Overhanging, Clickable Scroll Indicator */}
                <AnimatePresence>
                    {showScrollIndicator && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            onClick={() => {
                                if (scrollRef.current) {
                                    scrollRef.current.scrollBy({ top: 150, behavior: 'smooth' });
                                }
                            }}
                            style={{
                                position: 'absolute',
                                bottom: '-40px',
                                left: '40%',
                                transform: 'translateX(-50%)',
                                background: 'var(--color-primary)',
                                padding: '2px',
                                borderRadius: '50%',
                                display: 'flex',
                                border: '3px solid #000',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                                cursor: 'pointer',
                                zIndex: 1100,
                                color: 'white'
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <motion.div
                                animate={{ y: [0, 4, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <ChevronDown size={20} />
                            </motion.div>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Hamburger Button */}
            <button
                className="admin-mobile-menu-btn mobile-only"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Fullscreen Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            className="admin-drawer-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            className="admin-drawer"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 0.5rem' }}>
                                <div style={{
                                    width: '44px', height: '44px',
                                    background: 'var(--color-accent)', borderRadius: '14px',
                                    border: '2px solid #000', boxShadow: '3px 3px 0px 0px #000',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 900, fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#000'
                                }}>A</div>
                                <button onClick={() => setMobileOpen(false)} style={{
                                    background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px', padding: '0.5rem', color: 'white', cursor: 'pointer'
                                }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <nav className="admin-drawer-nav">
                                {renderLinks(() => setMobileOpen(false))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function AdminHeader() {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [showToast, setShowToast] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = React.useState(false);

    const [pushEnabled, setPushEnabled] = React.useState(false);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            window.OneSignalDeferred.push(async (OneSignal: any) => {
                const permission = OneSignal.Notifications.permission;
                setPushEnabled(permission);

                // Forzar prompt automático en Admin si no han dado permiso
                if (!permission) {
                    await OneSignal.Slidedown.promptPush();
                    if (OneSignal.Notifications.permission) {
                        await OneSignal.User.PushSubscription.optIn();
                        setPushEnabled(true);
                    }
                }
            });
        }
    }, []);

    const searchResults = ADMIN_MENU_ITEMS.filter(item => {
        if (!searchQuery.trim()) return false;
        const q = searchQuery.toLowerCase();
        return item.label.toLowerCase().includes(q) || item.keywords.some(k => k.includes(q));
    });

    // Notifications State
    const [pendingPagos, setPendingPagos] = useState<any[]>([]);
    const [pendingPedidos, setPendingPedidos] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    React.useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('ares_token') : null;
        if (!token) return;

        const fetchCounts = async () => {
            try {
                const [pagos, pedidos] = await Promise.all([
                    api.get('/admin/pagos'),
                    api.get('/admin/pedidos')
                ]);

                const pPagos = (pagos || []).filter((p: any) => p.status === 'PENDIENTE');
                const pPedidos = (pedidos || []).filter((p: any) => p.status === 'PENDIENTE');

                setPendingPagos(pPagos);
                setPendingPedidos(pPedidos);
            } catch (err: any) {
                if (err?.status !== 401) {
                    console.error('Error fetching admin notifications', err);
                }
            }
        };

        fetchCounts();
        // Refresh every 60s
        const interval = setInterval(fetchCounts, 60000);
        return () => clearInterval(interval);
    }, [pathname]);

    const notifRef = React.useRef<HTMLDivElement>(null);

    const handleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        if (showNotifications) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showNotifications]);

    const handleSearchNavigate = (href: string) => {
        setShowResults(false);
        setSearchQuery('');
        router.push(href);
    };

    const totalPending = pendingPagos.length + pendingPedidos.length;

    return (
        <header className="admin-header">
            <AnimatePresence>
                {showNotifications && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'fixed', top: '80px', right: '150px', zIndex: 99999,
                            background: 'var(--surface-base)', color: 'var(--text-primary)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            minWidth: '320px', maxWidth: '400px',
                            maxHeight: '70vh', overflowY: 'auto',
                            borderRadius: '24px',
                            border: '3px solid #000',
                            boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
                            display: 'flex', flexDirection: 'column',
                            fontFamily: 'var(--font-primary)'
                        }}
                    >
                        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Bell size={18} /> NOTIFICACIONES
                            </h3>
                        </div>



                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem' }}>
                            {totalPending === 0 ? (
                                <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>No hay nada pendiente.</p>
                            ) : (
                                <>
                                    {pendingPagos.map((p) => (
                                        <div
                                            key={`pago-${p.id}`}
                                            onClick={() => {
                                                setPendingPagos(prev => prev.filter(x => x.id !== p.id));
                                                router.push('/admin/pagos');
                                                setShowNotifications(false);
                                            }}
                                            style={{
                                                padding: '0.8rem', borderRadius: '14px', border: '2px solid #000',
                                                background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
                                                display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.5rem'
                                            }}
                                        >
                                            <div style={{ padding: '0.5rem', background: '#ff4b4b', borderRadius: '10px', color: 'white' }}>
                                                <DollarSign size={18} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>Pago: @{p.vendor?.alias || 'Vendedor'}</p>
                                                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Monto: {p.monto} x {p.plan?.nombre}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {pendingPedidos.map((p) => (
                                        <div
                                            key={`pedido-${p.id}`}
                                            onClick={() => {
                                                setPendingPedidos(prev => prev.filter(x => x.id !== p.id));
                                                router.push('/admin/pedidos');
                                                setShowNotifications(false);
                                            }}
                                            style={{
                                                padding: '0.8rem', borderRadius: '14px', border: '2px solid #000',
                                                background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
                                                display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.5rem'
                                            }}
                                        >
                                            <div style={{ padding: '0.5rem', background: 'var(--color-accent)', borderRadius: '10px', color: '#000' }}>
                                                <Package size={18} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>Pedido: @{p.vendor?.alias || 'Vendedor'}</p>
                                                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{p.notas || 'Sin notas adicionales'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="admin-header-search">
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <input
                        type="text"
                        placeholder="Buscar módulo (ej. pagos, vendedores)..."
                        className="input"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)} // delay so click registers
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchResults.length > 0) {
                                handleSearchNavigate(searchResults[0].href);
                            }
                        }}
                        style={{ paddingLeft: '3rem', height: '44px', boxShadow: 'none' }}
                    />

                    {/* Search Dropdown */}
                    <AnimatePresence>
                        {showResults && searchQuery.trim().length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 10px)',
                                    left: 0,
                                    right: 0,
                                    background: 'var(--surface-raised)',
                                    border: '2px solid #000',
                                    borderRadius: '16px',
                                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                                    overflow: 'hidden',
                                    zIndex: 50
                                }}
                            >
                                {searchResults.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {searchResults.map((item, i) => (
                                            <div
                                                key={item.href}
                                                onClick={() => handleSearchNavigate(item.href)}
                                                style={{
                                                    padding: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    cursor: 'pointer',
                                                    borderBottom: i !== searchResults.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                                    background: 'transparent',
                                                    transition: '0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <item.icon size={20} color="var(--color-primary)" />
                                                <span style={{ fontWeight: 800 }}>{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No se encontraron módulos.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="admin-header-actions" ref={notifRef}>
                <button
                    onClick={handleNotifications}
                    style={{
                        padding: '0.6rem', borderRadius: '14px',
                        border: '2px solid #000', cursor: 'pointer',
                        boxShadow: '4px 4px 0px 0px #000',
                        background: 'var(--surface-raised)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative'
                    }}
                    title="Notificaciones"
                >
                    <Bell size={20} />
                    {totalPending > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            width: '20px',
                            height: '20px',
                            background: '#ff4b4b',
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #000'
                        }}>{totalPending}</span>
                    )}
                </button>

                <button
                    onClick={() => { logout(); window.location.href = '/login' }}
                    style={{
                        padding: '0.6rem', borderRadius: '14px',
                        border: '2px solid #000', cursor: 'pointer',
                        boxShadow: '4px 4px 0px 0px #000',
                        background: 'var(--surface-raised)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-secondary)'
                    }}
                    title="Cerrar Sesión"
                >
                    <LogOut size={20} />
                </button>

                <div className="admin-header-user">
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>Admin Ares</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Super Usuario</p>
                    </div>
                    <div style={{
                        width: '44px', height: '44px', minWidth: '44px',
                        borderRadius: '12px', border: '2px solid #000',
                        background: 'var(--color-primary)',
                        boxShadow: '4px 4px 0px 0px #000'
                    }} />
                </div>
            </div>
        </header>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ position: 'relative' }}>
            <AdminSidebar />
            <main className="admin-content">
                <AdminHeader />
                <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>}>
                    {children}
                </Suspense>
            </main>
        </div>
    );
}
