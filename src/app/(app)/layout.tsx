/**
 * Vendor PWA Layout — Redesign v2 (Cartoon-Futurista)
 */

'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Trophy, Package, User, MessageSquare, CreditCard, Calculator, Image as ImageIcon, Clapperboard, History, Key, Megaphone, Store } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import './app.css';

function Navigation() {
    const pathname = usePathname();
    const { vendor } = useAuth();
    const isProvider = vendor?.plan === 'Proveedor' || vendor?.role === 'SUPERADMIN';

    const sidebarItems = [
        { href: '/home', icon: Home, label: 'Inicio' },
        ...(isProvider ? [
            { href: '/marketplace/gestion', icon: Store, label: 'Mi Marketplace' },
            { href: '/marketplace/credenciales', icon: Key, label: 'Mis Cuentas' }
        ] : []),
        { href: '/mensajes', icon: MessageSquare, label: 'Mensajes' },

        { href: '/flyers', icon: ImageIcon, label: 'Flyers' },
        { href: '/partidos', icon: Trophy, label: 'Partidos' },
        { href: '/estrenos', icon: Clapperboard, label: 'Estrenos' },
        { href: '/promociones', icon: Megaphone, label: 'Promos' },


        { href: '/catalogo', icon: ShoppingBag, label: 'Catálogo' },
        { href: '/imagenes', icon: Key, label: 'Servicios' },

        { href: '/historial', icon: History, label: 'Historial' },
        { href: '/plan', icon: CreditCard, label: 'Mi Plan' },
        { href: '/calculadora', icon: Calculator, label: 'Calculadora' },
        { href: '/perfil', icon: User, label: 'Perfil' },
    ];

    const bottomItems = [
        { href: '/home', icon: Home, label: 'Inicio' },
        { href: '/imagenes', icon: Key, label: 'Servicios' },
        { href: '/flyers', icon: ImageIcon, label: 'Flyers' },
        { href: '/catalogo', icon: ShoppingBag, label: 'Catálogo' },
        { href: '/perfil', icon: User, label: 'Perfil' },
    ];

    return (
        <>
            <nav className="bottom-nav">
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
                    {bottomItems.map((item) => {
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
                {sidebarItems.map((item) => {
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
                <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', fontWeight: 800 }}>CARGANDO...</div>}>
                    {children}
                </Suspense>
            </main>
            <Navigation />
        </div>
    );
}
