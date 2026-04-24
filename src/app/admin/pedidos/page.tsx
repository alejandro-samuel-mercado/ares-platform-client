/**
 * Página: Gestión de Pedidos — Ares v2.3 (Nuclear Polish & Theme Sync)
 * 
 * Saneamiento cromático total y mejora de contraste para el Centro de Mando.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Check, X, Clock, MessageCircle, 
  ChevronRight, AlertCircle, ShoppingBag, Zap, UserCheck, RefreshCw
} from 'lucide-react';
import api from '@/lib/api';

interface Pedido {
  id: string;
  vendor_id: string;
  servicio_id: string;
  notas: string;
  status: string;
  respuesta_admin: string | null;
  respondido_en: string | null;
  creado_en: string;
  vendor: {
    nombre: string;
    alias: string;
    logo_url: string | null;
  };
  servicio?: {
    nombre: string;
    logo_url: string;
    categoria: string;
  } | null;
}

export default function PedidosAdminPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updating, setUpdating] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [responseModal, setResponseModal] = useState<{ open: boolean; pedidoId: string | null }>({ open: false, pedidoId: null });
  const [respuestaText, setRespuestaText] = useState('');

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/pedidos');
      setPedidos(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPedidos(); }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleStatusUpdate = async (id: string, newStatus: string, respuesta?: string) => {
    setUpdating(id);
    try {
      const body: any = { status: newStatus };
      if (respuesta) body.respuesta_admin = respuesta;
      await api.request(`/admin/pedidos/${id}`, {
        method: 'PATCH',
        body
      });
      triggerToast(`ESTADO ACTUALIZADO: ${newStatus}`);
      await fetchPedidos();
    } catch (error) {
      triggerToast('ERROR DE SINCRONIZACIÓN');
    } finally {
      setUpdating(null);
    }
  };

  const handleCompleteWithResponse = async () => {
    if (!responseModal.pedidoId) return;
    await handleStatusUpdate(responseModal.pedidoId, 'COMPLETADO', respuestaText);
    setResponseModal({ open: false, pedidoId: null });
    setRespuestaText('');
  };

  const filteredPedidos = pedidos.filter(p => 
    filter === 'ALL' || p.status === filter
  );

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      'PENDIENTE': 'chip-gold',
      'EN_PROCESO': 'chip-blue',
      'COMPLETADO': 'chip-active',
      'CANCELADO': 'chip-danger'
    };
    return <span className={`chip ${config[status] || ''}`} style={{ fontWeight: 900, fontSize: '0.7rem' }}>{status}</span>;
  };

  return (
    <>
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Toast Dinámico Ares v2.3 */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', bottom: '40px', right: '40px', zIndex: 10000,
              background: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '1.25rem 2.5rem',
              borderRadius: '24px', border: '3px solid var(--color-primary)',
              boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
              fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
            }}
          >
            <Zap size={20} color="var(--color-primary)" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', gap: '1.5rem', lineHeight: 1 }}>
            <div style={{ background: 'var(--surface-raised)', padding: '1rem', borderRadius: '18px', color: 'var(--color-primary)', border: '3px solid #000' }}>
              <Package size={36} />
            </div>
            FLUJO DE <span className="text-gradient-primary">SOLICITUDES</span>
            <button 
                onClick={fetchPedidos} 
                className="btn-secondary" 
                style={{ padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '1rem' }}
                title="Refrescar Peticiones"
            >
                <RefreshCw size={24} />
            </button>
          </h1>
          <p style={{ fontWeight: 800, marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Bandeja maestra de atención y soporte proactivo para vendedores.
          </p>
        </div>
        <div className="card-static" style={{ padding: '1.25rem 2.5rem', display: 'flex', alignItems: 'center', gap: '2rem', background: 'var(--surface-raised)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.5, letterSpacing: '0.2rem' }}>ESTADO CRÍTICO</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1, color: 'var(--color-danger)' }}>{pedidos.filter(p => p.status === 'PENDIENTE').length}</div>
          </div>
          <AlertCircle size={32} color="var(--color-danger)" />
        </div>
      </div>

      {/* Toolbar Premium */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        {['ALL', 'PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'].map(s => (
          <button 
            key={s}
            onClick={() => setFilter(s)}
            className={filter === s ? 'btn-primary' : 'btn-secondary'}
            style={{ 
                padding: '0.8rem 2rem', 
                fontSize: '0.85rem', 
                fontWeight: 900,
                boxShadow: filter === s ? '5px 5px 0px 0px #000' : 'none'
            }}
          >
            {s === 'ALL' ? 'VER TODO EL NÚCLEO' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Grid de Pedidos Nuclear */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '12rem' }}>
            <Zap className="animate-pulse" size={48} color="var(--color-primary)" style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '0.1em' }}>ESCUCHANDO SATÉLITES...</div>
          </div>
        ) : filteredPedidos.length === 0 ? (
          <div className="card-static" style={{ padding: '6rem', textAlign: 'center', borderStyle: 'dashed', opacity: 0.4, background: 'transparent' }}>
            <Package size={80} style={{ margin: '0 auto 2rem', opacity: 0.2 }} />
            <h3 style={{ fontWeight: 900, fontSize: '1.5rem' }}>SIN SOLICITUDES EN COLA</h3>
            <p style={{ fontWeight: 700 }}>El centro de atención está al día.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredPedidos.map((p, i) => (
              <motion.div 
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="card"
                style={{ 
                  padding: '2rem 3rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '3rem',
                  background: p.status === 'PENDIENTE' ? 'rgba(var(--color-primary-rgb), 0.05)' : 'var(--surface-raised)',
                  borderColor: p.status === 'PENDIENTE' ? 'var(--color-primary)' : '#000',
                  boxShadow: p.status === 'PENDIENTE' ? '12px 12px 0px 0px var(--color-primary)' : '8px 8px 0px 0px #000'
                }}
              >
                {/* Status Column */}
                <div style={{ width: '130px', flexShrink: 0 }}>
                  {getStatusBadge(p.status)}
                </div>

                {/* Vendor Identity */}
                <div style={{ width: '280px', display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                  <div style={{ 
                    width: '56px', height: '56px', borderRadius: '18px', 
                    background: 'var(--surface-base)', border: '2.5px solid #000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, color: 'var(--color-primary)', fontSize: '1.4rem',
                    boxShadow: '4px 4px 0px 0px #000'
                  }}>
                    {p.vendor.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.2rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-primary)' }}>{p.vendor.nombre.toUpperCase()}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '0.1em' }}>@{p.vendor.alias}</div>
                  </div>
                </div>

                {/* Order Details (The "Bento" Note) */}
                <div style={{ 
                  flex: 1, background: 'var(--surface-base)', padding: '1.75rem 2.5rem', 
                  borderRadius: '24px', border: '3.5px solid #000',
                  position: 'relative',
                  boxShadow: 'inset 5px 5px 0px 0px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ 
                    position: 'absolute', top: '-14px', left: '25px', 
                    background: 'var(--color-primary)', color: 'white', 
                    fontSize: '0.7rem', padding: '4px 12px', borderRadius: '6px', fontWeight: 900,
                    border: '2px solid #000', display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    {p.servicio?.logo_url && <img src={p.servicio.logo_url} style={{ width: '14px', height: '14px', objectFit: 'contain' }} />}
                    {p.servicio?.nombre ? p.servicio.nombre.toUpperCase() : 'REQUERIMIENTO MAESTRO'}
                  </div>
                  <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    <MessageCircle size={16} style={{ display: 'inline', marginRight: '0.75rem', color: 'var(--color-primary)' }} />
                    <span style={{ fontStyle: 'italic', opacity: 0.9 }}>"{p.notas}"</span>
                  </p>
                  {p.respuesta_admin && (
                    <div style={{ 
                      marginTop: '1rem', padding: '1rem 1.5rem', borderRadius: '16px',
                      background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)'
                    }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-success)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>📋 RESPUESTA ADMIN</div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{p.respuesta_admin}</p>
                      {p.respondido_en && (
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.4, marginTop: '0.5rem' }}>
                          Respondido: {new Date(p.respondido_en).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={12} /> ENTRADA: {new Date(p.creado_en).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900 }}>REF: {p.id.slice(-8).toUpperCase()}</div>
                  </div>
                </div>

                {/* Actions Grid */}
                <div style={{ width: '240px', display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexShrink: 0 }}>
                  {updating === p.id ? (
                    <div style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--color-primary)' }} className="animate-pulse">
                      ACTUALIZANDO NÚCLEO...
                    </div>
                  ) : (
                    <>
                      {p.status === 'PENDIENTE' && (
                        <button 
                          onClick={() => handleStatusUpdate(p.id, 'EN_PROCESO')}
                          className="btn-primary"
                          style={{ padding: '0.75rem', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Iniciar Trabajo"
                        >
                          <Zap size={22} />
                        </button>
                      )}
                      {p.status === 'EN_PROCESO' && (
                        <button 
                          onClick={() => {
                            setResponseModal({ open: true, pedidoId: p.id });
                            setRespuestaText('');
                          }}
                          className="btn-primary"
                          style={{ padding: '0.75rem', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#22C55E' }}
                          title="Completar con Respuesta"
                        >
                          <Check size={22} />
                        </button>
                      )}
                      {(p.status === 'PENDIENTE' || p.status === 'EN_PROCESO') && (
                        <button 
                          onClick={() => handleStatusUpdate(p.id, 'CANCELADO')}
                          className="btn-secondary"
                          style={{ padding: '0.75rem', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'var(--color-danger)', color: 'var(--color-danger)', boxShadow: 'none' }}
                          title="Cancelar"
                        >
                          <X size={22} />
                        </button>
                      )}
                      {(p.status === 'COMPLETADO' || p.status === 'CANCELADO') && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                          PROCESO CERRADO <UserCheck size={16} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>

    {/* Modal de Respuesta al Completar Pedido */}
    <AnimatePresence>
      {responseModal.open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 20000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)'
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="card-static"
            style={{
              width: '90%', maxWidth: '550px', padding: '3rem',
              background: 'var(--surface-raised)', borderWidth: '3px',
              boxShadow: '16px 16px 0px 0px #000'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem' }}>ENVIAR <span className="text-gradient-primary">RESPUESTA</span></h2>
              <button
                onClick={() => setResponseModal({ open: false, pedidoId: null })}
                className="btn-ghost"
                style={{ padding: '0.5rem' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">Credenciales / Instrucciones para el vendedor</label>
              <textarea
                className="input"
                placeholder="Ej: Usuario: netflix_user@mail.com&#10;Contraseña: abc123&#10;Perfil: #3"
                value={respuestaText}
                onChange={(e) => setRespuestaText(e.target.value)}
                style={{ minHeight: '140px', resize: 'none', paddingTop: '1rem' }}
              />
            </div>

            <div className="card-static" style={{ background: 'var(--surface-base)', borderWidth: '1.5px', padding: '1rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1.4 }}>
                Esta respuesta será visible para el vendedor en su app. Incluí credenciales o instrucciones claras.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setResponseModal({ open: false, pedidoId: null })}
                className="btn-secondary"
                style={{ flex: 1, padding: '1rem' }}
              >
                CANCELAR
              </button>
              <button
                onClick={handleCompleteWithResponse}
                className="btn-primary"
                style={{ flex: 2, padding: '1rem', background: '#22C55E' }}
                disabled={updating !== null}
              >
                {updating ? 'PROCESANDO...' : '✅ COMPLETAR Y ENVIAR'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
