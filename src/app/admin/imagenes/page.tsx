/**
 * Página: Gestión de Banco de Imágenes (Admin) — Ares v2.3 (Nuclear Polish)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon, Plus, Trash2, Search, Loader2,
    Upload, X, Zap,
    Pencil, RefreshCw, LayoutGrid, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import Combobox from '@/components/Combobox';

interface Categoria {
    id: string;
    nombre: string;
}

interface Imagen {
    id: string;
    titulo: string;
    url_base: string;
    public_id: string;
    etiquetas: string;
    categoria: string;
    servicio_id?: string | null;
    servicio?: {
        id: string;
        nombre: string;
        logo_url: string;
    } | null;
    activo: boolean;
    creado_en: string;
    app_config_id?: string | null;
    app_config?: { nombre: string } | null;
}

interface Servicio {
    id: string;
    nombre: string;
    logo_url: string;
}

const parseTags = (tags: string): string[] => {
    if (!tags) return [];
    try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
        // Fallback: si no es JSON, asumir que es una lista separada por comas
        return tags.split(',').map(t => t.trim()).filter(Boolean);
    }
};

export default function ImagenesAdminPage() {
    const [imagenes, setImagenes] = useState<Imagen[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState<Imagen | null>(null);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [isError, setIsError] = useState(false);

    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [apps, setApps] = useState<{id: string, nombre: string}[]>([]);
    const [newImage, setNewImage] = useState({
        titulo: '',
        etiquetas: '',
        categoria: 'FLYER',
        servicio_id: '',
        app_config_id: '',
        archivo: null as File | null,
    });

    useEffect(() => {
        fetchImagenes();
        fetchServicios();
        fetchCategorias();
        fetchApps();
    }, []);

    const fetchCategorias = async () => {
        try {
            const data = await api.get('/categorias?tipo=IMAGEN');
            setCategorias(data);
            if (data.length > 0 && !newImage.categoria) {
                setNewImage(prev => ({ ...prev, categoria: data[0].nombre }));
            }
        } catch (err) { console.error(err); }
    };

    const fetchServicios = async () => {
        try {
            const data = await api.get('/admin/servicios');
            setServicios(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const fetchApps = async () => {
        try {
            const data = await api.get('/admin/app-configs');
            setApps(data);
        } catch (error) {
            console.error('Error fetching apps:', error);
        }
    };

    const fetchImagenes = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/imagenes');
            setImagenes(data);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    const triggerToast = (msg: string, error = false) => {
        setToastMsg(msg);
        setIsError(error);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const openEditModal = (img: Imagen) => {
        setSelectedImage(img);
        setNewImage({
            titulo: img.titulo,
            etiquetas: parseTags(img.etiquetas).join(', '),
            categoria: img.categoria || 'FLYER',
            servicio_id: img.servicio_id || '',
            app_config_id: img.app_config_id || '',
            archivo: null
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setSelectedImage(null);
        setNewImage({ titulo: '', etiquetas: '', categoria: categorias[0]?.nombre || 'FLYER', servicio_id: '', app_config_id: '', archivo: null });
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('titulo', newImage.titulo);
            const tagArray = newImage.etiquetas.split(',').map(t => t.trim()).filter(Boolean);
            formData.append('etiquetas', JSON.stringify(tagArray));
            formData.append('categoria', newImage.categoria);
            formData.append('servicio_id', newImage.servicio_id);
            formData.append('app_config_id', newImage.app_config_id);
            if (newImage.archivo) {
                formData.append('imagen', newImage.archivo);
            }

            const token = localStorage.getItem('ares_token');
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/imagenes`;

            if (isEditMode && selectedImage) {
                // UPDATE
                const res = await fetch(`${apiUrl}/${selectedImage.id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });

                if (!res.ok) throw new Error('Update failed');
                triggerToast('RECURSO ACTUALIZADO 🔄');
            } else {
                // CREATE
                if (!newImage.archivo) return;
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });

                if (!res.ok) throw new Error('Upload failed');
                triggerToast('MATERIAL PUBLICADO EN EL NÚCLEO 🚀');
            }

            await fetchImagenes();
            setIsModalOpen(false);
        } catch (error) {
            triggerToast('ERROR EN LA OPERACIÓN', true);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/admin/imagenes/${confirmDelete}`);
            triggerToast('RECURSO DESACTIVADO 🗑️');
            setConfirmDelete(null);
            fetchImagenes();
        } catch (error) {
            triggerToast('ERROR AL ELIMINAR', true);
        }
    };

    const filteredImages = imagenes.filter(img => {
        if (!img.activo || String(img.activo) === '0' || String(img.activo) === 'false') return false;
        return img.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            img.etiquetas.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem' }}>

            {/* Toast v2.3 */}
            <AnimatePresence>
                {showToast && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '40px', right: '40px', zIndex: 10000,
                            background: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '1.25rem 2.5rem',
                            borderRadius: '24px', border: `3px solid ${isError ? 'var(--color-danger)' : 'var(--color-primary)'}`,
                            boxShadow: '12px 12px 0px 0px rgba(0,0,0,0.5)',
                            fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
                        }}
                    >
                        {isError ? <AlertCircle color="var(--color-danger)" /> : <Zap color="var(--color-primary)" />}
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }} className='max-sm:flex-col max-sm:items-start max-sm:gap-4'>
                <div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)', lineHeight: 1 }}>
                        <div style={{ background: 'var(--surface-raised)', padding: '0.6rem', borderRadius: '14px', color: 'var(--color-primary)', border: '2px solid #000', boxShadow: '4px 4px 0px 0px #000' }}>
                            <ImageIcon size={28} />
                        </div>
                        <div>
                            BANCO DE <span className="text-gradient-primary">RECURSOS</span>
                        </div>
                        <button
                            onClick={fetchImagenes}
                            className="btn-secondary max-md:mr-10"
                            style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Refrescar Banco"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </h1>
                    <p style={{ fontWeight: 700, marginTop: '0.8rem', color: 'var(--text-muted)', fontSize: '1rem' }} className='max-sm:hidden'>
                        CENTRO DE GESTIÓN Y DISTRIBUCIÓN DE ACTIVOS VISUALES
                    </p>
                </div>
                <button className="btn-primary" onClick={openCreateModal} style={{ padding: '0.5rem 1rem', borderRadius: '16px' }}>
                    <Plus size={20} /> SUBIR NUEVO MATERIAL
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', alignItems: 'center' }} className='max-sm:flex-col'>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, color: 'var(--text-primary)' }} />
                    <input className="input" placeholder="Buscar por metadatos (título, tag)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '3.5rem', height: '54px', fontSize: '1rem' }} />
                </div>
                <div className="card-static" style={{ padding: '0 2rem', height: '54px', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface-raised)' }}>
                    <LayoutGrid size={20} color="var(--color-primary)" />
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{filteredImages.length} RECURSOS</span>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '12rem' }}><Zap className="animate-pulse" size={64} color="var(--color-primary)" style={{ margin: '0 auto' }} /></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    <AnimatePresence mode="popLayout">
                        {filteredImages.map((img, i) => (
                            <motion.div key={img.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card"
                                style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--surface-base)' }}>
                                    <img src={img.url_base} alt={img.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => openEditModal(img)}
                                            style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '2px 2px 0px 0px #000' }}>
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => setConfirmDelete(img.id)}
                                            style={{ background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '2px 2px 0px 0px #000' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <div className="chip" style={{ fontSize: '0.6rem', fontWeight: 900, background: 'var(--color-primary)', color: 'white' }}>{img.categoria}</div>
                                            {img.app_config ? <div className="chip" style={{ fontSize: '0.6rem', fontWeight: 900, background: '#F59E0B', color: 'black' }}>{img.app_config.nombre}</div> : <div className="chip" style={{ fontSize: '0.6rem', fontWeight: 900, background: 'transparent', border: '1px solid currentColor', opacity: 0.5 }}>GLOBAL</div>}
                                        </div>
                                        {img.servicio && (
                                            <div title={img.servicio.nombre} style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #000', flexShrink: 0, boxShadow: '2px 2px 0px 0px #000' }}>
                                                <img src={img.servicio.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{img.titulo}</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                        {parseTags(img.etiquetas).map((tag: string, i: number) => (
                                            <span key={i} style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--ambient-1)', padding: '2px 8px', borderRadius: '6px' }}>
                                                #{tag.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.6 }}>{new Date(img.creado_en).toLocaleDateString()}</span>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 900, background: 'var(--text-primary)', color: 'var(--surface-base)', padding: '2px 6px', borderRadius: '4px' }}>HD</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-container" style={{ maxWidth: '600px', background: 'var(--surface-raised)', border: '4px solid #000', borderRadius: '32px', padding: '3.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                                    {isEditMode ? 'EDITAR' : 'SUBIR'} <span className="text-gradient-primary">MATERIAL</span>
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}><X size={40} color="var(--text-primary)" /></button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                <div style={{ border: '4px dashed var(--color-primary)', borderRadius: '24px', padding: isEditMode ? '2rem' : '4rem', textAlign: 'center', background: 'var(--surface-base)', position: 'relative', overflow: 'hidden' }}>
                                    <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }}
                                        onChange={(e) => { const file = e.target.files?.[0]; if (file) setNewImage({ ...newImage, archivo: file }); }} />

                                    {newImage.archivo ? (
                                        <div style={{ color: 'var(--text-primary)', fontWeight: 900 }}>
                                            <ImageIcon size={isEditMode ? 32 : 48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                            {newImage.archivo.name.toUpperCase()}
                                        </div>
                                    ) : isEditMode ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                            <img src={selectedImage?.url_base} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #000' }} />
                                            <div style={{ textAlign: 'left' }}>
                                                <p style={{ fontWeight: 900, fontSize: '0.8rem' }}>REEMPLAZAR IMAGEN</p>
                                                <p style={{ fontSize: '0.6rem', opacity: 0.5 }}>CLIC O ARRASTRE PARA CAMBIAR</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={56} color="var(--color-primary)" style={{ opacity: 0.3, margin: '0 auto 1.5rem' }} />
                                            <p style={{ fontWeight: 900, fontSize: '1.2rem' }}>ARRASTRA O SELECCIONA</p>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.5 }}>PNG, JPG O WEBP (MÁX 10MB)</p>
                                        </>
                                    )}
                                </div>

                                <div>
                                    <label className="input-label" style={{ fontWeight: 900, color: 'var(--color-primary)' }}>TÍTULO DEL RECURSO</label>
                                    <input className="input" placeholder="Ej: Promo Netflix Diciembre" value={newImage.titulo} onChange={e => setNewImage({ ...newImage, titulo: e.target.value })} style={{ height: '60px' }} required />
                                </div>
                                <div>
                                    <label className="input-label" style={{ fontWeight: 900, color: 'var(--color-primary)' }}>ETIQUETAS META (COMAS)</label>
                                    <input className="input" placeholder="Ej: netflix, promo, navidad" value={newImage.etiquetas} onChange={e => setNewImage({ ...newImage, etiquetas: e.target.value })} style={{ height: '60px' }} />
                                </div>
                                <div>
                                    <Combobox
                                        label="CATEGORÍA "
                                        placeholder="Seleccionar categoría..."
                                        options={categorias.map(c => ({ id: c.nombre, nombre: c.nombre }))}
                                        value={newImage.categoria}
                                        onChange={(val: any) => setNewImage({ ...newImage, categoria: val })}
                                    />
                                </div>
                                <div>
                                    <Combobox
                                        label="SERVICIO RELACIONADO (OPCIONAL)"
                                        placeholder="Material genérico / Sin vínculo"
                                        options={[
                                            { id: '', nombre: '-- SIN VÍNCULO --' },
                                            ...servicios.map(s => ({
                                                id: s.id,
                                                nombre: s.nombre.toUpperCase(),
                                                logo_url: s.logo_url
                                            }))
                                        ]}
                                        value={newImage.servicio_id}
                                        onChange={(val: any) => setNewImage({ ...newImage, servicio_id: val })}
                                    />
                                </div>
                                <div>
                                    <Combobox
                                        label="APLICACIÓN "
                                        placeholder="SIN APLICACIÓN"
                                        options={[
                                            { id: '', nombre: 'SIN APLICACIÓN' },
                                            ...apps.map(a => ({
                                                id: a.id,
                                                nombre: a.nombre.toUpperCase()
                                            }))
                                        ]}
                                        value={newImage.app_config_id}
                                        onChange={(val: any) => setNewImage({ ...newImage, app_config_id: val })}
                                    />
                                </div>
                                <button type="submit" disabled={uploading || (!isEditMode && !newImage.archivo)} className="btn-primary" style={{ width: '100%', padding: '1.75rem', fontSize: '1.2rem', boxShadow: '10px 10px 0px 0px #000' }}>
                                    {uploading ? <Loader2 className="animate-spin" /> : isEditMode ? 'GUARDAR CAMBIOS' : 'PUBLICAR EN EL BANCO'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmDelete && (
                    <div className="modal-overlay">
                        <div className="modal-container" style={{ maxWidth: '450px', textAlign: 'center', padding: '4rem', border: '5px solid var(--color-danger)', background: 'var(--surface-raised)', borderRadius: '32px', boxShadow: '15px 15px 0px 0px #000' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--color-danger)' }}>
                                <Trash2 size={50} color="var(--color-danger)" />
                            </div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>¿ELIMINAR RECURSO?</h3>
                            <p style={{ fontWeight: 700, opacity: 0.7, marginBottom: '3rem' }}>Esta acción desactivará el material para todos los vendedores comerciales.</p>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <button className="btn-secondary" style={{ flex: 1, border: 'none', fontWeight: 900 }} onClick={() => setConfirmDelete(null)}>ABORTAR</button>
                                <button className="btn-primary" style={{ flex: 1, background: 'var(--color-danger)', boxShadow: '8px 8px 0px 0px #000' }} onClick={handleDelete}>CONFIRMAR</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
