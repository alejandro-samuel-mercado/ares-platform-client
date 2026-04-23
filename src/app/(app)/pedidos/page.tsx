/**
 * Página: Mis Pedidos — App Vendedor Ares v2 (Cartoon-Futurista)
 */
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Package, Plus, Clock, CheckCircle2, AlertCircle, Loader2, Send, MessageSquare, X, Smartphone, Zap, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Pedido {
  id: string;
  servicio_id: string;
  notas: string;
  status: string;
  creado_en: string;
}

export default function PedidosVendorPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPro, setIsPro] = useState(true); 
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form state
  const [newPedido, setNewPedido] = useState({ notas: '' });

  useEffect(() => { fetchData(); }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchData = async () => {
    try {
      const pedidosData = await api.get('/pedidos');
      setPedidos(pedidosData);
    } catch (error: any) {
      if (error.status === 403) setIsPro(false);
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/pedidos', { 
        notas: newPedido.notas,
        servicio_id: 'MATERIAL_CUSTOM' 
      });
      await fetchData();
      setIsModalOpen(false);
      setNewPedido({ notas: '' });
      triggerToast('PEDIDO ENVIADO AL EQUIPO');
    } catch (error) {
      triggerToast('ERROR AL PROCESAR PEDIDO');
    } finally {
      setSaving(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return { color: 'var(--color-warning)', icon: <Clock size={16} /> };
      case 'EN_PROCESO': return { color: 'var(--color-primary)', icon: <Zap size={16} /> };
      case 'COMPLETADO': return { color: 'var(--color-success)', icon: <CheckCircle2 size={16} /> };
      case 'CANCELADO': return { color: 'var(--color-danger)', icon: <AlertCircle size={16} /> };
      default: return { color: 'var(--color-muted)', icon: <MessageSquare size={16} /> };
    }
  };

  if (!isPro && !loading) {
    return (
      <div style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ 
          width: '100px', height: '100px', background: 'var(--surface-raised)', 
          borderRadius: '30px', border: '3px solid #000', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem',
          boxShadow: '10px 10px 0px 0px #000'
        }}>
          <Package size={48} color="var(--color-primary)" />
        </div>
        <h2 style={{ fontSize: '2rem' }}>ACCESO <span className="text-gradient-primary">PRO EXCLUSIVO</span></h2>
        <p style={{ fontWeight: 700, marginTop: '1rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
          La gestión de pedidos de material personalizado es una ventaja de los usuarios con plan avanzado.
        </p>
        <button 
          onClick={() => window.location.href = '/plan'}
          className="btn-primary"
          style={{ marginTop: '2.5rem', padding: '1.25rem 2.5rem' }}
        >
          MEJORAR MI PLAN AHORA
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 1.5rem 8rem 1.5rem' }}>
      {/* Toast Ares v2 */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
              background: '#000', color: 'white', padding: '1.25rem 2.5rem', width: 'max-content',
              borderRadius: '24px', border: '2px solid var(--color-primary)',
              boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
              fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
            }}
          >
            <Package color="var(--color-primary)" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              MIS <span className="text-gradient-primary">PEDIDOS</span>
            </h1>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>DISEÑO Y SOPORTE ESPECIAL</p>
          </div>
          <button 
            onClick={fetchData} 
            className="btn-secondary" 
            style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Refrescar Pedidos"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
          style={{ width: '56px', height: '56px', borderRadius: '18px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={28} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
        </div>
      ) : pedidos.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}>
          <MessageSquare size={48} style={{ opacity: 0.1, margin: '0 auto 1.5rem auto' }} />
          <p style={{ fontWeight: 800, fontSize: '0.9rem', opacity: 0.4 }}>SIN ACTIVIDAD RECIENTE</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pedidos.map((p, i) => {
            const config = getStatusConfig(p.status);
            return (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card"
                style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
              >
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '14px', 
                  background: 'var(--surface-raised)', border: '2px solid #000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: config.color, flexShrink: 0
                }}>
                  {config.icon}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div className="chip" style={{ 
                      fontSize: '0.6rem', padding: '0.1rem 0.5rem', 
                      borderColor: config.color, color: config.color, background: 'rgba(0,0,0,0.05)'
                    }}>
                      {p.status}
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.4 }}>
                      {new Date(p.creado_en).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.notas}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Nuevo Pedido Rediseñado */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', inset: 0, zIndex: 0 }}
            />
            <motion.div 
              initial={{ y: 100, opacity: 0, rotate: 2 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 100, opacity: 0 }}
              className="modal-container"
              style={{ padding: '2.5rem', zIndex: 1, width: '90%', maxWidth: '450px', borderWidth: '3px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem' }}>NUEVO <span className="text-gradient-primary">PEDIDO</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="btn-ghost" style={{ padding: '0.5rem' }}>
                  <X size={28} color="#000" />
                </button>
              </div>

              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="input-label">Detalles del Requerimiento</label>
                  <textarea 
                    placeholder="Ej: Necesito un flyer de Netflix con mi logo..."
                    className="input"
                    style={{ minHeight: '140px', paddingTop: '1rem', resize: 'none' }}
                    value={newPedido.notas}
                    onChange={(e) => setNewPedido({ notas: e.target.value })}
                    required
                  />
                </div>

                <div className="card-static" style={{ background: 'var(--surface-raised)', borderWidth: '1.5px', padding: '1rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1.4 }}>
                    ESTE PEDIDO SERÁ PROCESADO POR NUESTRO EQUIPO CREATIVO EN MENOS DE 24H.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    type="submit"
                    disabled={saving || !newPedido.notas}
                    className="btn-primary"
                    style={{ flex: 1, height: '60px', fontSize: '1rem' }}
                  >
                    {saving ? <Loader2 size={24} className="animate-spin" /> : <><Send size={20} /> ENVIAR</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
