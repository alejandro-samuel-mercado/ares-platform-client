/**
 * Página: Gestión de Servicios Base — Ares v2 (Cartoon-Futurista)
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Edit2, Trash2, X, AlertTriangle, CheckCircle, Info, Layers, LayoutGrid, Zap, Upload, Link } from 'lucide-react';
import api from '@/lib/api';

interface Categoria {
    id: string;
    nombre: string;
}

interface Servicio {
    id: string;
    nombre: string;
    logo_url: string;
    descripcion_base: string;
    precio_admin: number;
    categoria: string;
    es_iptv_propio: boolean;
    estado_actual: string;
    nota_estado?: string;
    activo: boolean;
    proveedor_alias?: string;
    proveedor_nombre?: string;
    app_config_id?: string | null;
    app_config?: { nombre: string } | null;
}

export default function ServiciosPage() {
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [apps, setApps] = useState<{id: string, nombre: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<Servicio> | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [tasaCambio, setTasaCambio] = useState(6.96);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [useUrlMode, setUseUrlMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const load = () => {
        setLoading(true);
        Promise.all([
            api.get('/admin/servicios'),
            api.get('/ajustes-publicos'),
            api.get('/categorias?tipo=SERVICIO'),
            api.get('/admin/app-configs')
        ])
            .then(([svcs, ajustes, cats, appsRes]) => {
                setServicios(svcs.filter((s: Servicio) => !!s.activo && String(s.activo) !== '0' && String(s.activo) !== 'false'));
                if (ajustes?.tasa_cambio_bob) setTasaCambio(ajustes.tasa_cambio_bob);
                setCategorias(cats);
                setApps(appsRes || []);
                if (cats.length > 0 && !editing?.categoria) {
                    // update if creating new
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const triggerToast = (msg: string) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSave = async () => {
        if (!editing) return;
        try {
            let body: any;
            const useForm = logoFile != null;
            if (useForm) {
                const fd = new FormData();
                fd.append('logo', logoFile);
                if (editing.nombre) fd.append('nombre', editing.nombre);
                if (editing.descripcion_base) fd.append('descripcion_base', editing.descripcion_base);
                if (editing.precio_admin != null) fd.append('precio_admin', String(editing.precio_admin));
                if (editing.categoria) fd.append('categoria', editing.categoria);
                if (editing.estado_actual) fd.append('estado_actual', editing.estado_actual);
                fd.append('es_iptv_propio', String(!!editing.es_iptv_propio));
                fd.append('activo', String(editing.activo ?? true));
                if (editing.nota_estado) fd.append('nota_estado', editing.nota_estado);
                if (editing.app_config_id !== undefined) fd.append('app_config_id', editing.app_config_id || '');
                body = fd;
            } else {
                body = editing;
            }

            if (editing.id) {
                if (useForm) {
                    await api.request(`/admin/servicios/${editing.id}`, { method: 'PUT', body });
                } else {
                    await api.put(`/admin/servicios/${editing.id}`, body);
                }
                triggerToast('CATÁLOGO ACTUALIZADO');
            } else {
                if (useForm) {
                    await api.request('/admin/servicios', { method: 'POST', body });
                } else {
                    await api.post('/admin/servicios', body);
                }
                triggerToast('NUEVO SERVICIO REGISTRADO');
            }
            setShowModal(false); setEditing(null); setLogoFile(null); setLogoPreview(null); load();
        } catch (err) { triggerToast('ERROR AL SINCRONIZAR'); }
    };

    const [confirmDelete, setConfirmDelete] = useState<{ id: string, nombre: string } | null>(null);

    const handleDelete = async () => {
        if (!confirmDelete?.id) {
            triggerToast('ID DE SERVICIO NO VÁLIDO');
            return;
        }
        try {
            await api.delete(`/admin/servicios/${confirmDelete.id}`);
            triggerToast('SERVICIO DESACTIVADO');
            setConfirmDelete(null);
            load();
        } catch { triggerToast('ERROR AL PROCESAR'); }
    };

    const getStatusIndicator = (status: string) => {
        const config: Record<string, { color: string, label: string }> = {
            VERDE: { color: '#10B981', label: 'OPERATIVO' },
            AMARILLO: { color: '#F59E0B', label: 'MENSAJE DE ALERTA' },
            ROJO: { color: '#EF4444', label: 'SERVICIO CAÍDO' }
        };
        const s = config[status] || config.VERDE;
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: s.color,
                    boxShadow: `0 0 10px ${s.color}`,
                    border: '1px solid #000'
                }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: s.color }}>{s.label}</span>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }} className='max-md:pb-20'>
            {/* Toast Ares v2 */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '40px', right: '40px', zIndex: 10000,
                            background: '#000', color: 'white', padding: '1.25rem 2.5rem',
                            borderRadius: '24px', border: '2px solid var(--color-primary)',
                            boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
                            fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
                        }}
                    >
                        <Package size={20} color="var(--color-primary)" />
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }} className='max-sm:flex-col max-sm:items-start max-sm:gap-4'>
                <div>
                    <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#000', padding: '0.8rem', borderRadius: '16px', color: 'var(--color-accent)' }}>
                            <Package size={32} />
                        </div>
                        CATÁLOGO <span className="text-gradient-primary"></span>
                    </h1>
                    <p style={{ fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                        Base de datos global de productos IPTV y Streaming Ares
                    </p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => { setEditing({ nombre: '', logo_url: '', descripcion_base: '', precio_admin: 0, categoria: 'STREAMING', es_iptv_propio: false, estado_actual: 'VERDE', activo: true, app_config_id: '' }); setLogoFile(null); setLogoPreview(null); setUseUrlMode(false); setShowModal(true); }}
                >
                    <Plus size={22} /> AÑADIR PRODUCTO
                </button>
            </div>

            <div className="table-container max-xl:-ml-10 max-xl:w-[105%] max-md:ml-0 max-md:w-[100%] ">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Imagen</th>
                            <th>Propuesto Por</th>
                            <th>Categoría</th>
                            <th>Aplicación</th>
                            <th>Costo Adm.</th>
                            <th>Propio</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '5rem' }}><div className="animate-pulse" style={{ fontWeight: 900 }}>EXTRAYENDO INVENTARIO...</div></td></tr>
                        ) : servicios.map((s, i) => (
                            <motion.tr
                                key={s.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                style={{ opacity: s.activo ? 1 : 0.4 }}
                            >
                                <td>{getStatusIndicator(s.estado_actual)}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '45px', height: '45px', borderRadius: '12px',
                                            background: 'white', border: '2px solid #000',
                                            padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {s.logo_url ? <img src={s.logo_url} alt={s.nombre} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <Package size={20} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{s.nombre}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.descripcion_base}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: s.proveedor_alias === 'SISTEMA' ? 'var(--text-muted)' : 'var(--color-primary)' }}>
                                        {s.proveedor_alias === 'SISTEMA' ? 'PLATAFORMA' : `@${s.proveedor_alias}`}
                                    </div>
                                </td>
                                <td>
                                    <div className="chip chip-blue" style={{ fontSize: '0.7rem' }}>{s.categoria}</div>
                                </td>
                                <td>
                                    {s.app_config ? <div className="chip chip-gold" style={{ fontSize: '0.7rem' }}>{s.app_config.nombre}</div> : <span style={{ opacity: 0.3, fontWeight: 800, fontSize: '0.7rem' }}>GLOBAL</span>}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 900, color: 'var(--color-primary)', fontSize: '1.2rem' }}>{s.precio_admin} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Bs</span> <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>| ${(s.precio_admin / tasaCambio).toFixed(2)}</span></div>
                                </td>
                                <td>
                                    {s.es_iptv_propio ? <div className="chip chip-gold" style={{ fontSize: '0.7rem' }}>SISTEMA PROPIO</div> : <span style={{ opacity: 0.3, fontWeight: 800, fontSize: '0.7rem' }}>EXTERNO</span>}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-secondary" style={{ padding: '0.5rem', background: 'var(--surface-raised)', boxShadow: 'none' }} onClick={() => { setEditing(s); setShowModal(true); }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-secondary" style={{ padding: '0.5rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)', boxShadow: 'none' }} onClick={() => setConfirmDelete({ id: s.id, nombre: s.nombre })}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Rediseñado */}
            <AnimatePresence>
                {showModal && editing && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { setShowModal(false); setEditing(null); }}
                            style={{ position: 'absolute', inset: 0, zIndex: 0 }}
                        />
                        <motion.div
                            className="modal-container"
                            initial={{ scale: 0.8, opacity: 0, scaleZ: 0.5 }}
                            animate={{ scale: 1, opacity: 1, scaleZ: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            style={{ padding: '3rem', zIndex: 1, maxWidth: '700px', borderWidth: '3px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '2rem' }}>{editing.id ? 'EDITAR' : 'REGISTRAR'} <span className="text-gradient-primary">SERVICIO</span></h2>
                                <button onClick={() => { setShowModal(false); setEditing(null); }} className="btn-ghost" style={{ padding: '0.5rem' }}>
                                    <X size={32} color="#000" />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label className="input-label">Nombre del Producto</label>
                                        <input className="input" value={editing.nombre || ''} onChange={e => setEditing({ ...editing, nombre: e.target.value })} placeholder="Ej: Netflix Ultra" />
                                    </div>
                                    <div>
                                        <label className="input-label">Categoría </label>
                                        <select className="input" value={editing.categoria || ''} onChange={e => setEditing({ ...editing, categoria: e.target.value })}>
                                            {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                                            <option value="OTRO">OTRO (LEGACY)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Descripción Técnica / Beneficios</label>
                                    <input className="input" value={editing.descripcion_base || ''} onChange={e => setEditing({ ...editing, descripcion_base: e.target.value })} placeholder="4 Pantallas UHD + Audio Atmos..." />
                                </div>
                                <div>
                                    <label className="input-label">Aplicación</label>
                                    <select className="input" value={editing.app_config_id || ''} onChange={e => setEditing({ ...editing, app_config_id: e.target.value })}>
                                        <option value="">SIN APLICACIÓN</option>
                                        {apps.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label className="input-label">Precio por Cuenta (Bs)</label>
                                        <input className="input" type="number" value={editing.precio_admin || 0} onChange={e => setEditing({ ...editing, precio_admin: parseFloat(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="input-label">Estado de Estación</label>
                                        <select className="input" value={editing.estado_actual || 'VERDE'} onChange={e => setEditing({ ...editing, estado_actual: e.target.value })}>
                                            <option value="VERDE">🟢 ESTABLE / VERDE</option>
                                            <option value="AMARILLO">🟡 INTERMITENTE (ALERTA)</option>
                                            <option value="ROJO">🔴 CAÍDO (BLOQUEO)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="card" style={{ padding: '1.5rem', background: 'var(--surface-raised)', borderWidth: '2px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>SISTEMA PROPIO DE ARES</span>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700 }}>Marcar si el servicio es gestionado directamente por el dueño.</span>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" checked={editing.es_iptv_propio || false} onChange={e => setEditing({ ...editing, es_iptv_propio: e.target.checked })} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>

                                    {/* Logo: Subir archivo o pegar URL */}
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <label className="input-label" style={{ margin: 0 }}>Logo del Servicio</label>
                                            <button
                                                type="button"
                                                className="btn-ghost"
                                                style={{ fontSize: '0.7rem', padding: '0.25rem 0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                onClick={() => setUseUrlMode(!useUrlMode)}
                                            >
                                                {useUrlMode ? <><Upload size={12} /> SUBIR ARCHIVO</> : <><Link size={12} /> PEGAR URL</>}
                                            </button>
                                        </div>

                                        {useUrlMode ? (
                                            <input
                                                className="input"
                                                value={editing.logo_url || ''}
                                                onChange={e => setEditing({ ...editing, logo_url: e.target.value })}
                                                placeholder="https://ejemplo.com/logo.png"
                                            />
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                style={{
                                                    border: '2px dashed var(--border-color)',
                                                    borderRadius: '16px',
                                                    padding: '1.5rem',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    background: 'var(--bg-base)',
                                                    transition: 'border-color 0.2s',
                                                }}
                                                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                                onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                                                onDrop={e => {
                                                    e.preventDefault();
                                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                                    const file = e.dataTransfer.files[0];
                                                    if (file && file.type.startsWith('image/')) {
                                                        setLogoFile(file);
                                                        setLogoPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setLogoFile(file);
                                                            setLogoPreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                />
                                                {logoPreview || editing.logo_url ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                                        <img
                                                            src={logoPreview || editing.logo_url}
                                                            alt="Preview"
                                                            style={{ maxWidth: '120px', maxHeight: '80px', objectFit: 'contain', borderRadius: '8px' }}
                                                        />
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                            {logoFile ? logoFile.name : 'Click para cambiar'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Upload size={28} color="var(--text-muted)" />
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>Arrastra o haz click para subir</span>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.5 }}>PNG, JPG, SVG, WEBP</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button className="btn-primary" onClick={handleSave} style={{ width: '100%', padding: '1.5rem', marginTop: '1rem', fontSize: '1.1rem' }}>
                                    <Zap size={20} /> SINCRONIZAR CON EL CATÁLOGO
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Confirmación de Eliminación Ares v2 */}
            <AnimatePresence>
                {confirmDelete && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="modal-container"
                            style={{ padding: '3rem', maxWidth: '450px', border: '3px solid var(--color-danger)', textAlign: 'center' }}
                        >
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={40} color="var(--color-danger)" />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>¿ESTÁS SEGURO?</h2>
                            <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                                Vas a desactivar <span style={{ color: 'var(--color-danger)' }}>{confirmDelete.nombre}</span>. Los vendedores dejarán de verlo en su catálogo.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-secondary" style={{ flex: 1, border: 'none' }} onClick={() => setConfirmDelete(null)}>CANCELAR</button>
                                <button className="btn-primary" style={{ flex: 1, background: 'var(--color-danger)', color: 'white' }} onClick={handleDelete}>DESACTIVAR</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
