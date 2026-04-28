/**
 * Página: Gestión de Pagos — Ares v2 (Cartoon-Futurista)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, CheckCircle, XCircle, Search, Calendar,
    User, DollarSign, Image as ImageIcon, ExternalLink,
    Clock, ShieldCheck, Ban, Info, AlertCircle, X, Plus, Upload, Loader2, RefreshCw, Trash
} from 'lucide-react';
import api from '@/lib/api';
import Combobox from '@/components/Combobox';

interface Pago {
    id: string;
    vendor_id: string;
    monto: number;
    plan_id: string;
    comprobante_url: string | null;
    status: string;
    creado_en: string;
    vendor: {
        nombre: string;
        alias: string;
        telefono: string;
    };
    plan: {
        nombre: string;
        dias: number;
    };
}

interface Vendor {
    id: string;
    nombre: string;
    alias: string;
}

interface Plan {
    id: string;
    nombre: string;
    precio: number;
}

export default function PagosPage() {
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    // Modal de Confirmación
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        type: 'APPROVE' | 'REJECT';
        pagoId: string;
        vendedor: string;
    }>({ show: false, type: 'APPROVE', pagoId: '', vendedor: '' });

    const [rejectNotes, setRejectNotes] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; pagoId: string | null }>({ open: false, pagoId: null });

    // Modal de Pago Manual
    const [showManualModal, setShowManualModal] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [manualPago, setManualPago] = useState({
        vendor_id: '',
        plan_id: '',
        monto: 0,
        archivo: null as File | null
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [pagosData, vendorsData, plansData] = await Promise.all([
                api.get('/admin/pagos'),
                api.get('/admin/vendors'),
                api.get('/admin/planes')
            ]);
            setPagos(pagosData);
            setVendors(vendorsData);
            setPlans(plansData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const executeAction = async () => {
        try {
            if (confirmModal.type === 'APPROVE') {
                await api.post(`/admin/pagos/${confirmModal.pagoId}/confirm`, { notas: 'Aprobado desde Panel Admin' });
            } else {
                await api.post(`/admin/pagos/${confirmModal.pagoId}/reject`, { notas: rejectNotes || 'Rechazado por el administrador' });
            }
            setConfirmModal({ ...confirmModal, show: false });
            setRejectNotes('');
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeletePago = async () => {
        if (!deleteModal.pagoId) return;
        try {
            await api.delete(`/admin/pagos/${deleteModal.pagoId}`);
            setDeleteModal({ open: false, pagoId: null });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRegisterManual = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualPago.vendor_id || !manualPago.plan_id) return;
        setRegistering(true);
        try {
            const formData = new FormData();
            formData.append('vendor_id', manualPago.vendor_id);
            formData.append('plan_id', manualPago.plan_id);
            formData.append('monto', manualPago.monto.toString());
            if (manualPago.archivo) {
                formData.append('imagen', manualPago.archivo);
            }

            const token = localStorage.getItem('ares_token');
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/pagos/manual`;

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to register manual payment');

            setShowManualModal(false);
            setManualPago({ vendor_id: '', plan_id: '', monto: 0, archivo: null });
            loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setRegistering(false);
        }
    };

    const filteredPagos = pagos.filter(p =>
        p.vendor.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.vendor.alias.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }} className='max-sm:flex-col max-sm:items-start max-sm:gap-4'>
                <div>
                    <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#000', padding: '0.8rem', borderRadius: '16px', color: 'var(--color-primary)' }} className='max-sm:hidden'>
                            <CreditCard size={32} />
                        </div>
                        <div>
                            CONTROL <span className="text-gradient-primary">PAGOS</span>
                        </div>
                        <button
                            onClick={loadData}
                            className="btn-secondary max-xl:mr-10"
                            style={{ padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '1rem' }}
                            title="Refrescar Transacciones"
                        >
                            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </h1>
                    <p className='max-sm:hidden' style={{ fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                        Aprobación manual y extensión de suscripciones Ares
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowManualModal(true)} style={{ padding: '1rem 2rem', height: '60px', borderRadius: '18px', gap: '0.8rem' }}>
                    <Plus size={24} /> REGISTRAR PAGO MANUAL
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className='max-sm:flex-col max-sm:items-start max-sm:gap-4'>
                <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }} >
                    <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input"
                        placeholder="Buscar vendedor..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '3.5rem', height: '60px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="card" style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', borderWidth: '2px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 10px var(--color-primary)' }} />
                        <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>{pagos.filter(p => p.status === 'PENDIENTE').length} PENDIENTES</span>
                    </div>
                </div>
            </div>

            <div className="table-container max-xl:w-[115%] max-xl:-ml-15 max-md:w-[100%] max-md:ml-0">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Vendedor</th>
                            <th>Plan / Monto</th>
                            <th>Comprobante</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '5rem' }}><div className="animate-pulse" style={{ fontWeight: 900 }}>EXTRAYENDO TRANSACCIONES...</div></td></tr>
                        ) : filteredPagos.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '5rem', fontWeight: 900, opacity: 0.5 }}>SIN MOVIMIENTOS REGISTRADOS</td></tr>
                        ) : filteredPagos.map((p, i) => (
                            <motion.tr
                                key={p.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <Calendar size={16} color="var(--text-muted)" />
                                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{formatDate(p.creado_en)}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: 'var(--surface-raised)', border: '2px solid #000',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 900 }}>{p.vendor.nombre}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>@{p.vendor.alias}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>{p.plan.nombre}</span>
                                        <span style={{ fontWeight: 900, color: 'var(--color-accent)', fontSize: '1.1rem' }}>{p.monto} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Bs</span></span>
                                    </div>
                                </td>
                                <td>
                                    {p.comprobante_url ? (
                                        <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }} onClick={() => setSelectedImg(p.comprobante_url)}>
                                            <ImageIcon size={14} style={{ marginRight: '6px' }} /> VER IMAGEN
                                        </button>
                                    ) : (
                                        <span style={{ opacity: 0.3, fontSize: '0.7rem', fontWeight: 800 }}>SIN ADJUNTO</span>
                                    )}
                                </td>
                                <td>
                                    <div className={`chip ${p.status === 'PENDIENTE' ? 'chip-gold' : p.status === 'CONFIRMADO' ? 'chip-active' : 'chip-danger'}`} style={{ fontWeight: 900 }}>
                                        {p.status === 'PENDIENTE' && <Clock size={14} style={{ marginRight: '4px' }} />}
                                        {p.status === 'CONFIRMADO' && <CheckCircle size={14} style={{ marginRight: '4px' }} />}
                                        {p.status === 'RECHAZADO' && <Ban size={14} style={{ marginRight: '4px' }} />}
                                        {p.status}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {p.status === 'PENDIENTE' ? (
                                            <>
                                                <button className="btn-primary" style={{ flex: 1, padding: '0.5rem', background: '#10B981', border: '2px solid #000' }} onClick={() => setConfirmModal({ show: true, type: 'APPROVE', pagoId: p.id, vendedor: p.vendor.nombre })}>
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button className="btn-primary" style={{ flex: 1, padding: '0.5rem', background: '#EF4444', border: '2px solid #000' }} onClick={() => setConfirmModal({ show: true, type: 'REJECT', pagoId: p.id, vendedor: p.vendor.nombre })}>
                                                    <XCircle size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <div style={{ opacity: 0.3, fontWeight: 900, fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>PROCESADO</div>
                                        )}
                                        <button className="btn-secondary" style={{ padding: '0.5rem', border: '2px solid var(--color-danger)', color: 'var(--color-danger)' }} onClick={() => setDeleteModal({ open: true, pagoId: p.id })} title="Eliminar Registro">
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Registrar Pago Manual */}
            <AnimatePresence>
                {showManualModal && (
                    <div className="modal-overlay" onClick={() => setShowManualModal(false)}>
                        <motion.div
                            className="card"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{ padding: '3.5rem', maxWidth: '600px', width: '95%', border: '4px solid #000', borderRadius: '32px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                                    REGISTRAR <span className="text-gradient-primary">PAGO</span>
                                </h2>
                                <button onClick={() => setShowManualModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={40} /></button>
                            </div>

                            <form onSubmit={handleRegisterManual} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <Combobox
                                        label="VENDEDOR / CLIENTE"
                                        placeholder="Seleccione un vendedor..."
                                        options={vendors.filter(v => v.alias !== 'admin').map(v => ({
                                            id: v.id,
                                            nombre: v.nombre,
                                            subtext: `@${v.alias}`
                                        }))}
                                        value={manualPago.vendor_id}
                                        onChange={(val: any) => setManualPago({ ...manualPago, vendor_id: val })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <Combobox
                                            label="PLAN A ACTIVAR"
                                            placeholder="Seleccione plan..."
                                            options={plans.map(p => ({ id: p.id, nombre: `${p.nombre} (${p.precio} Bs)` }))}
                                            value={manualPago.plan_id}
                                            onChange={(val: any) => {
                                                const plan = plans.find(p => p.id === val);
                                                setManualPago({ ...manualPago, plan_id: val, monto: plan?.precio || 0 });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">MONTO RECIBIDO (BS)</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={manualPago.monto}
                                            onChange={e => setManualPago({ ...manualPago, monto: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ border: '4px dashed var(--color-primary)', borderRadius: '24px', padding: '2rem', textAlign: 'center', background: 'var(--surface-base)', position: 'relative' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) setManualPago({ ...manualPago, archivo: file });
                                        }}
                                    />
                                    {manualPago.archivo ? (
                                        <div style={{ fontWeight: 900, color: 'var(--color-primary)' }}>
                                            <ImageIcon size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                                            {manualPago.archivo.name.toUpperCase()}
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={40} color="var(--color-primary)" style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                                            <p style={{ fontWeight: 900, fontSize: '1rem' }}>SUBIR COMPROBANTE (OPCIONAL)</p>
                                            <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>JPG o PNG</p>
                                        </>
                                    )}
                                </div>

                                <button type="submit" disabled={registering} className="btn-primary" style={{ width: '100%', padding: '1.5rem', fontSize: '1.1rem', marginTop: '1rem' }}>
                                    {registering ? <Loader2 className="animate-spin" /> : 'CONFIRMAR Y ACTIVAR SUSCRIPCIÓN'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Lightbox Comprobante */}
            <AnimatePresence>
                {selectedImg && (
                    <div className="modal-overlay" onClick={() => setSelectedImg(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <img src={selectedImg} alt="Comprobante" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '16px', border: '4px solid #000' }} />
                            <button
                                onClick={() => setSelectedImg(null)}
                                className="btn-primary"
                                style={{ position: 'absolute', top: '-20px', right: '-20px', borderRadius: '50%', padding: '0.5rem' }}
                            >
                                <X size={24} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Confirmación Custom (Aprobar/Rechazar) */}
            <AnimatePresence>
                {confirmModal.show && (
                    <div className="modal-overlay" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                        <motion.div
                            className="card"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{ padding: '2.5rem', maxWidth: '500px', width: '90%' }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '70px', height: '70px', borderRadius: '20px',
                                    background: confirmModal.type === 'APPROVE' ? '#10B981' : '#EF4444',
                                    margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', boxShadow: '4px 4px 0px #000', border: '2px solid #000'
                                }}>
                                    {confirmModal.type === 'APPROVE' ? <ShieldCheck size={40} /> : <AlertCircle size={40} />}
                                </div>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                                    {confirmModal.type === 'APPROVE' ? '¿APROBAR PAGO?' : '¿RECHAZAR PAGO?'}
                                </h2>
                                <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    Vendedor: <span style={{ color: 'var(--text-primary)' }}>{confirmModal.vendedor}</span>
                                </p>

                                {confirmModal.type === 'REJECT' && (
                                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 900, fontSize: '0.8rem' }}>MOTIVO DEL RECHAZO:</label>
                                        <textarea
                                            className="input"
                                            style={{ height: '100px', resize: 'none', padding: '1rem' }}
                                            placeholder="Ej: El comprobante es falso o el monto no coincide."
                                            value={rejectNotes}
                                            onChange={e => setRejectNotes(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <button className="btn-secondary" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                                        CANCELAR
                                    </button>
                                    <button className="btn-primary" style={{ background: confirmModal.type === 'APPROVE' ? '#10B981' : '#EF4444' }} onClick={executeAction}>
                                        {confirmModal.type === 'APPROVE' ? 'APROBAR' : 'RECHAZAR'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Eliminar Pago */}
            <AnimatePresence>
                {deleteModal.open && (
                    <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, pagoId: null })}>
                        <motion.div
                            className="card"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{ padding: '2.5rem', maxWidth: '400px', width: '90%', textAlign: 'center' }}
                        >
                            <div style={{
                                width: '70px', height: '70px', borderRadius: '20px',
                                background: '#EF4444', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', boxShadow: '4px 4px 0px #000', border: '2px solid #000'
                            }}>
                                <Trash size={40} />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>¿ELIMINAR PAGO?</h2>
                            <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                Esta acción eliminará permanentemente el registro de este pago.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button className="btn-secondary" onClick={() => setDeleteModal({ open: false, pagoId: null })}>CANCELAR</button>
                                <button className="btn-primary" style={{ background: '#EF4444' }} onClick={handleDeletePago}>ELIMINAR</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
