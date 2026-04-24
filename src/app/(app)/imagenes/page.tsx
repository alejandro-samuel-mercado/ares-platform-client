/**
 * Mis Servicios — Ares v3 (Centro operativo)
 *
 * Muestra servicios seleccionados del vendor con:
 * - Solicitud de credenciales (pedidos)
 * - Visualización de credenciales asignadas
 * - Historial de pedidos por servicio
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Send, Loader2, CheckCircle2, AlertCircle, X, Zap, Copy,
  ExternalLink, Package, Clock, RefreshCw, Eye, EyeOff, Upload,
  ShoppingBag, Hash
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface ServicioBase { id: string; nombre: string; logo_url: string; categoria: string; estado_actual: string; precio_admin: number; }
interface MiServicio { id: string; servicio_id: string; servicio: ServicioBase; }
interface Credencial { id: string; usuario: string; password: string; perfil: string | null; servicio: { id: string; nombre: string; logo_url: string; categoria: string }; }
interface Pedido { id: string; servicio_id: string; cantidad: number; comprobante_url: string | null; status: string; respuesta_admin: string | null; creado_en: string; servicio?: { nombre: string; logo_url: string; }; }

export default function MisServiciosPage() {
  const { vendor } = useAuth();
  const [misServicios, setMisServicios] = useState<MiServicio[]>([]);
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderComprobante, setOrderComprobante] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'credenciales' | 'pedidos'>('credenciales');

  const load = async () => {
    setLoading(true);
    try {
      const [svc, cred, ped] = await Promise.all([
        api.get('/mis_servicios'),
        api.get('/mis_credenciales'),
        api.get('/pedidos')
      ]);
      setMisServicios(svc);
      setCredenciales(cred);
      setPedidos(ped);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copiado ✅');
  };

  const togglePassword = (id: string) => {
    const next = new Set(revealedPasswords);
    if (next.has(id)) next.delete(id); else next.add(id);
    setRevealedPasswords(next);
  };

  const handleOrder = async () => {
    if (!selectedService) return;
    setSubmitting(true);
    try {
      await api.post('/pedidos', {
        servicio_id: selectedService,
        cantidad: orderQuantity,
        comprobante_url: orderComprobante || null,
        notas: orderNotes || null,
      });
      showToast('Pedido enviado ✅');
      setShowOrderModal(false);
      setOrderQuantity(1);
      setOrderNotes('');
      setOrderComprobante('');
      load();
    } catch (err) { console.error(err); showToast('Error al crear pedido'); }
    finally { setSubmitting(false); }
  };

  const getServiceCredentials = (svcId: string) => credenciales.filter(c => c.servicio.id === svcId);
  const getServicePedidos = (svcId: string) => pedidos.filter(p => p.servicio_id === svcId);
  const getServicePrice = (svc: MiServicio) => svc.servicio.precio_admin || 0;

  const statusColor: Record<string, string> = {
    PENDIENTE: '#F59E0B',
    EN_PROCESO: '#3B82F6',
    COMPLETADO: '#10B981',
    CANCELADO: '#EF4444'
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center' }}>
        <Zap className="animate-pulse" size={40} color="var(--color-primary)" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>CARGANDO SERVICIOS...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '8rem' }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 3000,
              background: 'var(--surface-raised)', padding: '1rem 2rem', borderRadius: 'var(--radius-full)',
              border: '2px solid var(--color-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)'
            }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', lineHeight: 1, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            MIS <span className="text-gradient-primary">SERVICIOS</span>
            <button onClick={load} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}><RefreshCw size={20} /></button>
          </h1>
          <p style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Pide credenciales y gestiona tus cuentas</p>
        </div>
      </div>

      {misServicios.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <Package size={50} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)' }}>SIN SERVICIOS ACTIVOS</h3>
          <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.5rem' }}>Activa servicios desde el <a href="/catalogo" style={{ color: 'var(--color-primary)' }}>Catálogo</a></p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {misServicios.map((ms) => {
            const svcCreds = getServiceCredentials(ms.servicio_id);
            const svcPedidos = getServicePedidos(ms.servicio_id);
            const pendingCount = svcPedidos.filter(p => p.status === 'PENDIENTE').length;

            return (
              <motion.div key={ms.id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: '1.5rem', background: 'var(--surface-raised)' }}>
                {/* Service Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--surface-base)', border: '2px solid #000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {ms.servicio.logo_url ? <img src={ms.servicio.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Zap size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>{ms.servicio.nombre.toUpperCase()}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, display: 'flex', gap: '0.75rem' }}>
                        <span>📦 {svcCreds.length} {svcCreds.length === 1 ? 'cuenta' : 'cuentas'}</span>
                        {pendingCount > 0 && <span style={{ color: '#F59E0B' }}>⏳ {pendingCount} pendientes</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setSelectedService(ms.servicio_id);
                      setShowOrderModal(true);
                    }}
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Send size={14} /> PEDIR
                  </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {(['credenciales', 'pedidos'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{
                        flex: 1, padding: '0.5rem', borderRadius: '10px', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer',
                        background: activeTab === tab ? 'var(--color-primary)' : 'var(--surface-base)',
                        color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                        border: '2px solid #000',
                        textTransform: 'uppercase'
                      }}>
                      {tab === 'credenciales' ? `🔑 Cuentas (${svcCreds.length})` : `📋 Pedidos (${svcPedidos.length})`}
                    </button>
                  ))}
                </div>

                {/* Content */}
                {activeTab === 'credenciales' ? (
                  svcCreds.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', opacity: 0.5 }}>
                      <Key size={30} style={{ margin: '0 auto 0.5rem' }} />
                      <p style={{ fontWeight: 800, fontSize: '0.8rem' }}>Aún no tienes cuentas asignadas</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {svcCreds.map((cred, idx) => (
                        <div key={cred.id} style={{
                          background: 'var(--surface-base)', padding: '1rem', borderRadius: '14px',
                          border: '2px solid rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 900, fontSize: '0.75rem', color: 'var(--color-primary)' }}>CUENTA #{idx + 1}{cred.perfil ? ` — ${cred.perfil}` : ''}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, wordBreak: 'break-all' }}>{cred.usuario}</div>
                            <button onClick={() => handleCopy(cred.usuario)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem' }}><Copy size={16} color="var(--color-primary)" /></button>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700 }}>
                              {revealedPasswords.has(cred.id) ? cred.password : '••••••••'}
                            </div>
                            <button onClick={() => togglePassword(cred.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem' }}>
                              {revealedPasswords.has(cred.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button onClick={() => handleCopy(cred.password)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem' }}><Copy size={16} color="var(--color-primary)" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  svcPedidos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', opacity: 0.5 }}>
                      <Clock size={30} style={{ margin: '0 auto 0.5rem' }} />
                      <p style={{ fontWeight: 800, fontSize: '0.8rem' }}>Sin pedidos para este servicio</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {svcPedidos.map(p => (
                        <div key={p.id} style={{
                          background: 'var(--surface-base)', padding: '0.8rem 1rem', borderRadius: '12px',
                          border: `2px solid ${statusColor[p.status] || '#666'}55`,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Hash size={14} /> {p.cantidad}x cuentas
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>{new Date(p.creado_en).toLocaleDateString()}</div>
                          </div>
                          <div style={{
                            padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900,
                            background: `${statusColor[p.status]}22`, color: statusColor[p.status], border: `1.5px solid ${statusColor[p.status]}55`
                          }}>
                            {p.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Order Modal */}
      <AnimatePresence>
        {showOrderModal && (
          <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
            <motion.div className="modal-container"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: 'var(--surface-raised)', border: '4px solid #000', borderRadius: '28px',
                padding: '2rem', maxWidth: '420px', width: '100%'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)' }}>NUEVO PEDIDO</h2>
                <button onClick={() => setShowOrderModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              {/* Service Name */}
              {selectedService && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', marginBottom: '1rem', fontWeight: 900, fontSize: '0.9rem' }}>
                  {misServicios.find(ms => ms.servicio_id === selectedService)?.servicio.nombre.toUpperCase()}
                </div>
              )}

              {/* Quantity */}
              <label style={{ fontWeight: 900, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>CANTIDAD DE CUENTAS</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} className="btn-secondary" style={{ width: '45px', height: '45px', padding: 0, borderRadius: '14px' }}>-</button>
                <span style={{ fontWeight: 900, fontSize: '2rem', minWidth: '40px', textAlign: 'center' }}>{orderQuantity}</span>
                <button onClick={() => setOrderQuantity(orderQuantity + 1)} className="btn-secondary" style={{ width: '45px', height: '45px', padding: 0, borderRadius: '14px' }}>+</button>
              </div>

              {/* Price Preview */}
              {selectedService && (
                <div style={{ background: 'rgba(var(--color-primary-rgb, 0,0,0),0.1)', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', fontWeight: 900, border: '2px solid var(--color-primary)' }}>
                  <span style={{ fontSize: '0.8rem' }}>MONTO TOTAL</span>
                  <span style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>Bs {(orderQuantity * (misServicios.find(ms => ms.servicio_id === selectedService)?.servicio.precio_admin || 0)).toFixed(2)}</span>
                </div>
              )}

              {/* Comprobante URL */}
              <label style={{ fontWeight: 900, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>COMPROBANTE DE PAGO (URL imagen)</label>
              <input
                className="input"
                type="text"
                placeholder="https://... o pega enlace de imagen"
                value={orderComprobante}
                onChange={e => setOrderComprobante(e.target.value)}
                style={{ fontSize: '0.85rem', marginBottom: '1rem' }}
              />

              {/* Notes */}
              <label style={{ fontWeight: 900, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>NOTAS (opcional)</label>
              <textarea
                className="input"
                placeholder="Instrucciones especiales..."
                value={orderNotes}
                onChange={e => setOrderNotes(e.target.value)}
                style={{ fontSize: '0.85rem', minHeight: '80px', resize: 'vertical', marginBottom: '1.5rem' }}
              />

              <button className="btn-primary" onClick={handleOrder} disabled={submitting}
                style={{ width: '100%', height: '55px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> ENVIAR PEDIDO</>}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
