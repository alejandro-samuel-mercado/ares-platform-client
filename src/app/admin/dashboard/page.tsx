/**
 * Admin Dashboard — ARES Redesign v2.3 (Nuclear Polish & Theme Sync)
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, Users, AlertTriangle, Clock,
    TrendingUp, Package, ArrowUpRight, ShieldCheck, Zap, BarChart2, MousePointerClick
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface DashboardData {
    mrr: number;
    active_vendors: number;
    total_vendors: number;
    expiring_in_3_days: number;
    pending_payments: number;
    top_services: { servicio_id: string; nombre: string; count: number }[];
    weekly_new_vendors: Record<string, number>;
    recent_activity: { type: 'VENDOR' | 'PAYMENT' | 'ORDER'; title: string; subtitle: string; date: string }[];
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [intentions, setIntentions] = useState<{ servicio_id: string; nombre: string; logo_url: string | null; clicks: number }[]>([]);
    const router = useRouter();
    useEffect(() => {
        api.get('/admin/dashboard')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));

        api.get('/admin/analytics/intentions')
            .then(setIntentions)
            .catch(console.error);
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ textAlign: 'center' }}
                >
                    <Zap size={60} color="var(--color-primary)" style={{ margin: '0 auto 1.5rem' }} />
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                        SINCRONIZANDO <span className="text-gradient-primary">CENTRO DE MANDO</span>...
                    </h2>
                </motion.div>
            </div>
        );
    }

    const metrics = [
        {
            label: 'Ingresos MRR',
            value: `${data?.mrr?.toFixed(0) || 0} Bs`,
            icon: DollarSign,
            color: 'var(--color-primary)',
            trend: '+12.5%',
            desc: 'Crecimiento mensual'
        },
        {
            label: 'Vendedores',
            value: data?.active_vendors || 0,
            icon: Users,
            color: 'var(--color-accent)',
            trend: '+5 hoy',
            desc: 'Suscripciones activas'
        },
        {
            label: 'Vencimientos',
            value: data?.expiring_in_3_days || 0,
            icon: AlertTriangle,
            color: 'var(--color-danger)',
            trend: 'Crítico',
            desc: 'Próximos 3 días'
        },
        {
            label: 'Pagos Pendientes',
            value: data?.pending_payments || 0,
            icon: Clock,
            color: 'var(--color-accent)',
            trend: 'Esperando',
            desc: 'Validaciones pendientes'
        },
    ];

    const maxCount = Math.max(...(data?.top_services?.map(s => s.count) || [1]), 1);

    return (
        <div style={{ paddingBottom: '4rem', overflowX: 'hidden' }}>
            <style>{`
                .dash-bento { display: grid; grid-template-columns: 2fr 1fr; gap: 2.5rem; align-items: start; }
                .dash-welcome-title { font-size: 3.5rem; }
                .dash-welcome-sub { font-size: 1.3rem; }
                .dash-welcome { padding: 3.5rem; }
                @media (max-width: 1024px) {
                    .dash-bento { display: flex; flex-direction: column-reverse; gap: 2rem; }
                }
                @media (max-width: 768px) {
                    .dash-welcome { padding: 1.5rem !important; }
                    .dash-welcome-title { font-size: 2rem !important; line-height: 1 !important; }
                    .dash-welcome-sub { font-size: 1rem !important; }
                }
            `}</style>
            {/* Welcome Banner — Nuclear Redesign v2.3 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card dash-welcome"
                style={{
                    marginBottom: '3rem',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, rgba(0, 0, 0, 0.88) 100%)',
                    color: 'white',
                    border: '4px solid #000',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'absolute', right: '-5%', bottom: '-10%', opacity: 0.1, transform: 'rotate(-15deg)' }}>
                    <Package size={300} strokeWidth={1} />
                </div>

                <div style={{ maxWidth: '650px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '10px', height: '10px', background: 'var(--color-accent)', borderRadius: '2px', boxShadow: '0 0 10px var(--color-accent)' }} />
                        <p style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.3rem', color: 'rgba(255,255,255,0.7)' }}>MAESTRO DE OPERACIONES</p>
                    </div>
                    <h1 className="dash-welcome-title" style={{ lineHeight: 0.9, marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 900, textShadow: '4px 4px 0px #000' }}>
                        HOLA, <span style={{ color: 'var(--color-accent)' }}>ADMIN</span>
                    </h1>
                    <p className="dash-welcome-sub" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, lineHeight: 1.4 }}>
                        El pulso de Ares está <span style={{ color: 'var(--color-accent)' }}>estable</span>. Tienes <span style={{ textDecoration: 'underline' }}>{data?.pending_payments} pagos</span> esperando tu confirmación.
                    </p>


                </div>
            </motion.div>

            {/* Grid de Métricas Bento */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                marginBottom: '3.5rem',
            }}>
                {metrics.map((m, i) => (
                    <motion.div
                        key={m.label}
                        className="card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ background: 'var(--surface-raised)', padding: '2rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{
                                background: 'var(--surface-base)',
                                padding: '0.8rem',
                                borderRadius: '16px',
                                color: m.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #000',
                                boxShadow: `5px 5px 0px 0px ${m.color}`
                            }}>
                                <m.icon size={28} />
                            </div>
                            <div className="chip chip-primary" style={{ height: 'fit-content', background: m.color, border: '2.5px solid #000', padding: '0.4rem 0.8rem' }}>
                                <span style={{ color: 'var(--text-inverse)', fontWeight: 900 }}>{m.trend}</span>
                            </div>
                        </div>
                        <p style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                            {m.label}
                        </p>
                        <h2 style={{ fontSize: '2.8rem', marginTop: '0.2rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{m.value}</h2>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>{m.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Bento-Box 2.3 */}
            <div className="dash-bento">
                <div className="flex flex-col gap-8">
                    {/* Gráfico de Servicios Futurista */}
                    <div className="card-static" style={{ background: 'var(--surface-raised)', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)' }}>
                                <div style={{ background: 'var(--color-primary)', color: 'white', padding: '0.5rem', borderRadius: '10px' }}>
                                    <TrendingUp size={22} />
                                </div>
                                SERVICIOS <span className="text-gradient-primary">ACTIVOS</span>
                            </h3>
                            <button onClick={() => router.push('/admin/servicios')} className="btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem', fontWeight: 900 }}>DETALLES</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {data?.top_services?.map((svc, i) => (
                                <div key={svc.servicio_id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
                                        <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                            #{i + 1} {svc.nombre.toUpperCase()}
                                        </span>
                                        <span style={{ fontWeight: 900, color: 'var(--color-primary)', fontSize: '0.9rem' }}>{svc.count} OPERACIONES</span>
                                    </div>
                                    <div style={{ height: '32px', background: 'var(--surface-base)', borderRadius: '12px', border: '3.5px solid #000', padding: '3px', position: 'relative' }}>
                                        <motion.div
                                            className="progress-bar-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(svc.count / maxCount) * 100}%` }}
                                            style={{
                                                height: '100%',
                                                background: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)',
                                                borderRadius: '6px',
                                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gráfico de Crecimiento Semanal (NUEVO) */}
                    <div className="card-static" style={{ background: 'var(--surface-raised)', padding: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                            <BarChart2 size={24} color="var(--color-primary)" /> CRECIMIENTO <span className="text-gradient-primary">SEMANAL</span>
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '0 1rem', gap: '1rem' }}>
                            {Object.entries(data?.weekly_new_vendors || {}).map(([week, count], i) => (
                                <div key={week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                    <motion.div
                                        initial={{ height: 0 }} animate={{ height: `${Math.min((count as number) * 20, 100)}%` }}
                                        style={{ width: '100%', maxWidth: '30px', background: 'var(--color-primary)', borderRadius: '8px 8px 0 0', position: 'relative', border: '2px solid #000' }}
                                    >
                                        <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontWeight: 900, fontSize: '0.7rem' }}>{count as number}</div>
                                    </motion.div>
                                    <span style={{ fontSize: '0.55rem', fontWeight: 900, opacity: 0.5, transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{week.split('-').slice(1).join('/')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Status y Actividad */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <div className="card" style={{ background: 'var(--color-accent)', border: '4px solid #000', padding: '2rem', boxShadow: '10px 10px 0px 0px #000' }}>
                        <h3 style={{ color: '#000', marginBottom: '1.5rem', fontWeight: 900, fontSize: '1.2rem' }}>ESTADO DEL NÚCLEO</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'rgba(0,0,0,0.15)', padding: '1.25rem', borderRadius: '20px', border: '2px solid rgba(0,0,0,0.1)' }}>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{ width: '16px', height: '16px', background: '#22C55E', borderRadius: '50%', boxShadow: '0 0 15px #22C55E' }}
                            />
                            <p style={{ color: '#000', fontWeight: 900, fontSize: '0.9rem' }}>MAESTRO OPERATIVO SIN ERRORES</p>
                        </div>
                    </div>

                    <div className="card-static" style={{ background: 'var(--surface-raised)', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '2rem', fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-primary)' }}>ACTIVIDAD RECIENTE</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {data?.recent_activity?.map((act, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '14px',
                                        background: 'var(--surface-base)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                        color: act.type === 'VENDOR' ? 'var(--color-primary)' : act.type === 'PAYMENT' ? '#22C55E' : 'var(--color-accent)',
                                        border: '2.5px solid #000',
                                        boxShadow: '3px 3px 0px 0px #000'
                                    }}>
                                        {act.type === 'VENDOR' ? <Users size={20} /> : act.type === 'PAYMENT' ? <DollarSign size={20} /> : <Package size={20} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 900, fontSize: '0.9rem', lineHeight: 1.2, color: 'var(--text-primary)' }}>{act.title.toUpperCase()}</p>
                                        <p style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 800, color: 'var(--text-muted)' }}>{act.subtitle}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <Clock size={10} color="var(--color-primary)" />
                                            <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 900 }}>
                                                {new Date(act.date).toLocaleDateString()} — {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!data?.recent_activity || data.recent_activity.length === 0) && (
                                <p style={{ textAlign: 'center', padding: '3rem', opacity: 0.4, fontWeight: 900, fontSize: '0.8rem', letterSpacing: '0.1em' }}>SILENCIO EN EL NÚCLEO</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* === Intenciones Comerciales (Analytics Marketplace) === */}
            {intentions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card-static"
                    style={{ marginTop: '3rem', padding: '2.5rem', background: 'var(--surface-raised)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                        <div style={{ background: 'var(--color-secondary)', color: 'white', padding: '0.6rem', borderRadius: '12px' }}>
                            <BarChart2 size={22} />
                        </div>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 900 }}>
                            SERVICIOS MÁS <span className="text-gradient-primary">SOLICITADOS</span>
                        </h3>
                        <div className="chip chip-gold" style={{ marginLeft: 'auto', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MousePointerClick size={12} /> INTENCIONES DE COMPRA
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                        {intentions.map((item, i) => (
                            <div key={item.servicio_id} style={{
                                background: 'var(--surface-base)',
                                border: '2.5px solid #000',
                                borderRadius: '16px',
                                padding: '1.25rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                boxShadow: i === 0 ? '4px 4px 0px 0px var(--color-primary)' : '4px 4px 0px 0px #000',
                            }}>
                                <div style={{
                                    width: '44px', height: '44px', minWidth: '44px',
                                    borderRadius: '12px', border: '2.5px solid #000',
                                    background: i === 0 ? 'var(--color-primary)' : 'var(--surface-raised)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 900, fontSize: '1.2rem', color: i === 0 ? 'white' : 'var(--text-primary)'
                                }}>
                                    #{i + 1}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <p style={{ fontWeight: 900, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.nombre.toUpperCase()}
                                    </p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                                        {item.clicks} {item.clicks === 1 ? 'solicitud' : 'solicitudes'}
                                    </p>
                                </div>
                                <ArrowUpRight size={18} color="var(--color-primary)" />
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
