/**
 * Gestión de Vendedores — Ares Redesign v2 (Cartoon-Futurista)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Ban, CheckCircle, Clock, ArrowUpCircle,
    Search, Filter, RefreshCw, Phone, ShieldCheck,
    History, CreditCard, X, AlertCircle, Pencil, Save, UserPlus, Loader2, Trash, AlertOctagon
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Combobox from '@/components/Combobox';

interface Vendor {
    id: string;
    nombre: string;
    alias: string;
    telefono: string;
    whatsapp?: string;
    plan: string;
    plan_id: string;
    app_config_id?: string;
    app_config?: AppConfig | null;
    status: string;
    role: string;
    es_colaborador?: boolean;
    fecha_registro: string;
    fecha_vencimiento: string;
    rating: number;
    biografia: string;
}

interface Plan {
    id: string;
    nombre: string;
}

interface AppConfig {
    id: string;
    nombre: string;
    descripcion?: string;
    modulos_activos: string; // JSON string "["home","flyers",...]"
}

export default function VendedoresPage() {
    const { isColaborador } = useAuth();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [appConfigs, setAppConfigs] = useState<AppConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterPlan, setFilterPlan] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterApp, setFilterApp] = useState('');
    const [toast, setToast] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
    const [editForm, setEditForm] = useState({ nombre: '', alias: '', telefono: '', whatsapp: '', password: '', app_config_id: '' });
    const [savingEdit, setSavingEdit] = useState(false);

    // Create Vendor
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ nombre: '', alias: '', telefono: '', password: '', plan_id: '', whatsapp: '', app_config_id: '' });
    const [creatingVendor, setCreatingVendor] = useState(false);
    const topScrollRef = useRef<HTMLDivElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [tableScrollWidth, setTableScrollWidth] = useState(0);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vendorsData, planesData, appsData] = await Promise.all([
                api.get('/admin/vendors'),
                api.get('/admin/planes'),
                api.get('/admin/app-configs'),
            ]);
            setVendors(vendorsData);
            setPlanes(planesData);
            setAppConfigs(appsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const openHistory = async (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setShowHistory(true);
        setLoadingPayments(true);
        try {
            const data = await api.get(`/admin/pagos?vendor_id=${vendor.id}`);
            setPayments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingPayments(false);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const [confirmAction, setConfirmAction] = useState<{ id: string, action: 'SUSPEND' | 'EXTEND' | 'DELETE_VENDOR', nombre: string } | null>(null);

    const handleSuspend = async () => {
        if (!confirmAction) return;
        try {
            await api.post(`/admin/vendors/${confirmAction.id}/suspend`);
            showToast('Vendedor suspendido ⛔');
            setConfirmAction(null);
            loadData();
        } catch (err) { console.error(err); }
    };

    const handleActivate = async (id: string) => {
        try {
            await api.post(`/admin/vendors/${id}/activate`);
            showToast('Vendedor activado ✅');
            loadData();
        } catch (err) { console.error(err); }
    };

    const handleExtend = async () => {
        if (!confirmAction) return;
        try {
            await api.post(`/admin/vendors/${confirmAction.id}/extend`);
            showToast('Suscripción extendida +30 días 🔋');
            setConfirmAction(null);
            loadData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteVendor = async () => {
        if (!confirmAction) return;
        try {
            await api.delete(`/admin/vendors/${confirmAction.id}`);
            showToast('Vendedor eliminado permanentemente 🗑️');
            setConfirmAction(null);
            loadData();
        } catch (err: any) { 
            showToast(err?.response?.data?.error || 'Error eliminando vendedor ❌');
        }
    };

    const handleChangePlan = async (vendorId: string, planId: string) => {
        try {
            await api.put(`/admin/vendors/${vendorId}/plan`, { plan_id: planId });
            showToast('Plan actualizado 🚀');
            loadData();
        } catch (err) { console.error(err); }
    };

    const openEdit = (vendor: Vendor) => {
        setEditingVendor(vendor);
        setEditForm({ nombre: vendor.nombre, alias: vendor.alias, telefono: vendor.telefono, whatsapp: vendor.whatsapp || '', password: '', app_config_id: vendor.app_config_id || '' });
    };

    const handleEditSave = async () => {
        if (!editingVendor) return;
        setSavingEdit(true);
        try {
            const payload: any = {
                nombre: editForm.nombre,
                alias: editForm.alias,
                telefono: editForm.telefono,
                whatsapp: editForm.whatsapp,
                app_config_id: editForm.app_config_id || null,
            };
            if (editForm.password) payload.password = editForm.password;
            await api.put(`/admin/vendors/${editingVendor.id}`, payload);
            showToast('Vendedor actualizado ✅');
            setEditingVendor(null);
            loadData();
        } catch (err: any) {
            showToast(err?.message || 'Error al guardar cambios ❌');
        } finally {
            setSavingEdit(false);
        }
    };

    const filteredVendors = vendors.filter(v => {
        if (search && !v.nombre.toLowerCase().includes(search.toLowerCase()) && !v.alias.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterPlan && v.plan !== filterPlan) return false;
        if (filterStatus && v.status !== filterStatus) return false;
        if (filterApp && v.app_config_id !== filterApp) return false;
        return true;
    });

    useEffect(() => {
        if (tableContainerRef.current) {
            setTableScrollWidth(tableContainerRef.current.scrollWidth);
        }
    }, [filteredVendors, loading]);

    useEffect(() => {
        const top = topScrollRef.current;
        const table = tableContainerRef.current;
        if (!top || !table) return;

        const syncTop = () => { if (table.scrollLeft !== top.scrollLeft) table.scrollLeft = top.scrollLeft; };
        const syncTable = () => { if (top.scrollLeft !== table.scrollLeft) top.scrollLeft = table.scrollLeft; };

        top.addEventListener('scroll', syncTop);
        table.addEventListener('scroll', syncTable);

        return () => {
            top.removeEventListener('scroll', syncTop);
            table.removeEventListener('scroll', syncTable);
        };
    }, []);

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <div className="chip chip-active">Activo</div>;
            case 'SUSPENDED': return <div className="chip chip-danger">Suspendido</div>;
            case 'EXPIRED': return <div className="chip chip-warning">Vencido</div>;
            default: return <div className="chip">{status}</div>;
        }
    };

    const getPlanChip = (plan: string) => {
        switch (plan) {
            case 'Pro': return <div className="chip chip-pro">PRO</div>;
            case 'Proveedor': return <div className="chip chip-gold">SUPPLY</div>;
            case 'Vendedor': return <div className="chip chip-blue">BASIC</div>;
            default: return <div className="chip">{plan}</div>;
        }
    };

    const daysUntilExpiry = (date: string) => {
        const diff = new Date(date).getTime() - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                            zIndex: 3000, background: '#000', color: 'white',
                            padding: '1.25rem 2.5rem', borderRadius: '24px',
                            border: '2px solid var(--color-primary)',
                            boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        <ShieldCheck color="var(--color-primary)" />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Bento */}
            <div className="card max-sm:flex-col max-sm:items-start max-sm:gap-4 max-sm:px-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2.5rem' }} >
                <div>
                    <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#000', padding: '0.8rem', borderRadius: '16px', color: 'var(--color-primary)' }}>
                            <Users size={32} />
                        </div>
                        <div>
                            RED DE <span className="text-gradient-primary">VENDEDORES</span>
                        </div>
                    </h1>
                    <p style={{ fontWeight: 800, color: 'var(--text-muted)', marginTop: '0.5rem' }} className="max-sm:hidden">
                        Gestionas {vendors.length} aliados comerciales en la plataforma.
                    </p>

                </div>
                <div className="flex items-center gap-4">
                    <button onClick={loadData} className="btn-secondary max-lg:mr-10" disabled={loading}>
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />

                    </button>
                    <button onClick={() => { setCreateForm({ nombre: '', alias: '', telefono: '', password: '', plan_id: planes[0]?.id || '', whatsapp: '', app_config_id: '' }); setShowCreateModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={20} /> CREAR VENDEDOR
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input"
                        placeholder="Buscar por nombre, alias o identificación..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '3.5rem', height: '60px' }}
                    />
                </div>
                <div style={{ width: '220px' }}>
                    <Combobox
                        placeholder="Filtrar plan..."
                        options={[
                            { id: '', nombre: 'TODOS LOS PLANES' },
                            ...planes.map(p => ({ id: p.nombre, nombre: p.nombre.toUpperCase() }))
                        ]}
                        value={filterPlan}
                        onChange={(val: any) => setFilterPlan(val)}
                    />
                </div>
                <div style={{ width: '220px' }}>
                    <Combobox
                        placeholder="Filtrar estado..."
                        options={[
                            { id: '', nombre: 'TODOS LOS ESTADOS' },
                            { id: 'ACTIVE', nombre: 'ACTIVO' },
                            { id: 'SUSPENDED', nombre: 'SUSPENDIDO' }
                        ]}
                        value={filterStatus}
                        onChange={(val: any) => setFilterStatus(val)}
                    />
                </div>
                <div style={{ width: '220px' }}>
                    <Combobox
                        placeholder="Filtrar aplicación..."
                        options={[
                            { id: '', nombre: 'TODAS LAS APPS' },
                            ...appConfigs.map(a => ({ id: a.id, nombre: a.nombre.toUpperCase() }))
                        ]}
                        value={filterApp}
                        onChange={(val: any) => setFilterApp(val)}
                    />
                </div>
            </div>

            {/* Top Scrollbar — Sync with table */}
            <div
                ref={topScrollRef}
                className="max-xl:block hidden"
                style={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    height: '14px',
                    marginBottom: '-1rem',
                    zIndex: 30,
                    position: 'relative'
                }}
            >
                <div style={{ width: `${tableScrollWidth}px`, height: '1px' }}></div>
            </div>

            {/* Table Futurista — Double Scroll Enabled */}
            <div
                ref={tableContainerRef}
                className="table-container max-xl:overflow-x-auto max-xl:-ml-16 max-xl:w-[110%] max-md:ml-0 max-md:w-full "
                style={{ overflowY: 'visible' }}
            >
                <table className="table">
                    <thead>
                        <tr>
                            <th>Identidad / Alias</th>
                            <th>Suscripción</th>
                            <th>Estado</th>
                            <th>Colaborador</th>
                            <th>Vencimiento</th>
                            {!isColaborador && <th style={{ textAlign: 'center' }}>Acciones Maestras</th>}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {filteredVendors.map((v, i) => {
                                const days = daysUntilExpiry(v.fecha_vencimiento);
                                return (
                                    <motion.tr
                                        key={v.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                    >
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '64px', height: '64px', borderRadius: '16px',
                                                    background: 'var(--surface-raised)', padding: '0.5rem',
                                                    border: '2px solid var(--border-color)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    {v.nombre[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {v.nombre}
                                                        {v.rating > 0 && <span style={{ fontSize: '0.7rem', color: '#EAB308', background: 'rgba(234, 179, 8, 0.1)', padding: '2px 6px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '2px' }}>★ {v.rating}</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                                        @{v.alias} · {v.telefono}
                                                    </div>
                                                    {v.biografia && <div style={{ fontSize: '0.65rem', opacity: 0.5, fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.biografia}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{getPlanChip(v.plan)}</td>
                                        <td>{getStatusChip(v.status)}</td>
                                        <td>
                                            <button
                                                onClick={async () => {
                                                    if (isColaborador) return;
                                                    try {
                                                        await api.patch(`/admin/vendors/${v.id}/colaborador`);
                                                        loadData();
                                                        showToast(v.es_colaborador ? 'Colaborador desactivado' : 'Colaborador activado ✅');
                                                    } catch (err) { console.error(err); }
                                                }}
                                                disabled={isColaborador}
                                                style={{
                                                    width: '44px', height: '24px', borderRadius: '12px', border: '2px solid #000',
                                                    background: v.es_colaborador ? 'var(--color-primary)' : 'var(--surface-raised)',
                                                    cursor: isColaborador ? 'not-allowed' : 'pointer', position: 'relative', transition: '0.3s',
                                                    opacity: isColaborador ? 0.5 : 1
                                                }}
                                            >
                                                <div style={{
                                                    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                                                    border: '2px solid #000', position: 'absolute', top: '1px',
                                                    left: v.es_colaborador ? '20px' : '2px', transition: '0.3s'
                                                }} />
                                            </button>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={14} color={days <= 3 ? 'var(--color-danger)' : 'var(--text-muted)'} />
                                                <span style={{
                                                    color: days <= 3 ? 'var(--color-danger)' : days <= 7 ? '#B45309' : 'var(--text-primary)',
                                                    fontWeight: 800,
                                                    fontSize: '0.9rem',
                                                }}>
                                                    {days > 0 ? `${days} DÍAS` : 'VENCIDO'}
                                                </span>
                                            </div>
                                        </td>
                                        {!isColaborador && (
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                                    {v.status === 'ACTIVE' ? (
                                                        <button onClick={() => setConfirmAction({ id: v.id, action: 'SUSPEND', nombre: v.nombre })} className="btn-secondary" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', boxShadow: 'none' }} title="Suspender">
                                                            <Ban size={18} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleActivate(v.id)} className="btn-secondary" style={{ padding: '0.5rem', borderColor: '#16A34A', color: '#16A34A', boxShadow: 'none', borderRadius: "100%" }} title="Activar">
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => openHistory(v)} className="btn-secondary" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', boxShadow: 'none' }} title="Historial de Pagos">
                                                        <History size={18} />
                                                    </button>
                                                    <button onClick={() => openEdit(v)} className="btn-secondary" style={{ borderColor: '#6366F1', color: '#6366F1', boxShadow: 'none' }} title="Editar Vendedor">
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button onClick={() => setConfirmAction({ id: v.id, action: 'EXTEND', nombre: v.nombre })} className="btn-secondary" style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)', boxShadow: 'none' }} title="Extender 30 días">
                                                        <Clock size={18} />
                                                    </button>
                                                    <button onClick={() => setConfirmAction({ id: v.id, action: 'DELETE_VENDOR', nombre: v.nombre })} className="btn-secondary" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', boxShadow: 'none' }} title="Eliminar definitivamente">
                                                        <Trash size={18} />
                                                    </button>
                                                    <div style={{ width: '150px' }}>
                                                        <Combobox
                                                            placeholder="Plan..."
                                                            options={planes.map(p => ({ id: p.id, nombre: p.nombre.toUpperCase() }))}
                                                            value={v.plan_id}
                                                            onChange={(val: any) => handleChangePlan(v.id, val)}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Modal de Confirmación Ares v2 */}
            <AnimatePresence>
                {confirmAction && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-container"
                            style={{ padding: '3rem', maxWidth: '450px', border: '3px solid #000', textAlign: 'center' }}
                        >
                            <div style={{
                                background: confirmAction.action === 'SUSPEND' || confirmAction.action === 'DELETE_VENDOR' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 2rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {confirmAction.action === 'SUSPEND' ? <Ban size={40} color="var(--color-danger)" /> : confirmAction.action === 'DELETE_VENDOR' ? <AlertOctagon size={40} color="var(--color-danger)" /> : <Clock size={40} color="var(--color-primary)" />}
                            </div>

                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
                                {confirmAction.action === 'SUSPEND' ? '¿SUSPENDER ACCESO?' : confirmAction.action === 'DELETE_VENDOR' ? '¿ELIMINAR VENDEDOR?' : '¿EXTENDER LICENCIA?'}
                            </h2>

                            <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                                {confirmAction.action === 'SUSPEND'
                                    ? `El vendedor ${confirmAction.nombre} perderá el acceso a la plataforma de inmediato.`
                                    : confirmAction.action === 'DELETE_VENDOR'
                                    ? `ADVERTENCIA: Esta acción es irreversible. Se eliminará a ${confirmAction.nombre} y todo su historial de pedidos y pagos.`
                                    : `Se añadirán 30 días de vigencia a la cuenta de ${confirmAction.nombre}.`}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-secondary" style={{ flex: 1, border: 'none' }} onClick={() => setConfirmAction(null)}>CANCELAR</button>
                                <button
                                    className="btn-primary"
                                    style={{
                                        flex: 1,
                                        background: confirmAction.action === 'SUSPEND' || confirmAction.action === 'DELETE_VENDOR' ? 'var(--color-danger)' : 'var(--color-primary)',
                                        color: 'white'
                                    }}
                                    onClick={confirmAction.action === 'SUSPEND' ? handleSuspend : confirmAction.action === 'DELETE_VENDOR' ? handleDeleteVendor : handleExtend}
                                >
                                    {confirmAction.action === 'SUSPEND' ? 'SUSPENDER' : confirmAction.action === 'DELETE_VENDOR' ? 'ELIMINAR' : 'CONFIRMAR'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Historial de Pagos */}
            <AnimatePresence>
                {showHistory && selectedVendor && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="modal-container"
                            style={{ padding: '3rem', maxWidth: '750px', width: '90%', border: '4px solid #000', borderRadius: '32px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: 'var(--color-primary)', padding: '0.6rem', borderRadius: '12px', color: '#000' }}>
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1 }}>HISTORIAL PAGOS</h2>
                                        <p style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedVendor.nombre.toUpperCase()}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowHistory(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={32} /></button>
                            </div>

                            {loadingPayments ? (
                                <div style={{ padding: '4rem', textAlign: 'center' }}><RefreshCw className="animate-spin" size={32} color="var(--color-primary)" style={{ margin: '0 auto' }} /></div>
                            ) : payments.length === 0 ? (
                                <div style={{ padding: '4rem', textAlign: 'center', border: '3px dashed rgba(0,0,0,0.1)', borderRadius: '24px' }}>
                                    <p style={{ fontWeight: 800, opacity: 0.4 }}>SIN MOVIMIENTOS REGISTRADOS</p>
                                </div>
                            ) : (
                                <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Plan</th>
                                                <th>Monto</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map(p => (
                                                <tr key={p.id}>
                                                    <td style={{ fontWeight: 700, fontSize: '0.85rem' }}>{new Date(p.creado_en).toLocaleString()}</td>
                                                    <td style={{ fontWeight: 800 }}>{p.plan?.nombre?.toUpperCase() || 'PLAN DESCONOCIDO'}</td>
                                                    <td style={{ fontWeight: 900, color: 'var(--color-primary)' }}>Bs {p.monto}</td>
                                                    <td>
                                                        <div className={`chip ${p.status === 'CONFIRMADO' ? 'chip-active' : p.status === 'RECHAZADO' ? 'chip-danger' : 'chip-warning'}`}>
                                                            {p.status}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Editar Vendedor */}
            <AnimatePresence>
                {editingVendor && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="modal-container"
                            style={{ padding: '3rem', maxWidth: '550px', width: '90%', border: '4px solid #000', borderRadius: '32px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: '#6366F1', padding: '0.6rem', borderRadius: '12px', color: '#fff' }}>
                                        <Pencil size={24} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1 }}>EDITAR VENDEDOR</h2>
                                        <p style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{editingVendor.alias}</p>
                                    </div>
                                </div>
                                <button onClick={() => setEditingVendor(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={32} /></button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, display: 'block', marginBottom: '0.4rem' }}>NOMBRE COMPLETO</label>
                                    <input className="input" value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre completo" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, display: 'block', marginBottom: '0.4rem' }}>ALIAS (aparece en marca de agua)</label>
                                    <input className="input" value={editForm.alias} onChange={e => setEditForm(f => ({ ...f, alias: e.target.value }))} placeholder="alias" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, display: 'block', marginBottom: '0.4rem' }}>TELÉFONO</label>
                                        <input className="input" value={editForm.telefono} onChange={e => setEditForm(f => ({ ...f, telefono: e.target.value }))} placeholder="591XXXXXXX" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, display: 'block', marginBottom: '0.4rem' }}>WHATSAPP</label>
                                        <input className="input" value={editForm.whatsapp} onChange={e => setEditForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="591XXXXXXX" />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, display: 'block', marginBottom: '0.4rem' }}>NUEVA CONTRASEÑA (dejar en blanco para no cambiar)</label>
                                    <input className="input" type="password" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
                                </div>
                                {/* Aplicación asignada */}
                                <div>
                                    <Combobox
                                        label="APLICACIÓN ASIGNADA (opcional)"
                                        placeholder="Sin restricción — acceso completo"
                                        options={[
                                            { id: '', nombre: 'SIN APLICACIÓN — ACCESO COMPLETO' },
                                            ...appConfigs.map(a => ({ id: a.id, nombre: a.nombre + (a.descripcion ? ` — ${a.descripcion}` : '') }))
                                        ]}
                                        value={editForm.app_config_id}
                                        onChange={(val: any) => setEditForm(f => ({ ...f, app_config_id: val }))}
                                    />
                                    {editForm.app_config_id && (() => {
                                        const app = appConfigs.find(a => a.id === editForm.app_config_id);
                                        if (!app) return null;
                                        let mods: string[] = [];
                                        try { mods = JSON.parse(app.modulos_activos || '[]'); } catch { /* */ }
                                        return (
                                            <div style={{ marginTop: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(187,72,18,0.1)', border: '2px solid var(--color-primary)', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                                                ℹ️ {mods.length} módulos habilitados con esta aplicación
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn-secondary" style={{ flex: 1, border: 'none' }} onClick={() => setEditingVendor(null)}>CANCELAR</button>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={handleEditSave}
                                    disabled={savingEdit}
                                >
                                    {savingEdit ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                    {savingEdit ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Crear Vendedor */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="modal-container"
                            style={{ padding: '3rem', maxWidth: '550px', width: '90%', border: '4px solid #000', borderRadius: '32px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: '#10B981', padding: '0.6rem', borderRadius: '12px', color: '#fff' }}>
                                        <UserPlus size={24} />
                                    </div>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1 }}>CREAR VENDEDOR</h2>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={32} /></button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, display: 'block', marginBottom: '0.4rem' }}>NOMBRE COMPLETO</label>
                                    <input className="input" value={createForm.nombre} onChange={e => setCreateForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre del vendedor" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, display: 'block', marginBottom: '0.4rem' }}>ALIAS</label>
                                    <input className="input" value={createForm.alias} onChange={e => setCreateForm(f => ({ ...f, alias: e.target.value }))} placeholder="alias_vendedor" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, display: 'block', marginBottom: '0.4rem' }}>TELÉFONO</label>
                                        <input className="input" value={createForm.telefono} onChange={e => setCreateForm(f => ({ ...f, telefono: e.target.value }))} placeholder="591XXXXXXX" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, display: 'block', marginBottom: '0.4rem' }}>WHATSAPP (opcional)</label>
                                        <input className="input" value={createForm.whatsapp} onChange={e => setCreateForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="591XXXXXXX" />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.6, display: 'block', marginBottom: '0.4rem' }}>CONTRASEÑA</label>
                                    <input className="input" type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} placeholder="Contraseña inicial" />
                                </div>
                                <div>
                                    <Combobox
                                        label="PLAN"
                                        placeholder="Seleccionar plan..."
                                        options={planes.map(p => ({ id: p.id, nombre: p.nombre.toUpperCase() }))}
                                        value={createForm.plan_id}
                                        onChange={(val: any) => setCreateForm({ ...createForm, plan_id: val })}
                                    />
                                </div>
                                {/* Aplicación asignada */}
                                <div>
                                    <Combobox
                                        label="APLICACIÓN (opcional)"
                                        placeholder="Sin restricción — acceso completo"
                                        options={[
                                            { id: '', nombre: 'SIN APLICACIÓN — ACCESO COMPLETO' },
                                            ...appConfigs.map(a => ({ id: a.id, nombre: a.nombre + (a.descripcion ? ` — ${a.descripcion}` : '') }))
                                        ]}
                                        value={createForm.app_config_id}
                                        onChange={(val: any) => setCreateForm({ ...createForm, app_config_id: val })}
                                    />
                                    {createForm.app_config_id && (() => {
                                        const app = appConfigs.find(a => a.id === createForm.app_config_id);
                                        if (!app) return null;
                                        let mods: string[] = [];
                                        try { mods = JSON.parse(app.modulos_activos || '[]'); } catch { /* */ }
                                        return (
                                            <div style={{ marginTop: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(16,185,129,0.1)', border: '2px solid #10B981', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, color: '#10B981' }}>
                                                ✅ {mods.length} módulos habilitados con esta aplicación
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn-secondary" style={{ flex: 1, border: 'none' }} onClick={() => setShowCreateModal(false)}>CANCELAR</button>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#10B981' }}
                                    disabled={creatingVendor || !createForm.nombre || !createForm.alias || !createForm.telefono || !createForm.password || !createForm.plan_id}
                                    onClick={async () => {
                                        setCreatingVendor(true);
                                        try {
                                            await api.post('/admin/vendors', createForm);
                                            showToast('Vendedor creado exitosamente ✅');
                                            setShowCreateModal(false);
                                            loadData();
                                        } catch (err: any) {
                                            showToast(err?.message || err?.data?.error || 'Error creando vendedor ❌');
                                        } finally {
                                            setCreatingVendor(false);
                                        }
                                    }}
                                >
                                    {creatingVendor ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                                    {creatingVendor ? 'CREANDO...' : 'CREAR VENDEDOR'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
