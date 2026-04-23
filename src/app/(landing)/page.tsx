/**
 * Ares Landing Page — Olympus 4.0 (Super-Premium Motion)
 * 
 * Máxima expresión de efectos visuales y micro-interacciones.
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { 
    Zap, ShoppingBag, Trophy, ArrowRight, Shield, 
    Smartphone, BarChart3, Globe, Star, Play, 
    Layers, Cpu, Activity
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import './landing.css';

export default function LandingPage() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: targetRef });
    const yPreview = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    // Generar partículas aleatorias una sola vez
    const [particles, setParticles] = useState<any[]>([]);
    useEffect(() => {
        const p = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            duration: `${5 + Math.random() * 10}s`,
            delay: `${Math.random() * 5}s`
        }));
        setParticles(p);
    }, []);

    return (
        <div className="landing-root">
            {/* Texture & Particles */}
            <div className="bg-noise"></div>
            <div className="particles-wrap">
                {particles.map(p => (
                    <div 
                        key={p.id} 
                        className="particle" 
                        style={{ 
                            left: p.left, 
                            '--duration': p.duration, 
                            '--delay': p.delay 
                        } as any} 
                    />
                ))}
            </div>

            {/* Glowing Blobs */}
            <div className="blob blob-red"></div>
            <div className="blob blob-blue"></div>
            <div className="blob blob-purple"></div>

            {/* Navbar */}
            <header className="olympus-header">
                <nav className="olympus-nav landing-container">
                    <motion.div 
                        initial={{ opacity: 0, x: -30, rotate: -5 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        className="olympus-logo"
                    >
                        <span className="text-primary">ARES</span> <span className="text-white">OLYMPUS</span>
                    </motion.div>
                    
                    <div className="olympus-nav-actions">
                        <div className="nav-links">
                            <Link href="/login" className="nav-link-ghost">ACCESO</Link>
                            <Link href="/register" className="nav-btn-action">EMPEZAR AHORA</Link>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="olympus-hero" ref={targetRef}>
                <div className="landing-container">
                    <motion.div 
                        style={{ opacity: opacityHero }}
                        className="hero-main"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="hero-status-pill"
                        >
                            <span className="pill-dot"></span>
                            PROTOCOL OLYMPUS V4.0 ACTIVATED
                        </motion.div>
                        
                        <motion.h1 
                            className="hero-title"
                            initial={{ filter: "blur(10px)", opacity: 0 }}
                            animate={{ filter: "blur(0px)", opacity: 1 }}
                            transition={{ duration: 1 }}
                        >
                            ELEVA TU <br />
                            <span className="text-glow-red">IMPERIO</span> DIGITAL
                        </motion.h1>
                        
                        <p className="hero-subtitle">
                           La suite SaaS de streaming más potente del planeta. Velocidad nuclear, seguridad de grado militar y diseño cinematográfico.
                        </p>

                        <div className="hero-cta-group">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/register" className="hero-btn-primary">
                                    COMENZAR EL ASCENSO <ArrowRight size={22} />
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/login" className="hero-btn-secondary">
                                    <Play size={20} fill="currentColor" /> VER DEMO
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Advanced Preview Box */}
                    <motion.div 
                        style={{ y: yPreview }}
                        className="hero-dashboard-preview"
                    >
                        <div className="preview-header">
                            <div className="preview-dots"><span></span><span></span><span></span></div>
                            <div className="preview-title">ARES REAL-TIME ANALYTICS</div>
                        </div>
                        <div className="preview-content">
                            <div className="preview-grid">
                                <PreviewCard icon={<Activity size={20} />} label="VELOCIDAD" value="98%" />
                                <PreviewCard icon={<Cpu size={20} />} label="CARGA" value="12%" />
                                <PreviewCard icon={<Layers size={20} />} label="NODOS" value="242" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats with Counters */}
            <section className="olympus-stats">
                <div className="landing-container">
                    <div className="stats-inner">
                        <StatItem label="Vendedores Activos" value={2500} suffix="+" />
                        <StatItem label="Volumen Mensual" value={500} prefix="Bs " suffix="k+" />
                        <StatItem label="Uptime Garantizado" value={99.9} suffix="%" />
                        <StatItem label="Soporte Nivel 3" value={24} suffix="/7" />
                    </div>
                </div>
            </section>

            {/* Features (Staggered Reveal) */}
            <section className="olympus-features">
                <div className="landing-container">
                    <div className="features-header">
                        <h2 className="section-title">NÚCLEO <span className="text-gradient">OLYMPUS</span></h2>
                        <p className="section-desc">Herramientas forjadas para el dominio total del mercado.</p>
                    </div>

                    <div className="features-grid">
                        <FeatureCard 
                            icon={<Shield size={38} color="var(--color-primary)" />} 
                            title="Arquitectura Blindada" 
                            desc="Aislamiento multi-tenant real que garantiza la privacidad absoluta de tus datos y clientes."
                        />
                        <FeatureCard 
                            icon={<Zap size={38} color="#FACC15" />} 
                            title="Motor de Medios Ultra" 
                            desc="Procesamiento instantáneo de imágenes con watermarking dinámico y logos de alta fidelidad."
                        />
                        <FeatureCard 
                            icon={<Globe size={38} color="#3B82F6" />} 
                            title="Network de Élite" 
                            desc="Conexión directa con los proveedores más grandes de la región sin intermediarios."
                        />
                        <FeatureCard 
                            icon={<Trophy size={38} color="var(--text-primary)" />} 
                            title="Inteligencia de Campo" 
                            desc="Alertas en tiempo real de eventos masivos para que nunca pierdas una oportunidad de venta."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing (Glow & Scale) */}
            <section className="olympus-pricing">
                <div className="landing-container">
                    <div className="features-header">
                        <h2 className="section-title">NIVELES DE <span className="text-gradient">FORJA</span></h2>
                        <p className="section-desc">Elige tu armadura y prepárate para la expansión global.</p>
                    </div>

                    <div className="pricing-grid">
                        <PriceCard 
                            tier="CIUDADANO" price="0" 
                            features={['Acceso Básico', 'Catálogo Standard', 'Marca de Agua Genérica']}
                            btnText="PROBAR SISTEMA"
                        />
                        <PriceCard 
                            tier="GUERRERO" price="30" featured 
                            features={['Logos Personalizados', 'Notificaciones Instantáneas', 'Enlace VIP Público', 'Soporte 24/7', 'Analítica Básica']}
                            btnText="FORJAR LEYENDA"
                        />
                        <PriceCard 
                            tier="TITÁN" price="100" 
                            features={['Todo en Guerrero', 'Publicar en Marketplace', 'Dashboards Avanzados', 'API Automatizada', 'Red de Socios']}
                            btnText="DOMINAR COMO TITÁN"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="olympus-footer">
                <div className="landing-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo">ARES <span className="text-primary">OLYMPUS</span></div>
                            <p className="footer-tagline">Infraestructura definitiva para el comercio digital.</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-col">
                                <h3>EXPANSIÓN</h3>
                                <Link href="/register">Empezar</Link>
                                <Link href="/login">Acceso</Link>
                                <Link href="/marketplace">Mercado</Link>
                            </div>
                            <div className="footer-col">
                                <h3>SOPORTE</h3>
                                <a href="#">Documentación</a>
                                <a href="#">API Docs</a>
                                <a href="#">Estatus</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>LEGADO ARES © 2026. FORJADO EN EL FUTURO.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function PreviewCard({ icon, label, value }: any) {
    return (
        <div className="preview-stat-card">
            <div className="p-icon">{icon}</div>
            <div className="p-info">
                <span className="p-label">{label}</span>
                <span className="p-val">{value}</span>
            </div>
            <div className="p-progress"><div className="p-bar" style={{ width: value }}></div></div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -15, scale: 1.03 }}
            className="feature-card-new"
        >
            <div className="feature-icon-new">{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
        </motion.div>
    );
}

interface StatItemProps {
    value: number | string;
    label: string;
    prefix?: string;
    suffix?: string;
}

function StatItem({ value, label, prefix = '', suffix = '' }: StatItemProps) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const end = typeof value === 'string' ? parseFloat(value) : value;
            const duration = 2000;
            const increment = end / (duration / 16);
            
            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(start);
                }
            }, 16);
            return () => clearInterval(timer);
        }
    }, [isInView, value]);

    return (
        <div className="stat-item-new" ref={ref}>
            <motion.div 
                className="stat-value"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {prefix}{Math.floor(count).toLocaleString()}{suffix}
            </motion.div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

interface PriceCardProps {
    tier: string;
    price: string;
    features: string[];
    btnText: string;
    featured?: boolean;
}

function PriceCard({ tier, price, features, btnText, featured }: PriceCardProps) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={featured ? { scale: 1.05, y: -10 } : { scale: 1.02, y: -5 }}
            className={`price-card-new ${featured ? 'featured' : ''}`}
        >
            {featured && <div className="featured-tag">RECOMENDADO</div>}
            <div className="price-header">
                <h4 className="price-tier">{tier}</h4>
                <div className="price-value">
                    <span className="currency">Bs</span>
                    <span className="amount">{price}</span>
                    <span className="period">/mes</span>
                </div>
            </div>
            <ul className="price-features">
                {features.map((f, i) => (
                    <li key={i}>
                        <div className="check-icon"><Star size={12} fill="currentColor" /></div>
                        {f}
                    </li>
                ))}
            </ul>
            <Link href="/register" className={`price-btn ${featured ? 'primary' : 'secondary'}`}>
                {btnText}
            </Link>
        </motion.div>
    );
}
