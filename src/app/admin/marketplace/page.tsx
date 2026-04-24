/**
 * Gestión del Marketplace — Ares Redesign v2.5 (Premium Hybrid Media)
 */

'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ShoppingBag, Plus, Trash2, Edit2, Loader2, Search, X, CheckCircle2, ShieldAlert, Upload, Link, ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketService {
    id: string;
    nombre: string;
    descripcion_base: string;
    precio_sugerido: number;
    categoria: string;
    logo_url: string;
    activo: boolean;
}

export default function MarketplaceAdminPage() {
    const [services, setServices] = useState<MarketService[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [errorToast, setErrorToast] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: 'STREAMING',
        logo_url: '',
        logo_archivo: null as File | null,
        activo: true
    });

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/servicios');
            setServices(data);
        } catch (error) {
            console.error('Error fetching market services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorToast(null);
        try {
            const data = new FormData();
            data.append('nombre', formData.nombre);
            data.append('descripcion', formData.descripcion);
            data.append('precio', formData.precio);
            data.append('categoria', formData.categoria);
            data.append('activo', formData.activo.toString());
            data.append('logo_url', formData.logo_url || '');

            if (formData.logo_archivo) {
                data.append('logo', formData.logo_archivo);
            }

            const token = localStorage.getItem('ares_token');
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/servicios`;

            const response = await fetch(editingId ? `${apiUrl}/${editingId}` : apiUrl, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Error al procesar servicio');
            }

            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            await fetchServices();
            closeModal();
        } catch (err: any) {
            setErrorToast(err.message || 'Error en la conexión con la red');
        } finally {
            setSaving(false);
        }
    };

    const openModal = (service?: MarketService) => {
        if (service) {
            setEditingId(service.id);
            setFormData({
                nombre: service.nombre,
                descripcion: service.descripcion_base,
                precio: service.precio_sugerido.toString(),
                categoria: service.categoria,
                logo_url: service.logo_url,
                logo_archivo: null,
                activo: service.activo
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: '',
                descripcion: '',
                precio: '',
                categoria: 'STREAMING',
                logo_url: '',
                logo_archivo: null,
                activo: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setErrorToast(null);
    };

    const [serviceToDelete, setServiceToDelete] = useState<MarketService | null>(null);

    const handleDelete = async () => {
        if (!serviceToDelete) return;
        try {
            await api.delete(`/admin/servicios/${serviceToDelete.id}`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setServiceToDelete(null);
            fetchServices();
        } catch {
            alert('Error al eliminar servicio');
        }
    };

    const filtered = services.filter(s =>
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <AnimatePresence>
                {showToast && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '40px', right: '40px', zIndex: 10000,
                            background: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '1.25rem 2.5rem',
                            borderRadius: '24px', border: '3px solid var(--color-primary)', boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
                            fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
                        }}
                    >
                        <CheckCircle2 size={24} color="var(--color-primary)" /> ACTUALIZACIÓN EXITOSA
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        CATÁLOGO DE <span className="text-gradient-primary">SOLUCIONES</span>
                        <button 
                            onClick={fetchServices} 
                            className="btn-secondary" 
                            style={{ padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Refrescar Servicios"
                        >
                            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </h1>
                    <p style={{ fontWeight: 800, opacity: 0.5, color: 'var(--text-muted)' }}>MERCADO GLOBAL DE SERVICIOS DIGITALES</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary" style={{ padding: '1.25rem 2.5rem' }}>
                    <Plus size={22} /> NUEVO SERVICIO
                </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '3rem' }}>
                <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" placeholder="Filtrar por nombre, categoría o descripción..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '4rem', height: '64px' }} />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--color-primary)" /></div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Servicio / Categoría</th>
                                <th>Descripción</th>
                                <th>Inversión</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'center' }}>Gestión</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {filtered.map((s, i) => (
                                    <motion.tr key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'white', padding: '0.4rem', border: '3px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {s.logo_url ? <img src={s.logo_url} alt={s.nombre} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <ShoppingBag size={24} color="#000" style={{ opacity: 0.2 }} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-primary)' }}>{s.nombre}</div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '1px' }}>{s.categoria.toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '300px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.descripcion_base}</td>
                                        <td>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>Bs {s.precio_sugerido}</div>
                                        </td>
                                        <td>
                                            <div className={`chip ${s.activo ? 'chip-active' : 'chip-danger'}`}>
                                                {s.activo ? 'DISPONIBLE' : 'INACTIVO'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                                <button onClick={() => openModal(s)} className="btn-secondary" style={{ padding: '0.5rem', border: 'none', background: 'transparent', boxShadow: 'none' }}>
                                                    <Edit2 size={20} color="var(--color-primary)" />
                                                </button>
                                                <button onClick={() => setServiceToDelete(s)} className="btn-secondary" style={{ padding: '0.5rem', color: 'var(--color-danger)', border: 'none', background: 'transparent', boxShadow: 'none' }}>
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Acción */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-container" style={{ maxWidth: '700px', width: '90%', padding: '3.5rem', border: '4px solid #000', borderRadius: '32px', background: 'var(--surface-overlay)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{editingId ? 'REFORJAR' : 'NUEVO'} <br /><span className="text-gradient-primary">SERVICIO</span></h2>
                                <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}><X size={40} /></button>
                            </div>

                            {errorToast && (
                                <div style={{ background: '#EF4444', color: 'white', padding: '1.25rem', borderRadius: '16px', marginBottom: '2rem', fontWeight: 900, border: '3px solid #000', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <ShieldAlert size={24} /> {errorToast.toUpperCase()}
                                </div>
                            )}

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 180px', gap: '1.5rem' }}>
                                    <div>
                                        <label className="input-label">Nombre del Servicio</label>
                                        <input className="input" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} required placeholder="Ej: Disney+ Premium" />
                                    </div>
                                    <div>
                                        <label className="input-label">Inversión (Bs)</label>
                                        <input className="input" type="number" value={formData.precio} onChange={e => setFormData({ ...formData, precio: e.target.value })} required placeholder="0.00" />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label className="input-label">Categoría</label>
                                            <select className="input" value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })}>
                                                <option value="STREAMING">STREAMING</option>
                                                <option value="APPS">APLICACIONES</option>
                                                <option value="GAMES">JUEGOS</option>
                                                <option value="OTHER">OTROS</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="input-label">URL del Logo</label>
                                            <div style={{ position: 'relative' }}>
                                                <Link size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                                <input className="input" placeholder="https://..." value={formData.logo_url} onChange={e => setFormData({ ...formData, logo_url: e.target.value })} style={{ paddingLeft: '3rem' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="upload-zone">
                                        <input type="file" accept="image/*" onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) setFormData({ ...formData, logo_archivo: file });
                                        }} />
                                        {formData.logo_archivo ? (
                                            <div style={{ color: 'var(--color-primary)', fontWeight: 900, fontSize: '0.8rem', zIndex: 1 }}>
                                                <ImageIcon size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.8 }} />
                                                <p>{formData.logo_archivo.name.toUpperCase()}</p>
                                                <p style={{ fontSize: '0.6rem', opacity: 0.5 }}>CARGA LISTA</p>
                                            </div>
                                        ) : formData.logo_url ? (
                                            <div style={{ textAlign: 'center', zIndex: 1 }}>
                                                <img src={formData.logo_url} style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '0 auto 0.5rem' }} />
                                                <p style={{ fontWeight: 900, fontSize: '0.7rem' }}>MODIFICAR ARCHIVO</p>
                                            </div>
                                        ) : (
                                            <div style={{ opacity: 0.4, zIndex: 1 }}>
                                                <Upload size={40} style={{ margin: '0 auto 0.5rem' }} />
                                                <p style={{ fontWeight: 900, fontSize: '0.8rem' }}>SUBIR LOCAL</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Descripción Técnica</label>
                                    <textarea className="input" rows={3} value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} style={{ padding: '1.25rem' }} placeholder="Detalles del plan, duración, etc..." />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-raised)', padding: '1.25rem', borderRadius: '18px', border: '2.5px solid #000' }}>
                                    <span style={{ fontWeight: 900 }}>ESTADO DEL SERVICIO</span>
                                    <label className="switch">
                                        <input type="checkbox" checked={formData.activo} onChange={e => setFormData({ ...formData, activo: e.target.checked })} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <button type="submit" disabled={saving} className="btn-primary" style={{ height: '70px', fontSize: '1.2rem' }}>
                                    {saving ? 'PROCESANDO PROTOCOLO...' : (editingId ? 'ACTUALIZAR SERVICIO' : 'FORJAR NUEVO SERVICIO')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Eliminación */}
            <AnimatePresence>
                {serviceToDelete && (
                    <div className="modal-overlay">
                        <div className="modal-container" style={{ maxWidth: '400px', textAlign: 'center', padding: '3.5rem', border: '5px solid var(--color-danger)', borderRadius: '32px' }}>
                            <Trash2 size={56} color="var(--color-danger)" style={{ margin: '0 auto 2rem' }} />
                            <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '1rem' }}>¿DESMANTELAR?</h2>
                            <p style={{ fontWeight: 700, opacity: 0.6, marginBottom: '2.5rem' }}>Esta acción eliminará {serviceToDelete.nombre} de la matriz del marketplace.</p>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <button className="btn-secondary" style={{ flex: 1, border: 'none' }} onClick={() => setServiceToDelete(null)}>CANCELAR</button>
                                <button className="btn-primary" style={{ flex: 1, background: 'var(--color-danger)' }} onClick={handleDelete}>BORRAR</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
