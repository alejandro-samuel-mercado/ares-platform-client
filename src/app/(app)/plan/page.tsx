/**
 * Página: Gestión de Suscripción (Mi Plan) — Dashboard Premium Vendedor
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Upload, Clock, Zap, CheckCircle2, ShieldCheck, QrCode, RefreshCw, Layers, Calendar, ChevronRight, X } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function PlanPage() {
    const { vendor } = useAuth();
    const [ajustes, setAjustes] = useState<any>(null);
    const [pagos, setPagos] = useState<any[]>([]);
    const [planes, setPlanes] = useState<any[]>([]);

    const [uploading, setUploading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Modal State
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [currency, setCurrency] = useState<'BOB' | 'USD'>('BOB');
    const [file, setFile] = useState<File | null>(null);

    const fetchPagos = () => {
        api.get('/pagos').then(setPagos).catch(console.error);
    };

    const fetchPlanes = () => {
        api.get('/planes').then(setPlanes).catch(console.error);
    };

    useEffect(() => {
        api.get('/ajustes-publicos', true)
            .then(setAjustes)
            .catch(console.error);
        fetchPagos();
        fetchPlanes();
    }, []);

    const hasPending = pagos.some(p => p.status === 'PENDIENTE');

    const triggerToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const daysLeft = vendor ? Math.max(0, Math.ceil((new Date(vendor.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
    const totalDays = 30; // Base para la barra
    const progress = Math.min(100, (daysLeft / totalDays) * 100);
    const isDanger = daysLeft <= 5;

    const handleSendReceipt = async () => {
        if (!file || !selectedPlan) {
            alert('Por favor completa los campos del comprobante');
            return;
        }
        setUploading(true);
        try {
            const isBob = currency === 'BOB';
            const tasa = ajustes?.tasa_cambio_bob || 6.96;
            const amount = isBob ? selectedPlan.precio.toString() : (selectedPlan.precio / tasa).toFixed(2);

            const formData = new FormData();
            formData.append('monto', amount);
            formData.append('plan_id', selectedPlan.id);
            formData.append('comprobante', file);

            const token = localStorage.getItem('ares_token');
            const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

            const res = await fetch(`${base}/pagos/comprobante`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Error al subir');

            triggerToast();
            setFile(null);
            setSelectedPlan(null); // Cierra modal
            fetchPagos(); // Recarga pagos
        } catch (err) {
            console.error(err);
            alert('Error al enviar el comprobante. Reintenta pronto.');
        }
        setUploading(false);
    };

    return (
        <div style={{ padding: '1.5rem 1.5rem 8rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>

            {/* Toast Ares v2 */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
                            background: '#000', color: 'white', padding: '1rem 2rem', width: 'max-content',
                            borderRadius: '24px', border: '2px solid var(--color-primary)',
                            boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
                            fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
                        }}
                    >
                        <CheckCircle2 color="var(--color-primary)" />
                        COMPROBANTE ENVIADO A REVISIÓN
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            MI <span className="text-gradient-primary">CUENTA</span>
                        </h1>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>DASHBOARD PREMIUM</p>
                    </div>
                    <button
                        onClick={() => { fetchPagos(); fetchPlanes(); }}
                        className="btn-secondary"
                        style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Refrescar Estado"
                    >
                        <RefreshCw size={24} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {/* Panel Principal */}
                <div className="card" style={{ padding: '2rem', textAlign: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                        <Zap size={24} color={isDanger ? 'var(--color-secondary)' : 'var(--color-primary)'} className={!isDanger ? 'animate-pulse' : ''} />
                    </div>

                    <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 1, marginBottom: '0.5rem' }}>
                        {vendor?.plan ? `PLAN ${vendor.plan.toUpperCase()}` : 'SIN PLAN'}
                    </h2>

                    <div style={{ fontSize: '1rem', fontWeight: 900, color: isDanger ? '#EF4444' : 'var(--color-primary)', marginBottom: '1.5rem' }}>
                        ESTADO: {isDanger ? (daysLeft === 0 ? 'VENCIDO' : 'PRECAUCIÓN') : 'AL DÍA'}
                    </div>

                    <div style={{
                        height: '16px', background: '#000', borderRadius: '10px', padding: '3px',
                        border: '1.5px solid #000', marginBottom: '1.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            style={{
                                height: '100%',
                                background: isDanger ? 'var(--color-secondary)' : 'var(--color-primary)',
                                borderRadius: '6px',
                                boxShadow: `0 0 15px ${isDanger ? 'var(--color-secondary)' : 'var(--color-primary)'}`
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                        <span>{daysLeft} DÍAS RESTANTES</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                            <Calendar size={14} />
                            VENCE {vendor ? new Date(vendor.fecha_vencimiento).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--/--'}
                        </div>
                    </div>
                </div>

                {/* Historial de Pagos Recientes */}
                <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Clock size={20} className="text-gradient-primary" /> HISTORIAL DE PAGOS
                    </h3>
                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: '180px', paddingRight: '10px' }}>
                        {pagos.length === 0 ? (
                            <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem', fontWeight: 800 }}>
                                AÚN NO HAY PAGOS REGISTRADOS
                            </div>
                        ) : (
                            pagos.slice(0, 5).map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '2px dashed rgba(255,255,255,0.1)' }}>
                                    <div>
                                        <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>{new Date(p.creado_en).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }).toUpperCase()}</p>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: p.status === 'APROBADO' ? '#22C55E' : (p.status === 'RECHAZADO' ? '#EF4444' : '#F59E0B') }}>
                                            {p.status}
                                        </span>
                                    </div>
                                    <div style={{ fontWeight: 900 }}>${p.monto.toFixed(2)}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px' }}>LICENCIAS DE ACTIVACIÓN</h2>
                <p style={{ fontWeight: 800, opacity: 0.6 }}>SELECCIONA EL PLAN PARA RENOVAR TU CUENTA</p>
            </div>

            {hasPending && (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '2px dashed #F59E0B', padding: '1.5rem', borderRadius: '24px', marginBottom: '3rem', textAlign: 'center' }}>
                    <Clock size={40} color="#F59E0B" style={{ margin: '0 auto 1rem' }} />
                    <h4 style={{ fontWeight: 900, color: '#F59E0B', fontSize: '1.1rem', marginBottom: '0.5rem' }}>PAGO EN REVISIÓN</h4>
                    <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', opacity: 0.8 }}>
                        Hemos recibido tu comprobante y estamos validando la transacción. No puedes enviar un nuevo comprobante hasta que se valide el anterior.
                    </p>
                </div>
            )}

            {/* Grid de Planes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', placeItems: 'center' }}>
                {planes.map((plan, index) => {
                    const isMiddle = planes.length === 3 ? index === 1 : index === planes.length - 1;

                    return (
                        <div key={plan.id} className="card" style={{
                            padding: '2.5rem',

                            width: '100%',
                            background: isMiddle ? 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.5))' : 'var(--surface-raised)',
                            border: isMiddle ? '4px solid var(--color-primary)' : '4px solid #000',
                            transform: isMiddle ? 'scale(1.05)' : 'scale(1)',
                            position: 'relative',
                            overflow: 'visible'
                        }}>
                            {isMiddle && (
                                <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: '#000', fontWeight: 900, padding: '4px 16px', borderRadius: '12px', fontSize: '0.7rem' }}>MÁS POPULAR</div>
                            )}

                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, textAlign: 'center', marginBottom: '1rem' }}>{plan.nombre.toUpperCase()}</h3>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <span style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-2px' }}>Bs.{plan.precio}</span>
                                <p style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.5, marginTop: '5px' }}>{plan.dias} DÍAS DE ACCESO</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2.5rem' }}>
                                {/* Límite de Catálogo */}
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <CheckCircle2 size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                                        {plan.limite_servicios ? `Límite: ${plan.limite_servicios} Servicios Activos` : 'Servicios Ilimitados'}
                                    </span>
                                </div>

                                {/* Pedidos Automáticos */}
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', opacity: plan.pedidos_automaticos ? 1 : 0.4 }}>
                                    {plan.pedidos_automaticos ? <CheckCircle2 size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} /> : <X size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Pedidos Automáticos</span>
                                </div>

                                {/* Catálogo Público */}
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', opacity: plan.enlace_publico ? 1 : 0.4 }}>
                                    {plan.enlace_publico ? <CheckCircle2 size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} /> : <X size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Catálogo Público (E-commerce)</span>
                                </div>

                                {/* Marketplace Proveedor */}
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', opacity: plan.marketplace_proveedor ? 1 : 0.4 }}>
                                    {plan.marketplace_proveedor ? <CheckCircle2 size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} /> : <X size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Modo Proveedor (Marketplace)</span>
                                </div>

                                {/* Marca de Agua */}
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', opacity: plan.watermark_enabled ? 1 : 0.4 }}>
                                    {plan.watermark_enabled ? <CheckCircle2 size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} /> : <X size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Marca de Agua Personalizada</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedPlan(plan)}
                                disabled={hasPending}
                                className="btn-primary"
                                style={{ width: '100%', height: '54px', fontSize: '1rem', color: "var(--color-text)", background: isMiddle ? 'var(--color-primary)' : 'var(--surface-base)' }}
                            >
                                R E N O V A R
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Modal De Pago Custom - REFORMED FOR HIGH DENSITY & RESPONSIVENESS */}
            {selectedPlan && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="card custom-scroll"
                        style={{
                            width: '100%', maxWidth: '440px', maxHeight: '92vh', overflowY: 'auto',
                            background: 'var(--surface-base)', padding: '1.25rem', border: 'var(--border-thick)',
                            boxShadow: 'var(--shadow-heavy)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 950, margin: 0, letterSpacing: '-0.03em' }}>RENOVAR LICENCIA</h2>
                                <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-primary)', margin: 0 }}>{selectedPlan.nombre.toUpperCase()}</p>
                            </div>
                            <button className="btn-secondary" onClick={() => { setSelectedPlan(null); setFile(null); }} style={{ width: '32px', height: '32px', borderRadius: '8px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Selector de Moneda - Ultra Tight */}
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '3px', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <button
                                onClick={() => setCurrency('BOB')}
                                style={{ flex: 1, padding: '10px', borderRadius: '10px', background: currency === 'BOB' ? 'var(--color-primary)' : 'transparent', color: currency === 'BOB' ? 'var(--text-inverse)' : 'var(--text-primary)', fontWeight: 950, fontSize: '0.75rem', transition: '0.3s' }}
                            >
                                BOLIVIANOS (Bs)
                            </button>
                            <button
                                onClick={() => setCurrency('USD')}
                                style={{ flex: 1, padding: '10px', borderRadius: '10px', background: currency === 'USD' ? 'var(--color-primary)' : 'transparent', color: currency === 'USD' ? 'var(--text-inverse)' : 'var(--text-primary)', fontWeight: 950, fontSize: '0.75rem', transition: '0.3s' }}
                            >
                                DÓLARES (USD)
                            </button>
                        </div>

                        {/* Monto Dinámico */}
                        <div style={{ textAlign: 'center', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '16px', border: 'var(--border-thin)' }}>
                            <p style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--color-primary)', marginBottom: '0.2rem', letterSpacing: '0.1em' }}>IMPORTE A DEPOSITAR</p>
                            <p style={{ fontSize: '2rem', fontWeight: 950, lineHeight: 1, letterSpacing: '-0.02em' }}>
                                {currency === 'BOB' ? `Bs. ${selectedPlan.precio}` : `$${(selectedPlan.precio / (ajustes?.tasa_cambio_bob || 6.96)).toFixed(2)} USD`}
                            </p>
                        </div>

                        {/* QR Dinámico - Standardized Width */}
                        <div style={{
                            background: 'white', padding: '0.75rem', borderRadius: '20px',
                            border: '3px solid #000', width: '200px', margin: '0 auto 1.25rem',
                            boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.1)'
                        }}>
                            {(currency === 'BOB' ? (ajustes?.qr_cobro_bob || ajustes?.qr_cobro_url) : ajustes?.qr_cobro_usd) ? (
                                <img src={currency === 'BOB' ? (ajustes.qr_cobro_bob || ajustes.qr_cobro_url) : ajustes.qr_cobro_usd} style={{ width: '100%', borderRadius: '8px' }} alt="QR" />
                            ) : (
                                <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', flexDirection: 'column' }}>
                                    <QrCode size={48} style={{ marginBottom: '10px' }} />
                                    <span style={{ fontSize: '9px', fontWeight: 900, textAlign: 'center', opacity: 0.5 }}>QR NO DISPONIBLE</span>
                                </div>
                            )}
                        </div>

                        {/* Uploader Comprobante - High Density */}
                        <div style={{ position: 'relative', marginBottom: '1.25rem', height: '80px', border: '2px dashed var(--color-primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(var(--color-primary-rgb), 0.03)' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10, width: '100%', height: '100%' }}
                            />
                            <div style={{ pointerEvents: 'none' }}>
                                {file ? (
                                    <div style={{ color: 'var(--color-primary)', fontWeight: 950, textAlign: 'center', fontSize: '0.8rem' }}>
                                        <CheckCircle2 size={20} style={{ margin: '0 auto 0.2rem' }} />
                                        {file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name}
                                    </div>
                                ) : (
                                    <div style={{ opacity: 0.6, textAlign: 'center' }}>
                                        <Upload size={20} style={{ margin: '0 auto 0.2rem' }} color="var(--color-primary)" />
                                        <p style={{ fontWeight: 950, fontSize: '0.65rem' }}>CARGAR COMPROBANTE</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleSendReceipt}
                            disabled={uploading || !file}
                            className="btn-primary"
                            style={{ width: '100%', height: '52px', opacity: !file ? 0.5 : 1, fontSize: '1rem', borderRadius: '14px', fontWeight: 950, boxShadow: 'var(--shadow-glow)' }}
                        >
                            {uploading ? <RefreshCw className="animate-spin" /> : (currency === 'BOB' ? 'CONFIRMAR Y ENVIAR' : 'CONFIRM AND SEND')}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                            <p style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', opacity: 0.6 }}>
                                El tiempo de activación es de 5 a 60 minutos
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}

        </div>
    );
}
