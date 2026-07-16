'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Edit2, Trash2, X, Loader2, Smartphone, Palette, ToggleLeft, ToggleRight, Users, Check, Home, MessageSquare, Image as ImageIcon, Trophy, Clapperboard, Megaphone, ShoppingBag, History, CreditCard, Calculator, User, Store } from 'lucide-react';
import api from '@/lib/api';
import Combobox from '@/components/Combobox';

// ─── Tipos ──────────────────────────────────

interface Plataforma {
    id: string; nombre: string; color: string; emoji?: string; activo: boolean;
}
interface Categoria {
    id: string; nombre: string; tipo: string; activo: boolean;
}

interface AppConfig {
    id: string;
    nombre: string;
    descripcion?: string;
    modulos_activos: string;   // JSON string "["home","flyers",...]"
    colores: string;            // JSON string {"--color-primary":"#bb4812",...}
    activo: boolean;
    creado_en: string;
    vendors_count: number;
}

// ─── Módulos del panel vendor ───────────────
const VENDOR_MODULES = [
    { key: 'home',        label: 'Inicio',       icon: Home },
    { key: 'mensajes',    label: 'Mensajes',      icon: MessageSquare },
    { key: 'flyers',      label: 'Flyers',        icon: ImageIcon },
    { key: 'partidos',    label: 'Partidos',      icon: Trophy },
    { key: 'estrenos',    label: 'Estrenos',      icon: Clapperboard },
    { key: 'promociones', label: 'Promos',        icon: Megaphone },
    { key: 'catalogo',    label: 'Catálogo',      icon: ShoppingBag },
    { key: 'imagenes',    label: 'Servicios',     icon: Layers },
    { key: 'historial',   label: 'Historial',     icon: History },
    { key: 'plan',        label: 'Mi Plan',       icon: CreditCard },
    { key: 'calculadora', label: 'Calculadora',   icon: Calculator },
    { key: 'perfil',      label: 'Perfil',        icon: User },
    { key: 'marketplace', label: 'Marketplace',   icon: Store },
];

// ─── Colores del tema ────────────────────────
const THEME_COLORS = [
    { key: '--surface-base',     label: 'Fondo Base',        hint: 'Color de fondo principal' },
    { key: '--surface-card',     label: 'Fondo Card',        hint: 'Fondo de tarjetas y módulos' },
    { key: '--surface-raised',   label: 'Superficie',        hint: 'Elementos elevados' },
    { key: '--surface-overlay',  label: 'Superficie Overlay',hint: 'Modales y superposiciones' },
    { key: '--text-inverse',     label: 'Texto Inverso',     hint: 'Texto sobre botones primarios' },
    { key: '--text-primary',     label: 'Texto Primario',    hint: 'Textos principales' },
    { key: '--text-muted',       label: 'Texto Muted',       hint: 'Textos secundarios y opacos' },
    { key: '--color-primary',    label: 'Color Primario',    hint: 'Botones, acentos principales' },
    { key: '--color-secondary',  label: 'Color Secundario',  hint: 'Acentos secundarios' },
    { key: '--color-accent',     label: 'Color Acento',      hint: 'Chips, detalles' },
    { key: '--color-danger',     label: 'Color Peligro',     hint: 'Alertas, acciones destructivas' },
    { key: '--color-border',     label: 'Color Bordes',      hint: 'Bordes gruesos de tarjetas' },
    { key: '--shadow-color-heavy',label: 'Color Sombra',     hint: 'Sombra dura principal' },
    { key: '--shadow-color-glow',label: 'Color Resplandor',  hint: 'Sombra suave/neon' },
    { key: '--ambient-1',        label: 'Blob Decorativo 1', hint: 'Orbe superior' },
    { key: '--ambient-2',        label: 'Blob Decorativo 2', hint: 'Orbe inferior' },
    { key: '--sidebar-bg',       label: 'Fondo Sidebar',     hint: 'Fondo del menú lateral' },
];

// Colores por defecto (tema naranja)
const DEFAULT_COLORS: Record<string, string> = {
    '--surface-base':    '#0B0B0B',
    '--surface-card':    'rgba(30, 30, 30, 0.6)',
    '--surface-raised':  '#1A1A1A',
    '--surface-overlay': 'rgba(20, 20, 20, 0.9)',
    '--text-inverse':    '#ffffff',
    '--text-primary':    '#FFFFFF',
    '--text-muted':      '#A1A1AA',
    '--color-primary':   '#bb4812',
    '--color-secondary': '#e7dcdc',
    '--color-accent':    '#ceceec',
    '--color-danger':    '#f75617',
    '--color-border':    '#bb4812',
    '--shadow-color-heavy':'rgba(245, 105, 24, 0.89)',
    '--shadow-color-glow': 'rgba(175, 65, 22, 0.74)',
    '--ambient-1':       'rgba(201, 132, 53, 0.438)',
    '--ambient-2':       'rgba(201, 94, 33, 0.555)',
    '--sidebar-bg':      '#1A1A1A',
};

// ─── Utilidades de Color ───────────────────────
const parseColor = (val: string) => {
    if (!val) return { hex: '#000000', opacity: 100 };
    if (val.startsWith('#')) {
        const hex = val.substring(0, 7);
        const alpha = val.length === 9 ? parseInt(val.substring(7, 9), 16) / 255 : 1;
        return { hex, opacity: Math.round(alpha * 100) };
    }
    if (val.startsWith('rgb')) {
        const parts = val.match(/[\d.]+/g);
        if (parts && parts.length >= 3) {
            const r = parseInt(parts[0]).toString(16).padStart(2, '0');
            const g = parseInt(parts[1]).toString(16).padStart(2, '0');
            const b = parseInt(parts[2]).toString(16).padStart(2, '0');
            const a = parts[3] ? parseFloat(parts[3]) : 1;
            return { hex: `#${r}${g}${b}`, opacity: Math.round(a * 100) };
        }
    }
    return { hex: '#000000', opacity: 100 };
};

const buildColor = (hex: string, opacity: number) => {
    if (opacity === 100) return hex;
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

// ─── Componente Principal ────────────────────
type TabType = 'PLATAFORMAS' | 'CATEGORIAS' | 'APLICACIONES';

export default function AdministrarPage() {
    const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [appConfigs, setAppConfigs] = useState<AppConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('APLICACIONES');

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [toastType, setToastType] = useState<'ok' | 'err'>('ok');

    // Estado del formulario de AppConfig
    const [appForm, setAppForm] = useState<{
        nombre: string;
        descripcion: string;
        modulos: string[];
        colores: Record<string, string>;
    }>({
        nombre: '',
        descripcion: '',
        modulos: VENDOR_MODULES.map(m => m.key),
        colores: { ...DEFAULT_COLORS },
    });

    // ─── Carga ────────────────────────────────
    const loadData = async () => {
        setLoading(true);
        try {
            const [p, c, a] = await Promise.all([
                api.get('/admin/plataformas'),
                api.get('/admin/categorias'),
                api.get('/admin/app-configs'),
            ]);
            setPlataformas(p);
            setCategorias(c);
            setAppConfigs(a);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // ─── Toast ────────────────────────────────
    const triggerToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast(msg); setToastType(type);
        setTimeout(() => setToast(''), 3000);
    };

    // ─── Handlers Plataformas/Categorías ─────
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const endpoint = activeTab === 'PLATAFORMAS' ? '/admin/plataformas' : '/admin/categorias';
            if (editing.id) {
                await api.put(`${endpoint}/${editing.id}`, editing);
            } else {
                await api.post(endpoint, editing);
            }
            triggerToast('SINCRO EXITOSA');
            setShowModal(false);
            setEditing(null);
            loadData();
        } catch {
            triggerToast('ERROR AL GUARDAR', 'err');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, tab: 'PLATAFORMAS' | 'CATEGORIAS') => {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return;
        try {
            const endpoint = tab === 'PLATAFORMAS' ? '/admin/plataformas' : '/admin/categorias';
            await api.delete(`${endpoint}/${id}`);
            triggerToast('ELIMINADO CORRECTAMENTE');
            if (tab === 'PLATAFORMAS') {
                setPlataformas(prev => prev.filter(p => p.id !== id));
            } else {
                setCategorias(prev => prev.filter(c => c.id !== id));
            }
        } catch (err) {
            triggerToast('ERROR AL ELIMINAR', 'err');
            console.error(err);
        }
    };

    // ─── Handlers AppConfig ───────────────────
    const openCreateApp = () => {
        setAppForm({
            nombre: '',
            descripcion: '',
            modulos: VENDOR_MODULES.map(m => m.key),
            colores: { ...DEFAULT_COLORS },
        });
        setEditing(null);
        setShowModal(true);
    };

    const openEditApp = (app: AppConfig) => {
        let parsedModulos: string[] = [];
        let parsedColores: Record<string, string> = { ...DEFAULT_COLORS };
        try { parsedModulos = JSON.parse(app.modulos_activos); } catch { parsedModulos = VENDOR_MODULES.map(m => m.key); }
        try { parsedColores = { ...DEFAULT_COLORS, ...JSON.parse(app.colores) }; } catch { /* default */ }
        setAppForm({ nombre: app.nombre, descripcion: app.descripcion || '', modulos: parsedModulos, colores: parsedColores });
        setEditing(app);
        setShowModal(true);
    };

    const handleSaveApp = async () => {
        if (!appForm.nombre.trim()) { triggerToast('EL NOMBRE ES REQUERIDO', 'err'); return; }
        setSaving(true);
        try {
            const payload = {
                nombre: appForm.nombre,
                descripcion: appForm.descripcion,
                modulos_activos: JSON.stringify(appForm.modulos),
                colores: JSON.stringify(appForm.colores),
            };
            if (editing?.id) {
                await api.put(`/admin/app-configs/${editing.id}`, payload);
            } else {
                await api.post('/admin/app-configs', payload);
            }
            triggerToast(editing?.id ? 'APLICACIÓN ACTUALIZADA' : 'APLICACIÓN CREADA');
            setShowModal(false);
            loadData();
        } catch (err: any) {
            triggerToast(err?.data?.error || 'ERROR AL GUARDAR', 'err');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteApp = async (id: string, vendors_count: number) => {
        if (vendors_count > 0) {
            if (!confirm(`HAY ${vendors_count} VENDEDOR(ES) ASIGNADOS a esta aplicación.\n\nSi la eliminas, todos ellos quedarán sin restricciones y tendrán acceso a todos los módulos.\n\n¿Estás seguro de eliminarla?`)) return;
        } else {
            if (!confirm('¿Eliminar esta aplicación?')) return;
        }
        
        try {
            await api.delete(`/admin/app-configs/${id}`);
            triggerToast('APLICACIÓN ELIMINADA');
            setAppConfigs(prev => prev.filter(app => app.id !== id));
        } catch (err: any) {
            triggerToast(err?.data?.error || 'ERROR AL ELIMINAR', 'err');
        }
    };

    const toggleModulo = (key: string) => {
        setAppForm(f => ({
            ...f,
            modulos: f.modulos.includes(key)
                ? f.modulos.filter(m => m !== key)
                : [...f.modulos, key]
        }));
    };

    // ─── Render ───────────────────────────────
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }} className='max-sm:flex-col max-sm:items-start max-sm:gap-4'>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#000', padding: '0.8rem', borderRadius: '20px', color: 'var(--color-primary)' }}>
                            <Layers size={32} />
                        </div>
                        <div>ADMINISTRAR <span className="text-gradient-primary">INSTANCIAS</span></div>
                    </h1>
                    <p style={{ fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-muted)' }}>Plataformas, categorías y aplicaciones de vendors</p>
                </div>
                <button className="btn-primary" onClick={() => {
                    if (activeTab === 'APLICACIONES') { openCreateApp(); return; }
                    setEditing(activeTab === 'PLATAFORMAS' ? { nombre: '', color: '#6B7280', emoji: '🎬' } : { nombre: '', tipo: 'SERVICIO' });
                    setShowModal(true);
                }}>
                    <Plus size={20} /> AÑADIR {activeTab === 'PLATAFORMAS' ? 'PLATAFORMA' : activeTab === 'CATEGORIAS' ? 'CATEGORÍA' : 'APLICACIÓN'}
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {(['PLATAFORMAS', 'CATEGORIAS', 'APLICACIONES'] as TabType[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={activeTab === tab ? 'btn-primary' : 'btn-secondary'}
                        style={{ flex: 1, padding: '1rem', minWidth: '140px' }}
                    >
                        {tab === 'APLICACIONES' && <Smartphone size={16} />}
                        {tab === 'PLATAFORMAS' ? 'PLATAFORMAS' : tab === 'CATEGORIAS' ? 'CATEGORÍAS' : 'APLICACIONES'}
                    </button>
                ))}
            </div>

            {/* ─── Tabla ─────────────────────────────── */}
            <div className="table-container max-xl:w-[115%] max-xl:-ml-15 max-md:w-[100%] max-md:ml-0">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={40} style={{ margin: '0 auto' }} /></div>
                ) : (
                    <table className="table">
                        <thead>
                            {activeTab === 'PLATAFORMAS' && <tr><th>Emoji</th><th>Nombre</th><th>Color Ref.</th><th>Acciones</th></tr>}
                            {activeTab === 'CATEGORIAS' && <tr><th>Nombre</th><th>Tipo</th><th>Acciones</th></tr>}
                            {activeTab === 'APLICACIONES' && <tr><th>Aplicación</th><th>Módulos</th><th>Colores</th><th>Vendors</th><th>Acciones</th></tr>}
                        </thead>
                        <tbody>
                            {activeTab === 'PLATAFORMAS' && plataformas.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontSize: '1.5rem' }}>{p.emoji}</td>
                                    <td style={{ fontWeight: 900 }}>{p.nombre}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '20px', height: '20px', background: p.color, borderRadius: '4px', border: '1px solid #000' }} />
                                            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{p.color}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-secondary" style={{ padding: '0.5rem' }} onClick={() => { setEditing(p); setShowModal(true); }}><Edit2 size={16} /></button>
                                            <button className="btn-ghost" style={{ padding: '0.5rem', color: 'red' }} onClick={() => handleDelete(p.id, 'PLATAFORMAS')}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'CATEGORIAS' && categorias.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 900 }}>{c.nombre}</td>
                                    <td><div className="chip chip-blue">{c.tipo}</div></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-secondary" style={{ padding: '0.5rem' }} onClick={() => { setEditing(c); setShowModal(true); }}><Edit2 size={16} /></button>
                                            <button className="btn-ghost" style={{ padding: '0.5rem', color: 'red' }} onClick={() => handleDelete(c.id, 'CATEGORIAS')}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'APLICACIONES' && (
                                appConfigs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', opacity: 0.4 }}>
                                            <Smartphone size={40} style={{ margin: '0 auto 1rem' }} />
                                            <p style={{ fontWeight: 800 }}>No hay aplicaciones creadas</p>
                                            <p style={{ fontSize: '0.8rem' }}>Crea la primera para asignarla a vendors</p>
                                        </td>
                                    </tr>
                                ) : appConfigs.map(app => {
                                    let colores: Record<string, string> = {};
                                    let modulos: string[] = [];
                                    try { colores = JSON.parse(app.colores); } catch { /* */ }
                                    try { modulos = JSON.parse(app.modulos_activos); } catch { /* */ }
                                    return (
                                        <tr key={app.id}>
                                            <td>
                                                <div style={{ fontWeight: 900, fontSize: '1rem' }}>{app.nombre}</div>
                                                {app.descripcion && <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '2px' }}>{app.descripcion}</div>}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)' }}>{modulos.length}</span>
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>/ {VENDOR_MODULES.length} activos</span>
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
                                                    {VENDOR_MODULES.map(m => (
                                                        <span key={m.key} title={m.label} style={{
                                                            fontSize: '0.8rem',
                                                            opacity: modulos.includes(m.key) ? 1 : 0.2,
                                                            filter: modulos.includes(m.key) ? 'none' : 'grayscale(1)',
                                                        }}><m.icon size={16} /></span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    {THEME_COLORS.slice(0, 6).map(c => (
                                                        <div key={c.key} title={c.label} style={{
                                                            width: '18px', height: '18px',
                                                            background: colores[c.key] || '#555',
                                                            borderRadius: '4px',
                                                            border: '2px solid #000',
                                                        }} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Users size={14} style={{ opacity: 0.5 }} />
                                                    <span style={{ fontWeight: 800 }}>{app.vendors_count}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn-secondary" style={{ padding: '0.5rem' }} onClick={() => openEditApp(app)}><Edit2 size={16} /></button>
                                                    <button className="btn-ghost" style={{ padding: '0.5rem', color: 'red' }} onClick={() => handleDeleteApp(app.id, app.vendors_count)}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ─── Modal Plataformas/Categorías ─────── */}
            <AnimatePresence>
                {showModal && activeTab !== 'APLICACIONES' && editing && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-container" style={{ maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontWeight: 900 }}>{editing.id ? 'EDITAR' : 'CREAR'} {activeTab}</h2>
                                <button onClick={() => setShowModal(false)} className="btn-ghost"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="input-label">Nombre</label>
                                    <input className="input" required value={editing.nombre} onChange={e => setEditing({ ...editing, nombre: e.target.value.toUpperCase() })} />
                                </div>
                                {activeTab === 'PLATAFORMAS' ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label className="input-label">Color CSS</label>
                                            <input className="input" type="color" value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} style={{ height: '50px' }} />
                                        </div>
                                        <div>
                                            <label className="input-label">Emoji / Icono</label>
                                            <input className="input" value={editing.emoji} onChange={e => setEditing({ ...editing, emoji: e.target.value })} />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Combobox
                                            label="Tipo de Categoría"
                                            placeholder="Seleccionar tipo..."
                                            options={[
                                                { id: 'SERVICIO', nombre: 'PARA SERVICIOS' },
                                                { id: 'IMAGEN', nombre: 'PARA BANCO DE IMÁGENES' },
                                                { id: 'OTRO', nombre: 'OTRO' }
                                            ]}
                                            value={editing.tipo || ''}
                                            onChange={(val: any) => setEditing({ ...editing, tipo: val })}
                                        />
                                    </div>
                                )}
                                <button type="submit" disabled={saving} className="btn-primary" style={{ width: '100%', padding: '1.25rem' }}>
                                    {saving ? <Loader2 className="animate-spin" size={24} /> : 'GUARDAR CAMBIOS'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ─── Modal AppConfig ──────────────────── */}
            <AnimatePresence>
                {showModal && activeTab === 'APLICACIONES' && (
                    <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '2rem', overflowY: 'auto' }}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="modal-container"
                            style={{ maxWidth: '720px', width: '95%', marginBottom: '2rem' }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: 'var(--color-primary)', padding: '0.7rem', borderRadius: '14px', color: 'white' }}>
                                        <Smartphone size={24} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontWeight: 900, fontSize: '1.6rem', lineHeight: 1 }}>
                                            {editing?.id ? 'EDITAR' : 'CREAR'} APLICACIÓN
                                        </h2>
                                        <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '2px' }}>
                                            Define módulos y colores para asignar a vendors
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="btn-ghost"><X size={28} /></button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                {/* Nombre y descripción */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="input-label">Nombre de la aplicación *</label>
                                        <input
                                            className="input"
                                            placeholder="Ej: STREAMING PLUS"
                                            value={appForm.nombre}
                                            onChange={e => setAppForm(f => ({ ...f, nombre: e.target.value.toUpperCase() }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Descripción (opcional)</label>
                                        <input
                                            className="input"
                                            placeholder="Ej: Para vendedores de streaming"
                                            value={appForm.descripcion}
                                            onChange={e => setAppForm(f => ({ ...f, descripcion: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Módulos */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <div style={{ background: '#000', padding: '0.5rem', borderRadius: '10px', color: 'var(--color-primary)' }}>
                                            <ToggleRight size={18} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>MÓDULOS ACTIVOS</p>
                                            <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                                                {appForm.modulos.length} / {VENDOR_MODULES.length} habilitados — los desactivados no serán accesibles
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAppForm(f => ({ ...f, modulos: f.modulos.length === VENDOR_MODULES.length ? [] : VENDOR_MODULES.map(m => m.key) }))}
                                            style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 800, opacity: 0.6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                                        >
                                            {appForm.modulos.length === VENDOR_MODULES.length ? 'QUITAR TODOS' : 'SELECCIONAR TODOS'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
                                        {VENDOR_MODULES.map(mod => {
                                            const active = appForm.modulos.includes(mod.key);
                                            return (
                                                <button
                                                    key={mod.key}
                                                    type="button"
                                                    onClick={() => toggleModulo(mod.key)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '0.75rem 1rem',
                                                        borderRadius: '14px',
                                                        background: active ? 'rgba(187,72,18,0.15)' : 'var(--surface-raised)',
                                                        border: `2px solid ${active ? 'var(--color-primary)' : '#000'}`,
                                                        cursor: 'pointer',
                                                        transition: '0.2s',
                                                        boxShadow: active ? '3px 3px 0px 0px var(--color-primary)' : '3px 3px 0px 0px #000',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: active ? 'var(--color-primary)' : 'var(--text-muted)' }}>{mod.label}</span>
                                                    {active && <Check size={12} style={{ marginLeft: 'auto', color: 'var(--color-primary)' }} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Colores del tema */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <div style={{ background: '#000', padding: '0.5rem', borderRadius: '10px', color: 'var(--color-primary)' }}>
                                            <Palette size={18} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>TEMA DE COLORES</p>
                                            <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>Se aplican como variables CSS en el panel del vendor</p>
                                        </div>
                                        {/* Preview de paleta */}
                                        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                                            {['--color-primary', '--color-accent', '--color-secondary', '--ambient-1', '--surface-base'].map(k => (
                                                <div key={k} style={{
                                                    width: '20px', height: '20px',
                                                    background: appForm.colores[k] || '#555',
                                                    borderRadius: '50%', border: '2px solid #000'
                                                }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                                        {THEME_COLORS.map(tc => {
                                            const { hex, opacity } = parseColor(appForm.colores[tc.key] || '');
                                            return (
                                                <div key={tc.key} style={{
                                                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                                                    padding: '0.75rem 1rem',
                                                    background: 'var(--surface-raised)',
                                                    border: '2px solid #000',
                                                    borderRadius: '14px',
                                                    boxShadow: '3px 3px 0px 0px #000',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{
                                                            width: '24px', height: '24px', borderRadius: '6px', border: '2px solid #000',
                                                            background: appForm.colores[tc.key] || '#000000'
                                                        }} />
                                                        <div>
                                                            <p style={{ fontSize: '0.75rem', fontWeight: 900 }}>{tc.label}</p>
                                                            <p style={{ fontSize: '0.6rem', opacity: 0.5 }}>{tc.hint}</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <input
                                                            type="color"
                                                            value={hex}
                                                            onChange={e => {
                                                                const newCol = buildColor(e.target.value, opacity);
                                                                setAppForm(f => ({ ...f, colores: { ...f.colores, [tc.key]: newCol } }));
                                                            }}
                                                            style={{ width: '40px', height: '30px', border: '2px solid #000', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                                                        />
                                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 700 }}>
                                                                <span>Opacidad</span>
                                                                <span>{opacity}%</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="0" max="100"
                                                                value={opacity}
                                                                onChange={e => {
                                                                    const newCol = buildColor(hex, parseInt(e.target.value));
                                                                    setAppForm(f => ({ ...f, colores: { ...f.colores, [tc.key]: newCol } }));
                                                                }}
                                                                style={{ width: '100%', cursor: 'pointer' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Botones */}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>CANCELAR</button>
                                    <button
                                        className="btn-primary"
                                        style={{ flex: 2 }}
                                        onClick={handleSaveApp}
                                        disabled={saving}
                                    >
                                        {saving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                                        {saving ? 'GUARDANDO...' : 'GUARDAR APLICACIÓN'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '2rem', right: '2rem',
                            background: '#000', color: 'white', padding: '1rem 2rem',
                            borderRadius: '15px', fontWeight: 900,
                            border: `2px solid ${toastType === 'err' ? 'red' : 'var(--color-primary)'}`,
                            zIndex: 9999
                        }}>
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
