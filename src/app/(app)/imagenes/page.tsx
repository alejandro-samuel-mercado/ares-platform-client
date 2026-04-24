/**
 * Centro de Servicios — App Vendedor Ares v2.5 (Operativa Centralizada)
 * 
 * Antes conocido como "Banco de Imágenes", ahora integra:
 * - Descarga de Flyers (Material Visual)
 * - Visualización de Credenciales (Respuestas del Admin)
 * - Solicitud de Pedidos (Pedidos Automáticos)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Download, Key, Send, RefreshCw, Loader2, 
  CheckCircle2, AlertCircle, X, Zap, Image as ImageIcon,
  ExternalLink, MessageSquare, Copy
} from 'lucide-react';
import api from '@/lib/api';

interface ServicioBase { 
  id: string; 
  nombre: string; 
  logo_url: string; 
  categoria: string; 
  estado_actual: string; 
  descripcion_base: string;
}

interface MiServicio { 
  id: string; 
  servicio_id: string; 
  servicio: ServicioBase; 
}

interface Imagen { 
  id: string; 
  titulo: string; 
  url_base: string; 
  servicio_id: string; 
}

interface Pedido {
  id: string;
  servicio_id: string;
  status: string;
  respuesta_admin: string | null;
  respondido_en: string | null;
  creado_en: string;
}

export default function MisServiciosHub() {
  const [misServicios, setMisServicios] = useState<MiServicio[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [activeGallery, setActiveGallery] = useState<{ name: string, images: Imagen[] } | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [savingOrder, setSavingOrder] = useState(false);

  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [svcData, pedidosData, imgData] = await Promise.all([
        api.get('/mis_servicios'),
        api.get('/pedidos'),
        api.get('/imagenes')
      ]);
      setMisServicios(svcData);
      setPedidos(pedidosData);
      setImagenes(imgData);
    } catch (error) {
      console.error('Error fetching hub data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg: msg.toUpperCase(), type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast('COPIADO AL PORTAPAPELES');
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceForOrder) return;
    setSavingOrder(true);
    try {
      await api.post('/pedidos', { 
        servicio_id: selectedServiceForOrder,
        notas: orderNotes 
      });
      triggerToast('PEDIDO ENVIADO');
      setIsOrderModalOpen(false);
      setOrderNotes('');
      fetchData();
    } catch (error) {
      triggerToast('ERROR AL CREAR PEDIDO', 'error');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDownload = async (imgId: string, title: string) => {
    try {
      const token = localStorage.getItem('ares_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/imagen/${imgId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ares_${title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      triggerToast('IMAGEN DESCARGADA');
    } catch (error) {
      triggerToast('ERROR EN DESCARGA', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 1.5rem 8rem 1.5rem' }}>
      
      {/* Toast Ares Custom */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
              background: '#000', color: 'white', padding: '1.25rem 2.5rem', borderRadius: '24px',
              border: `2px solid ${toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-primary)'}`,
              boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
            }}
          >
            {toast.type === 'error' ? <AlertCircle color="var(--color-danger)" /> : <CheckCircle2 color="var(--color-primary)" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            MIS <span className="text-gradient-primary">SERVICIOS</span>
            <button onClick={fetchData} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </h1>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.5 }}>PANEL OPERATIVO Y MATERIAL VISUAL</p>
        </div>
      </div>

      {misServicios.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}>
          <ImageIcon size={48} style={{ opacity: 0.1, margin: '0 auto 1.5rem auto' }} />
          <p style={{ fontWeight: 800, fontSize: '1rem', opacity: 0.4, marginBottom: '2rem' }}>NO TIENES SERVICIOS ACTIVOS EN TU CATÁLOGO</p>
          <a href="/catalogo" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} /> IR AL CATÁLOGO
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {misServicios.map((ms, i) => {
            const svc = ms.servicio;
            // Buscar último pedido completado para este servicio
            const lastActivePedido = pedidos
              .filter(p => p.servicio_id === ms.servicio_id && p.status === 'COMPLETADO' && p.respuesta_admin)
              .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime())[0];
            
            // Buscar flyers
            const svcFlyers = imagenes.filter(img => img.servicio_id === ms.servicio_id);
            
            return (
              <motion.div 
                key={ms.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                {/* Header de Tarjeta */}
                <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '50px', height: '50px', borderRadius: '12px', background: '#fff', border: '2px solid #000', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                  }}>
                    {svc.logo_url ? <img src={svc.logo_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon size={24} style={{ opacity: 0.1 }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 900, fontSize: '1rem', lineHeight: 1.2 }}>{svc.nombre.toUpperCase()}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: svc.estado_actual === 'VERDE' ? '#10B981' : svc.estado_actual === 'AMARILLO' ? '#F59E0B' : '#EF4444' 
                      }} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>{svc.categoria}</span>
                    </div>
                  </div>
                </div>

                {/* Contenido Operativo */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Sección Credenciales */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Key size={14} color="var(--color-primary)" />
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>CREDENCIALES ACTIVAS</span>
                    </div>
                    {lastActivePedido ? (
                      <div style={{ 
                        background: 'rgba(34,197,94,0.05)', border: '2px dashed rgba(34,197,94,0.3)', 
                        padding: '1rem', borderRadius: '14px', position: 'relative'
                      }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', paddingRight: '2rem' }}>
                          {lastActivePedido.respuesta_admin}
                        </p>
                        <button 
                          onClick={() => copyToClipboard(lastActivePedido.respuesta_admin || '')}
                          style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.4 }}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ background: 'var(--surface-base)', padding: '1rem', borderRadius: '14px', textAlign: 'center', border: '1.5px solid rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.3 }}>SIN CREDENCIALES ASIGNADAS</p>
                      </div>
                    )}
                  </div>

                  {/* Acciones Rápidas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button 
                      onClick={() => setActiveGallery({ name: svc.nombre, images: svcFlyers })}
                      className="btn-secondary" 
                      style={{ fontSize: '0.75rem', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <ImageIcon size={16} /> FLYERS ({svcFlyers.length})
                    </button>
                    <button 
                      onClick={() => { setSelectedServiceForOrder(svc.id); setIsOrderModalOpen(true); }}
                      className="btn-primary" 
                      style={{ fontSize: '0.75rem', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: 'none' }}
                    >
                      <Send size={16} /> PEDIDO
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Galería de Flyers */}
      <AnimatePresence>
        {activeGallery && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="modal-container" style={{ maxWidth: '600px', width: '90%', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 900 }}>FLYERS: {activeGallery.name.toUpperCase()}</h3>
                <button onClick={() => setActiveGallery(null)} style={{ background: 'none', border: 'none' }}><X size={24} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {activeGallery.images.length === 0 ? (
                   <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: '2rem', opacity: 0.4, fontWeight: 700 }}>SIN MATERIAL PARA ESTE SERVICIO</p>
                ) : activeGallery.images.map(img => (
                  <div key={img.id} className="card" style={{ padding: '0.5rem', position: 'relative' }}>
                    <img src={img.url_base} style={{ width: '100%', borderRadius: '8px', marginBottom: '0.5rem' }} />
                    <button 
                      onClick={() => handleDownload(img.id, img.titulo)}
                      className="btn-primary" 
                      style={{ width: '100%', fontSize: '0.7rem', height: '36px', boxShadow: 'none' }}
                    >
                      <Download size={14} /> DESCARGAR
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nuevo Pedido */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-container" style={{ maxWidth: '450px', width: '90%', padding: '2.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>NUEVO <span className="text-gradient-primary">PEDIDO</span></h2>
              <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="input-label">Servicio Seleccionado</label>
                  <select 
                    className="input" value={selectedServiceForOrder} 
                    onChange={e => setSelectedServiceForOrder(e.target.value)}
                    style={{ fontWeight: 900 }}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="MATERIAL_CUSTOM">Material Personalizado / Otros</option>
                    {misServicios.map(ms => (
                      <option key={ms.servicio_id} value={ms.servicio_id}>{ms.servicio.nombre.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Detalles del Requerimiento</label>
                  <textarea 
                    className="input" rows={4} placeholder="Ej: Necesito 2 perfiles de Netflix..."
                    value={orderNotes} onChange={e => setOrderNotes(e.target.value)} required
                  />
                </div>
                <button type="submit" disabled={savingOrder || !selectedServiceForOrder} className="btn-primary" style={{ height: '60px' }}>
                  {savingOrder ? <Loader2 className="animate-spin" /> : <><Send size={20} /> ENVIAR PEDIDO</>}
                </button>
                <button type="button" onClick={() => setIsOrderModalOpen(false)} className="btn-secondary" style={{ border: 'none' }}>CANCELAR</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
